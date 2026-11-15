from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal
from app.models.domain import LocationSnapshot, Notification, QueueEntry
from app.core.config import settings

from test_api import create_basic, add_real_samples


def _queue_with_samples(client, headers):
    tutor, animal, vet = create_basic(client, headers)
    add_real_samples(client, headers)
    q = client.post('/api/walk-ins', json={
        'animal_id': animal['id'],
        'appointment_type': 'CONSULTATION',
    }, headers=headers).json()
    return tutor, animal, q


def test_public_location_consent_explains_purpose_and_minimization(client, reception_headers):
    _, _, q = _queue_with_samples(client, reception_headers)
    policy = client.get(f"/api/public/status/{q['public_token']}/location-consent")
    assert policy.status_code == 200
    body = policy.json()
    assert body['coordinates_persisted'] is False
    assert body['continuous_tracking'] is False
    assert body['denial_supported'] is True
    assert 'retornar à clínica' in body['purpose']
    assert body['retention_minutes'] == 60


def test_tutor_can_submit_travel_time_without_coordinates(client, reception_headers):
    _, _, q = _queue_with_samples(client, reception_headers)
    r = client.post(f"/api/public/status/{q['public_token']}/location", json={
        'moment': 'CHECK_IN',
        'consent_given': True,
        'travel_minutes': 35,
    })
    assert r.status_code == 200, r.text
    body = r.json()
    assert body['stored_coordinates'] is False
    assert body['travel_minutes'] == 35
    assert body['consent_given'] is True
    with SessionLocal() as db:
        snap = db.query(LocationSnapshot).filter_by(queue_entry_id=q['id']).one()
        assert snap.travel_minutes == 35
        assert snap.distance_range is None
        assert snap.expires_at is not None


def test_public_location_rejects_coordinate_payload(client, reception_headers):
    _, _, q = _queue_with_samples(client, reception_headers)
    r = client.post(f"/api/public/status/{q['public_token']}/location", json={
        'moment': 'CHECK_IN',
        'consent_given': True,
        'travel_minutes': 35,
        'latitude': -22.0,
        'longitude': -47.0,
    })
    assert r.status_code == 422


def test_location_denial_uses_fixed_notice_and_stores_no_travel_time(client, reception_headers):
    _, _, q = _queue_with_samples(client, reception_headers)
    r = client.post(f"/api/public/status/{q['public_token']}/location", json={
        'moment': 'CHECK_IN',
        'consent_given': False,
    })
    assert r.status_code == 200, r.text
    with SessionLocal() as db:
        snap = db.query(LocationSnapshot).filter_by(queue_entry_id=q['id']).one()
        assert snap.consent_given is False
        assert snap.travel_minutes is None
    d = client.get(f"/api/queue/{q['id']}/return-decision?safety_margin_minutes=5", headers=reception_headers).json()
    assert d['mode'] == 'FIXED_NOTICE'
    assert d['return_feasibility'] == 'UNKNOWN'


def test_return_decision_indicates_infeasible_arrival(client, reception_headers):
    _, _, q = _queue_with_samples(client, reception_headers)
    client.post(f"/api/public/status/{q['public_token']}/location", json={
        'moment': 'CHECK_IN',
        'consent_given': True,
        'travel_minutes': 1440,
    })
    d = client.get(f"/api/queue/{q['id']}/return-decision?safety_margin_minutes=5", headers=reception_headers).json()
    assert d['mode'] == 'TRAVEL_TIME'
    assert d['return_viable'] is False
    assert d['return_feasibility'] == 'INFEASIBLE'
    assert d['should_notify_now'] is True


