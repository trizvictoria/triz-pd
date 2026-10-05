(function () {
  var MENU =
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
    '<button type="button" class="product-switch__item is-disabled" data-product="early" disabled>Early adopters</button>'

  function experienceRoot() {
    var path = location.pathname
    var at = path.indexOf('/totvs')
    if (at >= 0) return path.slice(0, at) + '/'
    return path.endsWith('/') ? path : path.replace(/[^/]+$/, '')
  }

  function goProduct(id) {
    var root = experienceRoot()
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
    if (id === 'educacional') location.assign(root + 'educacional/')
    else if (id === 'construcao') location.assign(root + 'construcao/')
    else if (id === 'suri') location.assign(root + '#suri')
    else if (id === 'checkout') location.assign(root + '#checkout')
    else location.assign(root)
  }

  function patch() {
    document.querySelectorAll('.product-switch__menu').forEach(function (menu) {
      if (menu.getAttribute('data-pd-split') === '1') return
      menu.innerHTML = MENU
      menu.setAttribute('data-pd-split', '1')
    })
  }

  if (!document.getElementById('pd-totvs-menu-style')) {
    var style = document.createElement('style')
    style.id = 'pd-totvs-menu-style'
    style.textContent =
      '.product-switch__menu{min-width:280px!important}' +
      '.product-switch__menu:not([data-pd-split="1"]){visibility:hidden}'
    document.head.appendChild(style)
  }

  document.addEventListener('click', function (event) {
    var item = event.target.closest && event.target.closest('.product-switch__item[data-product]')
    if (!item || item.disabled) return
    event.preventDefault()
    event.stopPropagation()
    goProduct(item.getAttribute('data-product'))
  }, true)

  var observer = new MutationObserver(patch)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patch)
  else patch()
})()
