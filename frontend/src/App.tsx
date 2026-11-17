// Rotas do sistema.
//   /                   página inicial: "Entrar na fila" (tutor) ou "Entrar na recepção" (equipe)
//   /t/<token>          tela do tutor (link público, sem login)
//   /tutor/...          tutor com conta: entrar, criar conta e entrar na fila com os sintomas
//   /recepcao/...       telas da clínica (com login)
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import Entrada from './paginas/Entrada'
import StatusTutor from './paginas/tutor/StatusTutor'
import AcessoTutor from './paginas/tutor/AcessoTutor'
import InicioTutor from './paginas/tutor/InicioTutor'
import Login from './paginas/recepcao/Login'
import LayoutRecepcao from './paginas/recepcao/LayoutRecepcao'
import Fila from './paginas/recepcao/Fila'
import Cadastro from './paginas/recepcao/Cadastro'
import Detalhe from './paginas/recepcao/Detalhe'
import Recursos from './paginas/recepcao/Recursos'
import Avisos from './paginas/recepcao/Avisos'
import Indicadores from './paginas/recepcao/Indicadores'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Entrada />} />
        <Route path="/t/:token" element={<StatusTutor />} />
        <Route path="/tutor" element={<InicioTutor />} />
        <Route path="/tutor/entrar" element={<AcessoTutor key="entrar" modo="entrar" />} />
        <Route path="/tutor/criar-conta" element={<AcessoTutor key="criar" modo="criar" />} />
        <Route path="/recepcao/login" element={<Login />} />
        <Route path="/recepcao" element={<LayoutRecepcao />}>
          <Route index element={<Navigate to="fila" replace />} />
          <Route path="fila" element={<Fila />} />
          <Route path="cadastro" element={<Cadastro />} />
          <Route path="caso/:id" element={<Detalhe />} />
          <Route path="recursos" element={<Recursos />} />
          <Route path="avisos" element={<Avisos />} />
          <Route path="indicadores" element={<Indicadores />} />
        </Route>
        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </BrowserRouter>
  )
}

function NaoEncontrada() {
  return (
    <main className="recepcao-conteudo">
      <h1 className="titulo-lg">Página não encontrada</h1>
      <p className="corpo-md texto-secundario">Confira o endereço. Se você é tutor, peça um novo link à recepção.</p>
      <Link className="botao botao-contorno" to="/" style={{ alignSelf: 'flex-start' }}>
        Ir para o início
      </Link>
    </main>
  )
}
