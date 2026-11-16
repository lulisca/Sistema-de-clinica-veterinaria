// R1 · Login da equipe da clínica (recepção, veterinário ou admin).
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { entrar, ErroApi } from '../../api'
import Campo from '../../componentes/Campo'
import { salvarSessao } from '../../sessao'
import { mensagemDeErro } from '../../textos'
import fotoLogin from '../../assets/foto-login.jpg'
import './recepcao.css'

export default function Login() {
  const navegar = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroCredenciais, setErroCredenciais] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setOcupado(true)
    setErroCredenciais(false)
    setErroGeral(null)
    try {
      const resposta = await entrar(email, senha)
      salvarSessao({ token: resposta.access_token, perfil: resposta.role, email })
      navegar('/recepcao/fila')
    } catch (erro) {
      // 401: e-mail ou senha errados (o que foi digitado continua nos campos)
      if (erro instanceof ErroApi && erro.status === 401) setErroCredenciais(true)
      else setErroGeral(mensagemDeErro(erro))
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="login">
      <aside className="login-marca">
        <div className="login-foto">
          <img src={fotoLogin} alt="" />
        </div>
        <p className="titulo-xl">Fila Virtual</p>
        <p className="corpo-lg">Organiza a fila da clínica e avisa o tutor na hora de voltar.</p>
      </aside>

      <main className="login-acesso">
        <form className="cartao login-cartao" onSubmit={enviar}>
          <h1 className="titulo-lg">Entrar na recepção</h1>

          <Campo
            id="email"
            rotulo="E-mail"
            apoio="Conta fornecida pela clínica."
            erro={erroCredenciais ? 'E-mail ou senha incorretos.' : null}
          >
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="email-apoio"
              aria-invalid={erroCredenciais}
            />
          </Campo>

          <Campo id="senha" rotulo="Senha" apoio="Mínimo de 8 caracteres.">
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-describedby="senha-apoio"
            />
          </Campo>

          {erroGeral && <p className="faixa-aviso faixa-aviso-erro" role="alert">{erroGeral}</p>}

          <button className="botao botao-acao botao-grande botao-largo" type="submit" disabled={ocupado}>
            {ocupado ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </main>
    </div>
  )
}
