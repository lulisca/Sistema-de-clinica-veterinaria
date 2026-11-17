// Tutor com conta: entrar (/tutor/entrar) e criar conta (/tutor/criar-conta).
// Depois de entrar, o tutor vai para /tutor, onde entra na fila com os sintomas.
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { criarContaTutor, entrar, ErroApi } from '../../api'
import Campo from '../../componentes/Campo'
import { lerSessaoTutor, salvarSessaoTutor } from '../../sessao'
import { mensagemDeErro } from '../../textos'
import fotoStatus from '../../assets/foto-status.jpg'
import CascaTutor from './CascaTutor'

export default function AcessoTutor({ modo }: { modo: 'entrar' | 'criar' }) {
  const navegar = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [erroCredenciais, setErroCredenciais] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  // Já entrou antes neste celular: vai direto para a fila.
  if (lerSessaoTutor()) return <Navigate to="/tutor" replace />

  const criando = modo === 'criar'

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setOcupado(true)
    setErroCredenciais(false)
    setErroGeral(null)
    try {
      const resposta = criando
        ? await criarContaTutor({ name: nome, email, password: senha, contact: telefone || undefined })
        : await entrar(email, senha)
      // Conta da equipe não usa as telas do tutor.
      if (resposta.role !== 'TUTOR') {
        setErroGeral('Esta conta é da equipe da clínica. Entre pela recepção.')
        return
      }
      salvarSessaoTutor({ token: resposta.access_token, email })
      navegar('/tutor')
    } catch (erro) {
      if (!criando && erro instanceof ErroApi && erro.status === 401) setErroCredenciais(true)
      else setErroGeral(mensagemDeErro(erro))
    } finally {
      setOcupado(false)
    }
  }

  return (
    <CascaTutor>
      <div className="tutor-foto tutor-foto-acesso">
        <img src={fotoStatus} alt="" />
      </div>

      <div className="tutor-texto">
        <h1 className="titulo-xl">{criando ? 'Crie sua conta' : 'Entre na fila da clínica'}</h1>
        <p className="corpo-lg texto-secundario">
          {criando
            ? 'Com ela você entra na fila pelo celular e acompanha a sua vez.'
            : 'Conte o que o seu animal tem e acompanhe a vez dele sem esperar na recepção.'}
        </p>
      </div>

      <form className="cartao-tutor formulario-tutor" onSubmit={enviar}>
        {criando && (
          <Campo id="nome" rotulo="Seu nome">
            <input id="nome" autoComplete="name" required minLength={2} maxLength={120}
              value={nome} onChange={(e) => setNome(e.target.value)} />
          </Campo>
        )}

        <Campo id="email" rotulo="E-mail" erro={erroCredenciais ? 'E-mail ou senha incorretos.' : null}>
          <input id="email" type="email" autoComplete={criando ? 'email' : 'username'} required
            value={email} onChange={(e) => setEmail(e.target.value)}
            aria-describedby={erroCredenciais ? 'email-apoio' : undefined} aria-invalid={erroCredenciais} />
        </Campo>

        {criando && (
          <Campo id="telefone" rotulo="Telefone (opcional)" apoio="A clínica usa se precisar falar com você.">
            <input id="telefone" type="tel" autoComplete="tel" maxLength={120}
              value={telefone} onChange={(e) => setTelefone(e.target.value)} aria-describedby="telefone-apoio" />
          </Campo>
        )}

        <Campo id="senha" rotulo="Senha" apoio="Mínimo de 8 caracteres.">
          <input id="senha" type="password" autoComplete={criando ? 'new-password' : 'current-password'}
            required minLength={8} maxLength={128}
            value={senha} onChange={(e) => setSenha(e.target.value)} aria-describedby="senha-apoio" />
        </Campo>

        {erroGeral && <p className="faixa-aviso faixa-aviso-erro" role="alert">{erroGeral}</p>}

        <button className="botao botao-acao botao-grande botao-largo" type="submit" disabled={ocupado}>
          {criando ? (ocupado ? 'Criando conta…' : 'Criar conta') : (ocupado ? 'Entrando…' : 'Entrar')}
        </button>
      </form>

      <p className="corpo-md texto-secundario centro">
        {criando ? 'Já tem conta? ' : 'Primeira vez aqui? '}
        <Link to={criando ? '/tutor/entrar' : '/tutor/criar-conta'}>{criando ? 'Entrar' : 'Criar conta'}</Link>
      </p>
    </CascaTutor>
  )
}
