// Funções pequenas para mostrar números e horários no padrão brasileiro.

// O backend com SQLite devolve datas em UTC sem o "Z" no final.
// Sem o "Z", o navegador acharia que é horário local e erraria em 3 horas.
export function paraData(iso: string): Date {
  const temFuso = /([zZ]|[+-]\d\d:\d\d)$/.test(iso)
  return new Date(temFuso ? iso : `${iso}Z`)
}

// "14:02"
export function hora(iso: string | null | undefined): string {
  if (!iso) return '—'
  return paraData(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// 12.5 -> "12,5"
export function decimal(valor: number | null | undefined, casas = 1): string {
  if (valor === null || valor === undefined) return '—'
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

// 4 -> "+4,0" e -1 -> "−1,0" (com o sinal de menos tipográfico)
export function comSinal(valor: number | null | undefined, casas = 1): string {
  if (valor === null || valor === undefined) return '—'
  const texto = decimal(Math.abs(valor), casas)
  if (valor > 0) return `+${texto}`
  if (valor < 0) return `−${texto}`
  return texto
}

// Faixa da estimativa (F1): p50 é o valor central e p90 o limite conservador.
// 20.4 e 35.2 -> "20–35 min". Faixa muito curta vira "até 1 min" ou "12 min".
export function faixa(p50: number, p90: number): string {
  const inicio = Math.round(p50)
  const fim = Math.round(p90)
  if (fim < 1) return 'até 1 min'
  if (inicio === fim) return `${fim} min`
  return `${inicio}–${fim} min`
}

// 0.78 -> "78%"
export function porcentagem(taxa: number | null | undefined): string {
  if (taxa === null || taxa === undefined) return '—'
  return `${Math.round(taxa * 100)}%`
}

// Horário atual para "atualizada às 14:34"
export function agora(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
