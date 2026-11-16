// Rotas do sistema.
//   /t/<token>          tela do tutor (link público, sem login)
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import StatusTutor from './paginas/tutor/StatusTutor'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/t/:token" element={<StatusTutor />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </BrowserRouter>
  )
}

function NaoEncontrada() {
  return (
    <main style={{ padding: 'var(--espaco-2xl)' }}>
      <h1 className="titulo-lg">Página não encontrada</h1>
      <p className="corpo-md texto-secundario">Confira o endereço. Se você é tutor, peça um novo link à recepção.</p>
    </main>
  )
}
