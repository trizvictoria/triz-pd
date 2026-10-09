(function () {
  var STYLE =
    '#pd-product-switch-host .product-switch{position:relative;display:inline-flex;align-items:center}' +
    '#pd-product-switch-host .product-switch__toggle{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:0;border-radius:8px;padding:0;margin:0;background:rgba(255,255,255,.2);color:#fff;cursor:pointer}' +
    '#pd-product-switch-host .product-switch__toggle:hover,#pd-product-switch-host .product-switch__toggle[aria-expanded="true"]{background:rgba(255,255,255,.35)}' +
    '#pd-product-switch-host .product-switch__toggle svg{width:18px!important;height:18px!important;display:block!important;fill:currentColor!important;stroke:none!important}' +
    '#pd-product-switch-host .product-switch__menu{position:absolute;top:calc(100% + 8px);left:0;min-width:280px;max-height:min(70vh,520px);overflow-y:auto;padding:12px 0;background:#001927;border-radius:8px;box-shadow:0 12px 24px rgba(0,34,51,.28);z-index:12001}' +
    '#pd-product-switch-host .product-switch__label{padding:4px 16px 8px;color:rgba(255,255,255,.55);font:700 11px/14px "DM Sans",Tahoma,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase}' +
    '#pd-product-switch-host .product-switch__item{display:block;width:100%;padding:8px 16px;color:#fff;font:500 14px/20px "DM Sans",Tahoma,Arial,sans-serif;text-align:left;background:transparent;border:0;cursor:pointer}' +
    '#pd-product-switch-host .product-switch__item:hover:not(:disabled){background:rgba(255,255,255,.08)}' +
    '#pd-product-switch-host .product-switch__item.is-disabled,#pd-product-switch-host .product-switch__item:disabled{color:rgba(255,255,255,.42);cursor:default}' +
    '#pd-product-switch-host .product-switch__sep{display:block;height:1px;margin:8px 12px;background:rgba(255,255,255,.12)}'

  var MENU =
    '<div class="product-switch">' +
    '<button type="button" class="product-switch__toggle" data-act="toggle-products" aria-haspopup="true" aria-expanded="false" aria-label="Trocar produto">' +
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M9.611 13.408 5.161 8.957a.5.5 0 0 1 0-.777l.519-.519a.5.5 0 0 1 .776 0L10 11.187l3.544-3.527a.5.5 0 0 1 .776 0l.519.519a.5.5 0 0 1 0 .777l-4.45 4.45a.5.5 0 0 1-.778 0Z" fill="currentColor"/></svg>' +
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
    var at = path.indexOf('/winthor')
    if (at >= 0) return path.slice(0, at) + '/'
    return path.endsWith('/') ? path : path.replace(/[^/]+$/, '')
  }

  function goProduct(id) {
    if (id === 'interesse') {
      location.assign('https://materiais.rdstation.com/2026-totvspay-material-lp-hr-totvs-pay-universo')
      return
    }
    var root = experienceRoot()
    if (id === 'winthor') return
    if (id === 'totvs' || id === 'totvs-credenciamento') {
      try { sessionStorage.setItem('totvs-onboarded', '0') } catch (e) {}
      location.assign(root + 'totvs/')
    } else if (id === 'totvs-dashboard') {
      try { sessionStorage.setItem('totvs-onboarded', '1') } catch (e) {}
      location.assign(root + 'totvs/dashboard')
    } else if (id === 'construcao') location.assign(root + 'construcao/')
    else if (id === 'educacional') location.assign(root + 'educacional/')
    else if (id === 'suri') location.assign(root + '#suri')
    else if (id === 'checkout') location.assign(root + 'construcao/checkout/')
    else location.assign(root)
  }

  function host() {
    return document.getElementById('pd-product-switch-host')
  }

  function mount() {
    var el = host()
    if (!el) return
    if (el.getAttribute('data-ready') !== '1') {
      el.innerHTML = MENU
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount)
  else mount()
})()
