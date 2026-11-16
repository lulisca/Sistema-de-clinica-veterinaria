// F2 – Distância do tutor decide o momento do aviso.
//
// Regras do Caderno do Aluno e do handoff:
// - a posição é pedida só em 3 momentos (entrada na fila, chamada e confirmação de retorno);
// - latitude e longitude ficam só no navegador: a API recebe apenas os MINUTOS de deslocamento;
// - quem nega a permissão continua na fila, com aviso por tempo fixo.
import { CLINICA_LATITUDE, CLINICA_LONGITUDE, VELOCIDADE_MEDIA_KMH } from './config'

export type Consentimento = 'permitido' | 'negado'

// Erro usado quando o tutor nega a permissão no navegador.
export class PermissaoNegada extends Error {}

// Pede a posição UMA vez e devolve só os minutos estimados até a clínica.
export function calcularMinutosAteClinica(): Promise<number> {
  return new Promise((resolver, rejeitar) => {
    if (!('geolocation' in navigator)) {
      rejeitar(new PermissaoNegada('Navegador sem geolocalização'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const km = distanciaKm(posicao.coords.latitude, posicao.coords.longitude, CLINICA_LATITUDE, CLINICA_LONGITUDE)
        // Arredonda para cima: é melhor avisar um pouco antes do que depois.
        resolver(Math.ceil((km / VELOCIDADE_MEDIA_KMH) * 60))
      },
      (erro) => {
        if (erro.code === erro.PERMISSION_DENIED) rejeitar(new PermissaoNegada(erro.message))
        else rejeitar(new Error(erro.message))
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    )
  })
}

// Distância em linha reta entre dois pontos (fórmula de Haversine), em km.
function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const raioTerraKm = 6371
  const rad = (graus: number) => (graus * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLon = rad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * raioTerraKm * Math.asin(Math.sqrt(a))
}

// A escolha do tutor fica salva neste navegador, por atendimento (token do link).
const chaveConsentimento = (token: string) => `fila-virtual:consentimento:${token}`
const chaveMinutos = (token: string) => `fila-virtual:deslocamento:${token}`

export function lerConsentimento(token: string): Consentimento | null {
  try {
    return localStorage.getItem(chaveConsentimento(token)) as Consentimento | null
  } catch {
    return null
  }
}

export function salvarConsentimento(token: string, valor: Consentimento) {
  localStorage.setItem(chaveConsentimento(token), valor)
}

// Últimos minutos calculados: usados no cartão "Dá tempo de voltar?".
export function lerMinutos(token: string): number | null {
  const texto = localStorage.getItem(chaveMinutos(token))
  return texto === null ? null : Number(texto)
}

export function salvarMinutos(token: string, minutos: number) {
  localStorage.setItem(chaveMinutos(token), String(minutos))
}
