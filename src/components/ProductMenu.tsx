import { useEffect, useRef, useState } from 'react'
import { goExperience, type ExperienceTarget } from '../lib/experience'

const ITEMS: Array<
  | { type: 'item'; id: ExperienceTarget; label: string }
  | { type: 'soon'; id: string; label: string }
  | { type: 'sep'; id: string }
> = [
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

export function ProductMenu({ tone = 'navy' }: { tone?: 'navy' | 'light' }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={`product-switch product-switch--${tone}`} ref={root}>
      <button
        type="button"
        className="product-switch__toggle"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Trocar produto"
        onClick={() => setOpen((value) => !value)}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M9.611 13.408 5.161 8.957a.5.5 0 0 1 0-.777l.519-.519a.5.5 0 0 1 .776 0L10 11.187l3.544-3.527a.5.5 0 0 1 .776 0l.519.519a.5.5 0 0 1 0 .777l-4.45 4.45a.5.5 0 0 1-.778 0Z"
            fill="currentColor"
          />
        </svg>
      </button>
      {open ? (
        <div className="product-switch__menu" role="menu">
          <p className="product-switch__label">Produtos</p>
          {ITEMS.map((item) => {
            if (item.type === 'sep') return <span className="product-switch__sep" key={item.id} />
            if (item.type === 'soon') {
              return (
                <button key={item.id} type="button" className="product-switch__item is-disabled" disabled role="menuitem">
                  {item.label}
                </button>
              )
            }
            return (
              <button
                key={item.id}
                type="button"
                className="product-switch__item"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
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
  )
}
