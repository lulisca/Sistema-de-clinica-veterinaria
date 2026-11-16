// Tela do tutor (celular, sem login). Aberta pelo link /t/<token> que a recepção entrega.
// Uma página só, que mostra a "tela" do Figma de acordo com a situação:
//   T1 Status · T2 Pedido de localização · T3 É a sua vez · T4 Sem estimativa
//   T5 Localização negada · T6 Erro de rede / link inválido
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import {
  buscarPoliticaLocalizacao, buscarStatusPublico, confirmarRetorno, enviarDeslocamentoPublico, ErroApi,
} from '../../api'
import { AVISO_FIXO_MIN, INTERVALO_ATUALIZACAO_MS, MARGEM_SEGURANCA_MIN } from '../../config'
import { SeloEstado, SeloViabilidade } from '../../componentes/Selos'
import { agora, decimal, faixa } from '../../formato'
import {
  calcularMinutosAteClinica, lerConsentimento, lerMinutos, PermissaoNegada, salvarConsentimento, salvarMinutos,
  type Consentimento,
} from '../../localizacao'
import { mensagemDeErro } from '../../textos'
import type { MomentoLocalizacao, StatusPublico, Viabilidade } from '../../tipos'
import fotoStatus from '../../assets/foto-status.jpg'
import fotoSuaVez from '../../assets/foto-sua-vez.jpg'
import iconeLocalizacao from '../../assets/icone-localizacao.svg'
import iconeSemConexao from '../../assets/icone-sem-conexao.svg'
import iconeLinkInvalido from '../../assets/icone-link-invalido.svg'
import './tutor.css'

// Estados em que o tutor ainda está na fila (aguardando ou voltando).
const NA_FILA = ['WAITING', 'CALLED', 'RETURNING', 'READY']

