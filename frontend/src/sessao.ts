// Guarda o login da equipe da clínica (token JWT) no navegador.
import type { Perfil } from './tipos'

export interface Sessao {
  token: string
  perfil: Perfil
  email: string
}

const CHAVE = 'fila-virtual:sessao'

export function lerSessao(): Sessao | null {
  try {
    const texto = localStorage.getItem(CHAVE)
    return texto ? (JSON.parse(texto) as Sessao) : null
  } catch {
    return null
  }
}

export function salvarSessao(sessao: Sessao) {
  localStorage.setItem(CHAVE, JSON.stringify(sessao))
}

export function encerrarSessao() {
  localStorage.removeItem(CHAVE)
}

// ---------- Login do tutor (conta própria, telas /tutor) ----------
// Fica separado do login da equipe: no mesmo navegador, um não derruba o outro.
export interface SessaoTutor {
  token: string
  email: string
}

const CHAVE_TUTOR = 'fila-virtual:sessao-tutor'

export function lerSessaoTutor(): SessaoTutor | null {
  try {
    const texto = localStorage.getItem(CHAVE_TUTOR)
    return texto ? (JSON.parse(texto) as SessaoTutor) : null
  } catch {
    return null
  }
}

export function salvarSessaoTutor(sessao: SessaoTutor) {
  localStorage.setItem(CHAVE_TUTOR, JSON.stringify(sessao))
}

export function encerrarSessaoTutor() {
  localStorage.removeItem(CHAVE_TUTOR)
}

// Regra do Caderno (F3): emergência é declarada pelo veterinário, nunca pelo sistema.
export function podeDeclararEmergencia(perfil: Perfil | undefined) {
  return perfil === 'VETERINARIAN' || perfil === 'ADMIN'
}
