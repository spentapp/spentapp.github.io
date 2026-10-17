/* SPENT site motion. GSAP + ScrollTrigger. Content is visible by default; this file only adds motion.
   Thesis: one authored moment (the pinned city that changes world with each chapter),
   plus a hero entrance and a few ambient details that stop when offscreen. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('gs'); return; }
  window.__gsOK = true;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true }); // the phone address bar must not re-measure every pin
  var EXPO = 'expo.out', SPRING = 'back.out(1.7)';
  var mq = gsap.matchMedia();
  var rtl = root.dir === 'rtl';

  /* ---------- hero entrance ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    var tl = gsap.timeline({ defaults: { ease: EXPO } });
    tl.to('h1 .hw>span', { yPercent: 0, y: 0, duration: 1.1, stagger: 0.07 }, 0.1)
      .fromTo('h1 mark', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: 0.9, ease: 'power3.inOut' }, 0.55)
      .to('.hero .rise', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.45)
      .fromTo('.hero .stage .city-card', { opacity: 0, scale: 0.9, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 1.2 }, 0.2);
    gsap.set('.hero .rise', { y: 24 });
    tl.eventCallback('onComplete', function () {
      // ambient: gentle float, paused when the hero is offscreen
      var floats = [];
      document.querySelectorAll('.hero .sticker').forEach(function (el, i) {
        floats.push(gsap.to(el, { y: (i % 2 ? 9 : -9), rotation: (i % 2 ? -4 : 4), duration: 2.2 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      });
      ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: function (s) { floats.forEach(function (f) { s.isActive ? f.play() : f.pause(); }); } });
    });
    // parallax depth on the stickers (scrub), via yPercent so it never fights the float
    document.querySelectorAll('.hero .sticker').forEach(function (el, i) {
      gsap.to(el, { yPercent: (i % 2 ? 45 : -45), ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } });
    });
  }

  /* ---------- category tiles ---------- */
  if (document.querySelector('.tile')) {
    ScrollTrigger.batch('.tile', {
      start: 'top 90%', once: true,
      onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: SPRING, stagger: 0.05, overwrite: true }); }
    });
  }

  /* ---------- final residents ---------- */
  var res = document.querySelectorAll('.res img');
  if (res.length) {
    gsap.set(res, { transformOrigin: '50% 100%' });
    ScrollTrigger.create({
      trigger: '.res', start: 'top 92%', once: true,
      onEnter: function () {
        gsap.fromTo(res, { opacity: 0, y: 70, scaleY: 0.7 }, { opacity: 1, y: 0, scaleY: 1, duration: 0.9, ease: SPRING, stagger: 0.09,
          onComplete: function () {
            var bobs = [];
            res.forEach(function (el, i) { bobs.push(gsap.to(el, { y: -7, rotation: i % 2 ? 2 : -2, duration: 1.4 + (i % 3) * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.15 })); });
            ScrollTrigger.create({ trigger: '.final', start: 'top bottom', end: 'bottom top', onToggle: function (s) { bobs.forEach(function (b) { s.isActive ? b.play() : b.pause(); }); } });
          } });
      }
    });
  }


  /* ---------- section headings: lines rise out of a mask ---------- */
  document.querySelectorAll('.strip h2, .know h2, section > h2, .final h2').forEach(function (h) {
    if (h.closest('.hero')) return;
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map(function (w) { return '<span class="hm" aria-hidden="true"><span>' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></span>'; }).join(' ');
    gsap.set(h.querySelectorAll('.hm > span'), { yPercent: 115 });
    ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () {
      gsap.to(h.querySelectorAll('.hm > span'), { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 });
    } });
  });

  /* ---------- pair cards: slide in from opposite sides, icon spins in, tilt on hover ---------- */
  document.querySelectorAll('.pair .card').forEach(function (el, i) {
    var big = el.querySelector('.big');
    var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    tl.fromTo(el, { opacity: 0, x: i % 2 ? 70 : -70, rotation: i % 2 ? 3 : -3 }, { opacity: 1, x: 0, rotation: 0, duration: 1, ease: 'expo.out' });
    if (big) tl.fromTo(big, { scale: 0, rotation: -60 }, { scale: 1, rotation: 0, duration: 0.9, ease: SPRING }, 0.25);
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      var rx = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3.out' }), ry = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3.out' });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 8); rx(-((e.clientY - r.top) / r.height - 0.5) * 8); });
      el.addEventListener('pointerleave', function () { rx(0); ry(0); });
    }
  });

  /* ---------- list items, faq rows, chapter extras ---------- */
  function stag(sel, from, trig) {
    var els = document.querySelectorAll(sel); if (!els.length) return;
    gsap.set(els, from);
    ScrollTrigger.batch(els, { start: 'top 92%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, overwrite: true }); } });
  }
  stag('.know li', { opacity: 0, x: -36 });
  stag('details', { opacity: 0, y: 28 });
  stag('.what-txt p', { opacity: 0, y: 30 });
  stag('.fit li', { opacity: 0, x: rtl ? 30 : -30 });
  stag('.avs img', { opacity: 0, y: 30, scale: 0.6, rotation: -12 });
  stag('.wnames li', { opacity: 0, y: 20, scale: 0.85 });
  document.querySelectorAll('.ch').forEach(function (ch) {
    var ico = ch.querySelector('.chico'); if (!ico) return;
    ScrollTrigger.create({ trigger: ch, start: 'top 60%', end: 'bottom 40%', onEnter: pop, onEnterBack: pop });
    function pop() { gsap.fromTo(ico, { scale: 0.5, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.8, ease: SPRING, overwrite: true }); }
  });
  /* the big word between sections drifts sideways with the scroll */
  document.querySelectorAll('[data-drift]').forEach(function (el) {
    gsap.fromTo(el, { xPercent: -4 }, { xPercent: 4, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  });


  /* ---------- the page colour drifts from section to section ---------- */
  (function () {
    if (matchMedia('(max-width:600px)').matches) return;
    var map = [['.hero', '#FFFFFF'], ['.manifesto', '#FFF3CF'], ['.strip', '#E4F4E8'], ['.story', '#FFF6EC'],
               ['.inside', '#FFFFFF'], ['.pair', '#F1EAFF'], ['.what', '#FFFFFF'], ['.know', '#E6F0FF'], ['main > section:nth-last-of-type(2)', '#FFF3CF'], ['.final', '#E4F4E8']];
    var body = document.body;
    map.forEach(function (m) {
      var el = document.querySelector(m[0]); if (!el) return;
      ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', refreshPriority: -1,
        onToggle: function (s) { if (s.isActive) gsap.to(body, { backgroundColor: m[1], duration: 0.9, ease: 'power2.out', overwrite: 'auto' }); } });
    });
  })();

  /* ---------- buttons: colour floods in from the pointer, and they lean toward it ---------- */
  (function () {
    var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
    document.querySelectorAll('.btn, .badge:not(.soon), nav.main a.go').forEach(function (b) {
      function at(e) { var r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
      b.addEventListener('pointerenter', at); b.addEventListener('pointerleave', at);
      if (!fine) return;
      var qx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' }), qy = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' });
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); qx((e.clientX - (r.left + r.width / 2)) * 0.22); qy((e.clientY - (r.top + r.height / 2)) * 0.3); });
      b.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
  })();

  /* ---------- the hero city: the page holds still while the scroll turns the island a full circle,
                  and it also turns toward the pointer ---------- */
  (function () {
    var hero = document.querySelector('.hero'), stage = hero && hero.querySelector('.stage'), card = stage && stage.querySelector('.city-card');
    if (!card) return;
    var look = { x: 0, y: 0 }, spin = 0;
    function push() {
      var f = card.querySelector('iframe');
      try { if (f && f.contentWindow.setCityLook) f.contentWindow.setCityLook(look.x + spin, look.y); } catch (err) {}
    }
    var small = matchMedia('(max-width:900px)').matches;
    var copy = hero.querySelectorAll('.intro, .cta'); // wrappers; the entrance animates their children, not them
    if (matchMedia('(max-width:600px)').matches) {
      // phones: the stage is held by CSS sticky; the scroll only swaps the words (opacity) and turns the island inside its own canvas
      var items = [].slice.call(hero.querySelectorAll('.mi')), N = items.length;
      ScrollTrigger.create({ trigger: stage, start: 'top top', end: 'bottom bottom', onUpdate: function (s) {
        var p = s.progress, t = Math.min(1, p / 0.82) * (N - 1);
        items.forEach(function (el, k) { var d = Math.abs(t - k), o = Math.max(0, Math.min(1, 1 - (d - 0.22) * 4)); el.style.opacity = o.toFixed(3); el.style.transform = 'translate3d(0,' + ((k - t) * 46).toFixed(1) + 'px,0)'; el.style.pointerEvents = o > 0.6 ? 'auto' : 'none'; });
        spin = p * Math.PI * 2; push();
      } });
    } else {
      var tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: small ? '+=70%' : '+=110%', pin: true, scrub: 0.6,
        onUpdate: function (s) { spin = s.progress * Math.PI * 2; push(); } } });
      tl.to(stage, { scale: small ? 1.08 : 1.22, yPercent: small ? -8 : -20, ease: 'none' }, 0)
        .to(copy, { y: small ? -30 : -70, opacity: 0.12, ease: 'none' }, 0);
    }

    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    setTimeout(function () {
      gsap.set(card, { transformPerspective: 1000, transformOrigin: '50% 60%' });
      var ry = gsap.quickTo(card, 'rotationY', { duration: 0.8, ease: 'power3.out' }), rx = gsap.quickTo(card, 'rotationX', { duration: 0.8, ease: 'power3.out' });
      var ix = gsap.quickTo(card, 'x', { duration: 1, ease: 'power3.out' }), iy = gsap.quickTo(card, 'y', { duration: 1, ease: 'power3.out' });
      addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        var nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
        ry(nx * 14); rx(-ny * 10); ix(nx * 34); iy(ny * 20);
        look.x = nx * 1.1; look.y = -ny * 0.25; push();
      }, { passive: true });
      document.documentElement.addEventListener('pointerleave', function () { ry(0); rx(0); ix(0); iy(0); look.x = 0; look.y = 0; push(); });
    }, 2600);
  })();

  /* ---------- inside the app: phones rise into place, then float, and lean toward the pointer ---------- */
  (function () {
    var phs = [].slice.call(document.querySelectorAll('.inside .ph')); if (!phs.length) return;
    var scrs = phs.map(function (p) { return p.querySelector('.scr'); });
    phs.forEach(function (el, i) {
      gsap.fromTo(el, { y: 160 + (i % 2) * 100, opacity: 0, rotation: i % 2 ? 4 : -4, scale: 0.9 },
        { y: 0, opacity: 1, rotation: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.inside', start: 'top 95%', end: 'top 20%', scrub: 0.8 } });
    });
    // idle float on the screens (separate element, so it never fights the scroll reveal)
    var floats = scrs.map(function (s, i) { return gsap.to(s, { y: i % 2 ? 10 : -10, duration: 2.4 + i * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }); });
    ScrollTrigger.create({ trigger: '.inside', start: 'top bottom', end: 'bottom top', onToggle: function (s) { floats.forEach(function (f) { s.isActive ? f.play() : f.pause(); }); } });
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var sec = document.querySelector('.inside');
    var q = scrs.map(function (s) {
      gsap.set(s, { transformPerspective: 900 });
      return { ry: gsap.quickTo(s, 'rotationY', { duration: 0.7, ease: 'power3.out' }), rx: gsap.quickTo(s, 'rotationX', { duration: 0.7, ease: 'power3.out' }), sc: gsap.quickTo(s, 'scale', { duration: 0.5, ease: 'power3.out' }) };
    });
    sec.addEventListener('pointermove', function (e) {
      scrs.forEach(function (s, i) {
        var r = s.getBoundingClientRect(), nx = (e.clientX - (r.left + r.width / 2)) / innerWidth, ny = (e.clientY - (r.top + r.height / 2)) / innerHeight;
        q[i].ry(nx * 26); q[i].rx(-ny * 14);
        var over = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
        q[i].sc(over ? 1.06 : 1);
      });
    });
    sec.addEventListener('pointerleave', function () { q.forEach(function (o) { o.ry(0); o.rx(0); o.sc(1); }); });
  })();

  /* the bottom Download pill on phones steps away when the page's own download buttons are on screen */
  (function () {
    var fin = document.querySelector('.final') || document.querySelector('.dl-hero');
    if (fin) ScrollTrigger.create({ trigger: fin, start: 'top 85%', end: 'bottom top', onToggle: function (s) { root.classList.toggle('at-end', s.isActive); } });
  })();

  /* ---------- the story: a carousel of living cities that slides with the chapters ---------- */
  var story = document.querySelector('.story');
  var cfg = window.SPENT;
  if (!story || !cfg) return;
  var card = document.getElementById('xcard'), tag = document.getElementById('wtag');
  var chs = [].slice.call(story.querySelectorAll('.ch'));
  var dots = [].slice.call(story.querySelectorAll('.xprog i'));
  var track = card.querySelector('.xtrack');
  var slides = [].slice.call(card.querySelectorAll('.xsl'));
  var KEYS = slides.map(function (s) { return s.getAttribute('data-w'); });
  var NAMES = cfg.worlds.slice(0, KEYS.length);
  var FLAG = { urban: '', coastal: '_coastalWorld', jungle: '_jungleWorld', future: '_futureWorld', pink: '_pinkWorld' };
  var MAPW = chs.map(function (c) { return KEYS.indexOf(c.getAttribute('data-world')); });
  var HOUR = {}; chs.forEach(function (c) { var k = c.getAttribute('data-world'); if (!(k in HOUR)) HOUR[k] = +c.getAttribute('data-hour'); });
  var liveOK = !(navigator.connection && navigator.connection.saveData) && window.fetch && window.Blob && window.URL;
  var small = matchMedia('(max-width:900px)').matches;
  var REACH = small ? 1.7 : 2.7;            // how many slides away a live city is kept (the ones near the frame are all moving)
  if (small) {
    // phones get a plain sequence of pictures + words (see CSS): just let each picture settle in once
    chs.forEach(function (c) {
      var im = c.querySelector('.chimg');
    });
    return;
  }
  var lives = {}, src = null, srcP = null, booted = false, inView = false, queue = [], busy = false;
  var state = { f: 0 }, shownIdx = 0, chIdx = -1;

  function loadSrc() { return srcP || (srcP = fetch('/city/diorama.html').then(function (r) { return r.text(); }).then(function (t) { src = t; return t; })); }
  function htmlFor(k) {
    var inj = '<script>' + (FLAG[k] ? 'window.' + FLAG[k] + '=true;' : '') + 'window._initialPowerMode="' + (small ? 'economy' : 'normal') + '";<\/script>';
    return src.replace('<body>', '<body>' + inj);
  }
  function whenReady(w, cb, n) {
    try { if (w.updateDioramaData && w.setCityOverview && w.setTimeOfDay) { cb(); return; } } catch (e) {}
    if ((n || 0) < 80) setTimeout(function () { whenReady(w, cb, (n || 0) + 1); }, 200);
  }
  function kill(i) {
    var l = lives[i]; if (!l) return; delete lives[i];
    try { l.f.contentWindow.disposeDioramaRendering(); } catch (e) {}
    l.f.remove(); URL.revokeObjectURL(l.url);
    var p = slides[i].querySelector('img.xp'); if (p) p.style.opacity = 1;
  }
  function mount(i, done) {
    if (lives[i]) { done(); return; }
    loadSrc().then(function () {
      if (lives[i]) { done(); return; }
      var k = KEYS[i], url = URL.createObjectURL(new Blob([htmlFor(k)], { type: 'text/html' }));
      var f = document.createElement('iframe');
      f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.setAttribute('scrolling', 'no'); f.title = cfg.iframeTitle || '';
      var l = { f: f, url: url, ready: false, k: k, paused: false };
      lives[i] = l;
      f.addEventListener('load', function () {
        whenReady(f.contentWindow, function () {
          var w = f.contentWindow; l.w = w;
          w.updateDioramaData(cfg.data); w.setTimeOfDay(HOUR[k] || 13, false); w.setCityOverview(true);
          // reveal only once the live city has really drawn frames, then hide the picture under it (no blank, no double)
          var w = f.contentWindow, s0 = -1, t0 = Date.now();
          (function wait() {
            if (lives[i] !== l) return;
            var n = -1; try { n = w.cityFramesRendered ? w.cityFramesRendered() : -1; } catch (e) {}
            if (s0 < 0 && n >= 0) s0 = n;
            if ((n >= 0 && n - s0 >= 24) || Date.now() - t0 > 20000) {
              l.ready = true; f.classList.add('on');
              var p = slides[i].querySelector('img.xp'); if (p && n >= 0 && n - s0 >= 24) setTimeout(function () { if (lives[i] === l) p.style.opacity = 0; }, 900);
              applyPause(i); done(); return;
            }
            setTimeout(wait, 200);
          })();
        });
      });
      f.src = url; slides[i].appendChild(f);
    });
  }
  function pump() {            // one city loads at a time so the page never stalls
    if (busy || !queue.length) return; busy = true;
    var i = queue.shift(); mount(i, function () { busy = false; pump(); });
  }
  function applyPause(i) {
    var l = lives[i]; if (!l || !l.ready) return;
    var want = !inView || Math.abs(state.f - i) >= 1.35;
    if (want !== l.paused) { l.paused = want; try { l.w.pauseDioramaRendering(want); } catch (e) {} }
  }
  function ensure() {
    if (!booted || !liveOK) return;
    var order = [];
    for (var i = 0; i < slides.length; i++) { var d = Math.abs(state.f - i); if (d < REACH) order.push([d, i]); }
    order.sort(function (a, b) { return a[0] - b[0]; });
    order.forEach(function (o) { if (!lives[o[1]] && queue.indexOf(o[1]) < 0) queue.push(o[1]); });
    queue.sort(function (a, b) { return Math.abs(state.f - a) - Math.abs(state.f - b); });
    for (var j = 0; j < slides.length; j++) { if (lives[j] && Math.abs(state.f - j) > REACH + 0.9) kill(j); applyPause(j); }
    pump();
  }

  var GAP = 0.22, SW = 0.78;
  function render() {
    var f = state.f, cw = card.clientWidth, sw = cw * SW, step = cw * (SW + GAP);
    gsap.set(track, { x: (cw - sw) / 2 - f * step });
    slides.forEach(function (sl, i) {
      var d = Math.min(1.4, Math.abs(f - i));
      gsap.set(sl, { scale: 1 - 0.12 * d, opacity: 1 - 0.4 * Math.min(1, d), rotationY: 0 });
    });
    var r = Math.round(f);
    if (r !== shownIdx) {
      shownIdx = r; tag.textContent = NAMES[r] || '';
      gsap.fromTo(tag, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: EXPO });
    }
    ensure();
  }
  var toF = gsap.quickTo(state, 'f', { duration: 0.35, ease: 'power2.out', onUpdate: render });

  function setUI(i) {
    chs.forEach(function (c, j) { c.classList.toggle('on', j === i); });
    dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
  }
  function activate(i) {
    if (i === chIdx) return; chIdx = i; setUI(i);
    var ch = chs[i], bits = ch.querySelectorAll('.chico,.avs img,.wnames li');
    gsap.fromTo(bits, { opacity: 0, y: 14, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: SPRING, stagger: 0.07, overwrite: true });
    var l = lives[MAPW[i]], hour = +ch.getAttribute('data-hour');   // same city, new hour: it moves through the day
    if (l && l.ready) { try { l.w.setTimeOfDay(hour, true); } catch (e) {} }
  }
  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  var tick = false;
  function onScroll() {
    tick = false;
    var line = innerHeight * (matchMedia('(max-width:900px)').matches ? 0.62 : 0.55), n = chs.length, t = 0;
    var centers = chs.map(function (c) { var r = c.getBoundingClientRect(); return r.top + r.height / 2; });
    if (line <= centers[0]) t = 0; else if (line >= centers[n - 1]) t = n - 1;
    else { for (var i = 0; i < n - 1; i++) { if (line >= centers[i] && line < centers[i + 1]) { t = i + (line - centers[i]) / (centers[i + 1] - centers[i]); break; } } }
    if (small) {
      // phones: no per-scroll motion (iOS momentum scrolling made the track shake); one clean slide per chapter
      var k = Math.round(t);
      if (k !== chIdx) gsap.to(state, { f: MAPW[k], duration: 0.75, ease: 'power3.inOut', onUpdate: render, overwrite: true });
      activate(k);
      return;
    }
    var i0 = Math.floor(t), fr = t - i0, a = MAPW[i0], b = MAPW[Math.min(i0 + 1, n - 1)];
    toF(a + (b - a) * smooth((fr - 0.3) / 0.4));      // the city rests while its chapter is read, then glides to the next
    activate(Math.round(t));
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', function () { render(); onScroll(); });

  function boot() {
    if (booted) return; booted = true;
    // the hero city stays alive (it pauses itself when off screen), so it never turns into a picture
    ensure();
  }
  ScrollTrigger.create({ trigger: story, start: 'top 130%', once: true, onEnter: boot });
  ScrollTrigger.create({ trigger: story, start: 'top bottom', end: 'bottom top', onToggle: function (s) {
    inView = s.isActive; for (var j = 0; j < slides.length; j++) applyPause(j);
  } });
  setUI(0); chIdx = 0; render();
  mq.add('(min-width:901px)', function () {
    gsap.fromTo(card, { scale: 0.94 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: story, start: 'top 90%', end: 'top 30%', scrub: 0.5 } });
  });
})();
