import { useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { Button, Field, Icon, Message, SelectField, Switch } from './ui'
import {
  LINK_STATUS,
  formatBRL,
  formatDate,
  formatDateTime,
  formatReaisInput,
  formatTotal,
  parseReais,
  type LinkStatus,
} from '../lib/deal'
import { usePayments } from '../state/payments'

export function PaymentLinkPill({
  status,
  onCopy,
}: {
  status: LinkStatus
  onCopy?: () => void
}) {
  const meta = LINK_STATUS[status]
  const className = `pay-pill pay-pill--${status}`
  const body = (
    <>
      <Icon name={meta.icon} size={16} />
      {meta.label}
    </>
  )

  if (status === 'ativo' && onCopy) {
    return (
      <button
        type="button"
        className={className}
        onClick={(event: MouseEvent) => {
          event.stopPropagation()
          onCopy()
        }}
      >
        {body}
      </button>
    )
  }

  return <span className={className}>{body}</span>
}

export function PaymentBlock({ onViewHistory }: { onViewHistory?: () => void }) {
  const { visibleLinks, openCreate, openLink, openCheckout, copyUrl } = usePayments()
  const firstActive = visibleLinks.find((link) => link.status === 'ativo')

  return (
    <section className="pay-block">
      <div className="deal-acc__head">
        <h2 className="deal-acc__title">Pagamentos</h2>
        {visibleLinks.length > 0 ? <span className="pay-badge">{visibleLinks.length}</span> : null}
        <Icon name="expand_less" />
      </div>
      {visibleLinks.length === 0 ? (
        <p className="pay-empty">
          Não há links de pagamentos na negociação, clique no botão abaixo para criar um link
        </p>
      ) : (
        <ul className="pay-list">
          {visibleLinks.map((link) => (
            <li key={link.id} className="pay-row">
              <button
                type="button"
                className="pay-row__open"
                onClick={() => (link.id === firstActive?.id ? openCheckout(link.id) : openLink(link.id))}
              >
                <span className="pay-row__prefix">
                  <time>{formatDateTime(link.createdAt)}</time>
                  <span className="pay-row__value">{formatBRL(link.totalCents)}</span>
                </span>
              </button>
              <PaymentLinkPill
                status={link.status}
                onCopy={() => (link.id === firstActive?.id ? openCheckout(link.id) : copyUrl(link.url))}
              />
            </li>
          ))}
        </ul>
      )}
      <Button kind="secondary" icon="add" onClick={openCreate}>
        Criar link de pagamento
      </Button>
      {visibleLinks.length > 0 ? (
        <Button kind="tertiary" onClick={onViewHistory}>
          Ver histórico de pagamentos
        </Button>
      ) : null}
    </section>
  )
}

export function PaymentDrawer() {
  const { drawer, closeDrawer, toast, dismissToast } = usePayments()

  const overlay =
    drawer !== 'closed' ? (
      <>
        <button type="button" className="drawer-scrim" aria-label="Fechar" onClick={closeDrawer} />
        <aside className="drawer" role="dialog" aria-labelledby="payment-drawer-title">
          <header className="drawer-header">
            <h2 id="payment-drawer-title">Link de pagamento</h2>
            <Button kind="neutral" icon="close" iconOnly ariaLabel="Fechar" onClick={closeDrawer} />
          </header>
          {drawer === 'create' ? <CreateForm /> : <ReadyState />}
        </aside>
      </>
    ) : null

  return (
    <>
      {overlay ? createPortal(overlay, document.body) : null}
      {toast && drawer === 'closed' ? (
        <div className="toast" role="status">
          <span className="toast__icon">
            <Icon name="check_circle" />
          </span>
          <div className="toast__content">
            <p className="toast__title">{toast.title}</p>
            {toast.description ? <p className="toast__description">{toast.description}</p> : null}
          </div>
          <Button kind="neutral" icon="close" iconOnly ariaLabel="Fechar aviso" onClick={dismissToast} />
        </div>
      ) : null}
    </>
  )
}

function CreateForm() {
  const { draft, setDraft, canCreate, createLink, closeDrawer, updateItem, addItem, removeItem } =
    usePayments()
  const [totalOpen, setTotalOpen] = useState(false)
  const breakdown = draft.specifyItems
    ? draft.items.filter((item) => item.name.trim() || item.unitCents > 0)
    : draft.totalCents > 0 || draft.description.trim()
      ? [
          {
            id: 'simple',
            name: draft.description.trim() || 'Valor do link',
            quantity: 1,
            unitCents: draft.totalCents,
          },
        ]
      : []

  return (
    <>
      <div className="drawer-body">
        <div className="drawer-form">
          <Field
            label="Nome"
            required
            value={draft.name}
            onChange={(name) => setDraft({ name })}
          />
          <Field
            label="Descrição"
            required
            placeholder="Insira a descrição do pagamento"
            value={draft.description}
            onChange={(description) => setDraft({ description })}
          />
          <div>
            <Field
              label="Valor total"
              required
              prefix={draft.specifyItems ? undefined : 'R$'}
              placeholder={
                draft.specifyItems ? 'Cadastre os itens para obter a soma total' : '00,00'
              }
              value={formatReaisInput(draft.totalCents)}
              disabled={draft.specifyItems}
              inputMode="decimal"
              onChange={(value) => setDraft({ totalCents: parseReais(value) })}
            />
            <div style={{ marginTop: 24 }}>
              <Switch
                label="Especificar itens"
                checked={draft.specifyItems}
                onChange={(specifyItems) => setDraft({ specifyItems })}
              />
            </div>
          </div>
          {draft.specifyItems ? (
            <section>
              <div className="items-head">
                <h3>Produtos e serviços do link</h3>
                <Button kind="tertiary" icon="add" onClick={addItem}>
                  Adicionar novo item
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                {draft.items.map((item) => (
                  <article className="item-card" key={item.id}>
                    <div className="item-card__fields">
                      <Field
                        id={`item-name-${item.id}`}
                        label="Nome"
                        required
                        placeholder="Insira o nome do item"
                        value={item.name}
                        onChange={(name) => updateItem(item.id, { name })}
                      />
                      <div className="item-card__row">
                        <Field
                          id={`item-price-${item.id}`}
                          label="Preço unitário"
                          required
                          prefix="R$"
                          placeholder="00,00"
                          value={formatReaisInput(item.unitCents)}
                          inputMode="decimal"
                          onChange={(value) => updateItem(item.id, { unitCents: parseReais(value) })}
                        />
                        <SelectField
                          id={`item-qty-${item.id}`}
                          label="Quantidade"
                          required
                          value={String(item.quantity)}
                          options={Array.from({ length: 20 }, (_, index) => String(index + 1))}
                          onChange={(value) => updateItem(item.id, { quantity: Number(value) })}
                        />
                      </div>
                    </div>
                    <Button
                      kind="neutral"
                      icon="delete"
                      iconOnly
                      ariaLabel="Excluir item"
                      disabled={draft.items.length === 1}
                      onClick={() => removeItem(item.id)}
                    />
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <button
          type="button"
          className={`total-card${totalOpen ? ' is-open' : ''}`}
          onClick={() => setTotalOpen((value) => !value)}
          aria-expanded={totalOpen}
        >
          <div className="total-card__head">
            <strong>Total</strong>
            <span className="total-card__amount">{formatTotal(draft.totalCents)}</span>
            <span className={`chevron${totalOpen ? '' : ' is-up'}`} aria-hidden />
          </div>
          {totalOpen ? (
            <div className="total-card__body">
              <span className="total-card__divider" />
              {breakdown.length === 0 ? null : (
                <ul className="total-card__items">
                  {breakdown.map((item) => (
                    <li key={item.id}>
                      <span>{item.name || 'Item sem nome'}</span>
                      <span>
                        {item.quantity}x {formatBRL(item.unitCents)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </button>
      </div>
      <footer className="drawer-actions">
        <div className="tg-group">
          <Button kind="secondary" onClick={closeDrawer}>
            Cancelar
          </Button>
          <Button kind="primary" disabled={!canCreate} onClick={createLink}>
            Criar link
          </Button>
        </div>
      </footer>
    </>
  )
}

function ReadyState() {
  const { activeLink, closeDrawer, copyUrl } = usePayments()
  if (!activeLink) return null

  return (
    <>
      <div className="drawer-body">
        <div className="ready-stack">
          <Message title="Configurações de pagamento">
            Métodos de pagamento aceitos, validade do link e número de parcelas são determinados por
            Administradores na TOTVSPay.{' '}
            <button type="button">Saiba mais</button>
          </Message>
          <section className="ready-card">
            <h3 className="ready-title">
              <Icon name="check_circle" />
              Link de pagamento pronto!
            </h3>
            <dl className="ready-block">
              <dt>Nome</dt>
              <dd>{activeLink.name}</dd>
            </dl>
            <dl className="ready-block">
              <dt>Descrição</dt>
              <dd style={{ color: 'var(--neutral-text-low-emphasis)' }}>{activeLink.description}</dd>
            </dl>
            <div className="ready-grid">
              <dl className="ready-block">
                <dt>Valor total</dt>
                <dd>{formatBRL(activeLink.totalCents)}</dd>
              </dl>
              <dl className="ready-block">
                <dt>Data de criação</dt>
                <dd>{formatDate(activeLink.createdAt)}</dd>
              </dl>
              <dl className="ready-block">
                <dt>Data de expiração</dt>
                <dd>{formatDate(activeLink.expiresAt)}</dd>
              </dl>
            </div>
            <div className="ready-link">
              <Field label="Link" value={activeLink.url} disabled />
              <Button kind="secondary" icon="content_copy" iconOnly ariaLabel="Copiar link" onClick={() => copyUrl()} />
            </div>
            <div className="ready-items">
              <strong>Itens no link</strong>
              {activeLink.items.map((item) => (
                <div className="ready-item" key={item.id}>
                  <span>{item.name}</span>
                  <span>
                    {item.quantity}x {formatBRL(item.unitCents)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <footer className="drawer-actions">
        <div className="tg-group">
          <Button kind="secondary" onClick={closeDrawer}>
            Fechar
          </Button>
          <Button kind="primary" onClick={() => copyUrl()}>
            Copiar link
          </Button>
        </div>
      </footer>
    </>
  )
}
