import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { DemoBanner } from './components/DemoBanner'
import { TotvsShell } from './layout/TotvsShell'
import { readAuthSession, writeAuthSession } from './lib/auth'
import { LoginPage, type LoginProduct } from './pages/LoginPage'
import { SuriShopPage } from './pages/SuriShopPage'

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

export default function App() {
  const [authed, setAuthed] = useState(() => readAuthSession())
  const hash = useHash()

  function handleLogin(product: LoginProduct, password: string) {
    writeAuthSession(true, password)
    if (product === 'totvs') {
      const base = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`
      window.location.assign(`${base}totvs/`)
      return
    }
    setAuthed(true)
  }

  const shell = (children: ReactNode, variant: 'login' | 'suri' = 'login') => (
    <>
      <DemoBanner />
      <TotvsShell variant={variant}>{children}</TotvsShell>
    </>
  )

  if (hash === 'suri') return shell(<SuriShopPage />, 'suri')

  if (!authed) {
    return shell(<LoginPage onSuccess={handleLogin} />)
  }

  return (
    <>
      <DemoBanner />
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
    </>
  )
}
