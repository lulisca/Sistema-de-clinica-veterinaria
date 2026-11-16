// R2/R3 · Fila de hoje. Também cobre R9 (fila vazia), R10 (sem estimativa) e R11 (erro de rede).
// F3: filtros por espécie e tipo de atendimento (os dois eixos de segregação da API).
// A ordem vem pronta da API: emergência → nível de prioridade → horário de check-in.
// O veterinário muda a ordem arrastando a linha ou com os botões ↑ e ↓ (PUT /queue/order).
import { type DragEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarFila, listarRecursos, listarRevisoes, reordenarFila } from '../../api'
import AcoesPaciente from '../../componentes/AcoesPaciente'
import { Marcadores, SeloEstado, SeloPrioridade } from '../../componentes/Selos'
import { INTERVALO_ATUALIZACAO_MS } from '../../config'
import { agora, faixa, hora } from '../../formato'
import { lerSessao, podeDeclararEmergencia } from '../../sessao'
import { especieETipo, mensagemDeErro, nomeDoPaciente } from '../../textos'
import type { EntradaFila, Recurso, RevisaoEstimativa } from '../../tipos'

// Estados que ainda ocupam um lugar na fila (recebem posição).
const ESPERANDO = ['WAITING', 'CALLED', 'RETURNING', 'READY']
// "Todos" no filtro de status = quem ainda não saiu da fila.
const ATIVOS = [...ESPERANDO, 'IN_SERVICE']

const FILTRO_ESPECIE = [
  { valor: '', texto: 'Todas' },
  { valor: 'DOG', texto: 'Cão' },
  { valor: 'CAT', texto: 'Gato' },
]
const FILTRO_TIPO = [
  { valor: '', texto: 'Todos' },
  { valor: 'CONSULTATION', texto: 'Consulta' },
  { valor: 'VACCINE', texto: 'Vacina' },
  { valor: 'RETURN', texto: 'Retorno' },
  { valor: 'EXAM', texto: 'Exame' },
]
const FILTRO_STATUS = [
  { valor: '', texto: 'Todos' },
  { valor: 'WAITING', texto: 'Aguardando' },
  { valor: 'CALLED', texto: 'Chamado' },
  { valor: 'RETURNING', texto: 'Retornando' },
  { valor: 'READY', texto: 'Pronto' },
  { valor: 'IN_SERVICE', texto: 'Em atendimento' },
]

type Filtros = { species: string; appointment_type: string; status: string }
type Resultado = { tipo: 'sucesso' | 'erro'; texto: string }
type Direcao = 'subir' | 'descer'

// Tira o item da posição "de" e coloca na posição "para".
function mover<T>(lista: T[], de: number, para: number): T[] {
  const copia = [...lista]
  const [item] = copia.splice(de, 1)
  copia.splice(para, 0, item)
  return copia
}

// Põe as linhas móveis na ordem nova; emergência e em atendimento ficam onde estão.
function aplicarOrdem(lista: EntradaFila[], novaOrdem: EntradaFila[]): EntradaFila[] {
  const moveis = new Set(novaOrdem.map((e) => e.id))
  let proxima = 0
  return lista.map((e) => (moveis.has(e.id) ? novaOrdem[proxima++] : e))
}

