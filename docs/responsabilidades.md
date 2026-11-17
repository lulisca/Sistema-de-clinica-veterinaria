# Responsabilidades

> Linha de base consolidada pelo GP em 2026-11-16. Os papéis são acumulados com a participação nas frentes.

## Papéis

| Quem | Responsabilidade |
|---|---|
| **GP · Alisson** | Consolida escopo, cronograma, responsabilidades, riscos, evidências e entrega; coordena integração e apresentação |
| **Arquiteto · Nathan** | Revisa stack, arquitetura, contrato, F1/F2/F3, hardware, hospedagem e integração; aprova ou solicita ajustes técnicos |
| **G1 · Backend** | API, banco, fila, F1, F2, F3, auditoria, migrations e suporte ao deploy |
| **G2 · Frontend** | Telas da recepção e do tutor, integração com a API, mensagens, experiência e capturas |
| **G3 · Qualidade e Projeto** | Documentação, riscos, testes, bancada, publicação, manual, demonstração e encerramento |
| **Todos** | Commits próprios, revisão de PR, Registro de IA, lições aprendidas e domínio do trabalho apresentado |

F1, F2 e F3 atravessam as três frentes: G1 implementa as regras, G2 apresenta os fluxos e G3 verifica e registra as evidências.

## Composição

- **GP:** Alisson.
- **Arquiteto:** Nathan.
- **G1 · Backend:** Lucas Kather, Pedro Valença, Rafael Lindquist e Rafael Nicolas, identificado no Git também como Rafael Carvalho.
- **G2 · Frontend:** Alisson, Leo e Luísa.
- **G3 · Qualidade e Projeto:** Kauã e Nathan.

## Estado das responsabilidades

| Atividade | Responsável | Estado |
|---|---|---|
| Consolidação das pastas 01–08 | GP + G3 | Concluída |
| Revisão técnica da linha de base | Arquiteto | Incorporada aos ADRs e ao fluxo de PR |
| Backend e suite automatizada | G1 + G3 | 55 testes aprovados |
| Frontend e manual com capturas | G2 + G3 | Integrados |
| C1 | GP + G3 | Concluído como C1-MOCKED, sem alegação de coleta real |
| Hardware | Arquiteto + G3 | Concluído como protótipo documental |
| Extensão | GP + G3 | Congelada como simulação documental `MOCKED` |
| CT19 ponta a ponta | Rafa + G3 | Aprovado com ressalvas |
| Vercel, Neon e CT20 | G1 + G3 | Concluídos e verificados por HTTPS |
| PR e merge final | GP + Arquiteto | Concluído no PR #20, commit `0fd8c67` |

Uma eventual coleta ou extensão real futura recebe novos responsáveis, datas e evidências. Ela não altera retroativamente o pacote `MOCKED` congelado em 2026-11-16.
