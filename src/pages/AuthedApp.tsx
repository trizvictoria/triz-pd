import { useEffect } from 'react'
import { CrmShell } from '../layout/CrmShell'
import { TotvsShell } from '../layout/TotvsShell'
import { CheckoutPage } from './CheckoutPage'
import { DealPage } from './DealPage'
import { SuriShopPage } from './SuriShopPage'
import { PaymentProvider, usePayments } from '../state/payments'
import '../styles/deal.css'
import '../styles/payment.css'
import '../styles/checkout.css'

function AuthedRoot({ hash }: { hash: string }) {
  const { view, openDemoCheckout, closeDemoCheckout } = usePayments()

  useEffect(() => {
    if (hash === 'checkout') openDemoCheckout()
    if (hash === 'deal') closeDemoCheckout()
  }, [hash])

  if (hash === 'suri') {
    return (
      <TotvsShell variant="suri">
        <SuriShopPage />
      </TotvsShell>
    )
  }
  if (view === 'checkout' || hash === 'checkout') return <CheckoutPage />
  return (
    <CrmShell>
      <DealPage />
    </CrmShell>
  )
}

export default function AuthedApp({ hash }: { hash: string }) {
  return (
    <PaymentProvider>
      <AuthedRoot hash={hash} />
    </PaymentProvider>
  )
}
