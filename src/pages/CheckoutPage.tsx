import { useMemo, useState } from 'react'
import { TotvsPayLogo } from '../components/TotvsPayLogo'
import { formatBRL } from '../lib/deal'
import { usePayments } from '../state/payments'

const STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

type Step = 'identify' | 'method' | 'pix' | 'boleto' | 'card' | 'pix-success' | 'boleto-success' | 'card-success'

type Ident = {
  name: string
  email: string
  phone: string
  doc: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  uf: string
  cep: string
}

const EMPTY_IDENT: Ident = {
  name: '',
  email: '',
  phone: '',
  doc: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  uf: '',
  cep: '',
}

function dash(value: string) {
  return value.trim() || '—'
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18 9 12l6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function PixIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8.72 1.4a1.02 1.02 0 0 0-1.44 0L1.4 7.28a1.02 1.02 0 0 0 0 1.44l5.88 5.88a1.02 1.02 0 0 0 1.44 0l5.88-5.88a1.02 1.02 0 0 0 0-1.44L8.72 1.4Z" />
    </svg>
  )
}

function BoletoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7v10M7 7v10M9 7v10M12 7v10M16 7v10M20 7v10" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function QrPlaceholder() {
  const cells = useMemo(() => {
    const size = 25
    const finder = (x: number, y: number, ox: number, oy: number) => {
      const dx = x - ox
      const dy = y - oy
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null
      if (dx === 0 || dy === 0 || dx === 6 || dy === 6) return true
      if (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) return true
      return false
    }
    return Array.from({ length: size }, (_, y) =>
      Array.from({ length: size }, (_, x) => {
        return finder(x, y, 0, 0) ?? finder(x, y, 18, 0) ?? finder(x, y, 0, 18) ?? (x * 7 + y * 13 + x * y) % 5 === 0
      }),
    )
  }, [])

  return (
    <svg className="ck-qr" viewBox="0 0 25 25" aria-hidden>
      {cells.flatMap((row, y) =>
        row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#111" /> : null)),
      )}
    </svg>
  )
}

