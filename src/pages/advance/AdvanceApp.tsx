import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AdvanceProvider } from '../../advance/store'
import { CheckoutPage } from './CheckoutPage'
import { EmailPage } from './EmailPage'
import { ProposalPage } from './ProposalPage'
import { WhatsAppPage } from './WhatsAppPage'

function AdvanceLayout() {
  return (
    <AdvanceProvider>
      <Outlet />
    </AdvanceProvider>
  )
}

export function AdvanceApp() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<AdvanceLayout />}>
          <Route path="/" element={<ProposalPage />} />
          <Route path="/proposta" element={<ProposalPage />} />
          <Route path="/whatsapp" element={<WhatsAppPage />} />
          <Route path="/email" element={<EmailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
