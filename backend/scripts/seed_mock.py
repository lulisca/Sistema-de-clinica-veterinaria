'''Cria a massa C1-MOCKED usada em desenvolvimento, testes e apresentacao.'''
from datetime import datetime, timedelta, timezone

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.domain import User, Tutor, Animal, Resource, Appointment, ServiceDurationSample


Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    if not db.query(User).count():
        db.add(User(name='Recepcao Mock', email='recepcao@mock.local', password_hash=hash_password('mock12345'), role='RECEPTION'))
    if not db.query(Resource).count():
        db.add_all([
            Resource(name='Dra. Ana', resource_type='VETERINARIAN'),
            Resource(name='Dr. Bruno', resource_type='VETERINARIAN'),
            Resource(name='Sala 1', resource_type='ROOM'),
            Resource(name='Isolamento', resource_type='ISOLATION_ROOM'),
        ])
    if not db.query(Tutor).count():
        tutor = Tutor(name='Tutor Mock', contact='mock')
        db.add(tutor)
        db.flush()
        animal = Animal(tutor_id=tutor.id, code='AN-001', species='DOG', name='Paciente Mock')
        db.add(animal)
        db.flush()
        db.add(Appointment(
            tutor_id=tutor.id,
            animal_id=animal.id,
            scheduled_at=datetime.now(timezone.utc) + timedelta(hours=1),
            appointment_type='CONSULTATION',
        ))
    if not db.query(ServiceDurationSample).count():
        samples = {
            'CONSULTATION': [18, 22, 25, 20, 30],
            'VACCINE': [7, 8, 10, 9, 12],
            'RETURN': [12, 15, 11, 16, 14],
            'EXAM': [22, 24, 27, 28, 30],
        }
        for appointment_type, durations in samples.items():
            for duration in durations:
                db.add(ServiceDurationSample(
                    appointment_type=appointment_type,
                    duration_minutes=duration,
                    source='MOCKED',
                ))
    db.commit()

print('Mock data seeded. Login: recepcao@mock.local / mock12345')
