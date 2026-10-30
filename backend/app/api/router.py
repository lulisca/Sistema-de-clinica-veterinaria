from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
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
    calculate_estimate, finalize_estimates, persist_estimate,
    recalculate_waiting_estimates, sample_readiness,
)

router = APIRouter()
STAFF = Depends(require_roles('RECEPTION','VETERINARIAN','ADMIN'))

@router.get('/health')
def health():
    return {'status': 'ok'}

@router.post('/auth/bootstrap', response_model=TokenOut)
def bootstrap(payload: BootstrapIn, db: Session = Depends(get_db)):
    if db.scalar(select(func.count(User.id))) > 0:
        raise HTTPException(409, 'Bootstrap is allowed only when there are no users')
    user = User(name=payload.name, email=payload.email.lower(), password_hash=hash_password(payload.password), role=payload.role.upper())
    db.add(user); db.commit(); db.refresh(user)
    return TokenOut(access_token=create_access_token(user.id, user.role), role=user.role)

@router.post('/auth/login', response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, 'Invalid credentials')
    return TokenOut(access_token=create_access_token(user.id, user.role), role=user.role)

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
    allowed_sources={'DIRECT_OBSERVATION','RETROSPECTIVE','SYSTEM','SYNTHETIC'}
    invalid=sorted({sample.source for sample in payload.samples if sample.source not in allowed_sources})
    if invalid: raise HTTPException(400,f'Invalid sample source(s): {invalid}')
    objs=[ServiceDurationSample(**sample.model_dump()) for sample in payload.samples]
    db.add_all(objs); db.commit()
    recalculate_waiting_estimates(db, 'SAMPLES_UPDATED')
    return {'created':len(objs),'warning':'SYNTHETIC samples are stored for development but excluded from calibrated F1 estimates.'}

@router.post('/queue/{entry_id}/location')
def save_location(entry_id:int,payload:LocationIn,db:Session=Depends(get_db),user=STAFF):
    q=db.get(QueueEntry,entry_id)
    if not q: raise HTTPException(404,'Queue entry not found')
    if payload.consent_given and payload.travel_minutes is None: raise HTTPException(400,'travel_minutes is required when consent is granted')
    expires=datetime.now(timezone.utc)+timedelta(minutes=payload.retention_minutes)
    snap=LocationSnapshot(queue_entry_id=q.id,moment=payload.moment,consent_given=payload.consent_given,
        travel_minutes=payload.travel_minutes if payload.consent_given else None,
        distance_range=payload.distance_range if payload.consent_given else None,expires_at=expires)
    db.add(snap); audit(db,'QueueEntry',q.id,'LOCATION_SNAPSHOT',user.id,{'consent':payload.consent_given,'moment':payload.moment}); db.commit(); db.refresh(snap)
    return {'id':snap.id,'stored_coordinates':False,'travel_minutes':snap.travel_minutes,'distance_range':snap.distance_range,'expires_at':snap.expires_at}

