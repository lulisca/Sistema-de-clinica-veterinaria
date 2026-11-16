# ADR-0001 — Backend REST, persistência e primeira versão da F1

**Status:** adotado na versão integrada
**Data de consolidação:** 2026-11-16.

## Contexto
O sistema precisa integrar agenda, fila, estimativa de espera, acionamento por deslocamento, segregação e recursos compartilhados. O contrato entre frentes precisa ser simples de simular pelo frontend e testável independentemente.

## Opções consideradas
1. REST + FastAPI + SQLAlchemy + PostgreSQL.
2. Django + Django REST Framework.
3. GraphQL.

## Decisão aplicada
REST com FastAPI, SQLAlchemy 2 e PostgreSQL. SQLite é permitido apenas como conveniência local/teste. A F1 usa percentis históricos por tipo de atendimento e uma simulação simples da fila conforme a capacidade de veterinários disponível.

## Consequências aceitas
- Contrato HTTP/JSON simples para G2 e G3 simularem.
- PostgreSQL atende a publicação sem prender o código a um provedor específico.
- A estimativa depende de amostras elegíveis; quando faltam, o backend declara `insufficient_data`. A massa C1-MOCKED pode ser habilitada explicitamente e permanece identificada.
- Previsões são versionadas e recalculadas automaticamente quando eventos relevantes alteram a fila ou a base histórica.
- `MIN_SAMPLES_FOR_ESTIMATE` é uma trava técnica configurável e não transforma dados `MOCKED` em coleta real.
- A primeira versão da simulação não modela todas as particularidades de recursos/especialidades. Deve ser revisada após as regras da clínica serem confirmadas.

## Observação de processo
Este ADR descreve o stack já integrado. A decisão de F1 e C1-MOCKED também está consolidada no ADR-001 da raiz do repositório.
