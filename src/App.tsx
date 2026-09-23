import { lazy, Suspense, useState } from 'react'
import { TotvsShell } from './layout/TotvsShell'
import { LoginPage, type LoginProduct } from './pages/LoginPage'
import { writeAuthSession } from './lib/auth'

const AuthedApp = lazy(() => import('./pages/AuthedApp'))

export default function App() {
  const [authed, setAuthed] = useState(false)

  function handleLogin(product: LoginProduct) {
    writeAuthSession(true)
    if (product === 'totvs') {
      const base = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`
      window.location.assign(`${base}totvs/`)
      return
    }
    setAuthed(true)
  }

  if (!authed) {
    return (
      <TotvsShell>
        <LoginPage onSuccess={handleLogin} />
      </TotvsShell>
    )
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
      <AuthedApp />
    </Suspense>
  )
}
