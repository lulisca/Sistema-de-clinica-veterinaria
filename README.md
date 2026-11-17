# Sistema de clínica veterinária — Vila Nova EC

Projeto Integrador UNASP-EC: agenda e fila virtual para clínica veterinária, com estimativa de espera, aviso por deslocamento, prioridade autorizada e controle de recursos.

## Componentes

- `backend/`: FastAPI, SQLAlchemy, Alembic e suite de testes.
- `frontend/`: React, Vite e TypeScript para recepção e tutor.
- `docs/`: documentação oficial, arquitetura, testes, manual e encerramento.

## Como acessar

Site publicado: https://clinica-veterinaria-mocha.vercel.app (a API fica em https://clinica-veterinaria-api-seven.vercel.app/docs).

| Quem | Por onde entra | O que faz |
|---|---|---|
| Tutor com conta | Página inicial → **Entrar na fila** | Cria a conta, cadastra o animal, entra na fila com os sintomas e acompanha a vez |
| Tutor sem conta | Link `/t/<código>` que a recepção manda | Acompanha a vez depois do encaixe ou do check-in feito pela recepção |
| Recepção, veterinário e admin | Página inicial → **Entrar na recepção** | Fila, cadastro, recursos, avisos e indicadores. Só o veterinário e o admin mudam a ordem da fila |

As contas de teste da equipe ficam com o grupo do frontend (G2); as senhas não vão para o repositório.

## Estado da versão

- backend e frontend integrados;
- 49 testes automatizados aprovados;
- C1 concluído como C1-MOCKED aprovado pelo GP, sem alegação de coleta real;
- hardware concluído como protótipo documental;
- CT19 local aprovado com ressalvas; publicação Vercel/Neon e CT20 em execução.

## Execução local

Consulte `backend/README.md` e `frontend/README.md`.

## Documentação

O índice oficial está em `docs/README.md`. O uso de IA é consolidado exclusivamente em `docs/registro-de-ia.md`.

## Protótipo de telas

- Figma: `https://www.figma.com/design/MXo1MePOBJzkHhYrD2kczF/clinica-vet`
