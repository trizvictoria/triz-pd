import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../../advance/advance.css'
import { DEFAULT_AMOUNT, PROPOSAL } from '../../advance/model'
import { useAdvance } from '../../advance/store'
import { formatBRL } from '../../data/mock'
import { FlowNav } from './FlowNav'
import totvsLogo from '../../assets/totvs-logo.svg'
import visa from '../../assets/checkout/visa.svg'
import stripe from '../../assets/checkout/stripe.svg'
import paypal from '../../assets/checkout/paypal.svg'
import mastercard from '../../assets/checkout/mastercard.svg'
import gpayG from '../../assets/checkout/gpay-g.svg'
import gpayPay from '../../assets/checkout/gpay-pay.svg'
import cardIcon from '../../assets/checkout/card-icon.svg'
import radioOn from '../../assets/checkout/radio-on.svg'
import radioOff from '../../assets/checkout/radio-off.svg'

const STATES = [
  'Acre',
  'Alagoas',
  'Amapá',
  'Amazonas',
  'Bahia',
  'Ceará',
  'Distrito Federal',
  'Espírito Santo',
  'Goiás',
  'Maranhão',
  'Mato Grosso',
  'Mato Grosso do Sul',
  'Minas Gerais',
  'Pará',
  'Paraíba',
  'Paraná',
  'Pernambuco',
  'Piauí',
  'Rio de Janeiro',
  'Rio Grande do Norte',
  'Rio Grande do Sul',
  'Rondônia',
  'Roraima',
  'Santa Catarina',
  'São Paulo',
  'Sergipe',
  'Tocantins',
]

const UF: Record<string, string> = {
  'Minas Gerais': 'MG',
  'São Paulo': 'SP',
  'Rio de Janeiro': 'RJ',
}

const EMPTY_PAYER = {
  name: 'Cristiano',
  email: 'cristiano@totvs.com',
  phone: '(31) 91111-1111',
  documentCountry: 'Brasil',
  documentType: 'CPF',
  document: '111.111.111-11',
  country: 'Brasil',
  postal: '32146-015',
  street: 'Alameda das Garças',
  number: '300',
  extra: '',
  neighborhood: 'Cabral',
  city: 'Contagem',
  state: 'Minas Gerais',
}

