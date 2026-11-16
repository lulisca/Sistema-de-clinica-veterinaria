// Mostra o link que o tutor abre no celular (/t/<token>) e um botão para copiar.
import { useState } from 'react'

export default function LinkTutor({ token }: { token: string }) {
  const [copiado, setCopiado] = useState(false)
  const endereco = `${window.location.origin}/t/${token}`

  async function copiar() {
    try {
      await navigator.clipboard.writeText(endereco)
      setCopiado(true)
    } catch {
      setCopiado(false) // sem permissão de área de transferência: o link continua visível
    }
  }

  return (
    <span className="link-tutor">
      <span>Link do tutor:</span>
      <a href={endereco} target="_blank" rel="noreferrer">{endereco}</a>
      <button type="button" className="botao botao-texto" onClick={copiar}>
        {copiado ? 'Copiado' : 'Copiar link'}
      </button>
    </span>
  )
}
