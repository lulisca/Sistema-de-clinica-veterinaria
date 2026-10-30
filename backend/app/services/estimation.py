from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.domain import QueueEntry, Resource, ServiceDurationSample, WaitEstimate

WAITING_STATUSES = ('WAITING', 'CALLED', 'RETURNING', 'READY')


def _percentile(values: list[float], p: float) -> float:
    """Linear interpolation percentile compatible with small academic datasets."""
    if not values:
        raise ValueError('empty values')
    xs = sorted(values)
    if len(xs) == 1:
        return xs[0]
    pos = (len(xs) - 1) * p
    lo = int(pos)
    hi = min(lo + 1, len(xs) - 1)
    frac = pos - lo
    return xs[lo] * (1 - frac) + xs[hi] * frac


def stats_for_type(db: Session, appointment_type: str):
    vals = list(db.scalars(
        select(ServiceDurationSample.duration_minutes).where(
            ServiceDurationSample.appointment_type == appointment_type,
            ServiceDurationSample.source != 'SYNTHETIC',
        )
    ).all())
    # Synthetic samples are useful for development but never calibrate F1.
    if len(vals) < settings.min_samples_for_estimate:
        return None
    return {
        'p50': _percentile(vals, .50),
        'p90': _percentile(vals, .90),
        'n': len(vals),
    }


def sample_readiness(db: Session) -> list[dict]:
    """Returns sample counts per service type and whether each meets the configured software threshold."""
    rows = db.execute(
        select(
            ServiceDurationSample.appointment_type,
            func.count(ServiceDurationSample.id),
        )
        .where(ServiceDurationSample.source != 'SYNTHETIC')
        .group_by(ServiceDurationSample.appointment_type)
        .order_by(ServiceDurationSample.appointment_type)
    ).all()
    return [
        {
            'appointment_type': appointment_type,
            'sample_size': int(count),
            'minimum_configured': settings.min_samples_for_estimate,
            'ready_for_software_estimate': int(count) >= settings.min_samples_for_estimate,
        }
        for appointment_type, count in rows
    ]


def _rank(entry: QueueEntry):
    return (-int(entry.emergency), -entry.priority_level, entry.checked_in_at, entry.id)


def _active_vet_capacity(db: Session, target: QueueEntry) -> int:
    if target.veterinarian_resource_id:
        return 1
    n = len(list(db.scalars(
        select(Resource.id).where(
            Resource.resource_type == 'VETERINARIAN',
            Resource.active.is_(True),
        )
    ).all()))
    return max(n, 1)


def _simulate_wait(durations: list[float], capacity: int, initial_loads: list[float] | None = None) -> float:
    servers = [0.0] * capacity
    if initial_loads:
        for d in sorted(initial_loads, reverse=True):
            i = min(range(capacity), key=lambda x: servers[x])
            servers[i] += max(0.0, d)
    for d in durations:
        i = min(range(capacity), key=lambda x: servers[x])
        servers[i] += d
    return min(servers)


