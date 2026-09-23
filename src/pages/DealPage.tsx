import { useEffect, useState, type ReactNode } from 'react'
import { Button, Icon } from '../components/ui'
import { PaymentBlock, PaymentDrawer, PaymentLinkPill } from '../components/PaymentFlow'
import { DEAL, formatBRL, formatDateTime, type LinkStatus } from '../lib/deal'
import { usePayments } from '../state/payments'

const TABS = [
  'Histórico',
  'Email',
  'Tarefas',
  'Questionário',
  'Produtos e serviços',
  'Proposta',
  'Arquivos',
]

const FUNNEL = [
  { label: 'Entrada', days: '0 dias', tone: 'past' },
  { label: 'Qualificação', days: '0 dias', tone: 'past' },
  { label: 'Propostas', days: '0 dias', tone: 'past' },
  { label: 'Ajustes', days: '0 dias', tone: 'past' },
  { label: 'Negociação', days: '0 dias', tone: 'current' },
  { label: 'Documentação', days: '0 dias', tone: 'next' },
] as const

const EVENTS = [
  {
    id: 'change',
    kind: 'dot' as const,
    title: (
      <>
        <strong>Flávia</strong> alterou o responsável para Flávia
      </>
    ),
    at: '23/07/2026 17:18',
  },
  {
    id: 'created',
    kind: 'flag' as const,
    title: <strong>Negociação criada</strong>,
    at: '23/07/2026 17:15',
  },
]

export function DealPage() {
  const { links, copyUrl, focusHistory, consumeFocusHistory } = usePayments()
  const [tab, setTab] = useState('Histórico')

  useEffect(() => {
    if (!focusHistory) return
    setTab('Histórico')
    consumeFocusHistory()
  }, [focusHistory, consumeFocusHistory])

  const history = [
    ...links.flatMap((link) => {
      const created = {
        id: `link-${link.id}`,
        kind: 'dot' as const,
        title: (
          <>
            <strong>{DEAL.actor}</strong> criou um link de pagamento no valor de {formatBRL(link.totalCents)}
          </>
        ),
        at: formatDateTime(link.createdAt),
        status: link.status as LinkStatus,
        url: link.url,
      }
      if (!link.paid || !link.paidAt) return [created]
      return [
        {
          id: `paid-${link.id}`,
          kind: 'dot' as const,
          title: (
            <>
              <strong>{DEAL.actor}</strong> registrou o pagamento de {formatBRL(link.totalCents)} via link
            </>
          ),
          at: formatDateTime(link.paidAt),
          status: 'concluido' as LinkStatus,
        },
        created,
      ]
    }),
    ...EVENTS,
  ]

  return (
    <div className="deal">
      <header className="deal-header">
        <div className="deal-header__main">
          <Button kind="neutral" icon="arrow_back" iconOnly ariaLabel="Voltar" />
          <h1 className="deal-header__title">{DEAL.name}</h1>
          <div className="tg-group deal-header__actions">
            <Button kind="neutral" icon="more_vert" iconOnly ariaLabel="Mais ações" />
            <Button kind="secondary" icon="thumb_down">
              Marcar perda
            </Button>
            <Button kind="primary" icon="thumb_up">
              Marcar venda
            </Button>
          </div>
        </div>
        <div className="deal-tags">
          <span className="deal-tag deal-tag--cyan">EM ANDAMENTO</span>
          <span className="deal-tag">FECHAMENTO E FEEDBACK</span>
          <span className="deal-tag deal-tag--cyan">VENDA CERTA!</span>
        </div>
      </header>

      <ol className="funnel" aria-label="Etapas do funil">
        {FUNNEL.map((step, index) => (
          <li
            key={`${step.tone}-${index}`}
            className={`funnel-step funnel-step--${step.tone}${index === 0 ? ' is-first' : ''}${
              index === FUNNEL.length - 1 ? ' is-last' : ''
            }`}
          >
            {index > 0 ? <span className="funnel-step__tale" aria-hidden /> : null}
            <span className="funnel-step__info">
              <strong>{step.label}</strong>
              <span>({step.days})</span>
            </span>
            {index < FUNNEL.length - 1 ? <span className="funnel-step__nose" aria-hidden /> : null}
          </li>
        ))}
      </ol>

      <div className="deal-grid">
        <div className="deal-aside">
          <aside className="deal-sidebar">
            <Accordion title="Negociação" />
            <Accordion title="Contatos" />
            <Accordion title="Empresa" />
            <Accordion title="Responsável" />
          </aside>
          <PaymentBlock onViewHistory={() => setTab('Histórico')} />
        </div>

        <section className="deal-main">
          <div className="deal-tabs" role="tablist">
            {TABS.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                className={`deal-tab${tab === name ? ' is-active' : ''}`}
                aria-selected={tab === name}
                onClick={() => setTab(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="deal-feed">
          <div className="deal-toolbar">
            <div className="deal-filters">
              <FilterSelect label="Do" value="RD Station CRM" options={['RD Station CRM']} />
              <FilterSelect label="Exibir" value="Todos os eventos" options={['Todos os eventos']} />
            </div>
            <Button kind="secondary" icon="add">
              Criar anotação
            </Button>
          </div>
          <div className="timeline">
            {history.map((event, index) => (
              <article className="timeline-item" key={event.id}>
                <div className="timeline-rail">
                  {event.kind === 'flag' ? (
                    <span className="timeline-flag" aria-hidden>
                      <Icon name="flag" size={24} />
                    </span>
                  ) : (
                    <span className="timeline-dot" />
                  )}
                  {index < history.length - 1 ? <span className="timeline-line" /> : null}
                </div>
                <div className="timeline-content">
                  <p>{event.title}</p>
                  <div className="timeline-meta">
                    <time>{event.at}</time>
                    {'status' in event && event.status ? (
                      <PaymentLinkPill
                        status={event.status}
                        onCopy={() => void copyUrl('url' in event ? event.url : undefined)}
                      />
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
          </div>
        </section>
      </div>
      <PaymentDrawer />
    </div>
  )
}

function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children?: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="deal-acc">
      <button type="button" className="deal-acc__head" onClick={() => setOpen((value) => !value)}>
        <span className="deal-acc__title">{title}</span>
        <Icon name={open ? 'expand_less' : 'expand_more'} />
      </button>
      {open && children ? <div className="deal-acc__body">{children}</div> : null}
    </section>
  )
}

function FilterSelect({
  label,
  value,
  options,
}: {
  label: string
  value: string
  options: string[]
}) {
  return (
    <label className="deal-filter">
      <span>{label}</span>
      <span className="tg-input deal-filter__control">
        <select defaultValue={value} aria-label={label}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}
