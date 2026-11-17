// Tutor com conta (/tutor): entra na fila escolhendo o animal, o tipo de atendimento e os sintomas.
// Depois de entrar, vai para /t/<token>, a mesma tela de acompanhamento do link da recepção.
// Quem já está na fila vê o atendimento ativo e o botão para acompanhar.
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  buscarTutorLogado, cadastrarMeuAnimal, entrarNaFila, listarMeusAnimais, listarMeusAtendimentos,
} from '../../api'
import Campo from '../../componentes/Campo'
import { SeloEstado } from '../../componentes/Selos'
import { encerrarSessaoTutor, lerSessaoTutor } from '../../sessao'
import { ESPECIES, mensagemDeErro, TIPOS_ATENDIMENTO, traduzir } from '../../textos'
import type { Animal, EntradaFila, Tutor } from '../../tipos'
import CascaTutor from './CascaTutor'

const NOVO = 'novo' // valor do chip "Outro animal"

export default function InicioTutor() {
  const navegar = useNavigate()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [animais, setAnimais] = useState<Animal[]>([])
  const [atendimentos, setAtendimentos] = useState<EntradaFila[]>([])
  const [erroCarga, setErroCarga] = useState<string | null>(null)

  // Formulário "Entrar na fila". Quem já está na fila só vê o formulário se pedir.
  const [abrirFormulario, setAbrirFormulario] = useState(false)
  const [escolhido, setEscolhido] = useState<number | typeof NOVO | null>(null)
  const [nomeAnimal, setNomeAnimal] = useState('')
  const [especie, setEspecie] = useState('DOG')
  const [tipo, setTipo] = useState('CONSULTATION')
  const [sintomas, setSintomas] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const carregar = useCallback(async () => {
    setErroCarga(null)
    try {
      const [eu, meusAnimais, meusAtendimentos] = await Promise.all([
        buscarTutorLogado(), listarMeusAnimais(), listarMeusAtendimentos(),
      ])
      setTutor(eu)
      setAnimais(meusAnimais)
      setAtendimentos(meusAtendimentos)
    } catch (e) {
      setErroCarga(mensagemDeErro(e))
    }
  }, [])

  useEffect(() => {
    if (lerSessaoTutor()) carregar()
  }, [carregar])

  if (!lerSessaoTutor()) return <Navigate to="/tutor/entrar" replace />

  function sair() {
    encerrarSessaoTutor()
    navegar('/tutor/entrar')
  }

  const botaoSair = <button type="button" className="botao botao-texto" onClick={sair}>Sair</button>

  if (erroCarga) {
    return (
      <CascaTutor acao={botaoSair}>
        <section className="cartao-tutor cartao-centro" role="alert">
          <h1 className="titulo-md">Não deu para carregar</h1>
          <p className="corpo-md texto-secundario">{erroCarga}</p>
          <button type="button" className="botao botao-acao botao-grande botao-largo" onClick={carregar}>
            Tentar de novo
          </button>
        </section>
      </CascaTutor>
    )
  }

  if (!tutor) {
    return (
      <CascaTutor acao={botaoSair}>
        <p className="corpo-md texto-secundario" role="status">Carregando…</p>
      </CascaTutor>
    )
  }

  const nomeDoAnimal = (id: number) => {
    const animal = animais.find((a) => a.id === id)
    return animal?.name || 'Seu animal'
  }

  // Animal com atendimento ativo não pode entrar de novo (a API recusa).
  const naFila = new Set(atendimentos.map((a) => a.animal_id))
  const livres = animais.filter((a) => !naFila.has(a.id))
  // Sem animal livre, o formulário já abre no cadastro de um animal novo.
  const escolha = escolhido ?? (livres[0]?.id ?? NOVO)
  const animalNovo = escolha === NOVO

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setOcupado(true)
    setErro(null)
    try {
      let animalId = escolha as number
      if (animalNovo) {
        const novo = await cadastrarMeuAnimal({ name: nomeAnimal.trim(), species: especie })
        // Guarda o animal já criado: se a entrada na fila falhar, a nova tentativa não duplica o animal.
        setAnimais((lista) => [...lista, novo])
        setEscolhido(novo.id)
        animalId = novo.id
      }
      const entrada = await entrarNaFila({ animal_id: animalId, appointment_type: tipo, symptoms: sintomas.trim() })
      navegar(`/t/${entrada.public_token}`)
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setOcupado(false)
    }
  }

  const primeiroNome = tutor.name.trim().split(/\s+/)[0]

  return (
    <CascaTutor acao={botaoSair}>
      <div className="tutor-texto">
        <h1 className="titulo-xl">Olá, {primeiroNome}</h1>
        {atendimentos.length === 0 && (
          <p className="corpo-lg texto-secundario">Conte o que o seu animal tem para entrar na fila.</p>
        )}
      </div>

      {atendimentos.map((atendimento) => (
        <section key={atendimento.id} className="cartao-espera" aria-label={`Atendimento de ${nomeDoAnimal(atendimento.animal_id)}`}>
          <p className="titulo-md">{nomeDoAnimal(atendimento.animal_id)} está na fila</p>
          <SeloEstado estado={atendimento.status} />
          <Link className="botao botao-acao botao-grande botao-largo" to={`/t/${atendimento.public_token}`}>
            Acompanhar a vez
          </Link>
        </section>
      ))}

      {atendimentos.length > 0 && !abrirFormulario ? (
        <button type="button" className="botao botao-contorno botao-grande botao-largo" onClick={() => setAbrirFormulario(true)}>
          Entrar na fila com outro animal
        </button>
      ) : (
        <form className="cartao-tutor formulario-tutor" onSubmit={enviar} aria-labelledby="titulo-entrar">
          <h2 className="titulo-md" id="titulo-entrar">
            {atendimentos.length > 0 ? 'Entrar na fila com outro animal' : 'Entrar na fila'}
          </h2>

          {livres.length > 0 && (
            <fieldset className="grupo-escolha">
              <legend>Qual animal?</legend>
              <div className="chips">
                {livres.map((animal) => (
                  <button key={animal.id} type="button" className="chip" aria-pressed={escolha === animal.id}
                    onClick={() => setEscolhido(animal.id)}>
                    {animal.name || traduzir(ESPECIES, animal.species)}
                  </button>
                ))}
                <button type="button" className="chip" aria-pressed={animalNovo} onClick={() => setEscolhido(NOVO)}>
                  Outro animal
                </button>
              </div>
            </fieldset>
          )}

          {animalNovo && (
            <>
              <Campo id="nome-animal" rotulo="Nome do animal">
                <input id="nome-animal" required maxLength={120} autoComplete="off"
                  value={nomeAnimal} onChange={(e) => setNomeAnimal(e.target.value)} />
              </Campo>
              <fieldset className="grupo-escolha">
                <legend>Espécie</legend>
                <div className="chips">
                  {Object.entries(ESPECIES).map(([codigo, rotulo]) => (
                    <button key={codigo} type="button" className="chip" aria-pressed={especie === codigo}
                      onClick={() => setEspecie(codigo)}>
                      {rotulo}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          <fieldset className="grupo-escolha">
            <legend>Tipo de atendimento</legend>
            <div className="chips">
              {Object.entries(TIPOS_ATENDIMENTO).map(([codigo, rotulo]) => (
                <button key={codigo} type="button" className="chip" aria-pressed={tipo === codigo}
                  onClick={() => setTipo(codigo)}>
                  {rotulo}
                </button>
              ))}
            </div>
          </fieldset>

          <Campo id="sintomas" rotulo="O que o animal tem?"
            apoio="Conte os sintomas e desde quando. O veterinário lê isto para decidir a ordem da fila.">
            <textarea id="sintomas" rows={5} required minLength={3} maxLength={2000}
              value={sintomas} onChange={(e) => setSintomas(e.target.value)} aria-describedby="sintomas-apoio" />
          </Campo>

          {erro && <p className="faixa-aviso faixa-aviso-erro" role="alert">{erro}</p>}

          <button className="botao botao-acao botao-grande botao-largo" type="submit" disabled={ocupado}>
            {ocupado ? 'Entrando na fila…' : 'Entrar na fila'}
          </button>
        </form>
      )}

      <p className="corpo-sm texto-secundario centro">
        Em caso de emergência, avise a recepção da clínica na hora.
      </p>
    </CascaTutor>
  )
}
