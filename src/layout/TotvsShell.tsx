import { useState, type ReactNode } from 'react'
import { NavbarAvatar, NavbarIcon } from '../components/CrmLogo'
import { TotvsPayLogo } from '../components/TotvsPayLogo'

const NAV_ICONS = [{ src: 'search.svg' }, { src: 'bell.svg', badge: true }, { src: 'settings.svg' }] as const

export function TotvsShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="layout layout-totvs">
      <nav className="navbar">
        <TotvsPayLogo variant="navy" size="nav" />
        <div className="navbar-secondary">
          <div className="navbar-icons">
            {NAV_ICONS.map((item) => (
              <NavbarIcon key={item.src} src={item.src} badge={'badge' in item && item.badge} />
            ))}
          </div>
          <div className="navbar-divider" />
          <button
            type="button"
            className={`account-menu${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <NavbarAvatar />
            <span className="account-name">Agência RD</span>
            <img className="account-caret" src={`${import.meta.env.BASE_URL}navbar/chevron-down.svg`} alt="" />
          </button>
        </div>
      </nav>
      <main className="content totvs-login-content">{children}</main>
    </div>
  )
}
