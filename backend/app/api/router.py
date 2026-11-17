import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, require_roles, verify_password
from app.models.domain import (
    Animal, Appointment, LocationSnapshot, Notification, QueueEntry, Resource, ResourceAllocation,
    ServiceDurationSample, Tutor, User, WaitEstimate
)
from app.schemas.domain import *
from app.services.audit import audit
from app.services.estimation import (
    WAITING_STATUSES, calculate_estimate, finalize_estimates, persist_estimate,
    recalculate_waiting_estimates, sample_readiness,
)

router = APIRouter()
STAFF = Depends(require_roles('RECEPTION','VETERINARIAN','ADMIN'))
TUTOR = Depends(require_roles('TUTOR'))

@router.get('/health')
def health():
    return {'status': 'ok'}

@router.post('/auth/bootstrap', response_model=TokenOut)
def bootstrap(payload: BootstrapIn, db: Session = Depends(get_db)):
    staff_roles = ('RECEPTION', 'VETERINARIAN', 'ADMIN')
    if db.scalar(select(func.count(User.id)).where(User.role.in_(staff_roles))) > 0:
        raise HTTPException(409, 'Bootstrap is allowed only when there are no staff users')
    user = User(name=payload.name, email=payload.email.lower(), password_hash=hash_password(payload.password), role=payload.role.upper())
    db.add(user); db.commit(); db.refresh(user)
    return TokenOut(access_token=create_access_token(user.id, user.role), role=user.role)

@router.post('/auth/login', response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not user.active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, 'Invalid credentials')
    return TokenOut(access_token=create_access_token(user.id, user.role), role=user.role)

@router.post('/auth/tutors/register', response_model=TokenOut, status_code=201)
def register_tutor(payload: TutorRegisterIn, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(409, 'Email already registered')
    user = User(
        name=payload.name.strip(), email=email,
        password_hash=hash_password(payload.password), role='TUTOR',
    )
    try:
        db.add(user)
        db.flush()
        tutor = Tutor(user_id=user.id, name=user.name, contact=payload.contact)
        db.add(tutor)
        db.flush()
        audit(db, 'Tutor', tutor.id, 'SELF_REGISTER', user.id)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, 'Email already registered')
    return TokenOut(access_token=create_access_token(user.id, user.role), role=user.role)

def _tutor_for_user(db: Session, user: User) -> Tutor:
    tutor = db.scalar(select(Tutor).where(Tutor.user_id == user.id))
    if not tutor:
        raise HTTPException(404, 'Tutor profile not found')
    return tutor

@router.get('/tutor/me', response_model=TutorOut)
def tutor_me(db: Session = Depends(get_db), user=TUTOR):
    return _tutor_for_user(db, user)

@router.get('/tutor/animals', response_model=list[AnimalOut])
def list_tutor_animals(db: Session = Depends(get_db), user=TUTOR):
    tutor = _tutor_for_user(db, user)
    return list(db.scalars(select(Animal).where(Animal.tutor_id == tutor.id).order_by(Animal.name, Animal.id)).all())

@router.post('/tutor/animals', response_model=AnimalOut, status_code=201)
def create_tutor_animal(payload: TutorAnimalCreate, db: Session = Depends(get_db), user=TUTOR):
    tutor = _tutor_for_user(db, user)
    code = f'T-{tutor.id}-{secrets.token_hex(4).upper()}'
    animal = Animal(tutor_id=tutor.id, code=code, species=payload.species.upper(), name=payload.name)
    db.add(animal)
    db.flush()
    audit(db, 'Animal', animal.id, 'SELF_CREATE', user.id)
    db.commit()
    db.refresh(animal)
    return animal

@router.post('/tutor/queue', response_model=QueueOut, status_code=201)
def create_tutor_queue_entry(payload: TutorQueueCreate, db: Session = Depends(get_db), user=TUTOR):
    tutor = _tutor_for_user(db, user)
    animal = db.get(Animal, payload.animal_id)
    if not animal or animal.tutor_id != tutor.id:
        raise HTTPException(404, 'Animal not found')
    active = db.scalar(select(QueueEntry.id).where(
        QueueEntry.animal_id == animal.id,
        QueueEntry.status.in_(['WAITING', 'CALLED', 'RETURNING', 'READY', 'IN_SERVICE']),
    ).limit(1))
    if active:
        raise HTTPException(409, 'Animal already has an active queue entry')
    q = QueueEntry(
        animal_id=animal.id,
        appointment_type=payload.appointment_type.upper(),
        species=animal.species,
        symptoms=payload.symptoms.strip(),
    )
    db.add(q)
    db.flush()
    audit(db, 'QueueEntry', q.id, 'TUTOR_SELF_ENTRY', user.id)
    db.commit()
    db.refresh(q)
    recalculate_waiting_estimates(db, 'TUTOR_SELF_ENTRY')
    return q

@router.get('/tutor/queue', response_model=list[QueueOut])
def list_tutor_queue_entries(db: Session = Depends(get_db), user=TUTOR):
    # Atendimentos ainda ativos dos animais do tutor logado. Serve para ele achar
    # o link de acompanhamento (public_token) quando volta ao site.
    tutor = _tutor_for_user(db, user)
    return list(db.scalars(
        select(QueueEntry)
        .join(Animal, Animal.id == QueueEntry.animal_id)
        .where(
            Animal.tutor_id == tutor.id,
            QueueEntry.status.in_(['WAITING', 'CALLED', 'RETURNING', 'READY', 'IN_SERVICE']),
        )
        .order_by(QueueEntry.checked_in_at.desc(), QueueEntry.id.desc())
    ).all())

