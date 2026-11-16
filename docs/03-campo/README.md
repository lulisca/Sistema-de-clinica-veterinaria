# Dado de campo (clínica real)

Esta etapa não é dispensável: sem o dado, as três features operam sobre valores arbitrados. Dado de campo não verificável (janela não realizada, série sem método declarado, entrevista não registrada) zera o critério C1.

## Mínimo exigido

| Medida | Mínimo |
|---|---|
| Duração do atendimento por tipo (consulta, vacina, retorno, exame, banho e tosa, emergência) | 40 atendimentos cronometrados, cobrindo ao menos 4 tipos |
| Fluxo de chegada (chegada, início do atendimento e saída) | as mesmas 40 observações |
| Composição por espécie e motivo | contagem nas janelas observadas |
| Taxa de ausência e de atraso | registro nas janelas |
| Regras operacionais vigentes | entrevista de 30 min com o responsável, registrada |

Mínimo de **4 janelas de observação de 1 hora, em dias e horários distintos.** Quatro janelas no mesmo dia e horário enviesam a série e são rejeitadas.

Se a clínica não gerar o volume, complete com registro retrospectivo da agenda e declare no relatório o que é observação direta e o que é retrospectivo. Não distinguir as duas origens é falha grave de método.

## Protocolo de coleta

1. Só comece depois da autorização formal da clínica (carta providenciada pela coordenação, portada em campo).
2. Ninguém é identificado: nem tutores, nem funcionários. Nome do animal é dispensável; use código sequencial.
3. Observação não participante: sem interromper o atendimento, sem perguntas durante o expediente, sem foto de telas ou fichas.
4. A entrevista com o responsável é agendada em separado, fora do horário de pico.
5. O objeto de estudo é a fila e a alocação de recursos, nunca o desempenho de funcionários.
6. Recusa de acesso é registrada no caderno de bordo, sem insistência.

## Arquivos desta pasta

| Arquivo | O que é |
|---|---|
| `serie-de-atendimentos.csv` | Uma linha por atendimento observado (Anexo D). Separador `;`. |
| `janelas.md` (a criar) | Contexto de cada janela, preenchido uma vez por janela. |
| `entrevista.md` (a criar) | Registro da entrevista com o responsável. |
| `relatorio-calibracao-f1.md` (a criar) | Resultado da calibração da F1 sobre esta série. |
| `AVISO-DADOS-MOCKADOS.md` | Limites de uso da clinica e dos dados mockados. |
| `serie-mock.csv` | Massa `MOCKED` com 40 casos, sem valor de evidencia de campo. |
| `janelas-mock.md` | Quatro janelas mockadas para desenvolvimento. |
| `relatorio-validacao-c1-mock.md` | Resultado técnico da massa mockada e pendências do C1. |

### Colunas de `serie-de-atendimentos.csv`

`janela;codigo;especie;porte;motivo;chegada;inicio;fim;espera_min;atendimento_min;reativo;origem;obs`

A coluna `origem` foi acrescentada ao Anexo D porque o Caderno exige distinguir observação direta de registro retrospectivo. Valores: `DIRECT_OBSERVATION` ou `RETROSPECTIVE` (os mesmos usados pelo backend).

O script de importação do backend (`backend/scripts/import_samples.py`, na branch `feature/backend-f1`) usa outro layout: `appointment_type,duration_minutes,source,observed_at,note`. Para alimentar a F1 é preciso converter a série para esse formato.

### Contexto de cada janela (`janelas.md`)

Preencher uma vez por janela: data, dia da semana, horário de início e fim, número de profissionais em atendimento, salas disponíveis e condição observada da recepção.

## Roteiro da entrevista com o responsável

Agendada fora do horário de pico, com 30 minutos, registrada em ata.

1. Qual o critério atual para definir a precedência no atendimento?
2. Qual o procedimento diante da chegada de uma emergência?
3. Como é feita a separação entre felinos e cães? E no caso de animal reativo?
4. Há situação em que o animal não pode permanecer na recepção?
5. Qual a duração típica de cada modalidade de atendimento?
6. Qual a frequência de ausência em agendamentos? Qual o procedimento adotado?
7. Como o tutor é informado hoje do início do seu atendimento?
8. Qual o principal fator de perturbação da rotina da recepção?
9. Havendo um sistema, que função ele NÃO poderia exercer?

A pergunta 9 costuma ser a de maior valor informativo.
