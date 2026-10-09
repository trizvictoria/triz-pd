(function () {
  var STYLE =
    '#pd-product-switch-host{position:relative;z-index:12001;display:inline-flex;align-items:center;vertical-align:middle;flex-shrink:0}' +
    '#pd-product-switch-host .product-switch{position:relative;display:inline-flex;align-items:center}' +
    '#pd-product-switch-host .product-switch__toggle{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:0;border-radius:8px;padding:0;margin:0;background:transparent;color:#00558b;cursor:pointer}' +
    '#pd-product-switch-host .product-switch__toggle:hover,#pd-product-switch-host .product-switch__toggle[aria-expanded="true"]{background:rgba(0,85,139,.12)}' +
    '#pd-product-switch-host .product-switch__toggle svg{width:18px!important;height:18px!important;display:block!important;fill:none!important;stroke:currentColor!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important}' +
    '#pd-product-switch-host .product-switch__menu{position:absolute;top:calc(100% + 8px);left:0;min-width:280px;padding:12px 0;background:#001927;border-radius:8px;box-shadow:0 12px 24px rgba(0,34,51,.28);z-index:12002}' +
    '#pd-product-switch-host .product-switch__label{padding:4px 16px 8px;color:rgba(255,255,255,.55);font:700 11px/14px "DM Sans",system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}' +
    '#pd-product-switch-host .product-switch__item{display:block;width:100%;padding:8px 16px;color:#fff;font:500 14px/20px "DM Sans",system-ui,sans-serif;text-align:left;background:transparent;border:0;cursor:pointer}' +
    '#pd-product-switch-host .product-switch__item:hover:not(:disabled){background:rgba(255,255,255,.08)}' +
    '#pd-product-switch-host .product-switch__item.is-disabled,#pd-product-switch-host .product-switch__item:disabled{color:rgba(255,255,255,.42);cursor:default}' +
    '#pd-product-switch-host .product-switch__sep{display:block;height:1px;margin:8px 12px;background:rgba(255,255,255,.12)}' +
    '.checkout-header #pd-product-switch-host{margin-left:2px}' +
    '.brand-wrap #pd-product-switch-host{margin-left:0}'

  var MENU =
    '<div class="product-switch">' +
    '<button type="button" class="product-switch__toggle" data-act="toggle-products" aria-haspopup="true" aria-expanded="false" aria-label="Trocar produto">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
    '</button>' +
    '<div class="product-switch__menu" hidden>' +
    '<p class="product-switch__label">Produtos</p>' +
    '<button type="button" class="product-switch__item" data-product="totvs-credenciamento">TOTVS Pay - Credenciamento</button>' +
    '<button type="button" class="product-switch__item" data-product="totvs-dashboard">TOTVS Pay - Dashboard</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="rd">RD Vendas</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="construcao">Construção</button>' +
    '<button type="button" class="product-switch__item" data-product="educacional">Educacional</button>' +
    '<button type="button" class="product-switch__item" data-product="winthor">Winthor</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="suri">Suri Shop</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="checkout">Checkout</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="interesse">Lista de interesse</button>' +
    '</div></div>'

  function experienceRoot() {
    var path = location.pathname
    var match = path.match(/\/(totvs|construcao|educacional|winthor|interesse)(?:\/|$)/)
    if (match && match.index >= 0) return path.slice(0, match.index) + '/'
    return path.endsWith('/') ? path : path.replace(/[^/]+$/, '')
  }

  function goProduct(id) {
    var root = experienceRoot()
    if (id === 'interesse') {
      location.assign(root + 'interesse/')
      return
    }
    if (id === 'construcao') return
    if (id === 'totvs' || id === 'totvs-credenciamento') {
      try { sessionStorage.setItem('totvs-onboarded', '0') } catch (e) {}
      location.assign(root + 'totvs/')
    } else if (id === 'totvs-dashboard') {
      try { sessionStorage.setItem('totvs-onboarded', '1') } catch (e) {}
      location.assign(root + 'totvs/dashboard')
    } else if (id === 'educacional') location.assign(root + 'educacional/')
    else if (id === 'winthor') location.assign(root + 'winthor/')
    else if (id === 'suri') location.assign(root + '#suri')
    else if (id === 'checkout') location.assign(root + 'construcao/checkout/')
    else location.assign(root)
  }

  function brandAnchor() {
    return (
      document.querySelector('.brand-wrap') ||
      document.querySelector('.navbar-logo.evt-brand') ||
      document.querySelector('.checkout-header .evt-brand') ||
      document.querySelector('.evt-brand') ||
      document.querySelector('.brand') ||
      document.querySelector('.wa-logo')
    )
  }

  function ensureHost() {
    var host = document.getElementById('pd-product-switch-host')
    if (host) return host
    var brand = brandAnchor()
    if (!brand || brand.id === 'pd-product-switch-host') return null
    host = document.createElement('span')
    host.id = 'pd-product-switch-host'
    if (brand.id === 'pd-product-switch-host') return brand
    if (brand.classList && brand.classList.contains('brand-wrap')) {
      brand.appendChild(host)
    } else {
      brand.insertAdjacentElement('afterend', host)
    }
    return host
  }

  function mount() {
    var el = ensureHost()
    if (!el) return
    if (el.getAttribute('data-menu-version') !== '9') {
      el.innerHTML = MENU
      el.setAttribute('data-menu-version', '9')
      el.setAttribute('data-ready', '1')
    }
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
    var toggle = event.target.closest('#pd-product-switch-host [data-act="toggle-products"]')
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
    var item = event.target.closest('#pd-product-switch-host [data-product]')
    if (item && !item.disabled) {
      event.preventDefault()
      event.stopPropagation()
      closeAll()
      goProduct(item.getAttribute('data-product'))
      return
    }
    if (!event.target.closest('#pd-product-switch-host')) closeAll()
  })

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAll()
  })

  var observer = new MutationObserver(mount)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount)
  else mount()
  setInterval(mount, 400)
})()
