# Modelo de dados consolidado

O diagrama ER completo e as decisoes de modelagem estao em `backend/docs/MODELO_DADOS.md` e fazem parte deste entregavel.

## Agregados principais

| Agregado | Entidades | Finalidade |
|---|---|---|
| Cadastro | Tutor, Animal | Identificar o atendimento sem expor dados no acesso publico |
| Agenda/fila | Appointment, QueueEntry | Programar, registrar chegada e controlar estados |
| F1 | ServiceDurationSample, WaitEstimate | Calibrar por tipo, versionar previsoes e medir erro |
| F2 | LocationSnapshot, Notification | Guardar deslocamento minimizado, aviso e tratamento de falha |
| F3/recursos | Resource, ResourceAllocation | Segregar e impedir uso simultaneo de recurso exclusivo |
| Seguranca | User, AuditEvent | Perfil interno e trilha de acoes criticas |

## Invariantes

- `public_token` e unico e nao revela ID sequencial ao tutor.
- emergencia nao e inferida pelo sistema.
- recurso exclusivo nao possui duas alocacoes ativas.
- coordenadas precisas nao sao persistidas.
- previsoes sao revisoes imutaveis para comparacao historica.
- `MOCKED` nao participa da estimativa calibrada.
- mudanca de esquema em banco existente usa Alembic.

## Pendencias de validacao

- confirmar regras de atraso/falta e se exigem novos campos;
- confirmar escala final de prioridade F3;
- revisar o modelo apos integrar o frontend;
- anexar diagrama exportado se o ambiente de entrega nao renderizar Mermaid.
