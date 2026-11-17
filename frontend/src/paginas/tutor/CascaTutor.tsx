// Moldura das telas do tutor com conta: coluna de celular e o topo "Fila Virtual".
// (Mesmo visual da tela de acompanhamento /t/<token>.)
import type { ReactNode } from 'react'
import './tutor.css'

export default function CascaTutor({ acao, children }: { acao?: ReactNode; children: ReactNode }) {
  return (
    <main className="tutor">
      <div className="tutor-coluna">
        <header className="tutor-topo">
          <span className="titulo-sm texto-marca">Fila Virtual</span>
          {acao}
        </header>
        {children}
      </div>
    </main>
  )
}