def test_expired_location_snapshot_is_purged_and_fallback_used(client, reception_headers):
    _, _, q = _queue_with_samples(client, reception_headers)
    client.post(f"/api/public/status/{q['public_token']}/location", json={
        'moment': 'CHECK_IN',
        'consent_given': True,
        'travel_minutes': 35,
    })
    with SessionLocal() as db:
        snap = db.query(LocationSnapshot).filter_by(queue_entry_id=q['id']).one()
        snap.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
        db.commit()
    d = client.get(f"/api/queue/{q['id']}/return-decision?safety_margin_minutes=5", headers=reception_headers).json()
    assert d['mode'] == 'FIXED_NOTICE'
    with SessionLocal() as db:
        assert db.query(LocationSnapshot).filter_by(queue_entry_id=q['id']).count() == 0


def test_evaluate_notification_creates_one_simulated_event_and_prevents_duplicate(client, reception_headers):
    _, _, q = _queue_with_samples(client, reception_headers)
    client.post(f"/api/public/status/{q['public_token']}/location", json={
        'moment': 'CHECK_IN',
        'consent_given': True,
        'travel_minutes': 1440,
    })
    url = f"/api/queue/{q['id']}/notifications/evaluate?safety_margin_minutes=5"
    first = client.post(url, json={}, headers=reception_headers)
    assert first.status_code == 200, first.text
    assert first.json()['created'] is True
    assert first.json()['notification']['channel'] == 'SIMULATOR'
    assert first.json()['notification']['status'] == 'SIMULATED'
    second = client.post(url, json={}, headers=reception_headers)
    assert second.status_code == 200, second.text
    assert second.json()['created'] is False
    assert second.json()['reason'] == 'DUPLICATE_PREVENTED'
    with SessionLocal() as db:
        assert db.query(Notification).filter_by(queue_entry_id=q['id']).count() == 1


def test_failed_notification_creates_reception_action_and_blocks_retry_until_resolved(client, reception_headers):
    _, _, q = _queue_with_samples(client, reception_headers)
    client.post(f"/api/public/status/{q['public_token']}/location", json={
        'moment': 'CHECK_IN',
        'consent_given': True,
        'travel_minutes': 1440,
    })
    url = f"/api/queue/{q['id']}/notifications/evaluate?safety_margin_minutes=5"
    sent = client.post(url, json={}, headers=reception_headers).json()['notification']
    failed = client.post(f"/api/notifications/{sent['id']}/fail", headers=reception_headers)
    assert failed.status_code == 200
    assert failed.json()['status'] == 'FAILED'
    assert failed.json()['reception_action_required'] is True
    actions = client.get('/api/notifications/reception-actions', headers=reception_headers)
    assert actions.status_code == 200
    assert len(actions.json()) == 1
    blocked = client.post(url, json={}, headers=reception_headers)
    assert blocked.status_code == 200
    assert blocked.json()['created'] is False
    assert blocked.json()['reason'] == 'RECEPTION_ACTION_REQUIRED'
    resolved = client.post(
        f"/api/notifications/{sent['id']}/resolve-reception-action",
        json={'note': 'Recepção ligou para o tutor manualmente.'},
        headers=reception_headers,
    )
    assert resolved.status_code == 200
    assert resolved.json()['reception_action_resolved_at'] is not None
    retry = client.post(url, json={}, headers=reception_headers)
    assert retry.status_code == 200
    assert retry.json()['created'] is True


def test_tutor_can_confirm_return_using_public_token(client, reception_headers):
    _, _, q = _queue_with_samples(client, reception_headers)
    created = client.post(f"/api/queue/{q['id']}/notifications", json={}, headers=reception_headers)
    assert created.status_code == 200
    notification_id = created.json()['id']
    confirmed = client.post(f"/api/public/status/{q['public_token']}/confirm-return")
    assert confirmed.status_code == 200, confirmed.text
    assert confirmed.json()['notification_id'] == notification_id
    assert confirmed.json()['notification_status'] == 'CONFIRMED'
    status = client.get(f"/api/public/status/{q['public_token']}").json()
    assert status['status'] == 'RETURNING'
    assert status['notification']['status'] == 'CONFIRMED'


