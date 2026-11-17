# Relatorio de validacao C1-MOCKED

> **Status da entrega:** C1-MOCKED aprovado pelo GP em 2026-11-16. Este relatorio usa dados mockados para verificar o metodo e nao declara coleta, entrevista, parceria ou aprovacao externa real.

## 1. Contexto e objetivo

O planejamento original previa coleta em clinica real. Como a coleta e a entrevista nao foram executadas, o GP aprovou a substituicao por um cenario controlado `MOCKED` para que o desenvolvimento, os testes e a demonstracao da F1 fossem concluidos sem fabricar evidencia de campo.

O objetivo deste relatorio e verificar o fluxo de preparacao, segmentacao, importacao e analise dos dados adotado no C1-MOCKED.

## 2. Base utilizada

- 40 atendimentos mockados;
- 4 janelas ficticias, com 10 registros cada;
- 4 tipos de atendimento: consulta, exame, retorno e vacina;
- origem registrada como `MOCKED`;
- nenhuma pessoa, animal ou organizacao real identificada.

Arquivos relacionados:

- `serie-mock.csv`: formato documental do projeto;
- `janelas-mock.md`: contexto das quatro janelas ficticias;
- `entrevista-mock.md`: regras operacionais simuladas;
- `backend/data/amostras_mock.csv`: formato aceito pelo importador do backend.

## 3. Resultado estatistico da massa mockada

O calculo reproduz a interpolacao linear usada em `backend/app/services/estimation.py`.

| Tipo | N | p50 (min) | p90 (min) | Media (min) |
|---|---:|---:|---:|---:|
| Consulta | 12 | 26,0 | 28,9 | 26,0 |
| Exame | 9 | 27,0 | 29,2 | 26,3 |
| Retorno | 8 | 17,5 | 19,3 | 17,4 |
| Vacina | 11 | 12,0 | 13,0 | 12,1 |

A segmentacao confirma por que uma media global nao deve representar todos os tipos: vacina e exame possuem distribuicoes operacionais diferentes.

## 4. Comportamento verificado no backend

O importador aceita origem `MOCKED`. Por padrao, o calculo a exclui; com `ALLOW_MOCKED_ESTIMATES=true`, a F1 gera p50/p90 com a origem identificada.

1. a importacao cria 40 registros mockados;
2. `GET /api/metrics/f1-readiness` mantem separada a prontidao baseada em fonte aceita;
3. com o modo desligado, uma estimativa baseada apenas nesses dados retorna `insufficient_data`;
4. com o modo ligado, a estimativa retorna `data_source=MOCKED`;
5. fixtures controladas podem testar a logica sem representar coleta real.

Essa separacao protege o sistema contra a apresentacao acidental da massa mockada como calibracao clinica real.

## 5. Criterios tecnicos atendidos

- formato e volume da serie;
- quatro janelas e quatro tipos de atendimento;
- segmentacao por tipo;
- calculo conferido de p50 e p90;
- diferenca entre distribuicoes de atendimento;
- compatibilidade com o importador;
- rastreabilidade da origem `MOCKED`;
- preparacao das telas, scripts, testes e relatorios da F1.

## 6. Limites declarados

- nao houve autorizacao ou participacao de clinica real;
- nao houve observacao, entrevista ou registro retrospectivo real;
- os resultados nao representam desempenho clinico observado;
- o C1-MOCKED e uma decisao do GP para a entrega atual, nao uma aprovacao atribuida ao professor.

Se o professor autorizar uma etapa real posterior, a equipe podera substituir esta base por dados `DIRECT_OBSERVATION` ou `RETROSPECTIVE`, com metodo, datas e evidencias verificaveis. Essa possibilidade nao deixa o pacote atual incompleto.

## 7. Conclusao

O C1-MOCKED esta concluido para desenvolvimento, testes e demonstracao da versao congelada em 16/11/2026. A massa sustenta tecnicamente a F1 com origem identificada e preserva a transparencia de que nenhuma coleta real foi executada.
