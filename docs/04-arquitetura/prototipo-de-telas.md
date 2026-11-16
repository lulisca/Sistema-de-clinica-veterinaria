# Prototipo de telas - Fila Virtual

> **Estado em 2026-11-16:** referencia visual alinhada ao frontend integrado na `development`. O codigo e as 12 capturas do manual representam a versao atual; o Figma permanece como artefato de concepcao.

- **Referencia:** [clinica-vet (Figma)](https://www.figma.com/design/MXo1MePOBJzkHhYrD2kczF/clinica-vet)
- **Responsavel:** Grupo 2 - Frontend
- **Fontes:** contrato da API, F2 e `contrato-de-interface.md`

## Identidade visual

| Item | Decisao aplicada |
|---|---|
| Cores | Verde, menta e laranja |
| Tipografia | Plus Jakarta Sans ou fallback configurado |
| Formas | Cantos arredondados e alvos de toque adequados |
| Conteudo | Posicao, faixa de espera, estado e acao principal sem excesso de texto |

## Rotas implementadas

| Rota | Interface |
|---|---|
| `/t/{token}` | Status publico, estimativa, localizacao e retorno |
| `/recepcao/login` | Login da equipe |
| `/recepcao/fila` | Fila, filtros, reordenacao e acoes |
| `/recepcao/cadastro` | Tutor, animal, agenda, check-in e encaixe |
| `/recepcao/caso/{id}` | Detalhe, sintomas, F2, recursos e historico |
| `/recepcao/recursos` | Recursos compartilhados |
| `/recepcao/avisos` | Falhas e providencias da recepcao |
| `/recepcao/indicadores` | Metricas e prontidao F1 |

O backend possui autoatendimento autenticado do tutor, mas o frontend atual nao inclui telas proprias para esse fluxo. A interface aprovada usa cadastro assistido e acompanhamento por link publico.

## Estados do tutor

| Estado | Comportamento |
|---|---|
| Normal | Posicao e p50/p90 quando disponiveis |
| Sem estimativa | Posicao mantida e faixa indisponivel, nunca zero |
| Localizacao permitida | Minutos calculados no navegador; somente `travel_minutes` e enviado |
| Localizacao negada | Acesso mantido e aviso fixo de 20 min `MOCKED` |
| Retorno | Viabilidade com margem de 10 min `MOCKED` e confirmacao |
| Erro | Diferencia link invalido, falha da API e ausencia de conexao |

## Estados da equipe

- fila vazia, carregando, erro e ausencia de estimativa;
- filtros por especie, tipo e estado;
- emergencia declarada ou removida por veterinario/admin;
- reordenacao por arrastar ou botoes subir/descer;
- conflito `409` recarrega a fila antes de nova tentativa;
- sintomas restritos a equipe;
- recursos, avisos com falha e indicadores F1.

Os nomes oficiais exibidos sao **Retornando** para `RETURNING` e **Concluído** para `COMPLETED`.

## Decisoes consolidadas

- F1 usa faixa p50/p90;
- F2 usa 20 min de aviso fixo, 60 min de retencao e 10 min de margem como configuracao `MOCKED` aprovada;
- canal da demonstracao: `SIMULATOR`;
- distancia calculada no navegador por Haversine e velocidade media configuravel;
- F3 usa especie, tipo/motivo, emergencia autorizada, riscos e recursos exclusivos;
- veterinario/admin controla emergencia e ordem;
- `GET /public/status/{token}` retorna `estimate` para a tela do tutor.

## Integridade

- o sistema nao diagnostica nem classifica gravidade;
- negar localizacao nao bloqueia o tutor;
- sintomas, contato e coordenadas nao aparecem publicamente;
- dados de demonstracao permanecem `MOCKED`;
- fluxos nao implementados nao sao apresentados como existentes.
