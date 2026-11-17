# Relatório técnico da F1

**Status:** C1-MOCKED presente e aprovado pelo GP para a entrega de 2026-11-16.

Este documento resume a base disponível para a demonstração. Ele não declara coleta, calibração clínica ou aprovação externa real.

## Método implementado

- segmentação por tipo de atendimento;
- percentis históricos p50 e p90;
- simulação da fila conforme ordem e capacidade;
- revisões automáticas e versionadas;
- comparação entre previsão e espera real;
- erro assinado, MAE e proporção dentro da faixa.

## Base da entrega

- 40 amostras `MOCKED`;
- quatro tipos de atendimento;
- quatro janelas fictícias;
- uso habilitado por `ALLOW_MOCKED_ESTIMATES=true`;
- resposta identificada por `data_source=MOCKED`.

Os percentis conferidos e os limites da massa estão em `docs/03-campo/relatorio-calibracao-f1-mocked.md` e `docs/03-campo/relatorio-validacao-c1-mock.md` na raiz do repositório.

## Comportamento esperado

- com o modo `MOCKED` habilitado, a F1 calcula p50/p90 da massa da apresentação;
- com o modo desabilitado e sem outra origem elegível, retorna `insufficient_data`;
- amostras `SYSTEM`, `DIRECT_OBSERVATION` ou `RETROSPECTIVE` permanecem separadas pela origem;
- nenhuma métrica da massa `MOCKED` deve ser atribuída a uma clínica real.

## Avaliação em operação

As revisões podem ser auditadas por `GET /api/queue/{id}/estimates`. Quando atendimentos são iniciados, o sistema grava a espera real e calcula os erros disponíveis. O gerador `python scripts/generate_f1_report.py` reflete o conteúdo atual do banco e identifica se a base é `MOCKED`, real ou ausente.

Uma coleta real futura, se autorizada, deverá gerar um novo relatório com origem, datas e evidências verificáveis, sem alterar retroativamente o C1-MOCKED.
