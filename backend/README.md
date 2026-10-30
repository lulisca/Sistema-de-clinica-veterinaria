# Fila Virtual — Backend

Backend executável para o Projeto Integrador **Agenda + Fila Virtual** de clínica veterinária.

## O que já está implementado

- Agenda simples com verificação de conflito de profissional.
- Check-in de agendado e entrada de encaixe/walk-in.
- Fila com segregação consultável por espécie e tipo de atendimento.
- Emergência marcada apenas por perfil veterinário/admin.
- Recursos compartilhados com bloqueio de dupla alocação.
- **F1:** amostras por tipo, p50/p90, revisões automáticas versionadas, espera real, erro assinado, MAE, cobertura da faixa e métricas por tipo.
- **F2:** snapshots de deslocamento com consentimento, sem rastreamento contínuo/sem persistir coordenadas, fallback sem GPS e simulador de avisos.
- Trilha de auditoria para ações críticas.
- Link público aleatório para o tutor consultar somente o próprio atendimento.
- PostgreSQL suportado; SQLite funciona para desenvolvimento rápido.
- Migrations Alembic e testes automatizados.

## Regras propositalmente NÃO inventadas

O planejamento da equipe ainda marca como pendentes: tolerância de atraso, reinserção, precedência agendado × encaixe, desempate final, níveis de prioridade além de emergência, canal de notificação, margem final de retorno e detalhes de retenção. O backend deixa essas decisões abertas em vez de criar regra acadêmica sem validação da clínica.

## Executar localmente (mais simples)

```bash
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# edite as variáveis necessárias (especialmente JWT_SECRET)
uvicorn app.main:app --reload
```

Abra `http://127.0.0.1:8000/docs` para o Swagger.

> Observação: o código lê variáveis do ambiente. O arquivo `.env` é referência; carregue-as no terminal/IDE ou use Docker Compose.

### Primeiro usuário

Com banco vazio, execute no Swagger:

`POST /api/auth/bootstrap`

```json
{
  "name": "Recepção",
  "email": "recepcao@clinica.local",
  "password": "troque12345",
  "role": "RECEPTION"
}
```

Depois use `POST /api/auth/login` e envie o JWT como Bearer token.

## PostgreSQL com Docker

```bash
docker compose up
```

API: `http://localhost:8000/docs`  
PostgreSQL: `localhost:5432`

## Alembic

```bash
alembic upgrade head
```

A aplicação também cria as tabelas automaticamente no startup para facilitar o MVP. Na publicação final, prefira migrations.

## Dados de campo da F1

Preencha uma cópia de:

`data/amostras_campo_template.csv`

Depois:

```bash
python scripts/import_samples.py data/amostras_campo.csv
```

Origens previstas no backend:
- `DIRECT_OBSERVATION`
- `RETROSPECTIVE`
- `SYSTEM`
- `SYNTHETIC`

Amostras `SYNTHETIC` **não entram na calibração F1**.

## Fluxo de demonstração S5

1. Cadastrar tutor e animal.
2. Registrar ao menos 3 amostras não sintéticas do tipo demonstrado (valor mínimo configurável; a coleta acadêmica continua seguindo os 40 atendimentos/4 tipos exigidos pelo projeto).
3. Criar agendamento ou encaixe.
4. Fazer check-in.
5. A previsão inicial já é criada automaticamente quando houver dados suficientes; `POST /queue/{id}/estimate` continua disponível para recálculo manual.
6. Mudanças relevantes da fila geram revisões automáticas e versionadas.
7. `POST /queue/{id}/start` → grava espera real e erros em todas as revisões do paciente.
8. `POST /queue/{id}/finish` → registra duração real como nova amostra `SYSTEM` e recalcula quem permanece aguardando.
9. `GET /queue/{id}/estimates` → histórico completo de revisões.
10. `GET /metrics/wait-estimates` e `/metrics/wait-estimates/by-type` → indicadores.
11. `python scripts/generate_f1_report.py` → relatório Markdown da base atual.

## Testes

```bash
pytest -q
```

## Contrato e ADR

- `docs/API_CONTRACT.md` — contrato entre backend/frontend/testes
- `docs/MODELO_DADOS.md` — ER em Mermaid e decisões do modelo
- `docs/DEMO_S5.md` — roteiro da fatia vertical F1
- `docs/F1_IMPLEMENTACAO.md` — descrição técnica e critérios de fechamento da F1
- `docs/RELATORIO_CALIBRACAO_F1.md` — gerado pelo script de relatório
- `docs/REGISTRO_IA_RASCUNHO.md` — rascunho para declaração obrigatória
- `docs/adr/0001-backend-stack-e-f1.md` — ADR proposto

O ADR está explicitamente como **proposta**. Coloquem a data real e alterem o status somente quando a equipe efetivamente aprovar e commitar a decisão.
