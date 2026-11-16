// "Campo de formulário" do Figma: rótulo, entrada, texto de apoio e estado de erro.
// O campo (input/select) vem como filho, com o mesmo id passado aqui.
import type { ReactNode } from 'react'

interface Props {
  id: string
  rotulo: string
  apoio?: string
  erro?: string | null
  children: ReactNode
}

export default function Campo({ id, rotulo, apoio, erro, children }: Props) {
  const textoApoio = erro || apoio
  return (
    <div className={`campo ${erro ? 'campo-com-erro' : ''}`}>
      <label htmlFor={id}>{rotulo}</label>
      {children}
      {textoApoio && (
        <p className="campo-apoio" id={`${id}-apoio`} role={erro ? 'alert' : undefined}>
          {textoApoio}
        </p>
      )}
    </div>
  )
}
