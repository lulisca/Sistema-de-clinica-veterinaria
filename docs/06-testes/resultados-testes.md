# Resultados de testes

> **Atualizado em:** 2026-11-15.

| Verificacao | Resultado | Evidencia/observacao |
|---|---|---|
| Compilacao Python | Aprovada | `python -m compileall -q backend` executado sem erro |
| Quantidade de testes escritos | 30 | Arquivos `backend/tests/test_api.py` e `test_f2.py` |
| Pytest | Aprovado | `py -m pytest -q -p no:cacheprovider .\backend\tests`: 30 passed in 30.65s |
| 40 registros mockados | Aprovado | CSVs possuem 40 linhas de dados e origem `MOCKED` |
| Quatro tipos | Aprovado para massa mockada | consulta 12, exame 9, retorno 8, vacina 11 |
| Quatro janelas | Aprovado para massa mockada | 10 registros por janela |
| Integracao frontend | Pendente | Frontend ainda nao estava integrado ao mapear o repositorio |
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
| | | | | | | |
