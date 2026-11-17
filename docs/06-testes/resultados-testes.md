# Resultados de testes

> **Atualizado em:** 2026-11-16. Consolida a revisao final, o CT19 local, a publicacao do PR #20 e o CT20 externo.

## Resultado consolidado

| Verificacao | Resultado | Evidencia/observacao |
|---|---|---|
| Compilacao Python | Aprovada (15/11) | `python -m compileall -q backend` executado sem erro |
| Quantidade de testes escritos | 55 na versao publicada | Eram 30 no commit `71ab334`, 43 no commit `3e2e853` e 49 depois do PR #12; publicacao e fila autenticada do tutor acrescentaram 6 casos |
| Pytest | Aprovado | Historico preservado; resultado atual: `55 passed in 54.50s` |
| Cobertura do backend | 85% (16/11) | `pytest-cov` com cobertura de linhas e desvios sobre `backend/app`, commit `71ab334`. Detalhe na secao [Cobertura do backend](#cobertura-do-backend) |
| 40 registros mockados | Aprovado | CSVs possuem 40 linhas de dados e origem `MOCKED` |
| Quatro tipos | Aprovado para massa mockada | consulta 12, exame 9, retorno 8, vacina 11 |
| Quatro janelas | Aprovado para massa mockada | 10 registros por janela |
| Integracao frontend | Integrado na `development` | PR #2 (`feature/front-telas`), merge em 15/11 |
| Build do frontend | Aprovado (16/11) | `npm ci` e `npm run build`: TypeScript sem erro, 52 modulos. Repetido no commit `3e2e853` com o mesmo resultado |
| Lint do frontend | Aprovado (16/11) | `npm run lint` (oxlint) sem erro. Repetido no commit `3e2e853` |
| Testes automatizados do frontend | Inexistentes | O frontend nao tem testes automatizados; a interface e verificada pelos casos manuais CT21-CT26 |
| Jornada ponta a ponta (CT19), local | Aprovado com ressalvas (16/11) | Commit `3e2e853`, backend e frontend rodando juntos na maquina local. Jornada de cadastro/check-in ate a conclusao passou sem inconsistencia de estado; 3 defeitos abertos (1 medio, 2 baixos). Detalhe na secao [Jornada ponta a ponta local (CT19)](#jornada-ponta-a-ponta-local-ct19) |
| Smoke externo (CT20) | Aprovado (16/11) | Commit `0fd8c67`: frontend, rota SPA, Swagger, health, CORS, login e leitura autenticada da fila por HTTPS |

## Comandos da verificacao atual

```powershell
py -m pytest -q .\backend\tests
```

Resultado:

```text
55 passed in 54.50s
```

O warning foi exclusivamente sobre a impossibilidade de criar o cache do pytest e nao representa falha da aplicacao.

Para validar o frontend em ambiente com acesso ao registro npm:

```powershell
cd frontend
npm ci
npm run build
npm run lint
```

## Cobertura historica

A cobertura de **85%** foi medida em 16/11/2026 no commit `71ab334`, quando a suite possuia 30 testes, usando Python 3.11.6 e `pytest-cov` 7.1.0. Essa medicao continua valida como evidencia historica daquele commit, mas nao e atribuida automaticamente a suite atual de 55 testes.

| Medicao | Testes | Cobertura | Situacao |
|---|---:|---:|---|
| Commit `71ab334` | 30 aprovados | 85% de linhas/desvios em `backend/app` | Historica e reproduzivel |
| Versao atual | 55 aprovados | Nao recalculada nesta sessao | Nao declarar percentual atual sem nova medicao |

## Evolucao da suite

Os 25 testes adicionados depois da medicao historica cobrem:

- cadastro autenticado do tutor;
- animal proprio e bloqueio de animal de outro tutor;
- bloqueio de entrada ativa duplicada;
- email duplicado e separacao de papeis;
- bootstrap da equipe com conta de tutor existente;
- reordenacao autorizada da fila;
- bloqueio da recepcao;
- conflitos `409` por lista ou versao desatualizada;
- emergencia fora da reordenacao;
- nova entrada no fim da fila;
- recalculo unico da F1 apos reordenacao.
- bloqueio de login para usuario inativo;
- rejeicao de campos extras nos payloads do tutor;
- bloqueio explicito de prioridade para tutor e recepcao;
- tratamento de corrida de email duplicado como `409`.
- normalizacao da URL Neon para o driver `psycopg` sem alterar outras URLs;
- listagem do atendimento ativo somente para o tutor proprietario;
- exclusao de atendimentos concluidos da lista do tutor;
- bloqueio da rota do tutor para perfis internos.

## Registro de execucoes

| Data | Commit/versao | Ambiente | Comando | Resultado |
|---|---|---|---|---|
| 2026-11-15 | versao anterior | Windows, Python 3.13 | `pytest -q` | 30 aprovados |
| 2026-11-16 | `71ab334` | Windows, Python 3.11.6 | pytest com cobertura | 30 aprovados; 85% |
| 2026-11-16 | frontend anterior a reordenacao | Windows, Node | build e lint | aprovados |
| 2026-11-16 | `5c8bb16` | Windows, Python 3.13 | `py -m pytest -q .\backend\tests` | 43 aprovados em 44.13s |
| 2026-11-16 | `5c8bb16` | Sandbox sem cache npm | `npm ci`, build e lint | dependencias indisponiveis; codigo nao executado |
| 2026-11-16 | PR #12 aplicado sobre `main` | Windows, Python 3.13 | `py -m pytest -q backend\tests -p no:cacheprovider` | 49 aprovados em 55.86s |
| 2026-11-16 | `0fd8c67` | Windows, Python 3.13 | `py -m pytest -q backend\tests -p no:cacheprovider` | 55 aprovados em 54.50s |
| 2026-11-16 | `0fd8c67` | frontend sem `node_modules` local | `npm run build` e `npm run lint` | nao executados: `tsc` e `oxlint` ausentes; build publicado respondeu por HTTPS |

Ficam sem teste os casos de borda: lista vazia, uma unica amostra, amostras descartadas no calculo e o metodo `_mixed`.

## Smoke externo publicado (CT20)

Execucao nao destrutiva sobre a versao `0fd8c67`, publicada na Vercel com PostgreSQL Neon.

| Verificacao | Resultado |
|---|---|
| Frontend `https://clinica-veterinaria-mocha.vercel.app` | `200 OK` |
| Rota SPA `/recepcao/login` acessada diretamente | `200 OK` |
| Swagger da API | `200 OK` |
| `/api/health` | `200 OK`, corpo `{"status":"ok"}` |
| `/openapi.json` | `200 OK` |
| CORS | origem exata do frontend aceita pela API |
| Login da recepcao | `200 OK`, perfil `RECEPTION`; token nao registrado |
| Leitura autenticada da fila | `200 OK`, banco publicado retornou uma entrada |

O CT20 confirma acesso externo, roteamento SPA, API, CORS, autenticacao e leitura no PostgreSQL Neon. Os fluxos mutaveis F1/F2/F3 nao foram repetidos na base publicada durante este smoke; permanecem cobertos pela suite automatizada e pelo CT19 local.

## Jornada ponta a ponta local (CT19)

Execucao **local** distinta do CT20 externo, posteriormente aprovado na publicacao Vercel/Neon.

### Identificacao

| Item | Valor |
|---|---|
| Data/hora | 2026-11-16, 19:59 a 20:01 (horario de Brasilia, UTC-3) |
| Branch/commit | `development`, commit `3e2e853` ("Merge pull request #11"), sem alteracao de codigo |
| Sistema | Windows 11 Enterprise, Docker 29.4.0 |
| Backend | `docker compose` de `backend/` (projeto isolado `e2e`, volume novo): API em `python:3.12-slim` (Python 3.12.16, FastAPI 0.163.1, SQLAlchemy 2.1.9) e PostgreSQL 17.11 |
| Variaveis da API | as do `docker-compose.yml` mais `ALLOW_MOCKED_ESTIMATES=true`, `MIN_SAMPLES_FOR_ESTIMATE=3`, `LOCATION_RETENTION_MINUTES=60` e `DEFAULT_FIXED_NOTICE_MINUTES=20` (valores de demonstracao) |
| Frontend | `npm run dev` (Vite 8.3.8, Node 24.14.1) em `http://localhost:3000`, com `.env.local` copiado do `.env.example` |
| Navegador | Microsoft Edge 157 sem janela, controlado por `playwright-core` 1.49.1. Recepcao em 1366x900; tutor em 390x844 (celular) com localizacao simulada a cerca de 300 m da posicao da clinica do `.env.example` |
| Massa | 1 usuario `RECEPTION` ficticio criado por `POST /auth/bootstrap`; recursos `Vet E2E` (veterinario), `Sala 1` e `Isolamento` criados por `POST /resources`; 40 amostras de `data/amostras_mock.csv` importadas com `scripts/import_samples.py` (todas `MOCKED`). Nenhum dado pessoal: tutor e animal so com codigos `T-E2E-*` e `AN-E2E-*` |

### Cenario A: agendamento, check-in e atendimento completo

Tudo pela interface, com conferencia na API e no banco ao final.

| Passo | Acao | Resultado |
|---|---|---|
| P0 | Abrir `/recepcao/fila` sem login | Aprovado: redireciona para `/recepcao/login` (CT25) |
| P1 | Login da recepcao | Aprovado: abre a fila vazia |
| P2 | Cadastro: tutor `T-E2E-01`, animal `AN-E2E-01` (cao), consulta, `Vet E2E`, 30 min | Aprovado: "AN-E2E-01 agendado para 20:00. Faca o check-in quando chegar." |
| P3 | Check-in do agendamento | Aprovado: "Check-in feito: animal nº 1 entrou na fila." e link do tutor exibido |
| P4 | Fila da recepcao | Aprovado: paciente em 1º, "Aguardando", faixa "ate 1 min", revisao 1 |
| P5 | Tutor abre o link no celular e toca em "Permitir" | Aprovado: "1º na fila, voce e o proximo", espera estimada com selo "dados de teste" |
| P6 | Recepcao abre o detalhe e toca em "Chamar" | Aprovado: estado `CALLED`, aviso `SIMULATOR` criado |
| P7 | Tutor atualiza, ve "E a sua vez!" e toca em "Estou voltando" | Aprovado: estado `RETURNING`, aviso `CONFIRMED` |
| P8 | Recepcao toca em "Iniciar" | Aprovado: estado `IN_SERVICE`, espera real e erro gravados na revisao |
| P9 | Recepcao toca em "Finalizar" | Aprovado: "Atendimento de Animal nº 1 finalizado." |
| P10 | Tutor atualiza | Aprovado: "Concluido, atendimento concluido" |
| P11 | Abrir Indicadores | Aprovado: 1 previsao avaliada, erro assinado +0,3 min, historico do dia com o paciente |

Conferencia apos o cenario A:

- fila `COMPLETED` com `checked_in_at`, `called_at`, `started_at` e `finished_at` preenchidos e em ordem;
- agendamento `COMPLETED` (regra de `finish` que o pytest nao cobre, ver acima);
- revisao inicial `CHECK_IN` com `actual_wait_minutes`, erro assinado e erro absoluto gravados;
- nova amostra `SYSTEM` de consulta criada pelo `finish` (consulta passou de 12 para 13 amostras);
- os tres `POST /public/status/{token}/location` levaram somente `{"moment", "consent_given", "travel_minutes"}`, sem latitude ou longitude (CT23). A tabela `location_snapshots` nao tem coluna de coordenada;
- trilha de auditoria com `CREATE` (tutor, animal, agendamento), `CHECK_IN`, 3 `LOCATION_SNAPSHOT`, `NOTIFICATION_SIMULATED`, `CONFIRM_RETURN`, `START` e `FINISH`;
- nenhum erro no console do navegador nas duas janelas; todas as chamadas a API responderam 2xx.

### Cenario B: dois encaixes na mesma fila

Para nao validar so a fila de um paciente (que tem faixa 0-0), dois encaixes (`AN-E2E-02` e `AN-E2E-03`, consulta, `Vet E2E`) foram feitos pela aba "Encaixe" e atendidos em sequencia pelo detalhe do caso.

| Verificacao | Resultado |
|---|---|
| Ordem na fila | Aprovado: chegada mais antiga em 1º |
| Faixa do 2º paciente | Aprovado: 26-29 min (p50 26,0; p90 28,8); 1º paciente "ate 1 min" |
| Revisoes do 2º paciente | Aprovado: revisao 1 `WALK_IN`, revisao 2 `SERVICE_STARTED`, revisao 3 `SERVICE_FINISHED` (faixa vai a 0-0 quando ele passa a ser o proximo) |
| Conclusao | Aprovado: os dois terminam `COMPLETED`; sem erro no console |

Os erros de previsao deste cenario (por exemplo, 26 min previstos e 0,15 min reais) **nao medem a F1**: o roteiro automatizado atende cada paciente em segundos. Os indicadores do banco local servem so para ver que o calculo e gravado.

### Defeitos encontrados

| ID | Severidade | Frente | Descricao | Passos | Esperado | Obtido | Evidencia |
|---|---|---|---|---|---|---|---|
| E2E-01 | Medio | G1 (API) | `POST /queue/{id}/finish` grava qualquer duracao como amostra `SYSTEM` elegivel para a estimativa, sem filtro de plausibilidade | Iniciar e finalizar um atendimento em poucos segundos (por exemplo, clique errado em "Iniciar" seguido de "Finalizar") | Duracao implausivel nao entra na base da F1, ou entra marcada para revisao | Amostra `SYSTEM` de 0,1 min gravada; as estimativas seguintes passaram de `data_source=MOCKED` para `MIXED` e usaram essa amostra. Com `ALLOW_MOCKED_ESTIMATES=false` ela tambem entraria no calculo oficial. Contorno: apagar a amostra no banco | `backend/app/api/router.py`, funcao `finish_service` (`duration=max(.1, ...)`); consulta em `service_duration_samples` |
| E2E-02 | Baixo | G2 (tela) | No detalhe de um caso concluido, "Decisao de retorno" diz "Sem estimativa: faltam amostras deste tipo de atendimento" e mantem "Avaliar e avisar" e "Registrar deslocamento" ativos | Finalizar um atendimento e olhar o detalhe do caso | Mensagem de caso encerrado, sem acoes de aviso | A API responde `mode=NO_ESTIMATE` com `reason="Queue entry is COMPLETED"`, mas a tela traduz qualquer `NO_ESTIMATE` como falta de amostras (havia 13 amostras de consulta) | [11-detalhe-concluido.png](evidencias/ct19-2026-11-16/11-detalhe-concluido.png); `frontend/src/paginas/recepcao/Detalhe.tsx`, linha 35 |
| E2E-03 | Baixo (a triar) | G1 (F1) | Quem e o proximo com veterinario livre recebe faixa 0-0; qualquer espera real positiva fica "fora da faixa" | Check-in com a fila vazia e chamar o paciente | Faixa que possa conter a espera real, ou regra declarada para esse caso | p50 = p90 = 0,0; espera real 0,3 min; `inside_range=false`. A taxa "dentro da faixa" dos indicadores fica rebaixada por um caso em que a previsao acertou na pratica | [07-detalhe-chamado.png](evidencias/ct19-2026-11-16/07-detalhe-chamado.png), [13-indicadores.png](evidencias/ct19-2026-11-16/13-indicadores.png) |

Nenhum defeito critico ou alto. Os tres devem ir para triagem das frentes antes do congelamento.

Observacoes que nao sao defeito:

- a fila mostra "Animal nº 1" mesmo com nome informado no cadastro; e limitacao ja registrada em `frontend/README.md` (a fila da API nao devolve nome nem codigo do animal);
- chamado com p50 = 0, o tutor a 1 min da clinica ve "Nao da tempo, atraso de 1 min" (folga -1,0 min com margem de 10 min). Tela do tutor e detalhe da recepcao mostram o mesmo calculo, entao nao ha inconsistencia.

### Evidencias

Capturas de tela em [evidencias/ct19-2026-11-16/](evidencias/ct19-2026-11-16/):

| Arquivo | Conteudo |
|---|---|
| `03-checkin.png` | Cadastro com agendamento e check-in feitos, link do tutor |
| `04-fila-com-paciente.png` | Fila da recepcao com o paciente aguardando |
| `06-tutor-na-fila.png` | Tela do tutor: posicao e faixa com selo "dados de teste" |
| `07-detalhe-chamado.png` | Detalhe com paciente chamado, aviso simulado e decisao de retorno |
| `08-tutor-sua-vez.png` | Tela do tutor: "E a sua vez!" |
| `10-detalhe-em-atendimento.png` | Detalhe em atendimento, previsto x realizado |
| `11-detalhe-concluido.png` | Detalhe concluido (mostra o E2E-02) |
| `12-tutor-concluido.png` | Tela do tutor: atendimento concluido |
| `13-indicadores.png` | Indicadores apos a conclusao |
| `14-fila-dois-encaixes.png` | Cenario B: dois encaixes com faixas diferentes |

O roteiro automatizado ficou fora do repositorio (nao ha Playwright no projeto). Para repetir a mao, siga os passos P0-P11 com o backend e o frontend nas configuracoes acima.

## Modelo de registro

| Data/hora | Commit | Ambiente | Comando | Passou | Falhou | Observacao |
|---|---|---|---|---:|---:|---|
| 2026-11-15 | anterior ao merge do frontend | Windows, PowerShell 5.1, Python 3.13 | `pytest -q` | 30 | 0 | Registrado no pacote de 15/11 |
| 2026-11-16 | `1bb75cb` | Windows 11, Node, `frontend/` | `npm run build` e `npm run lint` | build e lint | 0 | Sem erro |
| 2026-11-16 | `1bb75cb` | Windows 11, Python 3.13.14 | `pytest -q -p no:cacheprovider backend/tests` | 0 | 0 | Nao executou: DLL do SQLAlchemy bloqueada pela politica do Windows. Reexecutar via Docker ou em outra maquina |
| 2026-11-16 | `71ab334` | Windows 11, Python 3.11.6, venv limpo com `requirements.txt` + `pytest-cov` | `pytest -v -p no:cacheprovider --cov=app --cov-branch --cov-report=term-missing tests` | 30 | 0 | `30 passed in 19.22s`, cobertura total 85%. Aviso de deprecacao do `httpx` no `TestClient`, sem efeito no resultado |
| 2026-11-16 | `3e2e853` | Docker, `python:3.12-slim` (Python 3.12.16), copia limpa de `backend/` | `pytest -q -p no:cacheprovider tests` | 43 | 0 | `43 passed, 1 warning in 22.28s` |
| 2026-11-16 | `3e2e853` | Windows 11, Node 24.14.1, `frontend/` | `npm ci`, `npm run build` e `npm run lint` | build e lint | 0 | Sem erro; 52 modulos |
| 2026-11-16 19:59-20:01 | `3e2e853` | Local: API e PostgreSQL 17 no Docker, frontend no Vite, Edge 157 automatizado | CT19 pela interface, cenarios A (12 passos) e B (2 encaixes) | 16 | 0 | Aprovado com ressalvas: defeitos E2E-01 (medio), E2E-02 e E2E-03 (baixos). Execucao local, nao e smoke externo |
| 2026-11-16 | `0fd8c67` | Vercel + Neon por HTTPS | CT20 nao destrutivo: frontend, SPA, API, health, CORS, login e fila | 8 | 0 | Aprovado; fluxos mutaveis nao foram repetidos na base publicada |
