// R7 · Avisos com falha (F2). Cada falha abre uma ação para a recepção;
// a API só deixa avisar de novo depois que a providência é registrada.
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { buscarEntrada, listarAcoesPendentes, registrarProvidencia } from '../../api'
import Campo from '../../componentes/Campo'
import { SeloEstado } from '../../componentes/Selos'
import { hora } from '../../formato'
import { especieETipo, mensagemDeErro, nomeDoPaciente, SITUACOES_AVISO, traduzir } from '../../textos'
import type { Aviso, EntradaFila } from '../../tipos'

type Pendencia = { aviso: Aviso; entrada: EntradaFila }

export default function Avisos() {
  const [pendencias, setPendencias] = useState<Pendencia[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    try {
      const avisos = await listarAcoesPendentes()
      const lista = await Promise.all(
        avisos.map(async (aviso) => ({ aviso, entrada: await buscarEntrada(aviso.queue_entry_id) })),
      )
      setPendencias(lista)
      setErro(null)
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const total = pendencias?.length ?? 0

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1 className="titulo-lg">Avisos com falha</h1>
          {pendencias && (
            <p className="corpo-sm texto-secundario">
              {total === 1 ? '1 ação pendente da recepção' : `${total} ações pendentes da recepção`}
            </p>
          )}
        </div>
      </div>

      {erro && (
        <div className="faixa-aviso faixa-aviso-erro" role="alert">
          <span>{erro}</span>
          <button className="botao botao-contorno" onClick={carregar}>Tentar de novo</button>
        </div>
      )}
      {sucesso && <p className="faixa-aviso faixa-aviso-sucesso" role="status">{sucesso}</p>}
      {total > 0 && <p className="faixa-aviso faixa-aviso-atencao"><strong>Nova tentativa bloqueada até a providência</strong></p>}
      {pendencias === null && !erro && <p className="corpo-md texto-secundario" role="status">Carregando avisos…</p>}

      {pendencias?.length === 0 && (
        <section className="cartao">
          <p className="titulo-md">Nenhum aviso com falha agora.</p>
        </section>
      )}

      {pendencias?.map(({ aviso, entrada }) => (
        <CartaoPendencia
          key={aviso.id}
          aviso={aviso}
          entrada={entrada}
          aoResolver={(texto) => {
            setSucesso(texto)
            carregar()
          }}
        />
      ))}
    </>
  )
}

function CartaoPendencia({ aviso, entrada, aoResolver }: Pendencia & { aoResolver: (texto: string) => void }) {
  const [nota, setNota] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const idCampo = `providencia-${aviso.id}`

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      await registrarProvidencia(aviso.id, nota.trim())
      aoResolver(`Providência registrada para ${nomeDoPaciente(entrada)}. Já é possível avisar de novo.`)
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }

  return (
    <section className="cartao" aria-label={`Aviso nº ${aviso.id}`}>
      <div className="aviso-cabecalho">
        <div>
          <h2 className="titulo-md">{nomeDoPaciente(entrada)}</h2>
          <p className="corpo-sm texto-secundario">
            {especieETipo(entrada)}
            {entrada.called_at && ` · chamado às ${hora(entrada.called_at)}`}
          </p>
        </div>
        <SeloEstado estado={entrada.status} />
        <span className="corpo-sm texto-secundario">Aviso nº {aviso.id}</span>
      </div>

      <div className="colunas colunas-iguais">
        <div className="coluna" style={{ gap: 'var(--espaco-sm)' }}>
          <div className="linha-dado"><span>Canal</span><span>{aviso.channel}</span></div>
          <div className="linha-dado"><span>Enviado</span><span>{hora(aviso.sent_at)}</span></div>
          <div className="linha-dado"><span>Situação</span><span>{traduzir(SITUACOES_AVISO, aviso.status)} · ação pendente</span></div>
          <div className="linha-dado"><span>Mensagem</span><span>{aviso.message}</span></div>
        </div>

        <form className="coluna" style={{ gap: 'var(--espaco-md)' }} onSubmit={enviar}>
          <Campo id={idCampo} rotulo="Providência da recepção" apoio="O que foi feito (mínimo 3 caracteres)." erro={erro}>
            <input id={idCampo} required minLength={3} maxLength={1000} value={nota} placeholder="ex.: Liguei para o tutor e ele está voltando."
              onChange={(e) => setNota(e.target.value)} aria-describedby={`${idCampo}-apoio`} />
          </Campo>
          <div className="acoes">
            <button className="botao botao-acao" type="submit">Registrar providência</button>
            <Link className="botao botao-texto" to={`/recepcao/caso/${entrada.id}`}>Abrir detalhe do caso</Link>
          </div>
        </form>
      </div>
    </section>
  )
}
