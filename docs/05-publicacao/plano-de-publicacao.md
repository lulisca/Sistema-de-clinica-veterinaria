# Plano de publicacao

> **Status em 2026-11-16:** execucao em andamento. O ADR-003 definiu frontend e API na Vercel e PostgreSQL na Neon. Este documento prepara a publicacao, mas nao declara URLs ou smoke test antes da execucao real.

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

| Verificacao | Estado antes da publicacao |
|---|---|
| HTTPS valido no frontend e API | Em execucao |
| `/docs` e API respondem | Em execucao |
| Login interno funciona | Em execucao |
| Cadastro, check-in ou encaixe geram token publico | Em execucao |
| Tutor consulta somente o proprio atendimento | Em execucao |
| F1 mostra p50/p90 `MOCKED` ou indisponibilidade correta | Em execucao |
| F2 aceita consentimento e negacao | Em execucao |
| Aviso `SIMULATOR` e confirmacao funcionam | Em execucao |
| Emergencia, reordenacao e recurso F3 funcionam | Em execucao |
| Dados persistem apos nova execucao da API | Em execucao |
| Segredos e `.env` nao aparecem no repositorio ou logs | Em execucao |
| Snapshots expirados sao removidos | Em execucao |

## Registro da versao publicada

| Campo | Registro atual |
|---|---|
| Frontend URL | A registrar apos smoke test |
| API URL | A registrar apos smoke test |
| Commit/tag | A registrar na versao publicada |
| Data/hora | A registrar na publicacao |
| Responsavel | A registrar na execucao |
| Resultado do smoke | A registrar apos verificacao externa |

## Rollback

Em falha critica, interromper novas alteracoes, identificar a ultima versao funcional, preservar o banco e registrar o incidente. Migration reversa somente pode ser aplicada se tiver sido testada e se os dados permanecerem protegidos. Se Vercel ou Neon estiverem indisponiveis, usar a execucao local documentada sem declarar publicacao externa.
