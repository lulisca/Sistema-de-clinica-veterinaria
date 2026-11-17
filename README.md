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

### Contas de teste

Contas de demonstração do site publicado, com dados fictícios. Ficam aqui de propósito, para a equipe e a banca testarem. Não use estas senhas em nada real.

| Perfil | E-mail | Senha | Entra por |
|---|---|---|---|
| Recepção | `recepcao@teste.fila` | `WLFjvRVbR69r` | Entrar na recepção |
| Veterinário | `veterinario@teste.fila` | `OkVtE9zyRrnh` | Entrar na recepção |
| Admin | `admin@teste.fila` | `0zh6WQIRhfy3` | Entrar na recepção |
| Tutor | `tutor@teste.fila` | `-2XiS7UJjtBv` | Entrar na fila |

O tutor de teste ainda não tem animal: na primeira entrada na fila, a tela pede o nome e a espécie. Para testar o caminho completo, entre como tutor e entre na fila. Depois, em outra aba, entre como veterinário: o paciente aparece com os sintomas e pode ser arrastado para outra posição.

## Estado da versão

- backend e frontend integrados;
- 55 testes automatizados aprovados;
- C1 concluído como C1-MOCKED aprovado pelo GP, sem alegação de coleta real;
- hardware concluído como protótipo documental;
- CT19 local aprovado com ressalvas; publicação Vercel/Neon e CT20 aprovados.

## Execução local

Consulte `backend/README.md` e `frontend/README.md`.

## Documentação

O índice oficial está em `docs/README.md`. O uso de IA é consolidado exclusivamente em `docs/registro-de-ia.md`.

## Protótipo de telas

- Figma: `https://www.figma.com/design/MXo1MePOBJzkHhYrD2kczF/clinica-vet`
