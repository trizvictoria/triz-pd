import { CrmShell } from '../layout/CrmShell'
import { CheckoutPage } from './CheckoutPage'
import { DealPage } from './DealPage'
import { PaymentProvider, usePayments } from '../state/payments'
import '../styles/deal.css'
import '../styles/payment.css'
import '../styles/checkout.css'

function AuthedRoot() {
  const { view } = usePayments()
  if (view === 'checkout') return <CheckoutPage />
  return (
    <CrmShell>
      <DealPage />
    </CrmShell>
  )
}

export default function AuthedApp() {
  return (
    <PaymentProvider>
      <AuthedRoot />
    </PaymentProvider>
  )
}
