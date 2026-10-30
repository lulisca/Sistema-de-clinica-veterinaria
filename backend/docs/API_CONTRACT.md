# Contrato inicial da API — Agenda + Fila Virtual

Base URL local: `http://localhost:8000/api`

## Autenticação
- `POST /auth/bootstrap` — cria o primeiro usuário apenas em banco vazio.
- `POST /auth/login` — retorna JWT.
- Operações internas usam `Authorization: Bearer <token>`.
- O tutor consulta somente o atendimento associado a um token público aleatório: `GET /public/status/{public_token}`. O endpoint público não retorna contato do tutor nem dados clínicos.

## Agenda
- `POST /appointments`
- `GET /appointments`
- `PATCH /appointments/{id}`
- `POST /appointments/{id}/check-in`
- `POST /walk-ins`

Conflitos de horário do mesmo veterinário são rejeitados. Tolerância de atraso, regra de reinserção e precedência entre agendado/encaixe **não foram arbitradas no código** porque permanecem decisões de clínica/equipe.

## Fila / F3
- `GET /queue?species=&appointment_type=&status=`
- `GET /queue/{id}`
- `PATCH /queue/{id}/priority` — emergência somente por VETERINARIAN/ADMIN.
- `POST /queue/{id}/call`
- `POST /queue/{id}/start`
- `POST /queue/{id}/finish`
- `POST /queue/{id}/allocations`
- `DELETE /allocations/{id}`

Ordenação base: emergência declarada pelo veterinário → `priority_level` → horário de check-in. Os eixos de segregação expostos são espécie e motivo/tipo de atendimento. Recursos compartilhados têm alocação exclusiva enquanto ocupados.

## F1 — previsão + erro
- `POST /samples/bulk` — registra durações de atendimento e origem.
- `POST /queue/{id}/estimate` — recalcula manualmente e persiste uma revisão da previsão.
- `GET /queue/{id}/estimates` — histórico versionado de previsões e erros.
- `GET /metrics/wait-estimates` — erro assinado médio, MAE e taxa dentro da faixa da previsão inicial.
- `GET /metrics/wait-estimates/by-type` — os mesmos indicadores segmentados por tipo.
- `GET /metrics/f1-readiness` — quantidade de amostras e prontidão técnica por tipo.

O backend calcula percentis por **tipo de atendimento**. `SYNTHETIC` é aceito para desenvolvimento, mas excluído da estimativa calibrada. Se faltarem amostras reais/retrospectivas/sistema, retorna `insufficient_data`.

A primeira previsão persistida é marcada como `is_initial=true`. Cada revisão recebe `revision_number`, `trigger_event` e `calculated_at`. Check-in, encaixe, alteração de prioridade, início/fim do atendimento, atualização das amostras e mudança de capacidade veterinária recalculam automaticamente os pacientes em espera quando houver dados suficientes. Quando o atendimento começa, o backend grava a espera real e calcula erro assinado, erro absoluto e se a espera caiu entre p50 e p90 em todas as revisões daquele paciente.

## F2 — deslocamento sem rastreamento contínuo
- `POST /queue/{id}/location`
- `GET /queue/{id}/return-decision`
- `POST /queue/{id}/notifications`
- `POST /notifications/{id}/confirm`
- `POST /notifications/{id}/fail`

O backend não persiste latitude/longitude. Persiste somente consentimento, faixa de distância/tempo de deslocamento e expiração. Sem consentimento, o backend só usa `FIXED_NOTICE` se a antecedência fixa tiver sido configurada após validação da clínica. Caso contrário retorna `FIXED_NOTICE_NOT_CONFIGURED`. A margem de segurança é parâmetro explícito, pois ainda é decisão pendente.

O canal real de mensagem ainda não foi escolhido; `SIMULATOR` registra o evento sem fingir integração externa.

## Estados principais
Agenda: `SCHEDULED`, `CHECKED_IN`, `CANCELLED`, `NO_SHOW`, `COMPLETED`.

Fila: `WAITING`, `CALLED`, `RETURNING`, `READY`, `IN_SERVICE`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.
