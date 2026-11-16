// Rotas do sistema.
//   /t/<token>          tela do tutor (link público, sem login)
//   /recepcao/...       telas da clínica (com login)
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import StatusTutor from './paginas/tutor/StatusTutor'
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
        <Route path="/" element={<Navigate to="/recepcao/fila" replace />} />
        <Route path="/t/:token" element={<StatusTutor />} />
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
      <Link className="botao botao-contorno" to="/recepcao/fila" style={{ alignSelf: 'flex-start' }}>
        Ir para a fila
      </Link>
    </main>
  )
}
