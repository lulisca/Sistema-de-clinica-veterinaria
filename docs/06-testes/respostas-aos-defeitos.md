# Registro e respostas aos defeitos

> **Estado em 2026-11-16:** ativo para testes automatizados, bancada `MOCKED`, CT19 e CT20. O cenario ficticio pode revelar defeitos tecnicos reais, que devem ser corrigidos e retestados normalmente.

## Situacao atual

A execucao automatizada mais recente terminou com **43 testes aprovados** e nao abriu defeito de produto. Os casos manuais BC14, BC16 e a jornada CT19 permanecem em execucao e podem acrescentar registros abaixo. O smoke CT20 podera acrescentar defeitos de publicacao.

## Registro

| ID | Origem/caso | Versao | Defeito observado | Severidade | Decisao | Correcao/commit | Reteste |
|---|---|---|---|---|---|---|---|
| - | Suite automatizada - 43 testes | `5c8bb16` | Nenhuma divergencia observada | - | Aprovado | Nao aplicavel | `43 passed in 44.13s` |

Quando um defeito for encontrado, acrescentar uma nova linha com ID sequencial, sem apagar o historico das execucoes aprovadas.

## Evidencia obrigatoria

Cada defeito deve registrar:

- origem: teste automatizado, BCxx, CT19 ou CT20;
- branch, commit, ambiente e perfil utilizado;
- pre-condicao e dados `MOCKED` usados;
- passos para reproduzir;
- resultado esperado e resultado obtido;
- captura ou log sem senha, JWT ou token completo;
- severidade e responsavel pela decisao;
- commit da correcao e resultado do reteste.

## Decisoes de triagem

- **Acatado:** comportamento viola requisito ou contrato; corrigir e executar regressao.
- **Contestado:** comportamento esta correto; citar requisito, ADR, teste ou evidencia tecnica.
- **Fora do escopo:** citar a declaracao de escopo sem esconder falha de feature obrigatoria.
- **Incidente de ambiente:** falha de dependencia, permissao ou infraestrutura que nao reproduz defeito do produto; registrar separadamente no resultado da execucao.

Defeito critico bloqueia liberacao. Defeito alto bloqueia a feature. Defeito medio exige correcao ou contorno aprovado. Defeito baixo pode seguir com justificativa e rastreabilidade.

## Fluxo

1. executar o caso;
2. registrar evidencia;
3. classificar e decidir;
4. corrigir em branch propria quando acatado;
5. reexecutar o caso e a regressao afetada;
6. atualizar esta tabela com commit e resultado.

O uso de Empresa 02 `MOCKED` deve permanecer explicito na origem. Um eventual teste externo futuro recebe nova identificacao, data e participantes reais.