@router.get('/queue/{entry_id}/return-decision', response_model=ReturnDecisionOut)
def return_decision(entry_id:int,safety_margin_minutes:int=Query(ge=0,le=120),db:Session=Depends(get_db),user=STAFF):
    q=db.get(QueueEntry,entry_id)
    if not q: raise HTTPException(404,'Queue entry not found')
    est=calculate_estimate(db,q)
    if est['status']!='ok':
        return ReturnDecisionOut(queue_entry_id=q.id,estimated_wait_minutes=None,travel_minutes=None,safety_margin_minutes=safety_margin_minutes,should_notify_now=False,mode='NO_ESTIMATE',reason=est.get('message','Estimate unavailable'))
    snap=db.scalar(select(LocationSnapshot).where(LocationSnapshot.queue_entry_id==q.id).order_by(LocationSnapshot.captured_at.desc()))
    if snap and snap.consent_given and snap.travel_minutes is not None:
        should=est['p50_minutes'] <= snap.travel_minutes+safety_margin_minutes
        return ReturnDecisionOut(queue_entry_id=q.id,estimated_wait_minutes=est['p50_minutes'],travel_minutes=snap.travel_minutes,safety_margin_minutes=safety_margin_minutes,should_notify_now=should,mode='TRAVEL_TIME',reason='Compares current p50 wait with travel time plus safety margin.')
    fixed=settings.default_fixed_notice_minutes
    if fixed is None:
        return ReturnDecisionOut(queue_entry_id=q.id,estimated_wait_minutes=est['p50_minutes'],travel_minutes=None,safety_margin_minutes=safety_margin_minutes,should_notify_now=False,mode='FIXED_NOTICE_NOT_CONFIGURED',reason='No usable location and the clinic fallback notice threshold has not been configured yet.')
    should=est['p50_minutes'] <= fixed
    return ReturnDecisionOut(queue_entry_id=q.id,estimated_wait_minutes=est['p50_minutes'],travel_minutes=None,safety_margin_minutes=safety_margin_minutes,should_notify_now=should,mode='FIXED_NOTICE',reason=f'No usable location: fixed notice threshold of {fixed} minutes.')

@router.post('/queue/{entry_id}/notifications', response_model=NotificationOut)
def notify(entry_id:int,payload:NotificationIn,db:Session=Depends(get_db),user=STAFF):
    q=db.get(QueueEntry,entry_id)
    if not q: raise HTTPException(404,'Queue entry not found')
    pending=db.scalar(select(Notification.id).where(Notification.queue_entry_id==q.id,Notification.status=='SENT',Notification.confirmed_at.is_(None)).limit(1))
    if pending: raise HTTPException(409,'There is already an unconfirmed notification for this queue entry')
    n=Notification(queue_entry_id=q.id,channel=payload.channel,status='SENT',message=payload.message)
    db.add(n); audit(db,'QueueEntry',q.id,'NOTIFY',user.id,{'channel':payload.channel}); db.commit(); db.refresh(n); return n

@router.post('/notifications/{notification_id}/fail', response_model=NotificationOut)
def fail_notification(notification_id:int,db:Session=Depends(get_db),user=STAFF):
    n=db.get(Notification,notification_id)
    if not n: raise HTTPException(404,'Notification not found')
    n.status='FAILED'
    audit(db,'Notification',n.id,'MARK_FAILED',user.id)
    db.commit(); db.refresh(n); return n

@router.post('/notifications/{notification_id}/confirm', response_model=NotificationOut)
def confirm_notification(notification_id:int,db:Session=Depends(get_db),user=STAFF):
    n=db.get(Notification,notification_id)
    if not n: raise HTTPException(404,'Notification not found')
    n.confirmed_at=datetime.now(timezone.utc); n.status='CONFIRMED'; q=db.get(QueueEntry,n.queue_entry_id)
    if q and q.status=='CALLED': q.status='RETURNING'
    db.commit(); db.refresh(n); return n

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
        note='This is the software threshold only. Academic calibration still requires the clinic field dataset defined by the project.',
        types=sample_readiness(db),
    )

@router.get('/public/status/{public_token}')
def public_status(public_token:str,db:Session=Depends(get_db)):
    q=db.scalar(select(QueueEntry).where(QueueEntry.public_token==public_token))
    if not q: raise HTTPException(404,'Invalid status link')
    est=calculate_estimate(db,q)
    waiting=list(db.scalars(select(QueueEntry).where(QueueEntry.status.in_(['WAITING','CALLED','RETURNING','READY']))).all())
    waiting.sort(key=lambda e:(-int(e.emergency),-e.priority_level,e.checked_in_at,e.id))
    position=next((i+1 for i,e in enumerate(waiting) if e.id==q.id),None)
    return {
        'queue_entry_id':q.id,
        'status':q.status,
        'species':q.species,
        'appointment_type':q.appointment_type,
        'contextual_position':position,
        'estimate':est,
        'called_at':q.called_at,
    }
