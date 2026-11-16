# Declaracao de escopo

> **Marco previsto da versao 1.0:** 2026-10-19
> **Elaboracao e aprovacao da linha de base:** 2026-11-16
> **Responsavel pela consolidacao:** Alisson, GP, com apoio do G3
> **Revisao tecnica:** Nathan, arquiteto
> **Status:** aprovado pelo GP para o fechamento tecnico, conforme as decisoes da pasta `01-iniciacao`.

## Objetivo do produto

Entregar uma aplicacao web de agenda e fila virtual para clinica veterinaria que permita a recepcao organizar atendimentos e ao tutor acompanhar sua espera, com estimativa por tipo, aviso conforme deslocamento e segregacao operacional da fila.

A `Clinica Vila Nova EC`, de Engenheiro Coelho/SP, identifica somente o cenario ficticio oficial de demonstracao. Os 40 registros utilizados sao dados mockados e nao representam coleta de campo real.

## Perfis atendidos

| Perfil | Capacidades da versao minima |
|---|---|
| Recepcao | Cadastrar agenda e encaixe, fazer check-in, consultar e operar fila, registrar chamadas, falhas e recursos |
| Veterinario/admin | Declarar ou remover emergencia, alterar prioridade autorizada, reordenar a fila e iniciar ou finalizar atendimento |
| Tutor | Criar cadastro, autenticar-se, cadastrar animais e sintomas, entrar remotamente na fila, consultar atendimento, fornecer ou negar consentimento de localizacao e confirmar retorno |

## Escopo incluido

1. Agenda simples, tutor, animal, sintomas, agendamento, check-in, cancelamento, encaixe e autoatendimento remoto.
2. **F1:** previsao segmentada por tipo com p50/p90, historico de revisoes, espera real, erro assinado, MAE e cobertura; dados `MOCKED` podem alimentar a demonstracao quando habilitados e permanecem identificados na resposta.
3. **F2:** captura pontual com consentimento, envio apenas do tempo de deslocamento, aviso simulado, parametros 20/60/10 `MOCKED` e alternativa sem GPS.
4. **F3:** segregacao por especie e tipo/motivo, prioridade clinica, emergencia declarada por profissional, indicadores de risco e exclusividade de recursos.
5. Reordenacao da fila por veterinario/admin, com arrastar, subir/descer e protecao contra atualizacao sobre fila desatualizada.
6. Autenticacao interna, token publico do tutor e auditoria de acoes criticas.
7. Frontend integrado para os fluxos demonstraveis de tutor, recepcao e veterinario.
8. API, banco, migrations, massa mockada, testes, documentacao e plano de publicacao.
9. Projeto de hardware documental com diagrama, componentes, comunicacao, alimentacao e protecao.
10. Artefatos de gestao, qualidade, apresentacao, extensao simulada e encerramento.

## Escopo excluido

- prontuario, diagnostico, prescricao ou triagem clinica automatica;
- pagamentos, estoque, internacao e gestao financeira;
- multiplas unidades, agenda recorrente e aplicativo nativo;
- rastreamento continuo ou persistencia de latitude/longitude;
- integracao obrigatoria com WhatsApp, SMS ou servico pago;
- prototipo fisico de hardware nesta versao;
- painel gerencial completo ou analise preditiva alem da F1;
- alegacao de parceria, coleta, entrevista, extensao ou teste externo real para os cenarios `MOCKED`.

## Entregas e aceite

| Entrega | Criterio de aceite |
|---|---|
| Sistema integrado | Fluxos frontend-API presentes na `development`; teste ponta a ponta registrado no ambiente de fechamento |
| F1 | Estimativa por tipo, faixa p50/p90, revisoes e comparacao previsto x realizado |
| F2 | Consentimento, alternativa sem GPS, decisao de aviso e confirmacao demonstraveis |
| F3 | Pelo menos dois eixos, prioridade explicita, reordenacao protegida e recurso exclusivo sem dupla alocacao |
| Qualidade | Plano, 43 testes backend aprovados, casos manuais, capturas e tratamento da bancada cruzada `MOCKED` |
| Hardware | Esquema, componentes, protocolo e calculo eletrico documentados, sem construcao fisica |
| Gestao/processo | Escopo, EAP, cronograma, riscos, custos, comunicacao, ADRs e Registro de IA |
| Encerramento | Manual, roteiro da demonstracao, simulacao extensionista `MOCKED` e licoes aprendidas |

## Criterios de nao aceitacao

- usar media global para todos os tipos de atendimento;
- impedir o tutor de usar o sistema apos negar localizacao;
- permitir que o sistema classifique emergencia automaticamente;
- apresentar dados mockados como observacao real;
- declarar publicacao, teste, entrevista ou aprovacao sem evidencia;
- incluir segredo, dado pessoal real ou coordenada precisa no repositorio.

## Situacao de fechamento

| Item | Situacao em 16/11/2026 |
|---|---|
| Frontend e integracao com a API | Implementados na `development` |
| Backend F1/F2/F3, cadastro, autoatendimento e reordenacao | Implementados e cobertos pela suite atual |
| Testes automatizados | 43 testes backend aprovados |
| C1 | C1-MOCKED aprovado pelo GP, sem alegacao de coleta real |
| Parametros F2 | 20/60/10 aprovados como configuracao `MOCKED` |
| Empresa 02 e bancada cruzada | Simulacao documental `MOCKED` concluida |
| Extensao | Simulacao documental `MOCKED` congelada em 16/11 |
| Hardware | Prototipo documental concluido; construcao fisica fora do escopo |
| Publicacao Vercel + Neon | Em execucao |
| Teste ponta a ponta e smoke test externo | Em execucao |

## Controle de mudanca

Mudancas que alterem feature obrigatoria, contrato da API, modelo de dados ou criterio de aceite exigem registro na data real por PR, documento ou ADR. Depois do congelamento tecnico de 16/11, qualquer ampliacao depende de aprovacao do GP e regressao da versao afetada.
