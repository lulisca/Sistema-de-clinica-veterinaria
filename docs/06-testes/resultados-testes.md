# Resultados de testes

> **Atualizado em:** 2026-11-16.

| Verificacao | Resultado | Evidencia/observacao |
|---|---|---|
| Compilacao Python | Aprovada (15/11) | `python -m compileall -q backend` executado sem erro |
| Quantidade de testes escritos | 30 | Arquivos `backend/tests/test_api.py` e `test_f2.py` |
| Pytest | Aprovado (15/11 e 16/11) | 15/11: `30 passed in 30.65s`. 16/11, primeira tentativa: parou no import do SQLAlchemy (DLL `_immutabledict_cy` bloqueada pela politica do Windows). 16/11, segunda maquina, commit `71ab334`: `30 passed in 19.22s` |
| Cobertura do backend | 85% (16/11) | `pytest-cov` com cobertura de linhas e desvios sobre `backend/app`, commit `71ab334`. Detalhe na secao [Cobertura do backend](#cobertura-do-backend) |
| 40 registros mockados | Aprovado | CSVs possuem 40 linhas de dados e origem `MOCKED` |
| Quatro tipos | Aprovado para massa mockada | consulta 12, exame 9, retorno 8, vacina 11 |
| Quatro janelas | Aprovado para massa mockada | 10 registros por janela |
| Integracao frontend | Integrado na `development` | PR #2 (`feature/front-telas`), merge em 15/11 |
| Build do frontend | Aprovado (16/11) | `npm ci` e `npm run build`: TypeScript sem erro, 52 modulos, build em 2,04 s |
| Lint do frontend | Aprovado (16/11) | `npm run lint` (oxlint) sem erro |
| Testes automatizados do frontend | Inexistentes | O frontend nao tem testes automatizados; a interface e verificada pelos casos manuais CT21-CT26 |
| Jornada ponta a ponta (CT19) | Pendente | Precisa de backend e frontend rodando juntos |
| Smoke externo | Pendente | Nenhuma URL publicada registrada |

## Comando validado

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
pytest -q
```

Resultado registrado no Windows PowerShell 5.1 com Python 3.13. Reexecutar apos qualquer alteracao no backend.

Para medir a cobertura, instale `pytest-cov` no mesmo ambiente (ele nao esta no `requirements.txt`) e rode dentro de `backend`:

```powershell
python -m pip install pytest-cov
pytest -p no:cacheprovider --cov=app --cov-branch --cov-report=term-missing tests
```

## Cobertura do backend

Medida em 2026-11-16, commit `71ab334`, Windows 11, Python 3.11.6, `pytest-cov` 7.1.0. Conta linhas e desvios (`if`/`else`). Os 30 testes passaram.

| Arquivo | Linhas | Nao executadas | Desvios | Desvios parciais | Cobertura |
|---|---:|---:|---:|---:|---:|
| `app/api/router.py` | 419 | 76 | 144 | 42 | 75% |
| `app/core/security.py` | 50 | 14 | 8 | 2 | 69% |
| `app/main.py` | 14 | 2 | 0 | 0 | 86% |
| `app/core/config.py` | 21 | 1 | 2 | 1 | 91% |
| `app/services/estimation.py` | 139 | 8 | 54 | 12 | 90% |
| `app/core/database.py` | 13 | 0 | 0 | 0 | 100% |
| `app/models/domain.py` | 130 | 0 | 0 | 0 | 100% |
| `app/schemas/domain.py` | 208 | 0 | 0 | 0 | 100% |
| `app/services/audit.py` | 7 | 0 | 0 | 0 | 100% |
| **Total** | **1003** | **101** | **208** | **57** | **85%** |

Os 100% de `models` e `schemas` vem principalmente da definicao das classes, executada na importacao. A regra de negocio esta em `router.py` e `estimation.py`.

### Endpoints sem nenhum teste

- `POST /auth/bootstrap` e `POST /auth/login`: os testes geram o token direto no `conftest.py`;
- `GET /resources` e `GET /appointments`;
- `PATCH /appointments/{id}`, incluindo a checagem de conflito de horario na edicao;
- `GET /queue` (filtros e ordenacao por emergencia e prioridade) e `GET /queue/{id}`;
- `POST /queue/{id}/call`;
- `GET /queue/{id}/notifications` e `POST /notifications/{id}/confirm`;
- `DELETE /allocations/{id}`.

### Regras nao exercitadas em endpoints testados

- `/queue/{id}/start`: bloqueio quando o veterinario ja esta alocado a outro paciente e exigencia de sala de isolamento antes do inicio;
- `/queue/{id}/finish`: marcacao do agendamento como `COMPLETED`;
- decisao de retorno: caso `AT_RISK` e resposta sem estimativa disponivel;
- notificacoes: recusa por status invalido, notificacao anterior sem confirmacao, resposta `NOT_DUE`, falha e resolucao em status invalido;
- localizacao: os dois erros 400 (consentimento sem `travel_minutes` e recusa com dados de deslocamento);
- respostas 404 de fila, notificacao e alocacao.

### Seguranca (`app/core/security.py`)

`verify_password` nao e executada, porque o login nao tem teste. Tambem nao ha teste para requisicao sem token, token invalido ou adulterado e usuario inativo. Apenas a checagem de papel (veterinario x recepcao) e exercitada.

### Estimativa (`app/services/estimation.py`)

Ficam sem teste os casos de borda: lista vazia, uma unica amostra, amostras descartadas no calculo e o metodo `_mixed`.

## Modelo de registro

| Data/hora | Commit | Ambiente | Comando | Passou | Falhou | Observacao |
|---|---|---|---|---:|---:|---|
| 2026-11-15 | anterior ao merge do frontend | Windows, PowerShell 5.1, Python 3.13 | `pytest -q` | 30 | 0 | Registrado no pacote de 15/11 |
| 2026-11-16 | `1bb75cb` | Windows 11, Node, `frontend/` | `npm run build` e `npm run lint` | build e lint | 0 | Sem erro |
| 2026-11-16 | `1bb75cb` | Windows 11, Python 3.13.14 | `pytest -q -p no:cacheprovider backend/tests` | 0 | 0 | Nao executou: DLL do SQLAlchemy bloqueada pela politica do Windows. Reexecutar via Docker ou em outra maquina |
| 2026-11-16 | `71ab334` | Windows 11, Python 3.11.6, venv limpo com `requirements.txt` + `pytest-cov` | `pytest -v -p no:cacheprovider --cov=app --cov-branch --cov-report=term-missing tests` | 30 | 0 | `30 passed in 19.22s`, cobertura total 85%. Aviso de deprecacao do `httpx` no `TestClient`, sem efeito no resultado |
