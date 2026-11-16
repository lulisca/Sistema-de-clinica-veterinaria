# F2 — implementação de deslocamento e chamada

## Estado

Implementação integrada com notificação simulada. O canal real permanece fora do escopo congelado. A configuração `MOCKED` aprovada usa aviso de 20 minutos, retenção de 60 minutos e margem de 10 minutos.

## Fluxo

1. O tutor abre o link público do próprio atendimento.
2. A interface consulta `GET /api/public/status/{token}/location-consent` e apresenta a finalidade antes de solicitar permissão do navegador.
3. Se o tutor consentir, o cliente obtém a posição apenas naquele momento, calcula o deslocamento por Haversine no navegador e envia somente `travel_minutes` para `POST /api/public/status/{token}/location`. Coordenadas não são enviadas ao backend.
4. Se o tutor negar, a interface envia `consent_given=false` sem dados de deslocamento. O sistema continua funcionando e usa o aviso fixo `MOCKED` de 20 minutos.
5. A recepção consulta `GET /api/queue/{id}/return-decision?safety_margin_minutes=N` ou chama o endpoint `notifications/evaluate`.
6. O cálculo compara p50 de espera com tempo de deslocamento + margem. A resposta indica se a chegada é viável, está em risco ou é inviável pelo p50.
7. O simulador registra o evento sem alegar entrega externa. O tutor confirma pelo link público; a fila passa de `CALLED` para `RETURNING`.
8. Se a comunicação falhar, a recepção registra a falha, vê a ação pendente, faz contato por meio operacional disponível e registra a providência antes de uma nova tentativa.

## Privacidade e retenção

- Não existe campo de latitude/longitude no modelo F2.
- A API rejeita campos extras no payload de localização.
- Só persiste o tempo estimado de deslocamento quando o consentimento é verdadeiro.
- A finalidade e a versão do texto de consentimento são apresentadas pela API e registradas na trilha de auditoria.
- O prazo é controlado pelo servidor (`LOCATION_RETENTION_MINUTES`), não pelo cliente.
- Snapshots expirados são apagados nas operações F2; o script de limpeza deve ser agendado no ambiente publicado.
- O fluxo sem GPS não bloqueia o acesso do tutor.

## Parâmetros adotados

- `LOCATION_RETENTION_MINUTES=60`.
- `DEFAULT_FIXED_NOTICE_MINUTES=20`.
- `safety_margin_minutes=10` na demonstração.
- cálculo Haversine no navegador com coordenadas de referência `MOCKED`.
- canal `SIMULATOR`, sem provedor externo.

Os valores 20/60/10 formam a linha `MOCKED` aprovada para a entrega e permanecem configuráveis. Uma mudança futura deve receber nova decisão e novos testes.

## Testes automatizados

Cobrem consentimento, payload sem coordenadas, recusa de GPS, fallback, viabilidade do retorno, expiração, prevenção de duplicidade, falha e ação da recepção, confirmação pública e bloqueio de canal real não implementado.
