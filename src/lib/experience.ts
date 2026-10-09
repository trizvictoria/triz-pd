export type ExperienceTarget =
  | 'rd'
  | 'totvs'
  | 'totvs-credenciamento'
  | 'totvs-dashboard'
  | 'suri'
  | 'checkout'
  | 'construcao'
  | 'educacional'
  | 'winthor'

export function experienceRoot() {
  const path = window.location.pathname
  const nested = path.search(/\/(totvs|construcao|educacional|winthor)(?:\/|$)/)
  if (nested >= 0) return `${path.slice(0, nested)}/`
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

const TOTVS_GATE = 'e9e69fcd703e857da732ae1e8c0d839920a24cb3407cc98440c04a4c7b62545d'

function markTotvsOnboarded(onboarded: boolean) {
  try {
    sessionStorage.setItem('totvs-onboarded', onboarded ? '1' : '0')
    sessionStorage.setItem('pd-ai-auth', TOTVS_GATE)
  } catch {
    /* ignore */
  }
}

export function experienceUrls() {
  const root = experienceRoot()
  return {
    rd: root,
    totvs: `${root}totvs/`,
    'totvs-credenciamento': `${root}totvs/`,
    'totvs-dashboard': `${root}totvs/dashboard`,
    suri: `${root}#suri`,
    checkout: `${root}#checkout`,
    construcao: `${root}construcao/`,
    educacional: `${root}educacional/`,
    winthor: `${root}winthor/`,
  }
}

export function goExperience(target: ExperienceTarget) {
  const urls = experienceUrls()
  if (target === 'totvs' || target === 'totvs-credenciamento') {
    markTotvsOnboarded(false)
    window.location.assign(urls['totvs-credenciamento'])
    return
  }
  if (target === 'totvs-dashboard') {
    markTotvsOnboarded(true)
    window.location.assign(urls['totvs-dashboard'])
    return
  }
  if (target === 'construcao') {
    window.location.assign(urls.construcao)
    return
  }
  if (target === 'educacional') {
    window.location.assign(urls.educacional)
    return
  }
  if (target === 'winthor') {
    window.location.assign(urls.winthor)
    return
  }
  const here = window.location.pathname.replace(/\/+$/, '')
  const home = urls.rd.replace(/\/+$/, '')
  if (here !== home && !here.endsWith(home)) {
    const next = target === 'rd' ? `${urls.rd}#deal` : target === 'suri' ? urls.suri : urls.checkout
    window.location.assign(next)
    return
  }
  if (target === 'rd') {
    window.location.hash = 'deal'
    return
  }
  window.location.hash = target
}

export const DEMO_CHECKOUT = {
  id: 'demo-checkout',
  name: 'Camiseta Universo TOTVS',
  description: 'Pedido demonstração TOTVS Pay',
  totalCents: 14990,
  specifyItems: true,
  items: [{ id: 'demo-item', name: 'Camiseta Universo TOTVS', unitCents: 14990, quantity: 1 }],
  url: 'https://pay.totvs.com/demo-checkout',
}
