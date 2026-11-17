// Todas as chamadas à API ficam aqui. As telas só chamam estas funções.
// Contrato: backend/docs/API_CONTRACT.md
import { API_URL } from './config'
import { encerrarSessao, encerrarSessaoTutor, lerSessao, lerSessaoTutor } from './sessao'
import type {
  Agendamento, Alocacao, Animal, Aviso, DecisaoRetorno, EntradaFila, Metricas,
  MetricasPorTipo, MomentoLocalizacao, PoliticaLocalizacao, Prontidao, Recurso, ResultadoAvaliacao,
  RevisaoEstimativa, StatusPublico, Token, Tutor,
} from './tipos'

// Erro com o código HTTP. status 0 = sem conexão com o servidor.
export class ErroApi extends Error {
  status: number
  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.status = status
  }
}

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  corpo?: unknown
  publico?: boolean // link do tutor e login: sem token
  tutor?: boolean // telas /tutor: usam o token da conta do tutor, não o da equipe
}

async function chamar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const cabecalhos: Record<string, string> = {}
  if (opcoes.corpo !== undefined) cabecalhos['Content-Type'] = 'application/json'

  const token = opcoes.tutor ? lerSessaoTutor()?.token : lerSessao()?.token
  if (!opcoes.publico && token) cabecalhos.Authorization = `Bearer ${token}`

  let resposta: Response
  try {
    resposta = await fetch(API_URL + caminho, {
      method: opcoes.metodo ?? 'GET',
      headers: cabecalhos,
      body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
    })
  } catch {
    throw new ErroApi(0, 'Sem conexão com o servidor.')
  }

  if (!resposta.ok) {
    // Token vencido ou inválido: volta para o login (do tutor ou da recepção).
    if (resposta.status === 401 && !opcoes.publico) {
      if (opcoes.tutor) {
        encerrarSessaoTutor()
        window.location.assign('/tutor/entrar')
      } else {
        encerrarSessao()
        window.location.assign('/recepcao/login')
      }
    }
    throw new ErroApi(resposta.status, await lerDetalhe(resposta))
  }
  return (await resposta.json()) as T
}

// O FastAPI devolve { detail: "texto" } ou, no erro 422, uma lista de campos.
async function lerDetalhe(resposta: Response): Promise<string> {
  try {
    const corpo = await resposta.json()
    if (typeof corpo.detail === 'string') return corpo.detail
    if (Array.isArray(corpo.detail)) {
      return corpo.detail
        .map((item: { loc?: string[]; msg?: string }) => `${item.loc?.at(-1) ?? 'campo'}: ${item.msg}`)
        .join('; ')
    }
  } catch {
    // resposta sem JSON
  }
  return `Erro ${resposta.status}`
}

// ---------- Login da equipe ----------
export const entrar = (email: string, password: string) =>
  chamar<Token>('/auth/login', { metodo: 'POST', corpo: { email, password }, publico: true })

// ---------- Tutor com conta (entra na fila sozinho, com os sintomas) ----------
// Para entrar, o tutor usa o mesmo POST /auth/login da equipe (a resposta diz o papel).
export const criarContaTutor = (dados: { name: string; email: string; password: string; contact?: string }) =>
  chamar<Token>('/auth/tutors/register', { metodo: 'POST', corpo: dados, publico: true })

export const buscarTutorLogado = () => chamar<Tutor>('/tutor/me', { tutor: true })
export const listarMeusAnimais = () => chamar<Animal[]>('/tutor/animals', { tutor: true })
export const cadastrarMeuAnimal = (dados: { name: string; species: string }) =>
  chamar<Animal>('/tutor/animals', { metodo: 'POST', corpo: dados, tutor: true })

// Atendimentos ainda ativos do tutor, com o public_token para abrir /t/<token>.
export const listarMeusAtendimentos = () => chamar<EntradaFila[]>('/tutor/queue', { tutor: true })
export const entrarNaFila = (dados: { animal_id: number; appointment_type: string; symptoms: string }) =>
  chamar<EntradaFila>('/tutor/queue', { metodo: 'POST', corpo: dados, tutor: true })

// ---------- Tutor (link público, sem login) ----------
export const buscarStatusPublico = (token: string) =>
  chamar<StatusPublico>(`/public/status/${token}`, { publico: true })

export const buscarPoliticaLocalizacao = (token: string) =>
  chamar<PoliticaLocalizacao>(`/public/status/${token}/location-consent`, { publico: true })

// F2: só os minutos de deslocamento são enviados. Nunca latitude/longitude.
export const enviarDeslocamentoPublico = (
  token: string,
  dados: { moment: MomentoLocalizacao; consent_given: boolean; travel_minutes?: number },
) => chamar<unknown>(`/public/status/${token}/location`, { metodo: 'POST', corpo: dados, publico: true })

export const confirmarRetorno = (token: string) =>
  chamar<unknown>(`/public/status/${token}/confirm-return`, { metodo: 'POST', publico: true })

// ---------- Fila ----------
export function listarFila(filtros: { species?: string; appointment_type?: string; status?: string } = {}) {
  const parametros = new URLSearchParams()
  Object.entries(filtros).forEach(([chave, valor]) => valor && parametros.set(chave, valor))
  const consulta = parametros.toString()
  return chamar<EntradaFila[]>(`/queue${consulta ? `?${consulta}` : ''}`)
}

