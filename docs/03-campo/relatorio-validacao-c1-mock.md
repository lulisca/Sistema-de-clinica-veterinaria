# Relatório de validação C1-MOCKED

> **Status acadêmico do C1:** a validar. Este relatório usa dados mockados para exercitar o método e não declara coleta real.

## 1. Objetivo

Simular o fluxo completo de preparação, segmentação e análise dos dados exigidos pelo C1 sem bloquear o desenvolvimento da F1. A massa permite desenvolver telas, scripts, testes e apresentação técnica enquanto a evidência de campo permanece pendente.

## 2. Base utilizada

- 40 atendimentos mockados;
- 4 janelas simuladas, com 10 registros cada;
- 4 tipos de atendimento: consulta, exame, retorno e vacina;
- origem registrada como `MOCKED`;
- nenhuma pessoa ou animal real identificado.

Arquivos:

- `serie-mock.csv`: formato documental do Caderno;
- `janelas-mock.md`: contexto das quatro janelas mockadas;
- `backend/data/amostras_mock.csv`: formato aceito pelo importador do backend.

## 3. Resultado estatístico da massa mockada

O cálculo abaixo reproduz a interpolação linear usada em `backend/app/services/estimation.py`.

| Tipo | N | p50 (min) | p90 (min) | Média (min) |
|---|---:|---:|---:|---:|
| Consulta | 12 | 26,0 | 28,9 | 26,0 |
| Exame | 9 | 27,0 | 29,2 | 26,3 |
| Retorno | 8 | 17,5 | 19,3 | 17,4 |
| Vacina | 11 | 12,0 | 13,0 | 12,1 |

A separação confirma por que uma média global não deve representar todos os tipos: vacina e exame possuem distribuições operacionais diferentes.

## 4. Comportamento esperado no backend

O importador aceita origem `MOCKED`. Por padrao, o calculo as exclui; com `ALLOW_MOCKED_ESTIMATES=true`, elas geram p50/p90 com origem identificada.

1. a importação deve criar 40 registros mockados;
2. `GET /api/metrics/f1-readiness` não deve considerá-los prontos para calibração;
3. com o modo desligado, uma estimativa baseada apenas nesses dados retorna `insufficient_data`;
4. com o modo ligado, a estimativa retorna `data_source=MOCKED` e nao valida o C1;
4. testes isolados da lógica podem usar fixtures controladas sem representar coleta real;
5. dados reais ou retrospectivos verificáveis serão necessários para mudar o status acadêmico do C1.

Essa separação protege o sistema contra a apresentação acidental de massa mockada como calibração real.

## 5. Critérios técnicos validados pelo mock

- formato e volume da série;
- segmentação por tipo;
- cálculo de p50 e p90;
- diferença entre distribuições de atendimento;
- compatibilidade com o importador;
- rastreabilidade da origem mockada;
- preparação dos componentes de interface e relatório.

## 6. Pendências para validação acadêmica

- clínica parceira real ou alternativa formal aceita pelo professor;
- autorização e método verificáveis;
- quatro janelas reais ou registros retrospectivos autorizados;
- entrevista de 30 minutos;
- importação com origem legítima `DIRECT_OBSERVATION` ou `RETROSPECTIVE`;
- geração do relatório final de calibração e erro observado.

## 7. Conclusão

O C1-MOCKED está pronto como validação de desenvolvimento. O C1 acadêmico permanece **a validar** e não bloqueia a evolução de F1, frontend, testes, documentação ou demonstração técnica.