export default function Fila() {
  const [filtros, setFiltros] = useState<Filtros>({ species: '', appointment_type: '', status: '' })
  const [entradas, setEntradas] = useState<EntradaFila[] | null>(null)
  const [revisoes, setRevisoes] = useState<Record<number, RevisaoEstimativa | undefined>>({})
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [atualizadaAs, setAtualizadaAs] = useState<string | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)

  // Reordenar (só veterinário/admin)
  const [arrastandoId, setArrastandoId] = useState<number | null>(null)
  const [alvoId, setAlvoId] = useState<number | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [focarDepois, setFocarDepois] = useState<{ id: number; direcao: Direcao } | null>(null)
  // A atualização automática de 20 s pula enquanto alguém arrasta ou a ordem está sendo salva;
  // senão ela trocaria a lista no meio do movimento. (Ref, porque o intervalo lê o valor na hora.)
  const pausadoRef = useRef({ arrastando: false, salvando: false })

  const carregar = useCallback(async () => {
    if (pausadoRef.current.arrastando || pausadoRef.current.salvando) return
    try {
      const [lista, listaRecursos] = await Promise.all([listarFila(filtros), listarRecursos()])
      const visiveis = filtros.status ? lista : lista.filter((e) => ATIVOS.includes(e.status))

      // F1: a última revisão salva da estimativa de cada paciente que espera.
      const pares = await Promise.all(
        visiveis
          .filter((e) => ESPERANDO.includes(e.status))
          .map(async (e) => [e.id, (await listarRevisoes(e.id)).at(-1)] as const),
      )
      setRevisoes(Object.fromEntries(pares))
      setEntradas(visiveis)
      setRecursos(listaRecursos)
      setErro(null)
      setAtualizadaAs(agora())
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }, [filtros])

  useEffect(() => {
    carregar()
    const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS)
    return () => clearInterval(intervalo)
  }, [carregar])

  // Depois de ↑ ou ↓ a linha muda de lugar e o botão perde o foco: devolve o foco a ele
  // (ou ao outro botão da mesma linha, se este ficou desabilitado no topo ou no fim).
  useEffect(() => {
    if (!focarDepois) return
    const { id, direcao } = focarDepois
    const outra = direcao === 'subir' ? 'descer' : 'subir'
    const botao =
      document.querySelector<HTMLButtonElement>(`[data-mover="${id}-${direcao}"]:not(:disabled)`) ??
      document.querySelector<HTMLButtonElement>(`[data-mover="${id}-${outra}"]`)
    botao?.focus()
    setFocarDepois(null)
  }, [entradas, focarDepois])

  function aoTerminarAcao(r: Resultado) {
    setResultado(r)
    carregar()
  }

  const nomeVeterinario = (id: number | null) => recursos.find((r) => r.id === id)?.name ?? 'sem alocação'
  const esperando = entradas?.filter((e) => ESPERANDO.includes(e.status)) ?? []
  const semFaixa = esperando.filter((e) => !revisoes[e.id]).length
  const temFiltro = Boolean(filtros.species || filtros.appointment_type || filtros.status)

  // Só quem espera e não é emergência pode mudar de lugar. Com filtro, a lista na tela
  // não é a fila inteira, então reordenar fica desligado.
  const decidePrioridade = podeDeclararEmergencia(lerSessao()?.perfil)
  const ordenaveis = esperando.filter((e) => !e.emergency)
  const podeReordenar = decidePrioridade && !temFiltro

  async function salvarOrdem(novaOrdem: EntradaFila[]) {
    pausadoRef.current.salvando = true
    setSalvando(true)
    // Mostra a ordem nova na hora; se a fila tiver mudado, a API responde 409 e a tela recarrega.
    setEntradas((atual) => atual && aplicarOrdem(atual, novaOrdem))
    try {
      await reordenarFila(novaOrdem.map((e) => e.id))
      setResultado({ tipo: 'sucesso', texto: 'Ordem da fila salva.' })
    } catch (e) {
      setResultado({ tipo: 'erro', texto: mensagemDeErro(e) })
    } finally {
      pausadoRef.current.salvando = false
      setSalvando(false)
      carregar()
    }
  }

  function moverComBotao(de: number, direcao: Direcao) {
    if (salvando) return
    const para = direcao === 'subir' ? de - 1 : de + 1
    setFocarDepois({ id: ordenaveis[de].id, direcao })
    salvarOrdem(mover(ordenaveis, de, para))
  }

  function comecarArrastar(evento: DragEvent, id: number) {
    pausadoRef.current.arrastando = true
    evento.dataTransfer.effectAllowed = 'move'
    evento.dataTransfer.setData('text/plain', String(id)) // o Firefox só arrasta com algum dado
    setArrastandoId(id)
  }

  function soltar(para: number) {
    const de = ordenaveis.findIndex((e) => e.id === arrastandoId)
    if (de >= 0 && de !== para) salvarOrdem(mover(ordenaveis, de, para))
  }

  function terminarArrastar() {
    pausadoRef.current.arrastando = false
    setArrastandoId(null)
    setAlvoId(null)
  }

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1 className="titulo-lg">Fila de hoje</h1>
          <p className="corpo-sm texto-secundario">
            {entradas
              ? `${esperando.length} ${esperando.length === 1 ? 'paciente' : 'pacientes'} na fila`
              : erro ? 'Fila indisponível' : 'Carregando'}
            {atualizadaAs && ` · atualizada às ${atualizadaAs}`}
          </p>
        </div>
        <div className="acoes">
          <Link className="botao botao-contorno" to="/recepcao/cadastro?aba=checkin">Check-in</Link>
          <Link className="botao botao-acao" to="/recepcao/cadastro?aba=encaixe">Novo encaixe</Link>
        </div>
      </div>

      <section className="cartao filtros" aria-label="Filtros da fila">
        <GrupoFiltro titulo="Espécie" opcoes={FILTRO_ESPECIE} valor={filtros.species}
          aoMudar={(species) => setFiltros({ ...filtros, species })} />
        <GrupoFiltro titulo="Tipo de atendimento" opcoes={FILTRO_TIPO} valor={filtros.appointment_type}
          aoMudar={(appointment_type) => setFiltros({ ...filtros, appointment_type })} />
        <GrupoFiltro titulo="Status" opcoes={FILTRO_STATUS} valor={filtros.status}
          aoMudar={(status) => setFiltros({ ...filtros, status })} />
      </section>

      {resultado && (
        <p className={`faixa-aviso faixa-aviso-${resultado.tipo}`} role={resultado.tipo === 'erro' ? 'alert' : 'status'}>
          {resultado.texto}
        </p>
      )}

      {/* R11: erro de rede. Se já havia dados, eles continuam abaixo. */}
      {erro && (
        <div className="faixa-aviso faixa-aviso-erro" role="alert">
          <strong>Não foi possível atualizar a fila.</strong>
          <span>{erro} Última atualização: {atualizadaAs ?? '—'}.</span>
          <button className="botao botao-contorno" onClick={carregar}>Tentar de novo</button>
        </div>
      )}

      {/* R10: pacientes sem faixa de espera */}
      {semFaixa > 0 && (
        <p className="faixa-aviso faixa-aviso-info">
          {semFaixa === 1 ? '1 paciente está' : `${semFaixa} pacientes estão`} sem faixa de espera: faltam amostras do tipo
          de atendimento. Continuam na fila normalmente.
        </p>
      )}

      {decidePrioridade && temFiltro && ordenaveis.length > 0 && (
        <p className="faixa-aviso faixa-aviso-info">Para reordenar, limpe os filtros.</p>
      )}

      {entradas === null && !erro && <p className="corpo-md texto-secundario" role="status">Carregando fila…</p>}

      {/* R9: fila vazia */}
      {entradas?.length === 0 && (
        <div className="vazio">
          <p className="titulo-md">{temFiltro ? 'Nenhum paciente com esses filtros.' : 'Ninguém na fila agora.'}</p>
          {temFiltro ? (
            <button className="botao botao-contorno" onClick={() => setFiltros({ species: '', appointment_type: '', status: '' })}>
              Limpar filtros
            </button>
          ) : (
            <Link className="botao botao-acao" to="/recepcao/cadastro?aba=encaixe">Novo encaixe</Link>
          )}
        </div>
      )}

      {entradas && entradas.length > 0 && (
        <section className={decidePrioridade ? 'fila fila-ordenavel' : 'fila'} aria-label="Pacientes na fila">
          <div className="fila-cabecalho etiqueta-sm" aria-hidden="true">
            <span>Pos.</span>
            <span>Paciente</span>
            <span>Estado</span>
            <span>Prioridade</span>
            <span>Espera estimada</span>
            <span>Check-in · vet</span>
            <span>Ações</span>
          </div>
          <ol className="fila-lista">
            {entradas.map((entrada) => {
              const posicao = esperando.indexOf(entrada) + 1
              const revisao = revisoes[entrada.id]
              const nome = nomeDoPaciente(entrada)
              const indice = ordenaveis.indexOf(entrada) // -1: emergência ou em atendimento
              const movel = podeReordenar && indice >= 0
              // Barra de destino: acima do alvo quando sobe, abaixo quando desce.
              const deArrasto = ordenaveis.findIndex((e) => e.id === arrastandoId)
              const destino = alvoId === entrada.id && deArrasto !== indice ? (deArrasto < indice ? 'depois' : 'antes') : null
              const classes = ['fila-linha', arrastandoId === entrada.id && 'arrastando', destino && `destino-${destino}`]
              return (
                <li
                  key={entrada.id}
                  className={classes.filter(Boolean).join(' ')}
                  draggable={movel && !salvando}
                  onDragStart={movel ? (e) => comecarArrastar(e, entrada.id) : undefined}
                  onDragOver={
                    movel && arrastandoId !== null
                      ? (e) => {
                          e.preventDefault() // sem isso o navegador não deixa soltar aqui
                          setAlvoId(entrada.id)
                        }
                      : undefined
                  }
                  onDrop={movel ? (e) => { e.preventDefault(); soltar(indice) } : undefined}
                  onDragEnd={movel ? terminarArrastar : undefined}
                >
                  <div className="posicao">
                    {movel && <IconeAlca />}
                    <span className="numero-md" aria-label={posicao ? `Posição ${posicao}` : 'Sem posição'}>
                      {posicao || '—'}
                    </span>
                    {movel && (
                      <span className="mover">
                        <button
                          type="button"
                          className="botao-icone"
                          data-mover={`${entrada.id}-subir`}
                          aria-label={`Subir ${nome}`}
                          title="Subir"
                          disabled={indice === 0}
                          aria-disabled={salvando || undefined}
                          onClick={() => moverComBotao(indice, 'subir')}
                        >
                          <IconeSeta direcao="subir" />
                        </button>
                        <button
                          type="button"
                          className="botao-icone"
                          data-mover={`${entrada.id}-descer`}
                          aria-label={`Descer ${nome}`}
                          title="Descer"
                          disabled={indice === ordenaveis.length - 1}
                          aria-disabled={salvando || undefined}
                          onClick={() => moverComBotao(indice, 'descer')}
                        >
                          <IconeSeta direcao="descer" />
                        </button>
                      </span>
                    )}
                  </div>
                  <div className="celula">
                    <span className="corpo-md-forte">{nome}</span>
                    <span className="corpo-sm texto-secundario">{especieETipo(entrada)}</span>
                    {/* Sintomas: é com isso que o veterinário decide quem sobe. Texto inteiro no Detalhe. */}
                    {entrada.symptoms && (
                      <span className="corpo-sm sintomas-linha" title={entrada.symptoms}>{entrada.symptoms}</span>
                    )}
                    <Marcadores entrada={entrada} />
                  </div>
                  <div className="celula"><SeloEstado estado={entrada.status} /></div>
                  <div className="celula"><SeloPrioridade entrada={entrada} /></div>
                  <EsperaEstimada entrada={entrada} revisao={revisao} />
                  <div className="celula">
                    <span className="corpo-md">{hora(entrada.checked_in_at)}</span>
                    <span className="corpo-sm texto-secundario">{nomeVeterinario(entrada.veterinarian_resource_id)}</span>
                  </div>
                  <div className="celula celula-acoes">
                    <AcoesPaciente entrada={entrada} aoTerminar={aoTerminarAcao} />
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      )}
    </>
  )
}

function EsperaEstimada({ entrada, revisao }: { entrada: EntradaFila; revisao?: RevisaoEstimativa }) {
  let principal = 'Faixa indisponível'
  let detalhe = 'amostras insuficientes'
  if (entrada.status === 'IN_SERVICE') {
    principal = 'Em atendimento'
    detalhe = `início às ${hora(entrada.started_at)}`
  } else if (!ESPERANDO.includes(entrada.status)) {
    principal = '—'
    detalhe = ''
  } else if (revisao) {
    principal = faixa(revisao.p50_minutes, revisao.p90_minutes)
    detalhe = `p50–p90 · revisão ${revisao.revision_number}`
  }
  return (
    <div className="celula">
      <span className="corpo-md-forte">{principal}</span>
      {detalhe && <span className="corpo-sm texto-secundario">{detalhe}</span>}
    </div>
  )
}

// Ícones desenhados em SVG (mesma espessura de traço), decorativos: o nome fica no botão.
function IconeAlca() {
  return (
    <svg className="alca" width="12" height="20" viewBox="0 0 12 20" aria-hidden="true">
      <title>Arraste para mudar a ordem</title>
      {[4, 10, 16].map((y) => (
        <g key={y}>
          <circle cx="3" cy={y} r="1.6" />
          <circle cx="9" cy={y} r="1.6" />
        </g>
      ))}
    </svg>
  )
}

function IconeSeta({ direcao }: { direcao: Direcao }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={direcao === 'subir' ? '3,9 7,5 11,9' : '3,5 7,9 11,5'} />
    </svg>
  )
}

interface GrupoFiltroProps {
  titulo: string
  opcoes: { valor: string; texto: string }[]
  valor: string
  aoMudar: (valor: string) => void
}

function GrupoFiltro({ titulo, opcoes, valor, aoMudar }: GrupoFiltroProps) {
  return (
    <fieldset className="filtro">
      <legend className="etiqueta-sm texto-secundario">{titulo}</legend>
      <div className="chips">
        {opcoes.map((opcao) => (
          <button
            key={opcao.valor}
            type="button"
            className="chip"
            aria-pressed={valor === opcao.valor}
            onClick={() => aoMudar(opcao.valor)}
          >
            {opcao.texto}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
