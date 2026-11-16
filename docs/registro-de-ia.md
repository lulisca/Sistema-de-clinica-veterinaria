# Registro de IA

Ferramentas de IA são de uso autorizado, em qualquer volume, com declaração obrigatória. Uso declarado não é penalizado. Uso não declarado, havendo evidência, zera o critério de Processo (C8).

O que se avalia é a qualidade da crítica ao resultado, não o volume de uso. Uma linha por uso relevante.

## Usos

| Data | Quem | Ferramenta | O que foi solicitado | O que foi retornado | O que alteramos e por quê |
|---|---|---|---|---|---|
| 2026-10-29 | Grupo 1 | OpenAI Codex | Estruturar o backend da Agenda + Fila Virtual com base no Caderno do Aluno e no `ETAPAS.md` | Estrutura FastAPI/SQLAlchemy, modelos, API, migrations, testes e documentação técnica | O código foi revisado, integrado por PR e mantido como base do backend; decisões clínicas e parâmetros continuaram sujeitos à aprovação da equipe |
| 2026-10-29 | Grupo 1 | OpenAI Codex | Concluir a F1 sem depender da coleta real | Recálculo automático, histórico de previsões, métricas por tipo, prontidão da base e ampliação dos testes | A implementação foi mantida e testada; a demonstração usa origem `MOCKED` identificada e a calibração acadêmica do C1 permanece a validar |
| 2026-11-15 | Alisson (GP) | OpenAI Codex | Mapear as branches, comparar o Caderno do Aluno, o planejamento detalhado, a documentação da Luísa e o backend; identificar o que existe e o que falta para o G3 | Diagnóstico por frente, situação de F1/F2/F3, lista de entregáveis ausentes e ordem de execução | A equipe preservou o `ETAPAS.md` da raiz, guardou o planejamento detalhado como referência e transformou a análise em diagnóstico verificável; itens sem evidência permaneceram como pendentes |
| 2026-11-15 | Alisson (GP) | OpenAI Codex | Preparar dados mockados para não bloquear o desenvolvimento da F1 e organizar os documentos de iniciação | Massa mockada de 40 casos, quatro janelas mockadas, relatório C1-MOCKED, termo de abertura, stakeholders e premissas/restrições | Os registros foram marcados como `MOCKED`, separados da série oficial e o C1 permaneceu “a validar”; a equipe rejeitou tratar a massa como evidência real |
| 2026-11-16 | Kauã (G3) | Claude Code | Mapear pelo histórico do Git quem fez o quê; revisar os documentos do G3 contra o código atual; ajustar os papéis da equipe | Tabela de autoria por conta, `.mailmap`, revisão de testes, bancada, manual e checklist, execução de build, lint e testes | Kauã corrigiu a premissa de que a Luísa era arquiteta (ela é do frontend) e definiu Nathan como arquiteto. Os testes do backend não rodaram nesta máquina e o resultado foi registrado como não reproduzido, em vez de repetir o "30 aprovados" de 15/11 |
| 2026-11-16 | Nathan | Claude Code | Rodar os testes do backend e analisar a cobertura, sem inventar resultados e sem alterar código; depois registrar o resultado na documentação de testes | Execução em ambiente virtual isolado: 30 testes aprovados e 85% de cobertura, com a lista de endpoints e regras sem teste conferida linha a linha | Nathan exigiu que nada fosse inventado nem alterado no código. O `pytest-cov` foi usado só para a medição e não foi adicionado ao `requirements.txt`. As lacunas foram registradas como pendências, sem criar testes nesta etapa |

## Erro da ferramenta (seção obrigatória de encerramento)

Um erro cometido pela ferramenta neste projeto e identificado pela equipe:

- **Qual era:** a primeira solução excluía sempre `MOCKED` da F1 e impedia demonstrar p50/p90 com a massa autorizada pelo GP.
- **Como foi detectado:** Alisson revisou a regra antes do commit e definiu que `MOCKED` deve alimentar a apresentação, sem ser declarado como coleta real ou validação acadêmica do C1.
- **Correção aplicada:** foi criada `ALLOW_MOCKED_ESTIMATES`; habilitada, a F1 calcula p50/p90 e retorna `data_source=MOCKED`. Desabilitada, mantém a exclusão segura. A correção possui teste automatizado.
