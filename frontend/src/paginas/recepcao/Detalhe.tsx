// R5 · Detalhe do caso.
// F1: histórico de revisões da estimativa e previsto × realizado.
// F2: decisão de retorno, "Avaliar e avisar" e avisos enviados.
// F3: alocação da sala de isolamento (recurso único compartilhado).
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  alocarRecurso, avaliarEAvisar, buscarDecisaoRetorno, buscarEntrada, confirmarAviso, liberarAlocacao,
  listarAvisosDoCaso, listarRecursos, listarRevisoes, marcarFalhaAviso, registrarDeslocamento,
} from '../../api'
import AcoesPaciente from '../../componentes/AcoesPaciente'
import Campo from '../../componentes/Campo'
import { Marcadores, SeloEstado, SeloPrioridade, SeloViabilidade } from '../../componentes/Selos'
import { MARGEM_SEGURANCA_MIN } from '../../config'
import { comSinal, decimal, hora } from '../../formato'
import { especieETipo, ESPECIES, mensagemDeErro, nomeDoPaciente, TIPOS_ATENDIMENTO, traduzir } from '../../textos'
import type { Alocacao, Aviso, DecisaoRetorno, EntradaFila, MomentoLocalizacao, Recurso, RevisaoEstimativa } from '../../tipos'

type Resultado = { tipo: 'sucesso' | 'erro' | 'info'; texto: string }

// Por que "Avaliar e avisar" não criou aviso (campo "reason" da API).
const MOTIVOS_SEM_AVISO: Record<string, string> = {
  NOT_DUE: 'Ainda não é hora de avisar: a espera cobre o deslocamento e a margem.',
  NO_ESTIMATE: 'Sem estimativa de espera: não dá para decidir o momento do aviso.',
  FIXED_NOTICE_NOT_CONFIGURED: 'O tutor está sem localização e a API não tem aviso por tempo fixo configurado.',
  RECEPTION_ACTION_REQUIRED: 'Há um aviso com falha. Registre a providência em Avisos antes de avisar de novo.',
  DUPLICATE_PREVENTED: 'Já existe um aviso aguardando a confirmação do tutor.',
}

// Explicação curta de cada modo da decisão de retorno (campo "mode" da API).
const MODOS: Record<string, string> = {
  TRAVEL_TIME: 'Usa o tempo de deslocamento informado pelo tutor.',
  FIXED_NOTICE: 'Sem localização: vale o aviso por tempo fixo da clínica.',
  FIXED_NOTICE_NOT_CONFIGURED: 'Sem localização e sem aviso por tempo fixo configurado na API.',
  NO_ESTIMATE: 'Sem estimativa: faltam amostras deste tipo de atendimento.',
}

