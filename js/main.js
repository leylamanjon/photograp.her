/* ---------- Loader: espera fuentes + mínimo de tiempo ---------- */
(function () {
  var root = document.documentElement, loader = document.getElementById('loader');
  var seen = false;
  try { seen = sessionStorage.getItem('ph-loader') === '1'; } catch (e) {}
  if (!seen && window.name === 'ph-loader') seen = true;
  if (seen) { root.classList.add('no-loader'); return; }
  root.classList.add('is-loading');
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var fonts = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, wait(3000)]) : Promise.resolve();
  Promise.all([wait(1800), fonts]).then(function () {
    loader.classList.add('is-done');
    root.classList.remove('is-loading');
    try { sessionStorage.setItem('ph-loader', '1'); } catch (e) {}
    try { if (!window.name) window.name = 'ph-loader'; } catch (e) {}
  });
})();

(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var header = document.querySelector('.header');
  var mainEl = document.getElementById('main');
  var announcer = document.getElementById('announcer');
  var toggle = document.querySelector('.header__toggle');
  var menu = document.getElementById('menu');
  try { history.scrollRestoration = 'manual'; } catch (e) {}

  /* ---------- Menús ---------- */
  function closeMenus() {
    menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(open));
    header.classList.remove('is-hidden');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { closeMenus(); toggle.focus(); } });

  /* ---------- Aparición al hacer scroll ---------- */
  var io = (!reduced && 'IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; io.unobserve(el); el.classList.add('in');
      setTimeout(function () { el.classList.remove('reveal', 'in'); el.style.transitionDelay = ''; }, 1500);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }) : null;
  var REVEAL = '.wrap > *:not(.detail), .grid > *, .valores > *, .gal > *, .row, .persona, .testimonios, .infobox, .split > *, .hero__text, .hero__actions, .noticia';
  function prime(view) {
    if (!io) return;
    var list = Array.prototype.slice.call(view.querySelectorAll(REVEAL));
    list = list.filter(function (el) { return !list.some(function (o) { return o !== el && el.contains(o); }); });
    var counts = new Map();
    list.forEach(function (el) {
      if (el.classList.contains('reveal')) return;
      var n = counts.get(el.parentNode) || 0; counts.set(el.parentNode, n + 1);
      el.style.transitionDelay = Math.min(n, 5) * 90 + 'ms';
      el.classList.add('reveal'); io.observe(el);
    });
  }

  /* ---------- Contador lateral (proyectos) ---------- */
  var sidecount = document.getElementById('sidecount'), secs = [];
  function setupSide(view) {
    secs = [];
    if ((view.dataset.route || '').indexOf('proyectos/') === 0) secs = Array.prototype.slice.call(view.querySelectorAll('section.wrap'));
    sidecount.classList.toggle('is-on', secs.length > 1);
    updateSide();
  }
  function updateSide() {
    if (secs.length < 2) return;
    var cur = 0;
    secs.forEach(function (s, i) { if (s.getBoundingClientRect().top < innerHeight * 0.5) cur = i; });
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    sidecount.textContent = pad(cur + 1) + ' / ' + pad(secs.length);
  }

  /* ---------- Header: vidrio y auto-ocultar ---------- */
  var lastY = scrollY, ticking = false, progress = document.getElementById('progress');
  function onScroll() {
    var y = scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (y > 120 && y > lastY + 6) header.classList.add('is-compact'); else if (y < lastY - 6 || y < 40) header.classList.remove('is-compact');
    if (progress) {
      var on = activeKey && activeKey.indexOf('proyectos/') === 0, max = document.documentElement.scrollHeight - innerHeight;
      progress.classList.toggle('is-on', !!on && max > 0);
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
    var locked = menu.classList.contains('is-open') || header.contains(document.activeElement);
    header.classList.remove('is-hidden');
    lastY = y; updateSide(); ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden', 'is-compact'); });

  /* ---------- Rutas ---------- */
  var activeView = null, activeKey = null, first = true, forced = null, popped = false, timer = null, curQuery = '';
  function applyQuery(view) {
    if (view.dataset.route !== 'contacto') return;
    var m = /(?:^|&)tipo=([^&]*)/.exec(curQuery || ''); var sel = document.getElementById('c-tipo');
    if (m && m[1] && Array.prototype.some.call(sel.options, function (o) { return o.value === m[1]; })) sel.value = m[1];
  }
  var scrollPos = {};
  function hashPath() { return (location.hash || '').replace(/^#\/?/, '').replace(/\/$/, ''); }

  var flipFrom = null;
  function flip(view) {
    var from = flipFrom; flipFrom = null;
    if (!from || reduced) return;
    var t = view.querySelector('.ph.bleed'); if (!t) return;
    var tr = t.getBoundingClientRect();
    if (tr.width < 10 || tr.bottom < 0 || tr.top > innerHeight) return;
    var fx = document.createElement('div'); fx.className = 'fx';
    fx.style.cssText = 'left:' + tr.left + 'px;top:' + tr.top + 'px;width:' + tr.width + 'px;height:' + tr.height + 'px';
    var tf = t.style.getPropertyValue('--foto'); if (tf) fx.style.setProperty('--foto', tf);
    document.body.appendChild(fx);
    t.style.opacity = '0';
    var dx = from.left - tr.left, dy = from.top - tr.top, sx = from.width / tr.width, sy = from.height / tr.height;
    var done = function () { t.style.opacity = ''; if (fx.parentNode) fx.parentNode.removeChild(fx); };
    try {
      var an = fx.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')' }, { transform: 'none' }], { duration: 800, easing: 'cubic-bezier(.22,1,.36,1)' });
      an.onfinish = function () { t.style.transition = 'opacity .25s'; done(); setTimeout(function () { t.style.transition = ''; }, 300); };
      an.oncancel = done;
    } catch (e) { done(); }
  }

  function show(view, y, focusIt) {
    views.forEach(function (v) { v.classList.remove('is-active', 'is-leaving'); });
    view.classList.add('is-active');
    var title = view.dataset.title || 'photograp.her';
    document.title = title;
    var current = view.dataset.nav !== undefined ? view.dataset.nav : view.dataset.route;
    navLinks.forEach(function (a) {
      if (a.dataset.nav === current) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var dropBtn = document.querySelector('.drop > button');
    if (dropBtn) { if (current === 'instituciones' || current === 'fotografas') dropBtn.setAttribute('aria-current', 'true'); else dropBtn.removeAttribute('aria-current'); }
    closeMenus();
    header.classList.remove('is-hidden');
    window.scrollTo(0, y || 0); lastY = y || 0;
    prime(view); setupSide(view); applyQuery(view);
    announcer.textContent = title.replace(' · photograp.her', '');
    flip(view);
    if (focusIt) { var h = view.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
  }

  function route() {
    var raw = forced !== null ? forced : hashPath(); forced = null;
    var qi = raw.indexOf('?'); var path = qi > -1 ? raw.slice(0, qi) : raw; curQuery = qi > -1 ? raw.slice(qi + 1) : '';
    var view = views.filter(function (v) { return v.dataset.route === path; })[0] || document.querySelector('.view[data-route="404"]');
    var restoreY = popped ? (scrollPos[view.dataset.route] || 0) : 0; popped = false;
    if (view === activeView) { applyQuery(view); return; }
    if (activeView) scrollPos[activeKey] = scrollY;
    var prev = activeView;
    activeView = view; activeKey = view.dataset.route;
    clearTimeout(timer);
    if (first || reduced || !prev) { show(view, restoreY, !first); }
    else {
      prev.classList.add('is-leaving'); prev.classList.remove('is-active');
      timer = setTimeout(function () { show(view, restoreY, true); }, 240);
    }
    first = false;
  }

  document.addEventListener('click', function (e) {
    var skip = e.target.closest && e.target.closest('a.skip');
    if (skip) { e.preventDefault(); mainEl.focus(); return; }
    var a = e.target.closest && e.target.closest('a[href^="#/"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    e.preventDefault();
    var path = a.getAttribute('href').replace(/^#\/?/, '').replace(/\/$/, '');
    flipFrom = null;
    if (/^proyectos\/./.test(path) && !reduced) {
      var src = a.matches('.proyecto .feature') ? a : (a.querySelector('.ph') || a.querySelector('.feature') || (a.closest('.proyecto') && a.closest('.proyecto').querySelector('.feature')));
      if (src) { var rc = src.getBoundingClientRect(); if (rc.width > 10) flipFrom = { left: rc.left, top: rc.top, width: rc.width, height: rc.height }; }
    }
    try { history.pushState(null, '', '#/' + path); } catch (err) { try { location.hash = '#/' + path; } catch (e2) {} }
    forced = path; route();
  });
  addEventListener('popstate', function () { forced = null; popped = true; route(); });
  addEventListener('hashchange', function () {
    if (location.hash && !/^#\//.test(location.hash)) return;
    forced = null; route();
  });

  /* ---------- Hero: fundido cruzado + progreso ---------- */
  var hero = document.querySelector('.hero');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hslide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));
  var cur = 0, heroTimer = null, userPaused = reduced;
  var pauseBtn = document.querySelector('.hero__pause');
  function syncPause() {
    if (!pauseBtn) return;
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    pauseBtn.setAttribute('aria-label', userPaused ? 'Reproducir carrusel' : 'Pausar carrusel');
    pauseBtn.querySelector('use').setAttribute('href', userPaused ? '#i-play' : '#i-pause');
    if (hero) hero.classList.toggle('is-paused', userPaused);
  }
  function go(i) {
    cur = i;
    slides.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
    dots.forEach(function (d, n) { d.setAttribute('aria-current', String(n === i)); });
  }
  function heroStart() { clearInterval(heroTimer); if (reduced || userPaused) return; heroTimer = setInterval(function () { go((cur + 1) % slides.length); }, 6000); }
  dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); heroStart(); }); });
  if (hero) {
    hero.addEventListener('mouseenter', function () { clearInterval(heroTimer); hero.classList.add('is-paused'); });
    hero.addEventListener('mouseleave', function () { if (!userPaused) { hero.classList.remove('is-paused'); heroStart(); } });
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(heroTimer); else heroStart(); });
  if (pauseBtn) pauseBtn.addEventListener('click', function () { userPaused = !userPaused; syncPause(); if (userPaused) clearInterval(heroTimer); else heroStart(); });
  syncPause(); heroStart();

  /* ---------- Cursor "Ver" ---------- */
  var cursor = document.getElementById('cursor');
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced) {
    var cx = 0, cy = 0, tx = 0, ty = 0, raf = null;
    function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      raf = (Math.abs(tx - cx) > .1 || Math.abs(ty - cy) > .1) ? requestAnimationFrame(loop) : null;
    }
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      var t = e.target.closest && e.target.closest('.row, .proyecto, .noticia, .next, [data-zoom]');
      if (t) { cursor.textContent = t.matches('[data-zoom]') ? 'Ampliar' : 'Ver'; if (!cursor.classList.contains('is-on')) { cx = tx; cy = ty; } }
      cursor.classList.toggle('is-on', !!t);
      if (!raf) raf = requestAnimationFrame(loop);
    });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); });
  }

  /* ---------- Visor de imágenes ---------- */
  var lb = document.getElementById('lb'), lbCount = document.getElementById('lb-count');
  var lbItems = [], lbIdx = 0, lbReturn = null;
  var inertEls = [header, mainEl, document.querySelector('.footer')];
  Array.prototype.forEach.call(document.querySelectorAll('.view'), function (v) {
    var z = v.querySelectorAll('[data-zoom]');
    Array.prototype.forEach.call(z, function (el, i) {
      el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'Ampliar imagen ' + (i + 1) + ' de ' + z.length + (el.dataset.alt ? ': ' + el.dataset.alt : ''));
    });
  });
  function lbRender() {
    var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
    lbCount.textContent = pad2(lbIdx + 1) + ' / ' + pad2(lbItems.length);
    var cur = lbItems[lbIdx], im = lb.querySelector('.lb__img'), fv = cur && cur.style.getPropertyValue('--foto');
    if (im) { if (fv) im.style.setProperty('--foto', fv); else im.style.removeProperty('--foto'); if (cur && cur.dataset.alt) im.setAttribute('aria-label', cur.dataset.alt); }
    var one = lbItems.length < 2;
    lb.querySelector('.lb__prev').style.display = one ? 'none' : ''; lb.querySelector('.lb__next').style.display = one ? 'none' : '';
  }
  function lbOpen(el) {
    lbItems = Array.prototype.slice.call(el.closest('.view').querySelectorAll('[data-zoom]'));
    lbIdx = lbItems.indexOf(el); lbReturn = el; lbRender();
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); document.documentElement.style.overflow = 'hidden';
    inertEls.forEach(function (n) { if (n) n.inert = true; });
    lb.querySelector('.lb__close').focus();
  }
  function lbClose() {
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); document.documentElement.style.overflow = '';
    inertEls.forEach(function (n) { if (n) n.inert = false; });
    if (lbReturn) lbReturn.focus({ preventScroll: true });
  }
  function lbStep(d) {
    if (lbItems.length < 2) return;
    lbIdx = (lbIdx + d + lbItems.length) % lbItems.length; lbRender();
    var img = lb.querySelector('.lb__img');
    if (img && img.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) img.animate([{ opacity: 0, transform: 'translateX(' + (d > 0 ? 32 : -32) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
    announcer.textContent = 'Imagen ' + (lbIdx + 1) + ' de ' + lbItems.length;
  }
  var tx0 = null, ty0 = 0;
  lb.addEventListener('touchstart', function (e) { var t = e.changedTouches[0]; tx0 = t.clientX; ty0 = t.clientY; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx0 === null) return; var t = e.changedTouches[0], dx = t.clientX - tx0, dy = t.clientY - ty0; tx0 = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) lbStep(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) lbClose();
  }, { passive: true });
  document.addEventListener('click', function (e) {
    var ph = e.target.closest && e.target.closest('[data-zoom]');
    if (ph) { lbOpen(ph); return; }
    if (!lb.classList.contains('is-open')) return;
    if (e.target.closest('.lb__close') || e.target === lb) lbClose();
    else if (e.target.closest('.lb__prev')) lbStep(-1);
    else if (e.target.closest('.lb__next')) lbStep(1);
  });
  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('is-open')) {
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowLeft') lbStep(-1);
      else if (e.key === 'ArrowRight') lbStep(1);
      else if (e.key === 'Home') { lbIdx = 0; lbStep(0); e.preventDefault(); }
      else if (e.key === 'End') { lbIdx = lbItems.length - 1; lbStep(0); e.preventDefault(); }
      else if (e.key === 'Tab') {
        var f = Array.prototype.filter.call(lb.querySelectorAll('button'), function (b) { return b.style.display !== 'none'; });
        var k = f.indexOf(document.activeElement); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); e.preventDefault();
      }
      return;
    }
    if (e.key === 'Escape') closeMenus();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-zoom]')) { e.preventDefault(); lbOpen(e.target); }
  });

  /* ---------- Formularios (demo: aún no envían) ---------- */
  function demoForm(id, msg) {
    var f = document.getElementById(id);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = f.querySelector('.status');
      if (!f.checkValidity()) { status.textContent = 'Revisa los campos obligatorios.'; return; }
      var sb = f.querySelector('button[type=submit]'); if (sb) { sb.classList.add('is-loading'); sb.setAttribute('aria-disabled', 'true'); }
      status.textContent = 'Enviando…';
      setTimeout(function () { if (sb) { sb.classList.remove('is-loading'); sb.removeAttribute('aria-disabled'); } status.textContent = msg; f.reset(); }, 800);
    });
  }

  /* ---------- Contacto: validación útil + envío por correo ---------- */
  (function () {
    var f = document.getElementById('contact-form'), status = document.getElementById('c-status');
    var msgs = {
      tipo: function (v) { return v ? '' : 'Elige el tipo de consulta para dirigir tu mensaje.'; },
      nombre: function (v) { return v.trim() ? '' : 'Escribe tu nombre para saber cómo dirigirnos a ti.'; },
      correo: function (v) { if (!v.trim()) return 'Escribe tu correo para poder responderte.'; return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Revisa el correo: debería verse como nombre@dominio.com.'; },
      mensaje: function (v) { return v.trim().length >= 10 ? '' : 'Cuéntanos brevemente tu propuesta o consulta (mínimo 10 caracteres).'; }
    };
    var fields = { tipo: f.elements.tipo, nombre: f.elements.nombre, correo: f.elements.correo, mensaje: f.elements.mensaje };
    function check(k, focusIt) {
      var el = fields[k], err = document.getElementById(el.id + '-err'), m = msgs[k](el.value);
      if (m) { err.textContent = m; err.hidden = false; el.setAttribute('aria-invalid', 'true'); } else { err.hidden = true; err.textContent = ''; el.removeAttribute('aria-invalid'); }
      return !m;
    }
    Object.keys(fields).forEach(function (k) {
      fields[k].addEventListener('blur', function () { if (fields[k].value || fields[k].hasAttribute('aria-invalid')) check(k); });
      fields[k].addEventListener('input', function () { if (fields[k].hasAttribute('aria-invalid')) check(k); });
      fields[k].addEventListener('change', function () { if (fields[k].hasAttribute('aria-invalid')) check(k); });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'status body'; status.textContent = '';
      var bad = Object.keys(fields).filter(function (k) { return !check(k); });
      if (bad.length) {
        status.className = 'status body is-bad';
        status.textContent = bad.length === 1 ? 'Hay 1 campo por revisar.' : 'Hay ' + bad.length + ' campos por revisar.';
        fields[bad[0]].focus(); return;
      }
      var tipoTxt = fields.tipo.options[fields.tipo.selectedIndex].text;
      var subject = '[' + tipoTxt + '] ' + fields.nombre.value.trim();
      var body = fields.mensaje.value.trim() + '\n\n— ' + fields.nombre.value.trim() + ' (' + fields.correo.value.trim() + ')';
      var sb = f.querySelector('button[type=submit]'), lbl = sb.querySelector('.btn__t'), orig = lbl.innerHTML;
      sb.classList.add('is-loading'); sb.setAttribute('aria-disabled', 'true'); lbl.firstChild.nodeValue = 'Enviando…';
      status.className = 'status body'; status.textContent = 'Enviando…';
      setTimeout(function () {
        sb.classList.remove('is-loading'); sb.removeAttribute('aria-disabled'); lbl.innerHTML = orig;
      status.className = 'status body is-ok';
      status.innerHTML = 'Se abrirá tu programa de correo con el mensaje listo para enviar. Si no se abre, escríbenos a <a class="inline" href="mailto:info@hubphotographer.com">info@hubphotographer.com</a>.';
      status.focus();
      try { location.href = 'mailto:info@hubphotographer.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); } catch (err) {}
      }, 900);
    });
  })();

  /* ---------- Proyectos: filtros y vista ---------- */
  (function () {
    var rows = document.getElementById('rows'); if (!rows) return;
    var items = Array.prototype.slice.call(rows.querySelectorAll('.row'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filters [data-cat]'));
    var views2 = Array.prototype.slice.call(document.querySelectorAll('.filters [data-view]'));
    var year = document.getElementById('f-year'), count = document.getElementById('f-count'), empty = document.getElementById('f-empty');
    var st = { cat: '', year: '' };
    function apply() {
      var n = 0;
      items.forEach(function (r) {
        var ok = (!st.cat || r.dataset.cat === st.cat) && (!st.year || r.dataset.year === st.year);
        r.hidden = !ok; if (ok) n++;
      });
      count.textContent = n === 0 ? 'Ningún proyecto' : n + (n === 1 ? ' proyecto' : ' proyectos') + (n < items.length ? ' de ' + items.length : '');
      empty.hidden = n !== 0;
    }
    chips.forEach(function (c) { c.addEventListener('click', function () {
      st.cat = c.dataset.cat; chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); }); apply();
    }); });
    year.addEventListener('change', function () { st.year = year.value; apply(); });
    views2.forEach(function (v) { v.addEventListener('click', function () {
      rows.classList.toggle('rows--grid', v.dataset.view === 'grid');
      views2.forEach(function (x) { x.setAttribute('aria-pressed', String(x === v)); });
    }); });
    document.getElementById('f-clear').addEventListener('click', function () {
      st.cat = ''; st.year = ''; year.value = '';
      chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.cat === '')); }); apply();
      chips[0].focus();
    });
  })();
  demoForm('news-form', 'Gracias por suscribirte. (Demo)');

  (function () {
    var fav = document.getElementById('favicon'); if (!fav || reduced) return;
    var mk = function (o) { return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23151515'/%3E%3Ccircle cx='16' cy='16' r='5.5' fill='%23ff0000' fill-opacity='" + o + "'/%3E%3C/svg%3E"; };
    var on = true, tm = null;
    function tick() { on = !on; fav.setAttribute('href', mk(on ? 1 : .15)); }
    function start() { clearInterval(tm); tm = setInterval(tick, 800); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) { clearInterval(tm); fav.setAttribute('href', mk(1)); on = true; } else start(); });
    start();
  })();

  route(); onScroll();
})();
