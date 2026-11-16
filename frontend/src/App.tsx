// Rotas do sistema. As telas entram nas próximas etapas.
import { BrowserRouter, Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </BrowserRouter>
  )
}

function NaoEncontrada() {
  return (
    <main style={{ padding: 'var(--espaco-2xl)' }}>
      <h1 className="titulo-lg">Página não encontrada</h1>
    </main>
  )
}
