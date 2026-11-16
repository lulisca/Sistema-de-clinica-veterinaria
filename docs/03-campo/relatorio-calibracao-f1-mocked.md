# Relatorio de calibracao F1 com dados `MOCKED`

> Relatorio tecnico para desenvolvimento e apresentacao. Nao valida o C1. O backend usa esta massa somente com `ALLOW_MOCKED_ESTIMATES=true` e identifica a origem como `MOCKED`.

## Base

- 40 atendimentos;
- quatro janelas;
- quatro tipos;
- origem unica: `MOCKED`.

## Percentis da massa mockada

| Tipo | N | p50 da duracao | p90 da duracao |
|---|---:|---:|---:|
| Consulta | 12 | 26,0 min | 28,9 min |
| Exame | 9 | 27,0 min | 29,2 min |
| Retorno | 8 | 17,5 min | 19,3 min |
| Vacina | 11 | 12,0 min | 13,0 min |

## Interpretacao

- os tipos possuem duracoes diferentes, confirmando que uma media global seria inadequada;
- p50 funciona como referencia central;
- p90 oferece limite conservador para a faixa;
- a massa permite testar telas, scripts e casos de borda;
- os numeros nao devem alimentar a calibracao oficial enquanto a origem for `MOCKED`.

## Decisao de desenvolvimento

Manter p50/p90 por tipo. Na apresentacao, habilitar `ALLOW_MOCKED_ESTIMATES=true` e exibir a origem `MOCKED`; com o modo desligado, manter `insufficient_data`.
