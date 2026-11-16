// R4 · Cadastro e entrada na fila: agendamento, encaixe (walk-in) e check-in.
//
// A API não tem busca de tutor nem de animal: por isso agendamento e encaixe
// cadastram o tutor (só com um código, sem nome real — LGPD) e o animal na hora.
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  criarAgendamento, criarAnimal, criarEncaixe, criarTutor, fazerCheckIn, listarAgendamentos, listarRecursos,
} from '../../api'
import Campo from '../../componentes/Campo'
import LinkTutor from '../../componentes/LinkTutor'
import { hora } from '../../formato'
import { ESPECIES, mensagemDeErro, TIPOS_ATENDIMENTO, traduzir } from '../../textos'
import type { Agendamento, EntradaFila, Recurso } from '../../tipos'

type Aba = 'agendamento' | 'encaixe' | 'checkin'
type Resultado = { tipo: 'sucesso' | 'erro'; texto: string; entrada?: EntradaFila } | null

const ABAS: { id: Aba; texto: string }[] = [
  { id: 'agendamento', texto: 'Agendamento' },
  { id: 'encaixe', texto: 'Encaixe' },
  { id: 'checkin', texto: 'Check-in' },
]

export default function Cadastro() {
  const [parametros] = useSearchParams()
  const [aba, setAba] = useState<Aba>((parametros.get('aba') as Aba) || 'agendamento')
  const [veterinarios, setVeterinarios] = useState<Recurso[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])

  const carregar = useCallback(async () => {
    try {
      const [recursos, agendados] = await Promise.all([listarRecursos(), listarAgendamentos('SCHEDULED')])
      setVeterinarios(recursos.filter((r) => r.resource_type === 'VETERINARIAN' && r.active))
      setAgendamentos(agendados.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)))
    } catch {
      // Os formulários continuam usáveis; o erro aparece ao enviar.
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // A aba só destaca e leva o foco ao cartão escolhido (os três ficam na tela, como no Figma).
  useEffect(() => {
    const cartao = document.getElementById(`cartao-${aba}`)
    cartao?.scrollIntoView({ block: 'nearest' })
  }, [aba])

  const nomeVet = (id: number | null) => veterinarios.find((v) => v.id === id)?.name

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1 className="titulo-lg">Cadastro e entrada na fila</h1>
          <p className="corpo-sm texto-secundario">Três caminhos para um paciente entrar na fila de hoje.</p>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Escolha o caminho">
        {ABAS.map((item) => (
          <button key={item.id} type="button" className="chip" aria-pressed={aba === item.id} onClick={() => setAba(item.id)}>
            {item.texto}
          </button>
        ))}
      </div>

      <div className="colunas colunas-iguais">
        <FormAgendamento ativo={aba === 'agendamento'} veterinarios={veterinarios} aoAgendar={carregar} />
        <FormEncaixe ativo={aba === 'encaixe'} veterinarios={veterinarios} />
        <FormCheckIn ativo={aba === 'checkin'} agendamentos={agendamentos} nomeVet={nomeVet} aoFazerCheckIn={carregar} />
      </div>
    </>
  )
}

