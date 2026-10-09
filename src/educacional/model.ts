export const TUITION_CENTS = 100000
export const MIN_CENTS = 500
export const MAX_CARDS = 3

export type TuitionStatus = 'overdue' | 'open'

export type Tuition = {
  id: string
  month: string
  due: string
  status: TuitionStatus
  cents: number
}

export const TUITIONS: Tuition[] = [
  { id: '2026-07', month: 'Julho/2026', due: '31/07/2026', status: 'overdue', cents: TUITION_CENTS },
  { id: '2026-08', month: 'Agosto/2026', due: '31/08/2026', status: 'overdue', cents: TUITION_CENTS },
  { id: '2026-09', month: 'Setembro/2026', due: '30/09/2026', status: 'open', cents: TUITION_CENTS },
]

export function tuitionStatusLabel(status: TuitionStatus) {
  return status === 'overdue' ? 'Vencida' : 'Em aberto'
}

export type Brand = 'visa' | 'mastercard'

export type SavedCard = {
  id: string
  brand: Brand
  last4: string
  expiry: string
}

export const INITIAL_CARDS: SavedCard[] = [
  { id: 'mc-8756', brand: 'mastercard', last4: '8756', expiry: '02/34' },
  { id: 'visa-1234', brand: 'visa', last4: '1234', expiry: '11/28' },
  { id: 'visa-0964', brand: 'visa', last4: '0964', expiry: '07/31' },
  { id: 'mc-6497', brand: 'mastercard', last4: '6497', expiry: '05/29' },
  { id: 'mc-3574', brand: 'mastercard', last4: '3574', expiry: '09/30' },
  { id: 'visa-9984', brand: 'visa', last4: '9984', expiry: '12/32' },
]

export type Installment = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'

export const INSTALLMENT_PLANS: Installment[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

const INSTALLMENT_RATE = 0.015

export type CardPayment = {
  amountCents: number
  installment: Installment | ''
  cvv: string
  cpf: string
}

export type CardDraft = {
  number: string
  holder: string
  expiry: string
  cvv: string
  useProfile: boolean
  cpf: string
  email: string
  phone: string
  useAddress: boolean
  cep: string
  country: string
  state: string
  city: string
  district: string
  street: string
  addressNumber: string
  complement: string
}

export const EMPTY_DRAFT: CardDraft = {
  number: '',
  holder: '',
  expiry: '',
  cvv: '',
  useProfile: false,
  cpf: '',
  email: '',
  phone: '',
  useAddress: false,
  cep: '',
  country: '',
  state: '',
  city: '',
  district: '',
  street: '',
  addressNumber: '',
  complement: '',
}

export const PROFILE = {
  cpf: '123.456.789-10',
  email: 'jose.silva@gmail.com.br',
  phone: '(11) 98888-7766',
  cep: '01310-100',
  country: 'Brasil',
  state: 'SP',
  city: 'São Paulo',
  district: 'Bela Vista',
  street: 'Avenida Paulista',
  addressNumber: '1000',
}

export const STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

export function eduAsset(name: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.endsWith('/') ? base : `${base}/`}educacional/${name}`
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

export function maskCard(value: string) {
  return digitsOnly(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function maskExpiry(value: string) {
  const digits = digitsOnly(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function maskCpf(value: string) {
  const digits = digitsOnly(value).slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function maskCep(value: string) {
  const digits = digitsOnly(value).slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function maskMoney(cents: number) {
  if (!cents) return ''
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function moneyToCents(value: string) {
  const digits = digitsOnly(value)
  return digits ? Number(digits) : 0
}

export function brandFromNumber(number: string): Brand {
  return digitsOnly(number).startsWith('4') ? 'visa' : 'mastercard'
}

export function cardLabel(card: SavedCard) {
  const brand = card.brand === 'visa' ? 'Visa' : 'Mastercard'
  return `${brand} **** ${card.last4}`
}

export function installmentTotal(amountCents: number, plan: Installment) {
  const count = Number(plan)
  if (count <= 1) return amountCents
  return amountCents + Math.round(amountCents * INSTALLMENT_RATE * (count - 1))
}

export function installmentLabel(amountCents: number, plan: Installment) {
  const count = Number(plan)
  const total = installmentTotal(amountCents, plan)
  const each = Math.round(total / count)
  if (count <= 1) return `1x ${formatBRL(each)} (sem juros)`
  return `${count}x ${formatBRL(each)} (com juros de 1,5% por parcela)`
}

export function installmentSplitLabel(amountCents: number, plan: Installment) {
  const count = Number(plan)
  const total = installmentTotal(amountCents, plan)
  const each = Math.round(total / count)
  if (count <= 1) return `1x ${formatBRL(each)} (Sem juros)`
  return `${count}x ${formatBRL(each)} (Com juros)`
}

export function emptyPayment(): CardPayment {
  return { amountCents: 0, installment: '1', cvv: '', cpf: '' }
}
