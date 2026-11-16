# Premissas e restrições

> **Status:** rascunho do G3 em 2026-11-15. Premissas sem confirmação devem ser revistas a cada marco.

## Premissas

| ID | Premissa | Como verificar | Situação |
|---|---|---|---|
| P01 | Os nove integrantes permanecem disponíveis até a entrega final | Confirmação em reunião e commits/atas | A validar |
| P02 | O frontend consumirá a API REST já integrada à `main` | Teste ponta a ponta | A validar |
| P03 | A hospedagem poderá usar plano gratuito ou infraestrutura já disponível | Prova de publicação | A validar |
| P04 | Dados mockados identificados podem ser usados no desenvolvimento e na demo técnica | Relatórios e telas marcam `MOCKED` | Confirmada para desenvolvimento |
| P05 | O professor poderá orientar uma alternativa para a pendência do C1 | Registro da resposta formal | A validar |
| P06 | O veterinário continuará sendo o único responsável por classificar emergência | Regras, permissões e testes | Implementada no backend |
| P07 | O tutor pode negar geolocalização sem perder o acesso ao sistema | Teste da F2 | Implementada no backend |

## Restrições

| ID | Restrição | Efeito no projeto |
|---|---|---|
| RST01 | Apresentação em 30/11/2026 e entrega final em 03/12/2026 | Priorizar piso funcional e reduzir escopo extra |
| RST02 | Congelamento previsto para 16/11/2026 | Registrar atraso real e disponibilizar versão assim que possível |
| RST03 | Orçamento operacional próximo de zero | Preferir serviços gratuitos e componentes disponíveis |
| RST04 | C1 exige dado de campo verificável | Base mockada não valida C1; manter como “a validar” |
| RST05 | LGPD e minimização de dados | Não persistir coordenadas sem justificativa; retenção curta |
| RST06 | Sistema não toma decisão clínica | Emergência depende de veterinário/admin autorizado |
| RST07 | ADR e ata contam pela data real | Não retrodatá-los nem representar proposta como decisão histórica |
| RST08 | Repositório deve preservar autoria individual | Código por PR e merge sem squash |
| RST09 | Código precisa ser explicado pela equipe | Revisão, documentação e ensaio obrigatórios |

## Pendências que não bloqueiam o desenvolvimento

- evidência real do C1;
- entrevista clínica;
- aprovação final de parâmetros F2;
- parceiro comunitário real.

Esses itens permanecem visíveis como risco, mas a equipe pode continuar implementando e testando com dados mockados identificados.
