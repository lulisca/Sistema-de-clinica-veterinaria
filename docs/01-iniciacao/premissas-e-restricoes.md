# Premissas e restrições

> **Status:** aprovado pelo GP em 2026-11-16. As premissas estão classificadas como adotadas, implementadas, em execução ou `MOCKED` para a entrega técnica.

## Premissas

| ID | Premissa | Como verificar | Situação |
|---|---|---|---|
| P01 | Os nove integrantes compõem a equipe registrada para a entrega | Responsabilidades, commits e histórico | Adotada pelo GP no fechamento |
| P02 | O frontend consome a API REST consolidada na `development` | Integração no código e teste ponta a ponta | Implementação integrada; CT19 local aprovado com ressalvas |
| P03 | A hospedagem usa plano gratuito ou infraestrutura já disponível | ADR e smoke test externo | Vercel + Neon aprovados no ADR-003; implantação em execução |
| P04 | Dados mockados identificados podem ser usados no desenvolvimento e na demo técnica | Relatórios e telas marcam `MOCKED` | Aprovada pelo GP para desenvolvimento, testes e demonstração |
| P05 | O C1 da entrega é uma verificação técnica `MOCKED`, sem alegação de coleta real | Relatório C1-MOCKED e aviso de limitação | Aprovada pelo GP para a entrega técnica |
| P06 | Veterinário ou administrador autorizado registra emergência; a decisão clínica permanece profissional | Regras, permissões e testes | Implementada no backend |
| P07 | O tutor pode negar geolocalização sem perder o acesso ao sistema | Teste da F2 | Implementada no backend |
| P08 | Extensão e bancada cruzada são simulações documentais com organizações fictícias | Identificação `MOCKED` nos artefatos | Aprovada pelo GP; substituir somente se houver execução real autorizada |
| P09 | Os parâmetros F2 de demonstração são 20/60/10 minutos | Configuração, telas e documentação | Aprovada pelo GP como configuração `MOCKED` |

## Restrições

| ID | Restrição | Efeito no projeto |
|---|---|---|
| RST01 | Apresentação em 30/11/2026 e entrega final em 03/12/2026 | Priorizar piso funcional e reduzir escopo extra |
| RST02 | Congelamento técnico em 16/11/2026 | Consolidar código, documentação e cenários `MOCKED`; concluir publicação e ponta a ponta no fechamento |
| RST03 | Orçamento operacional próximo de zero | Preferir serviços gratuitos e componentes disponíveis |
| RST04 | Não existe coleta de campo real nesta versão | Apresentar somente C1-MOCKED e não alegar validação externa |
| RST05 | LGPD e minimização de dados | Não persistir coordenadas sem justificativa; retenção curta |
| RST06 | Sistema não toma decisão clínica | Emergência depende de veterinário/admin autorizado |
| RST07 | ADR e ata contam pela data real | Não retrodatá-los nem representar proposta como decisão histórica |
| RST08 | Repositório deve preservar autoria individual | Código por PR e merge sem squash |
| RST09 | Código precisa ser explicado pela equipe | Revisão, documentação e ensaio obrigatórios |

## Decisões de fechamento

- cenário clínico: Vila Nova EC fictícia, com dados `MOCKED`;
- C1: verificação técnica C1-MOCKED, sem coleta real;
- extensão: simulação documental congelada em 16/11, sem alegação de ação comunitária real;
- bancada cruzada: Empresa 02 fictícia e execução simulada;
- F2: parâmetros 20/60/10 aprovados como `MOCKED`;
- hardware: protótipo documental, sem construção física no escopo;
- publicação Vercel + Neon e CT20 externo: atividades em execução no fechamento; CT19 local aprovado com ressalvas.

Toda evidência simulada deve permanecer identificada como `MOCKED`. Uma atividade real futura somente substitui a simulação quando houver autorização, data e evidência verificável.
