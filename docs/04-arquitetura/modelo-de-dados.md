# Modelo de dados consolidado

> **Estado em 2026-11-16:** conferido contra modelos, migrations e contrato do backend. O diagrama ER completo permanece em `backend/docs/MODELO_DADOS.md`.

## Agregados principais

| Agregado | Entidades | Finalidade |
|---|---|---|
| Identidade | User, Tutor, Animal | Separar autenticacao, perfil e animais |
| Agenda/fila | Appointment, QueueEntry | Registrar agenda, chegada, sintomas, prioridade e estados |
| F1 | ServiceDurationSample, WaitEstimate | Calcular por tipo, versionar previsoes e medir erro |
| F2 | LocationSnapshot, Notification | Guardar deslocamento minimizado, aviso e falha |
| F3/recursos | Resource, ResourceAllocation | Impedir uso simultaneo de recurso exclusivo |
| Seguranca | User, AuditEvent | Aplicar perfis e registrar acoes criticas |

## Relacoes relevantes

- `User` pode autenticar um perfil `Tutor`; tutores cadastrados pela recepcao podem existir sem conta propria.
- `Tutor` possui animais e agendamentos.
- `QueueEntry` pode vir de agendamento ou encaixe e guarda sintomas apenas para a equipe.
- A entrada recebe revisoes, snapshots, notificacoes e alocacoes.
- Reordenacao atualiza `priority_level`; emergencia permanece separada e no topo.

## Invariantes

- `public_token` e unico e nao revela ID sequencial.
- contato e sintomas nao aparecem no status publico.
- emergencia depende de veterinario/admin e nao e inferida pelo sistema.
- recurso exclusivo nao possui duas alocacoes ativas.
- coordenadas nao sao persistidas.
- previsoes sao revisoes imutaveis.
- `MOCKED` e excluido por padrao; com `ALLOW_MOCKED_ESTIMATES=true`, alimenta a demonstracao com `data_source` identificado.
- mudanca de esquema usa Alembic.
- segunda entrada ativa do mesmo animal pelo autoatendimento e rejeitada.

## Limites adotados

- atraso, falta e reinsercao automatica nao foram arbitrados nesta versao;
- a precedencia usa emergencia, `priority_level`, check-in e ID;
- prioridade muda somente por perfil autorizado ou reordenacao completa;
- exportar imagem do diagrama e opcional quando Mermaid estiver disponivel.

Esses limites sao decisoes da versao e nao indicam modelo incompleto.
