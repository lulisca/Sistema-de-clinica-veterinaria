// Traduções dos códigos da API para o português mostrado na tela.
import { ErroApi } from './api'
import type { EstadoFila, Perfil, Viabilidade } from './tipos'

export const ESPECIES: Record<string, string> = {
  DOG: 'Cão',
  CAT: 'Gato',
}

export const TIPOS_ATENDIMENTO: Record<string, string> = {
  CONSULTATION: 'Consulta',
  VACCINE: 'Vacina',
  RETURN: 'Retorno',
  EXAM: 'Exame',
}

export const ESTADOS: Record<EstadoFila, string> = {
  WAITING: 'Aguardando',
  CALLED: 'Chamado',
  RETURNING: 'Retornando',
  READY: 'Pronto',
  IN_SERVICE: 'Em atendimento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
}

export const VIABILIDADES: Record<Viabilidade, string> = {
  FEASIBLE: 'Dá tempo',
  AT_RISK: 'Em risco',
  INFEASIBLE: 'Não dá tempo',
  UNKNOWN: 'Sem dados',
}

export const PERFIS: Record<Perfil, string> = {
  RECEPTION: 'Recepção',
  VETERINARIAN: 'Veterinário',
  ADMIN: 'Administração',
}

export const TIPOS_RECURSO: Record<string, string> = {
  VETERINARIAN: 'Veterinário',
  ROOM: 'Sala',
  ISOLATION_ROOM: 'Sala de isolamento',
}

export const SITUACOES_AVISO: Record<string, string> = {
  SIMULATED: 'Simulado',
  SENT: 'Enviado',
  CONFIRMED: 'Confirmado',
  FAILED: 'Falhou',
}

// Mostra o texto em português; se o código for desconhecido, mostra o próprio código.
export const traduzir = (tabela: Record<string, string>, codigo: string) => tabela[codigo] ?? codigo

// "AN-021 · Mel" quando a API mandar o código do animal; senão "Animal nº 7".
// (Hoje a fila só devolve animal_id; o código fica para quando o backend incluir.)
export function nomeDoPaciente(entrada: { animal_id: number; animal_code?: string; animal_name?: string | null }) {
  if (entrada.animal_code) {
    return entrada.animal_name ? `${entrada.animal_code} · ${entrada.animal_name}` : entrada.animal_code
  }
  return `Animal nº ${entrada.animal_id}`
}

// "Cão · Consulta"
export const especieETipo = (entrada: { species: string; appointment_type: string }) =>
  `${traduzir(ESPECIES, entrada.species)} · ${traduzir(TIPOS_ATENDIMENTO, entrada.appointment_type)}`

// Mensagens de erro da API (em inglês) traduzidas. A comparação é pelo começo do texto.
const MENSAGENS_ERRO: [string, string][] = [
  ['Invalid credentials', 'E-mail ou senha incorretos.'],
  ['Invalid status link', 'Link inválido ou expirado.'],
  ['Appointment already checked in', 'Este agendamento já fez check-in.'],
  ['Appointment is', 'Este agendamento não pode mais fazer check-in.'],
  ['Veterinarian resource conflicts', 'O veterinário já tem outro agendamento nesse horário.'],
  ['Animal/tutor mismatch', 'O animal não pertence a esse tutor.'],
  ['Assigned veterinarian is already in use', 'O veterinário escolhido já está em atendimento.'],
  ['Isolation-required entry', 'Aloque a sala de isolamento antes de iniciar este atendimento.'],
  ['Entry is not in service', 'Este paciente não está em atendimento.'],
  ['Cannot call from', 'Este paciente não pode ser chamado agora.'],
  ['Cannot start from', 'Este atendimento não pode ser iniciado agora.'],
  ['Cannot notify', 'Este paciente não pode receber aviso agora.'],
  ['Resource already allocated', 'Este recurso já está ocupado.'],
  ['There is already an unconfirmed notification', 'Já existe um aviso aguardando confirmação do tutor.'],
  ['Reception must resolve', 'Registre a providência do aviso com falha antes de avisar de novo.'],
  ['There is no pending return notification', 'Não há aviso pendente para confirmar.'],
  ['There is no open reception action', 'Este aviso não tem ação pendente.'],
  ['Cannot mark notification as failed', 'Este aviso não pode mais ser marcado como falha.'],
  ['Cannot confirm notification', 'Este aviso não pode mais ser confirmado.'],
  ['Location retention is not configured', 'A clínica ainda não configurou o prazo de retenção da localização.'],
  ['Queue entry not found', 'Paciente não encontrado na fila.'],
  ['Notification not found', 'Aviso não encontrado.'],
  ['Tutor not found', 'Tutor não encontrado.'],
  ['Animal not found', 'Animal não encontrado.'],
]

// Texto de erro pronto para mostrar na tela.
export function mensagemDeErro(erro: unknown): string {
  if (!(erro instanceof ErroApi)) return 'Algo deu errado. Tente de novo.'
  if (erro.status === 0) return 'Sem conexão com o servidor. Confira a internet e tente de novo.'
  if (erro.status === 403) return 'Seu perfil não tem permissão para esta ação.'

  const traducao = MENSAGENS_ERRO.find(([inicio]) => erro.message.startsWith(inicio))
  if (traducao) return traducao[1]
  if (erro.status === 422) return `Confira os campos: ${erro.message}`
  return erro.message
}
