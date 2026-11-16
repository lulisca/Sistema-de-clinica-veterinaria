# Protótipo de telas — Fila Virtual

- **Arquivo:** [clinica-vet (Figma)](https://www.figma.com/design/MXo1MePOBJzkHhYrD2kczF/clinica-vet) — o nome combinado era "Fila Virtual - Protótipo"; a API do Figma não renomeia o documento, então o título é ajustado à mão.
- **Responsável:** Grupo 2 · Frontend
- **Fonte do conteúdo:** `backend/docs/API_CONTRACT.md` e `backend/docs/F2_IMPLEMENTACAO.md`

## Identidade visual

Inspirada em um app de pet shop de referência: verde, laranja, cantos bem arredondados e fotos de pets.

| Item | Decisão |
|---|---|
| Cores | Verde-floresta (marca), menta (fundo e destaque), laranja (ação principal). Variáveis `cor/fundo/*` e `cor/acao/*` |
| Fonte | Plus Jakarta Sans, a mais próxima da referência. Identificada por comparação visual, não confirmada. Trocar a fonte é mudar 13 estilos de texto |
| Formas | Cantos de 8, 16 e 24 px; botões em pílula |
| Contraste | Todos os pares passam em AA. O menor é 4,8:1 (texto verde-escuro no botão laranja) |
| Texto | Pouco. O tutor vê 1 número, 1 faixa de espera e 1 botão; explicações e regras ficam na documentação |

### Fotos

Pexels, licença Pexels (uso livre). Fotógrafos não conferidos.

- T1: [Obedient Golden Retriever](https://www.pexels.com/photo/obedient-golden-retriever-18106144/)
- T3: [Brown Short-coat Dog](https://www.pexels.com/photo/brown-short-coat-dog-3148115/)
- R1 (login): [Golden Retriever Portrait in Natural Light](https://www.pexels.com/photo/golden-retriever-portrait-in-natural-light-30810888/)

## Páginas do arquivo

| Página | Conteúdo |
|---|---|
| 00 · Leia-me | Índice e as duas regras fixas |
| 01 · Fundamentos | Cor, tipografia, espaçamento, raio e alvo de toque |
| 02 · Componentes | Botão, selos, aviso, campo, cartões, com variantes |
| 03 · Tutor (390) | 6 telas e a folha de variações do indicador |
| 04 · Recepção (1440) | 11 telas |
| 05 · A DEFINIR | Decisões em aberto |
| 06 · Arquivo | Telas do tutor da primeira versão, com mais texto (guardadas, não apagadas) |

## Telas do tutor — mobile 390 px, sem login

| Frame | O que mostra | Origem no contrato |
|---|---|---|
| `T1` Status | Foto, posição, faixa de espera, selo de estado | `GET /public/status/{token}` |
| `T2` Localização | Pedido de permissão em 3 momentos, Permitir e Agora não | `GET .../location-consent`, `POST .../location` |
| `T3` É a sua vez | Foto, indicador de retorno, Estou voltando | `POST .../confirm-return`, `GET /queue/{id}/return-decision` |
| `T3b` Indicador | As 4 variações: dá tempo, em risco, não dá tempo, sem dados | `return_feasibility` |
| `T4` Sem estimativa | Posição mantida, faixa indisponível | `estimate.status = insufficient_data` |
| `T5` Localização negada | Aviso por tempo fixo | `FIXED_NOTICE` |
| `T6` Erros | Sem conexão e link inválido | `404 Invalid status link` |

## Telas da recepção — desktop 1440 px, com login

`R1` Login · `R2` Fila (veterinário) · `R3` Fila (recepção, sem emergência) · `R4` Cadastro · `R5` Detalhe do caso · `R6` Recursos e sala de isolamento · `R7` Avisos com falha · `R8` Indicadores · `R9` Fila vazia · `R10` Fila sem estimativa · `R11` Erro de rede.

Os parágrafos explicativos que existiam nessas telas foram ocultados, não apagados: são as camadas ocultas chamadas `Descrição`, `Nota`, `Rodapé da tabela`, `Explicação`, `Observação` e similares.

## Em aberto (A DEFINIR)

- Níveis de prioridade além de emergência
- Canal de notificação (hoje, simulador)
- Outros eixos de segregação (risco, recurso)
- Prazo de retenção da localização, antecedência fixa sem GPS e margem de segurança do retorno (hoje 60, 20 e 10 min, só de demonstração)
- Serviço que converte a posição em tempo de deslocamento
- Tolerância de atraso, reinserção e precedência agendado × encaixe
- Faixa da estimativa: p50/p90 ou média ± desvio
- Telas do veterinário e do gestor

A faixa de espera aparece na tela do tutor porque `GET /public/status/{token}` já devolve `estimate` ([router.py:704](../../backend/app/api/router.py)). O `API_CONTRACT.md` ainda não diz isso e deve ser atualizado.

## Regras que o protótipo sustenta

- O sistema não diagnostica nem classifica gravidade. A emergência só aparece depois de declarada pelo veterinário.
- LGPD: nenhuma tela pede ou mostra latitude e longitude; quem nega a localização continua usando o sistema.
- Dados fictícios: animais por código `AN-xxx`, tutores por código `T-xxx`, sem nome real de pessoa.
