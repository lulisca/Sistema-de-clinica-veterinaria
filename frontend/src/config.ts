// Configurações lidas do arquivo .env.local (veja .env.example).
// Cada uma tem um valor padrão para o projeto rodar sem configurar nada.

const env = import.meta.env

export const API_URL: string = env.VITE_API_URL ?? 'http://localhost:8000/api'

// F2: posição da clínica (usada só no navegador do tutor)
export const CLINICA_LATITUDE = Number(env.VITE_CLINICA_LATITUDE ?? -22.4878)
export const CLINICA_LONGITUDE = Number(env.VITE_CLINICA_LONGITUDE ?? -47.2133)
export const VELOCIDADE_MEDIA_KMH = Number(env.VITE_VELOCIDADE_MEDIA_KMH ?? 30)

// Valores de demonstração do handoff. Não são decisão da clínica.
export const AVISO_FIXO_MIN = Number(env.VITE_AVISO_FIXO_MIN ?? 20)
export const MARGEM_SEGURANCA_MIN = Number(env.VITE_MARGEM_SEGURANCA_MIN ?? 10)

// De quanto em quanto tempo as telas buscam dados novos (milissegundos)
export const INTERVALO_ATUALIZACAO_MS = 20_000
