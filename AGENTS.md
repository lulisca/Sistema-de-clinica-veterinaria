# Instruções para agentes de IA

Projeto Integrador UNASP-EC "Fila Virtual": sistema de fila de atendimento para clínica veterinária. Antes de alterar qualquer coisa, leia:

- [docs/COMMITS.md](docs/COMMITS.md): branches, Pull Requests e formato das mensagens de commit.
- [docs/README.md](docs/README.md): onde fica cada documento.
- [backend/docs/API_CONTRACT.md](backend/docs/API_CONTRACT.md): contrato da API.

## Estrutura

- `backend/`: API em FastAPI (Python).
- `frontend/`: React + Vite + TypeScript. Como rodar e onde fica cada tela: [frontend/README.md](frontend/README.md).
- `docs/`: documentação do projeto.

## Regras

- **Código:** trabalhe em `feature/<frente>-<assunto>`, criada a partir da `development`. O Pull Request vai para a `development`, nunca direto para a `main`.
- **Documentação** (ata, ADR, campo, riscos) vai direto na `main`, no dia.
- Não reescreva histórico publicado: sem `push --force`, `rebase` ou `amend`. Sem *squash merge*.
- Mensagem de commit: `tipo(escopo): descrição curta no imperativo`.
- Mantenha o código simples. Qualquer integrante pode ser sorteado para explicá-lo ao professor.
- Nunca commite `.env`, senhas ou dado que identifique pessoas.
- O uso de IA precisa ser registrado pelo integrante em [docs/registro-de-ia.md](docs/registro-de-ia.md).
