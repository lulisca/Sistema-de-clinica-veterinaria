# Responsabilidades

> Composição informada pelo GP em 2026-11-15. A formalização arquitetural deve ser registrada em ADR aprovado pela equipe na data real da decisão.

| Quem | Faz |
|---|---|
| **GP** | Consolida escopo, cronograma, responsabilidades, pendências, evidências e entrega; coordena a apresentação |
| **Arquiteta** | Revisa e valida tecnicamente stack, arquitetura, contrato, F1/F2/F3, hardware e integração; não cria os artefatos dos grupos |
| **Grupo 1 · Backend** | API, banco, fila e prioridade, estimativa (F1), geolocalização e aviso (F2), segregação (F3), auditoria |
| **Grupo 2 · Frontend** | Telas do tutor e da recepção, protótipo das telas |
| **Grupo 3 · Qualidade e Projeto** | Escopo, documentação, atas, riscos, testes, bancada cruzada, deploy, manual |
| **Todos** | Commits próprios, Registro de IA, lições aprendidas, e saber explicar qualquer parte do projeto |

F1, F2 e F3 atravessam os três grupos: o backend faz a regra, o front faz a tela, a qualidade testa.

## Itens que exigem responsável de execução

- Evidência de campo real, entrevista e validação acadêmica do C1; a demonstração da F1 pode usar `MOCKED` identificado.
- Protótipo físico do hardware, somente se entrar no escopo final.
- Relatório de extensão e contato com a clínica.

## Distribuicao operacional para o fechamento

- **GP + G3:** criam e atualizam documentos, ata, ADRs, riscos, evidências, manual e encerramento.
- **Arquiteta:** revisa o conteúdo técnico produzido, aprova ou solicita ajustes e informa a decisão ao GP; não precisa redigir ata, ADR ou evidência.
- **G1:** mantém backend executável, corrige incompatibilidades e produz evidências técnicas do backend/deploy.
- **G2:** implementa a integração do frontend e produz evidências das telas e da jornada.
- **Todos:** revisar a pauta de 16/11, assumir tarefas, ensaiar e registrar contribuicao.

Campo real/C1 e extensao dependem de orientacao ou parceiro externo; dados mockados nao substituem essas evidencias.

## Nomes

- **GP:** Alisson
- **Arquiteta:** Luísa
- **Grupo 1 · Backend:** Lucas Kather, Pedro Valença, Rafael Lindquist e Rafael Nicolas
- **Grupo 2 · Frontend:** Alisson, Leo e Luísa
- **Grupo 3 · Qualidade e Projeto:** Kauan e Nathan

Os papéis de GP e arquiteta são acumulados com a participação nas frentes. A equipe possui nove integrantes distribuídos entre os três grupos.
