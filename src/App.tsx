import { lazy, Suspense, useEffect, useState } from 'react'
import { DemoBanner } from './components/DemoBanner'
import { TotvsShell } from './layout/TotvsShell'
import { AdvanceApp } from './pages/advance/AdvanceApp'
import { ExperienceHub } from './pages/ExperienceHub'
import { TotemPage } from './pages/TotemPage'
import { EducacionalApp } from './educacional/EducacionalApp'
import { TotvsPayLanding } from './pages/TotvsPayLanding'

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

function isLandingPath() {
  return /\/interesse(?:\/|$)/.test(window.location.pathname)
}

function isGateHash(hash: string) {
  return hash === '' || hash === 'inicio' || hash === 'experiencias'
}

export default function App() {
  const hash = useHash()
  if (isLandingPath()) return <TotvsPayLanding />

  return (
    <>
      {isEducacionalPath() || !isGateHash(hash) ? <DemoBanner /> : null}
      {isEducacionalPath() ? <EducacionalApp /> : <MainApp hash={hash} />}
    </>
  )
}

function MainApp({ hash }: { hash: string }) {
  if (import.meta.env.VITE_ADVANCE_ONLY === 'true') {
    return <AdvanceApp />
  }

  if (hash === '' || hash === 'inicio') {
    return <TotemPage onStart={() => { window.location.hash = 'experiencias' }} />
  }

  if (hash === 'experiencias') return <ExperienceHub />

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
