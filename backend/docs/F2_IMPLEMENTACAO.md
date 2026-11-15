# F2 — implementação de deslocamento e chamada

## Estado

Implementação backend para demonstração com notificação simulada. A integração com provedor real não está incluída porque o canal ainda não foi escolhido. Parâmetros operacionais pendentes permanecem configuráveis e não são apresentados como decisões aprovadas.

## Fluxo

1. O tutor abre o link público do próprio atendimento.
2. A interface consulta `GET /api/public/status/{token}/location-consent` e apresenta a finalidade antes de solicitar permissão do navegador.
3. Se o tutor consentir, o cliente obtém a posição apenas naquele momento, consulta o serviço de rotas escolhido pela equipe e envia somente `travel_minutes` para `POST /api/public/status/{token}/location`. Coordenadas não são enviadas ao backend.
4. Se o tutor negar, a interface envia `consent_given=false` sem dados de deslocamento. O sistema continua funcionando e usa o acionamento por tempo fixo se a clínica o tiver configurado.
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

## Parâmetros que exigem decisão da equipe/clínica

- `LOCATION_RETENTION_MINUTES`: prazo de retenção.
- `DEFAULT_FIXED_NOTICE_MINUTES`: antecedência para quem negar localização.
- `safety_margin_minutes`: margem de segurança usada no cálculo.
- Canal real de notificação e credenciais do provedor.
- Serviço que converte a localização obtida no navegador em tempo estimado de deslocamento.

O valor `60` mostrado como exemplo local em `.env.example` é apenas um valor provisório de desenvolvimento, não uma decisão aprovada. Não publicar sem substituir por valor validado.

## Testes automatizados

Cobrem consentimento, payload sem coordenadas, recusa de GPS, fallback, viabilidade do retorno, expiração, prevenção de duplicidade, falha e ação da recepção, confirmação pública e bloqueio de canal real não implementado.
