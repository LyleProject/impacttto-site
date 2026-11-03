/* Logo se "tatuando": cada traço é desenhado em sequência, com uma faísca na ponta da agulha. */
(function () {
  'use strict';
  var svg = document.getElementById('logo');
  var stage = document.getElementById('logoStage');
  var spark = document.getElementById('spark');
  if (!svg || !stage) return;

  var paths = Array.prototype.slice.call(svg.querySelectorAll('[data-draw]'));
  if (!paths.length || !paths[0].getTotalLength) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function finish() {
    paths.forEach(function (p) { p.style.strokeDasharray = 'none'; p.style.strokeDashoffset = '0'; p.style.opacity = '1'; });
    svg.classList.add('done');
    if (spark) spark.style.opacity = '0';
  }
  if (reduce) { finish(); return; }

  var lens = paths.map(function (p) { return p.getTotalLength(); });
  // início e duração (s) de cada traço: V primeiro, asas em pares, depois os detalhes finos
  var plan = paths.map(function (p, i) {
    var start, dur = 0.45 + lens[i] / 760 * 0.85;
    if (i === 0) start = 0;
    else if (i <= 10) start = 0.95 + Math.floor((i - 1) / 2) * 0.24;
    else if (i === 11) start = 2.0;
    else start = 2.05 + Math.floor((i - 12) / 2) * 0.13;
    return { start: start, dur: dur };
  });
  var total = plan.reduce(function (m, p) { return Math.max(m, p.start + p.dur); }, 0);

  paths.forEach(function (p) {
    p.style.strokeDasharray = '1 1';
    p.style.strokeDashoffset = '1';
    p.style.opacity = '0';
  });

  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  var t0 = null, delay = 0.35;
  function place(i, prog) {
    if (!spark) return;
    var p = paths[i];
    var pt = svg.createSVGPoint();
    var q = p.getPointAtLength(lens[i] * prog);
    pt.x = q.x; pt.y = q.y;
    var m = p.getScreenCTM();
    if (!m) return;
    var s = pt.matrixTransform(m);
    var r = stage.getBoundingClientRect();
    spark.style.transform = 'translate(' + (s.x - r.left) + 'px,' + (s.y - r.top) + 'px)';
  }

  function tick(ts) {
    if (t0 === null) t0 = ts;
    var t = (ts - t0) / 1000 - delay;
    var lead = -1, leadStart = -1;
    for (var i = 0; i < paths.length; i++) {
      var pl = plan[i];
      var k = (t - pl.start) / pl.dur;
      if (k <= 0) continue;
      var e = ease(Math.min(1, k));
      paths[i].style.opacity = '1';
      paths[i].style.strokeDashoffset = String(1 - e);
      if (k < 1 && pl.start > leadStart) { lead = i; leadStart = pl.start; }
    }
    if (spark) {
      if (lead >= 0) {
        var kk = ease(Math.min(1, (t - plan[lead].start) / plan[lead].dur));
        place(lead, kk);
        spark.style.opacity = '1';
      } else spark.style.opacity = '0';
    }
    if (t < total + 0.05) requestAnimationFrame(tick);
    else { finish(); window.dispatchEvent(new Event('logo:done')); }
  }
  requestAnimationFrame(tick);
})();
