// Selos do Figma: estado da fila, prioridade, viabilidade de retorno e marcadores.
import { ESTADOS, VIABILIDADES } from '../textos'
import type { EntradaFila, EstadoFila, Viabilidade } from '../tipos'

export function SeloEstado({ estado }: { estado: EstadoFila }) {
  return <span className={`selo selo-${estado}`}>{ESTADOS[estado] ?? estado}</span>
}

// Emergência só existe se o veterinário declarou (o sistema nunca classifica gravidade).
export function SeloPrioridade({ entrada }: { entrada: Pick<EntradaFila, 'emergency' | 'priority_level'> }) {
  if (entrada.emergency) return <span className="selo selo-emergencia">Emergência</span>
  return <span className="selo selo-nivel">Nível {entrada.priority_level}</span>
}

export function SeloViabilidade({ valor }: { valor: Viabilidade }) {
  return <span className={`viabilidade viabilidade-${valor}`}>{VIABILIDADES[valor]}</span>
}

// Marcadores operacionais da entrada (F3). Não são diagnóstico.
export function Marcadores({ entrada }: { entrada: Pick<EntradaFila, 'isolation_required' | 'infectious_risk' | 'reactive'> }) {
  const lista = [
    entrada.isolation_required && 'Isolamento',
    entrada.infectious_risk && 'Risco infeccioso',
    entrada.reactive && 'Reativo',
  ].filter(Boolean) as string[]

  if (lista.length === 0) return null
  return (
    <div className="marcadores">
      {lista.map((texto) => (
        <span key={texto} className="marcador">{texto}</span>
      ))}
    </div>
  )
}
