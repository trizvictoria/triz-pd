export const PAYMENT_URL = 'https://totvspay.com/l/8e93099f-182a-4a00-affb-7e0d3f28c705'
export const CREATED_LABEL = '16/09/2026 às 12:48'
export const DEFAULT_DUE = '23/09/2026'
export const DEFAULT_AMOUNT = 1000
export const WHATSAPP_PHONE = '+55 31 98642-0749'

export const PROPOSAL = {
  number: '16840',
  enterprise: 'RESIDENCIAL VIGORE',
  block: 'Vagas',
  unit: 'Unidade 000013',
  area: '12 m²',
  delivery: '30/04/2028',
  proposalDate: '05/05/2025',
  tableValue: 20000,
  proposalValue: 19300,
  spots: 0,
  modality: 'Modalidade padrão',
  table: 'Tabela Padrão',
}

export const ENTRY_COMPONENTS = [
  { id: 'ato', name: 'Ato', balance: 45727.85 },
  { id: 'entrada-02', name: 'Entrada 02', balance: 9145.57 },
  { id: 'entrada-03', name: 'Entrada 03', balance: 9145.57 },
]

export function formatDue(iso: string) {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${day}/${month}/${year}`
}

export function whatsappMessage(url: string) {
  return `Estou enviando o link para pagamento do adiantamento da Proposta/Reserva ${PROPOSAL.number} referente ao Empreendimento ${PROPOSAL.enterprise}, Bloco/Quadra ${PROPOSAL.unit}, Unidade/Lote ${PROPOSAL.block}.\n\nLink para pagamento:\n${url}`
}

export function emailBody(url: string) {
  return `Sou Pimentinha. Link do adiantamento da Prop/Reserva ${PROPOSAL.number} - Emp. ${PROPOSAL.enterprise}, Bloco/Quadra ${PROPOSAL.block}, Unidade/Lote ${PROPOSAL.unit}: ${url}`
}
