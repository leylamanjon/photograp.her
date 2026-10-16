(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els = Array.prototype.slice.call(document.querySelectorAll('.band-photo .ph, .ph.bleed'));
  els.forEach(function (e) { e.classList.add('plx'); });
  var tick = false;
  function upd() {
    tick = false;
    var vh = innerHeight, k = innerWidth < 700 ? 0.14 : 0.24;
    els.forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.height === 0 || r.bottom < -50 || r.top > vh + 50) return;
      var p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
      p = Math.max(-1, Math.min(1, p));
      e.style.setProperty('--py', (-p * r.height * k).toFixed(1) + 'px');
    });
  }
  function req() { if (!tick) { tick = true; requestAnimationFrame(upd); } }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  addEventListener('hashchange', function () { setTimeout(req, 300); });
  addEventListener('popstate', function () { setTimeout(req, 300); });
  document.addEventListener('click', function () { setTimeout(req, 400); });
  req();
})();
