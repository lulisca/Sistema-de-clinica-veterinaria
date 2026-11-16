def register(client, email='tutor@example.org'):
    response = client.post('/api/auth/register-tutor', json={
        'name': 'Ana Silva', 'email': email, 'password': 'senha-muito-segura', 'contact': '11999999999'
    })
    assert response.status_code == 201, response.text
    return {'Authorization': 'Bearer ' + response.json()['access_token']}


def test_tutor_register_login_and_profile(client):
    headers = register(client)
    profile = client.get('/api/me', headers=headers)
    assert profile.status_code == 200
    assert profile.json()['email'] == 'tutor@example.org'
    assert profile.json()['tutor_id'] > 0
    assert 'password' not in profile.text
    assert client.post('/api/auth/register-tutor', json={
        'name': 'Outro', 'email': 'TUTOR@example.org', 'password': 'password123'
    }).status_code == 409
    login = client.post('/api/auth/login', json={'email': 'tutor@example.org', 'password':'senha-muito-segura'})
    assert login.status_code == 200 and login.json()['role'] == 'TUTOR'
    assert client.post('/api/auth/login', json={'email': 'tutor@example.org', 'password':'errada'}).status_code == 401


def test_tutor_register_cannot_escalate_role(client):
    r = client.post('/api/auth/register-tutor', json={
        'name': 'X', 'email':'x@y.com', 'password':'password123', 'role':'ADMIN'
    })
    assert r.status_code == 422


def test_remote_request_waits_for_veterinarian_triage(client, reception_headers, vet_headers):
    headers = register(client)
    assert client.post('/api/me/animals', json={'name':'Bidu', 'species':'DOG'}, headers=reception_headers).status_code == 403
    animal = client.post('/api/me/animals', json={'name':'Bidu', 'species':'DOG'}, headers=headers)
    assert animal.status_code == 201, animal.text
    animal_id = animal.json()['id']
    response = client.post('/api/me/queue', json={
        'animal_id':animal_id, 'appointment_type':'CONSULTATION', 'symptoms':'Tosse desde ontem'
    }, headers=headers)
    assert response.status_code == 201, response.text
    q = response.json()
    assert q['status'] == 'PENDING_TRIAGE'
    assert q['symptoms'] == 'Tosse desde ontem'
    assert q['emergency'] is False and q['priority_level'] == 0
    assert client.post('/api/me/queue', json={
        'animal_id':animal_id, 'appointment_type':'CONSULTATION', 'symptoms':'Tosse desde ontem'
    }, headers=headers).status_code == 409
    assert client.patch(f"/api/queue/{q['id']}/priority",json={'priority_level':25},headers=headers).status_code == 403
    assert client.patch(f"/api/queue/{q['id']}/priority",json={'priority_level':25},headers=reception_headers).status_code == 403
    assert client.post(f"/api/queue/{q['id']}/call",headers=reception_headers).status_code == 409
    assert client.patch(f"/api/queue/{q['id']}/priority",json={},headers=vet_headers).status_code == 422
    approval = client.patch(f"/api/queue/{q['id']}/priority",json={'priority_level':25},headers=vet_headers)
    assert approval.status_code == 200 and approval.json()['status'] == 'WAITING'
    assert approval.json()['priority_level'] == 25
    assert client.get(f"/api/public/status/{q['public_token']}").status_code == 200
    assert 'Tosse' not in client.get(f"/api/public/status/{q['public_token']}").text
    assert client.get('/api/me/queue', headers=headers).json()[0]['symptoms'] == 'Tosse desde ontem'


def test_tutor_cannot_use_staff_routes_or_another_tutor_animal(client, reception_headers):
    first = register(client, 'first@example.org')
    second = register(client, 'second@example.org')
    animal = client.post('/api/me/animals', json={'species':'CAT','name':'Miau'},headers=first).json()
    assert client.get('/api/me/animals',headers=second).json() == []
    assert client.post('/api/me/queue', json={'animal_id':animal['id'],
      'appointment_type':'CONSULTATION','symptoms':'Dificuldade para caminhar'},headers=second).status_code == 404
    assert client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=first).status_code == 403
    assert client.get('/api/queue',headers=first).status_code == 403
    assert client.post('/api/me/queue',json={'animal_id':animal['id'],
      'appointment_type':'CONSULTATION','symptoms':'Dor na pata'},headers=reception_headers).status_code == 403


def test_authentication_is_required_for_remote_request(client):
    assert client.post('/api/me/queue',json={'animal_id':1,'appointment_type':'CONSULTATION','symptoms':'Dor na pata'}).status_code == 401


def test_legacy_staff_flow_still_works(client, reception_headers):
    tutor = client.post('/api/tutors',json={'name':'Sem conta'},headers=reception_headers).json()
    animal = client.post('/api/animals',json={'tutor_id':tutor['id'],'species':'DOG','code':'STAFF-DOG'},headers=reception_headers).json()
    q = client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=reception_headers)
    assert q.status_code == 200 and q.json()['symptoms'] is None
