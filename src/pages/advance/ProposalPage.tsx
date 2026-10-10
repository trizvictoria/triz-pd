import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../advance/advance.css'
import qrDemo from '../../assets/advance/qr-demo.svg'
import {
  ENTRY_COMPONENTS,
  formatDue,
  PROPOSAL,
} from '../../advance/model'
import { useAdvance, type AdvanceLink } from '../../advance/store'
import { formatBRL } from '../../data/mock'
import { FlowNav } from './FlowNav'

type Dialog = 'whatsapp' | 'cancel' | null
type Modal = 'form' | 'share' | null

type PaymentRow = {
  name: string
  qty: string
  due: string
  amountCents: number
  percent: string
  commission: string
  checked: boolean
  grayQty: boolean
}

const ROWS: PaymentRow[] = [
  { name: 'Ato', qty: '1', due: '05/05/2025', amountCents: 30000, percent: '5,00', commission: '700,00', checked: true, grayQty: true },
  { name: 'Entrada 02', qty: '1', due: '05/05/2025', amountCents: 20000, percent: '1,00', commission: '0,00', checked: true, grayQty: true },
  { name: 'Entrada 03', qty: '1', due: '05/05/2025', amountCents: 20000, percent: '1,00', commission: '0,00', checked: true, grayQty: true },
  { name: 'Mensal', qty: '1', due: '05/06/2025', amountCents: 460000, percent: '23,00', commission: '0,00', checked: true, grayQty: false },
  { name: 'Intermediaria', qty: '1', due: '05/06/2025', amountCents: 20000, percent: '1,00', commission: '0,00', checked: false, grayQty: false },
  { name: 'Bimestral', qty: '1', due: '05/06/2025', amountCents: 20000, percent: '1,00', commission: '0,00', checked: false, grayQty: false },
  { name: 'Trimestral', qty: '1', due: '05/06/2025', amountCents: 20000, percent: '1,00', commission: '0,00', checked: false, grayQty: false },
  { name: 'FB', qty: '1', due: '05/06/2025', amountCents: 1300000, percent: '65,00', commission: '0,00', checked: false, grayQty: false },
  { name: 'Semestral', qty: '1', due: '05/06/2025', amountCents: 20000, percent: '1,00', commission: '0,00', checked: false, grayQty: false },
  { name: 'Anual', qty: '1', due: '05/06/2025', amountCents: 20000, percent: '1,00', commission: '0,00', checked: false, grayQty: false },
]

function formatAmount(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}


