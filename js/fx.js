/* Efeitos: intro, canvas de tinta/brasas, cursor, revelação ao rolar, contadores, letreiro. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var DATA = window.IMPACTTTO;
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  window.__fxOk = true;

  /* ------------------------------------------------------------ intro */
  function intro() {
    var title = $('.hero-title');
    var copy = $('.hero-copy');
    setTimeout(function () {
      if (title) title.classList.add('go');
      if (copy) copy.classList.add('go-in');
    }, 120);
    setTimeout(function () { if (title) title.classList.add('settled'); }, 1900);
  }

  /* ------------------------------------------------------------ revelar ao rolar */
  function reveal() {
    var sel = ['.sec-head', '.stats > div', '.blk', '.ficha', '.ev', '.flash-copy', '.shop-copy', '.shop-art',
      '.jobs-poster', '.jobs-copy', '.where-copy', '.map', '#workChips', '.foot-grid > *'];
    var els = $$(sel.join(','));
    els.forEach(function (el, i) {
      el.classList.add('rv');
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', (Math.min(sib, 5) * 0.09).toFixed(2) + 's');
    });
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
    window.FX.observeReveal = function (el) { el.classList.add('rv'); io.observe(el); };
  }

  /* ------------------------------------------------------------ contadores */
  function counters() {
    var els = $$('[data-count]');
    function fmt(el, n) { el.textContent = (el.getAttribute('data-prefix') || '') + String(Math.round(n)); }
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      if (reduce) { fmt(el, target); return; }
      var t0 = null, dur = 1700;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = clamp((ts - t0) / dur, 0, 1);
        fmt(el, target * (1 - Math.pow(1 - k, 4)));
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) return;
    els.forEach(function (el) { if (!reduce) fmt(el, 0); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); run(en.target); } });
    }, { threshold: 0.4 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ------------------------------------------------------------ manifesto: palavras acendem ao rolar */
  var words = [];
  function manifesto() {
    var p = $('#manifesto');
    if (!p) return;
    var text = p.textContent.trim();
    p.textContent = '';
    p.setAttribute('aria-label', text);
    text.split(/\s+/).forEach(function (w, i, arr) {
      var s = doc.createElement('span');
      s.className = 'w';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = w;
      p.appendChild(s);
      if (i < arr.length - 1) p.appendChild(doc.createTextNode(' '));
      words.push(s);
    });
  }
  function updateManifesto() {
    if (!words.length) return;
    var p = $('#manifesto');
    var r = p.getBoundingClientRect();
    var vh = window.innerHeight;
    var prog = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1);
    var n = Math.ceil(prog * words.length * 1.08);
    for (var i = 0; i < words.length; i++) {
      var on = i < n;
      if (on !== words[i].classList.contains('on')) words[i].classList.toggle('on', on);
    }
  }

  /* ------------------------------------------------------------ letreiro de estilos */
  var marqueeAnims = [];
  function marquee() {
    var rows = $$('.mq-row');
    if (!rows.length || !DATA) return;
    var labels = DATA.styles.map(function (s) { return s.label; });
    var list = $('#stylesList');
    if (list) labels.forEach(function (l) { var li = doc.createElement('li'); li.textContent = l; list.appendChild(li); });
    rows.forEach(function (row, idx) {
      var track = $('.mq-track', row);
      var set = idx % 2 ? labels.slice().reverse() : labels;
      for (var rep = 0; rep < 2; rep++) {
        set.forEach(function (l) {
          var s = doc.createElement('span');
          s.className = 'mq-item';
          s.textContent = l;
          track.appendChild(s);
        });
      }
    });
    if (!reduce) {
      requestAnimationFrame(function () {
        $$('.mq-track').forEach(function (t) {
          var a = t.getAnimations && t.getAnimations()[0];
          if (a) marqueeAnims.push(a);
        });
      });
    }
  }

  /* ------------------------------------------------------------ scroll: progresso, nav, parallax, velocidade */
  var lastY = window.scrollY, vel = 0, ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY;
      var max = Math.max(1, doc.documentElement.scrollHeight - window.innerHeight);
      var bar = $('.progress i');
      if (bar) bar.style.transform = 'scaleX(' + clamp(y / max, 0, 1).toFixed(4) + ')';
      var nav = $('#nav');
      if (nav) nav.classList.toggle('scrolled', y > 24);
      vel = y - lastY; lastY = y;
      updateManifesto();
      var stage = $('#logoStage');
      if (stage && y < window.innerHeight && !reduce) stage.style.transform = 'translateY(' + (y * 0.12).toFixed(1) + 'px)';
    });
  }
  function velocityLoop() {
    if (reduce) return;
    function step() {
      var rate = 1 + Math.min(7, Math.abs(vel) * 0.35);
      for (var i = 0; i < marqueeAnims.length; i++) {
        var a = marqueeAnims[i];
        a.playbackRate += (rate - a.playbackRate) * 0.08;
      }
      vel *= 0.9;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------ botões magnéticos + inclinação */
  function bindMagnet(el) {
    if (!finePointer || reduce) return;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px');
      el.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1) + 'px');
    });
    el.addEventListener('pointerleave', function () { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); });
  }
  function bindTilt(el, max) {
    if (!finePointer || reduce) return;
    var m = max || 7;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((x - 0.5) * 2 * m).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * 2 * m).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  }

  /* ------------------------------------------------------------ cursor */
  function cursor() {
    var c = $('.cursor');
    if (!c || !finePointer) return;
    var label = $('.cursor-label', c);
    var x = -100, y = -100, cx = -100, cy = -100;
    var linkSel = 'a, button, input, textarea, [role="radio"], .zone, summary';
    doc.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      c.classList.add('on');
      var t = e.target && e.target.closest ? e.target.closest('[data-cursor], ' + linkSel) : null;
      var txt = t && t.getAttribute ? t.getAttribute('data-cursor') : null;
      c.classList.toggle('link', !!t && !txt);
      c.classList.toggle('label', !!txt);
      if (txt && label.textContent !== txt) label.textContent = txt;
    }, { passive: true });
    doc.addEventListener('pointerleave', function () { c.classList.remove('on'); });
    function loop() {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      c.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ------------------------------------------------------------ hero: brasas + rastro neon + respingos de tinta */
  function heroCanvas() {
    var hero = $('#top'), cv = $('#fx');
    if (!hero || !cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, DPR = 1;
    var embers = [], trail = [], drops = [], stains = [];
    var ptr = { x: -999, y: -999 };
    var visible = true, raf = 0, logoDone = false;

    function ember(init) {
      return { x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: Math.random() * 1.7 + 0.4, vy: -(Math.random() * 0.4 + 0.12), ph: Math.random() * 6.28, sp: Math.random() * 0.02 + 0.006, a: Math.random() * 0.6 + 0.25, vx: 0 };
    }
    function resize() {
      var r = hero.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var n = Math.round(Math.min(90, (W * H) / 15000));
      embers = [];
      for (var i = 0; i < n; i++) embers.push(ember(true));
      if (reduce) drawStatic();
    }
    function drawEmbers(update) {
      for (var i = 0; i < embers.length; i++) {
        var e = embers[i];
        if (update) {
          e.ph += e.sp;
          e.vx += (Math.sin(e.ph) * 0.05 - e.vx) * 0.05;
          var dx = e.x - ptr.x, dy = e.y - ptr.y, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { var d = Math.sqrt(d2) || 1, f = (1 - d / 118) * 2.2; e.x += dx / d * f; e.y += dy / d * f; }
          e.x += e.vx; e.y += e.vy;
          if (e.y < -10 || e.x < -20 || e.x > W + 20) embers[i] = ember(false);
        }
        var fl = 0.65 + Math.sin(e.ph * 3) * 0.35;
        var a = e.a * fl;
        ctx.fillStyle = 'rgba(255,140,30,' + (a * 0.14).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 4.2, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(255,205,100,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, 6.283); ctx.fill();
      }
    }
    function drawStatic() { ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter'; drawEmbers(false); }

    function frame(now) {
      raf = 0;
      if (!visible || doc.hidden) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      drawEmbers(true);

      // manchas de tinta
      for (var s = stains.length - 1; s >= 0; s--) {
        var st = stains[s], age = (now - st.t) / 4200;
        if (age >= 1) { stains.splice(s, 1); continue; }
        var g = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, st.r);
        var al = (1 - age) * 0.32;
        g.addColorStop(0, 'rgba(255,150,30,' + al.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283); ctx.fill();
      }
      // gotas
      for (var d = drops.length - 1; d >= 0; d--) {
        var p = drops[d];
        p.vy += 0.16; p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.life -= 1;
        if (p.life <= 0 || p.y > H + 20) {
          if (p.life <= 0 && p.big) stains.push({ x: p.x, y: p.y, r: p.r * 5, t: now });
          drops.splice(d, 1); continue;
        }
        ctx.strokeStyle = 'rgba(255,190,70,' + clamp(p.life / 40, 0, 1).toFixed(2) + ')';
        ctx.lineWidth = p.r; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x - p.vx * 2, p.y - p.vy * 2); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      // rastro neon da agulha
      while (trail.length && now - trail[0].t > 760) trail.shift();
      if (trail.length > 1) {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(255,120,0,.95)'; ctx.shadowBlur = 16;
        for (var i = 1; i < trail.length; i++) {
          var a = 1 - (now - trail[i].t) / 760;
          ctx.strokeStyle = 'rgba(255,200,80,' + (a * 0.95).toFixed(3) + ')';
          ctx.lineWidth = 1 + a * 4.5;
          ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && !reduce) raf = requestAnimationFrame(frame); }

    function local(e) { var r = hero.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    hero.addEventListener('pointermove', function (e) {
      var q = local(e);
      ptr.x = q.x; ptr.y = q.y;
      trail.push({ x: q.x, y: q.y, t: performance.now() });
      if (trail.length > 70) trail.shift();
      // inclinação 3D do logo
      var stage = $('#logoStage'), logo = $('#logo');
      if (stage && logo && !reduce) {
        var r = stage.getBoundingClientRect();
        var nx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
        var ny = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1);
        logo.style.setProperty('--ry', (nx * 12).toFixed(1) + 'deg');
        logo.style.setProperty('--rx', (-ny * 9).toFixed(1) + 'deg');
      }
      start();
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { ptr.x = ptr.y = -999; });
    hero.addEventListener('pointerdown', function (e) {
      if (reduce || (e.target.closest && e.target.closest('a, button'))) return;
      var q = local(e), now = performance.now();
      for (var i = 0; i < 26; i++) {
        var ang = Math.random() * 6.283, sp = Math.random() * 5.5 + 1.5;
        drops.push({ x: q.x, y: q.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2.2, r: Math.random() * 3.2 + 1, life: 50 + Math.random() * 40, big: Math.random() < 0.35 });
      }
      stains.push({ x: q.x, y: q.y, r: 46, t: now });
      start();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }).observe(hero);
    }
    doc.addEventListener('visibilitychange', function () { if (!doc.hidden) start(); });
    window.addEventListener('resize', resize);
    window.addEventListener('logo:done', function () { logoDone = true; });
    resize();
    start();
  }

  /* ------------------------------------------------------------ menu mobile */
  function menu() {
    var b = $('#burger'), m = $('#menu');
    if (!b || !m) return;
    function set(open) {
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      m.classList.toggle('open', open);
      doc.body.style.overflow = open ? 'hidden' : '';
    }
    b.addEventListener('click', function () { set(b.getAttribute('aria-expanded') !== 'true'); });
    m.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) set(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  /* ------------------------------------------------------------ init */
  window.FX = { bindTilt: bindTilt, bindMagnet: bindMagnet, observeReveal: function () {}, reduce: reduce };

  intro();
  menu();
  manifesto();
  marquee();
  counters();
  reveal();
  cursor();
  heroCanvas();
  $$('[data-magnet]').forEach(bindMagnet);
  $$('[data-tilt]').forEach(function (el) { bindTilt(el, 6); });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  velocityLoop();
})();
