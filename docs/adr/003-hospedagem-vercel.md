# ADR-003 — Hospedagem na Vercel

- **Data:** 2026-11-16
- **Status:** aceito
- **Decidem:** Nathan (arquiteto)

## Contexto

O passo 1 do [plano de publicação](../05-publicacao/plano-de-publicacao.md) é escolher a plataforma e registrar a decisão. Sem isso o risco R02 (sistema não publicado para teste externo) continua aberto e a Empresa 02 não recebe a URL para a bancada cruzada.

Restrições que pesam na escolha:

- custo próximo de zero (premissa P03 e [custos](../02-planejamento/custos.md));
- HTTPS obrigatório, inclusive para o painel ESP32 (ADR-002);
- frontend React + Vite (site estático em `frontend/dist`) e API FastAPI com PostgreSQL;
- pouco tempo até a entrega e equipe sem experiência em operar servidor.

## Opções consideradas

1. **Vercel** (frontend e API)
   - \+ plano gratuito, HTTPS e domínio `*.vercel.app` automáticos;
   - \+ publica a cada push e gera URL de prévia por Pull Request, útil para revisar antes do merge;
   - \+ reconhece Vite e FastAPI, então cada pasta (`frontend/`, `backend/`) vira um projeto com pouca configuração;
   - \- a API roda como função *serverless*: há partida a frio e não existe processo `uvicorn` contínuo;
   - \- não tem PostgreSQL próprio; o banco vem de um provedor integrado (Neon, pelo Marketplace da Vercel);
   - \- *cron* do plano gratuito roda no máximo uma vez por dia.
2. **Render** (frontend estático + Web Service Python + PostgreSQL)
   - \+ roda `uvicorn` como processo contínuo, igual ao ambiente local;
   - \+ banco, API e site no mesmo painel;
   - \- o serviço gratuito hiberna e demora para acordar;
   - \- o PostgreSQL gratuito expira depois de um prazo e precisa ser recriado.
3. **Servidor próprio ou do campus** (Docker Compose do backend)
   - \+ reaproveita o `docker-compose.yml` já existente;
   - \- depende de liberação de rede, domínio e certificado HTTPS;
   - \- a equipe passa a operar e manter a máquina.

## Decisão

Hospedar **frontend e API na Vercel**, como dois projetos do mesmo repositório (raiz `frontend/` e raiz `backend/`), com **PostgreSQL gerenciado pela Neon** via integração da Vercel. É a opção gratuita com HTTPS e publicação automática que exige menos operação da equipe no prazo que resta.

## Consequências aceitas

- **Branch publicada:** produção sai da `main`; as branches de feature e a `development` geram só prévias.
- **Variáveis de ambiente:** ficam no painel da Vercel (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` etc.), nunca no Git. `VITE_API_URL` do frontend aponta para a URL da API.
- **Migrations:** não rodam sozinhas no deploy. Antes de cada publicação que mude o banco, alguém executa `alembic upgrade head` apontando para o banco de produção.
- **Limpeza F2:** a Vercel não executa `scripts/purge_expired_location_snapshots.py` diretamente. A limpeza nas próprias operações F2 continua valendo; se for preciso agendar, será por um endpoint protegido chamado pelo *cron* diário, o que precisa de mudança no backend e de ADR próprio.
- **Partida a frio:** a primeira chamada depois de um tempo parado pode demorar alguns segundos. Aceitamos para a demonstração e para a bancada.
- **Rotas do frontend:** o React Router precisa de regra de *rewrite* para `index.html`, senão recarregar uma tela interna devolve 404.
- **Dependência de fornecedor:** se a Vercel ou a Neon ficarem indisponíveis, o plano B é a execução local documentada (EAP 7.1 e 7.2).