@router.post('/tutors', response_model=TutorOut)
def create_tutor(payload: TutorCreate, db: Session = Depends(get_db), user=STAFF):
    obj = Tutor(**payload.model_dump()); db.add(obj); db.flush(); audit(db,'Tutor',obj.id,'CREATE',user.id); db.commit(); db.refresh(obj); return obj

@router.post('/animals', response_model=AnimalOut)
def create_animal(payload: AnimalCreate, db: Session = Depends(get_db), user=STAFF):
    if not db.get(Tutor, payload.tutor_id): raise HTTPException(404, 'Tutor not found')
    obj = Animal(**payload.model_dump()); db.add(obj); db.flush(); audit(db,'Animal',obj.id,'CREATE',user.id); db.commit(); db.refresh(obj); return obj

@router.post('/resources', response_model=ResourceOut)
def create_resource(payload: ResourceCreate, db: Session = Depends(get_db), user=STAFF):
    obj=Resource(**payload.model_dump()); db.add(obj); db.flush(); audit(db,'Resource',obj.id,'CREATE',user.id); db.commit(); db.refresh(obj)
    if obj.resource_type == 'VETERINARIAN' and obj.active:
        recalculate_waiting_estimates(db, 'VETERINARIAN_CAPACITY_CHANGED')
    return obj

@router.get('/resources', response_model=list[ResourceOut])
def list_resources(db: Session = Depends(get_db), user=STAFF):
    return list(db.scalars(select(Resource).order_by(Resource.resource_type, Resource.name)).all())

def _check_appointment_overlap(db: Session, payload, ignore_id: int | None = None):
    if not payload.veterinarian_resource_id:
        return
    existing = list(db.scalars(select(Appointment).where(
        Appointment.veterinarian_resource_id == payload.veterinarian_resource_id,
        Appointment.status.not_in(['CANCELLED','NO_SHOW','COMPLETED'])
    )).all())
    def aware(dt):
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    start = aware(payload.scheduled_at)
    end = start + timedelta(minutes=payload.expected_duration_minutes)
    for a in existing:
        if ignore_id and a.id == ignore_id: continue
        a_start = aware(a.scheduled_at)
        a_end = a_start + timedelta(minutes=a.expected_duration_minutes)
        if start < a_end and end > a_start:
            raise HTTPException(409, f'Veterinarian resource conflicts with appointment {a.id}')

@router.post('/appointments', response_model=AppointmentOut)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db), user=STAFF):
    animal=db.get(Animal,payload.animal_id)
    if not animal or animal.tutor_id != payload.tutor_id: raise HTTPException(400,'Animal/tutor mismatch')
    _check_appointment_overlap(db,payload)
    obj=Appointment(**payload.model_dump()); db.add(obj); db.flush(); audit(db,'Appointment',obj.id,'CREATE',user.id); db.commit(); db.refresh(obj); return obj

@router.get('/appointments', response_model=list[AppointmentOut])
def list_appointments(status: str | None=None, db: Session=Depends(get_db), user=STAFF):
    q=select(Appointment)
    if status: q=q.where(Appointment.status==status)
    return list(db.scalars(q.order_by(Appointment.scheduled_at)).all())

@router.patch('/appointments/{appointment_id}', response_model=AppointmentOut)
def update_appointment(appointment_id:int,payload:AppointmentUpdate,db:Session=Depends(get_db),user=STAFF):
    obj=db.get(Appointment,appointment_id)
    if not obj: raise HTTPException(404,'Appointment not found')
    merged=AppointmentCreate(tutor_id=obj.tutor_id,animal_id=obj.animal_id,
        veterinarian_resource_id=payload.veterinarian_resource_id if payload.veterinarian_resource_id is not None else obj.veterinarian_resource_id,
        scheduled_at=payload.scheduled_at or obj.scheduled_at,
        expected_duration_minutes=payload.expected_duration_minutes or obj.expected_duration_minutes,
        appointment_type=obj.appointment_type)
    _check_appointment_overlap(db,merged,ignore_id=obj.id)
    for k,v in payload.model_dump(exclude_unset=True).items(): setattr(obj,k,v)
    audit(db,'Appointment',obj.id,'UPDATE',user.id,payload.model_dump(exclude_unset=True)); db.commit(); db.refresh(obj); return obj

@router.post('/appointments/{appointment_id}/check-in', response_model=QueueOut)
def check_in(appointment_id:int,payload:CheckInIn,db:Session=Depends(get_db),user=STAFF):
    appt=db.get(Appointment,appointment_id)
    if not appt: raise HTTPException(404,'Appointment not found')
    if appt.status in {'CANCELLED','NO_SHOW','COMPLETED'}: raise HTTPException(409,f'Appointment is {appt.status}')
    if db.scalar(select(QueueEntry).where(QueueEntry.appointment_id==appointment_id)): raise HTTPException(409,'Appointment already checked in')
    animal=db.get(Animal,appt.animal_id)
    q=QueueEntry(appointment_id=appt.id,animal_id=animal.id,appointment_type=appt.appointment_type,species=animal.species,
        veterinarian_resource_id=appt.veterinarian_resource_id,**payload.model_dump())
    appt.status='CHECKED_IN'; db.add(q); db.flush(); audit(db,'QueueEntry',q.id,'CHECK_IN',user.id); db.commit(); db.refresh(q)
    recalculate_waiting_estimates(db, 'CHECK_IN')
    return q

