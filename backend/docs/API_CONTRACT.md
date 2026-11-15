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

Rotas do tutor (token público aleatório do próprio atendimento):
- `GET /public/status/{token}/location-consent` — finalidade, momentos de captura e política de minimização.
- `POST /public/status/{token}/location` — registra consentimento e tempo estimado de deslocamento em `CHECK_IN`, `NOTIFICATION` ou `RETURN_CONFIRMATION`.
- `POST /public/status/{token}/confirm-return` — confirma o retorno e muda `CALLED` para `RETURNING`.
- `GET /public/status/{token}` — consulta o próprio atendimento e o estado resumido do último aviso.

Rotas da recepção/equipe:
- `POST /queue/{id}/location` — registro assistido da mesma informação, se necessário.
- `GET /queue/{id}/return-decision?safety_margin_minutes=N` — calcula o momento do aviso e a viabilidade estimada de chegada.
- `POST /queue/{id}/notifications/evaluate?safety_margin_minutes=N` — avalia e cria um evento simulado apenas quando o aviso é devido.
- `POST /queue/{id}/notifications` — registro manual/simulado pela equipe.
- `GET /queue/{id}/notifications` — histórico de avisos.
- `POST /notifications/{id}/confirm` — confirmação assistida pela equipe.
- `POST /notifications/{id}/fail` — registra falha e abre ação para a recepção.
- `GET /notifications/reception-actions` — lista falhas que exigem ação.
- `POST /notifications/{id}/resolve-reception-action` — registra a providência da recepção.

O backend não recebe nem persiste latitude/longitude. O contrato recebe somente o tempo estimado de deslocamento (`travel_minutes`) calculado pelo cliente/serviço de rotas escolhido pela equipe. A captura deve ocorrer apenas nos momentos definidos, mediante consentimento explícito. `LOCATION_RETENTION_MINUTES` é configuração do servidor; o cliente não pode escolher o prazo. Snapshots expirados são excluídos nas operações F2 e também podem ser removidos pelo script `python scripts/purge_expired_location_snapshots.py` (agendar no ambiente publicado).

Sem consentimento, o backend não guarda tempo de deslocamento e usa `FIXED_NOTICE` somente se `DEFAULT_FIXED_NOTICE_MINUTES` estiver configurado. Caso contrário retorna `FIXED_NOTICE_NOT_CONFIGURED`; o tutor continua podendo usar o sistema, mas a clínica precisa definir a antecedência fixa antes da operação final. A margem de segurança é parâmetro explícito (`safety_margin_minutes`) porque ainda depende de validação com a clínica. A resposta também indica `return_viable` e `return_feasibility` (`FEASIBLE`, `AT_RISK`, `INFEASIBLE`, `UNKNOWN`).

O canal real de mensagem ainda não foi escolhido. `SIMULATOR` cria um registro `SIMULATED`, sem alegar envio por WhatsApp/SMS/e-mail. Falhas abrem uma ação pendente para a recepção; uma nova tentativa automática fica bloqueada até a recepção registrar a providência. O endpoint de avaliação impede avisos duplicados enquanto houver um aviso pendente não confirmado.

## Estados principais
Agenda: `SCHEDULED`, `CHECKED_IN`, `CANCELLED`, `NO_SHOW`, `COMPLETED`.

Fila: `WAITING`, `CALLED`, `RETURNING`, `READY`, `IN_SERVICE`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.
