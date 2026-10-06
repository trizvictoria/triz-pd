(function () {
  var STYLE =
    '#pd-edu-switch{position:fixed;z-index:2147483646;pointer-events:none}' +
    '#pd-edu-switch .product-switch{pointer-events:auto;position:relative;display:flex;align-items:center}' +
    '#pd-edu-switch .product-switch__toggle{width:22px;height:22px;display:flex;align-items:center;justify-content:center;border:0;border-radius:4px;padding:0;margin:0;background:transparent;color:#5d6b73;cursor:pointer}' +
    '#pd-edu-switch .product-switch__toggle:hover,#pd-edu-switch .product-switch__toggle[aria-expanded="true"]{background:rgba(93,107,115,.12)}' +
    '#pd-edu-switch .product-switch__menu{position:absolute;top:calc(100% + 8px);left:0;min-width:280px;padding:12px 0;background:#001927;border-radius:8px;box-shadow:0 12px 24px rgba(0,34,51,.28);z-index:2147483647}' +
    '#pd-edu-switch .product-switch__label{margin:0;padding:4px 16px 8px;color:rgba(255,255,255,.55);font:700 11px/14px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase}' +
    '#pd-edu-switch .product-switch__item{display:block;width:100%;padding:8px 16px;color:#fff;font:500 14px/20px "DM Sans",sans-serif;text-align:left;background:transparent;border:0;cursor:pointer}' +
    '#pd-edu-switch .product-switch__item:hover:not(:disabled){background:rgba(255,255,255,.08)}' +
    '#pd-edu-switch .product-switch__item.is-disabled,#pd-edu-switch .product-switch__item:disabled{color:rgba(255,255,255,.42);cursor:default}' +
    '#pd-edu-switch .product-switch__sep{display:block;height:1px;margin:8px 12px;background:rgba(255,255,255,.12)}'

  var MENU =
    '<div class="product-switch">' +
    '<button type="button" class="product-switch__toggle" data-act="toggle-products" aria-haspopup="true" aria-expanded="false" aria-label="Trocar produto">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.2 10.2 12 14l3.8-3.8 1.1 1.1L12 16.2 7.1 11.3l1.1-1.1Z" fill="currentColor"/></svg>' +
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
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="suri">Suri Shop</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item" data-product="checkout">Checkout</button>' +
    '<span class="product-switch__sep"></span>' +
    '<button type="button" class="product-switch__item is-disabled" data-product="early" disabled>Early adopters</button>' +
    '</div></div>'

  function experienceRoot() {
    var path = location.pathname
    var at = path.indexOf('/educacional')
    if (at >= 0) return path.slice(0, at) + '/'
    return path.endsWith('/') ? path : path.replace(/[^/]+$/, '')
  }

  function goProduct(id) {
    var root = experienceRoot()
    if (id === 'educacional') return
    if (id === 'totvs' || id === 'totvs-credenciamento') {
      try { sessionStorage.setItem('totvs-onboarded', '0') } catch (e) {}
      location.assign(root + 'totvs/')
      return
    }
    if (id === 'totvs-dashboard') {
      try { sessionStorage.setItem('totvs-onboarded', '1') } catch (e) {}
      location.assign(root + 'totvs/dashboard')
      return
    }
    if (id === 'construcao') location.assign(root + 'construcao/')
    else if (id === 'suri') location.assign(root + '#suri')
    else if (id === 'checkout') location.assign(root + '#checkout')
    else location.assign(root)
  }

  function copy() {
    if (document.querySelector('[data-edu-experiences]')) return null
    var nodes = document.querySelectorAll('span')
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].childElementCount === 0 && nodes[i].textContent.trim() === 'Grupo Pensando Juntos') return nodes[i]
    }
    return null
  }

  function host() {
    var el = document.getElementById('pd-edu-switch')
    if (!el) {
      el = document.createElement('div')
      el.id = 'pd-edu-switch'
      document.body.appendChild(el)
    }
    return el
  }

  function position() {
    var el = host()
    var target = copy()
    if (!target) {
      el.style.visibility = 'hidden'
      return
    }
    var rect = target.getBoundingClientRect()
    el.style.visibility = 'visible'
    el.style.left = Math.round(rect.right + 2) + 'px'
    el.style.top = Math.round(rect.top + rect.height / 2 - 11) + 'px'
  }

  function mount() {
    var el = host()
    if (el.getAttribute('data-ready') !== '1') {
      el.innerHTML = MENU
      el.setAttribute('data-ready', '1')
    }
    position()
  }

  function closeAll() {
    document.querySelectorAll('#pd-edu-switch .product-switch__menu').forEach(function (menu) {
      menu.hidden = true
    })
    document.querySelectorAll('#pd-edu-switch [data-act="toggle-products"]').forEach(function (button) {
      button.setAttribute('aria-expanded', 'false')
    })
  }

  if (!document.getElementById('pd-edu-switch-style')) {
    var style = document.createElement('style')
    style.id = 'pd-edu-switch-style'
    style.textContent = STYLE
    document.head.appendChild(style)
  }

  document.addEventListener('click', function (event) {
    var toggle = event.target.closest && event.target.closest('#pd-edu-switch [data-act="toggle-products"]')
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
    var item = event.target.closest && event.target.closest('#pd-edu-switch [data-product]')
    if (item && !item.disabled) {
      event.preventDefault()
      event.stopPropagation()
      closeAll()
      goProduct(item.getAttribute('data-product'))
      return
    }
    if (!event.target.closest || !event.target.closest('#pd-edu-switch')) closeAll()
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
})()