@router.post('/walk-ins', response_model=QueueOut)
def create_walkin(payload:WalkInCreate,db:Session=Depends(get_db),user=STAFF):
    animal=db.get(Animal,payload.animal_id)
    if not animal: raise HTTPException(404,'Animal not found')
    data=payload.model_dump(); data['species']=animal.species
    q=QueueEntry(**data); db.add(q); db.flush(); audit(db,'QueueEntry',q.id,'WALK_IN',user.id); db.commit(); db.refresh(q)
    recalculate_waiting_estimates(db, 'WALK_IN')
    return q

@router.get('/queue', response_model=list[QueueOut])
def list_queue(species:str|None=None,appointment_type:str|None=None,status:str|None=None,db:Session=Depends(get_db),user=STAFF):
    q=select(QueueEntry)
    if species: q=q.where(QueueEntry.species==species)
    if appointment_type: q=q.where(QueueEntry.appointment_type==appointment_type)
    if status: q=q.where(QueueEntry.status==status)
    rows=list(db.scalars(q).all())
    rows.sort(key=lambda e:(-int(e.emergency),-e.priority_level,e.checked_in_at,e.id))
    return rows

@router.get('/queue/{entry_id}', response_model=QueueOut)
def get_queue_entry(entry_id:int,db:Session=Depends(get_db),user=STAFF):
    q=db.get(QueueEntry,entry_id)
    if not q: raise HTTPException(404,'Queue entry not found')
    return q

@router.patch('/queue/{entry_id}/priority', response_model=QueueOut)
def update_priority(entry_id:int,payload:PriorityUpdate,db:Session=Depends(get_db),user=Depends(require_roles('VETERINARIAN','ADMIN'))):
    q=db.get(QueueEntry,entry_id)
    if not q: raise HTTPException(404,'Queue entry not found')
    if payload.emergency is not None: q.emergency=payload.emergency
    if payload.priority_level is not None: q.priority_level=payload.priority_level
    audit(db,'QueueEntry',q.id,'PRIORITY_UPDATE',user.id,payload.model_dump(exclude_unset=True)); db.commit(); db.refresh(q)
    recalculate_waiting_estimates(db, 'PRIORITY_CHANGED')
    return q

# O veterinário arrasta a fila e manda a lista inteira na ordem nova.
# A regra de ordem continua a mesma (emergência, nível, check-in, ID): aqui só
# gravamos o nível a partir da ordem. O primeiro recebe o maior nível; quem entra
# depois chega com nível 0 e vai para o fim. Emergência fica fora e segue no topo.
@router.put('/queue/order', response_model=list[QueueOut])
def reorder_queue(payload: QueueOrderIn, db: Session = Depends(get_db), user=Depends(require_roles('VETERINARIAN', 'ADMIN'))):
    ordenaveis = {e.id: e for e in db.scalars(select(QueueEntry).where(
        QueueEntry.status.in_(WAITING_STATUSES), QueueEntry.emergency.is_(False))).all()}
    ids = payload.entry_ids
    # A lista precisa ter exatamente quem está esperando agora; se a fila mudou, a tela recarrega.
    if len(set(ids)) != len(ids) or set(ids) != set(ordenaveis):
        raise HTTPException(409, 'Queue changed; reload and try again')
    # Mesmos pacientes, mas outra pessoa pode ter mudado a ordem depois que a tela carregou.
    ordem_atual = [e.id for e in sorted(ordenaveis.values(), key=lambda e: (-e.priority_level, e.checked_in_at, e.id))]
    if payload.previous_ids is not None and payload.previous_ids != ordem_atual:
        raise HTTPException(409, 'Queue changed; reload and try again')
    for indice, entry_id in enumerate(ids):
        q = ordenaveis[entry_id]
        novo = len(ids) - indice
        if q.priority_level != novo:
            audit(db, 'QueueEntry', q.id, 'QUEUE_REORDER', user.id, {'from': q.priority_level, 'to': novo})
            q.priority_level = novo
    db.commit()
    recalculate_waiting_estimates(db, 'QUEUE_REORDERED')
    return [ordenaveis[i] for i in ids]

@router.post('/queue/{entry_id}/estimate', response_model=EstimateOut)
def recalc_estimate(entry_id:int,db:Session=Depends(get_db),user=STAFF):
    q=db.get(QueueEntry,entry_id)
    if not q: raise HTTPException(404,'Queue entry not found')
    result=persist_estimate(db,q,trigger_event='MANUAL')
    return EstimateOut(queue_entry_id=q.id,**result)

