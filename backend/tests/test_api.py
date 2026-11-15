from datetime import datetime, timedelta, timezone


def create_basic(client, headers):
    tutor = client.post('/api/tutors', json={'name':'Lucas Tutor','contact':'x'}, headers=headers).json()
    animal = client.post('/api/animals', json={'tutor_id':tutor['id'],'code':'A-001','species':'DOG','name':'Athena'}, headers=headers).json()
    vet = client.post('/api/resources', json={'name':'Vet 1','resource_type':'VETERINARIAN'}, headers=headers).json()
    return tutor, animal, vet


def add_real_samples(client, headers, kind='CONSULTATION', vals=(20,30,40,25,35)):
    r=client.post('/api/samples/bulk',json={'samples':[{'appointment_type':kind,'duration_minutes':v,'source':'DIRECT_OBSERVATION'} for v in vals]},headers=headers)
    assert r.status_code==200


def test_health(client):
    assert client.get('/api/health').json()=={'status':'ok'}


def test_appointment_overlap_is_blocked(client,reception_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    start=(datetime.now(timezone.utc)+timedelta(days=1)).isoformat()
    payload={'tutor_id':tutor['id'],'animal_id':animal['id'],'veterinarian_resource_id':vet['id'],'scheduled_at':start,'expected_duration_minutes':30,'appointment_type':'CONSULTATION'}
    assert client.post('/api/appointments',json=payload,headers=reception_headers).status_code==200
    payload['scheduled_at']=(datetime.fromisoformat(start)+timedelta(minutes=15)).isoformat()
    assert client.post('/api/appointments',json=payload,headers=reception_headers).status_code==409


def test_checkin_duplicate_is_blocked(client,reception_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    appt=client.post('/api/appointments',json={'tutor_id':tutor['id'],'animal_id':animal['id'],'veterinarian_resource_id':vet['id'],'scheduled_at':(datetime.now(timezone.utc)+timedelta(hours=1)).isoformat(),'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    assert client.post(f"/api/appointments/{appt['id']}/check-in",json={},headers=reception_headers).status_code==200
    assert client.post(f"/api/appointments/{appt['id']}/check-in",json={},headers=reception_headers).status_code==409


def test_f1_refuses_to_invent_estimate_without_data(client,reception_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    q=client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    est=client.post(f"/api/queue/{q['id']}/estimate",headers=reception_headers).json()
    assert est['status']=='insufficient_data'
    assert 'CONSULTATION' in est['missing_types']


def test_f1_returns_percentile_range_with_real_samples(client,reception_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    add_real_samples(client,reception_headers)
    q1=client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    # second animal avoids duplicate concerns and has one queue entry ahead
    a2=client.post('/api/animals',json={'tutor_id':tutor['id'],'code':'A-002','species':'CAT','name':'Cat'},headers=reception_headers).json()
    q2=client.post('/api/walk-ins',json={'animal_id':a2['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    est=client.post(f"/api/queue/{q2['id']}/estimate",headers=reception_headers).json()
    assert est['status']=='ok'
    assert est['p50_minutes'] > 0
    assert est['p90_minutes'] >= est['p50_minutes']
    assert est['sample_size']==5


def test_only_vet_can_mark_emergency(client,reception_headers,vet_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    q=client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    assert client.patch(f"/api/queue/{q['id']}/priority",json={'emergency':True},headers=reception_headers).status_code==403
    r=client.patch(f"/api/queue/{q['id']}/priority",json={'emergency':True},headers=vet_headers)
    assert r.status_code==200 and r.json()['emergency'] is True


def test_location_refusal_uses_fixed_notice_mode(client,reception_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    add_real_samples(client,reception_headers)
    q=client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    saved=client.post(f"/api/queue/{q['id']}/location",json={'moment':'CHECK_IN','consent_given':False},headers=reception_headers)
    assert saved.status_code==200, saved.text
    d=client.get(f"/api/queue/{q['id']}/return-decision?safety_margin_minutes=5",headers=reception_headers).json()
    assert d['mode']=='FIXED_NOTICE'


def test_resource_cannot_be_double_allocated(client,reception_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    room=client.post('/api/resources',json={'name':'Isolation','resource_type':'ISOLATION_ROOM'},headers=reception_headers).json()
    q1=client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    a2=client.post('/api/animals',json={'tutor_id':tutor['id'],'code':'A-002','species':'CAT'},headers=reception_headers).json()
    q2=client.post('/api/walk-ins',json={'animal_id':a2['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    assert client.post(f"/api/queue/{q1['id']}/allocations",json={'resource_id':room['id']},headers=reception_headers).status_code==200
    assert client.post(f"/api/queue/{q2['id']}/allocations",json={'resource_id':room['id']},headers=reception_headers).status_code==409


def test_public_status_requires_unguessable_token(client,reception_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    q=client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    assert client.get('/api/public/status/not-a-token').status_code==404
    r=client.get(f"/api/public/status/{q['public_token']}")
    assert r.status_code==200
    assert 'contact' not in str(r.json())


def test_f1_auto_recalculates_on_queue_changes(client,reception_headers,vet_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    add_real_samples(client,reception_headers)

    q1=client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    a2=client.post('/api/animals',json={'tutor_id':tutor['id'],'code':'A-002','species':'CAT','name':'Cat'},headers=reception_headers).json()
    q2=client.post('/api/walk-ins',json={'animal_id':a2['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()

    h1=client.get(f"/api/queue/{q1['id']}/estimates",headers=reception_headers).json()
    h2=client.get(f"/api/queue/{q2['id']}/estimates",headers=reception_headers).json()
    assert h1[0]['is_initial'] is True
    assert h2[0]['is_initial'] is True
    assert h2[0]['p50_minutes'] > 0
    assert h1[-1]['trigger_event']=='WALK_IN'

    r=client.patch(f"/api/queue/{q2['id']}/priority",json={'emergency':True},headers=vet_headers)
    assert r.status_code==200

    h1_after=client.get(f"/api/queue/{q1['id']}/estimates",headers=reception_headers).json()
    h2_after=client.get(f"/api/queue/{q2['id']}/estimates",headers=reception_headers).json()
    assert len(h1_after)>len(h1)
    assert len(h2_after)>len(h2)
    assert h1_after[-1]['trigger_event']=='PRIORITY_CHANGED'
    assert h2_after[-1]['trigger_event']=='PRIORITY_CHANGED'
    assert h2_after[-1]['p50_minutes']==0
    assert h1_after[-1]['p50_minutes']>0


def test_f1_start_finalizes_all_revisions_and_recalculates_remaining(client,reception_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    add_real_samples(client,reception_headers)
    q1=client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    a2=client.post('/api/animals',json={'tutor_id':tutor['id'],'code':'A-002','species':'DOG'},headers=reception_headers).json()
    q2=client.post('/api/walk-ins',json={'animal_id':a2['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()

    before=client.get(f"/api/queue/{q2['id']}/estimates",headers=reception_headers).json()
    assert before[-1]['actual_wait_minutes'] is None

    start=client.post(f"/api/queue/{q1['id']}/start",headers=reception_headers)
    assert start.status_code==200

    q1_history=client.get(f"/api/queue/{q1['id']}/estimates",headers=reception_headers).json()
    assert all(row['actual_wait_minutes'] is not None for row in q1_history)
    assert all(row['absolute_error_minutes'] is not None for row in q1_history)

    q2_history=client.get(f"/api/queue/{q2['id']}/estimates",headers=reception_headers).json()
    assert q2_history[-1]['trigger_event']=='SERVICE_STARTED'
    assert len(q2_history)>len(before)


def test_f1_finish_recalculates_remaining_and_adds_system_sample(client,reception_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    add_real_samples(client,reception_headers)
    q1=client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()
    a2=client.post('/api/animals',json={'tutor_id':tutor['id'],'code':'A-002','species':'DOG'},headers=reception_headers).json()
    q2=client.post('/api/walk-ins',json={'animal_id':a2['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()

    assert client.post(f"/api/queue/{q1['id']}/start",headers=reception_headers).status_code==200
    history_before=client.get(f"/api/queue/{q2['id']}/estimates",headers=reception_headers).json()
    assert client.post(f"/api/queue/{q1['id']}/finish",headers=reception_headers).status_code==200
    history_after=client.get(f"/api/queue/{q2['id']}/estimates",headers=reception_headers).json()
    assert len(history_after)>len(history_before)
    assert history_after[-1]['trigger_event']=='SERVICE_FINISHED'

    readiness=client.get('/api/metrics/f1-readiness',headers=reception_headers).json()
    consultation=next(row for row in readiness['types'] if row['appointment_type']=='CONSULTATION')
    assert consultation['sample_size']==6  # 5 field samples + 1 SYSTEM observation


def test_f1_metrics_and_history_expose_evidence(client,reception_headers):
    tutor,animal,vet=create_basic(client,reception_headers)
    add_real_samples(client,reception_headers)
    q=client.post('/api/walk-ins',json={'animal_id':animal['id'],'appointment_type':'CONSULTATION'},headers=reception_headers).json()

    manual=client.post(f"/api/queue/{q['id']}/estimate",headers=reception_headers).json()
    assert manual['revision_number']>=2
    assert manual['trigger_event']=='MANUAL'

    assert client.post(f"/api/queue/{q['id']}/start",headers=reception_headers).status_code==200
    history=client.get(f"/api/queue/{q['id']}/estimates",headers=reception_headers).json()
    revisions=[row['revision_number'] for row in history]
    assert revisions==list(range(1,len(revisions)+1))
    assert history[0]['is_initial'] is True
    assert all(row['actual_wait_minutes'] is not None for row in history)

    metrics=client.get('/api/metrics/wait-estimates',headers=reception_headers).json()
    assert metrics['evaluated_estimates']==1
    assert metrics['mean_absolute_error_minutes'] is not None

    by_type=client.get('/api/metrics/wait-estimates/by-type',headers=reception_headers).json()
    assert by_type[0]['appointment_type']=='CONSULTATION'
    assert by_type[0]['evaluated_estimates']==1


def test_f1_invalid_sample_source_is_rejected(client,reception_headers):
    r=client.post('/api/samples/bulk',json={'samples':[{'appointment_type':'CONSULTATION','duration_minutes':20,'source':'INVENTED'}]},headers=reception_headers)
    assert r.status_code==400
