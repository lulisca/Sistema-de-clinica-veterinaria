# Declaracao de escopo

> **Versao planejada:** 1.0 - 2026-10-19
> **Consolidacao documental:** 2026-11-15, sem retroatividade
> **Responsavel:** G3, sob coordenacao do GP
> **Status:** base de execucao; decisoes clinicas e hospedagem permanecem a aprovar.

## Objetivo do produto

Entregar uma aplicacao web de agenda e fila virtual para clinica veterinaria que permita a recepcao organizar atendimentos e ao tutor acompanhar sua espera, com estimativa por tipo, aviso conforme deslocamento e segregacao operacional da fila.

O nome `Clinica Vila Nova EC`, de Engenheiro Coelho/SP, identifica somente o cenario ficticio de demonstracao. Os 40 registros existentes sao dados mockados e nao sao apresentados como coleta real.

## Perfis atendidos

| Perfil | Capacidades da versao minima |
|---|---|
| Recepcao | Cadastrar agenda e encaixe, fazer check-in, consultar e operar fila, registrar chamadas, falhas e recursos |
| Veterinario/admin | Declarar emergencia, alterar prioridade autorizada e iniciar/finalizar atendimento |
| Tutor | Consultar atendimento por token, fornecer ou negar consentimento de localizacao e confirmar retorno |

## Escopo incluido

1. Agenda simples, tutor, animal, agendamento, check-in, cancelamento e encaixe.
2. **F1:** previsao segmentada por tipo com p50/p90, historico de revisoes, espera real, erro assinado, MAE e cobertura.
3. **F2:** captura pontual com consentimento, envio apenas do tempo de deslocamento, aviso simulado e alternativa sem GPS.
4. **F3:** segregacao por especie e tipo/motivo, prioridade clinica, indicadores de risco e exclusividade de recursos.
5. Autenticacao interna, token publico do tutor e auditoria de acoes criticas.
6. Frontend minimo para os fluxos demonstraveis.
7. API, banco, migrations, massa mockada, testes, documentacao e publicacao.
8. Projeto de hardware documental com diagrama, componentes, comunicacao e alimentacao.
9. Artefatos de gestao, qualidade, apresentacao, extensao e encerramento.

## Escopo excluido

- prontuario, diagnostico, prescricao ou triagem clinica automatica;
- pagamentos, estoque, internacao e gestao financeira;
- multiplas unidades, agenda recorrente e aplicativo nativo;
- rastreamento continuo ou persistencia de latitude/longitude;
- integracao obrigatoria com WhatsApp, SMS ou servico pago;
- prototipo fisico obrigatorio de hardware;
- painel gerencial completo ou analise preditiva alem da F1.

## Entregas e aceite

| Entrega | Criterio de aceite |
|---|---|
| Sistema integrado | Fluxo principal executavel do frontend ao banco em ambiente documentado |
| F1 | Estimativa por tipo, faixa p50/p90, revisoes e comparacao previsto x realizado |
| F2 | Consentimento, alternativa sem GPS, decisao de aviso e confirmacao demonstraveis |
| F3 | Pelo menos dois eixos, prioridade explicita e recurso exclusivo sem dupla alocacao |
| Qualidade | Plano de testes, resultados proprios e tratamento da bancada cruzada |
| Hardware | Esquema, componentes, protocolo e calculo eletrico documentados |
| Gestao/processo | Escopo, EAP, cronograma, riscos, custos, comunicacao, ADRs e Registro de IA |
| Encerramento | Manual, roteiro da demonstracao, extensao e licoes aprendidas |

## Criterios de nao aceitacao

- usar media global para todos os tipos de atendimento;
- impedir o tutor de usar o sistema apos negar localizacao;
- permitir que o sistema classifique emergencia automaticamente;
- apresentar dados mockados como observacao real;
- declarar publicacao, teste, entrevista ou aprovacao sem evidencia;
- incluir segredo, dado pessoal real ou coordenada precisa no repositorio.

## Dependencias e pendencias

- frontend e integracao ponta a ponta;
- decisao e execucao da hospedagem;
- aprovacao dos parametros F2 e regras finais F3;
- execucao dos testes em ambiente com dependencias;
- acesso ao sistema da Empresa 02 para bancada cruzada;
- orientacao formal do professor sobre o C1 sem coleta real.

## Controle de mudanca

Mudancas que alterem feature obrigatoria, contrato da API, modelo de dados ou criterio de aceite precisam de ata/ADR. Depois de 26/10, toda ampliacao deve ser compensada pela remocao explicita de item nao obrigatorio.
