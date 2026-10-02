(function () {
  var ASSET = '/triz-pd/totvs/assets/landing/'
  var HOST_ID = 'lp-extra-host'

  var INSTALLMENTS = [
    ['2x', '5,19%'],
    ['3x', '6,92%'],
    ['4x', '8,68%'],
    ['5x', '10,47%'],
    ['6x', '12,28%'],
    ['7x', '12,63%'],
    ['8x', '13,51%'],
    ['9x', '15,43%'],
    ['10x', '16,37%'],
    ['11x', '18,35%'],
    ['12x', '19,99%'],
  ]

  function icon(name, d) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      (d || '') +
      '</svg>'
    )
  }

  var ICONS = {
    shop: icon('shop', '<path d="M4 9h16l-1.2 11H5.2L4 9Z" stroke="currentColor" stroke-width="1.7"/><path d="M8 9V7a4 4 0 0 1 8 0v2" stroke="currentColor" stroke-width="1.7"/>'),
    gateway: icon('gw', '<path d="M4 12h16M12 4v16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.7"/>'),
    shield: icon('shield', '<path d="M12 3 5 6v6c0 4.2 2.8 7.2 7 8.5 4.2-1.3 7-4.3 7-8.5V6l-7-3Z" stroke="currentColor" stroke-width="1.7"/><path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
    lock: icon('lock', '<rect x="6" y="11" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" stroke="currentColor" stroke-width="1.7"/>'),
    cards: icon('cards', '<rect x="4" y="7" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M4 11h16" stroke="currentColor" stroke-width="1.7"/>'),
    split: icon('split', '<circle cx="6" cy="12" r="2.2" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="7" r="2.2" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="17" r="2.2" stroke="currentColor" stroke-width="1.7"/><path d="M8.2 12H13l5-4.2M13 12l5 4.2" stroke="currentColor" stroke-width="1.7"/>'),
    token: icon('token', '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
    check: icon('check', '<path d="M4 13h4l2.5-7 3 12 2-5H20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
    front: icon('front', '<rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M4 9h16" stroke="currentColor" stroke-width="1.7"/>'),
    back: icon('back', '<rect x="5" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 10h8M8 13h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
    data: icon('data', '<ellipse cx="12" cy="7" rx="7" ry="3" stroke="currentColor" stroke-width="1.7"/><path d="M5 7v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7" stroke="currentColor" stroke-width="1.7"/>'),
    plus: icon('plus', '<path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  }

  var PUZZLE = [
    { label: 'Adquirência / Sub Adquirência', tone: 'cyan', icon: 'shop' },
    { label: 'Gateway', tone: 'cyan', icon: 'gateway' },
    { label: 'Anti Fraude', tone: 'navy', icon: 'shield' },
    { label: '3DS', tone: 'cyan', icon: 'lock' },
    { label: 'Meios de Pagamento', tone: 'cyan', icon: 'cards' },
    { label: 'Split', tone: 'navy', icon: 'split' },
    { label: 'Tokeniz. Bandeira', tone: 'deep', icon: 'token' },
    { label: 'Conciliação', tone: 'navy', icon: 'check' },
    { label: 'Front Office', tone: 'cyan', icon: 'front' },
    { label: 'Back Office', tone: 'navy', icon: 'back' },
    { label: 'Dados', tone: 'navy', icon: 'data' },
    { label: '+ Outras', tone: 'mute', icon: 'plus' },
  ]

  function instHTML() {
    return INSTALLMENTS.map(function (item) {
      return (
        '<div class="lp-rate__inst"><span>' +
        item[0] +
        '</span><strong>' +
        item[1] +
        '</strong></div>'
      )
    }).join('')
  }

  var H_JOINT = [
    [1, -1, 1],
    [-1, 1, -1],
    [1, -1, 1],
  ]
  var V_JOINT = [
    [-1, 1, -1, 1],
    [1, -1, 1, -1],
  ]

  function round(n) {
    return Math.round(n * 100) / 100
  }

  function vertEdge(d, x, yA, yB, kind, centerX, radius, gap) {
    if (!kind) {
      d.push('L', round(x), round(yB))
      return
    }
    var midY = (yA + yB) / 2
    var down = yB > yA
    var r = radius
    var dist = x - centerX
    var dy = Math.sqrt(Math.max(0, r * r - dist * dist))
    var yFirst = down ? midY - dy : midY + dy
    var ySecond = down ? midY + dy : midY - dy
    d.push('L', round(x), round(yFirst))
    var centerRight = centerX > x
    var sweep
    if (kind === 1) {
      sweep = (down && centerRight) || (!down && !centerRight) ? 1 : 0
      d.push('A', round(r), round(r), 0, 1, sweep, round(x), round(ySecond))
    } else {
      sweep = (down && centerRight) || (!down && !centerRight) ? 0 : 1
      d.push('A', round(r), round(r), 0, 0, sweep, round(x), round(ySecond))
    }
    d.push('L', round(x), round(yB))
  }

  function horizEdge(d, y, xA, xB, kind, centerY, radius, gap) {
    if (!kind) {
      d.push('L', round(xB), round(y))
      return
    }
    var midX = (xA + xB) / 2
    var right = xB > xA
    var r = radius
    var dist = y - centerY
    var dx = Math.sqrt(Math.max(0, r * r - dist * dist))
    var xFirst = right ? midX - dx : midX + dx
    var xSecond = right ? midX + dx : midX - dx
    d.push('L', round(xFirst), round(y))
    var centerDown = centerY > y
    var sweep
    if (kind === 1) {
      sweep = (right && centerDown) || (!right && !centerDown) ? 1 : 0
      d.push('A', round(r), round(r), 0, 1, sweep, round(xSecond), round(y))
    } else {
      sweep = (right && centerDown) || (!right && !centerDown) ? 0 : 1
      d.push('A', round(r), round(r), 0, 0, sweep, round(xSecond), round(y))
    }
    d.push('L', round(xB), round(y))
  }

  function piecePath(col, row, cellW, cellH, gap, radius) {
    var x0 = col * cellW + gap
    var x1 = (col + 1) * cellW - gap
    var y0 = row * cellH + gap
    var y1 = (row + 1) * cellH - gap
    var top = row === 0 ? 0 : -V_JOINT[row - 1][col]
    var right = col === 3 ? 0 : H_JOINT[row][col]
    var bottom = row === 2 ? 0 : V_JOINT[row][col]
    var left = col === 0 ? 0 : -H_JOINT[row][col - 1]
    var d = ['M', round(x0), round(y0)]
    horizEdge(d, y0, x0, x1, top, row * cellH, radius, gap)
    vertEdge(d, x1, y0, y1, right, (col + 1) * cellW, radius, gap)
    horizEdge(d, y1, x1, x0, bottom, (row + 1) * cellH, radius, gap)
    vertEdge(d, x0, y1, y0, left, col * cellW, radius, gap)
    d.push('Z')
    return d.join(' ')
  }

  function renderPuzzle(board) {
    var stage = board.querySelector('.lp-puzzle__stage')
    var svg = board.querySelector('.lp-puzzle__board')
    if (!stage || !svg) return
    var w = stage.clientWidth
    var h = stage.clientHeight
    if (w < 8 || h < 8) return
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h)
    var cellW = w / 4
    var cellH = h / 3
    var minSide = Math.min(cellW, cellH)
    var gap = Math.max(8, minSide * 0.058)
    var radius = Math.max(8, Math.min(minSide * 0.07, minSide / 2 - gap * 2.6))
    var paths = svg.querySelectorAll('path')
    for (var i = 0; i < paths.length; i += 1) {
      paths[i].setAttribute(
        'd',
        piecePath(i % 4, Math.floor(i / 4), cellW, cellH, gap, radius)
      )
    }
  }

  function enhancePuzzle() {
    var board = document.querySelector('.lp-puzzle')
    if (!board) return
    renderPuzzle(board)
    requestAnimationFrame(function () {
      renderPuzzle(board)
    })
    if (board.dataset.ready === '1') return
    board.dataset.ready = '1'
    var stage = board.querySelector('.lp-puzzle__stage') || board
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        renderPuzzle(board)
      }).observe(stage)
    }
    window.addEventListener('resize', function () {
      renderPuzzle(board)
    })
  }

  function puzzleHTML() {
    var paths = PUZZLE.map(function (cell) {
      return (
        '<path class="lp-puzzle__piece lp-puzzle__piece--' + cell.tone + '"></path>'
      )
    }).join('')
    var labels = PUZZLE.map(function (cell) {
      return (
        '<div class="lp-puzzle__label lp-puzzle__label--' +
        cell.tone +
        '">' +
        ICONS[cell.icon] +
        '<span>' +
        cell.label +
        '</span></div>'
      )
    }).join('')
    return (
      '<div class="lp-puzzle__stage">' +
      '<svg class="lp-puzzle__board" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      paths +
      '</svg>' +
      '<div class="lp-puzzle__labels">' +
      labels +
      '</div></div>'
    )
  }

  function extraHTML() {
    return (
      '<div class="lp-extra" id="' +
      HOST_ID +
      '">' +
      '<section class="lp-rates" aria-labelledby="lp-rates-title">' +
      '<h2 id="lp-rates-title">Confira as taxas por métodos de pagamento</h2>' +
      '<div class="lp-rates__grid">' +
      '<article class="lp-rate">' +
      '<div class="lp-rate__icon"><img src="' +
      ASSET +
      'icon-pix.svg" alt="" width="32" height="32"></div>' +
      '<p class="lp-rate__name">Pix</p>' +
      '<p class="lp-rate__value">0,99%</p>' +
      '<p class="lp-rate__hint">por transação aprovada</p>' +
      '</article>' +
      '<article class="lp-rate lp-rate--card">' +
      '<div class="lp-rate__head">' +
      '<div class="lp-rate__icon"><img src="' +
      ASSET +
      'icon-card.svg" alt="" width="32" height="32"></div>' +
      '<span class="lp-rate__tag"><img src="' +
      ASSET +
      'icon-info.svg" alt="" width="16" height="16">Antecipação em até 30 dias já incluída, sem taxa extra</span>' +
      '</div>' +
      '<p class="lp-rate__name">Cartão de crédito</p>' +
      '<p class="lp-rate__value">3,19%</p>' +
      '<p class="lp-rate__hint">à vista ou</p>' +
      '<div class="lp-rate__installments">' +
      instHTML() +
      '</div></article>' +
      '<article class="lp-rate">' +
      '<div class="lp-rate__icon"><img src="' +
      ASSET +
      'icon-boleto.svg" alt="" width="32" height="32"></div>' +
      '<p class="lp-rate__name">Boleto</p>' +
      '<p class="lp-rate__value">R$1,99</p>' +
      '<p class="lp-rate__hint">por boleto pago</p>' +
      '</article></div></section>' +
      '<section class="lp-platform" aria-labelledby="lp-platform-title">' +
      '<h2 id="lp-platform-title">TOTVS Pay é a plataforma de<br>pagamentos digitais da TOTVS</h2>' +
      '<div class="lp-platform__layout">' +
      '<div class="lp-platform__cards">' +
      '<article class="lp-platform__card"><span class="lp-platform__num">01</span><h3>One Stop Shop</h3><p>O cliente não precisa contratar mais ninguém além da gente para ter uma solução de pagamento completa.</p><div class="lp-platform__tags"><span>Adquirência</span><span>Antifraude</span><span>3DS</span><span>Vault</span><span>Tokenização</span></div></article>' +
      '<article class="lp-platform__card"><span class="lp-platform__num">02</span><h3>Modelo de negócio simplificado</h3><p>Cliente paga um % sobre o volume de vendas, compartilhando o risco e o sucesso. Nosso principal incentivo é o sucesso do nosso cliente.</p></article>' +
      '<article class="lp-platform__card"><span class="lp-platform__num">03</span><h3>Embarcado na TOTVS</h3><p>Todo produto TOTVS pode usar o TOTVS Pay para ter produtos de pagamentos para seus clientes — dentro do produto que já usam.</p></article>' +
      '</div>' +
      '<div class="lp-puzzle" aria-hidden="true">' +
      puzzleHTML() +
      '</div></div></section></div>'
    )
  }

  function isPaywall() {
    var path = (location.pathname || '').replace(/\/+$/, '')
    return /\/totvs$/.test(path)
  }

  function mount() {
    var existing = document.getElementById(HOST_ID)
    if (!isPaywall()) {
      if (existing) existing.remove()
      return
    }
    var inner = document.querySelector('.paywall-inner')
    if (!inner) return
    if (existing) {
      if (existing.parentNode !== inner) inner.appendChild(existing)
      enhancePuzzle()
      return
    }
    inner.insertAdjacentHTML('beforeend', extraHTML())
    enhancePuzzle()
  }

  if (!document.getElementById('lp-extra-style')) {
    var link = document.createElement('link')
    link.id = 'lp-extra-style'
    link.rel = 'stylesheet'
    link.href = '/triz-pd/totvs/landing-extra.css?v=7'
    document.head.appendChild(link)
  }

  var observer = new MutationObserver(mount)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  window.addEventListener('popstate', mount)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount)
  else mount()
  setInterval(mount, 700)
})()
