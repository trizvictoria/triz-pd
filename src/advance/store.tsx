import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CREATED_LABEL, DEFAULT_AMOUNT, DEFAULT_DUE, PAYMENT_URL } from './model'

export type AdvanceStatus = 'waiting' | 'paid' | 'cancelled'

export type AdvanceComponent = {
  name: string
  amount: number
}

export type AdvanceLink = {
  status: AdvanceStatus
  amount: number
  dueLabel: string
  createdLabel: string
  url: string
  components: AdvanceComponent[]
}

type AdvanceContextValue = {
  link: AdvanceLink | null
  generate: (amount: number, dueLabel: string, components?: AdvanceComponent[]) => void
  ensureGenerated: () => void
  cancel: () => void
  markPaid: () => void
  reset: () => void
}

const AdvanceContext = createContext<AdvanceContextValue | null>(null)

const CONSTRUCAO_BRIDGE_KEY = 'pd-construcao-advance'

function readConstrucaoBridge(): AdvanceLink | null {
  try {
    const raw = sessionStorage.getItem(CONSTRUCAO_BRIDGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<AdvanceLink> & { amount?: number }
    if (typeof data.amount !== 'number') return null
    return {
      status: data.status === 'cancelled' || data.status === 'paid' ? data.status : 'waiting',
      amount: data.amount,
      dueLabel: data.dueLabel ?? DEFAULT_DUE,
      createdLabel: data.createdLabel ?? CREATED_LABEL,
      url: data.url ?? PAYMENT_URL,
      components: data.components ?? [],
    }
  } catch {
    return null
  }
}

function waitingLink(amount = DEFAULT_AMOUNT, dueLabel = DEFAULT_DUE, components: AdvanceComponent[] = []): AdvanceLink {
  return {
    status: 'waiting',
    amount,
    dueLabel,
    createdLabel: CREATED_LABEL,
    url: PAYMENT_URL,
    components,
  }
}

export function AdvanceProvider({ children }: { children: ReactNode }) {
  const [link, setLink] = useState<AdvanceLink | null>(() => readConstrucaoBridge())

  const generate = useCallback((amount: number, dueLabel: string, components: AdvanceComponent[] = []) => {
    setLink(waitingLink(amount, dueLabel, components))
  }, [])

  const ensureGenerated = useCallback(() => {
    setLink((current) => {
      if (current && current.status !== 'cancelled') return current
      return waitingLink(current?.amount, current?.dueLabel, current?.components)
    })
  }, [])

  const cancel = useCallback(() => {
    setLink((current) => ({ ...(current ?? waitingLink()), status: 'cancelled' }))
  }, [])

  const markPaid = useCallback(() => {
    setLink((current) => ({ ...(current ?? waitingLink()), status: 'paid' }))
  }, [])

  const reset = useCallback(() => {
    setLink(null)
  }, [])

  const value = useMemo(
    () => ({ link, generate, ensureGenerated, cancel, markPaid, reset }),
    [link, generate, ensureGenerated, cancel, markPaid, reset],
  )

  return <AdvanceContext.Provider value={value}>{children}</AdvanceContext.Provider>
}

export function useAdvance() {
  const value = useContext(AdvanceContext)
  if (!value) throw new Error('useAdvance deve ficar dentro do fluxo de adiantamento')
  return value
}
