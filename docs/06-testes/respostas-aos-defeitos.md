# Registro e respostas aos defeitos

> **Estado em 2026-11-16:** ativo para testes automatizados, bancada `MOCKED`, CT19 e CT20. O cenario ficticio pode revelar defeitos tecnicos reais, que devem ser corrigidos e retestados normalmente.

## Situacao atual

A execucao automatizada mais recente terminou com **55 testes aprovados**. A jornada local CT19 foi aprovada com ressalvas e abriu tres defeitos de produto: um medio e dois baixos. O smoke CT20 foi aprovado sem novo defeito de publicacao.

## Registro

| ID | Origem/caso | Versao | Defeito observado | Severidade | Decisao | Correcao/commit | Reteste |
|---|---|---|---|---|---|---|---|
| AUTO-01 | Suite automatizada - 55 testes | `0fd8c67` | Nenhuma divergencia automatizada observada | - | Aprovado | Nao aplicavel | `55 passed in 54.50s` |
| CT20-01 | CT20 externo | `0fd8c67` | Nenhum defeito no smoke nao destrutivo de frontend, SPA, API, health, CORS, login e leitura da fila | - | Aprovado | Nao aplicavel | Oito verificacoes externas aprovadas |
| E2E-01 | CT19 | `3e2e853` | Duracao `SYSTEM` de 0,1 minuto entra na base e pode contaminar a estimativa F1 | Media | Acatado para triagem do backend | A definir em branch propria | Aguardando correcao e regressao F1 |
| E2E-02 | CT19 | `3e2e853` | Caso concluido apresenta mensagem incorreta e mantem acoes de aviso | Baixa | Acatado para triagem do frontend | A definir em branch propria | Aguardando correcao visual |
| E2E-03 | CT19 | `3e2e853` | Proximo paciente recebe faixa de estimativa 0-0, prejudicando o indicador `inside_range` | Baixa | Acatado para triagem do backend/F1 | A definir em branch propria | Aguardando correcao e regressao F1 |

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
