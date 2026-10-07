import { useNavigate, useSearchParams } from 'react-router-dom'
import '../../advance/advance.css'
import { DEFAULT_AMOUNT, PROPOSAL } from '../../advance/model'
import { useAdvance } from '../../advance/store'
import { PayCheckout, type CheckoutPhase } from '../../components/PayCheckout'
import { FlowNav } from './FlowNav'

const PREFILL = {
  name: 'Bruno Matos',
  email: 'bruno@totvs.com',
  phone: '(31) 91111-1111',
  docType: 'CPF',
  doc: '111.111.111-11',
  street: 'Alameda das Garças',
  number: '300',
  complement: '',
  district: 'Cabral',
  city: 'Contagem',
  uf: 'MG',
  cep: '32146-015',
}

export function CheckoutPage() {
  const { link, markPaid } = useAdvance()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const etapa = params.get('etapa')
  const paid = link?.status === 'paid' || etapa === 'confirmado'
  const cancelled = link?.status === 'cancelled'
  const amount = link?.amount ?? DEFAULT_AMOUNT
  const totalCents = Math.round(amount * 100)
  const phase: CheckoutPhase = paid ? 'paid' : etapa === 'pagamento' ? 'method' : 'identify'

  function returnToProposal() {
    navigate('/proposta', { state: { view: 'share' } })
  }

  function completePayment() {
    markPaid()
    returnToProposal()
  }

  return (
    <>
      <PayCheckout
        items={[
          {
            id: 'adiantamento',
            name: 'Adiantamento',
            description: `Adiantamento da Proposta/Reserva ${PROPOSAL.number} no empreendimento ${PROPOSAL.enterprise}, ${PROPOSAL.unit}.`,
            unitCents: totalCents,
            quantity: 1,
          },
        ]}
        totalCents={totalCents}
        orderId={PROPOSAL.number}
        onLeave={returnToProposal}
        leaveLabel="Voltar para a proposta"
        initialIdent={PREFILL}
        phase={cancelled ? 'identify' : phase}
        onPhase={(next) => {
          if (next === 'method') setParams({ etapa: 'pagamento' })
          if (next === 'paid') completePayment()
          if (next === 'identify') setParams({})
        }}
        unavailable={
          cancelled
            ? {
                title: 'Link indisponível',
                text: 'Este link de pagamento foi cancelado e a cobrança não aceita mais pagamento.',
              }
            : undefined
        }
      />
      <FlowNav />
    </>
  )
}
