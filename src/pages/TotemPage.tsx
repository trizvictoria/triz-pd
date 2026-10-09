import { useEffect, useRef } from 'react'
import canvasHtml from './totem-canvas.html?raw'

function useGateFrame() {
  useEffect(() => {
    document.documentElement.classList.add('is-totem-gate')
    return () => document.documentElement.classList.remove('is-totem-gate')
  }, [])
}

function fitTotem(stage: HTMLElement) {
  const wrap = stage.querySelector<HTMLElement>('.totem-canvas-wrap')
  const compact = stage.querySelector<HTMLElement>('.totem-compact')
  if (!wrap || !compact) return
  const scale = Math.min(stage.clientWidth / 1920, stage.clientHeight / 1080)
  const useCompact = scale < 0.58
  wrap.hidden = useCompact
  compact.hidden = !useCompact
  if (!useCompact) {
    wrap.style.transform = `translate(-50%, -50%) scale(${scale})`
    return
  }
  compact.style.transform = 'none'
  compact.style.width = `${stage.clientWidth}px`
  const fit = Math.min(1, stage.clientHeight / compact.scrollHeight, stage.clientWidth / compact.scrollWidth)
  compact.style.transform = `scale(${fit})`
}

export function TotemPage({ onStart }: { onStart: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null)
  useGateFrame()

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const fit = () => fitTotem(stage)
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return (
    <div className="gate">
      <div
        className="totem-stage"
        ref={stageRef}
        onClick={(event) => {
          const target = event.target as HTMLElement
          if (target.closest('[data-act="start-experience"]')) onStart()
        }}
      >
        <div className="totem-canvas-wrap" dangerouslySetInnerHTML={{ __html: canvasHtml }} />
        <CompactTotem />
      </div>
    </div>
  )
}

function CompactTotem() {
  return (
    <section className="totem-compact" hidden>
      <header className="tc-top">
        <div className="tc-brand">
          <img src={`${import.meta.env.BASE_URL}totvs-logo-navy.svg`} alt="TOTVS" />
          <strong>Pay</strong>
        </div>
        <span className="tc-live">
          <i />
          <span>Ao vivo no Stand TOTVS Pay</span>
        </span>
      </header>
      <span className="tc-badge">Desafio Cultural TOTVS Pay</span>
      <h1 className="tc-title">
        Sua visão
        <br />
        vale <span>prêmios!</span>
      </h1>
      <p className="tc-lead">
        TOTVS Pay pela perspectiva de quem mais importa: <em>o cliente.</em>
      </p>
      <div className="tc-main">
        <ol className="tc-steps">
          <li className="tc-step">
            <b>1</b>
            <div>
              <strong>Poste no LinkedIn</strong>
              <p>Foto ou vídeo e conte o que é o TOTVS Pay.</p>
            </div>
          </li>
          <li className="tc-step">
            <b>2</b>
            <div>
              <strong>Marque e engaje</strong>
              <p>@TOTVS #TOTVSPay #LançamentoTOTVSPay</p>
            </div>
          </li>
          <li className="tc-step">
            <b>3</b>
            <div>
              <strong>Ganhe</strong>
              <p>21 frases criativas levam brindes.</p>
            </div>
          </li>
        </ol>
        <aside className="tc-panel">
          <div>
            <div className="tc-21">
              21<small>frases premiadas</small>
            </div>
            <p>Resultado 14/10 · 16h, no Stand TOTVS Pay.</p>
          </div>
          <div className="tc-meta">
            <div>
              <span>Resultado</span>
              <strong>14/10 · 16h</strong>
            </div>
            <div>
              <span>Retirada</span>
              <strong>Sala de Apoio do Marketing</strong>
            </div>
          </div>
          <button type="button" className="tc-cta tp-cta" data-act="start-experience">
            Iniciar experiência
            <i aria-hidden>→</i>
          </button>
        </aside>
      </div>
    </section>
  )
}