function OrderCard({
  items,
  totalCents,
  withAmount,
}: {
  items: { id: string; name: string; unitCents: number; quantity: number }[]
  totalCents: number
  withAmount?: boolean
}) {
  return (
    <aside className="checkout-order">
      <div className="checkout-order__head">
        <h2>Pedido</h2>
        {withAmount ? (
          <span className="checkout-order__amount">
            {formatBRL(totalCents)}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="m18 15-6-6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : null}
      </div>
      {items.map((item) => (
        <div className="checkout-item" key={item.id}>
          <div className="checkout-item__row">
            <p>{item.name}</p>
            <p>{formatBRL(item.unitCents * item.quantity)}</p>
          </div>
          <p className="checkout-item__qty">Quantidade: {item.quantity}</p>
        </div>
      ))}
      <div className="checkout-order__total">
        <span>Total</span>
        <span>{formatBRL(totalCents)}</span>
      </div>
    </aside>
  )
}

function PoweredBy() {
  return (
    <p className="ck-powered">
      Powered by <TotvsPayLogo variant="dark" size="powered" />
    </p>
  )
}

export function CheckoutPage() {
  const { checkoutLink, completeCheckout } = usePayments()
  const [step, setStep] = useState<Step>('identify')
  const [ident, setIdent] = useState<Ident>(EMPTY_IDENT)
  const [copied, setCopied] = useState(false)

  if (!checkoutLink) return null

  const amount = formatBRL(checkoutLink.totalCents)
  const pixCode = `00020101021226580014BR.GOV.BCB.PIX0136${checkoutLink.id.replace(/-/g, '').slice(0, 32)}520400005303986540${(checkoutLink.totalCents / 100).toFixed(2)}5802BR5925TOTVS PAY6009Sao Paulo62070503***6304ABCD`
  const boletoCode = '23793.38128 60007.827136 95000.063305 1 844700000' + String(checkoutLink.totalCents).padStart(8, '0')

  function patchIdent(patch: Partial<Ident>) {
    setIdent((current) => ({ ...current, ...patch }))
  }

  const layout = step === 'pix-success' || step === 'boleto-success' || step === 'card-success'

  return (
    <div className="checkout">
      <header className="checkout-header">
        <button type="button" className="checkout-back" aria-label="Voltar ao CRM" onClick={completeCheckout}>
          <BackIcon />
        </button>
        <TotvsPayLogo variant="dark" size="checkout" />
      </header>

      {layout ? (
        <main className="checkout-success">
          {step === 'pix-success' ? (
            <section className="ck-success-card">
              <h1>Finalize seu pagamento via pix</h1>
              <p className="ck-success-lead">Escaneie o QR Code ou copie o código abaixo.</p>
              <div className="ck-summary">
                <strong>Resumo do pedido</strong>
                <p>Pedido: #{checkoutLink.id}</p>
                <p>Valor total: {amount}</p>
              </div>
              <div className="ck-pix-box">
                <QrPlaceholder />
                <div className="ck-pix-copy">
                  <p>
                    Esse código expira em: <strong>23:59:56</strong>
                  </p>
                  <textarea readOnly value={pixCode} rows={3} />
                  <button
                    type="button"
                    className="ck-copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(pixCode).catch(() => {})
                      setCopied(true)
                    }}
                  >
                    {copied ? 'Código copiado' : 'Copiar Código'}
                  </button>
                </div>
              </div>
              <div className="ck-instructions">
                <strong>Instruções para pagamento</strong>
                <ol>
                  <li>Abra o aplicativo do seu banco e selecione o ambiente do PIX.</li>
                  <li>Escolha a opção pagar com QR Code e escaneie o código acima ou copie e cole a chave PIX para efetuar o pagamento.</li>
                  <li>Confirme as informações e finalize a compra antes que o código expire.</li>
                </ol>
              </div>
            </section>
          ) : null}

          {step === 'boleto-success' ? (
            <section className="ck-success-card">
              <h1>Finalize seu pagamento via boleto</h1>
              <p className="ck-success-lead">Copie a linha digitável ou use o código de barras abaixo.</p>
              <div className="ck-summary">
                <strong>Resumo do pedido</strong>
                <p>Pedido: #{checkoutLink.id}</p>
                <p>Valor total: {amount}</p>
              </div>
              <div className="ck-boleto-code" aria-hidden>
                {Array.from({ length: 48 }, (_, i) => (
                  <span key={i} style={{ width: i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1 }} />
                ))}
              </div>
              <textarea readOnly value={boletoCode} rows={2} />
              <button
                type="button"
                className="ck-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(boletoCode).catch(() => {})
                  setCopied(true)
                }}
              >
                {copied ? 'Código copiado' : 'Copiar Código'}
              </button>
            </section>
          ) : null}

          {step === 'card-success' ? (
            <section className="ck-success-card ck-success-card--center">
              <h1>Pagamento aprovado</h1>
              <p className="ck-success-lead">Recebemos o pagamento de {amount}. O pedido já consta como pago.</p>
              <div className="ck-summary">
                <strong>Resumo do pedido</strong>
                <p>Pedido: #{checkoutLink.id}</p>
                <p>Valor total: {amount}</p>
              </div>
              <button type="button" className="checkout-submit" onClick={completeCheckout}>
                Voltar ao CRM
              </button>
            </section>
          ) : null}
          <PoweredBy />
        </main>
      ) : (
        <main className="checkout-main">
          <section>
            {step === 'identify' ? (
              <>
                <h1 className="checkout-title">Identificação</h1>
                <div className="checkout-section">
                  <h3>Dados pessoais</h3>
                  <div className="checkout-fields">
                    <label className="checkout-field">
                      <span>Nome completo</span>
                      <input
                        placeholder="Digite seu nome completo"
                        value={ident.name}
                        onChange={(event) => patchIdent({ name: event.target.value })}
                      />
                    </label>
                    <div className="checkout-row">
                      <label className="checkout-field">
                        <span>E-mail</span>
                        <input
                          type="email"
                          placeholder="Digite seu e-mail"
                          value={ident.email}
                          onChange={(event) => patchIdent({ email: event.target.value })}
                        />
                      </label>
                      <label className="checkout-field">
                        <span>Telefone</span>
                        <span className="checkout-phone">
                          <span className="checkout-flag" aria-hidden />
                          <input
                            placeholder="(00) 00000-0000"
                            value={ident.phone}
                            onChange={(event) => patchIdent({ phone: event.target.value })}
                          />
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="checkout-section">
                  <h3>Documento</h3>
                  <div className="checkout-fields">
                    <div className="checkout-row">
                      <label className="checkout-field">
                        <span>País do documento</span>
                        <select defaultValue="Brasil">
                          <option>Brasil</option>
                        </select>
                      </label>
                      <label className="checkout-field">
                        <span>Tipo de documento</span>
                        <select defaultValue="CPF">
                          <option>CPF</option>
                          <option>CNPJ</option>
                        </select>
                      </label>
                    </div>
                    <label className="checkout-field">
                      <span>Número do documento</span>
                      <input
                        placeholder="000.000.000-00"
                        value={ident.doc}
                        onChange={(event) => patchIdent({ doc: event.target.value })}
                      />
                    </label>
                  </div>
                </div>
                <div className="checkout-section">
                  <h3>Endereço</h3>
                  <div className="checkout-fields">
                    <div className="checkout-row">
                      <label className="checkout-field">
                        <span>País do endereço</span>
                        <select defaultValue="Brasil">
                          <option>Brasil</option>
                        </select>
                      </label>
                      <label className="checkout-field">
                        <span>Código postal (CEP)</span>
                        <input
                          placeholder="00000-000"
                          value={ident.cep}
                          onChange={(event) => patchIdent({ cep: event.target.value })}
                        />
                      </label>
                    </div>
                    <label className="checkout-field">
                      <span>Rua</span>
                      <input
                        placeholder="Nome da rua"
                        value={ident.street}
                        onChange={(event) => patchIdent({ street: event.target.value })}
                      />
                    </label>
                    <div className="checkout-row">
                      <label className="checkout-field">
                        <span>Número</span>
                        <input
                          placeholder="Ex: 123"
                          value={ident.number}
                          onChange={(event) => patchIdent({ number: event.target.value })}
                        />
                      </label>
                      <label className="checkout-field">
                        <span>Complemento (opcional)</span>
                        <input
                          placeholder="Apto, casa, fundos, etc."
                          value={ident.complement}
                          onChange={(event) => patchIdent({ complement: event.target.value })}
                        />
                      </label>
                    </div>
                    <label className="checkout-field">
                      <span>Bairro</span>
                      <input
                        placeholder="Nome do bairro"
                        value={ident.district}
                        onChange={(event) => patchIdent({ district: event.target.value })}
                      />
                    </label>
                    <div className="checkout-row">
                      <label className="checkout-field">
                        <span>Cidade</span>
                        <input
                          placeholder="Nome da cidade"
                          value={ident.city}
                          onChange={(event) => patchIdent({ city: event.target.value })}
                        />
                      </label>
                      <label className="checkout-field">
                        <span>Estado</span>
                        <select value={ident.uf} onChange={(event) => patchIdent({ uf: event.target.value })}>
                          <option value="">Selecione o estado</option>
                          {STATES.map((state) => (
                            <option key={state}>{state}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
                <button type="button" className="checkout-submit" onClick={() => setStep('method')}>
                  Continuar
                </button>
              </>
            ) : null}

            {step === 'method' ? (
              <>
                <div className="ck-id-head">
                  <h1 className="checkout-title">Identificação</h1>
                  <button type="button" className="ck-edit" onClick={() => setStep('identify')}>
                    <PencilIcon /> Editar
                  </button>
                </div>
                <div className="ck-id-grid">
                  <div>
                    <p>{dash(ident.name)}</p>
                    <p>{dash(ident.email)}</p>
                    <p>{dash(ident.phone)}</p>
                    <p>{dash(ident.doc)}</p>
                  </div>
                  <div>
                    <p>
                      {dash([ident.street, ident.number].filter(Boolean).join(', '))}
                    </p>
                    <p>{dash(ident.district)}</p>
                    <p>
                      {dash([ident.city, ident.uf].filter(Boolean).join(', '))}
                    </p>
                    <p>{dash(ident.cep)}</p>
                  </div>
                </div>
                <div className="ck-pay">
                  <h2>Pagamento</h2>
                  <div className="ck-pay-group">
                    <button type="button" className="ck-pay-opt" onClick={() => setStep('card')}>
                      <span className="ck-pay-opt__main">
                        <CardIcon /> Cartão de crédito
                      </span>
                      <ChevronRight />
                    </button>
                    <button type="button" className="ck-pay-opt ck-pay-opt--pix" onClick={() => setStep('pix')}>
                      <span className="ck-pay-opt__main">
                        <PixIcon />
                        <span className="ck-pay-opt__copy">
                          <span className="ck-pay-opt__label">Pix</span>
                          <small>Aprovação em instantes</small>
                        </span>
                      </span>
                      <ChevronRight />
                    </button>
                  </div>
                  <button type="button" className="ck-pay-opt ck-pay-opt--solo" onClick={() => setStep('boleto')}>
                    <span className="ck-pay-opt__main">
                      <BoletoIcon /> Boleto
                    </span>
                    <ChevronRight />
                  </button>
                </div>
                <PoweredBy />
              </>
            ) : null}

            {step === 'pix' || step === 'boleto' || step === 'card' ? (
              <>
                <button type="button" className="ck-other" onClick={() => setStep('method')}>
                  <BackIcon /> Pagar com outro método
                </button>
                {step === 'pix' ? (
                  <>
                    <h2 className="ck-method-title">Pix</h2>
                    <div className="ck-info-box">
                      Para concluir com Pix, finalize o pedido. O QR Code para pagamento será exibido na próxima tela.
                    </div>
                    <button type="button" className="checkout-submit" onClick={() => setStep('pix-success')}>
                      Pagar {amount}
                    </button>
                  </>
                ) : null}
                {step === 'boleto' ? (
                  <>
                    <h2 className="ck-method-title">Boleto</h2>
                    <div className="ck-info-box">
                      Para gerar o boleto, finalize o pedido. Ele será exibido na próxima tela.
                    </div>
                    <button type="button" className="checkout-submit" onClick={() => setStep('boleto-success')}>
                      Pagar {amount}
                    </button>
                  </>
                ) : null}
                {step === 'card' ? (
                  <>
                    <h2 className="ck-method-title">Cartão de crédito</h2>
                    <div className="ck-card-box">
                      <label className="checkout-field">
                        <span>Número do cartão</span>
                        <input placeholder="0000 0000 0000 0000" />
                      </label>
                      <div className="checkout-row">
                        <label className="checkout-field">
                          <span>Data de expiração</span>
                          <input placeholder="MM/AA" />
                        </label>
                        <label className="checkout-field">
                          <span>CVV</span>
                          <input placeholder="3 dígitos" />
                        </label>
                      </div>
                      <div className="checkout-row">
                        <label className="checkout-field">
                          <span>Nome do titular do cartão</span>
                          <input placeholder="Nome no cartão" />
                        </label>
                        <label className="checkout-field">
                          <span>Parcelamento</span>
                          <select defaultValue="1">
                            <option value="1">1x de {amount}</option>
                          </select>
                        </label>
                      </div>
                    </div>
                    <button type="button" className="checkout-submit" onClick={() => setStep('card-success')}>
                      Pagar {amount}
                    </button>
                  </>
                ) : null}
                <PoweredBy />
              </>
            ) : null}
          </section>
          <OrderCard items={checkoutLink.items} totalCents={checkoutLink.totalCents} withAmount={step === 'identify'} />
        </main>
      )}
    </div>
  )
}