export function CheckoutPage() {
  const { link, markPaid } = useAdvance()
  const [params, setParams] = useSearchParams()
  const etapa = params.get('etapa')
  const [payer, setPayer] = useState(EMPTY_PAYER)
  const [method, setMethod] = useState<'card' | 'pix' | 'boleto'>('card')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '', installments: '1' })
  const [paying, setPaying] = useState(false)
  const amount = link?.amount ?? DEFAULT_AMOUNT
  const paid = link?.status === 'paid' || etapa === 'confirmado'
  const cancelled = link?.status === 'cancelled'
  const showPayment = etapa === 'pagamento'

  const installments = useMemo(
    () => [1, 2, 3, 6].map((count) => ({ count, label: `${count}x de ${formatBRL(amount / count)}` })),
    [amount],
  )

  function patch<K extends keyof typeof payer>(key: K, value: (typeof payer)[K]) {
    setPayer((current) => ({ ...current, [key]: value }))
  }

  function pay() {
    setPaying(true)
    window.setTimeout(() => {
      markPaid()
      setPaying(false)
      setParams({ etapa: 'confirmado' })
    }, 700)
  }

  const uf = UF[payer.state] ?? payer.state

  return (
    <div className="advance-root ck-shell">
      <header className="ck-top">
        <img src={totvsLogo} alt="TOTVS" />
        <strong>Pay</strong>
      </header>
      <div className="ck-rail" />
      <main className="ck-workspace">
        <div className="ck-page">
        {cancelled ? (
          <section className="ck-card ck-result">
            <h1>Link indisponível</h1>
            <p>Este link de pagamento foi cancelado e a cobrança não aceita mais pagamento.</p>
            <Link className="ck-action" to="/proposta">
              Voltar para a proposta
            </Link>
          </section>
        ) : paid ? (
          <section className="ck-card ck-result">
            <h1>Pagamento confirmado</h1>
            <p>
              Adiantamento · Proposta/Reserva {PROPOSAL.number}
              <br />
              {PROPOSAL.enterprise}
            </p>
            <strong>{formatBRL(amount)}</strong>
            <Link className="ck-action" to="/proposta">
              Voltar para a proposta
            </Link>
          </section>
        ) : showPayment ? (
          <>
            <article className="ck-card ck-address">
              <h2>Endereço</h2>
              <div className="ck-address-cols">
                <p>
                  {payer.name}
                  <br />
                  {payer.email}
                  <br />
                  {payer.phone}
                  <br />
                  {payer.document}
                </p>
                <p>
                  {payer.street}, {payer.number}
                  <br />
                  {payer.extra || payer.neighborhood}
                  <br />
                  {payer.city} - {uf}
                  <br />
                  {payer.postal}
                </p>
              </div>
            </article>
            <div className="ck-split">
              <article className="ck-card">
                <h2>Métodos de pagamento aceitos</h2>
                <button className="ck-method" type="button" onClick={() => setMethod('card')}>
                  <span className="ck-method-label">
                    <Radio on={method === 'card'} /> Cartão de crédito
                  </span>
                  <span className="ck-brands">
                    <img src={visa} alt="" />
                    <img src={stripe} alt="" />
                    <span className="ck-brand ck-brand-paypal">
                      <img src={paypal} alt="" />
                    </span>
                    <span className="ck-brand ck-brand-master">
                      <img src={mastercard} alt="" />
                    </span>
                    <span className="ck-brand ck-brand-gpay">
                      <img src={gpayG} alt="" />
                      <img src={gpayPay} alt="" />
                    </span>
                  </span>
                </button>
                {method === 'card' ? (
                  <div className="ck-fields">
                    <label className="ck-field">
                      <span>Número do cartão</span>
                      <span className="ck-input ck-card-input">
                        <img src={cardIcon} alt="" />
                        <input
                          className="ck-input"
                          placeholder="1234 5678 9012 3456"
                          inputMode="numeric"
                          value={card.number}
                          onChange={(event) =>
                            setCard({
                              ...card,
                              number: event.target.value
                                .replace(/\D/g, '')
                                .slice(0, 16)
                                .replace(/(\d{4})(?=\d)/g, '$1 ')
                                .trim(),
                            })
                          }
                        />
                      </span>
                    </label>
                    <div className="ck-pair">
                      <label className="ck-field">
                        <span>Data de expiração</span>
                        <input
                          className="ck-input"
                          placeholder="mm/aa"
                          value={card.expiry}
                          onChange={(event) => setCard({ ...card, expiry: event.target.value })}
                        />
                      </label>
                      <label className="ck-field">
                        <span>CVV</span>
                        <input
                          className="ck-input"
                          placeholder="3 dígitos"
                          value={card.cvv}
                          onChange={(event) => setCard({ ...card, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) })}
                        />
                      </label>
                    </div>
                    <div className="ck-pair">
                      <label className="ck-field">
                        <span>Nome do titular do cartão</span>
                        <input
                          className="ck-input"
                          placeholder="Nome no cartão"
                          value={card.name}
                          onChange={(event) => setCard({ ...card, name: event.target.value })}
                        />
                      </label>
                      <label className="ck-field">
                        <span>Parcelamento</span>
                        <select className="ck-select" value={card.installments} onChange={(event) => setCard({ ...card, installments: event.target.value })}>
                          {installments.map((item) => (
                            <option key={item.count} value={String(item.count)}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                ) : null}
                <button className="ck-method ck-option" type="button" onClick={() => setMethod('pix')}>
                  <span className="ck-method-label">
                    <Radio on={method === 'pix'} /> Pix
                  </span>
                </button>
                {method === 'pix' ? <p className="ck-note">O QR Code do Pix aparece depois da confirmação.</p> : null}
                <button className="ck-method ck-option" type="button" onClick={() => setMethod('boleto')}>
                  <span className="ck-method-label">
                    <Radio on={method === 'boleto'} /> Boleto
                  </span>
                </button>
                {method === 'boleto' ? <p className="ck-note">O boleto é gerado ao confirmar o pagamento.</p> : null}
              </article>
              <OrderCard amount={amount} />
            </div>
            <button className="ck-action" type="button" disabled={paying} onClick={pay}>
              {paying ? 'Processando...' : 'Pagar'}
            </button>
          </>
        ) : (
          <>
            <div className="ck-split">
              <article className="ck-card">
                <h2>Identificação</h2>
                <p className="ck-section">Dados pessoais</p>
                <label className="ck-field">
                  <span>Nome completo</span>
                  <input className="ck-input" placeholder="Digite seu nome completo" value={payer.name} onChange={(event) => patch('name', event.target.value)} />
                </label>
                <div className="ck-pair">
                  <label className="ck-field">
                    <span>Email</span>
                    <input className="ck-input" placeholder="Digite seu e-mail" value={payer.email} onChange={(event) => patch('email', event.target.value)} />
                  </label>
                  <label className="ck-field">
                    <span>Telefone</span>
                    <input className="ck-input" placeholder="(00) 0000-0000" value={payer.phone} onChange={(event) => patch('phone', event.target.value)} />
                  </label>
                </div>
                <p className="ck-section">Documento</p>
                <div className="ck-pair">
                  <label className="ck-field">
                    <span>País do documento</span>
                    <select className="ck-select" value={payer.documentCountry} onChange={(event) => patch('documentCountry', event.target.value)}>
                      <option>Brasil</option>
                    </select>
                  </label>
                  <label className="ck-field">
                    <span>Tipo de documento</span>
                    <select className="ck-select" value={payer.documentType} onChange={(event) => patch('documentType', event.target.value)}>
                      <option>CPF</option>
                      <option>CNPJ</option>
                    </select>
                  </label>
                </div>
                <label className="ck-field">
                  <span>Número do documento</span>
                  <input className="ck-input" placeholder="Isso é um placeholder" value={payer.document} onChange={(event) => patch('document', event.target.value)} />
                </label>
                <p className="ck-section">Endereço</p>
                <div className="ck-pair">
                  <label className="ck-field">
                    <span>País do endereço</span>
                    <select className="ck-select" value={payer.country} onChange={(event) => patch('country', event.target.value)}>
                      <option>Brasil</option>
                    </select>
                  </label>
                  <label className="ck-field">
                    <span>Código postal (CEP)</span>
                    <input className="ck-input" placeholder="000000-000" value={payer.postal} onChange={(event) => patch('postal', event.target.value)} />
                  </label>
                </div>
                <label className="ck-field">
                  <span>Rua</span>
                  <input className="ck-input" placeholder="Isso é um placeholder" value={payer.street} onChange={(event) => patch('street', event.target.value)} />
                </label>
                <div className="ck-pair">
                  <label className="ck-field">
                    <span>Número</span>
                    <input className="ck-input" placeholder="Isso é um placeholder" value={payer.number} onChange={(event) => patch('number', event.target.value)} />
                  </label>
                  <label className="ck-field">
                    <span>Complemento (opcional)</span>
                    <input className="ck-input" placeholder="000000-000" value={payer.extra} onChange={(event) => patch('extra', event.target.value)} />
                  </label>
                </div>
                <label className="ck-field">
                  <span>Bairro</span>
                  <input className="ck-input" placeholder="Isso é um placeholder" value={payer.neighborhood} onChange={(event) => patch('neighborhood', event.target.value)} />
                </label>
                <div className="ck-pair">
                  <label className="ck-field">
                    <span>Cidade</span>
                    <input className="ck-input" placeholder="Nome da cidade" value={payer.city} onChange={(event) => patch('city', event.target.value)} />
                  </label>
                  <label className="ck-field">
                    <span>Estado</span>
                    <select className="ck-select" value={payer.state} onChange={(event) => patch('state', event.target.value)}>
                      <option value="">Selecione o estado</option>
                      {STATES.map((state) => (
                        <option key={state}>{state}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </article>
              <OrderCard amount={amount} />
            </div>
            <button className="ck-action" type="button" disabled={!payer.name || !payer.email} onClick={() => setParams({ etapa: 'pagamento' })}>
              Continuar
            </button>
          </>
        )}
        </div>
      </main>
      <FlowNav />
    </div>
  )
}

function OrderCard({ amount }: { amount: number }) {
  return (
    <article className="ck-card">
      <h2>Pedido</h2>
      <div className="ck-order-item">
        <div className="ck-order-head">
          <strong>Adiantamento</strong>
          <span>{formatBRL(amount)}</span>
        </div>
        <p>
          Adiantamento da Proposta/Reserva {PROPOSAL.number} no empreendimento {PROPOSAL.enterprise}, {PROPOSAL.unit}.
        </p>
        <small>Quantidade: 1</small>
      </div>
      <div className="ck-order-line" />
      <div className="ck-order-total">
        <span>Total</span>
        <span>{formatBRL(amount)}</span>
      </div>
    </article>
  )
}

function Radio({ on }: { on: boolean }) {
  return <img src={on ? radioOn : radioOff} alt="" />
}
