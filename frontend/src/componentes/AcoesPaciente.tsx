// Botões de ação de um paciente da fila. Usado na Fila (R2/R3) e no Detalhe do caso (R5).
// Quais botões aparecem depende do estado (regra do "Cartão de fila" no Figma).
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { chamarPaciente, declararEmergencia, finalizarAtendimento, iniciarAtendimento } from '../api'
import { lerSessao, podeDeclararEmergencia } from '../sessao'
import { mensagemDeErro, nomeDoPaciente } from '../textos'
import type { EntradaFila } from '../tipos'

interface Props {
  entrada: EntradaFila
  aoTerminar: (resultado: { tipo: 'sucesso' | 'erro'; texto: string }) => void
  mostrarDetalhe?: boolean
}

export default function AcoesPaciente({ entrada, aoTerminar, mostrarDetalhe = true }: Props) {
  const [ocupado, setOcupado] = useState(false)
  const perfil = lerSessao()?.perfil
  const nome = nomeDoPaciente(entrada)
  const estado = entrada.status

  async function executar(acao: () => Promise<unknown>, textoSucesso: string) {
    setOcupado(true)
    try {
      await acao()
      aoTerminar({ tipo: 'sucesso', texto: textoSucesso })
    } catch (erro) {
      aoTerminar({ tipo: 'erro', texto: mensagemDeErro(erro) })
    } finally {
      setOcupado(false)
    }
  }

  const podeChamar = estado === 'WAITING'
  const podeIniciar = ['CALLED', 'RETURNING', 'READY'].includes(estado)
  const podeFinalizar = estado === 'IN_SERVICE'
  // Emergência: só veterinário/admin, e só para quem ainda espera.
  const podeEmergencia =
    podeDeclararEmergencia(perfil) && !entrada.emergency && ['WAITING', 'READY'].includes(estado)

  return (
    <>
      {podeChamar && (
        <button
          className="botao botao-contorno"
          disabled={ocupado}
          onClick={() => executar(() => chamarPaciente(entrada.id), `${nome} foi chamado. Aviso simulado enviado ao tutor.`)}
        >
          Chamar
        </button>
      )}
      {podeIniciar && (
        <button
          className="botao botao-contorno"
          disabled={ocupado}
          onClick={() => executar(() => iniciarAtendimento(entrada.id), `Atendimento de ${nome} iniciado.`)}
        >
          Iniciar
        </button>
      )}
      {podeFinalizar && (
        <button
          className="botao botao-contorno"
          disabled={ocupado}
          onClick={() => executar(() => finalizarAtendimento(entrada.id), `Atendimento de ${nome} finalizado.`)}
        >
          Finalizar
        </button>
      )}
      {podeEmergencia && (
        <button
          className="botao botao-perigo"
          disabled={ocupado}
          onClick={() => executar(() => declararEmergencia(entrada.id), `Emergência declarada para ${nome}.`)}
        >
          {mostrarDetalhe ? 'Emergência' : 'Declarar emergência'}
        </button>
      )}
      {mostrarDetalhe && (
        <Link className="botao botao-texto" to={`/recepcao/caso/${entrada.id}`}>
          Detalhe
        </Link>
      )}
    </>
  )
}
