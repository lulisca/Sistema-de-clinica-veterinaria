# Registro de IA

Ferramentas de IA são de uso autorizado, em qualquer volume, com declaração obrigatória. Uso declarado não é penalizado. Uso não declarado, havendo evidência, zera o critério de Processo (C8).

O que se avalia é a qualidade da crítica ao resultado, não o volume de uso. Uma linha por uso relevante.

## Usos

| Data | Quem | Ferramenta | O que foi solicitado | O que foi retornado | O que alteramos e por quê |
|---|---|---|---|---|---|
| 2026-10-29 | Grupo 1 | OpenAI Codex | Estruturar o backend da Agenda + Fila Virtual com base no Caderno do Aluno e no `ETAPAS.md` | Estrutura FastAPI/SQLAlchemy, modelos, API, migrations, testes e documentação técnica | O código foi revisado e integrado por PR. Na primeira execução, a ferramenta não encontrou o pacote `app`; o caminho de importação do `conftest.py` foi corrigido e a suíte foi reexecutada |
| 2026-10-29 | Grupo 1 | OpenAI Codex | Concluir a F1 sem depender da coleta real | Recálculo automático, histórico de previsões, métricas por tipo, prontidão da base e ampliação dos testes | A implementação foi mantida e testada. A decisão posterior do GP aprovou o C1-MOCKED para a entrega, com `ALLOW_MOCKED_ESTIMATES=true` e origem identificada, sem alegação de coleta real |
| 2026-11-15 | Alisson (GP) | OpenAI Codex | Mapear branches, comparar o Caderno do Aluno, o planejamento, a documentação e o backend; identificar o trabalho do G3 | Diagnóstico por frente, situação de F1/F2/F3, entregáveis e ordem de execução | O diagnóstico foi usado como controle local, não como entregável. `ETAPAS.md` e o planejamento detalhado foram preservados como referências, enquanto os documentos oficiais foram consolidados nas pastas 01–08 |
| 2026-11-15 | Alisson (GP) | OpenAI Codex | Preparar dados mockados para não bloquear a F1 e organizar a iniciação | Massa de 40 casos, quatro janelas, relatório C1-MOCKED, termo de abertura, stakeholders e premissas | A equipe manteve a origem `MOCKED`, recusou apresentar a massa como coleta real e, em 16/11, o GP aprovou o C1-MOCKED como linha de entrega |
| 2026-11-16 | Kauã (G3) | Claude Code | Mapear pelo histórico do Git quem fez o quê; revisar os documentos do G3 contra o código atual; ajustar os papéis da equipe | Tabela de autoria por conta, `.mailmap`, revisão de testes, bancada, manual e checklist, execução de build, lint e testes | Kauã corrigiu a premissa de que a Luísa era arquiteta (ela é do frontend) e definiu Nathan como arquiteto. Os testes do backend não rodaram nesta máquina e o resultado foi registrado como não reproduzido, em vez de repetir o "30 aprovados" de 15/11 |
| 2026-11-16 | Nathan | Claude Code | Rodar os testes do backend e analisar a cobertura, sem inventar resultados e sem alterar código; depois registrar o resultado na documentação de testes | Execução em ambiente virtual isolado: 30 testes aprovados e 85% de cobertura, com a lista de endpoints e regras sem teste conferida linha a linha | Nathan exigiu que nada fosse inventado nem alterado no código. O `pytest-cov` foi usado só para a medição e não foi adicionado ao `requirements.txt`. As lacunas foram registradas como pendências, sem criar testes nesta etapa |
| 2026-11-16 | Nathan (arquiteto) | Claude Code | Redigir o ADR-003 da hospedagem a partir da decisão de usar a Vercel e atualizar os documentos que tratavam a plataforma como pendente | ADR com opções (Vercel, Render, servidor próprio), decisão e consequências; ajustes no plano de publicação, arquitetura, EAP, escopo, riscos e premissas | Nathan definiu a Vercel como plataforma. O banco na Neon e os limites do plano gratuito (função serverless, cron diário, migrations manuais) foram registrados como consequências, sem declarar URL ou publicação que ainda não existe |
| 2026-11-16 | Alisson (GP) | OpenAI Codex | Auditar a versão integrada, revisar as pastas 01–08 e consolidar documentação, testes, arquitetura, encerramento e controle | Diagnóstico por pasta, correções de coerência, atualização para 43 testes, C1-MOCKED, manual, extensão, handoff e matriz RF01–RF18/CT01–CT32 | O GP validou cada pasta antes do commit. Foram preservados como “em execução” somente CT19, publicação/CT20 e merge final; nenhuma evidência externa foi inventada |

## Auditoria de registros paralelos

- O antigo `backend/docs/REGISTRO_IA_RASCUNHO.md` foi removido depois que suas duas utilizações de 29/10 foram consolidadas neste arquivo.
- A branch não integrada `feature/cadastro-tutor` contém `backend/docs/REGISTRO_IA_TUTOR_PREENCHER.md`, um formulário sem ferramenta, revisão ou justificativa confirmadas. Ele não é tratado como declaração válida nem é copiado como uso factual.
- Este arquivo é a única fonte oficial do Registro de IA da versão integrada.

## Erro da ferramenta (seção obrigatória de encerramento)

Um erro cometido pela ferramenta neste projeto e identificado pela equipe:

- **Qual era:** a primeira solução excluía sempre `MOCKED` da F1 e impedia demonstrar p50/p90 com a massa autorizada pelo GP.
- **Como foi detectado:** Alisson revisou a regra antes do commit e definiu que `MOCKED` deve alimentar a apresentação e compor o C1-MOCKED aprovado, sempre identificado e sem ser declarado como coleta real.
- **Correção aplicada:** foi criada `ALLOW_MOCKED_ESTIMATES`; habilitada, a F1 calcula p50/p90 e retorna `data_source=MOCKED`. Desabilitada, mantém a exclusão segura. A correção possui teste automatizado.

Outro erro técnico registrado no histórico foi a ausência do pacote `app` no caminho de importação da primeira execução automatizada. A equipe corrigiu o `conftest.py` e repetiu os testes antes de manter o backend.
