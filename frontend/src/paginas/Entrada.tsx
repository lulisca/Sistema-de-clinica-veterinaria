// Página inicial (/): duas portas. O tutor entra na fila; a equipe entra na recepção.
import { Link } from 'react-router-dom'
import fotoStatus from '../assets/foto-status.jpg'
import CascaTutor from './tutor/CascaTutor'

export default function Entrada() {
  return (
    <CascaTutor>
      <div className="tutor-foto tutor-foto-acesso">
        <img src={fotoStatus} alt="" />
      </div>

      <div className="tutor-texto">
        <h1 className="titulo-xl">A fila da clínica no celular</h1>
        <p className="corpo-lg texto-secundario">
          O tutor entra na fila e acompanha a vez. A equipe da clínica organiza o atendimento.
        </p>
      </div>

      <Link className="botao botao-acao botao-grande botao-largo" to="/tutor/entrar">
        Entrar na fila
      </Link>
      <Link className="botao botao-contorno botao-grande botao-largo" to="/recepcao/login">
        Entrar na recepção
      </Link>
    </CascaTutor>
  )
}
