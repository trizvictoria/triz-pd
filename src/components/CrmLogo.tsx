const asset = (name: string) => `${import.meta.env.BASE_URL}navbar/${name}`

export function CrmLogo() {
  return (
    <div className="navbar-product">
      <div className="navbar-logo">
        <span className="navbar-rds" aria-label="RD Station CRM">
          <img className="navbar-rds-symbol" src={asset('rds-symbol.svg')} alt="" />
          <span className="navbar-rds-lettering">
            <span className="navbar-rds-line" />
            <img className="navbar-crm-word" src={asset('crm-lettering.svg')} alt="" />
          </span>
        </span>
        <span className="navbar-product-item" aria-hidden>
          <img src={asset('chevron-down.svg')} alt="" />
        </span>
      </div>
    </div>
  )
}

export function NavbarIcon({ src, badge }: { src: string; badge?: boolean }) {
  return (
    <span className="navbar-icon-btn" aria-hidden>
      <img src={asset(src)} alt="" />
      {badge ? <span className="badge-dot" /> : null}
    </span>
  )
}

export function NavbarAvatar() {
  return (
    <span className="account-avatar" aria-hidden>
      <img src={asset('avatar-totvs.png')} alt="" />
    </span>
  )
}
