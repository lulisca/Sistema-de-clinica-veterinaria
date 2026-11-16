// Moldura das telas da recepção: barra de topo com navegação e usuário.
// Sem login, manda para a tela de entrar.
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { encerrarSessao, lerSessao } from '../../sessao'
import { PERFIS } from '../../textos'
import './recepcao.css'

const LINKS = [
  { para: '/recepcao/fila', texto: 'Fila' },
  { para: '/recepcao/cadastro', texto: 'Cadastro' },
  { para: '/recepcao/recursos', texto: 'Recursos' },
  { para: '/recepcao/avisos', texto: 'Avisos' },
  { para: '/recepcao/indicadores', texto: 'Indicadores' },
]

export default function LayoutRecepcao() {
  const navegar = useNavigate()
  const sessao = lerSessao()
  if (!sessao) return <Navigate to="/recepcao/login" replace />

  function sair() {
    encerrarSessao()
    navegar('/recepcao/login')
  }

  return (
    <div className="recepcao">
      <a className="pular-link" href="#conteudo">Pular para o conteúdo</a>
      <header className="recepcao-topo">
        <span className="titulo-md texto-marca">Fila Virtual</span>
        <nav className="recepcao-nav" aria-label="Telas da recepção">
          {LINKS.map((link) => (
            <NavLink key={link.para} to={link.para}>
              {link.texto}
            </NavLink>
          ))}
        </nav>
        <div className="recepcao-usuario">
          <span className="corpo-md-forte">{sessao.email}</span>
          <span className="corpo-sm texto-secundario">{PERFIS[sessao.perfil] ?? sessao.perfil}</span>
        </div>
        <button className="botao botao-texto" onClick={sair}>
          Sair
        </button>
      </header>
      <main id="conteudo" className="recepcao-conteudo" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
