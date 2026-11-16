# ADR-001 - Decisoes de F1, F2 e F3

- **Data:** 2026-11-15
- **Status:** proposta

## Contexto

O backend ja implementa escolhas tecnicas que precisam de aprovacao formal antes de serem tratadas como linha de base da equipe.

## Proposta

- F1: percentis p50/p90 por tipo; `MOCKED` permitido somente no modo configuravel de apresentacao, com origem identificada e sem validar o C1.
- F2: captura pontual; backend recebe somente `travel_minutes`; negacao usa fallback; canal de demo `SIMULATOR`.
- F3: especie e tipo/motivo como eixos; ordem emergencia, prioridade, check-in e ID; recursos exclusivos por alocacao.

Parametros 20/60/10 minutos permanecem somente para demo ate aprovacao especifica.

## Alternativas

- media e desvio na F1: rejeitada na proposta por sensibilidade e menor clareza.
- coordenadas persistidas: rejeitada por minimizacao.
- filas fisicas separadas: rejeitada porque dificulta recursos compartilhados.

## Consequencias

Frontend e QA devem seguir o contrato. A equipe precisa aprovar ou alterar esta proposta e registrar a decisao real antes de mudar o status.