def test_notification_channel_cannot_be_falsely_set_to_real_provider(client, reception_headers):
    _, _, q = _queue_with_samples(client, reception_headers)
    r = client.post(f"/api/queue/{q['id']}/notifications", json={
        'channel': 'WHATSAPP',
        'message': 'Retorne à clínica',
    }, headers=reception_headers)
    assert r.status_code == 422



def test_larger_travel_time_causes_earlier_notification(client, reception_headers):
    tutor, animal, _ = create_basic(client, reception_headers)
    add_real_samples(client, reception_headers)
    q1 = client.post('/api/walk-ins', json={
        'animal_id': animal['id'],
        'appointment_type': 'CONSULTATION',
    }, headers=reception_headers).json()
    animal2 = client.post('/api/animals', json={
        'tutor_id': tutor['id'],
        'code': 'A-002',
        'species': 'CAT',
        'name': 'Cat',
    }, headers=reception_headers).json()
    q2 = client.post('/api/walk-ins', json={
        'animal_id': animal2['id'],
        'appointment_type': 'CONSULTATION',
    }, headers=reception_headers).json()

    short_trip = client.post(f"/api/public/status/{q2['public_token']}/location", json={
        'moment': 'CHECK_IN', 'consent_given': True, 'travel_minutes': 10,
    })
    assert short_trip.status_code == 200
    short_decision = client.get(
        f"/api/queue/{q2['id']}/return-decision?safety_margin_minutes=5",
        headers=reception_headers,
    ).json()
    assert short_decision['estimated_wait_minutes'] > 15
    assert short_decision['should_notify_now'] is False

    long_trip = client.post(f"/api/public/status/{q2['public_token']}/location", json={
        'moment': 'NOTIFICATION', 'consent_given': True, 'travel_minutes': 40,
    })
    assert long_trip.status_code == 200
    long_decision = client.get(
        f"/api/queue/{q2['id']}/return-decision?safety_margin_minutes=5",
        headers=reception_headers,
    ).json()
    assert long_decision['should_notify_now'] is True
    assert long_decision['travel_minutes'] == 40


def test_latest_denial_overrides_previous_consented_snapshot(client, reception_headers):
    _, _, q = _queue_with_samples(client, reception_headers)
    accepted = client.post(f"/api/public/status/{q['public_token']}/location", json={
        'moment': 'CHECK_IN', 'consent_given': True, 'travel_minutes': 30,
    })
    denied = client.post(f"/api/public/status/{q['public_token']}/location", json={
        'moment': 'NOTIFICATION', 'consent_given': False,
    })
    assert accepted.status_code == denied.status_code == 200
    decision = client.get(
        f"/api/queue/{q['id']}/return-decision?safety_margin_minutes=5",
        headers=reception_headers,
    ).json()
    assert decision['mode'] == 'FIXED_NOTICE'
    assert decision['travel_minutes'] is None



def test_no_gps_fallback_stays_unconfigured_until_team_sets_it(client, reception_headers, monkeypatch):
    _, _, q = _queue_with_samples(client, reception_headers)
    monkeypatch.setattr(settings, 'default_fixed_notice_minutes', None)
    denied = client.post(f"/api/public/status/{q['public_token']}/location", json={
        'moment': 'CHECK_IN', 'consent_given': False,
    })
    assert denied.status_code == 200
    decision = client.get(
        f"/api/queue/{q['id']}/return-decision?safety_margin_minutes=5",
        headers=reception_headers,
    ).json()
    assert decision['mode'] == 'FIXED_NOTICE_NOT_CONFIGURED'
    assert decision['should_notify_now'] is False


def test_location_capture_requires_server_retention_configuration(client, reception_headers, monkeypatch):
    _, _, q = _queue_with_samples(client, reception_headers)
    monkeypatch.setattr(settings, 'location_retention_minutes', None)
    r = client.post(f"/api/public/status/{q['public_token']}/location", json={
        'moment': 'CHECK_IN', 'consent_given': True, 'travel_minutes': 15,
    })
    assert r.status_code == 503
    assert 'LOCATION_RETENTION_MINUTES' in r.json()['detail']