export default function StatusTutor() {
  const { token = '' } = useParams()
  const [status, setStatus] = useState<StatusPublico | null>(null)
  const [erroCarga, setErroCarga] = useState<ErroApi | null>(null)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string | null>(null)
  const [consentimento, setConsentimento] = useState<Consentimento | null>(() => lerConsentimento(token))
  const [acabouDeNegar, setAcabouDeNegar] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const carregar = useCallback(async () => {
    try {
      setStatus(await buscarStatusPublico(token))
      setErroCarga(null)
      setUltimaAtualizacao(agora())
    } catch (erro) {
      setErroCarga(erro instanceof ErroApi ? erro : new ErroApi(0, 'Sem conexão'))
    }
  }, [token])

  // Busca ao abrir e depois a cada 20 s, para o tutor ver quando for chamado.
  useEffect(() => {
    carregar()
    const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS)
    return () => clearInterval(intervalo)
  }, [carregar])

  // F2: calcula os minutos até a clínica e envia SÓ os minutos (nunca a coordenada).
  const enviarPosicao = useCallback(
    async (momento: MomentoLocalizacao) => {
      const minutos = await calcularMinutosAteClinica()
      await enviarDeslocamentoPublico(token, { moment: momento, consent_given: true, travel_minutes: minutos })
      salvarMinutos(token, minutos)
    },
    [token],
  )

  // Momento 2 de 3: quando o tutor é chamado, a posição é pedida de novo (uma vez).
  const jaEnviouNaChamada = useRef(false)
  useEffect(() => {
    if (status?.status === 'CALLED' && consentimento === 'permitido' && !jaEnviouNaChamada.current) {
      jaEnviouNaChamada.current = true
      enviarPosicao('NOTIFICATION').catch(() => {
        // Sem posição neste momento: o aviso segue pelo último dado ou pelo tempo fixo.
      })
    }
  }, [status?.status, consentimento, enviarPosicao])

  async function negar() {
    try {
      await enviarDeslocamentoPublico(token, { moment: 'CHECK_IN', consent_given: false })
    } catch {
      // Mesmo se a API falhar, a negação vale: o tutor segue na fila com aviso por tempo fixo.
    }
    salvarConsentimento(token, 'negado')
    setConsentimento('negado')
    setAcabouDeNegar(true)
  }

  // Momento 1 de 3: entrada na fila.
  async function permitir() {
    setOcupado(true)
    setMensagem(null)
    try {
      await enviarPosicao('CHECK_IN')
      salvarConsentimento(token, 'permitido')
      setConsentimento('permitido')
      setAcabouDeNegar(false)
    } catch (erro) {
      if (erro instanceof PermissaoNegada) await negar() // negou no aviso do navegador
      else if (erro instanceof ErroApi) setMensagem(mensagemDeErro(erro))
      else setMensagem('Não conseguimos pegar sua localização. Tente de novo ou toque em "Agora não".')
    } finally {
      setOcupado(false)
    }
  }

  // Momento 3 de 3: confirmação de retorno.
  async function estouVoltando() {
    setOcupado(true)
    setMensagem(null)
    if (consentimento === 'permitido') {
      await enviarPosicao('RETURN_CONFIRMATION').catch(() => {})
    }
    try {
      await confirmarRetorno(token)
      await carregar()
    } catch (erro) {
      setMensagem(mensagemDeErro(erro))
    } finally {
      setOcupado(false)
    }
  }

  // ---------- T6: não carregou nada ----------
  if (!status) {
    if (!erroCarga) {
      return (
        <PaginaTutor>
          <p className="corpo-md texto-secundario" role="status">Carregando seu atendimento…</p>
        </PaginaTutor>
      )
    }
    if (erroCarga.status === 404) {
      return (
        <PaginaTutor>
          <section className="cartao-tutor cartao-tutor-erro cartao-centro">
            <span className="icone-redondo icone-redondo-branco"><img src={iconeLinkInvalido} alt="" width={32} height={32} /></span>
            <h1 className="titulo-md texto-erro">Link inválido ou expirado</h1>
            <p className="corpo-sm texto-secundario">Peça um novo à recepção.</p>
          </section>
        </PaginaTutor>
      )
    }
    return (
      <PaginaTutor>
        <SemConexao ultimaAtualizacao={ultimaAtualizacao} tentarDeNovo={carregar} />
      </PaginaTutor>
    )
  }

  const naFila = NA_FILA.includes(status.status)
  const aviso = mensagem && <p className="faixa-aviso faixa-aviso-erro" role="alert">{mensagem}</p>
  // Se uma atualização falhar, os dados antigos continuam na tela com este aviso.
  const avisoConexao = erroCarga && (
    <div className="faixa-aviso faixa-aviso-atencao" role="alert">
      <strong>Sem conexão</strong>
      <span>Última atualização: {ultimaAtualizacao ?? '—'}</span>
    </div>
  )

  // ---------- T2: pedido de localização ----------
  if (naFila && consentimento === null) {
    return (
      <PaginaTutor numero={status.queue_entry_id}>
        <div className="ilustracao">
          <span className="icone-redondo icone-redondo-branco"><img src={iconeLocalizacao} alt="" width={32} height={32} /></span>
        </div>
        <div className="tutor-texto">
          <h1 className="titulo-xl">Podemos ver onde você está?</h1>
          <p className="corpo-lg texto-secundario">Só para avisar na hora certa de voltar. Pedimos em 3 momentos:</p>
        </div>
        <ul className="momentos" aria-label="Momentos em que pedimos a localização">
          <li>Ao entrar</li>
          <li>Ao ser chamado</li>
          <li>Ao voltar</li>
        </ul>
        {aviso}
        <button className="botao botao-acao botao-grande botao-largo" onClick={permitir} disabled={ocupado}>
          {ocupado ? 'Calculando…' : 'Permitir'}
        </button>
        <button className="botao botao-texto botao-grande botao-largo" onClick={negar} disabled={ocupado}>
          Agora não
        </button>
        <p className="corpo-sm texto-secundario centro">
          Sem permissão, você continua na fila com aviso por tempo fixo.
        </p>
      </PaginaTutor>
    )
  }

  // ---------- T5: localização negada ----------
  if (acabouDeNegar && naFila) {
    return (
      <PaginaTutor numero={status.queue_entry_id}>
        <h1 className="titulo-xl">Você segue na fila</h1>
        <section className="cartao-espera">
          <p className="etiqueta-md">Aviso por tempo fixo</p>
          <p className="numero-xl">{AVISO_FIXO_MIN} min antes</p>
          <span className="selo selo-claro">valor de teste</span>
        </section>
        {aviso}
        <button className="botao botao-contorno botao-grande botao-largo" onClick={permitir} disabled={ocupado}>
          {ocupado ? 'Calculando…' : 'Permitir localização'}
        </button>
        <button className="botao botao-texto botao-grande botao-largo" onClick={() => setAcabouDeNegar(false)}>
          Ver minha posição
        </button>
        <Privacidade token={token} />
      </PaginaTutor>
    )
  }

  // ---------- T3: é a sua vez ----------
  if (status.status === 'CALLED') {
    const retorno = calcularRetorno(status, consentimento === 'permitido' ? lerMinutos(token) : null)
    return (
      <PaginaTutor numero={status.queue_entry_id}>
        {avisoConexao}
        <div className="tutor-foto tutor-foto-baixa">
          <img src={fotoSuaVez} alt="" />
          <SeloEstado estado={status.status} />
        </div>
        <div className="tutor-texto">
          <h1 className="titulo-xl">É a sua vez!</h1>
          <p className="corpo-lg texto-secundario">Volte para a clínica.</p>
        </div>
        <section className="cartao-tutor" aria-label="Dá tempo de voltar?">
          <div className="linha-viabilidade">
            <SeloViabilidade valor={retorno.viabilidade} />
            <p className="titulo-sm">{retorno.resumo}</p>
          </div>
          {retorno.folga !== null && (
            <details className="ver-calculo">
              <summary>Ver cálculo</summary>
              <div className="linha-dado"><span>Espera estimada (p50)</span><span>{decimal(retorno.p50)} min</span></div>
              <div className="linha-dado"><span>Seu deslocamento</span><span>{retorno.minutos} min</span></div>
              <div className="linha-dado"><span>Margem de segurança</span><span>{MARGEM_SEGURANCA_MIN} min</span></div>
              <div className="linha-dado"><span>Folga</span><span>{decimal(retorno.folga)} min</span></div>
            </details>
          )}
        </section>
        {aviso}
        <button className="botao botao-acao botao-grande botao-largo" onClick={estouVoltando} disabled={ocupado}>
          {ocupado ? 'Confirmando…' : 'Estou voltando'}
        </button>
        <button className="botao botao-texto botao-grande botao-largo" onClick={carregar}>
          Atualizar
        </button>
        <p className="corpo-sm texto-secundario centro">Não consegue voltar agora? Fale com a recepção.</p>
      </PaginaTutor>
    )
  }

  // ---------- T1 (com estimativa) e T4 (sem estimativa) ----------
  const estimativa = status.estimate
  const temFaixa = estimativa.status === 'ok' && estimativa.p50_minutes != null && estimativa.p90_minutes != null
  const posicao = status.contextual_position

  return (
    <PaginaTutor numero={status.queue_entry_id}>
      <h1 className="so-leitor">Seu atendimento na fila</h1>
      {avisoConexao}
      {(temFaixa || !naFila) && (
        <div className="tutor-foto">
          <img src={fotoStatus} alt="" />
          <SeloEstado estado={status.status} />
        </div>
      )}

      <section className="cartao-posicao" aria-label="Sua posição">
        <p className="numero-hero">{posicao ? `${posicao}º` : '—'}</p>
        <div>
          <p className="titulo-md">{posicao ? 'na fila' : textoForaDaFila(status.status)}</p>
          {posicao !== null && <p className="corpo-md legenda-posicao">{textoAntesDeVoce(posicao)}</p>}
        </div>
      </section>

      {naFila && temFaixa && (
        <section className="cartao-espera" aria-label="Espera estimada">
          <p className="etiqueta-md">Espera estimada</p>
          <p className="numero-xl">{faixa(estimativa.p50_minutes!, estimativa.p90_minutes!)}</p>
          {estimativa.data_source === 'MOCKED' && <span className="selo selo-claro">dados de teste</span>}
          {estimativa.data_source === 'MIXED' && <span className="selo selo-claro">dados mistos</span>}
        </section>
      )}

      {naFila && !temFaixa && (
        <section className="cartao-tutor" aria-label="Espera estimada">
          <p className="etiqueta-md texto-secundario">Espera estimada</p>
          <p className="titulo-xl">Indisponível</p>
          <p className="corpo-md texto-secundario">Faltam dados para estimar. Você continua na fila.</p>
        </section>
      )}

      <button className="botao botao-acao botao-grande botao-largo" onClick={carregar}>
        Atualizar
      </button>
      <Privacidade token={token} />
    </PaginaTutor>
  )
}

