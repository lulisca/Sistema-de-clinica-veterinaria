# Contrato inicial da API — Agenda + Fila Virtual

Base URL local: `http://localhost:8000/api`

## Autenticação
- `POST /auth/bootstrap` — cria o primeiro usuário da equipe quando ainda não existe `RECEPTION`, `VETERINARIAN` ou `ADMIN`; contas `TUTOR` não bloqueiam essa inicialização.
- `POST /auth/login` — retorna JWT.
- `POST /auth/tutors/register` — cria a conta e o perfil do tutor e retorna JWT com papel `TUTOR`.
- Operações internas usam `Authorization: Bearer <token>`.
- O tutor autenticado usa `GET /tutor/me`, `GET|POST /tutor/animals` e `POST /tutor/queue`.
- O acompanhamento também pode ser aberto pelo token público aleatório: `GET /public/status/{public_token}`. O endpoint público não retorna contato nem sintomas.

## Autoatendimento do tutor
- `GET /tutor/me` — perfil associado ao JWT do tutor.
- `GET /tutor/animals` — lista somente os animais do tutor autenticado.
- `POST /tutor/animals` — cadastra um animal no próprio perfil; o código interno é gerado pelo servidor.
- `POST /tutor/queue` — cria uma entrada para um animal do próprio tutor com `appointment_type` e `symptoms` obrigatórios.

A autoentrada começa com prioridade normal. Ela não aceita emergência, nível de prioridade, marcadores operacionais nem veterinário; esses dados dependem da triagem da equipe. Uma segunda entrada ativa para o mesmo animal é rejeitada.

## Agenda
- `POST /appointments`
- `GET /appointments`
- `PATCH /appointments/{id}`
- `POST /appointments/{id}/check-in`
- `POST /walk-ins`

`POST /walk-ins` e o check-in aceitam `symptoms` opcionalmente para o fluxo assistido.

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

O backend calcula percentis por **tipo de atendimento**. Por padrao, `MOCKED` e excluido. Com `ALLOW_MOCKED_ESTIMATES=true`, a apresentacao calcula p50/p90 com a massa mockada e retorna `data_source=MOCKED`; isso nao valida o C1. Sem amostras elegiveis, retorna `insufficient_data`.

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