export const buscarEntrada = (id: number) => chamar<EntradaFila>(`/queue/${id}`)
export const iniciarAtendimento = (id: number) => chamar<EntradaFila>(`/queue/${id}/start`, { metodo: 'POST' })
export const finalizarAtendimento = (id: number) => chamar<EntradaFila>(`/queue/${id}/finish`, { metodo: 'POST' })

// Só veterinário ou admin (a API devolve 403 para a recepção).
export const declararEmergencia = (id: number) =>
  chamar<EntradaFila>(`/queue/${id}/priority`, { metodo: 'PATCH', corpo: { emergency: true } })
export const removerEmergencia = (id: number) =>
  chamar<EntradaFila>(`/queue/${id}/priority`, { metodo: 'PATCH', corpo: { emergency: false } })

// O veterinário arrasta a fila: manda todos que esperam (sem emergência) na ordem nova
// e a ordem que a tela mostrava. Se a fila mudou nesse meio-tempo, a API responde 409.
export const reordenarFila = (ids: number[], ordemNaTela: number[]) =>
  chamar<EntradaFila[]>('/queue/order', { metodo: 'PUT', corpo: { entry_ids: ids, previous_ids: ordemNaTela } })

// "Chamar" cria um aviso simulado e muda o estado para CALLED.
// Assim o tutor consegue tocar em "Estou voltando" (precisa de um aviso pendente).
export const chamarPaciente = (id: number) =>
  chamar<Aviso>(`/queue/${id}/notifications`, { metodo: 'POST', corpo: { channel: 'SIMULATOR' } })

// ---------- F1: estimativa ----------
export const listarRevisoes = (id: number) => chamar<RevisaoEstimativa[]>(`/queue/${id}/estimates`)
export const buscarMetricas = () => chamar<Metricas>('/metrics/wait-estimates')
export const buscarMetricasPorTipo = () => chamar<MetricasPorTipo[]>('/metrics/wait-estimates/by-type')
export const buscarProntidao = () => chamar<Prontidao>('/metrics/f1-readiness')

// ---------- F2: retorno e avisos ----------
export const buscarDecisaoRetorno = (id: number, margem: number) =>
  chamar<DecisaoRetorno>(`/queue/${id}/return-decision?safety_margin_minutes=${margem}`)

// A rota exige um corpo JSON (mensagem e canal); {} usa os valores padrão da API.
export const avaliarEAvisar = (id: number, margem: number) =>
  chamar<ResultadoAvaliacao>(`/queue/${id}/notifications/evaluate?safety_margin_minutes=${margem}`, {
    metodo: 'POST',
    corpo: {},
  })

export const registrarDeslocamento = (
  id: number,
  dados: { moment: MomentoLocalizacao; consent_given: boolean; travel_minutes?: number },
) => chamar<unknown>(`/queue/${id}/location`, { metodo: 'POST', corpo: dados })

export const listarAvisosDoCaso = (id: number) => chamar<Aviso[]>(`/queue/${id}/notifications`)
export const listarAcoesPendentes = () => chamar<Aviso[]>('/notifications/reception-actions')
export const marcarFalhaAviso = (id: number) => chamar<Aviso>(`/notifications/${id}/fail`, { metodo: 'POST' })
export const confirmarAviso = (id: number) => chamar<Aviso>(`/notifications/${id}/confirm`, { metodo: 'POST' })
export const registrarProvidencia = (id: number, note: string) =>
  chamar<Aviso>(`/notifications/${id}/resolve-reception-action`, { metodo: 'POST', corpo: { note } })

// ---------- F3: recursos ----------
export const listarRecursos = () => chamar<Recurso[]>('/resources')
export const criarRecurso = (dados: { name: string; resource_type: string }) =>
  chamar<Recurso>('/resources', { metodo: 'POST', corpo: dados })
export const alocarRecurso = (id: number, resource_id: number) =>
  chamar<Alocacao>(`/queue/${id}/allocations`, { metodo: 'POST', corpo: { resource_id } })
export const liberarAlocacao = (alocacaoId: number) =>
  chamar<Alocacao>(`/allocations/${alocacaoId}`, { metodo: 'DELETE' })

// ---------- Cadastro ----------
export const criarTutor = (name: string) => chamar<Tutor>('/tutors', { metodo: 'POST', corpo: { name } })

export const criarAnimal = (dados: { tutor_id: number; code: string; species: string; name?: string }) =>
  chamar<Animal>('/animals', { metodo: 'POST', corpo: dados })

export const criarAgendamento = (dados: {
  tutor_id: number
  animal_id: number
  veterinarian_resource_id: number | null
  scheduled_at: string
  expected_duration_minutes: number
  appointment_type: string
}) => chamar<Agendamento>('/appointments', { metodo: 'POST', corpo: dados })

export const listarAgendamentos = (status?: string) =>
  chamar<Agendamento[]>(`/appointments${status ? `?status=${status}` : ''}`)

interface Marcadores {
  reactive: boolean
  infectious_risk: boolean
  isolation_required: boolean
}

export const fazerCheckIn = (agendamentoId: number, marcadores: Marcadores) =>
  chamar<EntradaFila>(`/appointments/${agendamentoId}/check-in`, { metodo: 'POST', corpo: marcadores })

export const criarEncaixe = (
  dados: Marcadores & { animal_id: number; appointment_type: string; veterinarian_resource_id: number | null },
) => chamar<EntradaFila>('/walk-ins', { metodo: 'POST', corpo: dados })
