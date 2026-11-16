# Resultados de testes

> **Atualizado em:** 2026-11-16. Estado alinhado ao commit `5c8bb16` da branch `feature/revisao-final`; o codigo executado corresponde a `development` integrada.

## Resultado consolidado

| Verificacao | Resultado | Evidencia/observacao |
|---|---|---|
| Suite backend atual | Aprovada | `43 passed in 44.13s` com Python 3.13 |
| Distribuicao dos testes | 43 | API 16; F2 14; reordenacao 7; autoatendimento 6 |
| Aviso do pytest | Nao bloqueante | Cache `.pytest_cache` nao foi criado por restricao de permissao; testes executaram normalmente |
| Massa `MOCKED` | Aprovada | 40 registros, quatro tipos e quatro janelas |
| Integracao frontend | Integrada | Frontend presente na `development` e consumindo o contrato atual |
| Build/lint historicos | Aprovados em 16/11 | Evidencia anterior: `npm run build` e `npm run lint` sem erro |
| Build/lint nesta sessao | Ambiente nao reproduziu | `node_modules` ausente e sandbox npm restrito a cache; `npm ci` nao conseguiu baixar Vite |
| CT19 ponta a ponta local | Em execucao | Rafa executara jornada e acrescentara ambiente, commit, passos e evidencias |
| CT20 smoke externo | Em execucao | Executar depois da publicacao Vercel + Neon |

## Comandos da verificacao atual

```powershell
py -m pytest -q .\backend\tests
```

Resultado:

```text
43 passed, 1 warning in 44.13s
```

O warning foi exclusivamente sobre a impossibilidade de criar o cache do pytest e nao representa falha da aplicacao.

Para validar o frontend em ambiente com acesso ao registro npm:

```powershell
cd frontend
npm ci
npm run build
npm run lint
```

## Cobertura historica

A cobertura de **85%** foi medida em 16/11/2026 no commit `71ab334`, quando a suite possuia 30 testes, usando Python 3.11.6 e `pytest-cov` 7.1.0. Essa medicao continua valida como evidencia historica daquele commit, mas nao e atribuida automaticamente a suite atual de 43 testes.

| Medicao | Testes | Cobertura | Situacao |
|---|---:|---:|---|
| Commit `71ab334` | 30 aprovados | 85% de linhas/desvios em `backend/app` | Historica e reproduzivel |
| Versao atual | 43 aprovados | Nao recalculada nesta sessao | Nao declarar percentual atual sem nova medicao |

## Evolucao da suite

Os 13 testes adicionados depois da medicao historica cobrem:

- cadastro autenticado do tutor;
- animal proprio e bloqueio de animal de outro tutor;
- bloqueio de entrada ativa duplicada;
- email duplicado e separacao de papeis;
- bootstrap da equipe com conta de tutor existente;
- reordenacao autorizada da fila;
- bloqueio da recepcao;
- conflitos `409` por lista ou versao desatualizada;
- emergencia fora da reordenacao;
- nova entrada no fim da fila;
- recalculo unico da F1 apos reordenacao.

## Registro de execucoes

| Data | Commit/versao | Ambiente | Comando | Resultado |
|---|---|---|---|---|
| 2026-11-15 | versao anterior | Windows, Python 3.13 | `pytest -q` | 30 aprovados |
| 2026-11-16 | `71ab334` | Windows, Python 3.11.6 | pytest com cobertura | 30 aprovados; 85% |
| 2026-11-16 | frontend anterior a reordenacao | Windows, Node | build e lint | aprovados |
| 2026-11-16 | `5c8bb16` | Windows, Python 3.13 | `py -m pytest -q .\backend\tests` | 43 aprovados em 44.13s |
| 2026-11-16 | `5c8bb16` | Sandbox sem cache npm | `npm ci`, build e lint | dependencias indisponiveis; codigo nao executado |

## Registro do CT19

O executor deve acrescentar uma linha com data, branch/commit, navegador, banco, passos, resultado e referencias das evidencias. Defeitos observados devem ser registrados em `respostas-aos-defeitos.md`, corrigidos em commit proprio e retestados.

## Limites atuais

- o frontend nao possui suite automatizada propria;
- CT19 depende da execucao conjunta de frontend e backend;
- CT20 depende das URLs publicadas;
- nenhum resultado externo e declarado antes do smoke test.
