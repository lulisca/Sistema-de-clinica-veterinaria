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

## Branches

```
main                               versão estável: é dela que sai o sistema publicado e a apresentação
 └─ development                    onde o código das frentes se junta e é testado
     └─ feature/<frente>-<assunto> onde cada um trabalha (ex.: feature/front-tela-login)
```

### Código, passo a passo

1. Parta sempre da `development` atualizada:

   ```bash
   git checkout development
   git pull
   git checkout -b feature/front-tela-login
   ```

2. Faça commits pequenos e envie a branch: `git push -u origin feature/front-tela-login`.
3. Abra o Pull Request **para a `development`**. No GitHub, troque o *base* de `main` para `development`.
4. Outro integrante revisa. Faça o merge com **Create a merge commit**, nunca *Squash and merge*, que apaga a autoria individual.
5. Com a `development` testada, alguém abre o PR **`development` → `main`**. Isso precisa acontecer antes de cada entrega: congelamento em 16/11 e versão final em 03/12.

### Documentação

Ata, ADR, campo e riscos continuam indo **direto na `main`**, no dia. A `development` não precisa ter a documentação em dia: o PR `development` → `main` junta tudo.

## No dia a dia

- Um commit por mudança lógica, pequeno e frequente.
- Rode `git status` e `git diff` antes. Nunca commite `.env`, senhas ou dado que identifique pessoas.
- **Código** vai por Pull Request para a `development`, em branch `feature/<frente>-<assunto>`, revisado por outro integrante. Veja [Branches](#branches).
- **Documentação** (ata, ADR, campo, riscos) vai direto no `main`, no dia. Dê `git pull` antes.
- Se uma IA ajudou, registre em [registro-de-ia.md](registro-de-ia.md).
