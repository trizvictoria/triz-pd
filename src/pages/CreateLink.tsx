import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Button, Field, Input, Modal, Select, Tooltip, TrashIcon } from '../components/ui'
import { newItem, useStore } from '../context/Store'
import { formatBRL, type LinkItem, type LinkType, type PaymentLink } from '../data/mock'

export function CreateLinkPage() {
  const navigate = useNavigate()
  const { addLink, notify } = useStore()
  const [tab, setTab] = useState<'itens' | 'config'>('itens')
  const [name, setName] = useState('Abril – EF – Turma B Noturno')
  const [description, setDescription] = useState('Link de pagamento para a turma de Abril')
  const [type, setType] = useState<LinkType>('unico')
  const [typeOpen, setTypeOpen] = useState(false)
  const typeRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<LinkItem[]>([
    { id: 'seed-1', name: 'Ensino fundamental', description: 'Cobrança mensal do ano letivo', unitPrice: 3000, quantity: 1 },
  ])
  const [credit, setCredit] = useState(true)
  const [pix, setPix] = useState(true)
  const [boleto, setBoleto] = useState(true)
  const [installments, setInstallments] = useState('1x')
  const [pixDays, setPixDays] = useState('5')
  const [boletoDue, setBoletoDue] = useState('2026-10-10')
  const [interest, setInterest] = useState('Sem juros')
  const [fine, setFine] = useState('Sem multa')
  const [dueAt, setDueAt] = useState('')
  const [noDue, setNoDue] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [created, setCreated] = useState<PaymentLink | null>(null)

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0), 0),
    [items],
  )
  const canPublish = Boolean(name && items[0]?.name && items[0]?.unitPrice)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!typeRef.current?.contains(event.target as Node)) setTypeOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function patchItem(id: string, patch: Partial<LinkItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function publish() {
    const link: PaymentLink = {
      id: crypto.randomUUID(),
      name,
      description,
      status: 'ativo',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      dueAt: noDue || !dueAt ? null : new Date(dueAt).toLocaleDateString('pt-BR'),
      type,
      url: `https://totvspay.com/l/${crypto.randomUUID().slice(0, 8)}`,
      items,
      payments: [],
      methods: { credit, pix, boleto },
      installments,
    }
    addLink(link)
    setCreated(link)
    setConfirmOpen(false)
    setShareOpen(true)
    notify('Link de pagamento criado')
  }

  return (
    <AppShell>
      <div className="workspace-inner">
        <p className="page-kicker">Links de pagamentos</p>
        <div className="page-header">
          <div className="page-header-main">
            <Link to="/links" className="back-btn" aria-label="Voltar para links">
              ←
            </Link>
            <h1 className="page-title">
              {tab === 'config' ? 'Gerenciar configurações para este link de pagamento' : 'Criar link de pagamento'}
            </h1>
          </div>
          <Button type="button" disabled={!canPublish} onClick={() => (tab === 'itens' ? setConfirmOpen(true) : publish())}>
            {tab === 'config' ? 'Publicar link' : 'Criar link de pagamento'}
          </Button>
        </div>
        <div className="tabs">
          <button className={`tab${tab === 'itens' ? ' active' : ''}`} onClick={() => setTab('itens')}>
            Itens do pagamento
          </button>
          <button className={`tab${tab === 'config' ? ' active' : ''}`} onClick={() => setTab('config')}>
            Configurações de pagamento
          </button>
        </div>

        {tab === 'itens' ? (
          <>
            <article className="card" style={{ marginBottom: 16 }}>
              <h3>Dê um nome para o seu link de pagamento</h3>
              <div className="grid-3">
                <Field label="Nome" required>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Isso é um placeholder" />
                </Field>
                <Field label="Descrição">
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Isso é um placeholder" />
                </Field>
                <Field label="Tipo de link">
                  <div className="type-select" ref={typeRef}>
                    <button
                      type="button"
                      className="control type-select-trigger"
                      aria-haspopup="listbox"
                      aria-expanded={typeOpen}
                      onClick={() => setTypeOpen((open) => !open)}
                    >
                      Único
                    </button>
                    {typeOpen ? (
                      <ul className="type-select-menu" role="listbox">
                        <li>
                          <button
                            type="button"
                            role="option"
                            aria-selected={type === 'unico'}
                            className="type-select-option"
                            onClick={() => {
                              setType('unico')
                              setTypeOpen(false)
                            }}
                          >
                            Único
                          </button>
                        </li>
                        <li>
                          <Tooltip text="em breve" placement="right">
                            <button type="button" role="option" aria-disabled="true" className="type-select-option is-disabled">
                              Reutilizável
                            </button>
                          </Tooltip>
                        </li>
                      </ul>
                    ) : null}
                  </div>
                </Field>
              </div>
            </article>
            <article className="card" style={{ marginBottom: 16 }}>
              <h3>Adicionar itens ao link</h3>
              {items.map((item, index) => (
                <div className="item-card" key={item.id}>
                  <Field label="Nome" required>
                    <Input value={item.name} onChange={(e) => patchItem(item.id, { name: e.target.value })} />
                  </Field>
                  <Field label="Descrição">
                    <Input value={item.description} onChange={(e) => patchItem(item.id, { description: e.target.value })} />
                  </Field>
                  <Field label="Preço unitário" required>
                    <div className="control-prefix">
                      <span>R$</span>
                      <Input
                        inputMode="decimal"
                        value={item.unitPrice || ''}
                        onChange={(e) => patchItem(item.id, { unitPrice: Number(e.target.value.replace(/\D/g, '')) })}
                        placeholder="0,00"
                      />
                    </div>
                  </Field>
                  <Field label="Quantidade" required>
                    <Input
                      inputMode="numeric"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => patchItem(item.id, { quantity: Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1) })}
                    />
                  </Field>
                  {index > 0 ? (
                    <button className="btn btn-icon" type="button" onClick={() => setItems(items.filter((row) => row.id !== item.id))} aria-label="Remover item">
                      <TrashIcon />
                    </button>
                  ) : (
                    <span className="item-spacer" />
                  )}
                </div>
              ))}
              <Button variant="secondary" type="button" onClick={() => setItems([...items, newItem()])}>
                Adicionar novo item
              </Button>
            </article>
            <article className="card">
              <h3>Total</h3>
              <div className="total-list">
              {items.map((item) => (
                <div key={item.id} className="total-row">
                  <span>
                    {item.quantity}x {formatBRL(item.unitPrice)}
                  </span>
                  <span>{formatBRL(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
              <div className="total-row total-row-strong">
                <span>Total:</span>
                <span>{formatBRL(total)}</span>
              </div>
              </div>
            </article>
          </>
        ) : (
          <>
            <article className="card" style={{ marginBottom: 16 }}>
              <h3>Métodos de pagamento aceitos</h3>
              <label className="toggle">
                <input type="checkbox" checked={credit} onChange={(e) => setCredit(e.target.checked)} />
                Cartão de crédito
              </label>
              {credit ? (
                <div className="nested">
                  <Field label="Número de parcelas">
                    <Select value={installments} onChange={(e) => setInstallments(e.target.value)}>
                      {['1x', '2x', '3x', '6x', '12x'].map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
              ) : null}
              <label className="toggle">
                <input type="checkbox" checked={pix} onChange={(e) => setPix(e.target.checked)} />
                Pix
              </label>
              {pix ? (
                <div className="nested grid-2">
                  <Field label="Validade">
                    <Input value={pixDays} onChange={(e) => setPixDays(e.target.value)} />
                  </Field>
                  <Field label="Unidade">
                    <Select defaultValue="Dias">
                      <option>Dias</option>
                      <option>Horas</option>
                    </Select>
                  </Field>
                </div>
              ) : null}
              <label className="toggle">
                <input type="checkbox" checked={boleto} onChange={(e) => setBoleto(e.target.checked)} />
                Boleto bancário
              </label>
              {boleto ? (
                <div className="nested">
                  <Field label="Vencimento">
                    <Input type="date" value={boletoDue} onChange={(e) => setBoletoDue(e.target.value)} />
                  </Field>
                  <Field label="Juros">
                    <Select value={interest} onChange={(e) => setInterest(e.target.value)}>
                      <option>Sem juros</option>
                      <option>1% ao mês</option>
                    </Select>
                  </Field>
                  <Field label="Multa">
                    <Select value={fine} onChange={(e) => setFine(e.target.value)}>
                      <option>Sem multa</option>
                      <option>2%</option>
                    </Select>
                  </Field>
                </div>
              ) : null}
            </article>
            <article className="card">
              <h3>Vencimento do link</h3>
              <Field label="Data">
                <Input type="date" value={dueAt} disabled={noDue} onChange={(e) => setDueAt(e.target.value)} />
              </Field>
              <label className="toggle" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={noDue} onChange={(e) => setNoDue(e.target.checked)} />
                Não tem vencimento
              </label>
            </article>
          </>
        )}
      </div>

      {confirmOpen ? (
        <Modal title="Deseja revisitar as configurações do seu link?" onClose={() => setConfirmOpen(false)}>
          <p>
            Ao salvar sem ajustes as configurações irão no modelo padrão onde todos os métodos de pagamentos estão ativos,
            sem parcelas, sem juros, sem multa e com vencimento do link e do boleto no período de um mês.
          </p>
          <div className="form-actions">
            <Button variant="secondary" type="button" onClick={publish}>
              Criar link de pagamento
            </Button>
            <Button
              type="button"
              onClick={() => {
                setConfirmOpen(false)
                setTab('config')
              }}
            >
              Configurar link
            </Button>
          </div>
        </Modal>
      ) : null}

      {shareOpen && created ? (
        <Modal
          kicker="Sua cobrança foi criada"
          title="Use seu link em suas estratégias"
          onClose={() => navigate(`/links/${created.id}`)}
        >
          <div className="share-url">
            <input className="control" readOnly value={created.url} />
            <button
              className="share-copy"
              type="button"
              aria-label="Copiar"
              onClick={() => {
                void navigator.clipboard?.writeText(created.url)
                notify('Link copiado')
              }}
            >
              <CopyIcon />
            </button>
          </div>
          <div className="form-actions">
            <Button type="button" onClick={() => navigate(`/links/${created.id}`)}>
              Ver link criado
            </Button>
          </div>
        </Modal>
      ) : null}
    </AppShell>
  )
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden>
      <rect x="5" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 11H3.5A1.5 1.5 0 0 1 2 9.5v-6A1.5 1.5 0 0 1 3.5 2h6A1.5 1.5 0 0 1 11 3.5V4" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