// ---------- Partes da tela ----------

function PaginaTutor({ numero, children }: { numero?: number; children: ReactNode }) {
  return (
    <main className="tutor">
      <div className="tutor-coluna">
        <header className="tutor-topo">
          <span className="titulo-sm texto-marca">Fila Virtual</span>
          {numero !== undefined && <span className="selo selo-claro">Nº {numero}</span>}
        </header>
        {children}
      </div>
    </main>
  )
}

function SemConexao({ ultimaAtualizacao, tentarDeNovo }: { ultimaAtualizacao: string | null; tentarDeNovo: () => void }) {
  return (
    <section className="cartao-tutor cartao-centro" role="alert">
      <span className="icone-redondo"><img src={iconeSemConexao} alt="" width={32} height={32} /></span>
      <h1 className="titulo-md">Sem conexão</h1>
      <p className="corpo-sm texto-secundario">Última atualização: {ultimaAtualizacao ?? '—'}</p>
      <button className="botao botao-contorno botao-grande botao-largo" onClick={tentarDeNovo}>
        Tentar de novo
      </button>
    </section>
  )
}

// Link "Privacidade": mostra a finalidade do uso da localização, vinda da API.
function Privacidade({ token }: { token: string }) {
  const [texto, setTexto] = useState<string | null>(null)
  const [aberto, setAberto] = useState(false)

  async function alternar() {
    setAberto(!aberto)
    if (!texto) {
      try {
        const politica = await buscarPoliticaLocalizacao(token)
        setTexto(politica.purpose)
      } catch {
        setTexto('Não foi possível carregar a política agora.')
      }
    }
  }

  return (
    <div className="rodape-tutor">
      <button className="botao-link" onClick={alternar} aria-expanded={aberto}>Privacidade</button>
      {aberto && <p className="corpo-sm texto-secundario">{texto ?? 'Carregando…'}</p>}
    </div>
  )
}

