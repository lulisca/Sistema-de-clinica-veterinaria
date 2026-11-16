# Regras de commit e integração

## Autoria

Cada integrante usa nome e e-mail associados à própria conta do GitHub. Não alterar autoria, datas ou histórico publicado e não usar `push --force` em commits compartilhados.

Configure `git config user.name` e `git config user.email` com os dados associados à conta do GitHub.

## Mensagem

Usar `tipo(escopo): descrição curta`, com tipos como `feat`, `fix`, `docs`, `test`, `refactor` e `chore`.

## Fluxo de branches

- `main`: versão estável e publicada.
- `development`: integração das frentes.
- branches `feature`: mudanças isoladas de código ou documentação.

Toda mudança segue de uma branch de feature para `development`. Depois da revisão e dos testes, `development` segue para `main`. Usar merge commit preserva a autoria individual.

## Antes do commit

- executar `git status`, `git diff --check` e `git diff`;
- não commitar ambiente, banco local, senha, token ou dado pessoal;
- atualizar `docs/registro-de-ia.md` quando houver uso relevante;
- registrar somente testes realmente executados;
- manter diagnósticos locais fora do Git.

## Pull Request

Informar objetivo, arquivos afetados, testes, limites, atividades em execução e impacto documental. Decisões atuais usam a data real; não criar ata, ADR ou evidência retroativa.