// ---------- Agendamento ----------
function FormAgendamento({ ativo, veterinarios, aoAgendar }: { ativo: boolean; veterinarios: Recurso[]; aoAgendar: () => void }) {
  const [animal, setAnimal] = useState(ANIMAL_VAZIO)
  const [tipo, setTipo] = useState('CONSULTATION')
  const [vet, setVet] = useState('')
  const [dataHora, setDataHora] = useState(daquiAUmaHora)
  const [duracao, setDuracao] = useState(30)
  const [resultado, setResultado] = useState<Resultado>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setOcupado(true)
    setResultado(null)
    try {
      const { tutorId, animalId } = await cadastrarTutorEAnimal(animal)
      const agendamento = await criarAgendamento({
        tutor_id: tutorId,
        animal_id: animalId,
        veterinarian_resource_id: vet ? Number(vet) : null,
        scheduled_at: new Date(dataHora).toISOString(),
        expected_duration_minutes: duracao,
        appointment_type: tipo,
      })
      setResultado({ tipo: 'sucesso', texto: `${animal.codigo} agendado para ${hora(agendamento.scheduled_at)}. Faça o check-in quando chegar.` })
      setAnimal(ANIMAL_VAZIO)
      aoAgendar()
    } catch (erro) {
      setResultado({ tipo: 'erro', texto: mensagemDeErro(erro) })
    } finally {
      setOcupado(false)
    }
  }

  return (
    <CartaoFormulario id="agendamento" titulo="Agendamento" ativo={ativo} onSubmit={enviar}>
      <CamposAnimal prefixo="ag" animal={animal} aoMudar={setAnimal} />
      <CampoTipo id="ag-tipo" valor={tipo} aoMudar={setTipo} />
      <CampoVeterinario id="ag-vet" valor={vet} aoMudar={setVet} veterinarios={veterinarios} apoio="Opcional: deixe vazio para qualquer um." />
      <Campo id="ag-data" rotulo="Data e hora" apoio="Horário combinado com o tutor.">
        <input id="ag-data" type="datetime-local" required value={dataHora} onChange={(e) => setDataHora(e.target.value)} aria-describedby="ag-data-apoio" />
      </Campo>
      <Campo id="ag-duracao" rotulo="Duração prevista (min)" apoio="Entre 1 e 480 minutos.">
        <input id="ag-duracao" type="number" min={1} max={480} required value={duracao}
          onChange={(e) => setDuracao(Number(e.target.value))} aria-describedby="ag-duracao-apoio" />
      </Campo>
      <MensagemResultado resultado={resultado} />
      <button className="botao botao-acao botao-largo" type="submit" disabled={ocupado}>
        {ocupado ? 'Agendando…' : 'Agendar'}
      </button>
    </CartaoFormulario>
  )
}

// ---------- Encaixe (walk-in) ----------
function FormEncaixe({ ativo, veterinarios }: { ativo: boolean; veterinarios: Recurso[] }) {
  const [animal, setAnimal] = useState(ANIMAL_VAZIO)
  const [tipo, setTipo] = useState('CONSULTATION')
  const [vet, setVet] = useState('')
  const [marcadores, setMarcadores] = useState(MARCADORES_VAZIOS)
  const [resultado, setResultado] = useState<Resultado>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setOcupado(true)
    setResultado(null)
    try {
      const { animalId } = await cadastrarTutorEAnimal(animal)
      const entrada = await criarEncaixe({
        animal_id: animalId,
        appointment_type: tipo,
        veterinarian_resource_id: vet ? Number(vet) : null,
        ...marcadores,
      })
      setResultado({ tipo: 'sucesso', texto: `${animal.codigo} entrou na fila.`, entrada })
      setAnimal(ANIMAL_VAZIO)
      setMarcadores(MARCADORES_VAZIOS)
    } catch (erro) {
      setResultado({ tipo: 'erro', texto: mensagemDeErro(erro) })
    } finally {
      setOcupado(false)
    }
  }

  return (
    <CartaoFormulario id="encaixe" titulo="Encaixe" ativo={ativo} onSubmit={enviar}>
      <CamposAnimal prefixo="enc" animal={animal} aoMudar={setAnimal} />
      <CampoTipo id="enc-tipo" valor={tipo} aoMudar={setTipo} />
      <CampoVeterinario id="enc-vet" valor={vet} aoMudar={setVet} veterinarios={veterinarios} apoio="Opcional." />
      <CamposMarcadores titulo="Marcadores operacionais" valores={marcadores} aoMudar={setMarcadores} />
      <MensagemResultado resultado={resultado} />
      <button className="botao botao-acao botao-largo" type="submit" disabled={ocupado}>
        {ocupado ? 'Pondo na fila…' : 'Pôr na fila'}
      </button>
    </CartaoFormulario>
  )
}

// ---------- Check-in de quem tem agendamento ----------
interface FormCheckInProps {
  ativo: boolean
  agendamentos: Agendamento[]
  nomeVet: (id: number | null) => string | undefined
  aoFazerCheckIn: () => void
}

