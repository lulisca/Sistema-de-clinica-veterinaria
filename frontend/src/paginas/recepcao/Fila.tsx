// R2/R3 · Fila de hoje. Também cobre R9 (fila vazia), R10 (sem estimativa) e R11 (erro de rede).
// F3: filtros por espécie e tipo de atendimento (os dois eixos de segregação da API).
// A ordem vem pronta da API: emergência → nível de prioridade → horário de check-in.
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarFila, listarRecursos, listarRevisoes } from '../../api'
import AcoesPaciente from '../../componentes/AcoesPaciente'
import { Marcadores, SeloEstado, SeloPrioridade } from '../../componentes/Selos'
import { INTERVALO_ATUALIZACAO_MS } from '../../config'
import { agora, faixa, hora } from '../../formato'
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

export default function Fila() {
  const [filtros, setFiltros] = useState<Filtros>({ species: '', appointment_type: '', status: '' })
  const [entradas, setEntradas] = useState<EntradaFila[] | null>(null)
  const [revisoes, setRevisoes] = useState<Record<number, RevisaoEstimativa | undefined>>({})
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [atualizadaAs, setAtualizadaAs] = useState<string | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)

  const carregar = useCallback(async () => {
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

  function aoTerminarAcao(r: Resultado) {
    setResultado(r)
    carregar()
  }

  const nomeVeterinario = (id: number | null) => recursos.find((r) => r.id === id)?.name ?? 'sem alocação'
  const esperando = entradas?.filter((e) => ESPERANDO.includes(e.status)) ?? []
  const semFaixa = esperando.filter((e) => !revisoes[e.id]).length
  const temFiltro = Boolean(filtros.species || filtros.appointment_type || filtros.status)

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1 className="titulo-lg">Fila de hoje</h1>
          <p className="corpo-sm texto-secundario">
            {entradas ? `${esperando.length} ${esperando.length === 1 ? 'paciente' : 'pacientes'} na fila` : 'Carregando'}
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
        <section className="fila" aria-label="Pacientes na fila">
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
              return (
                <li key={entrada.id} className="fila-linha">
                  <span className="numero-md" aria-label={posicao ? `Posição ${posicao}` : 'Sem posição'}>
                    {posicao || '—'}
                  </span>
                  <div className="celula">
                    <span className="corpo-md-forte">{nomeDoPaciente(entrada)}</span>
                    <span className="corpo-sm texto-secundario">{especieETipo(entrada)}</span>
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
