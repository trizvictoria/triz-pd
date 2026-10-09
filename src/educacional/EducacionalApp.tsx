import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { PortalShell, type EduJourney } from './Shell'
import {
  EMPTY_DRAFT,
  INITIAL_CARDS,
  INSTALLMENT_PLANS,
  MAX_CARDS,
  PROFILE,
  STATES,
  TUITIONS,
  brandFromNumber,
  cardLabel,
  digitsOnly,
  eduAsset,
  emptyPayment,
  formatBRL,
  installmentLabel,
  installmentTotal,
  maskCard,
  maskCep,
  maskCpf,
  maskExpiry,
  maskMoney,
  maskPhone,
  moneyToCents,
  tuitionStatusLabel,
  type CardDraft,
  type CardPayment,
  type Installment,
  type SavedCard,
  type Tuition,
} from './model'
import { PortalPaymentModals, type PortalFlow } from './PortalPaymentModals'
import './educacional.css'

type Step = 'statement' | 'methods' | 'card' | 'amount' | 'review' | 'cardReview' | 'pixPay' | 'done'

function BrandIcon({ brand, large = false }: { brand: SavedCard['brand'] | 'add'; large?: boolean }) {
  const file = brand === 'visa' ? 'icon-visa.svg' : brand === 'mastercard' ? 'icon-mastercard.svg' : 'icon-add-card.svg'
  return (
    <span className={large ? 'edu-brand edu-brand--lg' : 'edu-brand'}>
      <img src={eduAsset(file)} alt="" />
    </span>
  )
}

function BackLink({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button type="button" className="edu-back" onClick={onClick}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M14.5 6.5 9 12l5.5 5.5-1.2 1.2L6.6 12l6.7-6.7 1.2 1.2Z" fill="currentColor" />
      </svg>
      {children}
    </button>
  )
}

