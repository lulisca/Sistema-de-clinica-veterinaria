# Interface do tutor (React + Vite + TypeScript)

## Iniciar

1. Rode o backend em `localhost:8000` (`cd ../backend && uvicorn app.main:app --reload`).
2. Nesta pasta, execute `npm install` e `npm run dev`.
3. Acesse `http://localhost:5173`. O Vite encaminha `/api` ao backend local.

Para apontar para outro backend, configure `VITE_API_URL` no ambiente do build. A interface atende cadastro/login, cadastro do animal, solicitação remota com sintomas e acompanhamento (consulta a cada 15 s). Não inclui telas da equipe clínica, notificação push, confirmação de retorno ou geolocalização.

Não grave JWT em localStorage: por padrão a sessão existe apenas na memória da aba. Para implantação real, é necessário complementar o desenho de sessão e proteção contra abuso.
