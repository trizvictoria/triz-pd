export type ExperienceTarget = 'rd' | 'totvs' | 'suri' | 'checkout' | 'construcao'

export function experienceRoot() {
  const path = window.location.pathname
  const nested = path.search(/\/(totvs|construcao)(?:\/|$)/)
  if (nested >= 0) return `${path.slice(0, nested)}/`
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

export function experienceUrls() {
  const root = experienceRoot()
  return {
    rd: root,
    totvs: `${root}totvs/`,
    suri: `${root}#suri`,
    checkout: `${root}#checkout`,
    construcao: `${root}construcao/`,
  }
}

export function goExperience(target: ExperienceTarget) {
  const urls = experienceUrls()
  if (target === 'totvs' || target === 'construcao') {
    window.location.assign(urls[target])
    return
  }
  const here = window.location.pathname.replace(/\/+$/, '')
  const home = urls.rd.replace(/\/+$/, '')
  if (here !== home && !here.endsWith(home)) {
    window.location.assign(target === 'rd' ? urls.rd : target === 'suri' ? urls.suri : urls.checkout)
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