// ---------- Regras de texto ----------

function textoAntesDeVoce(posicao: number) {
  if (posicao <= 1) return 'você é o próximo'
  if (posicao === 2) return '1 antes de você'
  return `${posicao - 1} antes de você`
}

function textoForaDaFila(estado: string) {
  if (estado === 'IN_SERVICE') return 'em atendimento'
  if (estado === 'COMPLETED') return 'atendimento concluído'
  return 'fora da fila'
}

// "Dá tempo de voltar?" — mesma regra do backend (router.py, _calculate_return_decision):
// folga = espera p50 − deslocamento; negativa = não dá tempo; menor que a margem = em risco.
// O tutor não tem acesso à rota da recepção, então o cálculo é refeito aqui.
function calcularRetorno(status: StatusPublico, minutos: number | null) {
  const p50 = status.estimate.status === 'ok' ? (status.estimate.p50_minutes ?? null) : null
  if (minutos === null || p50 === null) {
    const resumo = minutos === null ? 'sem localização' : 'sem estimativa'
    return { viabilidade: 'UNKNOWN' as Viabilidade, resumo, folga: null, p50, minutos }
  }
  const folga = p50 - minutos
  let viabilidade: Viabilidade = 'FEASIBLE'
  if (folga < 0) viabilidade = 'INFEASIBLE'
  else if (folga < MARGEM_SEGURANCA_MIN) viabilidade = 'AT_RISK'
  const resumo = folga < 0 ? `atraso de ${decimal(-folga, 0)} min` : `folga de ${decimal(folga, 0)} min`
  return { viabilidade, resumo, folga, p50, minutos }
}
