# Relatorio de calibracao F1 com dados `MOCKED`

> Relatorio tecnico integrante do C1-MOCKED aprovado pelo GP. Nao representa calibracao clinica obtida por coleta real. O backend usa esta massa somente com `ALLOW_MOCKED_ESTIMATES=true` e identifica a origem como `MOCKED`.

## Base

- 40 atendimentos;
- quatro janelas ficticias;
- quatro tipos;
- origem unica: `MOCKED`.

## Percentis conferidos

| Tipo | N | p50 da duracao | p90 da duracao |
|---|---:|---:|---:|
| Consulta | 12 | 26,0 min | 28,9 min |
| Exame | 9 | 27,0 min | 29,2 min |
| Retorno | 8 | 17,5 min | 19,3 min |
| Vacina | 11 | 12,0 min | 13,0 min |

## Interpretacao tecnica

- os tipos possuem duracoes diferentes, confirmando que uma media global seria inadequada;
- p50 funciona como referencia central da massa mockada;
- p90 oferece um limite conservador para a faixa demonstrada;
- a massa permite testar telas, scripts e casos de borda;
- os numeros descrevem somente o cenario `MOCKED` e nao devem ser apresentados como estatistica de uma clinica real.

## Decisao de desenvolvimento

Manter p50/p90 por tipo. Na apresentacao, habilitar `ALLOW_MOCKED_ESTIMATES=true` e exibir `data_source=MOCKED`. Com o modo desligado e sem fonte aceita, manter `insufficient_data`.

Uma coleta real futura, se autorizada pelo professor, deve gerar novo relatorio com origem, datas e evidencia verificaveis, sem alterar retroativamente este documento.