@router.get('/queue/{entry_id}/estimates', response_model=list[WaitEstimateOut])
def estimate_history(entry_id:int,db:Session=Depends(get_db),user=STAFF):
    q=db.get(QueueEntry,entry_id)
    if not q: raise HTTPException(404,'Queue entry not found')
    return list(db.scalars(select(WaitEstimate).where(WaitEstimate.queue_entry_id==entry_id).order_by(WaitEstimate.revision_number)).all())

@router.post('/queue/{entry_id}/call', response_model=QueueOut)
def call_entry(entry_id:int,db:Session=Depends(get_db),user=STAFF):
    q=db.get(QueueEntry,entry_id)
    if not q: raise HTTPException(404,'Queue entry not found')
    if q.status not in {'WAITING','RETURNING','READY'}: raise HTTPException(409,f'Cannot call from {q.status}')
    q.status='CALLED'; q.called_at=datetime.now(timezone.utc); audit(db,'QueueEntry',q.id,'CALL',user.id); db.commit(); db.refresh(q); return q

@router.post('/queue/{entry_id}/start', response_model=QueueOut)
def start_service(entry_id:int,db:Session=Depends(get_db),user=STAFF):
    q=db.get(QueueEntry,entry_id)
    if not q: raise HTTPException(404,'Queue entry not found')
    if q.status not in {'WAITING','CALLED','RETURNING','READY'}: raise HTTPException(409,f'Cannot start from {q.status}')
    # Shared resources are exclusive while an allocation is open.
    if q.veterinarian_resource_id:
        conflict=db.scalar(select(ResourceAllocation.id).where(
            ResourceAllocation.resource_id==q.veterinarian_resource_id,
            ResourceAllocation.queue_entry_id!=q.id,
            ResourceAllocation.ended_at.is_(None)).limit(1))
        if conflict: raise HTTPException(409,'Assigned veterinarian is already in use')
        own=db.scalar(select(ResourceAllocation).where(
            ResourceAllocation.resource_id==q.veterinarian_resource_id,
            ResourceAllocation.queue_entry_id==q.id,
            ResourceAllocation.ended_at.is_(None)).limit(1))
        if not own:
            db.add(ResourceAllocation(queue_entry_id=q.id,resource_id=q.veterinarian_resource_id))
    if q.isolation_required:
        own_isolation=db.scalar(select(ResourceAllocation.id).join(Resource,Resource.id==ResourceAllocation.resource_id).where(
            Resource.resource_type=='ISOLATION_ROOM',
            ResourceAllocation.queue_entry_id==q.id,
            ResourceAllocation.ended_at.is_(None)).limit(1))
        if not own_isolation:
            raise HTTPException(409,'Isolation-required entry must have an isolation room allocated before start')
    q.status='IN_SERVICE'; q.started_at=datetime.now(timezone.utc); audit(db,'QueueEntry',q.id,'START',user.id); db.commit(); db.refresh(q)
    finalize_estimates(db,q)
    recalculate_waiting_estimates(db, 'SERVICE_STARTED')
    return q

@router.post('/queue/{entry_id}/finish', response_model=QueueOut)
def finish_service(entry_id:int,db:Session=Depends(get_db),user=STAFF):
    q=db.get(QueueEntry,entry_id)
    if not q: raise HTTPException(404,'Queue entry not found')
    if q.status!='IN_SERVICE' or not q.started_at: raise HTTPException(409,'Entry is not in service')
    q.status='COMPLETED'; q.finished_at=datetime.now(timezone.utc)
    start=q.started_at if q.started_at.tzinfo else q.started_at.replace(tzinfo=timezone.utc)
    duration=max(.1,(q.finished_at-start).total_seconds()/60)
    db.add(ServiceDurationSample(appointment_type=q.appointment_type,duration_minutes=duration,source='SYSTEM',observed_at=q.finished_at,note=f'QueueEntry {q.id}'))
    for alloc in db.scalars(select(ResourceAllocation).where(ResourceAllocation.queue_entry_id==q.id,ResourceAllocation.ended_at.is_(None))).all(): alloc.ended_at=q.finished_at
    if q.appointment_id:
        appt=db.get(Appointment,q.appointment_id)
        if appt: appt.status='COMPLETED'
    audit(db,'QueueEntry',q.id,'FINISH',user.id,{'duration_minutes':duration}); db.commit(); db.refresh(q)
    recalculate_waiting_estimates(db, 'SERVICE_FINISHED')
    return q

@router.post('/samples/bulk')
def create_samples(payload:DurationSamplesBulkIn,db:Session=Depends(get_db),user=STAFF):
    allowed_sources={'DIRECT_OBSERVATION','RETROSPECTIVE','SYSTEM','MOCKED'}
    invalid=sorted({sample.source for sample in payload.samples if sample.source not in allowed_sources})
    if invalid: raise HTTPException(400,f'Invalid sample source(s): {invalid}')
    objs=[ServiceDurationSample(**sample.model_dump()) for sample in payload.samples]
    db.add_all(objs); db.commit()
    recalculate_waiting_estimates(db, 'SAMPLES_UPDATED')
    return {
        'created': len(objs),
        'warning': 'MOCKED samples are eligible only when ALLOW_MOCKED_ESTIMATES=true and remain identified as MOCKED.',
    }

