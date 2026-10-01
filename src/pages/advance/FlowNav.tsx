import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAdvance } from '../../advance/store'

const STEPS = [
  { id: 'form', label: '1. Cobrança' },
  { id: 'share', label: '2. Link gerado' },
  { id: 'whatsapp', label: '3. WhatsApp' },
  { id: 'email', label: '4. E-mail' },
  { id: 'checkout', label: '5. Checkout' },
  { id: 'payment', label: '6. Pagamento' },
  { id: 'cancel', label: '7. Cancelar' },
]

export function FlowNav() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { ensureGenerated } = useAdvance()
  const state = location.state as { view?: string; dialog?: string } | null
  const step = currentStep(location.pathname, location.search, state)

  function go(id: string) {
    setOpen(false)
    if (id === 'form') {
      navigate('/proposta', { state: { view: 'form' } })
      return
    }
    if (id === 'share' || id === 'cancel') {
      ensureGenerated()
      navigate('/proposta', { state: { view: 'share', dialog: id === 'cancel' ? 'cancel' : null } })
      return
    }
    if (id === 'whatsapp') {
      ensureGenerated()
      navigate('/whatsapp')
      return
    }
    if (id === 'email') {
      ensureGenerated()
      navigate('/email')
      return
    }
    if (id === 'payment') {
      ensureGenerated()
      navigate('/checkout?etapa=pagamento')
      return
    }
    ensureGenerated()
    navigate('/checkout')
  }

  return (
    <div className="flow-nav">
      {open ? (
        <div className="flow-nav-menu" role="menu">
          {STEPS.map((item) => (
            <button key={item.id} type="button" className={item.id === step ? 'active' : ''} onClick={() => go(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      <button className="flow-nav-toggle" type="button" onClick={() => setOpen((value) => !value)}>
        Fluxo do protótipo
      </button>
    </div>
  )
}

function currentStep(pathname: string, search: string, state: { view?: string; dialog?: string } | null) {
  if (pathname.startsWith('/whatsapp')) return 'whatsapp'
  if (pathname.startsWith('/email')) return 'email'
  if (pathname.startsWith('/checkout')) return search.includes('pagamento') ? 'payment' : 'checkout'
  if (state?.dialog === 'cancel') return 'cancel'
  if (state?.view === 'share') return 'share'
  return 'form'
}
