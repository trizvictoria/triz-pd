import { useEffect, useRef } from 'react'
import { TotvsPayLogo } from '../components/TotvsPayLogo'
import dashboardShot from '../assets/lp/dashboard.gif'
import iconSpark from '../assets/lp/icon-spark.svg'
import iconCard from '../assets/lp/icon-card.svg'
import iconPix from '../assets/lp/icon-pix.svg'
import iconBoleto from '../assets/lp/icon-boleto.svg'
import iconClock from '../assets/lp/icon-clock.svg'
import iconPay from '../assets/lp/icon-pay.svg'
import iconReconcile from '../assets/lp/icon-reconcile.svg'
import iconShield from '../assets/lp/icon-shield.svg'
import '../styles/landing.css'

const FORM_ID = '2026-totvspay-material-form-hr-totvs-pay-universo-09918525bb444b6e379e'
const FORM_SCRIPT = 'https://d335luupugsy2.cloudfront.net/js/rdstation-forms/stable/rdstation-forms.min.js'

type RdWindow = Window & {
  RDStationForms?: new (formId: string, analyticsId: string) => { createForm: () => void }
}

const features = [
  {
    icon: iconPay,
    title: 'Pagamento na jornada',
    text: 'Receba por cartão, Pix ou boleto direto no checkout ou por link de pagamento, integrado ao produto que você já usa — sem trocar de sistema.',
  },
  {
    icon: iconReconcile,
    title: 'Conciliação automatizada',
    text: 'Acompanhe o que foi pago, quando e por quem, sem planilha paralela nem processo manual.',
  },
  {
    icon: iconShield,
    title: 'Credenciamento facilitado',
    text: 'Libere sua conta de pagamentos com KYC simplificado, direto na plataforma TOTVS / RD Station que você já usa.',
  },
]

const steps = [
  {
    n: '1',
    title: 'Cadastre-se',
    text: 'Conte qual produto você usa e o segmento da sua empresa.',
  },
  {
    n: '2',
    title: 'Liberamos por segmento',
    text: 'A oferta chega de forma gradual aos produtos TOTVS / RD Station.',
  },
  {
    n: '3',
    title: 'Entramos em contato',
    text: 'Assim que estiver disponível, nosso time te chama para ativar.',
  },
]

let formStarted = false

function mountRdForm() {
  const host = document.getElementById(FORM_ID)
  const rd = (window as RdWindow).RDStationForms
  if (!host || !rd || formStarted) return
  formStarted = true
  new rd(FORM_ID, 'UA-17276574-1').createForm()
}

