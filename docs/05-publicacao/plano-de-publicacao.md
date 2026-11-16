# Plano de publicacao

> **Status em 2026-11-16:** plataforma escolhida no [ADR-003](../adr/003-hospedagem-vercel.md): frontend e API na Vercel, PostgreSQL na Neon. URLs ainda nao publicadas. Nao marcar como publicado sem smoke test externo.

## Topologia alvo

- frontend React + Vite (site estatico gerado por `npm run build` em `frontend/dist`) em projeto Vercel com raiz `frontend/`, `VITE_API_URL` apontando para a API publicada e rewrite das rotas para `index.html`;
- API FastAPI como funcao Python em projeto Vercel com raiz `backend/`;
- PostgreSQL gerenciado na Neon, pela integracao da Vercel;
- HTTPS em todos os acessos;
- limpeza dos snapshots F2 nas proprias operacoes F2; agendamento so por endpoint protegido + cron diario da Vercel, se aprovado (ver ADR-003).

## Variaveis obrigatorias da API

| Variavel | Producao |
|---|---|
| `DATABASE_URL` | conexao PostgreSQL com segredo fora do Git |
| `JWT_SECRET` | valor longo, aleatorio e exclusivo |
| `JWT_EXP_MINUTES` | prazo aprovado pela equipe |
| `CORS_ORIGINS` | URL exata do frontend |
| `MIN_SAMPLES_FOR_ESTIMATE` | trava tecnica documentada |
| `DEFAULT_FIXED_NOTICE_MINUTES` | valor aprovado ou claramente de demo |
| `LOCATION_RETENTION_MINUTES` | valor aprovado e tarefa de limpeza ativa |

## Procedimento

1. ~~escolher plataforma e registrar decisao~~: feito no ADR-003 (2026-11-16);
2. criar banco na Neon e guardar credenciais nas variaveis de ambiente da Vercel;
3. publicar API com comando de inicio documentado;
4. executar `alembic upgrade head` a partir de uma maquina local apontando para o banco de producao (a Vercel nao roda migrations no deploy);
5. criar primeiro usuario por bootstrap e depois proteger o fluxo;
6. configurar CORS para o frontend;
7. publicar frontend com URL da API;
8. definir a limpeza F2 agendada (endpoint + cron) ou registrar que vale so a limpeza nas operacoes F2;
9. executar smoke test;
10. registrar URLs, commit, data e responsavel.

## Smoke test externo

- [ ] HTTPS valido no frontend e API;
- [ ] Swagger/health responde conforme decisao de exposicao;
- [ ] login interno funciona;
- [ ] check-in cria entrada e token publico;
- [ ] tutor consulta apenas o proprio atendimento;
- [ ] F1 mostra faixa ou indisponibilidade correta;
- [ ] F2 aceita consentimento e negacao;
- [ ] aviso simulado e confirmacao funcionam;
- [ ] prioridade e recurso F3 funcionam;
- [ ] reinicio nao perde dados;
- [ ] segredo e `.env` nao estao no repositorio/log;
- [ ] snapshots expirados sao removidos.

## Registro da versao publicada

| Campo | Valor |
|---|---|
| Frontend URL | Pendente |
| API URL | Pendente |
| Commit/tag | Pendente |
| Data/hora | Pendente |
| Responsavel | Pendente |
| Resultado do smoke | Pendente |

## Rollback

Manter a versao anterior identificada. Em falha critica: interromper novas alteracoes, restaurar aplicacao anterior, preservar banco, registrar incidente e aplicar migration reversa somente se testada e necessaria.
