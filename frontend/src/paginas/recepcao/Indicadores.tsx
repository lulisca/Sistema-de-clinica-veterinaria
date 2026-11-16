// R8 · Indicadores da estimativa (F1): erro médio, MAE, taxa dentro da faixa,
// prontidão por tipo e o histórico do dia (previsto × realizado).
// Roteiro da demo, passo 7: "Consultar o histórico do dia e o erro médio da estimativa".
import { useCallback, useEffect, useState } from 'react'
import { buscarMetricas, buscarMetricasPorTipo, buscarProntidao, listarFila, listarRevisoes } from '../../api'
import { comSinal, decimal, faixa, hora, paraData, porcentagem } from '../../formato'
import { mensagemDeErro, nomeDoPaciente, TIPOS_ATENDIMENTO, traduzir } from '../../textos'
import type { EntradaFila, Metricas, MetricasPorTipo, Prontidao, RevisaoEstimativa } from '../../tipos'

type LinhaDoDia = { entrada: EntradaFila; inicial: RevisaoEstimativa }

export default function Indicadores() {
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [porTipo, setPorTipo] = useState<MetricasPorTipo[]>([])
  const [prontidao, setProntidao] = useState<Prontidao | null>(null)
  const [historico, setHistorico] = useState<LinhaDoDia[]>([])
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    try {
      const [geral, tipos, pronto, fila] = await Promise.all([
        buscarMetricas(), buscarMetricasPorTipo(), buscarProntidao(), listarFila(),
      ])
      // Histórico do dia: quem já começou a ser atendido hoje, com a previsão inicial.
      const hoje = new Date().toDateString()
      const atendidosHoje = fila.filter((e) => e.started_at && paraData(e.started_at).toDateString() === hoje)
      const linhas = await Promise.all(
        atendidosHoje.map(async (entrada) => ({ entrada, inicial: (await listarRevisoes(entrada.id)).find((r) => r.is_initial) })),
      )
      setMetricas(geral)
      setPorTipo(tipos)
      setProntidao(pronto)
      setHistorico(
        linhas
          .filter((l): l is LinhaDoDia => Boolean(l.inicial))
          .sort((a, b) => a.entrada.checked_in_at.localeCompare(b.entrada.checked_in_at)),
      )
      setErro(null)
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return (
    <>
      <div className="cabecalho">
        <div>
          <h1 className="titulo-lg">Indicadores da estimativa (F1)</h1>
          <p className="corpo-sm texto-secundario">Erro calculado sobre a previsão inicial de cada paciente: espera real − p50.</p>
        </div>
      </div>

      {erro && (
        <div className="faixa-aviso faixa-aviso-erro" role="alert">
          <span>{erro}</span>
          <button className="botao botao-contorno" onClick={carregar}>Tentar de novo</button>
        </div>
      )}
      {!metricas && !erro && <p className="corpo-md texto-secundario" role="status">Carregando indicadores…</p>}

      {metricas && (
        <>
          <section className="indicadores" aria-label="Resumo">
            <Indicador titulo="Erro assinado médio" valor={minutosComSinal(metricas.mean_signed_error_minutes)}
              apoio="Positivo: a espera real foi maior que a prevista." />
            <Indicador titulo="Erro absoluto médio (MAE)" valor={minutos(metricas.mean_absolute_error_minutes)}
              apoio="Tamanho médio do erro, sem sinal." />
            <Indicador titulo="Dentro da faixa p50–p90" valor={porcentagem(metricas.inside_range_rate)} />
            <Indicador titulo="Previsões avaliadas" valor={String(metricas.evaluated_estimates)}
              apoio={metricas.evaluated_estimates === 0 ? 'Aparece depois do primeiro atendimento iniciado.' : undefined} />
          </section>

          <section className="cartao" aria-labelledby="titulo-por-tipo">
            <h2 id="titulo-por-tipo" className="titulo-md">Por tipo de atendimento</h2>
            {porTipo.length === 0 ? (
              <p className="corpo-md texto-secundario">Nenhuma previsão avaliada ainda.</p>
            ) : (
              <div className="tabela-rolagem">
                <table className="tabela">
                  <thead><tr><th>Tipo</th><th>Avaliadas</th><th>Erro assinado</th><th>MAE</th><th>Dentro da faixa</th></tr></thead>
                  <tbody>
                    {porTipo.map((linha) => (
                      <tr key={linha.appointment_type}>
                        <td>{traduzir(TIPOS_ATENDIMENTO, linha.appointment_type)}</td>
                        <td>{linha.evaluated_estimates}</td>
                        <td>{minutosComSinal(linha.mean_signed_error_minutes)}</td>
                        <td>{minutos(linha.mean_absolute_error_minutes)}</td>
                        <td>{porcentagem(linha.inside_range_rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="colunas colunas-iguais">
            <section className="cartao" aria-labelledby="titulo-prontidao">
              <h2 id="titulo-prontidao" className="titulo-md">Prontidão por tipo</h2>
              {prontidao && prontidao.types.length > 0 ? (
                <div className="tabela-rolagem">
                  <table className="tabela">
                    <thead><tr><th>Tipo</th><th>Amostras</th><th>Mínimo</th><th>Pronto</th></tr></thead>
                    <tbody>
                      {prontidao.types.map((linha) => (
                        <tr key={linha.appointment_type}>
                          <td>{traduzir(TIPOS_ATENDIMENTO, linha.appointment_type)}</td>
                          <td>{linha.sample_size}</td>
                          <td>{linha.minimum_configured}</td>
                          <td>{linha.ready_for_software_estimate ? 'Sim' : 'Não'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="corpo-md texto-secundario">Nenhuma amostra cadastrada.</p>
              )}
              {prontidao && <p className="corpo-sm texto-secundario">Mínimo configurado na API: {prontidao.minimum_configured} amostras por tipo.</p>}
            </section>

            <section className="cartao" aria-labelledby="titulo-dia">
              <h2 id="titulo-dia" className="titulo-md">Histórico do dia</h2>
              {historico.length === 0 ? (
                <p className="corpo-md texto-secundario">Nenhum atendimento com previsão foi iniciado hoje.</p>
              ) : (
                <div className="tabela-rolagem">
                  <table className="tabela">
                    <thead><tr><th>Check-in</th><th>Paciente</th><th>Previsto (p50–p90)</th><th>Realizado</th><th>Erro</th></tr></thead>
                    <tbody>
                      {historico.map(({ entrada, inicial }) => (
                        <tr key={entrada.id}>
                          <td>{hora(entrada.checked_in_at)}</td>
                          <td>{nomeDoPaciente(entrada)}</td>
                          <td>{faixa(inicial.p50_minutes, inicial.p90_minutes)}</td>
                          <td>{minutos(inicial.actual_wait_minutes)}</td>
                          <td>{minutosComSinal(inicial.signed_error_minutes)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </>
  )
}

function Indicador({ titulo, valor, apoio }: { titulo: string; valor: string; apoio?: string }) {
  return (
    <div className="indicador">
      <p className="etiqueta-sm texto-secundario">{titulo}</p>
      <p className="numero-md">{valor}</p>
      {apoio && <p className="corpo-sm texto-secundario">{apoio}</p>}
    </div>
  )
}

const minutos = (valor: number | null | undefined) => (valor == null ? '—' : `${decimal(valor)} min`)
const minutosComSinal = (valor: number | null | undefined) => (valor == null ? '—' : `${comSinal(valor)} min`)
