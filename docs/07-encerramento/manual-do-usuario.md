# Manual do usuario

> **Versao de rascunho:** 2026-11-15. Ajustar nomes de botoes e inserir capturas apos a integracao do frontend.

## Perfis

- **Recepcao:** agenda, chegada, fila, chamada, falhas e recursos.
- **Veterinario/admin:** operacoes da recepcao e classificacao autorizada de emergencia/prioridade.
- **Tutor:** consulta somente o atendimento associado ao seu link publico.

## Acesso interno

1. Abra a URL da aplicacao.
2. Entre com e-mail e senha fornecidos pela equipe.
3. Confirme o perfil exibido antes de operar prioridade ou emergencia.
4. Nao compartilhe JWT, senha ou link administrativo.

## Registrar atendimento

### Agendado

1. Abra Agenda e crie/seleciona tutor e animal.
2. Informe tipo, horario e profissional quando aplicavel.
3. Na chegada, execute check-in.
4. Entregue ao tutor somente o link publico do proprio atendimento.

### Encaixe

1. Abra Novo encaixe.
2. Informe dados minimos, especie, tipo/motivo e riscos declarados pela equipe autorizada.
3. Confirme a entrada na fila.

## Operar a fila

- `WAITING`: aguardando.
- `CALLED`: aviso realizado.
- `RETURNING`: tutor confirmou retorno.
- `READY`: pronto para atendimento.
- `IN_SERVICE`: em atendimento.
- `COMPLETED`: encerrado.

Use filtros por especie e tipo sem perder a visao de recursos compartilhados. Emergencia so pode ser marcada por veterinario/admin. Ao iniciar e finalizar o atendimento, confirme o paciente correto.

## Interpretar a F1

- **p50:** estimativa central; metade das observacoes de referencia ficou abaixo desse valor.
- **p90:** limite conservador da faixa; nao e garantia de espera maxima.
- **Estimativa indisponivel:** faltam amostras aceitas; nao substituir por zero.
- Revisoes podem mudar apos prioridade, inicio/fim de atendimento ou mudanca da fila.

Dados `MOCKED` servem para desenvolvimento e demonstracao, mas nao validam o C1 nem calibram oficialmente a F1.

## Usar a F2

### Tutor aceita localizacao

1. Leia a finalidade.
2. Autorize a captura pontual no navegador.
3. O frontend calcula a rota e envia apenas o tempo de deslocamento.
4. Confirme retorno quando receber o aviso simulado.

### Tutor recusa

O sistema continua disponivel. Quando a antecedencia fixa estiver configurada, ela substitui o calculo por deslocamento.

### Falha no aviso

A recepcao consulta Acoes pendentes, faz o contato operacional disponivel e registra a providencia antes de nova tentativa.

## Recursos F3

Ao alocar sala, veterinario ou equipamento, confira se o recurso esta livre. O sistema deve rejeitar dupla alocacao ativa. Risco infeccioso/reativo e isolamento orientam a alocacao, mas nao substituem decisao clinica.

## Solucao de problemas

| Problema | Acao |
|---|---|
| Login negado | Conferir credencial e perfil; acionar administrador |
| Link do tutor invalido | Conferir se o link pertence ao atendimento correto |
| Sem estimativa | Verificar prontidao de amostras; nao inventar valor |
| Localizacao negada | Seguir com fallback sem GPS |
| Aviso falhou | Registrar falha e resolver a acao da recepcao |
| Recurso ocupado | Encerrar alocacao anterior ou escolher outro recurso |
| Sistema indisponivel | Registrar horario, versao e tela; acionar equipe |

## Privacidade

- nao inserir dado real na massa de demonstracao;
- nao compartilhar link publico em grupos;
- nao registrar coordenadas no backend;
- nao publicar capturas com nome, contato, senha ou token completo;
- encerrar a sessao em computador compartilhado.