export default function Detalhe() {
  const id = Number(useParams().id)
  const [entrada, setEntrada] = useState<EntradaFila | null>(null)
  const [revisoes, setRevisoes] = useState<RevisaoEstimativa[]>([])
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [decisao, setDecisao] = useState<DecisaoRetorno | null>(null)
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [erroCarga, setErroCarga] = useState<string | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const [dados, listaRevisoes, listaAvisos, dadosDecisao, listaRecursos] = await Promise.all([
        buscarEntrada(id),
        listarRevisoes(id),
        listarAvisosDoCaso(id),
        buscarDecisaoRetorno(id, MARGEM_SEGURANCA_MIN),
        listarRecursos(),
      ])
      setEntrada(dados)
      setRevisoes(listaRevisoes)
      setAvisos(listaAvisos)
      setDecisao(dadosDecisao)
      setRecursos(listaRecursos)
      setErroCarga(null)
    } catch (erro) {
      setErroCarga(mensagemDeErro(erro))
    }
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Executa uma ação, mostra o resultado e recarrega os dados.
  // "ocupado" desliga os botões enquanto espera, para um clique duplo não repetir a ação.
  async function executar(acao: () => Promise<unknown>, textoSucesso: string) {
    setOcupado(true)
    try {
      await acao()
      setResultado({ tipo: 'sucesso', texto: textoSucesso })
    } catch (erro) {
      setResultado({ tipo: 'erro', texto: mensagemDeErro(erro) })
    }
    await carregar()
    setOcupado(false)
  }

  // F2: a API decide, pela distância (ou pelo tempo fixo), se já é hora de avisar.
  async function avaliar() {
    setOcupado(true)
    try {
      const r = await avaliarEAvisar(id, MARGEM_SEGURANCA_MIN)
      setResultado(
        r.created
          ? { tipo: 'sucesso', texto: 'Aviso simulado enviado ao tutor.' }
          : { tipo: 'info', texto: MOTIVOS_SEM_AVISO[r.reason] ?? r.reason },
      )
    } catch (erro) {
      setResultado({ tipo: 'erro', texto: mensagemDeErro(erro) })
    }
    await carregar()
    setOcupado(false)
  }

  if (!entrada) {
    return erroCarga ? (
      <div className="faixa-aviso faixa-aviso-erro" role="alert">
        <strong>Não foi possível abrir o caso.</strong>
        <span>{erroCarga}</span>
        <Link className="botao botao-contorno" to="/recepcao/fila">Voltar para a fila</Link>
      </div>
    ) : (
      <p className="corpo-md texto-secundario" role="status">Carregando caso…</p>
    )
  }

  const veterinario = recursos.find((r) => r.id === entrada.veterinarian_resource_id)?.name
  const inicial = revisoes.find((r) => r.is_initial)

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1 className="titulo-lg">{nomeDoPaciente(entrada)}</h1>
          <p className="corpo-sm texto-secundario">
            {especieETipo(entrada)} · check-in às {hora(entrada.checked_in_at)}
            {veterinario && ` · ${veterinario}`}
          </p>
          <div className="acoes">
            <SeloEstado estado={entrada.status} />
            <SeloPrioridade entrada={entrada} />
            <Marcadores entrada={entrada} />
          </div>
        </div>
        <div className="acoes">
          <AcoesPaciente entrada={entrada} mostrarDetalhe={false} aoTerminar={(r) => { setResultado(r); carregar() }} />
        </div>
      </div>

      {resultado && (
        <p className={`faixa-aviso faixa-aviso-${resultado.tipo}`} role={resultado.tipo === 'erro' ? 'alert' : 'status'}>
          {resultado.texto}
        </p>
      )}
      {erroCarga && <p className="faixa-aviso faixa-aviso-erro" role="alert">{erroCarga}</p>}

      <div className="colunas">
        <div className="coluna">
          {/* ---------- F1 ---------- */}
          <section className="cartao" aria-labelledby="titulo-historico">
            <h2 id="titulo-historico" className="titulo-md">Histórico de estimativas</h2>
            {revisoes.length === 0 ? (
              <p className="corpo-md texto-secundario">Ainda sem estimativa: faltam amostras deste tipo de atendimento.</p>
            ) : (
              <div className="tabela-rolagem">
                <table className="tabela">
                  <thead>
                    <tr>
                      <th>Revisão</th><th>Gatilho</th><th>p50</th><th>p90</th><th>Amostras</th>
                      <th>Calculado</th><th>Erro assinado</th><th>Na faixa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revisoes.map((r) => (
                      <tr key={r.id}>
                        <td>{r.revision_number}{r.is_initial && ' · inicial'}</td>
                        <td>{r.trigger_event}</td>
                        <td>{decimal(r.p50_minutes)}</td>
                        <td>{decimal(r.p90_minutes)}</td>
                        <td>{r.sample_size}</td>
                        <td>{hora(r.calculated_at)}</td>
                        <td>{comSinal(r.signed_error_minutes)}</td>
                        <td>{simOuNao(r.inside_range)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="caixa-medida">
              <p className="etiqueta-sm texto-secundario">Previsto × realizado</p>
              {inicial?.actual_wait_minutes != null ? (
                <>
                  <div className="linha-dado"><span>Espera real</span><span>{decimal(inicial.actual_wait_minutes)} min</span></div>
                  <div className="linha-dado"><span>Erro assinado (previsão inicial)</span><span>{comSinal(inicial.signed_error_minutes)} min</span></div>
                  <div className="linha-dado"><span>Erro absoluto</span><span>{decimal(inicial.absolute_error_minutes)} min</span></div>
                  <div className="linha-dado"><span>Caiu entre p50 e p90</span><span>{simOuNao(inicial.inside_range)}</span></div>
                </>
              ) : (
                <p className="corpo-sm texto-secundario">Aparece quando o atendimento começar.</p>
              )}
            </div>
          </section>

          {/* ---------- F2: avisos ---------- */}
          <section className="cartao" aria-labelledby="titulo-avisos">
            <h2 id="titulo-avisos" className="titulo-md">Avisos enviados</h2>
            {avisos.length === 0 ? (
              <p className="corpo-md texto-secundario">Nenhum aviso enviado ainda.</p>
            ) : (
              <div className="tabela-rolagem">
                <table className="tabela">
                  <thead>
                    <tr><th>Enviado</th><th>Canal</th><th>Situação</th><th>Mensagem</th><th><span className="so-leitor">Ações</span></th></tr>
                  </thead>
                  <tbody>
                    {avisos.map((aviso) => (
                      <tr key={aviso.id}>
                        <td>{hora(aviso.sent_at)}</td>
                        <td>{aviso.channel}</td>
                        <td>{situacaoDoAviso(aviso)}</td>
                        <td>{aviso.message}</td>
                        <td>
                          {/* O canal é simulado: a equipe registra a confirmação ou a falha. */}
                          {['SIMULATED', 'SENT'].includes(aviso.status) && !aviso.confirmed_at && (
                            <div className="acoes">
                              <button className="botao botao-texto" disabled={ocupado} onClick={() => executar(() => confirmarAviso(aviso.id), 'Confirmação registrada.')}>
                                Confirmar
                              </button>
                              <button className="botao botao-texto" disabled={ocupado} onClick={() => executar(() => marcarFalhaAviso(aviso.id), 'Falha registrada. A recepção precisa registrar a providência em Avisos.')}>
                                Marcar falha
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="coluna">
          {/* ---------- F2: decisão de retorno ---------- */}
          {decisao && (
            <section className="cartao" aria-labelledby="titulo-decisao">
              <h2 id="titulo-decisao" className="titulo-md">Decisão de retorno</h2>
              <SeloViabilidade valor={decisao.return_feasibility} />
              <p className="corpo-sm texto-secundario">{MODOS[decisao.mode] ?? decisao.reason}</p>
              <div className="linha-dado"><span>Modo</span><span>{decisao.mode}</span></div>
              <div className="linha-dado"><span>Espera estimada (p50)</span><span>{decisao.estimated_wait_minutes == null ? '—' : `${decimal(decisao.estimated_wait_minutes)} min`}</span></div>
              <div className="linha-dado"><span>Deslocamento informado</span><span>{decisao.travel_minutes == null ? '—' : `${decisao.travel_minutes} min`}</span></div>
              <div className="linha-dado"><span>Margem de segurança</span><span>{decisao.safety_margin_minutes} min</span></div>
              <div className="linha-dado"><span>Folga de chegada</span><span>{decisao.arrival_slack_minutes == null ? '—' : `${comSinal(decisao.arrival_slack_minutes)} min`}</span></div>
              <div className="linha-dado"><span>Avisar agora?</span><span>{decisao.should_notify_now ? 'Sim' : 'Não'}</span></div>
              <button className="botao botao-acao botao-largo" onClick={avaliar} disabled={ocupado}>
                Avaliar e avisar
              </button>
              <RegistrarDeslocamento entrada={entrada} aoSalvar={(r) => { setResultado(r); carregar() }} />
            </section>
          )}

          {/* ---------- Dados e F3 ---------- */}
          <section className="cartao" aria-labelledby="titulo-dados">
            <h2 id="titulo-dados" className="titulo-md">Dados do caso</h2>
            <div className="linha-dado"><span>Espécie</span><span>{traduzir(ESPECIES, entrada.species)}</span></div>
            <div className="linha-dado"><span>Tipo</span><span>{traduzir(TIPOS_ATENDIMENTO, entrada.appointment_type)}</span></div>
            <div className="linha-dado"><span>Reativo</span><span>{simOuNao(entrada.reactive)}</span></div>
            <div className="linha-dado"><span>Risco infeccioso</span><span>{simOuNao(entrada.infectious_risk)}</span></div>
            <div className="linha-dado"><span>Requer isolamento</span><span>{simOuNao(entrada.isolation_required)}</span></div>
            <div className="linha-dado"><span>Veterinário</span><span>{veterinario ?? 'Sem preferência'}</span></div>
            {entrada.isolation_required && ['WAITING', 'CALLED', 'RETURNING', 'READY'].includes(entrada.status) && (
              <SalaIsolamento entrada={entrada} recursos={recursos} aoTerminar={(r) => { setResultado(r); carregar() }} />
            )}
          </section>
        </div>
      </div>
    </>
  )
}

// "Registrar deslocamento": a recepção informa os minutos quando o tutor está no balcão ou ao telefone.
function RegistrarDeslocamento({ entrada, aoSalvar }: { entrada: EntradaFila; aoSalvar: (r: Resultado) => void }) {
  const [aberto, setAberto] = useState(false)
  const [minutos, setMinutos] = useState(10)

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    // O momento-chave depende de onde o paciente está no fluxo.
    const momento: MomentoLocalizacao =
      entrada.status === 'CALLED' ? 'NOTIFICATION' : entrada.status === 'RETURNING' ? 'RETURN_CONFIRMATION' : 'CHECK_IN'
    try {
      await registrarDeslocamento(entrada.id, { moment: momento, consent_given: true, travel_minutes: minutos })
      aoSalvar({ tipo: 'sucesso', texto: `Deslocamento de ${minutos} min registrado.` })
      setAberto(false)
    } catch (erro) {
      aoSalvar({ tipo: 'erro', texto: mensagemDeErro(erro) })
    }
  }

  if (!aberto) {
    return (
      <button className="botao botao-contorno botao-largo" onClick={() => setAberto(true)}>
        Registrar deslocamento
      </button>
    )
  }
  return (
    <form className="formulario-linha" onSubmit={salvar}>
      <Campo id="deslocamento" rotulo="Minutos até a clínica">
        <input id="deslocamento" type="number" min={0} max={1440} required value={minutos}
          onChange={(e) => setMinutos(Number(e.target.value))} />
      </Campo>
      <button className="botao botao-acao" type="submit">Salvar</button>
    </form>
  )
}

// F3: a sala de isolamento é única. Precisa ser alocada antes de iniciar o atendimento.
function SalaIsolamento({ entrada, recursos, aoTerminar }: { entrada: EntradaFila; recursos: Recurso[]; aoTerminar: (r: Resultado) => void }) {
  const [alocacao, setAlocacao] = useState<Alocacao | null>(null)
  const sala = recursos.find((r) => r.resource_type === 'ISOLATION_ROOM' && r.active)

  if (!sala) {
    return <p className="faixa-aviso faixa-aviso-atencao">Nenhuma sala de isolamento cadastrada. Cadastre em Recursos.</p>
  }

  async function alocar() {
    try {
      setAlocacao(await alocarRecurso(entrada.id, sala!.id))
      aoTerminar({ tipo: 'sucesso', texto: `${sala!.name} alocada para este paciente.` })
    } catch (erro) {
      aoTerminar({ tipo: 'erro', texto: mensagemDeErro(erro) })
    }
  }

  async function liberar() {
    if (!alocacao) return
    try {
      await liberarAlocacao(alocacao.id)
      setAlocacao(null)
      aoTerminar({ tipo: 'sucesso', texto: `${sala!.name} liberada.` })
    } catch (erro) {
      aoTerminar({ tipo: 'erro', texto: mensagemDeErro(erro) })
    }
  }

  return alocacao ? (
    <button className="botao botao-contorno botao-largo" onClick={liberar}>Liberar {sala.name}</button>
  ) : (
    <button className="botao botao-contorno botao-largo" onClick={alocar}>Alocar {sala.name}</button>
  )
}

function simOuNao(valor: boolean | null | undefined) {
  if (valor === null || valor === undefined) return '—'
  return valor ? 'Sim' : 'Não'
}

function situacaoDoAviso(aviso: Aviso) {
  if (aviso.confirmed_at) return `Confirmado às ${hora(aviso.confirmed_at)}`
  if (aviso.status === 'FAILED') {
    return aviso.reception_action_resolved_at ? 'Falhou · providência registrada' : 'Falhou · ação pendente'
  }
  if (aviso.status === 'SIMULATED') return 'Simulado · aguardando confirmação'
  return aviso.status
}
