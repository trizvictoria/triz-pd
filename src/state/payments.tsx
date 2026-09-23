import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  DEAL,
  PREVIOUS_LINK_STATUSES,
  addDays,
  itemsTotal,
  newItem,
  type PaymentItem,
  type PaymentLink,
} from '../lib/deal'

export type ToastMessage = {
  kind: 'success'
  title: string
  description?: string
}

type Draft = {
  name: string
  description: string
  totalCents: number
  specifyItems: boolean
  items: PaymentItem[]
}

type Store = {
  links: PaymentLink[]
  visibleLinks: PaymentLink[]
  toast: ToastMessage | null
  dismissToast: () => void
  openCreate: () => void
  openLink: (id: string) => void
  closeDrawer: () => void
  drawer: 'closed' | 'create' | 'ready'
  activeLink: PaymentLink | null
  draft: Draft
  setDraft: (patch: Partial<Draft>) => void
  updateItem: (id: string, patch: Partial<PaymentItem>) => void
  addItem: () => void
  removeItem: (id: string) => void
  canCreate: boolean
  createLink: () => void
  copyUrl: (url?: string) => Promise<void>
  view: 'deal' | 'checkout'
  checkoutLink: PaymentLink | null
  openCheckout: (id: string) => void
  completeCheckout: () => void
  focusHistory: boolean
  consumeFocusHistory: () => void
}

const PaymentContext = createContext<Store | null>(null)

function emptyDraft(): Draft {
  return {
    name: DEAL.name,
    description: '',
    totalCents: 0,
    specifyItems: false,
    items: [newItem()],
  }
}

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<PaymentLink[]>([])
  const [drawer, setDrawer] = useState<Store['drawer']>('closed')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraftState] = useState<Draft>(emptyDraft)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [view, setView] = useState<Store['view']>('deal')
  const [checkoutId, setCheckoutId] = useState<string | null>(null)
  const [focusHistory, setFocusHistory] = useState(false)
  const toastTimer = useRef<number | undefined>(undefined)
  const pendingCreateToast = useRef(false)

  const activeLink = links.find((link) => link.id === activeId) ?? null
  const visibleLinks = links.filter((link) => !link.paid)
  const checkoutLink = links.find((link) => link.id === checkoutId) ?? null

  function showToast(next: ToastMessage) {
    window.clearTimeout(toastTimer.current)
    setToast(next)
    toastTimer.current = window.setTimeout(() => setToast(null), 6000)
  }

  const totalCents = draft.specifyItems ? itemsTotal(draft.items) : draft.totalCents

  const canCreate = useMemo(() => {
    if (!draft.name.trim() || !draft.description.trim()) return false
    if (!draft.specifyItems) return draft.totalCents > 0
    return (
      draft.items.length > 0 &&
      draft.items.every((item) => item.name.trim() && item.unitCents > 0 && item.quantity > 0)
    )
  }, [draft])

  function setDraft(patch: Partial<Draft>) {
    setDraftState((current) => ({ ...current, ...patch }))
  }

  function updateItem(id: string, patch: Partial<PaymentItem>) {
    setDraftState((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }))
  }

  const value: Store = {
    links,
    visibleLinks,
    toast,
    dismissToast() {
      window.clearTimeout(toastTimer.current)
      setToast(null)
    },
    drawer,
    activeLink,
    draft: { ...draft, totalCents },
    canCreate,
    setDraft,
    updateItem,
    addItem() {
      setDraftState((current) => ({ ...current, items: [...current.items, newItem()] }))
    },
    removeItem(id: string) {
      setDraftState((current) => ({
        ...current,
        items: current.items.length === 1 ? current.items : current.items.filter((item) => item.id !== id),
      }))
    },
    openCreate() {
      setDraftState(emptyDraft())
      setActiveId(null)
      setDrawer('create')
    },
    openLink(id: string) {
      setActiveId(id)
      setDrawer('ready')
    },
    closeDrawer() {
      setDrawer('closed')
      if (pendingCreateToast.current) {
        pendingCreateToast.current = false
        showToast({
          kind: 'success',
          title: 'Link criado com sucesso',
          description: 'A partir de agora você já consegue receber pagamentos através desse link',
        })
      }
    },
    createLink() {
      if (!canCreate) return
      const createdAt = new Date()
      const items = draft.specifyItems
        ? draft.items
        : [
            {
              id: crypto.randomUUID(),
              name: draft.description.trim() || `Pedido #${DEAL.id}`,
              unitCents: totalCents,
              quantity: 1,
            },
          ]
      const link: PaymentLink = {
        id: crypto.randomUUID(),
        name: draft.name.trim(),
        description: draft.description.trim(),
        totalCents,
        specifyItems: draft.specifyItems,
        items,
        url: `https://link.malga.io/${crypto.randomUUID()}`,
        createdAt,
        expiresAt: addDays(createdAt, 31),
        status: 'ativo',
      }
      setLinks((current) => [
        link,
        ...current.map((existing, index) => ({
          ...existing,
          status: PREVIOUS_LINK_STATUSES[index % PREVIOUS_LINK_STATUSES.length],
        })),
      ])
      setActiveId(link.id)
      setDrawer('ready')
      pendingCreateToast.current = true
    },
    async copyUrl(url) {
      const value = url ?? activeLink?.url
      if (!value) return
      try {
        await navigator.clipboard.writeText(value)
      } catch {
        // Clipboard can be blocked in the browser preview.
      }
      showToast({
        kind: 'success',
        title: 'Link copiado',
        description: 'O link de pagamento está na área de transferência',
      })
    },
    view,
    checkoutLink,
    openCheckout(id) {
      pendingCreateToast.current = false
      setCheckoutId(id)
      setDrawer('closed')
      setView('checkout')
    },
    completeCheckout() {
      if (checkoutId) {
        setLinks((current) =>
          current.map((link) =>
            link.id === checkoutId
              ? { ...link, paid: true, status: 'concluido', paidAt: new Date() }
              : link,
          ),
        )
      }
      setCheckoutId(null)
      setView('deal')
      setFocusHistory(true)
      showToast({
        kind: 'success',
        title: 'Pagamento confirmado',
        description: 'O link saiu da lista lateral e o pagamento consta no histórico',
      })
    },
    focusHistory,
    consumeFocusHistory() {
      setFocusHistory(false)
    },
  }

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
}

export function usePayments() {
  const store = useContext(PaymentContext)
  if (!store) throw new Error('PaymentProvider ausente')
  return store
}
