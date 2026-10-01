export const DEAL = {
  id: 'neg-2048',
  name: 'Processo Seletivo - Vestibular 2027',
  valueLabel: 'R$ 15.000,00',
  stage: 'Negociação',
  company: 'MRV Engenharia',
  contact: 'Mário Andrade',
  owner: 'Flávia',
  actor: 'Luiza Jung',
}

export type LinkStatus = 'ativo' | 'inativo' | 'concluido'

export const LINK_STATUS = {
  ativo: {
    label: 'Copiar link de pagamento',
    icon: 'content_copy',
  },
  inativo: {
    label: 'Pagamento inativo',
    icon: 'info',
  },
  concluido: {
    label: 'Pagamento concluído',
    icon: 'check_circle',
  },
} as const

export const PREVIOUS_LINK_STATUSES: LinkStatus[] = ['concluido', 'inativo']

export type PaymentItem = {
  id: string
  name: string
  unitCents: number
  quantity: number
}

export type PaymentLink = {
  id: string
  name: string
  description: string
  totalCents: number
  specifyItems: boolean
  items: PaymentItem[]
  url: string
  createdAt: Date
  expiresAt: Date
  status: LinkStatus
  paid?: boolean
  paidAt?: Date
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatTotal(cents: number) {
  if (!cents) return 'R$ 00,00'
  return formatBRL(cents)
}

export function parseReais(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return 0
  return Number.parseInt(digits, 10)
}

export function formatReaisInput(cents: number) {
  if (!cents) return ''
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function maskReais(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return { cents: 0, display: '' }
  const cents = Number.parseInt(digits, 10)
  return {
    cents,
    display: (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  }
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR')
}

export function formatDateTime(date: Date) {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function newItem(): PaymentItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    unitCents: 0,
    quantity: 1,
  }
}

export function itemsTotal(items: PaymentItem[]) {
  return items.reduce((sum, item) => sum + item.unitCents * item.quantity, 0)
}
