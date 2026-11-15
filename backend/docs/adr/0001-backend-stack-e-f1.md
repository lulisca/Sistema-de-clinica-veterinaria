# ADR-0001 — Backend REST, persistência e primeira versão da F1

**Status:** proposta técnica para validação pela equipe  
**Data:** preencher com a data em que a equipe realmente aprovar esta decisão.

## Contexto
O sistema precisa integrar agenda, fila, estimativa de espera, acionamento por deslocamento, segregação e recursos compartilhados. O contrato entre frentes precisa ser simples de simular pelo frontend e testável independentemente.

## Opções consideradas
1. REST + FastAPI + SQLAlchemy + PostgreSQL.
2. Django + Django REST Framework.
3. GraphQL.

## Decisão proposta
REST com FastAPI, SQLAlchemy 2 e PostgreSQL. SQLite é permitido apenas como conveniência local/teste. A F1 usa percentis históricos por tipo de atendimento e uma simulação simples da fila conforme a capacidade de veterinários disponível.

## Consequências aceitas
- Contrato HTTP/JSON simples para G2 e G3 simularem.
- PostgreSQL atende a publicação sem prender o código a um provedor específico.
- A estimativa depende de dados de campo suficientes; quando faltam amostras o backend declara `insufficient_data` em vez de inventar um valor.
- Previsões são versionadas e recalculadas automaticamente quando eventos relevantes alteram a fila ou a base histórica.
- `MIN_SAMPLES_FOR_ESTIMATE` é apenas uma trava técnica configurável; a suficiência acadêmica/estatística depende da coleta e análise reais.
- A primeira versão da simulação não modela todas as particularidades de recursos/especialidades. Deve ser revisada após as regras da clínica serem confirmadas.

## Observação de processo
Este arquivo não deve ser apresentado como ADR válido até a equipe discutir e aprovar a decisão. O Caderno exige que ADRs sejam commitados na data real da decisão.
