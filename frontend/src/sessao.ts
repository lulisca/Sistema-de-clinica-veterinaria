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

// Regra do Caderno (F3): emergência é declarada pelo veterinário, nunca pelo sistema.
export function podeDeclararEmergencia(perfil: Perfil | undefined) {
  return perfil === 'VETERINARIAN' || perfil === 'ADMIN'
}
