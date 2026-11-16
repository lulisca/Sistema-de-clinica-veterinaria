# Campo e calibracao F1

> **Status em 2026-11-16:** pacote C1-MOCKED aprovado pelo GP para a entrega atual. A coleta e a entrevista em clinica real estavam previstas originalmente, mas nao foram executadas. Os artefatos desta pasta usam somente cenario e dados `MOCKED` identificados.

## Decisao adotada

O planejamento original previa 40 atendimentos coletados em uma clinica real, distribuidos em quatro janelas, acompanhados de entrevista com o responsavel. Como essa etapa nao foi viabilizada no prazo, o GP aprovou a substituicao por:

- Clinica Vila Nova EC como cenario ficticio;
- 40 atendimentos `MOCKED`;
- quatro janelas `MOCKED`;
- entrevista `MOCKED`;
- relatorios tecnicos de validacao e calibracao identificados como C1-MOCKED.

Essa decisao permite desenvolver, testar e demonstrar a F1 sem apresentar simulacao como coleta real. O C1-MOCKED e o criterio adotado para a versao congelada em 16/11/2026, mas nao representa aprovacao do professor, parceria com clinica, observacao de campo ou validacao externa.

## Conteudo da pasta

| Arquivo | Finalidade na versao atual |
|---|---|
| `AVISO-DADOS-MOCKADOS.md` | Declara os limites academicos e operacionais do cenario `MOCKED` |
| `serie-mock.csv` | Massa documental com 40 atendimentos `MOCKED` |
| `janelas-mock.md` | Contexto ficticio das quatro janelas |
| `entrevista-mock.md` | Respostas simuladas usadas para definir regras de desenvolvimento |
| `relatorio-validacao-c1-mock.md` | Verificacao tecnica do C1-MOCKED |
| `relatorio-calibracao-f1-mocked.md` | Percentis p50/p90 calculados sobre a massa `MOCKED` |
| `serie-de-atendimentos.csv` | Modelo vazio preservado somente para eventual coleta real futura autorizada |

O arquivo equivalente usado pelo backend e `backend/data/amostras_mock.csv`, no formato aceito pelo importador. Ambos representam a mesma distribuicao de 40 atendimentos.

## Cobertura do C1-MOCKED

| Medida | Cobertura registrada |
|---|---|
| Volume | 40 atendimentos |
| Janelas | 4 janelas ficticias com 10 registros cada |
| Tipos | Consulta, exame, retorno e vacina |
| Segmentacao | Especie, porte, motivo e indicador de animal reativo |
| Tempos | Chegada, inicio, fim, espera e duracao do atendimento |
| Origem | `MOCKED` em todos os registros |
| Identificacao real | Nenhuma pessoa, animal ou organizacao real identificada |

## Uso pela F1

Por padrao, o backend exclui amostras `MOCKED` da estimativa. Para a apresentacao tecnica, `ALLOW_MOCKED_ESTIMATES=true` permite calcular p50/p90 e a resposta permanece identificada com `data_source=MOCKED`. Com a opcao desabilitada e sem amostras aceitas, a API retorna `insufficient_data`.

## Regra para eventual substituicao futura

Se o professor autorizar uma etapa real posterior, a equipe podera usar `serie-de-atendimentos.csv` como modelo e substituir os artefatos simulados por autorizacao, datas, janelas, entrevista e resultados verdadeiros. Essa possibilidade nao constitui atividade em aberto da versao atual e nao autoriza retroagir datas ou remover a identificacao `MOCKED` das evidencias existentes.
