# Cronograma do projeto - 05/10 a 16/11/2026

> O planejamento comeca em outubro e acompanha o projeto ate o fechamento tecnico de 16/11/2026. As datas planejadas foram preservadas e o estado final foi atualizado conforme as decisoes aprovadas na pasta `01-iniciacao`.

## Cronograma completo

| Periodo | Marco/frente | Entrega prevista | Registro do periodo | Situacao no fechamento de 16/11 |
|---|---|---|---|---|
| 05/10 | S1 - Kickoff | GP, arquiteto, grupos, repositorio e termo de abertura | Composicao iniciada sem formalizacao documental completa | Equipe e responsabilidades formalizadas pelo GP |
| 06-11/10 | Iniciacao e campo | Stakeholders, premissas, restricoes e primeira janela | Cenario ficticio e preparacao documental | Cenario Vila Nova EC, dados e janelas identificados como `MOCKED` |
| 12/10 | S2 - Campo | Cenario, cronograma e riscos iniciais | Cenario ficticio definido | C1-MOCKED aprovado pelo GP para verificacao tecnica, sem alegacao de coleta real |
| 13-18/10 | Escopo | Requisitos, casos de uso, entrevista e segunda janela | Requisitos recuperados e entrevista simulada preparada | Requisitos consolidados; entrevista e relatorio de campo tratados como simulacao `MOCKED` |
| 19/10 | S3 - Escopo | Escopo, EAP e requisitos aprovados | Artefatos preparados depois do marco planejado | Linha de base aprovada pelo GP em 16/11, com a data real registrada |
| 20-25/10 | Arquitetura | Contrato, modelo de dados, F1/F2/F3, hardware e custos | Backend possuia contrato e modelo iniciais | Arquitetura, contrato, modelo, F1/F2/F3 e hardware documental consolidados |
| 26/10 | S4 - Arquitetura | Contrato congelado, ADRs, riscos e hardware | Decisoes tecnicas ainda distribuidas entre codigo e documentos | ADRs registrados nas datas reais; Vercel + Neon definidos no ADR-003 |
| 27-31/10 | Preparacao da implementacao | Divisao tecnica, massa mockada e inicio da fatia vertical | Massa `MOCKED` preparada e backend em desenvolvimento | Massa integrada ao fluxo de demonstracao com origem identificada |
| 01-02/11 | S5 - Fatia vertical | Uma feature do banco a interface e quatro janelas acumuladas | Backend F1 disponivel; frontend ainda nao integrado naquele periodo | Registro historico preservado; integracao concluida posteriormente na `development` |
| 03-08/11 | Implementacao | Completar F1, F2 e F3 e integrar frentes | Backend F1/F2 e estruturas F3 implementados | F1, F2, F3, cadastro, autoatendimento e regras de fila integrados |
| 09/11 | S6 - Tres features | Features operacionais e plano de testes | Plano preparado; a primeira execucao consolidada em 15/11 registrou 30 testes | Suite ampliada e validada com 43 testes aprovados no fechamento |
| 10-14/11 | Qualidade e documentacao | Testes, manual, publicacao, hardware e preparacao da entrega | Documentacao em consolidacao e frontend em integracao | Manual com 12 capturas, QA, hardware documental e frontend consolidados |
| 15/11 | Recuperacao documental | Consolidar os artefatos exigidos | Planejamento, arquitetura, campo mockado, QA, publicacao e manual preparados | Conteudo revisado pelo GP e submetido a revisao tecnica da equipe |
| 16/11 | Fechamento tecnico | Aprovar decisoes, integrar frontend, validar backend e disponibilizar o pacote | Branch `development` consolidada | Frontend integrado, backend com 43 testes, C1/extensao/Empresa 02 `MOCKED`; publicacao e teste ponta a ponta em execucao |

## Responsabilidades no fechamento

| Frente | Responsabilidade consolidada |
|---|---|
| GP - Alisson | aprovar linha de base, decidir prioridades, consolidar documentos e coordenar a entrega |
| Arquiteto - Nathan | revisar contrato, arquitetura, F1/F2/F3, hardware documental e integracao entre frentes |
| G1 Backend | manter API, banco, regras de negocio, migrations e testes automatizados |
| G2 Frontend | manter os fluxos de tutor, recepcao e veterinario integrados ao contrato |
| G3 Qualidade e Projeto | manter planejamento, testes, evidencias, manual, publicacao e encerramento sob revisao do GP |

## Prioridade final

1. linha de base e decisoes tecnicas aprovadas;
2. frontend integrado ao contrato da API;
3. suite backend com 43 testes aprovados;
4. documentacao, manual e cenarios `MOCKED` consolidados;
5. publicacao Vercel + Neon e teste ponta a ponta em execucao;
6. commit, push e revisao da branch de fechamento.

Nao existe atividade interna de desenvolvimento planejada depois do congelamento tecnico de 16/11/2026. As atividades externas ainda em execucao devem receber URL, data, versao e resultado verificavel quando forem concluidas.
