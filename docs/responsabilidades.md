# Responsabilidades

> Composição informada em 2026-11-15. A equipe decidiu não manter os papéis de gerente de projeto e de arquiteto: o trabalho fica dividido só entre as três frentes, e as decisões que afetam mais de uma frente são tomadas em conjunto e registradas em ADR ou ata.

| Quem | Faz |
|---|---|
| **Grupo 1 · Backend** | API, banco, fila e prioridade, estimativa (F1), geolocalização e aviso (F2), segregação (F3), auditoria |
| **Grupo 2 · Frontend** | Telas do tutor e da recepção, protótipo das telas e identidade visual |
| **Grupo 3 · Qualidade e Projeto** | Escopo, documentação, atas, riscos, testes, bancada cruzada, publicação, manual |
| **Todos** | Commits próprios, Registro de IA, lições aprendidas, e saber explicar qualquer parte do projeto |

F1, F2 e F3 atravessam os três grupos: o backend faz a regra, o front faz a tela, a qualidade testa.

## Decisões entre frentes

- Mudança de contrato da API, stack ou regra de F1/F2/F3: G1 e G2 combinam, G3 registra em ADR ou ata no mesmo dia.
- Revisão técnica: cada frente revisa o Pull Request da outra quando a mudança a afeta.
- Organização das reuniões, atas, riscos e cronograma: G3.

## Itens que exigem responsável de execução

- Evidência de campo real, entrevista e validação acadêmica do C1; a demonstração da F1 pode usar `MOCKED` identificado.
- Protótipo físico do hardware, somente se entrar no escopo final.
- Relatório de extensão e contato com a clínica.

## Distribuição operacional para o fechamento

- **G3:** cria e atualiza documentos, atas, ADRs, riscos, evidências, testes, manual e encerramento.
- **G1:** mantém o backend executável, corrige incompatibilidades e produz evidências técnicas do backend.
- **G2:** mantém a integração do frontend e produz evidências das telas e da jornada.
- **Todos:** revisar a pauta de 16/11, assumir tarefas, ensaiar e registrar contribuição.

Campo real/C1 e extensão dependem de orientação ou parceiro externo; dados mockados não substituem essas evidências.

## Nomes

- **Grupo 1 · Backend:** Lucas Kather, Pedro Valença, Rafael Lindquist e Rafael Nicolas
- **Grupo 2 · Frontend:** Alisson, Leo e Luísa
- **Grupo 3 · Qualidade e Projeto:** Kauã e Nathan

A equipe possui nove integrantes distribuídos entre os três grupos.

## Contas no Git

O histórico usa estes nomes de conta. O arquivo `.mailmap` na raiz unifica as contas de uma mesma pessoa nos comandos `git log` e `git shortlog`.

| Integrante | Conta |
|---|---|
| Lucas Kather | `Lucasdziaduk` |
| Alisson | `Arsa` |
| Leo | `Leonardo Rossetti Francatto` |
| Luísa | `lulisca` e `Luisa Felix` (mesma pessoa) |
| Kauã | `Kauã Martins` |
