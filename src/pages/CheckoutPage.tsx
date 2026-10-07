import { ProductMenu } from '../components/ProductMenu'
import { PayCheckout, type PayCheckoutItem } from '../components/PayCheckout'
import { usePayments } from '../state/payments'

export function CheckoutPage() {
  const { checkoutLink, completeCheckout } = usePayments()

  if (!checkoutLink) return null

  const items: PayCheckoutItem[] = checkoutLink.items.map((item, index) => ({
    id: item.id,
    name: item.name,
    description:
      index === 0 && checkoutLink.description && checkoutLink.description !== item.name
        ? checkoutLink.description
        : undefined,
    unitCents: item.unitCents,
    quantity: item.quantity,
  }))

  return (
    <PayCheckout
      items={items}
      totalCents={checkoutLink.totalCents}
      orderId={checkoutLink.id}
      onLeave={completeCheckout}
      leaveLabel="Voltar ao CRM"
      headerExtra={<ProductMenu tone="light" />}
    />
  )
}
