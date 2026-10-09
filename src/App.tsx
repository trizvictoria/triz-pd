import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { DemoBanner } from './components/DemoBanner'
import { TotvsShell } from './layout/TotvsShell'
import { readAuthSession, writeAuthSession } from './lib/auth'
import { AdvanceApp } from './pages/advance/AdvanceApp'
import { LoginPage, type LoginProduct } from './pages/LoginPage'
import { SuriShopPage } from './pages/SuriShopPage'
import { EducacionalApp } from './educacional/EducacionalApp'
import { goExperience } from './lib/experience'

const AuthedApp = lazy(() => import('./pages/AuthedApp'))

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash.replace('#', ''))
  useEffect(() => {
    function onHash() {
      setHash(window.location.hash.replace('#', ''))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return hash
}

function isEducacionalPath() {
  return /\/educacional(?:\/|$)/.test(window.location.pathname)
}

export default function App() {
  return (
    <>
      <DemoBanner />
      {isEducacionalPath() ? <EducacionalApp /> : <MainApp />}
    </>
  )
}

function MainApp() {
  const [authed, setAuthed] = useState(() => readAuthSession())
  const hash = useHash()

  if (import.meta.env.VITE_ADVANCE_ONLY === 'true') {
    return <AdvanceApp />
  }

  function handleLogin(product: LoginProduct, password: string) {
    writeAuthSession(true, password)
    if (
      product === 'totvs' ||
      product === 'totvs-credenciamento' ||
      product === 'totvs-dashboard' ||
      product === 'construcao' ||
      product === 'educacional' ||
      product === 'winthor'
    ) {
      goExperience(product)
      return
    }
    if (product === 'suri' || product === 'checkout') {
      window.location.hash = product
    }
    setAuthed(true)
  }

  const shell = (children: ReactNode, variant: 'login' | 'suri' = 'login') => (
    <TotvsShell variant={variant}>{children}</TotvsShell>
  )

  if (hash === 'suri') return shell(<SuriShopPage />, 'suri')

  if (!authed) {
    return shell(<LoginPage onSuccess={handleLogin} />)
  }

  return (
    <Suspense
      fallback={
        <TotvsShell>
          <div className="login">
            <p className="login-error">Carregando…</p>
          </div>
        </TotvsShell>
      }
    >
      <AuthedApp hash={hash} />
    </Suspense>
  )
}
