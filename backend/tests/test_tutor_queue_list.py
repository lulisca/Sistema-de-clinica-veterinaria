# GET /tutor/queue: o tutor logado acha o próprio atendimento ativo (e o link de acompanhamento).

def registrar(client, email):
    resposta = client.post('/api/auth/tutors/register', json={
        'name': 'Marina Silva', 'email': email, 'password': 'senha-segura-123',
    })
    return {'Authorization': f"Bearer {resposta.json()['access_token']}"}


def entrar_na_fila(client, headers, nome='Luna'):
    animal = client.post('/api/tutor/animals', headers=headers, json={'name': nome, 'species': 'DOG'}).json()
    return client.post('/api/tutor/queue', headers=headers, json={
        'animal_id': animal['id'], 'appointment_type': 'CONSULTATION', 'symptoms': 'Sem apetite desde ontem.',
    }).json()


def test_tutor_ve_o_proprio_atendimento_ativo(client):
    headers = registrar(client, 'marina@example.com')
    entrada = entrar_na_fila(client, headers)

    resposta = client.get('/api/tutor/queue', headers=headers)
    assert resposta.status_code == 200
    assert [e['id'] for e in resposta.json()] == [entrada['id']]
    assert resposta.json()[0]['public_token'] == entrada['public_token']


def test_tutor_nao_ve_atendimento_de_outro_tutor(client):
    entrar_na_fila(client, registrar(client, 'primeiro@example.com'))
    outro = registrar(client, 'segundo@example.com')
    assert client.get('/api/tutor/queue', headers=outro).json() == []


def test_atendimento_concluido_sai_da_lista(client, vet_headers):
    headers = registrar(client, 'marina@example.com')
    entrada = entrar_na_fila(client, headers)
    client.post(f"/api/queue/{entrada['id']}/start", headers=vet_headers)
    client.post(f"/api/queue/{entrada['id']}/finish", headers=vet_headers)
    assert client.get('/api/tutor/queue', headers=headers).json() == []


def test_equipe_nao_usa_a_rota_do_tutor(client, reception_headers):
    assert client.get('/api/tutor/queue', headers=reception_headers).status_code == 403