function FormCheckIn({ ativo, agendamentos, nomeVet, aoFazerCheckIn }: FormCheckInProps) {
  const [escolhido, setEscolhido] = useState('')
  const [marcadores, setMarcadores] = useState(MARCADORES_VAZIOS)
  const [resultado, setResultado] = useState<Resultado>(null)
  const [ocupado, setOcupado] = useState(false)
  const agendamento = agendamentos.find((a) => String(a.id) === escolhido)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (!agendamento) return
    setOcupado(true)
    setResultado(null)
    try {
      const entrada = await fazerCheckIn(agendamento.id, marcadores)
      setResultado({ tipo: 'sucesso', texto: `Check-in feito: animal nº ${entrada.animal_id} entrou na fila.`, entrada })
      setEscolhido('')
      setMarcadores(MARCADORES_VAZIOS)
      aoFazerCheckIn()
    } catch (erro) {
      setResultado({ tipo: 'erro', texto: mensagemDeErro(erro) })
    } finally {
      setOcupado(false)
    }
  }

  return (
    <CartaoFormulario id="checkin" titulo="Check-in" ativo={ativo} onSubmit={enviar}>
      <Campo id="ci-agendamento" rotulo="Agendamento" apoio={agendamentos.length ? 'Agendamentos ainda sem check-in.' : 'Nenhum agendamento aguardando check-in.'}>
        <select id="ci-agendamento" required value={escolhido} onChange={(e) => setEscolhido(e.target.value)} aria-describedby="ci-agendamento-apoio">
          <option value="">Escolha um agendamento</option>
          {agendamentos.map((a) => (
            <option key={a.id} value={a.id}>
              {hora(a.scheduled_at)} · animal nº {a.animal_id} · {traduzir(TIPOS_ATENDIMENTO, a.appointment_type)}
            </option>
          ))}
        </select>
      </Campo>

      {agendamento && (
        <div className="caixa-encontrado">
          <p className="corpo-md-forte">
            Animal nº {agendamento.animal_id} · {traduzir(TIPOS_ATENDIMENTO, agendamento.appointment_type)}
          </p>
          <p className="corpo-sm texto-secundario">
            Agendado para {hora(agendamento.scheduled_at)}
            {nomeVet(agendamento.veterinarian_resource_id) && ` com ${nomeVet(agendamento.veterinarian_resource_id)}`}
            {' · estado '}{agendamento.status}
          </p>
        </div>
      )}

      <CamposMarcadores titulo="Marcadores operacionais" valores={marcadores} aoMudar={setMarcadores} />
      <MensagemResultado resultado={resultado} />
      <button className="botao botao-acao botao-largo" type="submit" disabled={ocupado || !agendamento}>
        {ocupado ? 'Fazendo check-in…' : 'Fazer check-in'}
      </button>
    </CartaoFormulario>
  )
}

// ---------- Partes reaproveitadas ----------

interface DadosAnimal {
  tutor: string
  codigo: string
  nome: string
  especie: string
}

const ANIMAL_VAZIO: DadosAnimal = { tutor: '', codigo: '', nome: '', especie: 'DOG' }
const MARCADORES_VAZIOS = { reactive: false, infectious_risk: false, isolation_required: false }

async function cadastrarTutorEAnimal(animal: DadosAnimal) {
  const tutor = await criarTutor(animal.tutor.trim())
  const novo = await criarAnimal({
    tutor_id: tutor.id,
    code: animal.codigo.trim(),
    species: animal.especie,
    name: animal.nome.trim() || undefined,
  })
  return { tutorId: tutor.id, animalId: novo.id }
}