function Primary({ children, onClick, disabled, ghost, auto }: { children: string; onClick: () => void; disabled?: boolean; ghost?: boolean; auto?: boolean }) {
  return (
    <button type="button" className={`edu-btn${ghost ? ' edu-btn--ghost' : ''}${auto ? ' edu-btn--auto' : ''}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function Check({ on }: { on: boolean }) {
  return (
    <span className={`edu-check${on ? ' is-on' : ''}`} aria-hidden>
      {on ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7.2 5.4 10l6.1-6.2" stroke="#fff" strokeWidth="2" />
        </svg>
      ) : null}
    </span>
  )
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  help,
  info,
  readOnly,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  help?: string
  info?: string
  readOnly?: boolean
}) {
  return (
    <label className="edu-field">
      <span>{label}</span>
      <span className="edu-input-wrap">
        <input className="edu-input" value={value} placeholder={placeholder} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} />
        {info ? (
          <button type="button" title={info} aria-label={info}>
            ?
          </button>
        ) : null}
      </span>
      {help ? <span className="edu-help">{help}</span> : null}
    </label>
  )
}

function LaunchSummary({
  totalCents,
  tuitions,
  split,
}: {
  totalCents: number
  tuitions: Tuition[]
  split?: Array<{ kind?: string; label: string; value: string }>
}) {
  return (
    <aside className="edu-card edu-summary">
      <div className="edu-summary__top">
        <h2>Resumo do lançamento</h2>
      </div>
      <hr className="edu-divider" />
      {tuitions.map((item) => (
        <div className="edu-summary__item" key={item.id}>
          <p className="edu-month">{item.month}</p>
          <p className="edu-line">
            <span>MENSALIDADE · {tuitionStatusLabel(item.status)}</span>
            <span>{formatBRL(item.cents)}</span>
          </p>
          <p className="edu-due">
            <span>
              Vencimento: <strong>{item.due}</strong>
            </span>
          </p>
        </div>
      ))}
      {split ? (
        <>
          <hr className="edu-divider" />
          <h2>Divisão do pagamento</h2>
          {split.map((item) => (
            <p className="edu-split" key={item.label + item.value}>
              <span>
                <strong>{item.kind || 'Cartão'}</strong>
                {item.label}
              </span>
              <span>{item.value}</span>
            </p>
          ))}
        </>
      ) : null}
      <hr className="edu-divider" />
      <p className="edu-total">
        <span>Total a pagar</span>
        <b>{formatBRL(totalCents)}</b>
      </p>
    </aside>
  )
}

function Stepper({ current }: { current: 0 | 1 | 2 }) {
  const items = ['Informações do cartão', 'Dados do titular', 'Endereço de cobrança']
  return (
    <div className="edu-stepper" aria-label="Etapas">
      {items.map((label, index) => {
        const state = index < current ? 'is-done' : index === current ? 'is-current' : ''
        return (
          <div className={`edu-step ${state}`} key={label}>
            <span className="edu-step__dot">{index < current ? '✓' : index === current ? '✎' : index}</span>
            {label}
          </div>
        )
      })}
    </div>
  )
}

function SuccessArt() {
  return (
    <div className="edu-art-scale">
    <div className="edu-art" aria-hidden>
      <img src={eduAsset('success-bg.svg')} alt="" style={{ left: 0, top: 0 }} />
      <img src={eduAsset('success-shadow.svg')} alt="" style={{ left: 40, top: 251 }} />
      <img src={eduAsset('success-bubble.svg')} alt="" style={{ left: 152, top: 31 }} />
      <img src={eduAsset('success-c1.svg')} alt="" style={{ left: 61, top: 79 }} />
      <img src={eduAsset('success-c2.svg')} alt="" style={{ left: 144, top: 62 }} />
      <img src={eduAsset('success-c3.svg')} alt="" style={{ left: 228, top: 74 }} />
    </div>
    </div>
  )
}

export function EducacionalApp() {
  useEffect(() => {
    document.title = 'Extrato financeiro · Pensando Juntos'
  }, [])

  const [journey, setJourney] = useState<EduJourney>('card')
  const [step, setStep] = useState<Step>('statement')
  const [tuitionIds, setTuitionIds] = useState<string[]>([])
  const [payMode, setPayMode] = useState<'combine' | 'card'>('combine')
  const [cards, setCards] = useState<SavedCard[]>(INITIAL_CARDS)
  const [selected, setSelected] = useState<string[]>([])
  const [pixOn, setPixOn] = useState(false)
  const [pixCents, setPixCents] = useState(0)
  const [payments, setPayments] = useState<Record<string, CardPayment>>({})
  const [amountIndex, setAmountIndex] = useState(0)
  const [cardStep, setCardStep] = useState<0 | 1 | 2>(0)
  const [draft, setDraft] = useState<CardDraft>(EMPTY_DRAFT)
  const [error, setError] = useState('')
  const [offer, setOffer] = useState<'mix' | null>(null)
  const [portalFlow, setPortalFlow] = useState<PortalFlow | null>(null)
  const [portalToast, setPortalToast] = useState<string | null>(null)
  const [boletoMenuOpen, setBoletoMenuOpen] = useState(false)

  useEffect(() => {
    if (!offer && !portalFlow) return
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOffer(null)
      setPortalFlow(null)
      setPortalToast(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [offer, portalFlow])

  useEffect(() => {
    if (!boletoMenuOpen) return
    function onPointer(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      if (!target.closest('.edu-boleto-split')) setBoletoMenuOpen(false)
    }
    document.addEventListener('click', onPointer)
    return () => document.removeEventListener('click', onPointer)
  }, [boletoMenuOpen])

  const selectedTuitions = TUITIONS.filter((item) => tuitionIds.includes(item.id))
  const payCents = selectedTuitions.reduce((sum, item) => sum + item.cents, 0)
  const canPay = payCents > 0
  const selectedCards = cards.filter((card) => selected.includes(card.id))
  const cardLimitReached = selected.length >= MAX_CARDS
  const slots = useMemo(() => {
    const list: Array<{ key: string; kind: 'pix' } | { key: string; kind: 'card'; card: SavedCard }> = []
    if (payMode === 'card' && pixOn) list.push({ key: 'pix', kind: 'pix' })
    selectedCards.forEach((card) => list.push({ key: card.id, kind: 'card', card }))
    return list
  }, [payMode, pixOn, selectedCards])
  const currentSlot = slots[amountIndex]
  const isLastAmount = slots.length > 0 && amountIndex === slots.length - 1
  const comboPix = payMode === 'card' && pixOn && selectedCards.length > 0
  const enteredBefore = slots.slice(0, amountIndex).reduce((sum, slot) => {
    if (slot.kind === 'pix') return sum + pixCents
    return sum + (payments[slot.card.id]?.amountCents || 0)
  }, 0)
  const remainder = Math.max(payCents - enteredBefore, 0)

  const reviewTotal = useMemo(() => {
    return selectedCards.reduce((sum, card) => {
      const payment = payments[card.id]
      if (!payment || !payment.installment) return sum
      return sum + installmentTotal(payment.amountCents, payment.installment)
    }, 0)
  }, [payments, selectedCards])

  function toggleTuition(id: string) {
    setTuitionIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function toggle(id: string) {
    setError('')
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= MAX_CARDS) return current
      return [...current, id]
    })
  }

  function openAddCard() {
    if (selected.length >= MAX_CARDS) return
    setDraft(EMPTY_DRAFT)
    setCardStep(0)
    setError('')
    setStep('card')
  }

  function chooseJourney(next: EduJourney) {
    setJourney(next)
    setStep('statement')
    setTuitionIds([])
    setSelected([])
    setPixOn(false)
    setPixCents(0)
    setPayMode('combine')
    setError('')
    setOffer(null)
    setPortalFlow(null)
    setPortalToast(null)
    setBoletoMenuOpen(false)
  }

  function closePortalFlow() {
    setPortalFlow(null)
    setPortalToast(null)
  }

  function finishPortalFlow() {
    closePortalFlow()
    setStep('statement')
  }

  function startBoleto(kind: 'boleto' | 'barcode') {
    if (!canPay) return
    setBoletoMenuOpen(false)
    setPortalFlow({ kind, stage: 'summary' })
  }

  function openCards() {
    if (!canPay) return
    setPayMode('combine')
    setSelected([])
    setPixOn(false)
    setStep('methods')
  }

  function openMix() {
    if (!canPay) return
    setPayMode('card')
    setSelected([])
    setPixOn(false)
    setStep('methods')
  }

  function openPix() {
    if (!canPay) return
    setPayMode('card')
    setSelected([])
    setPixOn(true)
    setPortalFlow({ kind: 'pix', stage: 'summary' })
  }

  function continueMethods() {
    setError('')
    if (payMode === 'card' && pixOn && selectedCards.length === 0) {
      setPortalFlow({ kind: 'pix', stage: 'summary' })
      return
    }
    const single = payMode === 'card' && selectedCards.length + (pixOn ? 1 : 0) <= 1
    if (single) {
      setStep('cardReview')
      return
    }
    setPixCents(0)
    setAmountIndex(0)
    setPayments((current) => {
      const next = { ...current }
      selectedCards.forEach((card) => {
        const previous = next[card.id] || emptyPayment()
        next[card.id] = { ...previous, amountCents: 0 }
      })
      return next
    })
    setStep(selectedCards.length + (payMode === 'card' && pixOn ? 1 : 0) === 0 ? 'review' : 'amount')
  }

  function slotTitle(index: number) {
    const slot = slots[index]
    if (!slot) return ''
    if (slot.kind === 'pix') return 'Pix'
    const number = slots.slice(0, index + 1).filter((item) => item.kind === 'card').length
    return `Cartão ${number}`
  }

  function saveAmount(nextIndex: number) {
    const slot = slots[amountIndex]
    if (!slot) return
    const amount = isLastAmount ? remainder : slot.kind === 'pix' ? pixCents : payments[slot.card.id]?.amountCents || 0
    setError('')
    if (slot.kind === 'pix') setPixCents(amount)
    else {
      const payment = payments[slot.card.id] || emptyPayment()
      setPayments((current) => ({
        ...current,
        [slot.card.id]: { ...payment, amountCents: amount },
      }))
    }
    if (nextIndex >= slots.length) {
      if (comboPix) {
        setPortalFlow({ kind: 'pix', stage: 'pay' })
        setStep('pixPay')
        return
      }
      setStep('review')
      return
    }
    setAmountIndex(nextIndex)
  }

  function patchDraft(partial: Partial<CardDraft>) {
    setDraft((current) => ({ ...current, ...partial }))
  }

  function nextCardStep() {
    setError('')
    setCardStep((current) => (current === 0 ? 1 : 2))
  }

  function addCard() {
    const last4 = (digitsOnly(draft.number).slice(-4) || '0000').padStart(4, '0')
    const card: SavedCard = {
      id: `new-${last4}-${cards.length}`,
      brand: brandFromNumber(draft.number),
      last4,
    }
    setCards((current) => [...current, card])
    setError('')
    setStep('methods')
  }

  function fillProfile(checked: boolean) {
    patchDraft(
      checked
        ? { useProfile: true, cpf: PROFILE.cpf, email: PROFILE.email, phone: PROFILE.phone }
        : { useProfile: false, cpf: '', email: '', phone: '' },
    )
  }

  function fillAddress(checked: boolean) {
    patchDraft(
      checked
        ? {
            useAddress: true,
            cep: PROFILE.cep,
            country: PROFILE.country,
            state: PROFILE.state,
            city: PROFILE.city,
            district: PROFILE.district,
            street: PROFILE.street,
            addressNumber: PROFILE.addressNumber,
          }
        : { useAddress: false, cep: '', country: '', state: '', city: '', district: '', street: '', addressNumber: '', complement: '' },
    )
  }

  function onCep(value: string) {
    const masked = maskCep(value)
    const found = digitsOnly(masked).length === 8
    patchDraft(
      found
        ? { cep: masked, country: 'Brasil', state: 'SP', city: 'São Paulo', district: 'Bela Vista', street: 'Avenida Paulista' }
        : { cep: masked },
    )
  }

  let content: ReactNode = null

  if (step === 'statement') {
    content = (
      <section className="edu-statement">
        <div className="edu-legend">
          <h2>Legenda</h2>
          <p>
            <i className="edu-swatch" style={{ background: '#f5b400' }} />
            Boleto enviado para cobrança terceirizada.
          </p>
          <p>
            <i className="edu-swatch" style={{ background: '#e10600' }} />
            Opções de pagamento indisponíveis, pois o documento foi cancelado pelo banco.
          </p>
          <p>
            <i className="edu-swatch" style={{ background: '#1a4fbf' }} />
            Opções de pagamento indisponíveis, pois o boleto encontra-se inativo.
          </p>
        </div>
        <div className="edu-paybar">
          <div className="edu-tabs" role="tablist">
            <span className="edu-tab is-on" role="tab" aria-selected="true">
              A vencer
            </span>
            <span className="edu-tab" role="tab">
              Pagos
            </span>
            <span className="edu-tab" role="tab">
              Benefícios
            </span>
            <span className="edu-tab" role="tab">
              Nota Fiscal
            </span>
          </div>
          <div className="edu-paybar__actions">
            <p className="edu-selected-total">
              <span>Total selecionado</span>
              <b>{formatBRL(payCents)}</b>
            </p>
            {journey === 'all' ? (
              <button type="button" className="edu-btn" onClick={openPix} disabled={!canPay}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 7h3.2v3.2H7V7Zm6.8 0H17v3.2h-3.2V7ZM7 13.8h3.2V17H7v-3.2Zm6.8 0H17V17h-3.2v-3.2Z" fill="#fff" />
                </svg>
                Pix
              </button>
            ) : null}
            {journey === 'all' ? (
              <button type="button" className="edu-btn" onClick={() => setOffer('mix')} disabled={!canPay}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 8h5V6H6v2Zm7 0h5V6h-5v2ZM6 18h5v-2H6v2Zm7-6H6v2h7v-2Zm2 1.2 3.2 3.2-1.2 1.2-3.2-3.2 1.2-1.2Z" fill="#fff" />
                </svg>
                Combinar pagamentos
              </button>
            ) : null}
            <button type="button" className="edu-btn" onClick={openCards} disabled={!canPay}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7.5h16v9H4v-9Zm0-1.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm1.5 6.2h4v1.4h-4v-1.4Z" fill="#fff" />
              </svg>
              Cartão
            </button>
            {journey === 'all' ? (
              <div className="edu-boleto-split">
                <button
                  type="button"
                  className="edu-btn edu-btn--ghost"
                  disabled={!canPay}
                  aria-expanded={boletoMenuOpen}
                  onClick={() => setBoletoMenuOpen((open) => !open)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 6h1.4v12H6V6Zm2.4 0H10v12H8.4V6Zm2.6 0h2.2v12h-2.2V6Zm3.2 0H16v12h-1.8V6Zm2.6 0H20v12h-1.8V6Z" fill="currentColor" />
                  </svg>
                  Boleto
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 10h10l-5 6-5-6Z" fill="currentColor" />
                  </svg>
                </button>
                {boletoMenuOpen ? (
                  <div className="edu-boleto-menu" role="menu">
                    <button type="button" role="menuitem" onClick={() => startBoleto('boleto')}>
                      Gerar boleto
                    </button>
                    <button type="button" role="menuitem" onClick={() => startBoleto('barcode')}>
                      Gerar código de barras
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <div className="edu-charges">
          {TUITIONS.map((item) => {
            const on = tuitionIds.includes(item.id)
            const overdue = item.status === 'overdue'
            return (
              <article className="edu-charge" key={item.id}>
                <div className="edu-charge__who">
                  <button
                    type="button"
                    className={`edu-charge__check${on ? ' is-on' : ''}`}
                    aria-pressed={on}
                    aria-label={`${on ? 'Remover' : 'Selecionar'} mensalidade de ${item.month}`}
                    onClick={() => toggleTuition(item.id)}
                  >
                    {on ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12.5 9.2 17 19 7" stroke="#fff" strokeWidth="2.4" />
                      </svg>
                    ) : null}
                  </button>
                  <span className="edu-charge__avatar" aria-hidden>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM6.4 18.4c.5-2.3 2.5-3.6 5.6-3.6s5.1 1.3 5.6 3.6v.6H6.4v-.6Z" fill="#fff" />
                    </svg>
                  </span>
                  <p>
                    <span>{item.month}</span>
                    <strong>{formatBRL(item.cents)}</strong>
                  </p>
                </div>
                <div className="edu-charge__info">
                  <p>
                    <b>Aluno:</b> ANA PAULA DA SILVA ENSINO SUPERIOR
                  </p>
                  <p>
                    <b>Responsável:</b> ANA PAULA DA SILVA RESPONSAVEL FINANCEIRO ALUNO
                  </p>
                  <p>Período letivo: 2025/1</p>
                  <button type="button" className="edu-detail">
                    Exibir detalhamento
                  </button>
                </div>
                <p className="edu-charge__due">
                  <span className="edu-charge__due-label">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M7 3.5h1.4V5h7.2V3.5H17V5h1.1A1.9 1.9 0 0 1 20 6.9v11.2A1.9 1.9 0 0 1 18.1 20H5.9A1.9 1.9 0 0 1 4 18.1V6.9A1.9 1.9 0 0 1 5.9 5H7V3.5ZM5.6 9v9h12.8V9H5.6Z" fill={overdue ? '#e10600' : '#2e9b4f'} />
                    </svg>
                    <span>
                      Vencimento
                      <strong>{item.due}</strong>
                    </span>
                  </span>
                  <em className={`edu-charge__status${overdue ? ' is-overdue' : ' is-open'}`}>{tuitionStatusLabel(item.status)}</em>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 8a5 5 0 0 1 8.2-1.6L17 8h-3.2V6.4H17V10h-3.6l1.4-1.2A6.6 6.6 0 0 0 7 8Zm10 8a5 5 0 0 1-8.2 1.6L7 16h3.2v1.6H7V14h3.6l-1.4 1.2A6.6 6.6 0 0 0 17 16Z" fill="#7b3fe4" />
                  </svg>
                </p>
              </article>
            )
          })}
        </div>
      </section>
    )
  }

  if (step === 'methods') {
    content = (
      <>
        <h1 className="edu-title">{payMode === 'combine' ? 'Combinar múltiplos cartões' : 'Combinar múltiplas formas de pagamento'}</h1>
        <p className="edu-lead">
          {payMode === 'combine'
            ? 'Selecione um ou mais cartões para dividir o valor. Na próxima etapa, você definirá o valor que pagará em cada um.'
            : 'Selecione duas ou mais opções para dividir o valor. Você pode combinar Pix e diferentes cartões de crédito. Na próxima etapa, você definirá o valor que pagará em cada uma.'}
        </p>
        <BackLink onClick={() => setStep('statement')}>Voltar para extrato</BackLink>
        <div className="edu-layout">
          <div className="edu-col">
            <section className="edu-card">
              <h2>Selecione os métodos escolhidos</h2>
              <hr className="edu-divider" />
              {payMode === 'card' ? (
                <button type="button" className="edu-method" onClick={() => setPixOn((on) => !on)} aria-pressed={pixOn}>
                  <Check on={pixOn} />
                  <span className="edu-pix" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M7 7h3.2v3.2H7V7Zm6.8 0H17v3.2h-3.2V7ZM7 13.8h3.2V17H7v-3.2Zm6.8 0H17V17h-3.2v-3.2Z" fill="#045b8f" />
                    </svg>
                  </span>
                  PIX
                </button>
              ) : null}
              {cards.map((card) => {
                const on = selected.includes(card.id)
                return (
                  <button type="button" className="edu-method" key={card.id} onClick={() => toggle(card.id)} aria-pressed={on} disabled={!on && cardLimitReached}>
                    <Check on={on} />
                    <BrandIcon brand={card.brand} />
                    {cardLabel(card)}
                  </button>
                )
              })}
              <button type="button" className="edu-method" onClick={openAddCard} disabled={cardLimitReached}>
                <BrandIcon brand="add" />
                Adicionar novo cartão de crédito
              </button>
              {cardLimitReached ? <p className="edu-limit">Você pode usar até 3 cartões</p> : null}
            </section>
            {error ? <p className="edu-hint">{error}</p> : null}
            <Primary onClick={continueMethods}>Continuar</Primary>
          </div>
          <LaunchSummary totalCents={payCents} tuitions={selectedTuitions} />
        </div>
      </>
    )
  }

  if (step === 'card') {
    const preview = digitsOnly(draft.number).length >= 4 ? cardLabel({ id: 'preview', brand: brandFromNumber(draft.number), last4: digitsOnly(draft.number).slice(-4) }) : 'Cartão de crédito'
    content = (
      <>
        <h1 className="edu-title">Adição de novo cartão de crédito</h1>
        <BackLink onClick={() => setStep('methods')}>Voltar para formas de pagamento</BackLink>
        <section className="edu-card">
          <div className="edu-card__head">
            <h2>Cartão de crédito</h2>
            <span className="edu-method" style={{ width: 'auto' }}>
              <BrandIcon brand={digitsOnly(draft.number) ? brandFromNumber(draft.number) : 'add'} large />
              {preview}
            </span>
          </div>
          <Stepper current={cardStep} />
          {cardStep === 0 ? (
            <>
              <h2>Informações do cartão</h2>
              <div className="edu-fields">
                <div className="edu-row">
                  <Field label="Número do cartão" value={draft.number} placeholder="Numero" onChange={(value) => patchDraft({ number: maskCard(value) })} />
                  <Field label="Nome do titular (igual aparece no cartão)" value={draft.holder} placeholder="Titular do cartão" onChange={(value) => patchDraft({ holder: value })} />
                </div>
                <div className="edu-row">
                  <Field label="Data de expiração" value={draft.expiry} placeholder="MM/YY" onChange={(value) => patchDraft({ expiry: maskExpiry(value) })} />
                  <Field label="Código de segurança (CVV)" value={draft.cvv} placeholder="***" info="Três dígitos no verso do cartão" onChange={(value) => patchDraft({ cvv: digitsOnly(value).slice(0, 4) })} />
                </div>
              </div>
            </>
          ) : null}
          {cardStep === 1 ? (
            <>
              <h2>Informações do cartão</h2>
              <button type="button" className="edu-checkline" onClick={() => fillProfile(!draft.useProfile)}>
                <Check on={draft.useProfile} />
                Preencher com meus dados cadastrais (Sou titular do cartão)
              </button>
              <Field label="CPF" value={draft.cpf} placeholder="123.456.789-10" onChange={(value) => patchDraft({ cpf: maskCpf(value), useProfile: false })} />
              <div className="edu-row">
                <Field label="E-mail" value={draft.email} placeholder="jose.silva@gmail.com.br" onChange={(value) => patchDraft({ email: value, useProfile: false })} />
                <Field label="Telefone" value={draft.phone} placeholder="(XX) 1234-5678" info="DDD + número" onChange={(value) => patchDraft({ phone: maskPhone(value), useProfile: false })} />
              </div>
            </>
          ) : null}
          {cardStep === 2 ? (
            <>
              <h2>Endereço de cobrança</h2>
              <button type="button" className="edu-checkline" onClick={() => fillAddress(!draft.useAddress)}>
                <Check on={draft.useAddress} />
                Preencher com meus dados cadastrais
              </button>
              <Field label="CEP" value={draft.cep} placeholder="Digite seu CEP" info="O endereço é preenchido ao informar o CEP" onChange={onCep} />
              <div className="edu-row">
                <Field label="País" value={draft.country} placeholder="País (autocomplete com cep)" onChange={(value) => patchDraft({ country: value })} />
                <label className="edu-field">
                  <span>Estado</span>
                  <select className="edu-input edu-select" value={draft.state} onChange={(event) => patchDraft({ state: event.target.value })}>
                    <option value="">Estado (autocomplete com cep)</option>
                    {STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="edu-row">
                <Field label="Cidade" value={draft.city} placeholder="Cidade (autocomplete com cep)" onChange={(value) => patchDraft({ city: value })} />
                <Field label="Bairro" value={draft.district} placeholder="Bairro" onChange={(value) => patchDraft({ district: value })} />
              </div>
              <Field label="Rua / Avenida" value={draft.street} placeholder="Rua (autocomplete com cep)" onChange={(value) => patchDraft({ street: value })} />
              <div className="edu-row">
                <Field label="Número" value={draft.addressNumber} placeholder="Numero (pode não ter)" onChange={(value) => patchDraft({ addressNumber: value })} />
                <Field label="Complemento (opcional)" value={draft.complement} placeholder="Complemento (pode não ter e opcional)" onChange={(value) => patchDraft({ complement: value })} />
              </div>
            </>
          ) : null}
          {error ? <p className="edu-hint">{error}</p> : null}
          <div className="edu-actions">
            {cardStep === 2 ? <Primary onClick={addCard}>Adicionar cartão</Primary> : <Primary onClick={nextCardStep}>Próximo</Primary>}
          </div>
        </section>
      </>
    )
  }

  if (step === 'amount' && currentSlot) {
    const payingCard = currentSlot.kind === 'card' ? currentSlot.card : null
    const payment = payingCard ? payments[payingCard.id] || emptyPayment() : emptyPayment()
    const typedCents = isLastAmount ? remainder : payingCard ? payment.amountCents : pixCents
    const forwardRemainder = Math.max(payCents - enteredBefore - typedCents, 0)
    const following = slots.slice(amountIndex + 1)
    const followerName = (slot: (typeof slots)[number]) => (slot.kind === 'pix' ? 'Pix' : cardLabel(slot.card))
    const previousSplit = slots.slice(0, amountIndex).map((slot) => {
      if (slot.kind === 'pix') return { kind: 'Pix', label: '***.***.***-46', value: formatBRL(pixCents) }
      const previous = payments[slot.card.id]
      return {
        kind: 'Cartão',
        label: cardLabel(slot.card),
        value: previous?.installment ? installmentLabel(previous.amountCents, previous.installment as Installment) : formatBRL(previous?.amountCents || 0),
      }
    })
    const liveSplit = [
      ...previousSplit,
      payingCard
        ? {
            kind: 'Cartão',
            label: cardLabel(payingCard),
            value: payment.installment ? installmentLabel(typedCents, payment.installment as Installment) : formatBRL(typedCents),
          }
        : { kind: 'Pix', label: '***.***.***-46', value: formatBRL(typedCents) },
      ...(isLastAmount
        ? []
        : following.length === 1
          ? [
              following[0].kind === 'pix'
                ? { kind: 'Pix', label: '***.***.***-46', value: formatBRL(forwardRemainder) }
                : { kind: 'Cartão', label: cardLabel(following[0].card), value: formatBRL(forwardRemainder) },
            ]
          : [{ kind: 'Restante', label: 'próximos pagamentos', value: formatBRL(forwardRemainder) }]),
    ]
    content = (
      <>
        <h1 className="edu-title">Escolha de valor para cada forma</h1>
        <p className="edu-lead">Informe o valor que deseja pagar nos primeiros métodos. O saldo restante será calculado automaticamente no último pagamento.</p>
        <BackLink onClick={() => setStep('methods')}>Voltar para formas de pagamento</BackLink>
        <div className="edu-layout">
          <div className="edu-col">
            <section className="edu-card">
              <p className="edu-crumb">
                <button type="button" onClick={() => setStep('methods')}>
                  Combinar meios de pagamentos
                </button>
                {slots.slice(0, amountIndex).map((slot, index) => (
                  <span key={slot.key}>
                    <span> › </span>
                    <button type="button" onClick={() => setAmountIndex(index)}>
                      {slotTitle(index)}
                    </button>
                  </span>
                ))}
                <span> › </span>
                <span>{slotTitle(amountIndex)}</span>
              </p>
              <div className="edu-card__head">
                <h2>{slotTitle(amountIndex)}</h2>
                {payingCard ? (
                  <span className="edu-method" style={{ width: 'auto' }}>
                    <BrandIcon brand={payingCard.brand} large />
                    {cardLabel(payingCard)}
                  </span>
                ) : (
                  <span className="edu-method" style={{ width: 'auto' }}>
                    <span className="edu-pix" aria-hidden>
                      PIX
                    </span>
                    Pix
                  </span>
                )}
              </div>
              <Field
                label={payingCard ? 'Valor do pagamento no cartão' : 'Valor do pagamento no Pix'}
                value={isLastAmount ? maskMoney(remainder) : maskMoney(payingCard ? payment.amountCents : pixCents)}
                placeholder={isLastAmount ? 'Preenchido automaticamente com o valor restante' : 'Insira o preço a ser pago'}
                help={
                  isLastAmount
                    ? 'Preenchido automaticamente com o valor restante'
                    : following.length
                      ? `Restante de ${formatBRL(forwardRemainder)} ${following.length === 1 ? `em ${followerName(following[0])}` : 'para os próximos pagamentos'}`
                      : 'Valor mínimo de R$ 5,00'
                }
                readOnly={isLastAmount}
                onChange={(value) => {
                  if (isLastAmount) return
                  const cents = moneyToCents(value)
                  if (!payingCard) {
                    setPixCents(cents)
                    return
                  }
                  setPayments((current) => ({
                    ...current,
                    [payingCard.id]: { ...(current[payingCard.id] || emptyPayment()), amountCents: cents },
                  }))
                }}
              />
              {payingCard ? (
                <>
                  <label className="edu-field">
                    <span>Parcelamento</span>
                    <select
                      className="edu-input edu-select"
                      value={payment.installment}
                      onChange={(event) =>
                        setPayments((current) => ({
                          ...current,
                          [payingCard.id]: { ...(current[payingCard.id] || emptyPayment()), installment: event.target.value as Installment | '' },
                        }))
                      }
                    >
                      <option value="">Escolha o parcelamento</option>
                      {INSTALLMENT_PLANS.map((plan) => (
                        <option key={plan} value={plan}>
                          {installmentLabel(isLastAmount ? remainder : payment.amountCents || 0, plan)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field
                    label="Código de segurança (CVV)"
                    value={payment.cvv}
                    placeholder="***"
                    info="Três dígitos no verso do cartão"
                    onChange={(value) =>
                      setPayments((current) => ({
                        ...current,
                        [payingCard.id]: { ...(current[payingCard.id] || emptyPayment()), cvv: digitsOnly(value).slice(0, 4) },
                      }))
                    }
                  />
                  <Field
                    label="CPF"
                    value={payment.cpf}
                    placeholder="123.456.789-10"
                    onChange={(value) =>
                      setPayments((current) => ({
                        ...current,
                        [payingCard.id]: { ...(current[payingCard.id] || emptyPayment()), cpf: maskCpf(value) },
                      }))
                    }
                  />
                </>
              ) : null}
            </section>
            {error ? <p className="edu-hint">{error}</p> : null}
            <div className="edu-actions">
              <Primary ghost onClick={() => (amountIndex === 0 ? setStep('methods') : setAmountIndex((index) => index - 1))}>
                Voltar
              </Primary>
              <Primary onClick={() => saveAmount(amountIndex + 1)}>{comboPix && isLastAmount ? 'Gerar QR Code' : 'Próximo'}</Primary>
            </div>
          </div>
          <LaunchSummary totalCents={payCents} tuitions={selectedTuitions} split={liveSplit} />
        </div>
      </>
    )
  }

  if (step === 'cardReview') {
    const card = selectedCards[0]
    content = (
      <>
        <h1 className="edu-title">Revise seu pagamento</h1>
        <p className="edu-lead">Confira os detalhes da divisão do valor e confirme as formas de pagamento antes de finalizar a transação.</p>
        <BackLink onClick={() => setStep('methods')}>Voltar para formas de pagamento</BackLink>
        <div className="edu-layout">
          <div className="edu-col">
            <section className="edu-card">
              <h2>Resumo de Pagamento</h2>
              <div className="edu-payline">
                <span className="edu-payline__id">
                  {card ? (
                    <BrandIcon brand={card.brand} large />
                  ) : (
                    <BrandIcon brand="add" large />
                  )}
                  {card ? cardLabel(card) : 'Cartão'}
                </span>
                <span>{formatBRL(payCents)}</span>
              </div>
            </section>
            <Primary onClick={() => setStep('done')}>Efetuar pagamento</Primary>
          </div>
          <LaunchSummary totalCents={payCents} tuitions={selectedTuitions} />
        </div>
      </>
    )
  }

  if (step === 'pixPay') {
    content = (
      <>
        <BackLink
          onClick={() => {
            closePortalFlow()
            setAmountIndex(Math.max(slots.length - 1, 0))
            setStep('amount')
          }}
        >
          Voltar para a divisão do pagamento
        </BackLink>
      </>
    )
  }

  if (step === 'review') {
    content = (
      <>
        <h1 className="edu-title">Revise seu pagamento</h1>
        <p className="edu-lead">Confira os detalhes da divisão do valor e confirme as formas de pagamento antes de finalizar a transação.</p>
        <BackLink onClick={() => setStep('methods')}>Voltar para formas de pagamento</BackLink>
        <div className="edu-layout">
          <div className="edu-col">
            <section className="edu-card">
              <h2>Resumo de Pagamento</h2>
              {selectedCards.map((card, index) => {
                const payment = payments[card.id]
                return (
                  <div className="edu-review-row" key={card.id}>
                    <div className="edu-review-row__id">
                      <BrandIcon brand={card.brand} large />
                      {cardLabel(card)}
                    </div>
                    <div className="edu-review-row__tools">
                      <select
                        className="edu-input edu-select edu-select--inline"
                        value={payment?.installment || ''}
                        onChange={(event) =>
                          setPayments((current) => ({
                            ...current,
                            [card.id]: { ...(current[card.id] || emptyPayment()), installment: event.target.value as Installment },
                          }))
                        }
                      >
                        <option value="">Escolha o parcelamento</option>
                        {INSTALLMENT_PLANS.map((plan) => (
                          <option key={plan} value={plan}>
                            {installmentLabel(payment?.amountCents || 0, plan)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="edu-icon-btn"
                        aria-label={`Editar ${cardLabel(card)}`}
                        onClick={() => {
                          setAmountIndex(index)
                          setStep('amount')
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M4 16.8V20h3.2l9.4-9.4-3.2-3.2L4 16.8Zm14.7-8.5a.8.8 0 0 0 0-1.2l-1.8-1.8a.8.8 0 0 0-1.2 0l-1.2 1.2 3.2 3.2 1-1.4Z" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </section>
            <Primary onClick={() => setStep('done')}>Efetuar pagamento</Primary>
          </div>
          <LaunchSummary
            totalCents={reviewTotal || payCents}
            tuitions={selectedTuitions}
            split={selectedCards.map((card) => ({
              label: cardLabel(card),
              value: payments[card.id]?.installment ? installmentLabel(payments[card.id].amountCents, payments[card.id].installment as Installment) : '',
            }))}
          />
        </div>
      </>
    )
  }

  if (step === 'done') {
    content = (
      <>
        <h1 className="edu-title">Confirmação do pagamento</h1>
        <BackLink onClick={() => setStep('methods')}>Voltar para formas de pagamento</BackLink>
        <div className="edu-col">
          <section className="edu-card edu-success">
            <h2>Seu pagamento foi realizado com sucesso!</h2>
            <SuccessArt />
            <p>
              {payMode === 'combine'
                ? 'Recebemos a confirmação do Pix e dos cartões de crédito. Seus cartões foram salvos com segurança na sua carteira para pagamentos futuros.'
                : 'Pagamento confirmado! Recebemos a sua transação e o valor já consta como quitado em nosso sistema. Você já pode retornar ao seu extrato para conferir o status atualizado da sua conta.'}
            </p>
            <div className="edu-meta">
              <p>
                <small>Número identificador da transação</small>
                <b>13075412680516721826</b>
              </p>
              <p>
                <small>Código de autorização</small>
                <b>757806</b>
              </p>
            </div>
          </section>
          <Primary auto onClick={() => setStep('statement')}>
            Retornar para o extrato financeiro
          </Primary>
        </div>
      </>
    )
  }

  const comboChargeBits = selectedCards.map((card) => {
    const payment = payments[card.id]
    const cents = payment?.amountCents || 0
    const detail = payment?.installment ? installmentLabel(cents, payment.installment as Installment) : formatBRL(cents)
    return `${cardLabel(card)} (${detail})`
  })
  const comboChargeCopy =
    comboChargeBits.length <= 1
      ? `Ao pagar este QR Code, o valor será descontado no cartão ${comboChargeBits[0] || 'selecionado'}.`
      : `Ao pagar este QR Code, os valores serão descontados nos cartões ${comboChargeBits.slice(0, -1).join(', ')} e ${comboChargeBits[comboChargeBits.length - 1]}.`

  return (
    <PortalShell journey={journey} onJourney={chooseJourney}>
      {content}
      {portalFlow ? (
        <PortalPaymentModals
          flow={portalFlow}
          tuitions={selectedTuitions}
          payCents={payCents}
          pixCents={pixCents}
          comboPix={comboPix && portalFlow.kind === 'pix'}
          comboChargeCopy={comboChargeCopy}
          toast={portalToast}
          onToast={setPortalToast}
          onClose={() => {
            if (portalFlow.stage === 'pay' && portalFlow.kind === 'pix' && step === 'pixPay') {
              closePortalFlow()
              setAmountIndex(Math.max(slots.length - 1, 0))
              setStep('amount')
              return
            }
            closePortalFlow()
          }}
          onFlow={setPortalFlow}
          onFinish={finishPortalFlow}
          onPayBack={() => {
            if (step === 'pixPay') {
              closePortalFlow()
              setAmountIndex(Math.max(slots.length - 1, 0))
              setStep('amount')
              return
            }
            if (portalFlow?.stage === 'pay') {
              setPortalFlow({ kind: portalFlow.kind, stage: 'summary' })
              return
            }
            closePortalFlow()
          }}
        />
      ) : null}
      {offer ? (
        <div className="edu-modal-layer" onClick={() => setOffer(null)}>
          <section
            className="edu-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edu-offer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="edu-offer-title">Combinar pagamentos</h2>
            <p>
              Esse é um método de pagamento oferecido pela Techfin e será futuramente oferecido pela TOTVS Pay. Você pode escolher isso na sua negociação.
            </p>
            <div className="edu-actions">
              <Primary ghost onClick={() => setOffer(null)}>
                Voltar
              </Primary>
              <Primary
                onClick={() => {
                  setOffer(null)
                  openMix()
                }}
              >
                Continuar
              </Primary>
            </div>
          </section>
        </div>
      ) : null}
    </PortalShell>
  )
}
