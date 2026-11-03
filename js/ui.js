/* Interface: cards de artistas, portfólio com filtro + lightbox, e o "monte sua tattoo".
   Todo conteúdo é inserido com textContent / atributos validados (nada de innerHTML). */
(function () {
  'use strict';

  var doc = document;
  var D = window.IMPACTTTO;
  var FX = window.FX || { bindTilt: function () {}, observeReveal: function () {} };
  if (!D) return;

  function $(s, c) { return (c || doc).querySelector(s); }
  function el(tag, attrs, kids) {
    var n = doc.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var n = doc.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  var styleById = {}, artistById = {};
  D.styles.forEach(function (s) { styleById[s.id] = s; });
  D.artists.forEach(function (a) { artistById[a.id] = a; });

  /* ---- validação dos dados que viram URL ---- */
  var HANDLE_RE = /^[A-Za-z0-9._]{1,30}$/;
  var ID_RE = /^[a-z0-9-]{1,24}$/;
  var ACCENT_RE = /^#[0-9a-fA-F]{6}$/;
  function igUrl(handle) { return HANDLE_RE.test(handle) ? 'https://www.instagram.com/' + handle + '/' : '#'; }
  function igDm() { return HANDLE_RE.test(D.config.instagram) ? 'https://ig.me/m/' + D.config.instagram : '#'; }

  /* ---- toast ---- */
  var toastEl = el('div', { 'class': 'toast', role: 'status', 'aria-live': 'polite' });
  doc.body.appendChild(toastEl);
  var toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* ---- radiogroup acessível (setas movem o foco/seleção) ---- */
  function radioKeys(group) {
    group.addEventListener('keydown', function (e) {
      var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!keys[e.key]) return;
      var items = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
      var i = items.indexOf(doc.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var next = items[(i + keys[e.key] + items.length) % items.length];
      next.focus(); next.click();
    });
  }
  function setRoving(group) {
    var items = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
    var checked = items.filter(function (i) { return i.getAttribute('aria-checked') === 'true'; })[0] || items[0];
    items.forEach(function (i) { i.tabIndex = i === checked ? 0 : -1; });
  }

  /* =================================================================== ARTISTAS */
  function renderArtists() {
    var host = $('#cards');
    if (!host) return;
    D.artists.forEach(function (a, i) {
      if (!ID_RE.test(a.id)) return;
      var accent = ACCENT_RE.test(a.accent) ? a.accent : '#ffb11f';
      var media = el('div', { 'class': 'card-media' }, [
        el('div', { 'class': 'card-clip' }, [
          el('img', { src: 'assets/img/artists/' + a.id + '-tattoo.webp', width: '400', height: '321', loading: 'lazy', decoding: 'async', alt: 'Exemplo de tatuagem de ' + a.name })
        ]),
        el('span', { 'class': 'card-handle', text: '@' + a.handle }),
        el('span', { 'class': 'avatar' }, [
          el('img', { src: 'assets/img/artists/' + a.id + '-portrait.webp', width: '400', height: '321', loading: 'lazy', decoding: 'async', alt: 'Retrato de ' + a.name })
        ])
      ]);
      var h3 = el('h3', { text: a.name });
      if (a.sub) h3.appendChild(el('small', { text: a.sub }));
      var tags = el('ul', { 'class': 'tags', 'aria-label': 'Estilos' }, a.tags.map(function (t) {
        return el('li', { text: styleById[t] ? styleById[t].label : t });
      }));
      var body = el('div', { 'class': 'card-body' }, [
        h3, el('p', { text: a.blurb }), tags,
        el('span', { 'class': 'card-go', text: 'Ver portfólio ↗' })
      ]);
      var link = el('a', { href: igUrl(a.handle), target: '_blank', rel: 'noopener noreferrer', 'data-cursor': 'Ver', 'aria-label': a.name + ' – abrir portfólio no Instagram (@' + a.handle + ')' }, [media, body]);
      var card = el('article', { 'class': 'card' }, [link]);
      card.style.setProperty('--accent', accent);
      card.style.setProperty('--d', (i % 5) * 0.08 + 's');
      host.appendChild(card);
      FX.bindTilt(card, 6);
      FX.observeReveal(card);
    });
  }

  /* =================================================================== PORTFÓLIO */
  var workFilter = 'all';
  var shown = [];
  function renderChips() {
    var host = $('#workChips');
    if (!host) return;
    var counts = {};
    D.work.forEach(function (w) { w.styles.forEach(function (s) { counts[s] = (counts[s] || 0) + 1; }); });
    var items = [{ id: 'all', label: 'Todos' }].concat(D.styles.filter(function (s) { return counts[s.id]; }));
    items.forEach(function (s) {
      var b = el('button', { 'class': 'chip', type: 'button', 'aria-pressed': s.id === workFilter ? 'true' : 'false', 'data-f': s.id, text: s.label });
      host.appendChild(b);
    });
    host.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button[data-f]');
      if (!b) return;
      workFilter = b.getAttribute('data-f');
      Array.prototype.forEach.call(host.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      renderWork();
    });
  }
  function renderWork() {
    var grid = $('#workGrid'), count = $('#workCount');
    if (!grid) return;
    clear(grid);
    shown = D.work.filter(function (w) { return workFilter === 'all' || w.styles.indexOf(workFilter) >= 0; });
    shown.forEach(function (w, i) {
      var a = artistById[w.artist];
      var cap = el('span', { 'class': 'cap', text: a ? a.name + ' · @' + a.handle : '' });
      var btn = el('button', { type: 'button', 'data-i': String(i), 'data-cursor': 'Ampliar', 'aria-label': 'Ampliar: ' + w.alt }, [
        el('img', { src: w.src, alt: w.alt, loading: 'lazy', decoding: 'async', width: '400', height: w.tall ? '510' : '321' }), cap
      ]);
      var li = el('li', { 'class': w.tall ? 'tall' : null }, [btn]);
      li.style.animationDelay = Math.min(i, 10) * 0.04 + 's';
      grid.appendChild(li);
    });
    if (count) {
      var n = shown.length;
      count.textContent = workFilter === 'all' ? n + ' trabalhos' : n + (n === 1 ? ' trabalho em ' : ' trabalhos em ') + styleById[workFilter].label;
    }
  }

  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbI = 0;
  function lbShow(i) {
    if (!shown.length) return;
    lbI = (i + shown.length) % shown.length;
    var w = shown[lbI], a = artistById[w.artist];
    lbImg.src = w.src; lbImg.alt = w.alt;
    lbCap.textContent = (a ? a.name + ' · @' + a.handle : '') + ' · ' + w.styles.map(function (s) { return styleById[s] ? styleById[s].label : s; }).join(', ');
  }
  function lightbox() {
    var grid = $('#workGrid');
    if (!lb || !grid || typeof lb.showModal !== 'function') return;
    grid.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button[data-i]');
      if (!b) return;
      lbShow(parseInt(b.getAttribute('data-i'), 10) || 0);
      lb.showModal();
    });
    $('#lbClose').addEventListener('click', function () { lb.close(); });
    $('#lbPrev').addEventListener('click', function () { lbShow(lbI - 1); });
    $('#lbNext').addEventListener('click', function () { lbShow(lbI + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') lbShow(lbI - 1);
      if (e.key === 'ArrowRight') lbShow(lbI + 1);
    });
  }

  /* =================================================================== AGENDAR */
  var state = { style: 'geek', zone: 'antebraco', view: 'front', size: 12, artist: 'any' };

  var ZONE_LABEL = { pescoco: 'Pescoço', nuca: 'Nuca', ombro: 'Ombro', peito: 'Peito', costelas: 'Costelas', barriga: 'Barriga', costas: 'Costas', lombar: 'Lombar', braco: 'Braço', antebraco: 'Antebraço', mao: 'Mão', coxa: 'Coxa', joelho: 'Joelho', panturrilha: 'Panturrilha', pe: 'Pé' };
  // formas da metade esquerda (viewBox 220 x 430); as marcadas com mirror ganham a metade direita espelhada
  var NECK = 'M97 58 L123 58 L124 72 Q110 77 96 72 Z';
  var COMMON = [
    ['ombro', 'M74 80 Q60 78 52 92 Q50 100 56 106 L74 104 Z', true],
    ['braco', 'M46 110 L72 110 L68 160 L44 158 Z', true],
    ['antebraco', 'M43 165 L67 167 L60 220 L38 214 Z', true],
    ['mao', 'M37 222 L59 226 L56 252 Q46 262 36 250 Z', true],
    ['coxa', 'M78 192 L108 192 L106 282 L80 280 Q76 236 78 192 Z', true],
    ['joelho', 'M80 288 L106 288 L104 314 L82 314 Z', true],
    ['panturrilha', 'M82 320 L103 320 L100 386 L86 386 Z', true],
    ['pe', 'M84 392 L102 392 L106 418 L80 418 Q80 402 84 392 Z', true]
  ];
  var VIEWS = {
    front: [
      ['pescoco', NECK, false],
      ['peito', 'M78 82 Q110 72 142 82 L140 126 Q110 132 80 126 Z', false],
      ['costelas', 'M80 132 L93 134 L92 178 L85 174 Z', true],
      ['barriga', 'M96 136 L124 136 L126 182 Q110 190 94 182 Z', false]
    ].concat(COMMON),
    back: [
      ['nuca', NECK, false],
      ['costas', 'M78 82 Q110 72 142 82 L140 150 Q110 158 80 150 Z', false],
      ['lombar', 'M82 156 Q110 164 138 156 L134 192 Q110 200 86 192 Z', false]
    ].concat(COMMON)
  };
  function mirror(d) {
    return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function (_, x, y) { return (220 - parseFloat(x)) + ' ' + y; });
  }

  function sizeLabel(cm) {
    if (cm <= 6) return 'Mini';
    if (cm <= 12) return 'Pequena';
    if (cm <= 20) return 'Média';
    if (cm <= 30) return 'Grande';
    return 'Projeto grande';
  }

  function matched() {
    return D.artists.filter(function (a) { return !state.style || a.tags.indexOf(state.style) >= 0; });
  }
  function message() {
    var a = state.artist !== 'any' ? artistById[state.artist] : null;
    var lines = ['Oi, Impacttto! Quero fazer uma tatuagem.', ''];
    lines.push('• Estilo: ' + (styleById[state.style] ? styleById[state.style].label : 'a definir'));
    lines.push('• Local do corpo: ' + (ZONE_LABEL[state.zone] || 'a definir'));
    lines.push('• Tamanho aproximado: ' + state.size + ' cm (' + sizeLabel(state.size).toLowerCase() + ')');
    lines.push('• Artista: ' + (a ? a.name + ' (@' + a.handle + ')' : 'sem preferência, aceito sugestões'));
    lines.push('', 'Vou mandar minhas referências por aqui. Quais são os próximos passos para agendar?');
    return lines.join('\n');
  }

  var bodySvg, bkStyles, matchHost;
  function drawBody() {
    clear(bodySvg);
    bodySvg.appendChild(svgEl('ellipse', { 'class': 'decor', cx: '110', cy: '32', rx: '21', ry: '26' }));
    VIEWS[state.view].forEach(function (z) {
      var id = z[0];
      var g = svgEl('g', { 'class': 'zone', role: 'radio', tabindex: '0', 'aria-label': ZONE_LABEL[id], 'aria-checked': state.zone === id ? 'true' : 'false', 'data-zone': id });
      g.appendChild(svgEl('path', { d: z[1] }));
      if (z[2]) g.appendChild(svgEl('path', { d: mirror(z[1]) }));
      bodySvg.appendChild(g);
    });
    setRoving(bodySvg);
  }
  function pickZone(id) {
    state.zone = id;
    Array.prototype.forEach.call(bodySvg.querySelectorAll('.zone'), function (g) {
      g.setAttribute('aria-checked', g.getAttribute('data-zone') === id ? 'true' : 'false');
    });
    setRoving(bodySvg);
    update();
  }
  function setView(v) {
    state.view = v;
    if (state.zone && !VIEWS[v].some(function (z) { return z[0] === state.zone; })) state.zone = null;
    $('#viewFront').setAttribute('aria-pressed', v === 'front' ? 'true' : 'false');
    $('#viewBack').setAttribute('aria-pressed', v === 'back' ? 'true' : 'false');
    drawBody();
    update();
  }

  function drawStyleChips() {
    clear(bkStyles);
    D.styles.forEach(function (s) {
      bkStyles.appendChild(el('button', { 'class': 'chip', type: 'button', role: 'radio', 'aria-checked': state.style === s.id ? 'true' : 'false', 'data-s': s.id, text: s.label }));
    });
    setRoving(bkStyles);
  }
  function drawMatch() {
    clear(matchHost);
    var list = matched();
    if (state.artist !== 'any' && !list.some(function (a) { return a.id === state.artist; })) state.artist = 'any';
    matchHost.appendChild(el('button', { 'class': 'chip', type: 'button', role: 'radio', 'aria-checked': state.artist === 'any' ? 'true' : 'false', 'data-a': 'any', text: 'Sem preferência' }));
    list.forEach(function (a) {
      matchHost.appendChild(el('button', { 'class': 'chip', type: 'button', role: 'radio', 'aria-checked': state.artist === a.id ? 'true' : 'false', 'data-a': a.id, text: a.name }));
    });
    setRoving(matchHost);
  }

  function update() {
    var st = styleById[state.style];
    $('#fStyle').textContent = st ? st.label : '—';
    $('#fZone').textContent = ZONE_LABEL[state.zone] || '—';
    $('#fSize').textContent = state.size + ' cm · ' + sizeLabel(state.size);
    $('#zoneName').textContent = ZONE_LABEL[state.zone] || 'Toque no corpo';
    $('#sizeCm').textContent = String(state.size);
    $('#sizeLabel').textContent = sizeLabel(state.size);
    $('#rulerBar').style.width = Math.round(state.size / 40 * 100) + '%';
    var msg = message();
    $('#msg').textContent = msg;

    var ready = !!(state.style && state.zone);
    var ig = $('#goIg');
    ig.classList.toggle('is-off', !ready);
    ig.setAttribute('aria-disabled', ready ? 'false' : 'true');
    ig.setAttribute('href', ready ? igDm() : '#agendar');

    var wa = $('#goWa'), num = String(D.config.whatsapp || '');
    if (/^\d{10,15}$/.test(num)) {
      wa.hidden = false;
      wa.setAttribute('href', 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg));
      wa.classList.toggle('is-off', !ready);
    } else wa.hidden = true;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return Promise.reject(new Error('sem clipboard'));
  }
  function copyFallback() {
    var node = $('#msg');
    var sel = window.getSelection(), range = doc.createRange();
    range.selectNodeContents(node); sel.removeAllRanges(); sel.addRange(range);
    var ok = false;
    try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
    toast(ok ? 'Mensagem copiada! Cole na conversa.' : 'Mensagem selecionada. Copie com Ctrl+C.');
  }

  function booking() {
    bodySvg = $('#body'); bkStyles = $('#bkStyles'); matchHost = $('#matchChips');
    if (!bodySvg || !bkStyles || !matchHost) return;

    drawStyleChips(); drawBody(); drawMatch(); update();

    radioKeys(bkStyles); radioKeys(matchHost);
    bodySvg.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        var g = e.target.closest && e.target.closest('.zone');
        if (g) { e.preventDefault(); pickZone(g.getAttribute('data-zone')); }
        return;
      }
      var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!keys[e.key]) return;
      var zs = Array.prototype.slice.call(bodySvg.querySelectorAll('.zone'));
      var i = zs.indexOf(doc.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var nx = zs[(i + keys[e.key] + zs.length) % zs.length];
      nx.focus(); pickZone(nx.getAttribute('data-zone'));
    });
    bodySvg.addEventListener('click', function (e) {
      var g = e.target.closest && e.target.closest('.zone');
      if (g) pickZone(g.getAttribute('data-zone'));
    });
    bodySvg.addEventListener('pointerover', function (e) {
      var g = e.target.closest && e.target.closest('.zone');
      if (g && !state.zone) $('#zoneName').textContent = ZONE_LABEL[g.getAttribute('data-zone')] || '';
    });

    $('#viewFront').addEventListener('click', function () { setView('front'); });
    $('#viewBack').addEventListener('click', function () { setView('back'); });

    bkStyles.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-s]');
      if (!b) return;
      state.style = b.getAttribute('data-s');
      Array.prototype.forEach.call(bkStyles.children, function (c) { c.setAttribute('aria-checked', c === b ? 'true' : 'false'); });
      setRoving(bkStyles);
      drawMatch(); update();
    });
    matchHost.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-a]');
      if (!b) return;
      state.artist = b.getAttribute('data-a');
      Array.prototype.forEach.call(matchHost.children, function (c) { c.setAttribute('aria-checked', c === b ? 'true' : 'false'); });
      setRoving(matchHost);
      update();
    });
    $('#size').addEventListener('input', function (e) { state.size = parseInt(e.target.value, 10) || 12; update(); });

    $('#copyMsg').addEventListener('click', function () {
      copyText(message()).then(function () { toast('Mensagem copiada! Cole na conversa.'); }, copyFallback);
    });
    $('#goIg').addEventListener('click', function (e) {
      if (this.classList.contains('is-off')) { e.preventDefault(); return; }
      copyText(message()).then(function () { toast('Mensagem copiada. Cole na conversa do Instagram.'); }, function () {});
    });
  }

  /* ---- WhatsApp: botões [data-wa] levam direto à conversa (só se houver número válido) ---- */
  function whatsapp() {
    var num = String(D.config.whatsapp || '');
    if (!/^\d{10,15}$/.test(num)) return;
    var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent('Oi, Impacttto! Vim pelo site e quero saber mais sobre tatuagem.');
    Array.prototype.forEach.call(doc.querySelectorAll('[data-wa]'), function (a) {
      a.setAttribute('href', url);
      a.hidden = false;
      if (a.hasAttribute('data-wa-label') && D.config.whatsappLabel) a.textContent = 'WhatsApp · ' + D.config.whatsappLabel;
    });
  }

  /* ------------------------------------------------------------ init */
  whatsapp();
  renderArtists();
  renderChips();
  renderWork();
  lightbox();
  booking();
})();