LOCATION_CONSENT_VERSION = 'F2-LOCATION-1'
LOCATION_CONSENT_PURPOSE = (
    'Usar o tempo estimado de deslocamento para decidir quando avisar você para retornar à clínica. '
    'O sistema não armazena sua localização exata nem acompanha seu deslocamento continuamente. '
    'Você pode negar a localização e continuar usando o sistema; nesse caso, será usado o aviso por tempo fixo, '
    'se a clínica tiver configurado esse parâmetro.'
)


def _get_public_queue(db: Session, public_token: str) -> QueueEntry:
    q = db.scalar(select(QueueEntry).where(QueueEntry.public_token == public_token))
    if not q:
        raise HTTPException(404, 'Invalid status link')
    return q


def _purge_expired_location_snapshots(db: Session) -> int:
    now = datetime.now(timezone.utc)
    result = db.execute(delete(LocationSnapshot).where(
        or_(LocationSnapshot.expires_at.is_(None), LocationSnapshot.expires_at <= now)
    ))
    removed = int(result.rowcount or 0)
    if removed:
        db.commit()
    else:
        db.flush()
    return removed


def _record_location_snapshot(
    db: Session,
    q: QueueEntry,
    payload: LocationIn,
    actor_user_id: int | None = None,
) -> LocationSnapshot:
    retention = settings.location_retention_minutes
    if retention is None or retention < 1 or retention > 10080:
        raise HTTPException(503, 'Location retention is not configured. Set LOCATION_RETENTION_MINUTES after the team/clinic decision.')
    if payload.consent_given and payload.travel_minutes is None:
        raise HTTPException(400, 'travel_minutes is required when consent is granted')
    if not payload.consent_given and payload.travel_minutes is not None:
        raise HTTPException(400, 'Do not submit travel data when location consent is denied')

    _purge_expired_location_snapshots(db)
    now = datetime.now(timezone.utc)
    snap = LocationSnapshot(
        queue_entry_id=q.id,
        moment=payload.moment,
        consent_given=payload.consent_given,
        travel_minutes=payload.travel_minutes if payload.consent_given else None,
        distance_range=None,
        captured_at=now,
        expires_at=now + timedelta(minutes=retention),
    )
    db.add(snap)
    audit(db, 'QueueEntry', q.id, 'LOCATION_SNAPSHOT', actor_user_id, {
        'consent': payload.consent_given,
        'moment': payload.moment,
        'purpose_version': LOCATION_CONSENT_VERSION,
        'coordinates_stored': False,
        'retention_minutes': retention,
    })
    db.commit()
    db.refresh(snap)
    return snap


def _latest_active_location_snapshot(db: Session, queue_entry_id: int) -> LocationSnapshot | None:
    now = datetime.now(timezone.utc)
    return db.scalar(select(LocationSnapshot).where(
        LocationSnapshot.queue_entry_id == queue_entry_id,
        LocationSnapshot.expires_at.is_not(None),
        LocationSnapshot.expires_at > now,
    ).order_by(LocationSnapshot.captured_at.desc(), LocationSnapshot.id.desc()).limit(1))


def _calculate_return_decision(db: Session, q: QueueEntry, safety_margin_minutes: int) -> ReturnDecisionOut:
    _purge_expired_location_snapshots(db)
    est = calculate_estimate(db, q)
    if est['status'] != 'ok':
        return ReturnDecisionOut(
            queue_entry_id=q.id,
            estimated_wait_minutes=None,
            travel_minutes=None,
            safety_margin_minutes=safety_margin_minutes,
            should_notify_now=False,
            return_viable=None,
            return_feasibility='UNKNOWN',
            arrival_slack_minutes=None,
            mode='NO_ESTIMATE',
            reason=est.get('message', 'Estimate unavailable'),
        )

    wait = float(est['p50_minutes'])
    snap = _latest_active_location_snapshot(db, q.id)
    if snap and snap.consent_given and snap.travel_minutes is not None:
        travel = int(snap.travel_minutes)
        slack = round(wait - travel, 2)
        if slack < 0:
            feasibility = 'INFEASIBLE'
        elif slack < safety_margin_minutes:
            feasibility = 'AT_RISK'
        else:
            feasibility = 'FEASIBLE'
        should = wait <= travel + safety_margin_minutes
        if feasibility == 'INFEASIBLE':
            reason = 'The p50 wait is shorter than the estimated travel time. Notify now and flag that arrival before service is unlikely.'
        elif feasibility == 'AT_RISK':
            reason = 'The tutor can arrive within the p50 estimate, but the configured safety margin is not fully available.'
        else:
            reason = 'The p50 wait covers travel time and the configured safety margin.'
        return ReturnDecisionOut(
            queue_entry_id=q.id,
            estimated_wait_minutes=wait,
            travel_minutes=travel,
            safety_margin_minutes=safety_margin_minutes,
            should_notify_now=should,
            return_viable=slack >= 0,
            return_feasibility=feasibility,
            arrival_slack_minutes=slack,
            mode='TRAVEL_TIME',
            reason=reason,
        )

    fixed = settings.default_fixed_notice_minutes
    if fixed is None:
        return ReturnDecisionOut(
            queue_entry_id=q.id,
            estimated_wait_minutes=wait,
            travel_minutes=None,
            safety_margin_minutes=safety_margin_minutes,
            should_notify_now=False,
            return_viable=None,
            return_feasibility='UNKNOWN',
            arrival_slack_minutes=None,
            mode='FIXED_NOTICE_NOT_CONFIGURED',
            reason='No active consented travel estimate. Configure DEFAULT_FIXED_NOTICE_MINUTES after validation with the clinic; the tutor can still use the system.',
        )
    should = wait <= fixed
    return ReturnDecisionOut(
        queue_entry_id=q.id,
        estimated_wait_minutes=wait,
        travel_minutes=None,
        safety_margin_minutes=safety_margin_minutes,
        should_notify_now=should,
        return_viable=None,
        return_feasibility='UNKNOWN',
        arrival_slack_minutes=None,
        mode='FIXED_NOTICE',
        reason=f'No active location estimate: use the configured fixed notice threshold of {fixed} minutes.',
    )


