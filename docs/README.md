# Documentação do projeto — Fila Virtual (Empresa 01)

Esta pasta guarda a documentação do projeto. O Caderno do Aluno trata o repositório como evidência de processo: o que não está commitado aqui não conta na avaliação (C2 Gestão, C3 Arquitetura e ADRs, C8 Processo).

A documentação técnica do backend fica em `backend/docs/` (hoje só na branch `feature/backend-f1`, ainda fora do `main`).

## Regras que valem para tudo aqui

- **Commit no dia.** ADR e ata são commitados na data em que a decisão ou a reunião acontece. ADR sem commit na data da decisão não é computado.
- **Cada integrante commita com a própria conta.** Regras completas em [COMMITS.md](COMMITS.md).
- **Ninguém é identificado em dado de campo** (tutores, funcionários, nome do animal). Use código sequencial.
- **Uso de IA é declarado** em [registro-de-ia.md](registro-de-ia.md).

## Estrutura

```
docs/
├── README.md              este índice
├── COMMITS.md             regras de commit e de autoria
├── registro-de-ia.md      Registro de IA (obrigatório)
├── responsabilidades.md   quem faz o quê (proposta, a formalizar no ADR-000)
├── adr/                   um arquivo por decisão: NNN-titulo-curto.md
├── reunioes/              atas das segundas-feiras: AAAA-MM-DD-ata.md
├── 01-iniciacao/          termo de abertura, stakeholders, premissas
├── 02-planejamento/       escopo, EAP, cronograma, custos, riscos
├── 03-campo/              dado de campo, entrevista, calibração da F1
├── 04-arquitetura/        requisitos, modelo de dados, contrato, hardware
├── 05-implementacao/      sprints e notas de publicação
├── 06-testes/             plano de testes e bancada cruzada
└── 07-encerramento/       manual, relatório de extensão, lições aprendidas
```

Arquivos que começam com `_modelo` são modelos: copie, renomeie e preencha. Não edite o modelo.

## Entregáveis: onde cada um fica

"—" no prazo significa que o Caderno não fixa data; vale o cronograma interno. As referências a anexos são do Caderno do Aluno.

| Entregável | Arquivo | Prazo | Modelo |
|---|---|---|---|
| **Gestão** | | | |
| Termo de abertura | `01-iniciacao/termo-de-abertura.md` | S1 · 05/10 | Anexo B (criado) |
| Mapa de stakeholders | `01-iniciacao/stakeholders.md` | S2 · 12/10 | — |
| Premissas e restrições | `01-iniciacao/premissas-e-restricoes.md` | S2 · 12/10 | — |
| Cronograma da empresa | `02-planejamento/cronograma.md` | S2 · 12/10 | — |
| Escopo e EAP | `02-planejamento/escopo.md`, `eap.md` | S3 · 19/10 | — |
| Plano de comunicação | `02-planejamento/plano-de-comunicacao.md` | — | — |
| Estimativa de custos | `02-planejamento/custos.md` | S4 · 26/10 | — |
| Plano de riscos (revisado a cada marco) | `02-planejamento/plano-de-riscos.md` | S4 · 26/10 | Anexo C (criado) |
| Atas semanais | `reunioes/AAAA-MM-DD-ata.md` | toda segunda, commit no dia | Anexo G (criado) |
| **Análise e arquitetura** | | | |
| Requisitos e casos de uso | `04-arquitetura/requisitos-e-casos-de-uso.md` | S3 · 19/10 | — |
| Contrato de interface (congelado) | `04-arquitetura/contrato-de-interface.md` | S4 · 26/10 | — |
| Modelo de dados | `04-arquitetura/modelo-de-dados.md` | S4 · 26/10 | — |
| Esquema de hardware | `04-arquitetura/esquema-de-hardware.md` | S4 · 26/10 | veja abaixo |
| Documento de arquitetura | `04-arquitetura/arquitetura.md` | — | — |
| Protótipo de telas | `04-arquitetura/prototipo-de-telas.md` | — | — |
| ADRs | `adr/NNN-titulo-curto.md` | na data de cada decisão | Anexo A (criado) |
| **Campo** | | | |
| Entrevista com o responsável | `03-campo/entrevista.md` | S3 · 19/10 | roteiro no Anexo E (em `03-campo/README.md`) |
| Fichas e série de atendimentos digitada | `03-campo/serie-de-atendimentos.csv` | S5 · 02/11 | Anexo D (criado) |
| Relatório de calibração da F1 | `03-campo/relatorio-calibracao-f1.md` | S7 · 16/11 | — |
| **Implementação** | | | |
| Código, integração das três frentes, sistema publicado | raiz do repositório | S7 · 16/11 (congelamento) | — |
| **Qualidade** | | | |
| Plano de testes | `06-testes/plano-de-testes.md` | S6 · 09/11 | — |
| Testes automatizados | junto ao código | — | — |
| Relatório de bancada cruzada (produzido) | `06-testes/relatorio-bancada-cruzada.md` | S8 · 23/11 | Anexo F (criado) |
| Respostas aos defeitos recebidos | `06-testes/respostas-aos-defeitos.md` | S8 · 23/11 | veja o Anexo F |
| **Encerramento** | | | |
| Manual do usuário | `07-encerramento/manual-do-usuario.md` | S7 · 16/11 | — |
| Relatório de extensão | `07-encerramento/relatorio-de-extensao.md` | S9 · 30/11 | — |
| Apresentação final (slides + roteiro da demo) | `07-encerramento/apresentacao/` | S9 · 30/11 | — |
| Lições aprendidas | `07-encerramento/licoes-aprendidas.md` | 03/12 | — |
| **Processo** | | | |
| Registro de IA | `registro-de-ia.md` | contínuo | criado |
| Histórico do repositório | o próprio Git | contínuo | — |

### ADRs obrigatórios

- **ADR-000:** critério de divisão da turma, as três frentes, nomes e papéis (já na S1).
- **ADR da F2:** como a posição do tutor é obtida.
- **ADR do hardware.**

Toda decisão relevante vira ADR, incluindo stack, forma de integração, hospedagem, canal de notificação, eixos de segregação e faixa da estimativa (p50/p90 ou média ± desvio).

### Esquema de hardware (`04-arquitetura/esquema-de-hardware.md`)

Precisa conter: diagrama de blocos; componentes com justificativa (inventário do campus ou orçamento de fornecedor com preço e prazo); protocolo de comunicação com o servidor; alimentação e consumo calculados (tensão, corrente, fonte, proteção); e um ADR da decisão.
