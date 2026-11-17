def register(client, email='tutor@example.com'):
    response = client.post('/api/auth/tutors/register', json={
        'name': 'Marina Silva',
        'email': email,
        'password': 'senha-segura-123',
        'contact': '(19) 99999-0000',
    })
    assert response.status_code == 201
    body = response.json()
    assert body['role'] == 'TUTOR'
    return {'Authorization': f"Bearer {body['access_token']}"}


def test_tutor_registers_pet_and_joins_queue_with_symptoms(client):
    headers = register(client)

    me = client.get('/api/tutor/me', headers=headers)
    assert me.status_code == 200
    assert me.json()['name'] == 'Marina Silva'

    animal = client.post('/api/tutor/animals', headers=headers, json={
        'name': 'Luna',
        'species': 'DOG',
    })
    assert animal.status_code == 201

    entry = client.post('/api/tutor/queue', headers=headers, json={
        'animal_id': animal.json()['id'],
        'appointment_type': 'CONSULTATION',
        'symptoms': 'Sem apetite e com vômitos desde ontem.',
    })
    assert entry.status_code == 201
    assert entry.json()['symptoms'] == 'Sem apetite e com vômitos desde ontem.'
    assert entry.json()['emergency'] is False

    status = client.get(f"/api/public/status/{entry.json()['public_token']}")
    assert status.status_code == 200
    assert 'symptoms' not in status.json()


def test_tutor_cannot_use_another_tutors_animal(client):
    first_headers = register(client, 'first@example.com')
    animal = client.post('/api/tutor/animals', headers=first_headers, json={
        'name': 'Nina', 'species': 'CAT',
    }).json()
    second_headers = register(client, 'second@example.com')

    response = client.post('/api/tutor/queue', headers=second_headers, json={
        'animal_id': animal['id'],
        'appointment_type': 'CONSULTATION',
        'symptoms': 'Está espirrando.',
    })
    assert response.status_code == 404


def test_tutor_cannot_create_duplicate_active_entry(client):
    headers = register(client)
    animal = client.post('/api/tutor/animals', headers=headers, json={
        'name': 'Thor', 'species': 'DOG',
    }).json()
    payload = {
        'animal_id': animal['id'],
        'appointment_type': 'CONSULTATION',
        'symptoms': 'Coçando a orelha.',
    }
    assert client.post('/api/tutor/queue', headers=headers, json=payload).status_code == 201
    assert client.post('/api/tutor/queue', headers=headers, json=payload).status_code == 409


def test_registration_rejects_duplicate_email(client):
    register(client)
    response = client.post('/api/auth/tutors/register', json={
        'name': 'Outro nome',
        'email': 'TUTOR@example.com',
        'password': 'outra-senha-123',
    })
    assert response.status_code == 409


def test_staff_routes_reject_tutor_role(client):
    headers = register(client)
    assert client.get('/api/queue', headers=headers).status_code == 403


def test_tutor_account_does_not_block_first_staff_bootstrap(client):
    # A fixture já cria equipe; removemos somente para simular um banco que
    # começou pelo cadastro público de um tutor.
    from app.core.database import SessionLocal
    from app.models.domain import User

    with SessionLocal() as db:
        db.query(User).delete()
        db.commit()

    register(client)
    response = client.post('/api/auth/bootstrap', json={
        'name': 'Administrador',
        'email': 'admin@clinica.local',
        'password': 'senha-admin-123',
        'role': 'ADMIN',
    })
    assert response.status_code == 200
    assert response.json()['role'] == 'ADMIN'

    duplicate = client.post('/api/auth/bootstrap', json={
        'name': 'Outro administrador',
        'email': 'outro@clinica.local',
        'password': 'senha-admin-456',
        'role': 'ADMIN',
    })
    assert duplicate.status_code == 409


def test_inactive_tutor_cannot_login(client):
    from app.core.database import SessionLocal
    from app.models.domain import User

    register(client)
    with SessionLocal() as db:
        user = db.query(User).filter_by(email='tutor@example.com').one()
        user.active = False
        db.commit()
    response = client.post('/api/auth/login', json={
        'email': 'tutor@example.com', 'password': 'senha-segura-123',
    })
    assert response.status_code == 401


def test_tutor_registration_rejects_role_field(client):
    response = client.post('/api/auth/tutors/register', json={
        'name': 'Marina Silva', 'email': 'role@example.com',
        'password': 'senha-segura-123', 'role': 'ADMIN',
    })
    assert response.status_code == 422


def test_tutor_animal_and_queue_reject_extra_fields(client):
    headers = register(client)
    invalid_animal = client.post('/api/tutor/animals', headers=headers, json={
        'name': 'Luna', 'species': 'DOG', 'tutor_id': 999,
    })
    assert invalid_animal.status_code == 422
    animal = client.post('/api/tutor/animals', headers=headers, json={
        'name': 'Luna', 'species': 'DOG',
    }).json()
    invalid_queue = client.post('/api/tutor/queue', headers=headers, json={
        'animal_id': animal['id'], 'appointment_type': 'CONSULTATION',
        'symptoms': 'Sem apetite desde ontem.', 'emergency': True,
    })
    assert invalid_queue.status_code == 422


def test_tutor_cannot_change_priority(client):
    headers = register(client)
    animal = client.post('/api/tutor/animals', headers=headers, json={
        'name': 'Luna', 'species': 'DOG',
    }).json()
    entry = client.post('/api/tutor/queue', headers=headers, json={
        'animal_id': animal['id'], 'appointment_type': 'CONSULTATION',
        'symptoms': 'Sem apetite desde ontem.',
    }).json()
    response = client.patch(f"/api/queue/{entry['id']}/priority", headers=headers,
                            json={'emergency': True})
    assert response.status_code == 403


def test_reception_still_creates_walkin_but_cannot_change_priority(client, reception_headers):
    tutor = client.post('/api/tutors', headers=reception_headers,
                        json={'name': 'Tutor da recepção'})
    assert tutor.status_code == 200
    animal = client.post('/api/animals', headers=reception_headers, json={
        'tutor_id': tutor.json()['id'], 'code': 'REC-001',
        'name': 'Nina', 'species': 'CAT',
    })
    assert animal.status_code == 200
    entry = client.post('/api/walk-ins', headers=reception_headers, json={
        'animal_id': animal.json()['id'], 'appointment_type': 'CONSULTATION',
    })
    assert entry.status_code == 200
    response = client.patch(f"/api/queue/{entry.json()['id']}/priority",
                            headers=reception_headers, json={'emergency': True})
    assert response.status_code == 403


def test_registration_integrity_error_returns_409(client, monkeypatch):
    from sqlalchemy.exc import IntegrityError
    from sqlalchemy.orm import Session
    from app.models.domain import User

    original_flush = Session.flush

    def conflicting_flush(self, *args, **kwargs):
        if any(isinstance(obj, User) and obj.email == 'race@example.com' for obj in self.new):
            raise IntegrityError('INSERT INTO users', {}, Exception('duplicate email'))
        return original_flush(self, *args, **kwargs)

    monkeypatch.setattr(Session, 'flush', conflicting_flush)
    response = client.post('/api/auth/tutors/register', json={
        'name': 'Marina Silva', 'email': 'race@example.com',
        'password': 'senha-segura-123',
    })
    assert response.status_code == 409