def _pending_notification(db: Session, queue_entry_id: int) -> Notification | None:
    return db.scalar(select(Notification).where(
        Notification.queue_entry_id == queue_entry_id,
        Notification.status.in_(['SENT', 'SIMULATED']),
        Notification.confirmed_at.is_(None),
    ).order_by(Notification.sent_at.desc(), Notification.id.desc()).limit(1))


def _open_reception_action(db: Session, queue_entry_id: int) -> Notification | None:
    return db.scalar(select(Notification).where(
        Notification.queue_entry_id == queue_entry_id,
        Notification.status == 'FAILED',
        Notification.reception_action_required.is_(True),
        Notification.reception_action_resolved_at.is_(None),
    ).order_by(Notification.sent_at.desc(), Notification.id.desc()).limit(1))


def _create_simulated_notification(db: Session, q: QueueEntry, message: str, actor_user_id: int | None) -> Notification:
    if q.status not in {'WAITING', 'CALLED'}:
        raise HTTPException(409, f'Cannot notify a queue entry in status {q.status}')
    if _open_reception_action(db, q.id):
        raise HTTPException(409, 'Reception must resolve the previous notification failure before another attempt')
    if _pending_notification(db, q.id):
        raise HTTPException(409, 'There is already an unconfirmed notification for this queue entry')
    now = datetime.now(timezone.utc)
    n = Notification(
        queue_entry_id=q.id,
        channel='SIMULATOR',
        status='SIMULATED',
        message=message,
        sent_at=now,
    )
    db.add(n)
    if q.status == 'WAITING':
        q.status = 'CALLED'
        q.called_at = now
    audit(db, 'QueueEntry', q.id, 'NOTIFICATION_SIMULATED', actor_user_id, {'channel': 'SIMULATOR'})
    db.commit()
    db.refresh(n)
    return n


@router.get('/public/status/{public_token}/location-consent', response_model=LocationConsentOut)
def public_location_consent(public_token: str, db: Session = Depends(get_db)):
    _get_public_queue(db, public_token)
    return LocationConsentOut(
        purpose=LOCATION_CONSENT_PURPOSE,
        consent_version=LOCATION_CONSENT_VERSION,
        retention_minutes=settings.location_retention_minutes,
        coordinates_persisted=False,
        continuous_tracking=False,
        denial_supported=True,
        moments=['CHECK_IN', 'NOTIFICATION', 'RETURN_CONFIRMATION'],
    )


@router.post('/public/status/{public_token}/location')
def save_public_location(public_token: str, payload: LocationIn, db: Session = Depends(get_db)):
    q = _get_public_queue(db, public_token)
    snap = _record_location_snapshot(db, q, payload, actor_user_id=None)
    return {
        'id': snap.id,
        'stored_coordinates': False,
        'travel_minutes': snap.travel_minutes,
        'moment': snap.moment,
        'consent_given': snap.consent_given,
        'expires_at': snap.expires_at,
    }


@router.post('/queue/{entry_id}/location')
def save_location(entry_id: int, payload: LocationIn, db: Session = Depends(get_db), user=STAFF):
    q = db.get(QueueEntry, entry_id)
    if not q:
        raise HTTPException(404, 'Queue entry not found')
    snap = _record_location_snapshot(db, q, payload, actor_user_id=user.id)
    return {
        'id': snap.id,
        'stored_coordinates': False,
        'travel_minutes': snap.travel_minutes,
        'moment': snap.moment,
        'consent_given': snap.consent_given,
        'expires_at': snap.expires_at,
    }


@router.get('/queue/{entry_id}/return-decision', response_model=ReturnDecisionOut)
def return_decision(
    entry_id: int,
    safety_margin_minutes: int = Query(ge=0, le=1440),
    db: Session = Depends(get_db),
    user=STAFF,
):
    q = db.get(QueueEntry, entry_id)
    if not q:
        raise HTTPException(404, 'Queue entry not found')
    return _calculate_return_decision(db, q, safety_margin_minutes)


@router.post('/queue/{entry_id}/notifications', response_model=NotificationOut)
def notify(entry_id: int, payload: NotificationIn, db: Session = Depends(get_db), user=STAFF):
    q = db.get(QueueEntry, entry_id)
    if not q:
        raise HTTPException(404, 'Queue entry not found')
    return _create_simulated_notification(db, q, payload.message, user.id)


