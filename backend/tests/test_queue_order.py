# Reordenação da fila pelo veterinário (PUT /queue/order).
# A regra de ordem não muda (emergência, nível de prioridade, check-in, ID):
# a rota só grava o nível de prioridade a partir da ordem enviada.


def nova_entrada(client, headers, codigo):
    tutor = client.post('/api/tutors', json={'name': f'Tutor {codigo}'}, headers=headers).json()
    animal = client.post('/api/animals', json={'tutor_id': tutor['id'], 'code': codigo, 'species': 'DOG'}, headers=headers).json()
    entrada = client.post('/api/walk-ins', json={'animal_id': animal['id'], 'appointment_type': 'CONSULTATION'}, headers=headers)
    assert entrada.status_code == 200, entrada.text
    return entrada.json()


def ids_da_fila(client, headers):
    return [e['id'] for e in client.get('/api/queue', headers=headers).json()]


def test_vet_reordena_a_fila(client, reception_headers, vet_headers):
    a, b, c = (nova_entrada(client, reception_headers, x) for x in ('A-1', 'B-1', 'C-1'))
    r = client.put('/api/queue/order', json={'entry_ids': [c['id'], a['id'], b['id']]}, headers=vet_headers)
    assert r.status_code == 200, r.text
    assert [e['id'] for e in r.json()] == [c['id'], a['id'], b['id']]
    assert ids_da_fila(client, reception_headers) == [c['id'], a['id'], b['id']]
    status = client.get(f"/api/public/status/{c['public_token']}").json()
    assert status['contextual_position'] == 1


def test_recepcao_nao_reordena(client, reception_headers):
    a = nova_entrada(client, reception_headers, 'A-1')
    assert client.put('/api/queue/order', json={'entry_ids': [a['id']]}, headers=reception_headers).status_code == 403


def test_lista_desatualizada_da_409(client, reception_headers, vet_headers):
    a, b = nova_entrada(client, reception_headers, 'A-1'), nova_entrada(client, reception_headers, 'B-1')
    reordenar = lambda ids: client.put('/api/queue/order', json={'entry_ids': ids}, headers=vet_headers).status_code
    assert reordenar([b['id']]) == 409                   # faltou um
    assert reordenar([b['id'], a['id'], 999]) == 409     # sobrou um
    assert reordenar([b['id'], b['id']]) == 409          # repetido
    assert reordenar([]) == 422                          # vazio


def test_emergencia_fica_no_topo_e_fora_da_ordem(client, reception_headers, vet_headers):
    a, b, c = (nova_entrada(client, reception_headers, x) for x in ('A-1', 'B-1', 'C-1'))
    client.patch(f"/api/queue/{b['id']}/priority", json={'emergency': True}, headers=vet_headers)
    assert client.put('/api/queue/order', json={'entry_ids': [c['id'], b['id'], a['id']]}, headers=vet_headers).status_code == 409
    assert client.put('/api/queue/order', json={'entry_ids': [c['id'], a['id']]}, headers=vet_headers).status_code == 200
    assert ids_da_fila(client, reception_headers) == [b['id'], c['id'], a['id']]


def test_quem_entra_depois_vai_para_o_fim(client, reception_headers, vet_headers):
    a, b = nova_entrada(client, reception_headers, 'A-1'), nova_entrada(client, reception_headers, 'B-1')
    client.put('/api/queue/order', json={'entry_ids': [b['id'], a['id']]}, headers=vet_headers)
    d = nova_entrada(client, reception_headers, 'D-1')
    assert ids_da_fila(client, reception_headers) == [b['id'], a['id'], d['id']]


def test_reordenar_recalcula_a_estimativa_uma_vez(client, reception_headers, vet_headers):
    # Sem amostras a API não grava revisão (persist_estimate só grava com status 'ok').
    amostras = [{'appointment_type': 'CONSULTATION', 'duration_minutes': v, 'source': 'DIRECT_OBSERVATION'} for v in (20, 30, 40)]
    assert client.post('/api/samples/bulk', json={'samples': amostras}, headers=reception_headers).status_code == 200
    a, b = nova_entrada(client, reception_headers, 'A-1'), nova_entrada(client, reception_headers, 'B-1')
    client.put('/api/queue/order', json={'entry_ids': [b['id'], a['id']]}, headers=vet_headers)
    revisoes = client.get(f"/api/queue/{a['id']}/estimates", headers=reception_headers).json()
    assert [r['trigger_event'] for r in revisoes].count('QUEUE_REORDERED') == 1
