import { useEffect, useRef, useState, type ReactNode } from 'react'
import { goExperience, type ExperienceTarget } from '../lib/experience'

function Icon({ d, size = 22 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={d} fill="currentColor" />
    </svg>
  )
}

const ICONS = {
  menu: 'M4 6.5h16v1.6H4V6.5Zm0 5.2h16v1.6H4v-1.6Zm0 5.2h16V18.5H4V16.9Z',
  monitor: 'M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6v2h3v1.5H7V18h3v-2H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  calendar: 'M7 3.5h1.5V5H15.5V3.5H17V5h1.2A1.8 1.8 0 0 1 20 6.8v11.4A1.8 1.8 0 0 1 18.2 20H5.8A1.8 1.8 0 0 1 4 18.2V6.8A1.8 1.8 0 0 1 5.8 5H7V3.5ZM5.6 9v9.1c0 .2.1.3.3.3h12.2c.2 0 .3-.1.3-.3V9H5.6Z',
  people: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6.2.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM4.2 18.2c.4-2.4 2.4-3.7 4.8-3.7s4.4 1.3 4.8 3.7V19H4.2v-.8Zm8.3-.3c-.2-1.5-1.1-2.4-2.4-2.8 1.2-.3 2.6.1 3.5 1.1.7.8 1 1.7 1.1 2.6h-2.2v-.9Z',
  grid: 'M4 4h6.2v6.2H4V4Zm9.8 0H20v6.2h-6.2V4ZM4 13.8h6.2V20H4v-6.2Zm9.8 0H20V20h-6.2v-6.2Z',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.8 8.3 3.2 1.9-.8 1.3-4-2.4V7h1.6v5.3Z',
  person: 'M12 12.2a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8ZM6.2 18.6c.6-2.6 2.8-4 5.8-4s5.2 1.4 5.8 4v1.2H6.2v-1.2Z',
  grad: 'M12 4.5 3 8.8l9 4.3 7.2-3.4V15h1.6V8.8L12 4.5Zm0 10.2L6.2 11.9v2.4c0 1.8 2.6 3.4 5.8 3.4s5.8-1.6 5.8-3.4v-2.4L12 14.7Z',
  board: 'M6 4h12a1 1 0 0 1 1 1v14l-3-1.6L13 19l-3-1.6L7 19V5a1 1 0 0 1-1-1Zm2.2 3.2h7.6V8.8H8.2V7.2Zm0 3.2h7.6v1.6H8.2v-1.6Z',
  bulb: 'M12 3.5a5.2 5.2 0 0 0-2.6 9.6c.4.3.6.8.6 1.3v.6h4v-.6c0-.5.2-1 .6-1.3A5.2 5.2 0 0 0 12 3.5ZM10 16.4h4V18h-4v-1.6Zm.4 2.2h3.2v1.2h-3.2v-1.2Z',
  mail: 'M4 6.5h16v11H4v-11Zm1.6 1.6v.4l6.4 4 6.4-4v-.4H5.6Zm12.8 2.2-6.4 4-6.4-4V16h12.8V10.3Z',
  dollar: 'M12.8 6.2V5h-1.6v1.2c-1.8.2-3 1.2-3 2.8 0 1.8 1.3 2.5 3.2 2.9l.8.2c1 .2 1.4.5 1.4 1.1 0 .7-.6 1.1-1.6 1.1-1 0-1.7-.4-1.9-1.1l-1.5.5c.4 1.4 1.6 2.2 3.4 2.4V17h1.6v-1.1c1.9-.3 3.1-1.4 3.1-3 0-1.9-1.3-2.6-3.3-3l-.8-.2c-.9-.2-1.3-.5-1.3-1 0-.6.6-1 1.5-1 .9 0 1.5.4 1.7 1l1.5-.5c-.3-1.3-1.4-2-3.2-2.2Z',
  chat: 'M5 6.2h14v9.2H9.2L5 18.2v-12Zm1.6 1.6v7.2l2.2-1.6H17.4V7.8H6.6Z',
  help: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 12.2a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Zm1.5-4.6-.6.4c-.2.2-.3.4-.3.8h-1.5v-.2c0-.8.3-1.3 1.1-1.8l.5-.4c.4-.3.6-.6.6-1 0-.6-.5-1.1-1.3-1.1-.8 0-1.3.4-1.5 1.1L9.1 9.1C9.5 7.8 10.6 7 12 7c1.7 0 2.9 1 2.9 2.5 0 .8-.4 1.5-1.4 2.1Z',
  search: 'M10.2 4.5a5.7 5.7 0 0 1 4.5 9.2l3.6 3.6-1.1 1.1-3.6-3.6A5.7 5.7 0 1 1 10.2 4.5Zm0 1.6a4.1 4.1 0 1 0 0 8.2 4.1 4.1 0 0 0 0-8.2Z',
  caret: 'M8.2 10.2 12 14l3.8-3.8 1.1 1.1L12 16.2 7.1 11.3l1.1-1.1Z',
}

export type EduJourney = 'card' | 'all'

const JOURNEYS: Array<{ id: EduJourney; label: string }> = [
  { id: 'card', label: 'Só cartão' },
  { id: 'all', label: 'Todos os meios de pagamento' },
]

