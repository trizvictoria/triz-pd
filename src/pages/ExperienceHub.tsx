import { useEffect, useRef } from 'react'
import { goExperience, type ExperienceTarget } from '../lib/experience'
import canvasHtml from './hub-canvas.html?raw'

const COMPACT = [
  { id: 'totvs-credenciamento', kicker: 'TOTVS Pay', title: 'Credenciamento', text: 'Abra a conta de pagamentos em poucos passos.', cyan: true },
  { id: 'totvs-dashboard', kicker: 'TOTVS Pay', title: 'Dashboard', text: 'Acompanhe vendas e recebimentos num só lugar.', cyan: true },
  { id: 'checkout', kicker: 'TOTVS Pay', title: 'Checkout', text: 'Pague com Pix, cartão ou boleto.', cyan: false },
  { id: 'rd', kicker: 'RD Station', title: 'RD Vendas', text: 'Cobre direto da negociação no CRM.', cyan: false },
  { id: 'educacional', kicker: 'TOTVS', title: 'Educacional', text: 'Mensalidades por Pix, cartão e boleto.', cyan: false },
  { id: 'construcao', kicker: 'TOTVS', title: 'Construção', text: 'Pagamentos no dia a dia da obra.', cyan: false },
  { id: 'winthor', kicker: 'TOTVS', title: 'Winthor', text: 'Recebimentos integrados ao ERP.', cyan: false },
  { id: 'suri', kicker: 'Suri', title: 'Suri Shop', text: 'Compra e pagamento pela loja da Suri.', cyan: false },
] as const

function fitHub(stage: HTMLElement) {
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

export function ExperienceHub() {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.classList.add('is-totem-gate')
    return () => document.documentElement.classList.remove('is-totem-gate')
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const fit = () => fitHub(stage)
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
          const product = (event.target as HTMLElement).closest<HTMLElement>('[data-product]')
          const id = product?.dataset.product
          if (!id) return
          event.preventDefault()
          goExperience(id as ExperienceTarget)
        }}
      >
        <div className="totem-canvas-wrap" dangerouslySetInnerHTML={{ __html: canvasHtml }} />
        <section className="totem-compact hc" hidden>
          <header className="hc-top">
            <strong>TOTVS Pay</strong>
            <a href="#inicio" className="hc-back" onClick={(event) => { event.preventDefault(); window.location.hash = 'inicio' }}>
              Voltar
            </a>
          </header>
          <h1 className="hc-title">
            Escolha sua <span>experiência</span>
          </h1>
          <nav className="hc-grid" aria-label="Experiências">
            {COMPACT.map((item) => (
              <a key={item.id} href="#experiencia" data-product={item.id} className={item.cyan ? 'hc-card is-cyan' : 'hc-card'}>
                <span>{item.kicker}</span>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </a>
            ))}
          </nav>
          <a className="hc-interest" href="https://materiais.rdstation.com/2026-totvspay-material-lp-hr-totvs-pay-universo">
            Gostou? Entre na lista de interesse
          </a>
        </section>
      </div>
    </div>
  )
}
