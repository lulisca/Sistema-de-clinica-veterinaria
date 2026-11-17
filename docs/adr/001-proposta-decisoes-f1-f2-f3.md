# ADR-001 - Decisoes de F1, F2 e F3

- **Data do registro:** 2026-11-15
- **Data de aceite:** 2026-11-16
- **Status:** aceito para a linha de base da entrega
- **Decide:** Alisson, GP

## Contexto

O backend e o frontend integrados implementam as escolhas abaixo. O ADR registra a linha adotada na versao congelada em 16/11.

## Decisao

- F1: percentis p50/p90 por tipo; `MOCKED` permitido no modo configuravel de apresentacao, com origem identificada, compondo o C1-MOCKED aprovado sem alegacao de coleta real.
- F2: captura pontual; backend recebe somente `travel_minutes`; negacao usa fallback; canal de demo `SIMULATOR`.
- F3: especie e tipo/motivo como eixos; ordem emergencia, prioridade, check-in e ID; recursos exclusivos por alocacao.

Os parametros F2 de 20 minutos de aviso, 60 minutos de retencao e 10 minutos de margem formam a configuracao `MOCKED` aprovada para a entrega.

## Alternativas

- media e desvio na F1: rejeitada por sensibilidade e menor clareza.
- coordenadas persistidas: rejeitada por minimizacao.
- filas fisicas separadas: rejeitada porque dificulta recursos compartilhados.

## Consequencias

Frontend e QA seguem o contrato integrado. Uma futura coleta real ou troca de parametros exige nova decisao e evidencia, sem alterar retroativamente esta linha `MOCKED`.
