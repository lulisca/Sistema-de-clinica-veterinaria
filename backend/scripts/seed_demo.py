"""Cria dados SINTÉTICOS para desenvolver UI/testes. Não servem para calibrar a F1 final."""
from datetime import datetime, timedelta, timezone
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.domain import User, Tutor, Animal, Resource, Appointment, ServiceDurationSample

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    if not db.query(User).count():
        db.add(User(name='Recepção Demo',email='recepcao@demo.local',password_hash=hash_password('demo12345'),role='RECEPTION'))
    if not db.query(Resource).count():
        db.add_all([Resource(name='Dra. Ana',resource_type='VETERINARIAN'),Resource(name='Dr. Bruno',resource_type='VETERINARIAN'),Resource(name='Sala 1',resource_type='ROOM'),Resource(name='Isolamento',resource_type='ISOLATION_ROOM')])
    if not db.query(Tutor).count():
        t=Tutor(name='Tutor Demo',contact='demo'); db.add(t); db.flush(); a=Animal(tutor_id=t.id,code='AN-001',species='DOG',name='Paciente Demo'); db.add(a); db.flush()
        db.add(Appointment(tutor_id=t.id,animal_id=a.id,scheduled_at=datetime.now(timezone.utc)+timedelta(hours=1),appointment_type='CONSULTATION'))
    # Marcadas explicitamente como SYNTHETIC; o algoritmo calibrado as ignora.
    if not db.query(ServiceDurationSample).count():
        for kind,vals in {'CONSULTATION':[18,22,25,20,30],'VACCINE':[7,8,10,9,12],'RETURN':[12,15,11,16,14]}.items():
            for v in vals: db.add(ServiceDurationSample(appointment_type=kind,duration_minutes=v,source='SYNTHETIC'))
    db.commit()
print('Demo seeded. Login: recepcao@demo.local / demo12345')