@router.post('/queue/{entry_id}/notifications/evaluate', response_model=NotificationDispatchOut)
def evaluate_notification(
    entry_id: int,
    safety_margin_minutes: int = Query(ge=0, le=1440),
    payload: NotificationIn = ...,
    db: Session = Depends(get_db),
    user=STAFF,
):
    q = db.get(QueueEntry, entry_id)
    if not q:
        raise HTTPException(404, 'Queue entry not found')
    decision = _calculate_return_decision(db, q, safety_margin_minutes)
    if decision.mode in {'NO_ESTIMATE', 'FIXED_NOTICE_NOT_CONFIGURED'}:
        return NotificationDispatchOut(created=False, reason=decision.mode, decision=decision, notification=None)
    if not decision.should_notify_now:
        return NotificationDispatchOut(created=False, reason='NOT_DUE', decision=decision, notification=None)
    failed = _open_reception_action(db, q.id)
    if failed:
        return NotificationDispatchOut(created=False, reason='RECEPTION_ACTION_REQUIRED', decision=decision, notification=None)
    pending = _pending_notification(db, q.id)
    if pending:
        return NotificationDispatchOut(
            created=False,
            reason='DUPLICATE_PREVENTED',
            decision=decision,
            notification=NotificationOut.model_validate(pending),
        )
    n = _create_simulated_notification(db, q, payload.message, user.id)
    return NotificationDispatchOut(
        created=True,
        reason='SIMULATED_NOTIFICATION_CREATED',
        decision=decision,
        notification=NotificationOut.model_validate(n),
    )


@router.get('/queue/{entry_id}/notifications', response_model=list[NotificationOut])
def list_notifications(entry_id: int, db: Session = Depends(get_db), user=STAFF):
    q = db.get(QueueEntry, entry_id)
    if not q:
        raise HTTPException(404, 'Queue entry not found')
    return list(db.scalars(select(Notification).where(
        Notification.queue_entry_id == q.id
    ).order_by(Notification.sent_at.desc(), Notification.id.desc())).all())


@router.get('/notifications/reception-actions', response_model=list[NotificationOut])
def list_reception_actions(db: Session = Depends(get_db), user=STAFF):
    return list(db.scalars(select(Notification).where(
        Notification.reception_action_required.is_(True),
        Notification.reception_action_resolved_at.is_(None),
    ).order_by(Notification.sent_at.asc())).all())


@router.post('/notifications/{notification_id}/fail', response_model=NotificationOut)
def fail_notification(notification_id: int, db: Session = Depends(get_db), user=STAFF):
    n = db.get(Notification, notification_id)
    if not n:
        raise HTTPException(404, 'Notification not found')
    if n.status not in {'SENT', 'SIMULATED'} or n.confirmed_at is not None:
        raise HTTPException(409, f'Cannot mark notification as failed from status {n.status}')
    n.status = 'FAILED'
    n.reception_action_required = True
    n.reception_action_resolved_at = None
    n.reception_action_note = None
    audit(db, 'Notification', n.id, 'MARK_FAILED_RECEPTION_ACTION_REQUIRED', user.id)
    db.commit()
    db.refresh(n)
    return n


@router.post('/notifications/{notification_id}/resolve-reception-action', response_model=NotificationOut)
def resolve_reception_action(
    notification_id: int,
    payload: ReceptionActionResolveIn,
    db: Session = Depends(get_db),
    user=STAFF,
):
    n = db.get(Notification, notification_id)
    if not n:
        raise HTTPException(404, 'Notification not found')
    if n.status != 'FAILED' or not n.reception_action_required or n.reception_action_resolved_at is not None:
        raise HTTPException(409, 'There is no open reception action for this notification')
    n.reception_action_resolved_at = datetime.now(timezone.utc)
    n.reception_action_note = payload.note
    audit(db, 'Notification', n.id, 'RESOLVE_RECEPTION_ACTION', user.id, {'note': payload.note})
    db.commit()
    db.refresh(n)
    return n


def _confirm_notification(db: Session, n: Notification, actor_user_id: int | None) -> Notification:
    if n.status not in {'SENT', 'SIMULATED'} or n.confirmed_at is not None:
        raise HTTPException(409, f'Cannot confirm notification from status {n.status}')
    now = datetime.now(timezone.utc)
    n.confirmed_at = now
    n.status = 'CONFIRMED'
    q = db.get(QueueEntry, n.queue_entry_id)
    if q and q.status == 'CALLED':
        q.status = 'RETURNING'
    audit(db, 'Notification', n.id, 'CONFIRM_RETURN', actor_user_id)
    db.commit()
    db.refresh(n)
    return n


@router.post('/notifications/{notification_id}/confirm', response_model=NotificationOut)
def confirm_notification(notification_id: int, db: Session = Depends(get_db), user=STAFF):
    n = db.get(Notification, notification_id)
    if not n:
        raise HTTPException(404, 'Notification not found')
    return _confirm_notification(db, n, user.id)


@router.post('/public/status/{public_token}/confirm-return')
def public_confirm_return(public_token: str, db: Session = Depends(get_db)):
    q = _get_public_queue(db, public_token)
    n = _pending_notification(db, q.id)
    if not n:
        raise HTTPException(409, 'There is no pending return notification to confirm')
    confirmed = _confirm_notification(db, n, actor_user_id=None)
    return {
        'queue_entry_id': q.id,
        'queue_status': db.get(QueueEntry, q.id).status,
        'notification_id': confirmed.id,
        'notification_status': confirmed.status,
        'confirmed_at': confirmed.confirmed_at,
    }


