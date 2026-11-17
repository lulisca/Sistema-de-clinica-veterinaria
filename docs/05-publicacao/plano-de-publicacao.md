# Plano de publicacao

> **Status em 2026-11-16:** publicacao concluida. Frontend e API respondem por HTTPS na Vercel, o PostgreSQL Neon respondeu pelas rotas autenticadas e o CT20 basico foi aprovado no commit `0fd8c67`.

## Topologia

- frontend React + Vite em projeto Vercel com raiz `frontend/`, build `npm run build` e saida `dist`;
- API FastAPI em projeto Vercel com raiz `backend/` e aplicacao em `app/main.py`;
- PostgreSQL gerenciado pela Neon;
- HTTPS em todos os acessos;
- `VITE_API_URL` apontando para a API publicada;
- rewrite SPA configurado para que rotas React recarreguem em `index.html`;
- snapshots F2 removidos nas operacoes atuais; cron futuro exige endpoint protegido e nova decisao.

## Variaveis da API

| Variavel | Valor ou regra da entrega |
|---|---|
| `DATABASE_URL` | Conexao PostgreSQL da Neon, armazenada somente no painel |
| `JWT_SECRET` | Segredo longo, aleatorio e exclusivo do ambiente |
| `JWT_EXP_MINUTES` | Prazo definido para a demonstracao |
| `CORS_ORIGINS` | URL HTTPS exata do frontend |
| `MIN_SAMPLES_FOR_ESTIMATE` | Trava tecnica documentada |
| `DEFAULT_FIXED_NOTICE_MINUTES` | `20`, configuracao `MOCKED` aprovada |
| `LOCATION_RETENTION_MINUTES` | `60`, configuracao `MOCKED` aprovada |
| `ALLOW_MOCKED_ESTIMATES` | `true` na demonstracao atual, com `data_source=MOCKED` |

O arquivo `backend/.env.example` e referencia local e nao deve ser copiado cegamente. Antes da publicacao, substituir banco local, segredo de exemplo e CORS. Manter `ALLOW_MOCKED_ESTIMATES=true` somente porque a entrega usa C1-MOCKED identificado.

## Variaveis do frontend

| Variavel | Valor ou regra da entrega |
|---|---|
| `VITE_API_URL` | URL HTTPS da API seguida de `/api` |
| `VITE_CLINICA_LATITUDE` | Coordenada de referencia do cenario Vila Nova EC `MOCKED` |
| `VITE_CLINICA_LONGITUDE` | Coordenada de referencia do cenario Vila Nova EC `MOCKED` |
| `VITE_VELOCIDADE_MEDIA_KMH` | `30`, valor de demonstracao |
| `VITE_AVISO_FIXO_MIN` | `20`, configuracao `MOCKED` |
| `VITE_MARGEM_SEGURANCA_MIN` | `10`, configuracao `MOCKED` |

## Procedimento de publicacao

1. criar o banco PostgreSQL na Neon;
2. configurar as variaveis da API no projeto Vercel do backend;
3. executar `alembic upgrade head` apontando para a Neon;
4. publicar a API e verificar `/docs` e uma rota `/api` autenticada;
5. criar o primeiro usuario interno por bootstrap e proteger o uso posterior;
6. configurar `CORS_ORIGINS` com a URL definitiva do frontend;
7. configurar variaveis, build, diretorio `dist` e rewrite SPA do frontend;
8. publicar o frontend e confirmar que recarregar rotas internas nao retorna 404;
9. executar jornada ponta a ponta e smoke test;
10. registrar URLs, commit, data, responsavel e resultado.

## Smoke test externo

| Verificacao | Resultado em 2026-11-16 |
|---|---|
| HTTPS valido no frontend e API | Aprovado: frontend, rota interna, Swagger, OpenAPI e health responderam `200` |
| `/docs` e API respondem | Aprovado: `/docs`, `/openapi.json` e `/api/health` |
| Login interno funciona | Aprovado com conta de demonstracao da recepcao; perfil `RECEPTION` retornado |
| Cadastro, check-in ou encaixe geram token publico | Coberto no CT19 local; nao repetido no smoke externo basico |
| Tutor consulta somente o proprio atendimento | Coberto pela suite e pelo CT19; nao repetido no smoke externo basico |
| F1 mostra p50/p90 `MOCKED` ou indisponibilidade correta | Coberto pela suite e pelo CT19; nao repetido no smoke externo basico |
| F2 aceita consentimento e negacao | Coberto pela suite e pelo CT19; nao repetido no smoke externo basico |
| Aviso `SIMULATOR` e confirmacao funcionam | Coberto pela suite e pelo CT19; nao repetido no smoke externo basico |
| Emergencia, reordenacao e recurso F3 funcionam | Coberto pela suite e pelo CT19; nao repetido no smoke externo basico |
| PostgreSQL Neon responde em rota autenticada | Aprovado: leitura da fila retornou `200` e uma entrada persistida |
| Segredos e `.env` nao aparecem no repositorio | Aprovado na revisao do repositorio; credenciais publicas sao somente contas ficticias de demonstracao |
| Snapshots expirados sao removidos | Coberto pela suite automatizada; nao repetido no smoke externo basico |

## Registro da versao publicada

| Campo | Registro atual |
|---|---|
| Frontend URL | `https://clinica-veterinaria-mocha.vercel.app` |
| API URL | `https://clinica-veterinaria-api-seven.vercel.app` |
| Swagger | `https://clinica-veterinaria-api-seven.vercel.app/docs` |
| Commit/tag | `0fd8c67`, merge do PR #20 (`development` para `main`) |
| Data | 2026-11-16 |
| Publicacao | Leonardo e equipe, por workflow Vercel integrado no PR #18 |
| Verificacao | Alisson (GP), com apoio do OpenAI Codex, em requisicoes externas nao destrutivas |
| Resultado do smoke | CT20 aprovado: frontend, rota SPA, API, health, CORS, login e leitura autenticada da fila |

## Rollback

Em falha critica, interromper novas alteracoes, identificar a ultima versao funcional, preservar o banco e registrar o incidente. Migration reversa somente pode ser aplicada se tiver sido testada e se os dados permanecerem protegidos. Se Vercel ou Neon estiverem indisponiveis, usar a execucao local documentada sem declarar publicacao externa.