// Valor inicial do campo de data: daqui a 1 hora, no formato do <input type="datetime-local">.
function daquiAUmaHora() {
  const data = new Date(Date.now() + 60 * 60 * 1000)
  data.setMinutes(0, 0, 0)
  const doisDigitos = (n: number) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}T${doisDigitos(data.getHours())}:00`
}

interface CartaoFormularioProps {
  id: Aba
  titulo: string
  ativo: boolean
  onSubmit: (evento: FormEvent) => void
  children: ReactNode
}

function CartaoFormulario({ id, titulo, ativo, onSubmit, children }: CartaoFormularioProps) {
  return (
    <form id={`cartao-${id}`} className="cartao cartao-formulario" data-ativo={ativo} onSubmit={onSubmit} aria-labelledby={`titulo-${id}`}>
      <h2 id={`titulo-${id}`} className="titulo-md">{titulo}</h2>
      {children}
    </form>
  )
}

function CamposAnimal({ prefixo, animal, aoMudar }: { prefixo: string; animal: DadosAnimal; aoMudar: (a: DadosAnimal) => void }) {
  return (
    <>
      <Campo id={`${prefixo}-tutor`} rotulo="Código do tutor" apoio="Sem nome real: use só um código.">
        <input id={`${prefixo}-tutor`} required value={animal.tutor} placeholder="ex.: T-014"
          onChange={(e) => aoMudar({ ...animal, tutor: e.target.value })} aria-describedby={`${prefixo}-tutor-apoio`} />
      </Campo>
      <Campo id={`${prefixo}-codigo`} rotulo="Código do animal">
        <input id={`${prefixo}-codigo`} required value={animal.codigo} placeholder="ex.: AN-021"
          onChange={(e) => aoMudar({ ...animal, codigo: e.target.value })} />
      </Campo>
      <Campo id={`${prefixo}-nome`} rotulo="Nome do animal" apoio="Opcional.">
        <input id={`${prefixo}-nome`} value={animal.nome} placeholder="ex.: Mel"
          onChange={(e) => aoMudar({ ...animal, nome: e.target.value })} aria-describedby={`${prefixo}-nome-apoio`} />
      </Campo>
      <Campo id={`${prefixo}-especie`} rotulo="Espécie">
        <select id={`${prefixo}-especie`} value={animal.especie} onChange={(e) => aoMudar({ ...animal, especie: e.target.value })}>
          {Object.entries(ESPECIES).map(([codigo, texto]) => (
            <option key={codigo} value={codigo}>{texto}</option>
          ))}
        </select>
      </Campo>
    </>
  )
}

function CampoTipo({ id, valor, aoMudar }: { id: string; valor: string; aoMudar: (v: string) => void }) {
  return (
    <Campo id={id} rotulo="Tipo de atendimento" apoio="Define a faixa da estimativa (F1).">
      <select id={id} value={valor} onChange={(e) => aoMudar(e.target.value)} aria-describedby={`${id}-apoio`}>
        {Object.entries(TIPOS_ATENDIMENTO).map(([codigo, texto]) => (
          <option key={codigo} value={codigo}>{texto}</option>
        ))}
      </select>
    </Campo>
  )
}

interface CampoVeterinarioProps {
  id: string
  valor: string
  aoMudar: (v: string) => void
  veterinarios: Recurso[]
  apoio: string
}

function CampoVeterinario({ id, valor, aoMudar, veterinarios, apoio }: CampoVeterinarioProps) {
  return (
    <Campo id={id} rotulo="Veterinário" apoio={apoio}>
      <select id={id} value={valor} onChange={(e) => aoMudar(e.target.value)} aria-describedby={`${id}-apoio`}>
        <option value="">Sem preferência</option>
        {veterinarios.map((v) => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </select>
    </Campo>
  )
}

type Marcadores = typeof MARCADORES_VAZIOS

function CamposMarcadores({ titulo, valores, aoMudar }: { titulo: string; valores: Marcadores; aoMudar: (m: Marcadores) => void }) {
  const opcoes: { chave: keyof Marcadores; texto: string }[] = [
    { chave: 'reactive', texto: 'Reativo' },
    { chave: 'infectious_risk', texto: 'Risco infeccioso' },
    { chave: 'isolation_required', texto: 'Requer isolamento' },
  ]
  return (
    <fieldset className="grupo-opcoes">
      <legend className="etiqueta-sm texto-secundario">{titulo}</legend>
      {opcoes.map((opcao) => (
        <label key={opcao.chave} className="opcao">
          <input type="checkbox" checked={valores[opcao.chave]}
            onChange={(e) => aoMudar({ ...valores, [opcao.chave]: e.target.checked })} />
          {opcao.texto}
        </label>
      ))}
    </fieldset>
  )
}

function MensagemResultado({ resultado }: { resultado: Resultado }) {
  if (!resultado) return null
  return (
    <div className={`faixa-aviso faixa-aviso-${resultado.tipo}`} role={resultado.tipo === 'erro' ? 'alert' : 'status'}>
      <span>{resultado.texto}</span>
      {resultado.entrada && <LinkTutor token={resultado.entrada.public_token} />}
    </div>
  )
}