def calculate_estimate(db: Session, target: QueueEntry):
    if target.status not in WAITING_STATUSES:
        return {
            'status': 'not_waiting',
            'message': f'Queue entry is {target.status}',
            'missing_types': [],
        }

    waiting = list(db.scalars(
        select(QueueEntry).where(QueueEntry.status.in_(WAITING_STATUSES))
    ).all())
    waiting.sort(key=_rank)

    before: list[QueueEntry] = []
    for entry in waiting:
        if entry.id == target.id:
            break
        # Explicitly assigned patients only compete directly for that veterinarian.
        if target.veterinarian_resource_id and entry.veterinarian_resource_id not in (
            None,
            target.veterinarian_resource_id,
        ):
            continue
        before.append(entry)

    in_service = list(db.scalars(
        select(QueueEntry).where(QueueEntry.status == 'IN_SERVICE')
    ).all())

    relevant_types = {
        target.appointment_type,
        *(entry.appointment_type for entry in before),
        *(entry.appointment_type for entry in in_service),
    }
    stat_map = {kind: stats_for_type(db, kind) for kind in relevant_types}
    missing = sorted(kind for kind, stats in stat_map.items() if stats is None)
    if missing:
        target_stats = stat_map.get(target.appointment_type)
        return {
            'status': 'insufficient_data',
            'message': 'Not enough non-synthetic samples for all service types involved.',
            'missing_types': missing,
            'sample_size': target_stats['n'] if target_stats else 0,
        }

    capacity = _active_vet_capacity(db, target)
    now = datetime.now(timezone.utc)
    current_p50: list[float] = []
    current_p90: list[float] = []

    for entry in in_service:
        if target.veterinarian_resource_id and entry.veterinarian_resource_id not in (
            None,
            target.veterinarian_resource_id,
        ):
            continue
        stats = stat_map[entry.appointment_type]
        elapsed = 0.0
        if entry.started_at:
            started_at = entry.started_at if entry.started_at.tzinfo else entry.started_at.replace(tzinfo=timezone.utc)
            elapsed = max(0.0, (now - started_at).total_seconds() / 60)
        current_p50.append(max(0.0, stats['p50'] - elapsed))
        current_p90.append(max(0.0, stats['p90'] - elapsed))

    p50_durations = [stat_map[entry.appointment_type]['p50'] for entry in before]
    p90_durations = [stat_map[entry.appointment_type]['p90'] for entry in before]
    p50_wait = _simulate_wait(p50_durations, capacity, current_p50)
    p90_wait = _simulate_wait(p90_durations, capacity, current_p90)

    return {
        'status': 'ok',
        'p50_minutes': round(p50_wait, 1),
        'p90_minutes': round(max(p50_wait, p90_wait), 1),
        'sample_size': stat_map[target.appointment_type]['n'],
        'method': 'historical_percentiles_queue_simulation',
        'missing_types': [],
    }


def persist_estimate(
    db: Session,
    target: QueueEntry,
    trigger_event: str = 'MANUAL',
    *,
    commit: bool = True,
):
    """Calculate and store a versioned estimate revision for one queue entry."""
    result = calculate_estimate(db, target)
    if result['status'] != 'ok':
        return result

    previous_count = db.scalar(
        select(func.count(WaitEstimate.id)).where(WaitEstimate.queue_entry_id == target.id)
    ) or 0

    estimate = WaitEstimate(
        queue_entry_id=target.id,
        p50_minutes=result['p50_minutes'],
        p90_minutes=result['p90_minutes'],
        sample_size=result['sample_size'],
        method=result['method'],
        is_initial=previous_count == 0,
        revision_number=int(previous_count) + 1,
        trigger_event=trigger_event,
    )
    db.add(estimate)
    db.flush()
    if commit:
        db.commit()
        db.refresh(estimate)

    result.update({
        'estimate_id': estimate.id,
        'is_initial': estimate.is_initial,
        'revision_number': estimate.revision_number,
        'trigger_event': estimate.trigger_event,
    })
    return result


def recalculate_waiting_estimates(db: Session, trigger_event: str) -> dict:
    """Persist a new revision for every patient whose wait can be affected by a queue event."""
    entries = list(db.scalars(
        select(QueueEntry).where(QueueEntry.status.in_(WAITING_STATUSES))
    ).all())
    entries.sort(key=_rank)

    updated: list[int] = []
    skipped: list[dict] = []
    for entry in entries:
        result = persist_estimate(db, entry, trigger_event=trigger_event, commit=False)
        if result['status'] == 'ok':
            updated.append(entry.id)
        else:
            skipped.append({
                'queue_entry_id': entry.id,
                'status': result['status'],
                'missing_types': result.get('missing_types', []),
            })
    db.commit()
    return {'updated_queue_entries': updated, 'skipped': skipped}


def finalize_estimates(db: Session, entry: QueueEntry):
    """Attach actual wait and observed error to every revision made before service began."""
    if not entry.started_at:
        return

    checkin = entry.checked_in_at
    started = entry.started_at
    if checkin.tzinfo is None:
        checkin = checkin.replace(tzinfo=timezone.utc)
    if started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)
    actual = max(0.0, (started - checkin).total_seconds() / 60)

    estimates = list(db.scalars(
        select(WaitEstimate).where(WaitEstimate.queue_entry_id == entry.id)
    ).all())
    for estimate in estimates:
        estimate.actual_wait_minutes = actual
        estimate.signed_error_minutes = actual - estimate.p50_minutes
        estimate.absolute_error_minutes = abs(estimate.signed_error_minutes)
        estimate.inside_range = estimate.p50_minutes <= actual <= estimate.p90_minutes
    db.commit()
