# Resultados de testes

> **Atualizado em:** 2026-11-16.

| Verificacao | Resultado | Evidencia/observacao |
|---|---|---|
| Compilacao Python | Aprovada (15/11) | `python -m compileall -q backend` executado sem erro |
| Quantidade de testes escritos | 30 | Arquivos `backend/tests/test_api.py` e `test_f2.py` |
| Pytest | Aprovado em 15/11; nao reproduzido em 16/11 | 15/11: `30 passed in 30.65s`. 16/11: a execucao parou no import do SQLAlchemy porque a politica de Controle de Aplicativo do Windows bloqueou a DLL `_immutabledict_cy`; o Docker nao estava ativo. Nenhum teste chegou a rodar, entao nao ha falha de teste registrada |
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

## Modelo de registro

| Data/hora | Commit | Ambiente | Comando | Passou | Falhou | Observacao |
|---|---|---|---|---:|---:|---|
| 2026-11-15 | anterior ao merge do frontend | Windows, PowerShell 5.1, Python 3.13 | `pytest -q` | 30 | 0 | Registrado no pacote de 15/11 |
| 2026-11-16 | `1bb75cb` | Windows 11, Node, `frontend/` | `npm run build` e `npm run lint` | build e lint | 0 | Sem erro |
| 2026-11-16 | `1bb75cb` | Windows 11, Python 3.13.14 | `pytest -q -p no:cacheprovider backend/tests` | 0 | 0 | Nao executou: DLL do SQLAlchemy bloqueada pela politica do Windows. Reexecutar via Docker ou em outra maquina |
