import type { ExperienceTarget } from '../lib/experience'

export const EXPERIENCES: Array<{ id: ExperienceTarget; kicker: string; title: string; text: string }> = [
  { id: 'totvs-credenciamento', kicker: 'TOTVS Pay', title: 'Credenciamento', text: 'Abra a conta e comece a receber.' },
  { id: 'totvs-dashboard', kicker: 'TOTVS Pay', title: 'Dashboard', text: 'Acompanhe os recebimentos do dia a dia.' },
  { id: 'rd', kicker: 'CRM', title: 'RD Vendas', text: 'Crie links de pagamento na negociação.' },
  { id: 'construcao', kicker: 'Obras', title: 'Construção', text: 'Adiantamento e proposta da obra.' },
  { id: 'educacional', kicker: 'Portal', title: 'Educacional', text: 'Pagamentos no portal do aluno.' },
  { id: 'winthor', kicker: 'ERP', title: 'Winthor', text: 'Recebimentos no fluxo do Winthor.' },
  { id: 'suri', kicker: 'WhatsApp', title: 'Suri Shop', text: 'Venda automatizada e assistida.' },
  { id: 'checkout', kicker: 'Pagamento', title: 'Checkout', text: 'A experiência de quem paga.' },
]
