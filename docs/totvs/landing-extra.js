(function () {
  var ROOT = (location.pathname.split('/totvs')[0] || '') + '/totvs/'
  var ASSET = ROOT + 'assets/landing/'
  var HOST_ID = 'lp-extra-host'
  var RATES_VERSION = '18'

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

  var H_JOINT = [
    [1, -1, 1],
    [-1, 1, -1],
    [1, 1, 1],
  ]
  var V_JOINT = [
    [-1, 1, -1, 1],
    [1, -1, 1, -1],
  ]

  function cardInstallmentsHTML() {
    return (
      '<div class="lp-rate__installments">' +
      '<div class="lp-rate__inst"><span>2x à 6x</span><strong>3,49%</strong></div>' +
      '<div class="lp-rate__inst"><span>7x à 12x</span><strong>3,99%</strong></div>' +
      '<div class="lp-rate__inst lp-rate__inst--note">' +
      '<img src="' +
      ASSET +
      'icon-info-navy.svg" alt="" width="16" height="16">' +
      '<p>Antecipação em 30 dias<br>com taxa de 1,70% ao mês</p>' +
      '</div></div>'
    )
  }

  var H_JOINT = [
    [1, -1, 1],
    [-1, 1, -1],
    [1, 1, 1],
  ]
  var V_JOINT = [
    [-1, 1, -1, 1],
    [1, -1, 1, -1],
  ]

  function round(n) {
    return Math.round(n * 100) / 100
  }

  function vertEdge(d, x, yA, yB, tabSign, boundaryX, radius, offset) {
    if (!tabSign) {
      d.push('L', round(x), round(yB))
      return
    }
    var midY = (yA + yB) / 2
    var cx = boundaryX + tabSign * offset
    var dy = Math.sqrt(Math.max(0, radius * radius - (x - cx) * (x - cx)))
    var down = yB > yA
    var yFirst = down ? midY - dy : midY + dy
    var ySecond = down ? midY + dy : midY - dy
    d.push('L', round(x), round(yFirst))
    var centerRight = cx > x
    var sweep = (down && centerRight) || (!down && !centerRight) ? 1 : 0
    d.push('A', round(radius), round(radius), 0, 1, sweep, round(x), round(ySecond))
    d.push('L', round(x), round(yB))
  }

  function horizEdge(d, y, xA, xB, tabSign, boundaryY, radius, offset) {
    if (!tabSign) {
      d.push('L', round(xB), round(y))
      return
    }
    var midX = (xA + xB) / 2
    var cy = boundaryY + tabSign * offset
    var dx = Math.sqrt(Math.max(0, radius * radius - (y - cy) * (y - cy)))
    var right = xB > xA
    var xFirst = right ? midX - dx : midX + dx
    var xSecond = right ? midX + dx : midX - dx
    d.push('L', round(xFirst), round(y))
    var centerDown = cy > y
    var sweep = (right && centerDown) || (!right && !centerDown) ? 1 : 0
    d.push('A', round(radius), round(radius), 0, 1, sweep, round(xSecond), round(y))
    d.push('L', round(xB), round(y))
  }

  function piecePath(col, row, cellW, cellH, pad, radius, offset, cornerR) {
    var x0 = pad + col * cellW
    var x1 = pad + (col + 1) * cellW
    var y0 = pad + row * cellH
    var y1 = pad + (row + 1) * cellH
    var top = row === 0 ? 0 : V_JOINT[row - 1][col]
    var right = col === 3 ? 0 : H_JOINT[row][col]
    var bottom = row === 2 ? 0 : V_JOINT[row][col]
    var left = col === 0 ? 0 : H_JOINT[row][col - 1]
    var tl = col === 0 && row === 0
    var tr = col === 3 && row === 0
    var br = col === 3 && row === 2
    var bl = col === 0 && row === 2
    var cr = Math.min(cornerR, (x1 - x0) / 3, (y1 - y0) / 3)
    var d = tl
      ? ['M', round(x0), round(y0 + cr), 'A', round(cr), round(cr), 0, 0, 1, round(x0 + cr), round(y0)]
      : ['M', round(x0), round(y0)]
    horizEdge(d, y0, tl ? x0 + cr : x0, tr ? x1 - cr : x1, top, y0, radius, offset)
    if (tr) d.push('A', round(cr), round(cr), 0, 0, 1, round(x1), round(y0 + cr))
    vertEdge(d, x1, tr ? y0 + cr : y0, br ? y1 - cr : y1, right, x1, radius, offset)
    if (br) d.push('A', round(cr), round(cr), 0, 0, 1, round(x1 - cr), round(y1))
    horizEdge(d, y1, br ? x1 - cr : x1, bl ? x0 + cr : x0, bottom, y1, radius, offset)
    if (bl) d.push('A', round(cr), round(cr), 0, 0, 1, round(x0), round(y1 - cr))
    vertEdge(d, x0, bl ? y1 - cr : y1, tl ? y0 + cr : y0, left, x0, radius, offset)
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
    var stroke = Math.max(3.5, Math.min(w / 4, h / 3) * 0.02)
    var pad = stroke * 0.5
    var cellW = (w - pad * 2) / 4
    var cellH = (h - pad * 2) / 3
    var minSide = Math.min(cellW, cellH)
    var radius = Math.max(14, minSide * 0.148)
    var offset = radius * 0.72
    var cornerR = Math.max(10, minSide * 0.09)
    var paths = svg.querySelectorAll('path')
    for (var i = 0; i < paths.length; i += 1) {
      paths[i].setAttribute(
        'd',
        piecePath(i % 4, Math.floor(i / 4), cellW, cellH, pad, radius, offset, cornerR)
      )
      paths[i].setAttribute('stroke', '#fff')
      paths[i].setAttribute('stroke-width', String(round(stroke)))
      paths[i].setAttribute('stroke-linejoin', 'round')
      paths[i].setAttribute('stroke-linecap', 'round')
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
      var text = cell.label
        .replace('Adquirência / Sub Adquirência', 'Adquirência / Sub<br>Adquirência')
        .replace('Meios de Pagamento', 'Meios de<br>Pagamento')
        .replace('Tokeniz. Bandeira', 'Tokeniz.<br>Bandeira')
      return (
        '<div class="lp-puzzle__label lp-puzzle__label--' +
        cell.tone +
        '">' +
        ICONS[cell.icon] +
        '<span>' +
        text +
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
      '" data-rates-version="' +
      RATES_VERSION +
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
      '<div class="lp-rate__icon"><img src="' +
      ASSET +
      'icon-card.svg" alt="" width="32" height="32"></div>' +
      '<p class="lp-rate__name">Cartão de crédito</p>' +
      '<p class="lp-rate__value lp-rate__value--promo">' +
      '<s class="lp-rate__value-old" aria-label="Taxa anterior 3,19 por cento">3,19%</s>' +
      '<span class="lp-rate__value-new">2,99%</span>' +
      '<span class="lp-rate__promo-chip">Promo</span></p>' +
      '<div class="lp-rate__promo-note">' +
      '<span class="lp-rate__promo-badge">Oferta exclusiva</span>' +
      '<p>Condição especial só para quem faz parte do <strong>Universo TOTVS</strong></p></div>' +
      '<p class="lp-rate__hint">à vista ou</p>' +
      cardInstallmentsHTML() +
      '</article>' +
      '<article class="lp-rate">' +
      '<div class="lp-rate__icon"><img src="' +
      ASSET +
      'icon-boleto.svg" alt="" width="32" height="32"></div>' +
      '<p class="lp-rate__name">Boleto</p>' +
      '<p class="lp-rate__value">R$1,99</p>' +
      '<p class="lp-rate__hint">por boleto pago</p>' +
      '</article></div></section></div>'
    )
  }

  function isPaywall() {
    var path = (location.pathname || '').replace(/\/+$/, '')
    return /\/totvs$/.test(path)
  }

  function heroHTML() {
    return (
      '<img class="hero-chart-img lp-hero-built" src="' +
      ASSET +
      'hero-chart.svg" alt="" width="485" height="314">' +
      '<article class="float-card float-sales"><span class="ic"><img src="' +
      ASSET +
      'icon-sales.svg" alt="" width="48" height="48"></span><div><small>Total em vendas</small><strong>R$ 100.493,99</strong></div></article>' +
      '<article class="float-card float-ticket"><span class="ic"><img src="' +
      ASSET +
      'icon-ticket.svg" alt="" width="32" height="32"></span><div><small>Ticket médio</small><strong>R$ 3690,00</strong></div></article>' +
      '<article class="float-card float-pix"><span class="ic"><img src="' +
      ASSET +
      'icon-pix-hero.svg" alt="" width="32" height="32"></span><div><small>No pix</small><strong>R$ 70.000</strong></div></article>'
    )
  }

  function ico(file, w, h) {
    h = h == null ? w : h
    return (
      '<img src="' +
      ASSET +
      file +
      '" alt="" width="' +
      w +
      '" height="' +
      h +
      '">'
    )
  }

  function navIco(file, cls) {
    return (
      '<span class="lp-shot__nav-ico' +
      (cls ? ' ' + cls : '') +
      '">' +
      ico(file, 9) +
      '</span>'
    )
  }

  function shotRow(name, status, cls, value, type, qty, created) {
    created = created || '29/03/2026'
    return (
      '<tr><td>' +
      name +
      '</td><td><em class="' +
      cls +
      '">' +
      status +
      '</em></td><td>' +
      created +
      '</td><td>' +
      created +
      '</td><td>' +
      value +
      '</td><td>' +
      type +
      '</td><td>' +
      qty +
      '</td><td><span class="lp-shot__plus">' +
      ico('shot-icon3.svg', 9) +
      '</span></td></tr>'
    )
  }

  function shotHTML() {
    return (
      '<div class="lp-shot lp-shot--fig">' +
      '<div class="lp-shot__app">' +
      '<header class="lp-shot__top">' +
      '<span class="lp-shot__brand">' +
      ico('shot-menu.svg', 9) +
      ico('shot-wordmark.svg', 46, 13) +
      '<b>Pay</b></span>' +
      '<span class="lp-shot__top-tools">' +
      ico('shot-nav-search.svg', 9) +
      ico('shot-ai.svg', 10) +
      ico('shot-nav-diamond.svg', 9) +
      ico('shot-nav-apps.svg', 9) +
      ico('shot-nav-settings.svg', 9) +
      '<span class="lp-shot__vr"></span>' +
      '<span class="lp-shot__avatar"></span>' +
      '<strong>Agência RD</strong>' +
      ico('shot-chevron.svg', 9) +
      '</span></header>' +
      '<div class="lp-shot__body">' +
      '<aside class="lp-shot__nav">' +
      navIco('shot-home.svg') +
      navIco('shot-vector.svg') +
      navIco('shot-person.svg') +
      '<span class="lp-shot__nav-ico is-on">' +
      ico('shot-sidebar-on.svg', 17, 15) +
      '<i></i></span>' +
      navIco('shot-chat.svg') +
      navIco('shot-file.svg') +
      '<span class="lp-shot__nav-ico"><svg viewBox="0 0 9 9" width="9" height="9" aria-hidden="true"><path d="M1.6 7.2V4.4M4.5 7.2V2M7.4 7.2V5.1" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/></svg></span>' +
      '</aside>' +
      '<div class="lp-shot__main">' +
      '<p class="lp-shot__crumb">Cobranças</p>' +
      '<div class="lp-shot__heading"><h3>Links de Pagamentos</h3>' +
      '<span class="lp-shot__actions">' +
      '<span class="lp-shot__gear">' +
      ico('shot-gear.svg', 9) +
      '</span>' +
      '<span class="lp-shot__cta">Criar link</span></span></div>' +
      '<div class="lp-shot__filters">' +
      '<span class="lp-shot__search">Buscar link' +
      ico('shot-loupe.svg', 9) +
      '</span>' +
      '<span class="lp-shot__select">' +
      ico('shot-tag.svg', 9) +
      'Status' +
      ico('shot-caret.svg', 9) +
      '</span>' +
      '<span class="lp-shot__select">' +
      ico('shot-calendar.svg', 9) +
      'Data' +
      ico('shot-caret.svg', 9) +
      '</span></div>' +
      '<table class="lp-shot__table"><thead><tr>' +
      '<th>nome do link</th>' +
      '<th>status ' + ico('shot-question.svg', 9) + '</th>' +
      '<th>criação ' + ico('shot-caret-down.svg', 9) + '</th>' +
      '<th>vencimento ' + ico('shot-caret-down.svg', 9) + '</th>' +
      '<th>valor do link ' + ico('shot-caret-down.svg', 9) + '</th>' +
      '<th>tipo de link ' + ico('shot-question.svg', 9) + '</th>' +
      '<th>quant. pagamentos</th><th></th></tr></thead><tbody>' +
      shotRow('Abril - EF - Turma B Noturno', 'ATIVO', 'is-ok', 'R$ 3000,00', 'Único', '1 de 1') +
      shotRow('Abril - EF - Turma B Matutino', 'INATIVO', 'is-off', 'R$ 4000,00', 'Reutilizável', '20') +
      shotRow('Abril - EM - Turma B Noturno', 'RASCUNHO', 'is-wait', 'R$ 5000,00', 'Reutilizável', '0') +
      shotRow('Abril - EM - Turma B Matutino', 'EXPIRADO', 'is-exp', 'R$ 6000,00', 'Reutilizável', '1') +
      shotRow('Março - EM - Turma A Noturno', 'ENCERRADO', 'is-end', 'R$ 9000,00', 'Único', '4999', '27/02/2026') +
      shotRow('Março - EM - Turma A Matutino', 'RASCUNHO', 'is-wait', 'R$ 8000,00', 'Reutilizável', '0', '27/02/2026') +
      '</tbody></table></div></div></div>' +
      '<aside class="lp-shot__modal">' +
      '<header><div><p>Sua cobrança foi criada</p><h4>Use seu link em suas estratégias</h4></div>' +
      ico('shot-close.svg', 16) +
      '</header>' +
      '<div class="lp-shot__url">https://totvspay.com' +
      ico('shot-copy.svg', 16) +
      '</div>' +
      '<div class="lp-shot__share">' +
      '<div>' +
      ico('shot-envelope.svg', 33) +
      '<div><strong>E-mail</strong><span>Use o link nos emails</span></div></div>' +
      '<div>' +
      ico('shot-whatsapp.svg', 33) +
      '<div><strong>WhatsApp</strong><span>Use o link no whatsapp</span></div></div>' +
      '</div></aside></div>'
    )
  }

  function applyFigmaArt() {
    var hero = document.querySelector('.hero-art')
    if (hero && !hero.querySelector('.lp-hero-built')) {
      hero.innerHTML = heroHTML()
    }
    var stack = document.querySelector('.preview-stack')
    if (stack && !stack.querySelector('.lp-shot--fig')) {
      stack.innerHTML = shotHTML()
    }
  }

  function mount() {
    var existing = document.getElementById(HOST_ID)
    if (!isPaywall()) {
      if (existing) existing.remove()
      return
    }
    var inner = document.querySelector('.paywall-inner')
    if (!inner) return
    applyFigmaArt()
    if (existing && existing.querySelector('.lp-platform')) {
      existing.remove()
      existing = null
    }
    if (
      existing &&
      existing.getAttribute('data-rates-version') !== RATES_VERSION
    ) {
      existing.remove()
      existing = null
    }
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
    link.href = ROOT + 'landing-extra.css?v=18'
    document.head.appendChild(link)
  }

  var observer = new MutationObserver(mount)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  window.addEventListener('popstate', mount)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount)
  else mount()
  setInterval(mount, 700)
})()
