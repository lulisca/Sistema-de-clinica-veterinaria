# Frontend — Fila Virtual

Telas do tutor (celular, sem login) e da recepção (desktop, com login), feitas a partir do protótipo no Figma (`docs/04-arquitetura/prototipo-de-telas.md`).

**Stack:** React + Vite + TypeScript, React Router e CSS simples com as variáveis do Figma.

## Como rodar

1. Suba o backend (veja `backend/README.md`). Para a F2 funcionar, ele precisa de `LOCATION_RETENTION_MINUTES` e `DEFAULT_FIXED_NOTICE_MINUTES`.
2. No terminal:

```bash
cd frontend
npm install
cp .env.example .env.local   # no Windows: copy .env.example .env.local
npm run dev
```

3. Abra `http://localhost:3000/recepcao/login`. A porta 3000 é a que o backend libera no CORS.

| Comando | Para quê |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Confere os tipos (TypeScript) e gera a versão de produção em `dist/` |
| `npm run lint` | Procura erros comuns no código |

## Publicação (Vercel)

Decisão no [ADR-003](../docs/adr/003-hospedagem-vercel.md). No projeto da Vercel:

- **Root Directory:** `frontend`, com o preset **Vite** (build `npm run build`, saída `dist`). Com a raiz do repositório, nada é construído e todo endereço dá 404.
- **Variável de ambiente:** `VITE_API_URL` com a URL da API publicada. Sem ela, o site chama `http://localhost:8000/api` e o login falha.
- **`vercel.json`:** manda toda rota para o `index.html`. Sem ele, abrir ou recarregar `/recepcao/fila` ou o link do tutor (`/t/<token>`) dá 404, porque quem conhece essas rotas é o React Router, não o servidor.
- **Publicação automática:** cada merge na `main` publica o site e a API pelo workflow `.github/workflows/publicar-vercel.yml`. Ele usa o segredo `VERCEL_TOKEN` do repositório. A Vercel não liga o repositório direto porque ele é de uma conta pessoal e o projeto da Vercel é de outra, então não há prévia por Pull Request. Migrations continuam à mão: rode `alembic upgrade head` no banco de produção antes do merge que mudar o banco.

## Onde fica cada tela

| Figma | Rota | Arquivo |
|---|---|---|
| Página inicial (sem Figma): "Entrar na fila" ou "Entrar na recepção" | `/` | `src/paginas/Entrada.tsx` |
| Tutor entra ou cria conta (sem Figma) | `/tutor/entrar`, `/tutor/criar-conta` | `src/paginas/tutor/AcessoTutor.tsx` |
| Tutor entra na fila com os sintomas (sem Figma) | `/tutor` | `src/paginas/tutor/InicioTutor.tsx` |
| T1–T6 (tutor) | `/t/<token>` | `src/paginas/tutor/StatusTutor.tsx` |
| R1 Login | `/recepcao/login` | `src/paginas/recepcao/Login.tsx` |
| R2/R3 Fila, R9 vazia, R10 sem estimativa, R11 erro de rede | `/recepcao/fila` | `src/paginas/recepcao/Fila.tsx` |
| R4 Cadastro | `/recepcao/cadastro` | `src/paginas/recepcao/Cadastro.tsx` |
| R5 Detalhe do caso | `/recepcao/caso/<id>` | `src/paginas/recepcao/Detalhe.tsx` |
| R6 Recursos | `/recepcao/recursos` | `src/paginas/recepcao/Recursos.tsx` |
| R7 Avisos com falha | `/recepcao/avisos` | `src/paginas/recepcao/Avisos.tsx` |
| R8 Indicadores | `/recepcao/indicadores` | `src/paginas/recepcao/Indicadores.tsx` |

## Organização

```
src/
├── api.ts            todas as chamadas à API (uma função por rota)
├── tipos.ts          tipos das respostas da API (espelham backend/app/schemas)
├── textos.ts         tradução dos códigos da API e das mensagens de erro
├── formato.ts        horas e números no padrão brasileiro
├── localizacao.ts    F2: calcula os minutos até a clínica no navegador
├── sessao.ts         login da equipe (token guardado no navegador)
├── config.ts         valores lidos do .env.local
├── componentes/      peças reaproveitadas (selos, campo, botões de ação)
├── estilos/          variáveis do Figma (tokens.css) e componentes base
└── paginas/          uma pasta para o tutor e outra para a recepção
```

## Regras do projeto que as telas seguem

- **F1:** a espera aparece como faixa p50–p90 por tipo de atendimento. Sem amostras suficientes, a tela mostra "Indisponível", nunca "0 min".
- **F2:** a posição é pedida só em 3 momentos (entrada, chamada e retorno). Latitude e longitude ficam no navegador; a API recebe só os minutos de deslocamento. Quem nega a permissão continua na fila, com aviso por tempo fixo.
- **F3:** a fila filtra por espécie e tipo de atendimento. Só veterinário ou admin declara ou remove emergência e muda a ordem da fila (arrastando a linha ou com ↑ e ↓, só sem filtro). A recepção vê a ordem. A sala de isolamento é alocada antes de iniciar o atendimento.
- **Sintomas:** o que o tutor (ou a recepção) escreveu aparece na linha da fila e no detalhe do caso, para o veterinário decidir quem sobe. O link do tutor não mostra sintomas.
- O canal de aviso é `SIMULATOR`: nenhuma tela diz que mandou WhatsApp ou SMS.
- Erros 401, 403, 404, 409 e 422 aparecem traduzidos, sem apagar o que foi digitado.

## Limitações conhecidas (vêm da API atual)

- A fila não devolve o código nem o nome do animal, então a tela mostra "Animal nº 7". Se o backend incluir `animal_code` e `animal_name` na fila, as telas já mostram (`textos.ts`, `nomeDoPaciente`).
- Não existe busca de tutor ou de animal. Agendamento e encaixe cadastram um novo tutor e um novo animal a cada uso.
- Não existe lista de alocações abertas. A ocupação da sala de isolamento é deduzida da fila (paciente em atendimento que requer isolamento).
- A rota de decisão de retorno é só da equipe. Na tela do tutor (T3), o "Dá tempo?" é recalculado no navegador com a mesma regra do backend.
- A fila da recepção mostra a última revisão salva da estimativa. O tutor vê a estimativa calculada na hora, então os valores podem diferir em alguns minutos.
- Os quadros históricos "A DEFINIR" do Figma não fazem parte da interface implementada; as decisões atuais estão no contrato e nos ADRs do repositório.
