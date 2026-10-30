# Registro de IA — rascunho para revisão da equipe

> Este arquivo é um **rascunho**, não uma declaração automática da equipe. Ajustem conforme o que realmente foi aproveitado, modificado e aprovado antes do commit.

| Data | Solicitação | Retorno da ferramenta | Alterações/validação da equipe | Motivo |
|---|---|---|---|---|
| 29/10/2026 | Auxílio para construir o backend do projeto Agenda + Fila Virtual a partir do Caderno do Aluno e ETAPAS.md. | Estrutura FastAPI/SQLAlchemy, modelos, API REST, regras iniciais F1/F2/F3, testes, documentação, migration e roteiro S5. | **Preencher após revisão:** registrar arquivos aproveitados, alterações e decisões recusadas/aceitas. | Acelerar scaffolding, tornar requisitos testáveis e preparar contrato de integração. |
| 29/10/2026 | Concluir a F1 fora da dependência dos dados reais. | Recalculo automático após eventos da fila, histórico versionado de previsões, métricas por tipo, prontidão da base, migration adicional, gerador de relatório e ampliação dos testes. | **Preencher após revisão:** confirmar comportamento, registrar alterações e decisões da equipe. | Fechar a implementação técnica da F1 sem declarar calibração inexistente. |

## Pontos que exigem crítica da equipe

- Stack e algoritmo inicial da F1 são propostas de arquitetura, não decisões já homologadas.
- Tolerância de atraso, reinserção, desempate, antecedência sem GPS, retenção e canal de notificação não foram definidos automaticamente.
- O valor mínimo técnico `MIN_SAMPLES_FOR_ESTIMATE=3` existe somente para desenvolvimento/testes do algoritmo; **não substitui a exigência acadêmica de coleta**.

## Erro encontrado durante a geração técnica

Na primeira execução automatizada dos testes, o ambiente de teste não encontrava o pacote `app` (`ModuleNotFoundError`). O problema era a configuração do caminho de import no `conftest.py`; foi corrigido e a suíte foi executada novamente com sucesso.

Esse registro de erro pode servir como evidência do processo de revisão, mas a equipe deve descrevê-lo com suas próprias palavras e só mantê-lo se considerar que representa de fato um uso relevante de IA no projeto.
