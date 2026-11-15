# Regras de commit

## O que o Caderno exige

- **Repositório único com o histórico completo.** Não reescreva o `main` (sem `push --force`, `rebase` ou `amend` em commit já publicado) e não altere datas.
- **Cada integrante com commits próprios** e autoria configurada. Quem não tiver comprova a contribuição em ata.
- **ADR e ata commitados no dia** da decisão ou da reunião.
- **Commits espalhados pelas nove semanas.** O gráfico de commits conta em Processo (C8).
- **Só commite o que você sabe explicar** na arguição.

## Autoria (uma vez por pessoa)

```bash
git config user.name "Seu Nome"
```

```bash
git config user.email "email-da-sua-conta-do-github@exemplo.com"
```

O e-mail precisa ser o do GitHub. Senão o commit não aparece no seu gráfico.

## Mensagem

```
tipo(escopo): descrição curta no imperativo
```

- **Tipos:** `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
- **Escopos:** `backend`, `front`, `docs`, `campo`, `hardware`, `qa`

```
feat(front): tela de fila da recepção
docs(adr): ADR-003 adota p50/p90 na estimativa da F1
docs(ata): ata da reunião de 16/11
```

## No dia a dia

- Um commit por mudança lógica, pequeno e frequente.
- Rode `git status` e `git diff` antes. Nunca commite `.env`, senhas ou dado que identifique pessoas.
- **Código** vai por Pull Request, em branch `feature/<frente>-<assunto>`, revisado por outro integrante. Evite *squash merge*, que apaga a autoria individual.
- **Documentação** (ata, ADR, campo, riscos) vai direto no `main`, no dia. Dê `git pull` antes.
- Se uma IA ajudou, registre em [registro-de-ia.md](registro-de-ia.md).