export function ProposalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { link, generate, cancel, reset } = useAdvance()
  const [toast, setToast] = useState('')
  const [tableOpen, setTableOpen] = useState(true)
  const [cents, setCents] = useState(0)
  const [due, setDue] = useState('2026-10-07')
  const [expiryMode, setExpiryMode] = useState('vencimento')
  const [componentId, setComponentId] = useState('')
  const routeState = location.state as { view?: Modal | 'closed'; dialog?: Dialog } | null
  const [modal, setModal] = useState<Modal>(() => {
    if (routeState?.view === 'closed') return null
    if (routeState?.view === 'form') return 'form'
    if (routeState?.view === 'share') return 'share'
    return null
  })
  const [dialog, setDialog] = useState<Dialog>(routeState?.view === 'share' ? (routeState.dialog ?? null) : null)
  const linkRef = useRef(link)
  linkRef.current = link

  function openForm(prefill?: number) {
    setCents(typeof prefill === 'number' ? Math.round(prefill * 100) : 0)
    setDialog(null)
    setModal('form')
  }

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!routeState) return
    if (routeState.view === 'form') {
      const current = linkRef.current
      setCents(current ? Math.round(current.amount * 100) : 0)
      setModal('form')
      setDialog(null)
    } else if (routeState.view === 'share') {
      setModal('share')
      setDialog(routeState.dialog ?? null)
    } else if (routeState.view === 'closed') {
      setModal(null)
      setDialog(null)
    }
  }, [routeState])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (dialog) setDialog(null)
      else setModal(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dialog])

  const amount = cents / 100

  function publish() {
    if (amount <= 0) {
      setToast('Informe o valor da cobrança')
      return
    }
    if (expiryMode === 'vencimento' && !due) {
      setToast('Informe a data de vencimento')
      return
    }
    generate(amount, expiryMode === 'vencimento' ? formatDue(due) : 'Sem expiração', [])
    navigate('/proposta', { replace: true, state: { view: 'share' } })
    setToast('Link de pagamento gerado')
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* o protótipo segue mesmo sem permissão de área de transferência */
    }
    setToast('Link copiado')
  }

  function applyComponent() {
    const item = ENTRY_COMPONENTS.find((entry) => entry.id === componentId)
    if (!item || !link) {
      setToast('Selecione um componente de entrada')
      return
    }
    if (link.amount > item.balance) {
      setToast('Saldo insuficiente para abater o adiantamento')
      return
    }
    setToast(`Adiantamento aplicado em ${item.name}. Demonstração concluída.`)
  }

  function demo() {
    setToast('Para demonstrar o fluxo, clique em Adiantamento.')
  }

  function restart() {
    reset()
    setModal(null)
    setDialog(null)
    setCents(0)
    setDue('2026-10-07')
    setComponentId('')
    setTableOpen(true)
    setToast('Demonstração reiniciada.')
  }

  const advanceLabel = link && link.status !== 'cancelled' ? formatBRL(link.amount) : '-'

  return (
    <div className={`advance-root evt-root${modal || dialog ? ' is-locked' : ''}`}>
      <div className="evt">
        <header className="evt-top">
          <b className="evt-brand">TOTVS</b>
          <nav className="evt-nav" aria-label="Módulos">
            <b>Pré-Venda</b>
            <b>Empreendimentos</b>
            <b>Propostas</b>
            <b>Contratos</b>
          </nav>
          <div className="evt-head-icons">
            <LineIcon d="m15 2 7 7-5 2-4 5-3-3-7 8 6-9-3-3 5-2z" />
            <LineIcon d="M5 5h.1M12 5h.1M19 5h.1M5 12h.1M12 12h.1M19 12h.1M5 19h.1M12 19h.1M19 19h.1" />
            <LineIcon d="M19 14a8 8 0 1 0-14 2l-2 5 6-2a8 8 0 0 0 10-5zM8 8h7m-7 4h4" />
            <span className="evt-avatar">M</span>
          </div>
        </header>
        <aside className="evt-side" aria-label="Atalhos">
          <span><LineIcon d="M3 18v-4a9 9 0 0 1 15-7M6 17v-3a6 6 0 0 1 9-5M3 18h18v-7M9 17 21 5" /></span>
          <span><PeopleIcon /></span>
          <span><LineIcon d="M3 21h19M5 21V8l9-5v18m0-12h6v12M8 9v2m3-3v2m-3 4v2m3-3v2m-3 4v2m8-8v2m0 2v2" /></span>
          <span><DocIcon /></span>
          <span><DocIcon /></span>
          <span><PeopleIcon /></span>
          <span><GearIcon /></span>
          <span><LineIcon d="M4 5h16v16H4zM4 10h16M8 3v5m8-5v5M8 14h2m4 0h2m-8 3h2" /></span>
          <button className="evt-reset" type="button" title="Reiniciar demonstração" aria-label="Reiniciar demonstração" onClick={restart}>
            ⊙
          </button>
        </aside>
        <main className="evt-main">
          <section className="evt-enterprise">
            <h3>
              Dados do Empreendimento <span className="evt-badge">EM PREPARAÇÃO</span>
            </h3>
            <div className="evt-details">
              <div>
                <label>Empreendimento</label>
                <p>{PROPOSAL.enterprise}</p>
                <label>Entrega</label>
                <p>{PROPOSAL.delivery}</p>
              </div>
              <div>
                <label>Bloco</label>
                <p>{PROPOSAL.block}</p>
                <label>Área</label>
                <p>{PROPOSAL.area}</p>
              </div>
              <div>
                <label>Unidade</label>
                <p>{PROPOSAL.unit}</p>
                <label>Data proposta</label>
                <p className="evt-date">
                  {PROPOSAL.proposalDate} <span><LineIcon d="M4 5h16v16H4zM4 10h16M8 3v5m8-5v5M8 14h2m4 0h2" /></span>
                </p>
              </div>
              <div>
                <label>Vagas</label>
                <p>{PROPOSAL.spots}</p>
                <label>Valor tabela</label>
                <p>20.000,00</p>
                <label>Valor da Proposta (R$)</label>
                <p><strong>19.300,00</strong></p>
              </div>
              <div>
                <label>Desconto (R$)</label>
                <p><strong>700,00 (3,5 %)</strong></p>
              </div>
              <div>
                <label>Acréscimo (R$)</label>
                <p><strong>-</strong></p>
              </div>
              <div>
                <label>Adiantamento (R$)</label>
                <p><strong>{advanceLabel}</strong></p>
              </div>
            </div>
          </section>
          <h3 className="evt-title">Preencher Proposta - ({PROPOSAL.number})</h3>
          <div className="evt-nav-row">
            <button className="is-primary" type="button" onClick={demo}>❮ &nbsp;Voltar</button>
            <button className="is-primary" type="button" onClick={demo}>❯ &nbsp;Próximo</button>
          </div>
          <div className="evt-steps">
            <div><i>✓</i><span>Dados Iniciais</span></div>
            <div><i>✓</i><span>Cliente</span></div>
            <div className="is-active">
              <i><LineIcon d="m4 15 11-11 5 5L9 20H4zM13 6l5 5" /></i>
              <span>Condições de pagamento</span>
            </div>
            <div><i>✓</i><span>Resumo da proposta</span></div>
          </div>
          <div className="evt-tabs">
            <button type="button" onClick={() => openForm(link && link.status !== 'cancelled' ? link.amount : undefined)}>Adiantamento</button>
            <button type="button" onClick={demo}>Comissão</button>
            <button type="button" onClick={demo}>Restaurar tabela</button>
            <button type="button" onClick={demo}>Desconto</button>
            <button type="button" onClick={demo}>Validar</button>
            <button type="button" onClick={demo}>Plano de pagamento</button>
            <button type="button" onClick={demo}>Gráfico comparativo</button>
            <button type="button" onClick={demo}>Log VPL</button>
          </div>
          <div className="evt-payment">
            <label className="evt-modality" htmlFor="modality">Modalidade</label>
            <select id="modality" defaultValue={PROPOSAL.modality}>
              <option>{PROPOSAL.modality}</option>
            </select>
            <button className="evt-toggle" type="button" aria-expanded={tableOpen} onClick={() => setTableOpen((open) => !open)}>
              Tabela Padrão <span>{tableOpen ? '⌄' : '›'}</span>
            </button>
            {tableOpen ? (
              <section>
                <div className="evt-actions">
                  <button type="button" disabled>＋ Componentes Disponíveis</button>
                  <button type="button" disabled>Recalcular vencimentos</button>
                  <div />
                  <button type="button" disabled>× Cancelar</button>
                  <button type="button" disabled>✓ Salvar</button>
                </div>
                <div className="evt-table-wrap">
                  <table className="evt-table">
                    <thead>
                      <tr>
                        <th>Mo...</th>
                        <th>Sta...</th>
                        <th>Componente</th>
                        <th>Quantidade</th>
                        <th>Vencimento</th>
                        <th />
                        <th>Valor Parcela</th>
                        <th>%</th>
                        <th>Valor Total</th>
                        <th>Co...</th>
                        <th>Comissão</th>
                        <th>Exc...</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {ROWS.map((row) => (
                        <tr key={row.name}>
                          <td>⠿</td>
                          <td className="evt-ok">✓</td>
                          <td><span className="evt-cell is-gray">{row.name}</span></td>
                          <td><span className={`evt-cell${row.grayQty ? ' is-gray' : ''}`}>{row.qty}</span></td>
                          <td><span className="evt-cell">{row.due}</span></td>
                          <td className="evt-cal"><LineIcon d="M4 5h16v16H4zM4 10h16M8 3v5m8-5v5M8 14h2m4 0h2" /></td>
                          <td><span className="evt-cell evt-money">{formatAmount(row.amountCents)}</span></td>
                          <td><span className="evt-cell is-gray">{row.percent}</span></td>
                          <td><span className="evt-cell evt-money">{formatAmount(row.amountCents)}</span></td>
                          <td><span className={`evt-check${row.checked ? ' is-on' : ''}`}>{row.checked ? '✓' : ''}</span></td>
                          <td><span className="evt-cell is-gray evt-money">{row.commission}</span></td>
                          <td><span className="evt-check" /></td>
                          <td className="evt-dots">···</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="evt-totals">
                  <div>
                    <p>Tabela Padrão: <b>R$ 20.000,00</b></p>
                    <p>Diferença: <b>R$ 0,00</b></p>
                    <hr />
                    <p>Valor Total: (100,00%) <b>R$ 20.000,00</b></p>
                  </div>
                  <div>
                    <p>Valor Total: <b>R$ 20.000,00</b></p>
                    <p>Comissão Mesa: <b className="evt-red">(-R$ 700,00)</b></p>
                    <hr />
                    <p>Saldo Devedor: <b>R$ 19.300,00</b></p>
                  </div>
                  <div>
                    <p>Comissão Mesa Valor Total: <b>R$ 700,00</b></p>
                    <p>Comissão Mesa Distribuído: <b className="evt-red">(-R$ 700,00)</b></p>
                    <hr />
                    <p>Comissão Mesa à Distribuir: <b>R$ 0,00</b></p>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </main>
      </div>

      {modal === 'form' ? (
        <div className="adv-overlay">
          <section className="adv-modal adv-modal-form" role="dialog" aria-modal="true" aria-labelledby="advance-title">
            <header>
              <h2 id="advance-title">Adiantamento</h2>
            </header>
            <div className="adv-modal-body">
              <div className="adv-alert">
                <strong>ATENÇÃO</strong>
              </div>
              <label className="adv-field">
                <span>
                  Valor R$ da Cobrança <em>*</em>
                </span>
                <input
                  className="adv-control"
                  inputMode="numeric"
                  value={formatBRL(amount)}
                  onChange={(event) => setCents(Number(event.target.value.replace(/\D/g, '').slice(0, 9) || '0'))}
                />
              </label>
              <div className="adv-grid-2">
                <label className="adv-field">
                  <span>
                    Expiração da cobrança <em>*</em>
                  </span>
                  <select className="adv-control" value={expiryMode} onChange={(event) => setExpiryMode(event.target.value)}>
                    <option value="vencimento">Data de Vencimento</option>
                    <option value="sem">Sem expiração</option>
                  </select>
                </label>
                <label className="adv-field">
                  <span>
                    Data de Vencimento <em>*</em>
                  </span>
                  <input className="adv-control" type="date" value={due} disabled={expiryMode !== 'vencimento'} onChange={(event) => setDue(event.target.value)} />
                </label>
              </div>
            </div>
            <footer className="adv-modal-foot center">
              <button className="adv-btn adv-btn-secondary" type="button" onClick={() => setModal(null)}>
                Fechar
              </button>
              <button className="adv-btn adv-btn-primary" type="button" onClick={publish} disabled={amount <= 0 || (expiryMode === 'vencimento' && !due)}>
                Gerar link de pagamento
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {modal === 'share' && link ? (
        <div className="adv-overlay">
          <ShareModal
            link={link}
            componentId={componentId}
            onComponent={setComponentId}
            onClose={() => setModal(null)}
            onCopy={() => void copy(link.url)}
            onWhatsapp={() => setDialog('whatsapp')}
            onEmail={() => navigate('/email')}
            onSms={() => setToast('Mensagem de SMS pronta com o link de pagamento')}
            onApply={applyComponent}
            onCancel={() => setDialog('cancel')}
            onNew={() => openForm(link.amount)}
          />
        </div>
      ) : null}

      {dialog === 'whatsapp' ? (
        <div className="adv-dialog-layer">
          <section className="adv-dialog" role="dialog" aria-modal="true" aria-labelledby="wa-title">
            <header>
              <h2 id="wa-title">Enviar pelo WhatsApp Web</h2>
              <button className="adv-x" type="button" aria-label="Fechar" onClick={() => setDialog(null)}>
                ×
              </button>
            </header>
            <div className="body">
              Configure o template WorkNow para envio do link de pagamento por WhatsApp. Deseja abrir o WhatsApp Web com a mensagem do link de pagamento pronta para envio?
            </div>
            <footer>
              <button className="adv-btn adv-btn-secondary" type="button" onClick={() => setDialog(null)}>
                Cancelar
              </button>
              <button className="adv-btn adv-btn-primary" type="button" onClick={() => navigate('/whatsapp')}>
                Confirmar
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {dialog === 'cancel' && link ? (
        <div className="adv-dialog-layer">
          <section className="adv-dialog" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
            <header>
              <h2 id="cancel-title">Cancelar link de pagamento</h2>
            </header>
            <div className="body">
              <p>O link de pagamento da cobrança a seguir será cancelado:</p>
              <div className="adv-summary">
                <div>
                  <strong>{formatBRL(link.amount)}</strong>
                  <p>Link gerado em {link.createdLabel}</p>
                  <p>Data de expiração em {link.dueLabel}</p>
                </div>
                <div>
                  <span className={`adv-status${link.status === 'paid' ? ' is-paid' : ''}${link.status === 'cancelled' ? ' is-cancelled' : ''}`}>
                    <i />
                    {statusText(link.status)}
                  </span>
                  <div className="adv-summary-icons" style={{ marginTop: 12 }}>
                    <button className="adv-round" type="button" aria-label="Copiar link" onClick={() => void copy(link.url)}>
                      <CopyIcon />
                    </button>
                    <button className="adv-round wa" type="button" aria-label="WhatsApp" onClick={() => setDialog('whatsapp')}>
                      <WhatsIcon />
                    </button>
                    <button className="adv-round" type="button" aria-label="E-mail" onClick={() => navigate('/email')}>
                      <MailIcon />
                    </button>
                    <button className="adv-round" type="button" aria-label="SMS" onClick={() => setToast('Mensagem de SMS pronta com o link de pagamento')}>
                      <SmsIcon />
                    </button>
                  </div>
                </div>
              </div>
              <p>
                Após o cancelamento, a cobrança não ficará mais disponível para pagamento no sistema.
                <br />
                <strong>Você tem certeza que deseja cancelar?</strong>
              </p>
            </div>
            <footer>
              <button className="adv-btn adv-btn-secondary" type="button" onClick={() => setDialog(null)}>
                Fechar
              </button>
              <button
                className="adv-btn adv-btn-danger"
                type="button"
                onClick={() => {
                  cancel()
                  openForm()
                  setToast('Link de pagamento cancelado')
                }}
              >
                Sim, cancelar link de pagamento
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {toast ? <div className="adv-toast">{toast}</div> : null}
      <FlowNav />
    </div>
  )
}

function ShareModal({
  link,
  componentId,
  onComponent,
  onClose,
  onCopy,
  onWhatsapp,
  onEmail,
  onSms,
  onApply,
  onCancel,
  onNew,
}: {
  link: AdvanceLink
  componentId: string
  onComponent: (id: string) => void
  onClose: () => void
  onCopy: () => void
  onWhatsapp: () => void
  onEmail: () => void
  onSms: () => void
  onApply: () => void
  onCancel: () => void
  onNew: () => void
}) {
  const qr = qrDemo
  return (
    <section className="adv-modal" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <header>
        <h2 id="share-title">Adiantamento</h2>
      </header>
      <div className="adv-modal-body">
        <div className="adv-success">
          <p>Geramos um link de pagamento de</p>
          <strong>{formatBRL(link.amount)}</strong>
          <p>Compartilhe para cobrar!</p>
          <div>
            Status:{' '}
            <span className={`adv-status${link.status === 'paid' ? ' is-paid' : ''}${link.status === 'cancelled' ? ' is-cancelled' : ''}`}>
              <i />
              {statusText(link.status)}
            </span>
          </div>
        </div>

        <div className="adv-link-label">
          Link gerado <InfoIcon />
        </div>
        <div className="adv-link-row">
          <div>
            <div className="adv-link-box">
              <span>{link.url}</span>
            </div>
            <button className="adv-btn adv-btn-outline adv-btn-block" type="button" onClick={onCopy}>
              <CopyIcon /> Copiar link
            </button>
            <div className="adv-share-actions" style={{ marginTop: 8 }}>
              <button className="adv-btn adv-btn-wa" type="button" onClick={onWhatsapp}>
                <WhatsIcon /> WhatsApp
              </button>
              <button className="adv-btn adv-btn-outline" type="button" onClick={onEmail}>
                <MailIcon /> E-mail
              </button>
              <button className="adv-btn adv-btn-outline" type="button" onClick={onSms}>
                <SmsIcon /> SMS
              </button>
            </div>
          </div>
          <img className="adv-qr" src={qr} alt="QR Code do link de pagamento" />
        </div>

        <section className="adv-panel">
          <h3>Informações do link de pagamento</h3>
          <p>
            <strong>Cobrança criada:</strong> {link.createdLabel}
          </p>
          <p>
            <strong>Data de expiração:</strong> {link.dueLabel}
          </p>
        </section>

        <section className="adv-panel">
          <h3>Onde deseja abater o adiantamento?</h3>
          <p className="adv-help">Selecione um componente de entrada com saldo suficiente.</p>
          {ENTRY_COMPONENTS.map((item) => {
            const short = link.amount > item.balance || link.status === 'cancelled'
            return (
              <button key={item.id} className="adv-choice" type="button" disabled={short} onClick={() => onComponent(item.id)}>
                <input type="radio" readOnly checked={componentId === item.id} disabled={short} />
                <span>
                  {item.name}
                  {link.amount > item.balance ? <small>Saldo insuficiente</small> : null}
                </span>
                <b>
                  <span>Saldo disponível</span>
                  {formatBRL(item.balance)}
                </b>
              </button>
            )
          })}
          <button className="adv-btn adv-btn-outline adv-btn-block" type="button" onClick={onApply}>
            Aplicar adiantamento no componente
          </button>
          {link.status === 'waiting' ? (
            <div className="adv-split">
              <button className="adv-btn adv-btn-danger-outline" type="button" onClick={onCancel}>
                <InfoIcon /> Cancelar adiantamento
              </button>
              <button className="adv-btn adv-btn-outline" type="button" onClick={onNew}>
                <RefreshIcon /> Gerar novo link de pagamento
              </button>
            </div>
          ) : (
            <button className="adv-btn adv-btn-outline adv-btn-block" type="button" onClick={onNew} style={{ marginTop: 8 }}>
              <RefreshIcon /> Gerar novo link de pagamento
            </button>
          )}
        </section>
      </div>
      <footer className="adv-modal-foot">
        <button className="adv-btn adv-btn-secondary" type="button" onClick={onClose}>
          Fechar
        </button>
      </footer>
    </section>
  )
}

function statusText(status: AdvanceLink['status']) {
  if (status === 'paid') return 'Pago'
  if (status === 'cancelled') return 'Cancelado'
  return 'Aguardando pagamento'
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 7.2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="4.6" r="0.8" fill="currentColor" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 11H3.5A1.5 1.5 0 0 1 2 9.5v-6A1.5 1.5 0 0 1 3.5 2h6A1.5 1.5 0 0 1 11 3.5V4" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function WhatsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path
        fill="currentColor"
        d="M8.1 2.2A5.7 5.7 0 0 0 3.2 11.6L2.4 14l2.5-.7A5.7 5.7 0 1 0 8.1 2.2Zm3.3 8.1c-.1.4-.8.7-1.1.8-.3 0-.6.1-2-.5-1.6-.8-2.6-2.3-2.7-2.4-.1-.1-.8-1-.8-1.9s.5-1.3.7-1.5.4-.2.5-.2h.4c.1 0 .3 0 .4.3.2.4.6 1.4.6 1.5.1.1 0 .2 0 .3l-.2.3-.3.3c-.1.1-.2.2-.1.4.1.2.5.8 1.1 1.3.7.6 1.3.8 1.5.9.2.1.3.1.4 0l.5-.6c.1-.2.3-.1.4-.1h.4c.2 0 .4.1.5.3.1.4.4 1.2.2 1.4Z"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <rect x="2" y="3.5" width="12" height="9" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 5l5 4 5-4" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function SmsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <rect x="4" y="2" width="8" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 11.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d="M13 8a5 5 0 1 1-1.4-3.4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12 2.5V5H9.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function LineIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="4" />
      <path d="M2 20c0-8 14-8 14 0M16 4c6 0 6 8 0 8m2 3c3 0 5 2 5 5" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3h10l4 4v14H5zM14 3v5h5M9 12h6m-6 4h6" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 3 1-2h4l1 3 3 1 3-1 2 4-2 2v4l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-4L1 8l2-4 3 1z" transform="translate(2 2) scale(.83)" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