const EXPERIENCES: Array<{ type: 'item'; id: ExperienceTarget; label: string } | { type: 'sep'; id: string } | { type: 'soon'; id: string; label: string }> = [
  { type: 'item', id: 'totvs-credenciamento', label: 'TOTVS Pay - Credenciamento' },
  { type: 'item', id: 'totvs-dashboard', label: 'TOTVS Pay - Dashboard' },
  { type: 'sep', id: 'sep-1' },
  { type: 'item', id: 'rd', label: 'RD Vendas' },
  { type: 'sep', id: 'sep-2' },
  { type: 'item', id: 'construcao', label: 'Construção' },
  { type: 'item', id: 'educacional', label: 'Educacional' },
  { type: 'item', id: 'winthor', label: 'Winthor' },
  { type: 'sep', id: 'sep-3' },
  { type: 'item', id: 'suri', label: 'Suri Shop' },
  { type: 'sep', id: 'sep-4' },
  { type: 'item', id: 'checkout', label: 'Checkout' },
]

export function PortalShell({
  journey,
  onJourney,
  children,
}: {
  journey: EduJourney
  onJourney: (journey: EduJourney) => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  const products = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open && !productsOpen) return
    function onDoc(event: MouseEvent) {
      const target = event.target as Node
      if (open && menu.current && !menu.current.contains(target)) setOpen(false)
      if (productsOpen && products.current && !products.current.contains(target)) setProductsOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setProductsOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, productsOpen])

  return (
    <div className="edu">
      <header className="edu-header">
        <div className="edu-topbar">
          <div className="edu-experiences" ref={products}>
            <span>Grupo Pensando Juntos</span>
            <button
              type="button"
              className="edu-experiences__toggle"
              data-edu-experiences=""
              aria-haspopup="menu"
              aria-expanded={productsOpen}
              aria-label="Trocar produto"
              onClick={() => setProductsOpen((value) => !value)}
            >
              <Icon d={ICONS.caret} size={16} />
            </button>
            {productsOpen ? (
              <div className="edu-experiences__menu" role="menu">
                <p className="edu-experiences__label">Produtos</p>
                {EXPERIENCES.map((item) => {
                  if (item.type === 'sep') return <span className="edu-experiences__sep" key={item.id} />
                  if (item.type === 'soon') {
                    return (
                      <button key={item.id} type="button" className="edu-experiences__item is-disabled" disabled role="menuitem">
                        {item.label}
                      </button>
                    )
                  }
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="edu-experiences__item"
                      role="menuitem"
                      onClick={() => {
                        setProductsOpen(false)
                        goExperience(item.id)
                      }}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
          <span className="edu-topbar__rule" />
          <span>DIREITO</span>
          <span className="edu-topbar__rule" />
          <span className="edu-topbar__user">
            WAISMAN B (RA: WAISMAN)
            <span className="edu-avatar" aria-hidden>
              <Icon d={ICONS.person} size={16} />
            </span>
            <Icon d={ICONS.caret} size={16} />
          </span>
        </div>
        <div className="edu-brandbar">
          <div className="edu-logo-switch" ref={menu}>
            <div className="edu-logo">
              <span className="edu-logo__mark" aria-hidden>
                P
              </span>
              <span className="edu-logo__word">PENSANDOJUNTOS</span>
            </div>
            <button
              type="button"
              className="edu-logo-switch__toggle"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Trocar jornada de pagamento"
              onClick={() => setOpen((value) => !value)}
            >
              <Icon d={ICONS.caret} size={22} />
            </button>
            {open ? (
              <div className="edu-logo-switch__menu" role="menu">
                <p className="edu-logo-switch__label">Jornada</p>
                {JOURNEYS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`edu-logo-switch__item${journey === item.id ? ' is-on' : ''}`}
                    role="menuitemradio"
                    aria-checked={journey === item.id}
                    onClick={() => {
                      setOpen(false)
                      onJourney(item.id)
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="edu-tools" aria-hidden>
            <Icon d={ICONS.search} />
            <Icon d={ICONS.search} />
            <span className="edu-tools__a">A</span>
          </div>
        </div>
      </header>
      <div className="edu-frame">
        <aside className="edu-side" aria-label="Menu">
          <Icon d={ICONS.menu} />
          <Icon d={ICONS.monitor} />
          <Icon d={ICONS.calendar} />
          <Icon d={ICONS.people} />
          <Icon d={ICONS.grid} />
          <Icon d={ICONS.clock} />
          <Icon d={ICONS.person} />
          <Icon d={ICONS.person} />
          <span className="edu-side__pair">
            <Icon d={ICONS.grad} size={18} />
            <Icon d={ICONS.caret} size={12} />
          </span>
          <span className="edu-side__pair">
            <Icon d={ICONS.board} size={18} />
            <Icon d={ICONS.caret} size={12} />
          </span>
          <span className="edu-side__pair">
            <Icon d={ICONS.bulb} size={18} />
            <Icon d={ICONS.caret} size={12} />
          </span>
          <Icon d={ICONS.mail} />
          <span className="edu-side__gap" />
          <span className="edu-side__active" aria-current="page">
            <Icon d={ICONS.dollar} />
          </span>
          <Icon d={ICONS.chat} />
          <Icon d={ICONS.help} />
        </aside>
        <main className="edu-main">{children}</main>
      </div>
    </div>
  )
}
