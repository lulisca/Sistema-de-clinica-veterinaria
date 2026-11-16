# Autocadastro e solicitação remota do tutor (alteração de 16/11/2026)

## Fluxo

1. `POST /api/auth/register-tutor` cria `User(role=TUTOR)` e perfil `Tutor` associado; `POST /api/auth/login` atende tanto equipe quanto tutores.
2. `GET /api/me`, `POST /api/me/animals`, `GET /api/me/animals` exigem bearer JWT com role `TUTOR`.
3. `POST /api/me/queue` cria uma solicitação **PENDING_TRIAGE** com descrição textual de sintomas e sem classificação clínica automática.
4. `GET /api/me/queue` consulta solicitações pertencentes à conta.
5. `PATCH /api/queue/{id}/priority` permanece restrito a `VETERINARIAN`/`ADMIN`; a primeira classificação de entrada `PENDING_TRIAGE` muda o status para `WAITING` quando `emergency` ou `priority_level` é enviado. A ordenação existente (`emergency`, `priority_level`, horário, ID) foi preservada.
6. O tutor pode acompanhar a posição e faixa de espera pela interface após a triagem usando o link público já existente `/api/public/status/{public_token}`; antes disso não recebe posição nem estimativa.

## Exemplos

```bash
curl -X POST http://localhost:8000/api/auth/register-tutor -H 'Content-Type: application/json' -d '{"name":"Maria","email":"maria@example.org","password":"senha-muito-segura"}'
# Use access_token como: Authorization: Bearer <token>
curl -X POST http://localhost:8000/api/me/animals -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' -d '{"name":"Mel","species":"DOG"}'
curl -X POST http://localhost:8000/api/me/queue -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' -d '{"animal_id":1,"appointment_type":"CONSULTATION","symptoms":"Tosse e cansaço desde ontem"}'
```

Não inclua `tutor_id`, `role`, `emergency`, `priority_level` ou `veterinarian_resource_id` no corpo da solicitação do tutor: a API rejeita campos extras. O tutor não escolhe prioridade e só consegue usar animais do perfil vinculado à própria conta. Uma solicitação ativa por animal é permitida na rota remota.

## Compatibilidade e implantação

- As rotas antigas `/api/tutors`, `/api/animals`, `/api/walk-ins` e `/api/appointments/{id}/check-in` continuam disponíveis para a equipe; perfis antigos podem não estar ligados a contas novas (`tutors.user_id` é opcional).
- **Migração obrigatória antes de iniciar a API sobre banco já existente:** `cd backend && alembic upgrade head`. `Base.metadata.create_all()` não adiciona colunas em tabelas existentes.
- A alteração foi validada em SQLite limpo com Alembic; testar PostgreSQL no ambiente de homologação.
- O frontend está em `frontend/`, independente dos módulos existentes de recepção/veterinário.
- Não substitui o trabalho de decisão de posição ou prioridade específica do líder; a rota antiga de prioridade foi conservada e apenas habilita solicitações pendentes após a classificação.

## Limites e decisões a validar com a clínica

- Solicitações remotas são pedidos de triagem, não check-ins presenciais. O instante de chegada física não é registrado automaticamente. Validar regra de chegada, ausência, tempo de fila e prioridade da clínica antes da produção.
- Sintomas podem conter dados pessoais informados livremente pelo tutor. Aplicar política de retenção, informar finalidade e restringir acesso conforme LGPD; não registrar texto de sintomas em logs públicos.
- Para produção, complementar validação de e-mail, rate limiting, proteção contra robôs/abuso, recuperação de senha, restrições de origem, HTTPS e estratégia segura de sessão. `auth/bootstrap` é uma configuração administrativa inicial e não deve permanecer exposta sem proteção em publicação real.
- Evitar criar múltiplas entradas com chamadas simultâneas (a checagem atual é pré-inserção, sem constraint exclusiva para entrada ativa).
- O build do frontend não pôde ser verificado nesta sessão porque a instalação npm não concluiu; executar `npm install && npm run build` em ambiente com acesso ao registro npm.

## Testes executados

`cd backend && pytest -q` — 34 testes passando. `alembic upgrade head` — executado com êxito sobre SQLite novo.
