import { useState, type ReactNode } from 'react'
import { CrmLogo, NavbarAvatar, NavbarIcon } from '../components/CrmLogo'
import { Icon } from '../components/ui'

const NAV_ICONS = [
  { src: 'search.svg' },
  { src: 'diamond.svg' },
  { src: 'apps.svg' },
  { src: 'bell.svg', badge: true },
  { src: 'settings.svg' },
] as const

const SIDEBAR = [
  { name: 'home', label: 'Início' },
  { name: 'contacts', label: 'Contatos' },
  { name: 'campaign', label: 'Atrair' },
  { name: 'ads_click', label: 'Converter' },
  { name: 'groups', label: 'Relacionar', active: true },
  { name: 'monitoring', label: 'Analisar' },
] as const

export function CrmShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="layout">
      <nav className="navbar">
        <CrmLogo />
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
      <aside className="sidebar">
        {SIDEBAR.map((item) => (
          <div className={`sidebar-item${item.active ? ' is-active' : ''}`} key={item.name}>
            <div className="sidebar-item-inner" title={item.label}>
              <Icon name={item.name} label={item.label} />
            </div>
          </div>
        ))}
      </aside>
      <main className="content">{children}</main>
    </div>
  )
}