@router.post('/queue/{entry_id}/allocations', response_model=AllocationOut)
def allocate(entry_id:int,payload:AllocationIn,db:Session=Depends(get_db),user=STAFF):
    q=db.get(QueueEntry,entry_id); r=db.get(Resource,payload.resource_id)
    if not q or not r: raise HTTPException(404,'Queue entry or resource not found')
    busy=db.scalar(select(ResourceAllocation).where(ResourceAllocation.resource_id==r.id,ResourceAllocation.ended_at.is_(None)).limit(1))
    if busy: raise HTTPException(409,'Resource already allocated')
    a=ResourceAllocation(queue_entry_id=q.id,resource_id=r.id); db.add(a); audit(db,'QueueEntry',q.id,'ALLOCATE_RESOURCE',user.id,{'resource_id':r.id}); db.commit(); db.refresh(a); return a

@router.delete('/allocations/{allocation_id}', response_model=AllocationOut)
def release(allocation_id:int,db:Session=Depends(get_db),user=STAFF):
    a=db.get(ResourceAllocation,allocation_id)
    if not a: raise HTTPException(404,'Allocation not found')
    if not a.ended_at: a.ended_at=datetime.now(timezone.utc)
    db.commit(); db.refresh(a); return a

@router.get('/metrics/wait-estimates', response_model=MetricsOut)
def metrics(db:Session=Depends(get_db),user=STAFF):
    rows=list(db.scalars(select(WaitEstimate).where(WaitEstimate.is_initial.is_(True),WaitEstimate.actual_wait_minutes.is_not(None))).all())
    if not rows: return MetricsOut(evaluated_estimates=0,mean_signed_error_minutes=None,mean_absolute_error_minutes=None,inside_range_rate=None)
    return MetricsOut(
        evaluated_estimates=len(rows),
        mean_signed_error_minutes=round(sum(r.signed_error_minutes for r in rows)/len(rows),2),
        mean_absolute_error_minutes=round(sum(r.absolute_error_minutes for r in rows)/len(rows),2),
        inside_range_rate=round(sum(1 for r in rows if r.inside_range)/len(rows),4),
    )

@router.get('/metrics/wait-estimates/by-type', response_model=list[F1TypeMetrics])
def metrics_by_type(db:Session=Depends(get_db),user=STAFF):
    rows=list(db.scalars(select(WaitEstimate).where(WaitEstimate.is_initial.is_(True),WaitEstimate.actual_wait_minutes.is_not(None))).all())
    grouped={}
    for row in rows:
        entry=db.get(QueueEntry,row.queue_entry_id)
        if not entry: continue
        grouped.setdefault(entry.appointment_type,[]).append(row)
    result=[]
    for appointment_type,items in sorted(grouped.items()):
        result.append(F1TypeMetrics(
            appointment_type=appointment_type,
            evaluated_estimates=len(items),
            mean_signed_error_minutes=round(sum(item.signed_error_minutes for item in items)/len(items),2),
            mean_absolute_error_minutes=round(sum(item.absolute_error_minutes for item in items)/len(items),2),
            inside_range_rate=round(sum(1 for item in items if item.inside_range)/len(items),4),
        ))
    return result

@router.get('/metrics/f1-readiness', response_model=F1ReadinessOut)
def f1_readiness(db:Session=Depends(get_db),user=STAFF):
    return F1ReadinessOut(
        minimum_configured=settings.min_samples_for_estimate,
        note=(
            'MOCKED samples are enabled for the approved C1-MOCKED delivery and remain identified as non-real data.'
            if settings.allow_mocked_estimates
            else 'MOCKED samples are excluded. Enable them explicitly or provide another eligible data source.'
        ),
        types=sample_readiness(db),
    )

@router.get('/public/status/{public_token}')
def public_status(public_token: str, db: Session = Depends(get_db)):
    q = _get_public_queue(db, public_token)
    _purge_expired_location_snapshots(db)
    est = calculate_estimate(db, q)
    waiting = list(db.scalars(select(QueueEntry).where(QueueEntry.status.in_(['WAITING','CALLED','RETURNING','READY']))).all())
    waiting.sort(key=lambda e: (-int(e.emergency), -e.priority_level, e.checked_in_at, e.id))
    position = next((i + 1 for i, e in enumerate(waiting) if e.id == q.id), None)
    latest_notification = db.scalar(select(Notification).where(
        Notification.queue_entry_id == q.id
    ).order_by(Notification.sent_at.desc(), Notification.id.desc()).limit(1))
    notification_summary = None
    if latest_notification:
        notification_summary = {
            'status': latest_notification.status,
            'sent_at': latest_notification.sent_at,
            'confirmed_at': latest_notification.confirmed_at,
        }
    return {
        'queue_entry_id': q.id,
        'status': q.status,
        'species': q.species,
        'appointment_type': q.appointment_type,
        'contextual_position': position,
        'estimate': est,
        'called_at': q.called_at,
        'notification': notification_summary,
    }
