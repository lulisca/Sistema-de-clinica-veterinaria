# F1 — Implementação técnica

## Estado do software

A implementação de software da F1 está fechada para desenvolvimento e integração. A única parte que não pode ser concluída sem a clínica é a **calibração/validação com a série real exigida pelo projeto**.

## Fluxo

1. Durações são registradas por tipo de atendimento.
2. Amostras `SYNTHETIC` podem apoiar desenvolvimento, mas não entram na estimativa.
3. O backend calcula p50 e p90 de cada tipo envolvido na fila.
4. A espera é simulada considerando a ordem da fila, veterinários disponíveis e atendimentos em andamento.
5. Cada previsão é persistida como revisão numerada.
6. Mudanças relevantes da fila geram novas revisões automaticamente.
7. Ao iniciar o atendimento, todas as revisões daquele paciente recebem a espera real e seus erros.
8. O encerramento registra a duração real como amostra `SYSTEM` e atualiza as previsões restantes.

## Eventos que recalculam automaticamente

- `CHECK_IN`
- `WALK_IN`
- `PRIORITY_CHANGED`
- `SERVICE_STARTED`
- `SERVICE_FINISHED`
- `SAMPLES_UPDATED`
- `VETERINARIAN_CAPACITY_CHANGED`

Também existe recálculo manual para inspeção/teste por `POST /api/queue/{id}/estimate`.

## Evidências disponíveis

- Histórico de revisões: `GET /api/queue/{id}/estimates`
- Métricas globais da previsão inicial: `GET /api/metrics/wait-estimates`
- Métricas por tipo: `GET /api/metrics/wait-estimates/by-type`
- Prontidão da base por tipo: `GET /api/metrics/f1-readiness`
- Relatório Markdown: `python scripts/generate_f1_report.py`

## Sobre o mínimo de amostras

`MIN_SAMPLES_FOR_ESTIMATE` é configurável e funciona como uma **trava técnica**: abaixo dela, o backend retorna `insufficient_data` em vez de inventar um número. O valor não deve ser apresentado como comprovação estatística nem como substituto dos requisitos de coleta do projeto.

## O que permanece externo ao software

- Inserir a série real da clínica.
- Conferir que a coleta satisfaz a cobertura acadêmica exigida.
- Regenerar o relatório com esses dados.
- Interpretar os indicadores e sustentar, no relatório/apresentação, por que o método ficou adequado ou quais limitações restaram.
