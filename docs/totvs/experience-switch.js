(function () {
  var MENU_VERSION = '16'

  var STYLE =
    '#pd-product-switch-host{position:fixed;z-index:2147483646;pointer-events:none}' +
    '#pd-product-switch-host .product-switch{pointer-events:auto;position:relative;display:flex;align-items:center}' +
    '#pd-product-switch-host .product-switch__toggle{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:0;border-radius:8px;padding:0;margin:0;background:transparent;color:#fff;cursor:pointer}' +
    '#pd-product-switch-host .product-switch__toggle svg{fill:currentColor!important;stroke:none!important}' +
    '#pd-product-switch-host .product-switch__toggle:hover,#pd-product-switch-host .product-switch__toggle[aria-expanded="true"]{background:rgba(255,255,255,.08)}' +
    '#pd-product-switch-host .product-switch__menu{position:absolute;top:calc(100% + 8px);left:0;min-width:280px;padding:12px 0;overflow:visible;background:#001927;border-radius:8px;box-shadow:0 12px 24px rgba(0,34,51,.28);z-index:2147483647}' +
    '#pd-product-switch-host .product-switch__label{padding:4px 16px 8px;color:rgba(255,255,255,.55);font:700 11px/14px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase}' +
    '#pd-product-switch-host .product-switch__item{display:block;width:100%;padding:8px 16px;color:#fff;font:500 14px/20px "DM Sans",sans-serif;text-align:left;background:transparent;border:0;cursor:pointer}' +
    '#pd-product-switch-host .product-switch__item:hover:not(:disabled){background:rgba(255,255,255,.08)}' +
    '#pd-product-switch-host .product-switch__item.is-disabled,#pd-product-switch-host .product-switch__item:disabled{color:rgba(255,255,255,.42);cursor:default}' +
    '#pd-product-switch-host .product-switch__sep{display:block;height:1px;margin:8px 12px;background:rgba(255,255,255,.12)}' +
    '.brand .product-switch,.totvs-brand .product-switch,.navbar-logo .product-switch{visibility:hidden!important;pointer-events:none!important}'

  var MENU =
    '<div class="product-switch">' +
    '<button type="button" class="product-switch__toggle" data-act="toggle-products" aria-haspopup="true" aria-expanded="false" aria-label="Trocar produto">' +
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M9.611 13.408 5.161 8.957a.5.5 0 0 1 0-.777l.519-.519a.5.5 0 0 1 .776 0L10 11.187l3.544-3.527a.5.5 0 0 1 .776 0l.519.519a.5.5 0 0 1 0 .777l-4.45 4.45a.5.5 0 0 1-.778 0Z" fill="currentColor"/></svg>' +
    '</button>' +
    '<div class="product-switch__menu" hidden>' +
    '<button type="button" class="product-switch__item" data-product="inicio">Página inicial</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="totvs-credenciamento">TOTVS Pay – Credenciamento</button>' +
    '<button type="button" class="product-switch__item" data-product="totvs-dashboard">TOTVS Pay – Dashboard</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="rd">RD Vendas</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="construcao">Construção</button>' +
    '<button type="button" class="product-switch__item" data-product="educacional">Educacional</button>' +
    '<button type="button" class="product-switch__item" data-product="winthor">Winthor</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="suri">Suri Shop</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="checkout">Link de pagamento</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="interesse">Lista de interesse</button>' +
    '</div></div>'

  function experienceRoot() {
    var path = location.pathname
    var at = path.indexOf('/totvs')
    if (at >= 0) return path.slice(0, at) + '/'
    return path.endsWith('/') ? path : path.replace(/[^/]+$/, '')
  }

  function goProduct(id) {
    if (id === 'inicio') {
      location.assign(experienceRoot() + '#inicio')
      return
    }
    if (id === 'interesse') {
      location.assign(experienceRoot() + 'interesse/')
      return
    }
    var root = experienceRoot()
    if (id === 'totvs' || id === 'totvs-credenciamento') {
      try { sessionStorage.setItem('totvs-onboarded', '0'); sessionStorage.setItem('pd-ai-auth', 'e9e69fcd703e857da732ae1e8c0d839920a24cb3407cc98440c04a4c7b62545d') } catch (e) {}
      location.assign(root + 'totvs/')
      return
    }
    if (id === 'totvs-dashboard') {
      try { sessionStorage.setItem('totvs-onboarded', '1'); sessionStorage.setItem('pd-ai-auth', 'e9e69fcd703e857da732ae1e8c0d839920a24cb3407cc98440c04a4c7b62545d') } catch (e) {}
      location.assign(root + 'totvs/dashboard')
      return
    }
    if (id === 'educacional') location.assign(root + 'educacional/')
    else if (id === 'winthor') location.assign(root + 'winthor/')
    else if (id === 'construcao') location.assign(root + 'construcao/')
    else if (id === 'suri') location.assign(root + '#suri')
    else if (id === 'rd') location.assign(root + '#deal')
    else if (id === 'checkout') location.assign(root + 'construcao/checkout/')
    else location.assign(root)
  }

  function host() {
    var el = document.getElementById('pd-product-switch-host')
    if (!el) {
      el = document.createElement('div')
      el.id = 'pd-product-switch-host'
      document.body.appendChild(el)
    }
    return el
  }

  function position() {
    var brand = document.querySelector('.topbar .brand, .paywall .brand, .brand, .totvs-brand')
    var el = host()
    if (!brand) {
      el.style.visibility = 'hidden'
      return
    }
    var rect = brand.getBoundingClientRect()
    el.style.visibility = 'visible'
    el.style.left = Math.round(rect.right + 4) + 'px'
    el.style.top = Math.round(rect.top + rect.height / 2 - 16) + 'px'
  }

  function mount() {
    var el = host()
    if (el.getAttribute('data-menu-version') !== MENU_VERSION) {
      el.innerHTML = MENU
      el.setAttribute('data-menu-version', MENU_VERSION)
      el.setAttribute('data-ready', '1')
    }
    position()
  }

  function closeAll() {
    document.querySelectorAll('#pd-product-switch-host .product-switch__menu').forEach(function (menu) {
      menu.hidden = true
    })
    document.querySelectorAll('#pd-product-switch-host [data-act="toggle-products"]').forEach(function (button) {
      button.setAttribute('aria-expanded', 'false')
    })
  }

  if (!document.getElementById('pd-product-switch-style')) {
    var style = document.createElement('style')
    style.id = 'pd-product-switch-style'
    style.textContent = STYLE
    document.head.appendChild(style)
  }

  document.addEventListener('click', function (event) {
    var toggle = event.target.closest && event.target.closest('#pd-product-switch-host [data-act="toggle-products"]')
    if (toggle) {
      event.preventDefault()
      event.stopPropagation()
      var wrap = toggle.closest('.product-switch')
      var menu = wrap && wrap.querySelector('.product-switch__menu')
      var willOpen = menu && menu.hidden
      closeAll()
      if (willOpen) {
        menu.hidden = false
        toggle.setAttribute('aria-expanded', 'true')
      }
      return
    }
    var item = event.target.closest && event.target.closest('#pd-product-switch-host [data-product]')
    if (item && !item.disabled) {
      event.preventDefault()
      event.stopPropagation()
      closeAll()
      goProduct(item.getAttribute('data-product'))
      return
    }
    if (!event.target.closest || !event.target.closest('#pd-product-switch-host')) closeAll()
  })

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAll()
  })

  window.addEventListener('resize', position)
  window.addEventListener('scroll', position, true)

  var observer = new MutationObserver(mount)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount)
  else mount()
  setInterval(position, 250)
})()
