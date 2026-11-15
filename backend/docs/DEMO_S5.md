# Roteiro de demonstração — S5 / F1 ponta a ponta

Objetivo: demonstrar **banco → API → estimativa/faixa → início do atendimento → erro real**.

## 1. Subir a API

```bash
uvicorn app.main:app --reload
```

Abrir `http://127.0.0.1:8000/docs`.

## 2. Criar usuário inicial
`POST /api/auth/bootstrap` e copiar o JWT. Usar **Authorize** no Swagger.

## 3. Criar dados mínimos
1. `POST /api/tutors`
2. `POST /api/animals`
3. `POST /api/resources` com `resource_type = VETERINARIAN`

## 4. Carregar dados reais/retrospectivos
Use `POST /api/samples/bulk` ou `scripts/import_samples.py`.

Exemplo apenas de formato:

```json
{
  "samples": [
    {"appointment_type":"CONSULTATION","duration_minutes":21,"source":"DIRECT_OBSERVATION"},
    {"appointment_type":"CONSULTATION","duration_minutes":28,"source":"DIRECT_OBSERVATION"},
    {"appointment_type":"CONSULTATION","duration_minutes":34,"source":"RETROSPECTIVE"}
  ]
}
```

**Na entrega real, substituir pelos dados coletados pela empresa e preservar a origem.**

## 5. Criar dois pacientes na fila
Use `POST /api/walk-ins` ou agendamento + check-in. O segundo paciente deve ter o primeiro à sua frente.

## 6. Demonstrar F1
A previsão inicial é criada automaticamente ao entrar na fila quando a base é suficiente. Para demonstrar um recálculo manual adicional, use `POST /api/queue/{id}/estimate`.

Mostrar no retorno:
- `p50_minutes`
- `p90_minutes`
- `sample_size`
- `method`
- `is_initial`
- `revision_number`
- `trigger_event`

## 7. Demonstrar revisão automática

Altere a prioridade de outro caso ou inicie/encerre um atendimento. Consulte `GET /api/queue/{id}/estimates` e mostre que surgiu uma nova revisão com `trigger_event` correspondente.

## 8. Iniciar atendimento
`POST /api/queue/{id}/start`

Nesse momento o backend:
- grava `started_at`;
- calcula espera real desde o check-in;
- compara com a previsão;
- calcula erro assinado e absoluto;
- marca se ficou dentro de p50–p90.

## 9. Encerrar atendimento
`POST /api/queue/{id}/finish`

A duração real passa a ser uma nova amostra `SYSTEM` para estimativas futuras.

## 10. Mostrar indicador
`GET /api/metrics/wait-estimates` e `GET /api/metrics/wait-estimates/by-type`

Retorno:
- quantidade de estimativas avaliadas;
- erro assinado médio;
- MAE;
- taxa dentro da faixa.

## Caso de borda obrigatório para mostrar maturidade
Crie um tipo de atendimento sem amostras e peça uma estimativa. O backend deve responder `insufficient_data`, e não criar um número arbitrário.
