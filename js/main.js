(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const W = window.World, K = W.K;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));

  // ------------------------------------------------------------------
  // Content
  // ------------------------------------------------------------------
  const EDUCATION = [
    { years: '2015 – 2017', title: 'AAIP – VFX', where: 'Arena Animation, Bangalore', line: 'Animation and visual effects. Where the craft took root.' },
    { years: '2020', title: 'Motion Graphics for Advertising & Films', where: 'Arena Animation, certificate', line: 'Sharpening motion design for ads and film.' },
  ];
  const ERAS = [
    { years: '2017 – 2018', name: 'News', who: 'VIP News · Indradhanush News', line: 'Motion graphic designer. Election stings, intros and full broadcast packages on newsroom deadlines.' },
    { years: '2018 – 2022', name: 'Edtech', who: 'LearnCab · Vedantu', line: 'Explainers and ads, then a YouTube ecosystem that crossed 1M subscribers.' },
    { years: '2022 – 2023', name: 'Healthcare', who: 'Mojocare', line: 'Video manager. Script, shoot, edit and delivery, all in one hand.' },
    { years: '2024 – 2026', name: 'Fintech', who: 'Angel One', line: 'Manager, video. Short-form for two YouTube channels: Shorts from 3.6 to 8.3 a week, retention from 40.9% to 50.8%.' },
  ];
  const WORKS = [
    { p: 'ig', id: 'DCEfvYUiYe9', t: "India's oldest mutual funds" },
    { p: 'yt', id: 'zwfJ59lWU-c', t: 'Should you sell Parag Parikh Flexi Cap?' },
    { p: 'ig', id: 'DDMwNQxss8K', t: 'Reel' },
    { p: 'ig', id: 'DLFTWlNqHia', t: 'Reel' },
    { p: 'yt', id: 'eCBXzG-Lm94', t: '2 hidden stocks after Q1' },
    { p: 'ig', id: 'DFVOS6xvOoL', t: 'Reel' },
    { p: 'yt', id: 'bDu0V3EN9NQ', t: 'YouTube Short' },
    { p: 'ig', id: 'DV23JYXiKlx', t: 'Strait of Hormuz' },
  ];
  const thumb = (w) => (w.p === 'yt' ? `https://i.ytimg.com/vi/${w.id}/hqdefault.jpg` : `assets/thumbs/${w.id}.webp`);

  // ------------------------------------------------------------------
  // Build overlay elements: education nodes, era labels, fruits
  // ------------------------------------------------------------------
  const nodeBox = $('#nodes'), eraBox = $('#eras'), fruitBox = $('#fruits');
  const nodeEls = EDUCATION.map((e, i) => {
    const el = document.createElement('article');
    el.className = `card node n${i}`;
    el.innerHTML = `<span class="card-y">${e.years}</span><h3>${e.title}</h3><p class="card-w">${e.where}</p><p>${e.line}</p>`;
    nodeBox.appendChild(el); return el;
  });
  const eraEls = ERAS.map((e, i) => {
    const el = document.createElement('article');
    el.className = `card era e${i}`;
    el.innerHTML = `<span class="card-y">${e.years}</span><h3>${e.name}</h3><p class="card-w">${e.who}</p><p>${e.line}</p><i class="tick"></i>`;
    eraBox.appendChild(el); return el;
  });
  const fruitEls = WORKS.map((w, i) => {
    const b = document.createElement('button');
    b.className = 'fruit';
    b.setAttribute('aria-label', `Play: ${w.t}`);
    b.innerHTML = `<span class="fruit-img" style="background-image:url('${thumb(w)}')"></span><span class="fruit-shine"></span>`;
    b.addEventListener('click', () => openLightbox(i));
    fruitBox.appendChild(b); return b;
  });

  // ------------------------------------------------------------------
  // Scene timing (in scroll progress units)
  // ------------------------------------------------------------------
  const scenes = [
    { el: $('.s-hello'), a: -1, b: 0.032, out: 0.05 },
    { el: $('.s-dive'), a: 0.06, b: 0.095, out: 0.11 },
    { el: $('.s-roots'), a: 0.115, b: 0.165, out: 0.19 },
    { el: $('.s-sprout'), a: 0.37, b: 0.405, out: 0.425 },
    { el: $('.s-grow'), a: 0.425, b: 0.47, out: 0.5 },
    { el: $('.s-fruit'), a: 0.66, b: 0.745, out: 0.77 },
    { el: $('.s-about'), a: 0.785, b: 0.865, out: 0.885 },
    { el: $('.s-contact'), a: 0.905, b: 2, out: 2 },
  ];
  const IN = 0.012; // fade length

  function visibility(p, s) {
    if (p < s.a - IN || p > s.out) return 0;
    if (p < s.a) return (p - (s.a - IN)) / IN;
    if (p <= s.b) return 1;
    return 1 - (p - s.b) / (s.out - s.b);
  }

  // tree growth, mirrored from world.js
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const treeG = (p) => { const sp = seg(p, K.sprout0, K.sprout1); return sp > 0 ? 0.06 * sp + ease(seg(p, K.tree0, K.tree1)) * 0.94 : 0; };
  const rootG = (p) => seg(p, K.roots0, K.roots1);

  let progress = 0;
  W.onFrame = (st) => {
    const p = st.ps; // smoothed, same as the world
    const { W: vw, H: vh, portrait } = W.size;

    for (const s of scenes) {
      const v = visibility(p, s);
      s.el.style.opacity = v;
      s.el.style.visibility = v > 0.01 ? 'visible' : 'hidden';
      s.el.style.transform = `translate3d(0, ${(1 - v) * (p > s.b ? -24 : 24)}px, 0)`;
    }

    // education cards appear when their root reaches its node
    const rg = rootG(p);
    const nodeDone = [rg >= 0.55, rg >= 0.9];
    W.nodes.forEach((n, i) => {
      const sc = W.toScreen(n.x, n.y);
      const el = nodeEls[i];
      const show = nodeDone[i] && p < K.rise0 + 0.005;
      el.classList.toggle('on', show);
      const left = portrait ? Math.min(Math.max(12, sc.x - el.offsetWidth / 2), vw - el.offsetWidth - 12) : (i === 0 ? sc.x - el.offsetWidth - 34 : sc.x + 34);
      const top = portrait ? sc.y + 26 : sc.y - el.offsetHeight / 2;
      el.style.transform = `translate3d(${Math.max(12, Math.min(left, vw - el.offsetWidth - 12))}px, ${top}px, 0)`;
    });

    // era cards appear as their branch grows
    const tg = treeG(p);
    const placed = [];
    W.eraAnchors.forEach((b, i) => {
      if (!b) return;
      const el = eraEls[i];
      const show = tg >= b.t0 + b.dur * 0.9 && p < K.fruit0 + 0.005;
      el.classList.toggle('on', show);
      const sc = W.toScreen(b.x2, b.y2);
      const side = b.x2 < vw / 2 ? -1 : 1;
      let left = side < 0 ? sc.x - el.offsetWidth - 40 : sc.x + 40;
      if (portrait) left = side < 0 ? 12 : vw - el.offsetWidth - 12;
      left = Math.max(12, Math.min(left, vw - el.offsetWidth - 12));
      let top = Math.max(80, Math.min(sc.y - el.offsetHeight / 2, vh - el.offsetHeight - 90));
      placed.push({ el, side, left, top, h: el.offsetHeight, show });
    });
    // keep cards on the same side from overlapping
    for (const sd of [-1, 1]) {
      const list = placed.filter((c) => c.side === sd && c.show).sort((a, b) => a.top - b.top);
      for (let k = 1; k < list.length; k++) {
        const prev = list[k - 1];
        if (list[k].top < prev.top + prev.h + 14) list[k].top = prev.top + prev.h + 14;
      }
      const last = list[list.length - 1];
      if (last && last.top + last.h > vh - 80) {
        const shift = last.top + last.h - (vh - 80);
        list.forEach((c) => { c.top = Math.max(76, c.top - shift); });
      }
    }
    placed.forEach((c) => {
      c.el.style.transform = `translate3d(${c.left}px, ${c.top}px, 0)`;
      c.el.dataset.side = c.side < 0 ? 'l' : 'r';
    });

    // fruits ripen
    const fr = seg(p, K.fruit0, K.fruit1);
    W.fruitTips.forEach((f, i) => {
      const el = fruitEls[i]; if (!el) return;
      const t = clamp(fr * 1.6 - i * 0.08);
      const on = t > 0 && p < K.about0;
      el.classList.toggle('on', on);
      const sc = W.toScreen(f.x, f.y);
      const size = el.offsetWidth;
      sc.x = Math.max(size / 2 + 8, Math.min(sc.x, vw - size / 2 - 8));
      const bob = Math.sin(st.t / 700 + i) * 3;
      el.style.transform = `translate3d(${sc.x - size / 2}px, ${sc.y - size / 2 + bob}px, 0) scale(${0.2 + 0.8 * Math.min(1, t * 1.4)})`;
    });

    // HUD year line
    let yp;
    if (p < K.roots0) yp = 0;
    else if (p < K.roots1) yp = seg(p, K.roots0, K.roots1) * 0.25;
    else if (p < K.tree0) yp = 0.25;
    else yp = 0.25 + seg(p, K.tree0, K.tree1) * 0.75;
    $('#years-fill').style.transform = `scaleX(${yp})`;
    document.body.classList.toggle('dark', (p > K.drop1 - 0.01 && p < K.rise1 - 0.02) || p > K.dusk0 + 0.04);
  };

  // ------------------------------------------------------------------
  // Scroll
  // ------------------------------------------------------------------
  let lenis = null;
  function startScroll() {
    if (!reduce && window.Lenis) {
      lenis = new Lenis({ duration: 1.25, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    ScrollTrigger.create({
      trigger: '#track', start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => { progress = self.progress; W.setProgress(progress); $('#scroll-pill').classList.toggle('gone', progress > 0.96); },
    });
  }

  const STOPS = { hello: 0, roots: 0.24, growth: 0.56, work: 0.72, about: 0.83, contact: 0.97 };
  function go(name) {
    const max = document.documentElement.scrollHeight - innerHeight;
    const y = STOPS[name] * max;
    if (lenis) lenis.scrollTo(y, { duration: 2.2 }); else scrollTo({ top: y, behavior: 'smooth' });
  }
  $$('.dock [data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
  $('#replay').addEventListener('click', () => go('hello'));

  // ------------------------------------------------------------------
  // Gate: press and hold to plant
  // ------------------------------------------------------------------
  const gate = $('#gate'), plant = $('#plant'), fill = $('#plant-fill');
  const C = 2 * Math.PI * 54;
  fill.style.strokeDasharray = C; fill.style.strokeDashoffset = C;
  let hold = { v: 0 }, holdTween = null, opened = false, lastTap = 0;

  function setHold(v) { fill.style.strokeDashoffset = C * (1 - v); W.setGate(v); }
  function press(e) {
    if (opened) return;
    if (e) e.preventDefault();
    const now = Date.now();
    if (now - lastTap < 350) return openGate(); // double tap shortcut
    lastTap = now;
    holdTween && holdTween.kill();
    holdTween = gsap.to(hold, { v: 1, duration: reduce ? 0.2 : 1.1, ease: 'power1.in', onUpdate: () => setHold(hold.v), onComplete: openGate });
    $('#gate-cta').textContent = 'Keep holding…';
  }
  function release() {
    if (opened) return;
    holdTween && holdTween.kill();
    holdTween = gsap.to(hold, { v: 0, duration: 0.4, ease: 'power2.out', onUpdate: () => setHold(hold.v) });
    $('#gate-cta').textContent = 'Press and hold to plant';
  }
  function openGate() {
    if (opened) return; opened = true;
    holdTween && holdTween.kill();
    setHold(1);
    gsap.timeline()
      .to(gate, { opacity: 0, duration: 0.6, ease: 'power2.out' })
      .add(() => { gate.remove(); document.body.classList.remove('gated'); W.setGate(0); startScroll(); intro(); });
  }
  plant.addEventListener('pointerdown', press);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => plant.addEventListener(ev, release));
  plant.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGate(); } });
  plant.addEventListener('contextmenu', (e) => e.preventDefault());

  function intro() {
    if (reduce) return;
    gsap.from('.s-hello .title, .s-hello .def, .s-hello .lede', { y: 40, opacity: 0, duration: 1.2, stagger: 0.12, ease: 'power3.out' });
    gsap.from('.s-hello .me', { y: 80, opacity: 0, duration: 1.6, ease: 'power3.out', delay: 0.15 });
    gsap.from('.hud, .dock, .scroll-pill', { opacity: 0, duration: 1, delay: 0.6 });
  }

  // Mouse parallax on the portraits
  addEventListener('pointermove', (e) => {
    if (reduce) return;
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    gsap.to('.me img', { x: x * 18, y: y * 10, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
    gsap.to('.title', { x: x * -10, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
  }, { passive: true });

  // ------------------------------------------------------------------
  // Video player
  // ------------------------------------------------------------------
  const lb = $('#lightbox'), frame = $('#lb-frame'), ext = $('#lb-ext');
  let cur = 0;
  function openLightbox(i) {
    cur = (i + WORKS.length) % WORKS.length;
    const w = WORKS[cur];
    const f = document.createElement('iframe');
    f.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
    f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin'; f.title = w.t;
    if (w.p === 'yt') { f.src = `https://www.youtube-nocookie.com/embed/${w.id}?autoplay=1&rel=0&playsinline=1`; ext.href = `https://www.youtube.com/shorts/${w.id}`; ext.textContent = 'Open on YouTube'; }
    else { f.src = `https://www.instagram.com/reel/${w.id}/embed`; ext.href = `https://www.instagram.com/reel/${w.id}/`; ext.textContent = 'Open on Instagram'; }
    frame.innerHTML = ''; frame.appendChild(f);
    lb.hidden = false; lenis && lenis.stop();
  }
  function closeLightbox() { lb.hidden = true; frame.innerHTML = ''; lenis && lenis.start(); }
  $('#lb-close').addEventListener('click', closeLightbox);
  $('#lb-scrim').addEventListener('click', closeLightbox);
  $('#lb-prev').addEventListener('click', () => openLightbox(cur - 1));
  $('#lb-next').addEventListener('click', () => openLightbox(cur + 1));
  addEventListener('keydown', (e) => { if (!lb.hidden && e.key === 'Escape') closeLightbox(); });

  // Copy contact details
  const toast = $('#toast'); let tt;
  $$('[data-copy]').forEach((b) => b.addEventListener('click', () => {
    navigator.clipboard?.writeText(b.dataset.copy).then(() => {
      toast.textContent = `Copied ${b.dataset.copy}`; toast.classList.add('show');
      clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 1800);
    });
  }));
})();
