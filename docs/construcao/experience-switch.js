(function () {
  var STYLE =
    '.evt-brand-wrap{display:flex;align-items:center;gap:2px;position:relative}' +
    '#pd-product-switch{display:flex;align-items:center}' +
    '.product-switch{position:relative;display:flex;align-items:center}' +
    '.product-switch__toggle{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#54666c;background:transparent;border:0;cursor:pointer;flex-shrink:0;padding:0}' +
    '.product-switch__toggle:hover,.product-switch__toggle[aria-expanded="true"]{background:rgba(0,0,0,.06)}' +
    '.product-switch__menu{position:absolute;top:calc(100% + 8px);left:0;min-width:228px;padding:12px 0;background:#001927;border-radius:8px;box-shadow:0 12px 24px rgba(0,34,51,.28);z-index:10000}' +
    '.product-switch__label{padding:4px 16px 8px;color:rgba(255,255,255,.55);font:700 11px/14px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase}' +
    '.product-switch__item{display:block;width:100%;padding:8px 16px;color:#fff;font:500 14px/20px "DM Sans",sans-serif;text-align:left;background:transparent;border:0;cursor:pointer}' +
    '.product-switch__item:hover:not(:disabled){background:rgba(255,255,255,.08)}' +
    '.product-switch__item.is-disabled,.product-switch__item:disabled{color:rgba(255,255,255,.42);cursor:default}' +
    '.product-switch__sep{display:block;height:1px;margin:8px 12px;background:rgba(255,255,255,.12)}'

  var MENU =
    '<div class="product-switch">' +
    '<button type="button" class="product-switch__toggle" data-act="toggle-products" aria-haspopup="true" aria-expanded="false" aria-label="Trocar produto">' +
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M9.611 13.408 5.161 8.957a.5.5 0 0 1 0-.777l.519-.519a.5.5 0 0 1 .776 0L10 11.187l3.544-3.527a.5.5 0 0 1 .776 0l.519.519a.5.5 0 0 1 0 .777l-4.45 4.45a.5.5 0 0 1-.778 0Z" fill="currentColor"/></svg>' +
    '</button>' +
    '<div class="product-switch__menu" hidden>' +
    '<p class="product-switch__label">Produtos</p>' +
    '<button type="button" class="product-switch__item" data-product="rd">RD Vendas</button>' +
    '<button type="button" class="product-switch__item" data-product="totvs">TOTVS Pay</button>' +
    '<button type="button" class="product-switch__item" data-product="suri">Suri Shop</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="construcao">Construção</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="checkout">Checkout</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item is-disabled" data-product="early" disabled>Early adopters</button>' +
    '</div></div>'

  function experienceRoot() {
    var path = location.pathname
    var at = path.indexOf('/construcao')
    if (at >= 0) return path.slice(0, at) + '/'
    return path.endsWith('/') ? path : path.replace(/[^/]+$/, '')
  }

  function goProduct(id) {
    var root = experienceRoot()
    if (id === 'construcao') return
    if (id === 'totvs') location.assign(root + 'totvs/')
    else if (id === 'suri') location.assign(root + '#suri')
    else if (id === 'checkout') location.assign(root + '#checkout')
    else location.assign(root)
  }

  function fill(slot) {
    if (!slot || slot.getAttribute('data-ready') === '1') return
    slot.innerHTML = MENU
    slot.setAttribute('data-ready', '1')
  }

  function ensureSlot() {
    var existing = document.getElementById('pd-product-switch')
    if (existing) return existing
    var brand = document.querySelector('.evt-brand')
    if (!brand) return null
    var wrap = document.createElement('div')
    wrap.className = 'evt-brand-wrap'
    brand.parentNode.insertBefore(wrap, brand)
    wrap.appendChild(brand)
    var slot = document.createElement('span')
    slot.id = 'pd-product-switch'
    wrap.appendChild(slot)
    return slot
  }

  function scan() {
    fill(ensureSlot())
    document.querySelectorAll('#pd-product-switch').forEach(fill)
  }

  function closeAll() {
    document.querySelectorAll('.product-switch__menu').forEach(function (menu) {
      menu.hidden = true
    })
    document.querySelectorAll('[data-act="toggle-products"]').forEach(function (button) {
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
    var toggle = event.target.closest('[data-act="toggle-products"]')
    if (toggle) {
      event.preventDefault()
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
    var item = event.target.closest('[data-product]')
    if (item && !item.disabled) {
      closeAll()
      goProduct(item.getAttribute('data-product'))
      return
    }
    if (!event.target.closest('.product-switch')) closeAll()
  })

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAll()
  })

  var observer = new MutationObserver(scan)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan)
  else scan()
})()