export function TotvsPayLanding() {
  const stageRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previous = document.title
    document.title = 'TOTVS Pay · Entre na lista'
    return () => {
      document.title = previous
    }
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    const copy = copyRef.current
    if (!stage || !copy) return
    const backdrop = stage.querySelector<HTMLElement>('.lp-hero-bg')
    const card = stage.querySelector<HTMLElement>('.lp-card')
    const features = featuresRef.current
    const list = features?.querySelector<HTMLElement>('ul')
    if (!backdrop || !card || !features || !list) return

    const sync = () => {
      const extra = window.innerWidth < 980 ? 24 : 64
      const bottom = copy.getBoundingClientRect().bottom
      const top = stage.getBoundingClientRect().top
      backdrop.style.height = `${Math.max(0, bottom - top + extra)}px`

      const heading = features.querySelector<HTMLElement>('h2')

      if (window.innerWidth < 980) {
        features.style.marginTop = ''
        list.style.marginTop = ''
        if (heading) heading.style.marginTop = ''
        return
      }

      features.style.marginTop = '0px'
      list.style.marginTop = '28px'
      if (heading) heading.style.marginTop = '0px'

      const copyBottom = copy.getBoundingClientRect().bottom
      const cardBottom = card.getBoundingClientRect().bottom
      const sectionTop = features.getBoundingClientRect().top
      const desiredTop = copyBottom + extra + 8
      const shift = Math.max(0, sectionTop - desiredTop)
      features.style.marginTop = shift ? `-${Math.round(shift)}px` : ''

      const cardsTop = cardBottom + 40
      const gap = 28
      const lift = 32
      if (heading) {
        const headingBox = heading.getBoundingClientRect()
        const desiredHeadingTop = cardsTop - gap - lift - headingBox.height
        const nudge = Math.max(0, desiredHeadingTop - headingBox.top)
        heading.style.marginTop = `${Math.round(nudge)}px`
      }
      list.style.marginTop = `${gap + lift}px`
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(copy)
    observer.observe(card)
    const form = document.getElementById(FORM_ID)
    if (form) observer.observe(form)
    window.addEventListener('resize', sync)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [])

  useEffect(() => {
    const host = document.getElementById(FORM_ID)
    if (!host || formStarted) return

    const existing = document.querySelector<HTMLScriptElement>('script[data-rdstation-forms]')
    if (existing) {
      if ((window as RdWindow).RDStationForms) mountRdForm()
      else existing.addEventListener('load', mountRdForm, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = FORM_SCRIPT
    script.async = true
    script.dataset.rdstationForms = 'true'
    script.addEventListener('load', mountRdForm, { once: true })
    document.body.appendChild(script)
  }, [])

  return (
    <div className="lp">
      <section className="lp-stage" ref={stageRef}>
        <div className="lp-hero-bg" aria-hidden />
        <header className="lp-header">
          <div className="lp-wrap">
            <TotvsPayLogo variant="navy" size="nav" />
          </div>
        </header>

        <div className="lp-wrap lp-hero-grid">
          <div className="lp-copy" ref={copyRef}>
            <p className="lp-pill">
              <img src={iconSpark} width={14} height={14} alt="" />
              Novidade
            </p>
            <h1>
              Chega de perder venda
              <br />
              na hora de <span>cobrar</span>
            </h1>
            <p className="lp-lead">
              O TOTVS Pay é a solução de pagamentos nativa do ecossistema TOTVS. Receba por{' '}
              <strong>cartão de crédito, Pix e boleto</strong> conectados ao produto que você já usa — sem sair do
              sistema para cobrar ou conciliar.
            </p>
            <ul className="lp-methods">
              <li>
                <img src={iconCard} width={20} height={20} alt="" />
                Cartão
              </li>
              <li>
                <img src={iconPix} width={20} height={20} alt="" />
                Pix
              </li>
              <li>
                <img src={iconBoleto} width={20} height={20} alt="" />
                Boleto
              </li>
            </ul>
            <div className="lp-note">
              <span className="lp-note-icon">
                <img src={iconClock} width={18} height={18} alt="" />
              </span>
              <p>
                <strong>Expansão gradual.</strong> A oferta está chegando aos poucos nos produtos TOTVS / RD Station.
                Cadastre-se e avisamos assim que estiver disponível para o seu segmento.
              </p>
            </div>
          </div>

          <aside className="lp-card" id="lista" aria-label="Cadastro na lista de interesse">
            <div className="lp-card-marks" aria-hidden>
              <span />
              <span />
            </div>
            <h2>Entre na lista</h2>
            <div role="main" id={FORM_ID} />
          </aside>
        </div>
      </section>

      <section className="lp-features" ref={featuresRef}>
        <div className="lp-wrap">
          <h2>O que você poderá fazer</h2>
          <ul>
            {features.map((feature) => (
              <li key={feature.title}>
                <span className="lp-feat-icon">
                  <img src={feature.icon} width={24} height={24} alt="" />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lp-steps">
        <div className="lp-wrap lp-steps-grid">
          <figure>
            <img
              className="lp-shot"
              src={dashboardShot}
              width={661}
              height={384}
              alt="Visão geral do TOTVS Pay com volume recebido, cobranças pendentes e pagamentos recentes"
            />
          </figure>
          <div>
            <h2>
              Da lista de interesse ao primeiro
              <br />
              pagamento
            </h2>
            <ol>
              {steps.map((step) => (
                <li key={step.n}>
                  <span>{step.n}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <a className="lp-cta" href="#lista">
              Quero entrar na lista
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
