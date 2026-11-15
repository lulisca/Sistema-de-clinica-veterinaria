# Relatório de calibração e avaliação — F1

**Status:** PENDENTE DE DADOS DE CAMPO

Este relatório é gerado a partir do banco atual. Ele não substitui a verificação acadêmica da coleta exigida pelo projeto.

## 1. Método implementado

- Segmentação por tipo de atendimento.
- Percentis históricos p50 e p90.
- Simulação da fila considerando capacidade de veterinários e atendimentos em andamento.
- Persistência da previsão inicial e de revisões automáticas com horário, número da revisão e evento disparador.
- Comparação entre previsão inicial e espera real até o início do atendimento.
- Indicadores: erro assinado médio, erro absoluto médio (MAE) e proporção dentro da faixa p50–p90.

## 2. Base disponível

- Amostras de observação direta/retrospectiva: **0**
- Amostras produzidas pelo sistema em operação: **0**
- Amostras sintéticas, excluídas da calibração: **0**
- Limiar técnico configurado por tipo: **3** amostras não sintéticas.

| Tipo | Amostras não sintéticas | Limiar técnico | Backend pode estimar? |
|---|---:|---:|---|
| — | 0 | 3 | Não |

## 3. Erro observado da previsão inicial

- Estimativas iniciais já avaliadas: **0**
- Erro assinado médio: **— min**
- MAE: **— min**
- Proporção dentro da faixa: **—**

| Tipo | N avaliado | Erro assinado médio (min) | MAE (min) | Dentro da faixa |
|---|---:|---:|---:|---:|
| — | 0 | — | — | — |

## 4. Critério para encerramento da calibração

Antes de declarar a F1 calibrada para a entrega, a equipe deve substituir/ complementar os dados de desenvolvimento pela série real da clínica, verificar a cobertura exigida no Caderno do Aluno e então regenerar este relatório.

O valor de `MIN_SAMPLES_FOR_ESTIMATE` é uma trava técnica do software, não uma afirmação de suficiência estatística nem substitui o mínimo acadêmico de coleta.

## 5. Evidência de revisões

As revisões de cada paciente podem ser auditadas por `GET /api/queue/{id}/estimates`. Eventos relevantes como check-in, entrada de encaixe, mudança de prioridade, início/fim de atendimento e atualização das amostras geram novas revisões automaticamente quando houver dados suficientes.
