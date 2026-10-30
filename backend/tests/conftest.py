import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import os
os.environ['DATABASE_URL'] = 'sqlite:///./test_fila_virtual.db'
os.environ['JWT_SECRET'] = 'test-secret-012345678901234567890123456789'
os.environ['MIN_SAMPLES_FOR_ESTIMATE'] = '3'
os.environ['DEFAULT_FIXED_NOTICE_MINUTES'] = '20'

import pytest
from fastapi.testclient import TestClient
from app.core.database import Base, SessionLocal, engine
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.domain import User

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        reception = User(name='Rec', email='rec@test.local', password_hash=hash_password('password123'), role='RECEPTION')
        vet = User(name='Vet', email='vet@test.local', password_hash=hash_password('password123'), role='VETERINARIAN')
        db.add_all([reception, vet]); db.commit()
    yield

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def reception_headers():
    with SessionLocal() as db:
        u = db.query(User).filter_by(email='rec@test.local').one()
        return {'Authorization': f'Bearer {create_access_token(u.id, u.role)}'}

@pytest.fixture
def vet_headers():
    with SessionLocal() as db:
        u = db.query(User).filter_by(email='vet@test.local').one()
        return {'Authorization': f'Bearer {create_access_token(u.id, u.role)}'}
