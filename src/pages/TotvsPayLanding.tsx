import { useEffect, useRef, useState } from 'react'
import { ProductMenu } from '../components/ProductMenu'
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
let notifyConversion: () => void = () => {}

type GuardXhr = XMLHttpRequest & { __lpUrl?: string }

function clearRedirect(form: HTMLFormElement) {
  form.removeAttribute('data-asset-action')
  const jq = (window as Window & { jQuery?: (el: Element) => { removeData: (key: string) => void } }).jQuery
  jq?.(form).removeData('assetAction')
  form.querySelectorAll('input[name="redirect_to"]').forEach((input) => input.remove())
}

function withoutRedirect(xhr: XMLHttpRequest) {
  document.querySelectorAll('input[name="redirect_to"]').forEach((input) => input.remove())
  document.querySelectorAll('.lp-card form').forEach((form) => {
    if (form instanceof HTMLFormElement) clearRedirect(form)
  })
  try {
    const data = JSON.parse(xhr.responseText) as { redirect_to?: string }
    if (!data || typeof data !== 'object' || !('redirect_to' in data)) return xhr
    delete data.redirect_to
    const text = JSON.stringify(data)
    return new Proxy(xhr, {
      get(target, prop, receiver) {
        if (prop === 'responseText' || prop === 'response') return text
        const value = Reflect.get(target, prop, receiver)
        return typeof value === 'function' ? value.bind(target) : value
      },
    })
  } catch {
    return xhr
  }
}

function isOffsite(url: string | URL) {
  try {
    return new URL(String(url), window.location.href).origin !== window.location.origin
  } catch {
    return false
  }
}

function ensureStayOnPage() {
  const flagged = window as Window & { __lpNavPatch?: boolean }
  if (flagged.__lpNavPatch) return
  flagged.__lpNavPatch = true

  const hold = (url: string | URL) => {
    if (!isOffsite(url)) return false
    notifyConversion()
    return true
  }

  const href = Object.getOwnPropertyDescriptor(Location.prototype, 'href')
  if (href?.set && href.get) {
    Object.defineProperty(Location.prototype, 'href', {
      configurable: true,
      enumerable: href.enumerable ?? true,
      get() {
        return href.get!.call(this)
      },
      set(value: string) {
        if (hold(value)) return
        href.set!.call(this, value)
      },
    })
  }

  const assign = Location.prototype.assign
  Location.prototype.assign = function (url: string | URL) {
    if (hold(url)) return
    return assign.call(this, url)
  }

  const replace = Location.prototype.replace
  Location.prototype.replace = function (url: string | URL) {
    if (hold(url)) return
    return replace.call(this, url)
  }
}

function ensureConversionPatch() {
  const flagged = window as Window & { __lpConversionPatch?: boolean }
  if (flagged.__lpConversionPatch) return
  flagged.__lpConversionPatch = true
  ensureStayOnPage()

  const proto = XMLHttpRequest.prototype
  const originalOpen = proto.open
  proto.open = function (this: GuardXhr, method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
    this.__lpUrl = String(url)
    return originalOpen.call(this, method, url, async ?? true, username, password)
  } as typeof proto.open

  const descriptor = Object.getOwnPropertyDescriptor(proto, 'onreadystatechange')
  if (!descriptor?.set || !descriptor.get) return

  Object.defineProperty(proto, 'onreadystatechange', {
    configurable: true,
    enumerable: descriptor.enumerable ?? true,
    get() {
      return descriptor.get!.call(this)
    },
    set(handler: ((this: XMLHttpRequest, ev: Event) => void) | null) {
      const xhr = this as GuardXhr
      if (!xhr.__lpUrl?.includes('conversion') || typeof handler !== 'function') {
        descriptor.set!.call(this, handler)
        return
      }
      descriptor.set!.call(this, function (this: GuardXhr, ev: Event) {
        const finished = this.readyState === XMLHttpRequest.DONE && this.status >= 200 && this.status < 300
        if (!finished) {
          handler.call(this, ev)
          return
        }
        const body = withoutRedirect(this)
        handler.call(this, { target: body } as Event)
        notifyConversion()
      })
    },
  })
}

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
  const [thanks, setThanks] = useState(false)
  const thanksRef = useRef(setThanks)
  thanksRef.current = setThanks

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
  }, [thanks])

  useEffect(() => {
    if (!thanks) return
    document.getElementById('lista')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [thanks])

  useEffect(() => {
    notifyConversion = () => thanksRef.current(true)
    ensureConversionPatch()
    const nativeAlert = window.alert.bind(window)
    window.alert = (message?: unknown) => {
      const text = String(message ?? '')
      if (/obrigad/i.test(text)) {
        thanksRef.current(true)
        return
      }
      nativeAlert(text)
    }

    const onSubmit = (event: Event) => {
      const form = event.target
      if (form instanceof HTMLFormElement && form.closest('.lp-card')) clearRedirect(form)
    }
    document.addEventListener('submit', onSubmit, true)

    const host = document.getElementById(FORM_ID)
    const scrub = () => {
      host?.querySelectorAll('form').forEach((form) => {
        if (form instanceof HTMLFormElement) clearRedirect(form)
      })
    }
    scrub()
    const observer = host ? new MutationObserver(scrub) : null
    if (host && observer) observer.observe(host, { childList: true, subtree: true })

    return () => {
      window.alert = nativeAlert
      document.removeEventListener('submit', onSubmit, true)
      observer?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (thanks) return
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
  }, [thanks])

  return (
    <div className="lp">
      <section className="lp-stage" ref={stageRef}>
        <div className="lp-hero-bg" aria-hidden />
        <header className="lp-header">
          <div className="lp-wrap">
            <div className="lp-brand">
              <TotvsPayLogo variant="navy" size="nav" />
              <ProductMenu />
            </div>
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

          <aside className={thanks ? 'lp-card is-thanks' : 'lp-card'} id="lista" aria-label="Cadastro na lista de interesse">
            {thanks ? (
              <div className="lp-thanks" role="status">
                <span className="lp-thanks-mark" aria-hidden>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M6 14.5 11.2 20 22 8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="lp-thanks-kicker">Lista de interesse</p>
                <h2>Obrigado</h2>
                <p className="lp-thanks-lead">
                  Recebemos seu cadastro. Avisamos assim que o TOTVS Pay estiver disponível para o seu segmento.
                </p>
                <ol className="lp-thanks-next">
                  <li>
                    <span>1</span>
                    <div>
                      <strong>Cadastro recebido</strong>
                      <p>Seus dados já estão na lista.</p>
                    </div>
                  </li>
                  <li>
                    <span>2</span>
                    <div>
                      <strong>Liberamos por segmento</strong>
                      <p>A oferta chega aos poucos nos produtos TOTVS / RD Station.</p>
                    </div>
                  </li>
                  <li>
                    <span>3</span>
                    <div>
                      <strong>Entramos em contato</strong>
                      <p>Nosso time te chama para ativar quando estiver disponível.</p>
                    </div>
                  </li>
                </ol>
              </div>
            ) : (
              <>
                <div className="lp-card-marks" aria-hidden>
                  <span />
                  <span />
                </div>
                <h2>Entre na lista</h2>
                <div role="main" id={FORM_ID} />
              </>
            )}
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
