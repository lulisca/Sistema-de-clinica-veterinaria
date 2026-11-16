// R6 · Recursos e sala de isolamento (F3: recurso compartilhado).
//
// A API não lista as alocações abertas. Por isso a ocupação é deduzida da fila:
// um paciente "em atendimento" que requer isolamento está usando a sala
// (a API não deixa iniciar esse atendimento sem a sala alocada).
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { criarRecurso, listarFila, listarRecursos } from '../../api'
import Campo from '../../componentes/Campo'
import { hora } from '../../formato'
import { mensagemDeErro, nomeDoPaciente, TIPOS_RECURSO, traduzir } from '../../textos'
import type { EntradaFila, Recurso } from '../../tipos'

const ESPERANDO = ['WAITING', 'CALLED', 'RETURNING', 'READY']

export default function Recursos() {
  const [recursos, setRecursos] = useState<Recurso[] | null>(null)
  const [fila, setFila] = useState<EntradaFila[]>([])
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    try {
      const [listaRecursos, listaFila] = await Promise.all([listarRecursos(), listarFila()])
      setRecursos(listaRecursos)
      setFila(listaFila)
      setErro(null)
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const sala = recursos?.find((r) => r.resource_type === 'ISOLATION_ROOM')
  const ocupante = fila.find((e) => e.status === 'IN_SERVICE' && e.isolation_required)
  const esperandoIsolamento = fila.filter((e) => ESPERANDO.includes(e.status) && e.isolation_required)
  const outros = recursos?.filter((r) => r.resource_type !== 'ISOLATION_ROOM') ?? []

  // Veterinário "atendendo AN-014": paciente em atendimento com este veterinário.
  const atendendo = (recurso: Recurso) =>
    fila.find((e) => e.status === 'IN_SERVICE' && e.veterinarian_resource_id === recurso.id)

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1 className="titulo-lg">Recursos</h1>
        </div>
      </div>

      {erro && (
        <div className="faixa-aviso faixa-aviso-erro" role="alert">
          <span>{erro}</span>
          <button className="botao botao-contorno" onClick={carregar}>Tentar de novo</button>
        </div>
      )}
      {recursos === null && !erro && <p className="corpo-md texto-secundario" role="status">Carregando recursos…</p>}

      {recursos && (
        <div className="colunas colunas-iguais">
          <section className="cartao" aria-labelledby="titulo-isolamento">
            <h2 id="titulo-isolamento" className="titulo-md">Sala de isolamento (única)</h2>
            {!sala ? (
              <p className="corpo-md texto-secundario">Nenhuma sala de isolamento cadastrada. Use o formulário ao lado.</p>
            ) : (
              <>
                <div className="linha-dado"><span>Sala</span><span>{sala.name}</span></div>
                <div className="linha-dado"><span>Situação</span><span>{ocupante ? 'Ocupada' : 'Livre'}</span></div>
                {ocupante && (
                  <>
                    <div className="linha-dado"><span>Paciente</span><span>{nomeDoPaciente(ocupante)}</span></div>
                    <div className="linha-dado"><span>Ocupada desde</span><span>{hora(ocupante.started_at)}</span></div>
                    <Link className="botao botao-contorno botao-largo" to={`/recepcao/caso/${ocupante.id}`}>
                      Abrir caso
                    </Link>
                  </>
                )}
                {esperandoIsolamento.length > 0 && (
                  <div className={`faixa-aviso ${ocupante ? 'faixa-aviso-atencao' : 'faixa-aviso-info'}`}>
                    <strong>
                      {esperandoIsolamento.length === 1
                        ? 'Alguém está esperando pelo isolamento'
                        : `${esperandoIsolamento.length} pacientes esperando pelo isolamento`}
                    </strong>
                    <span>{esperandoIsolamento.map(nomeDoPaciente).join(', ')}</span>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="cartao" aria-labelledby="titulo-outros">
            <h2 id="titulo-outros" className="titulo-md">Outros recursos</h2>
            {outros.length === 0 ? (
              <p className="corpo-md texto-secundario">Nenhum recurso cadastrado.</p>
            ) : (
              <ul className="lista-recursos">
                {outros.map((recurso) => {
                  const paciente = recurso.resource_type === 'VETERINARIAN' ? atendendo(recurso) : undefined
                  return (
                    <li key={recurso.id}>
                      <div>
                        <span className="corpo-md-forte">{recurso.name}</span>
                        <span className="corpo-sm texto-secundario">
                          {traduzir(TIPOS_RECURSO, recurso.resource_type)} · {recurso.active ? 'Ativo' : 'Inativo'}
                          {recurso.resource_type === 'VETERINARIAN' &&
                            (paciente ? ` · atendendo ${nomeDoPaciente(paciente)}` : ' · livre')}
                        </span>
                      </div>
                      {recurso.resource_type === 'VETERINARIAN' && (
                        <Link className="botao botao-texto" to="/recepcao/fila">Ver fila</Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
            <NovoRecurso aoCriar={carregar} />
          </section>
        </div>
      )}
    </>
  )
}

// Cadastro de veterinário, sala ou sala de isolamento (não está no Figma, mas sem ele não há recursos).
function NovoRecurso({ aoCriar }: { aoCriar: () => void }) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('VETERINARIAN')
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    try {
      await criarRecurso({ name: nome.trim(), resource_type: tipo })
      setMensagem({ tipo: 'sucesso', texto: `${nome} cadastrado.` })
      setNome('')
      aoCriar()
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: mensagemDeErro(erro) })
    }
  }

  return (
    <form className="coluna" onSubmit={enviar} aria-labelledby="titulo-novo-recurso">
      <h3 id="titulo-novo-recurso" className="titulo-sm">Cadastrar recurso</h3>
      <Campo id="recurso-nome" rotulo="Nome">
        <input id="recurso-nome" required value={nome} placeholder="ex.: Dra. Ana" onChange={(e) => setNome(e.target.value)} />
      </Campo>
      <Campo id="recurso-tipo" rotulo="Tipo">
        <select id="recurso-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {Object.entries(TIPOS_RECURSO).map(([codigo, texto]) => (
            <option key={codigo} value={codigo}>{texto}</option>
          ))}
        </select>
      </Campo>
      {mensagem && (
        <p className={`faixa-aviso faixa-aviso-${mensagem.tipo}`} role={mensagem.tipo === 'erro' ? 'alert' : 'status'}>
          {mensagem.texto}
        </p>
      )}
      <button className="botao botao-contorno" type="submit">Cadastrar</button>
    </form>
  )
}
