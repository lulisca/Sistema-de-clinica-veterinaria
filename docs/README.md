# Documentação do projeto — Vila Nova EC

Esta pasta concentra a documentação oficial do sistema de fila virtual da Clínica Vila Nova EC, cenário `MOCKED` situado em Engenheiro Coelho/SP. Documentos históricos e materiais de trabalho permanecem identificados como referência e não substituem a linha de base revisada em 2026-11-16.

## Fontes oficiais

- **Gestão e entrega:** pastas numeradas `01` a `08`.
- **Decisões:** `docs/adr/`.
- **Uso de IA:** somente `docs/registro-de-ia.md`.
- **Responsabilidades:** `docs/responsabilidades.md`.
- **Contrato técnico detalhado:** `backend/docs/`.
- **Planejamento original:** `ETAPAS.md` na raiz.
- **Material preservado:** `docs/referencias/`, sem valor de estado atual.

## Estrutura atual

```text
docs/
├── 01-iniciacao/       abertura, stakeholders, premissas e restrições
├── 02-planejamento/    escopo, EAP, cronograma, custos, comunicação e riscos
├── 03-campo/           C1-MOCKED, entrevista, janelas e massa de 40 registros
├── 04-arquitetura/     requisitos, contrato, modelo, arquitetura e hardware
├── 05-publicacao/      plano de deploy e checklist de congelamento
├── 06-testes/          plano, resultados, bancada e defeitos
├── 07-encerramento/    manual, demonstração, extensão e lições aprendidas
├── 08-controle/        integração frontend/backend e rastreabilidade
├── adr/                decisões arquiteturais e de projeto
├── referencias/        documentos históricos preservados
├── reunioes/           modelo e atas reais, quando existirem
├── COMMITS.md
├── registro-de-ia.md
└── responsabilidades.md
```

Arquivos `_modelo-*` são modelos vazios. Não representam atividade executada.

## Estado consolidado

| Área | Estado em 2026-11-16 | Evidência principal |
|---|---|---|
| C1 | Concluído como C1-MOCKED aprovado pelo GP | `03-campo/` |
| Planejamento | Consolidado | `01-iniciacao/` e `02-planejamento/` |
| Arquitetura | Consolidada para a versão atual | `04-arquitetura/` e `adr/` |
| Backend | Integrado e com 43 testes aprovados | `backend/` e `06-testes/resultados-testes.md` |
| Frontend | Integrado ao contrato atual | `frontend/` e `08-controle/handoff-frontend.md` |
| Hardware | Concluído como protótipo documental | `04-arquitetura/esquema-de-hardware.md` |
| Manual e encerramento | Concluídos com 12 capturas | `07-encerramento/` |
| Publicação externa | Em execução | `05-publicacao/` |
| CT19 e CT20 | Em execução | `06-testes/resultados-testes.md` |

## Regras de integridade

- dados `MOCKED` devem permanecer identificados e não podem ser apresentados como coleta real;
- nenhuma URL, parceiro, teste ou aprovação externa é declarada sem evidência;
- mudanças relevantes atualizam código, teste e documentação na mesma entrega;
- todo uso relevante de IA é consolidado em `registro-de-ia.md`;
- a integração segue Pull Request de feature para `development` e, após revisão, de `development` para `main`.
