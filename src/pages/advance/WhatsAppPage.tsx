import { Link, useNavigate } from 'react-router-dom'
import '../../advance/advance.css'
import { PAYMENT_URL, WHATSAPP_PHONE, whatsappMessage } from '../../advance/model'
import { useAdvance } from '../../advance/store'
import { FlowNav } from './FlowNav'

export function WhatsAppPage() {
  const navigate = useNavigate()
  const { link } = useAdvance()
  const url = link?.url ?? PAYMENT_URL
  const message = whatsappMessage(url)
  const [before, after] = message.split(url)

  return (
    <div className="advance-root">
      <div className="wa-page">
        <header className="wa-brand">
          <div className="wa-logo">
            <WaLogo />
            WhatsApp
          </div>
          <nav className="wa-links">
            <span>Features</span>
            <span>Privacy</span>
            <span>Blog</span>
            <span>Apps</span>
            <span>Help Center</span>
            <span>For Business</span>
            <button className="wa-login" type="button">
              Log in
            </button>
            <button className="wa-download" type="button">
              Download
            </button>
          </nav>
        </header>
        <div className="wa-center">
          <h1>Chat on WhatsApp with {WHATSAPP_PHONE}</h1>
          <div className="wa-bubble">
            {before}
            <Link to="/checkout">{url}</Link>
            {after}
          </div>
          <button className="wa-open" type="button" onClick={() => navigate('/checkout')}>
            Open app
          </button>
          <Link className="wa-continue" to="/checkout">
            Continue to WhatsApp Web
          </Link>
          <p className="wa-footnote">
            Don&apos;t have the app? <button type="button">Download it now</button>
          </p>
        </div>
      </div>
      <FlowNav />
    </div>
  )
}

function WaLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path
        fill="#fff"
        d="M16.2 7.2a8.6 8.6 0 0 0-7.4 12.9L7.4 24.6l4.6-1.2a8.6 8.6 0 1 0 4.2-16.2Zm5 12.3c-.2.6-1.2 1.1-1.7 1.2-.4.1-.9.2-3-.8-2.5-1.2-4.1-3.6-4.2-3.8-.2-.2-1.2-1.6-1.2-3s.8-2.1 1.1-2.4.6-.4.8-.4h.6c.2 0 .4 0 .6.5.3.7.9 2.2.9 2.4.1.1 0 .4-.1.5l-.4.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.8-.9c.2-.2.4-.2.7-.1l1.2.6c.3.1.6.2.7.4.1.5.1 1.6-.1 2.1Z"
      />
    </svg>
  )
}
