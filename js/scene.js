(() => {
  gsap.registerPlugin(ScrollTrigger);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const vh = (n) => (window.innerHeight * n) / 100;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPortrait = () => window.innerWidth / window.innerHeight < 0.9;

  // ---------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------
  const EDUCATION = [
    {
      years: '2015 — 2017',
      title: 'AAIP – VFX',
      where: 'Arena Animation, Bangalore',
      line: 'The first roots: animation and visual effects.',
      badge: 'Program',
      glow: '#5EF2FF',
    },
    {
      years: '2020',
      title: 'Motion Graphics for Advertising & Films',
      where: 'Arena Animation',
      line: 'Sharpening motion design for ads and film.',
      badge: 'Certificate',
      glow: '#FF7AD9',
    },
  ];

  // ---------------------------------------------------------------
  // Kaju + small details
  // ---------------------------------------------------------------
  $('#kaju').innerHTML = window.KAJU_SVG;
  $('#bubbles').appendChild($('#scroll-cue'));

  const sparkles = $('#sparkles');
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('i');
    s.style.left = `${8 + Math.random() * 84}%`;
    s.style.top = `${8 + Math.random() * 70}%`;
    s.style.animationDelay = `${Math.random() * 4}s`;
    s.style.transform = `scale(${0.4 + Math.random()})`;
    sparkles.appendChild(s);
  }

  const kTop = () => (isPortrait() ? 58 : 50); // where Kaju stands, in vh
  const placeKaju = () => { document.documentElement.style.setProperty('--k-top', `${kTop()}vh`); };
  placeKaju();
  gsap.set('#kaju-wrap', { xPercent: -50, yPercent: -55 });
  gsap.set('#kaju-glow', { xPercent: -50, yPercent: -50, scale: 0.6 });
  gsap.set('#impact .ring, #impact .flash', { xPercent: -50, yPercent: -50, scale: 0 });

  // ---------------------------------------------------------------
  // Soil: strata, years, roots
  // ---------------------------------------------------------------
  const soil = $('.soil');
  const strataSvg = $('#strata');
  const rootsSvg = $('#roots');
  const cardsBox = $('#root-cards');
  const yearsBox = $('#years');
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  // Geometry in soil-local pixels. The seed rests 8vh below the soil's top edge.
  function geometry() {
    const W = soil.clientWidth;
    const P = isPortrait();
    return {
      W,
      seed: { x: W * 0.5, y: vh(8.5) },
      nodes: P
        ? [{ x: W * 0.28, y: vh(30) }, { x: W * 0.72, y: vh(57) }]
        : [{ x: W * 0.27, y: vh(40) }, { x: W * 0.73, y: vh(66) }],
      tapEnd: { x: W * 0.52, y: vh(94) },
      P,
    };
  }

  // Organic two-segment curve from a to b
  function rootPath(a, b, bend) {
    const mx = a.x + (b.x - a.x) * 0.45 + bend;
    const my = a.y + (b.y - a.y) * 0.5;
    return `M${a.x},${a.y} C${a.x},${a.y + (my - a.y) * 0.7} ${mx - (b.x - a.x) * 0.15},${my - (b.y - a.y) * 0.18} ${mx},${my} ` +
           `S${b.x - (b.x - a.x) * 0.05},${b.y - (b.y - my) * 0.6} ${b.x},${b.y}`;
  }

  // Build SVG defs + root groups once
  const defs = el('defs', {}, rootsSvg);
  defs.innerHTML = `
    <filter id="rGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="rGlowS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9A0"/><stop offset="0.35" stop-color="#5EF2FF"/><stop offset="1" stop-color="#7C9BFF"/></linearGradient>
    <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9A0"/><stop offset="0.35" stop-color="#B794FF"/><stop offset="1" stop-color="#FF7AD9"/></linearGradient>
    <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9A0" stop-opacity="0.9"/><stop offset="1" stop-color="#5EF2FF" stop-opacity="0"/></linearGradient>`;

  function makeRoot(grad, width) {
    const g = el('g', { class: 'root' }, rootsSvg);
    const glow = el('path', { fill: 'none', stroke: `url(#${grad})`, 'stroke-width': width * 3.2, 'stroke-linecap': 'round', filter: 'url(#rGlow)', opacity: 0.55, pathLength: 1 }, g);
    const core = el('path', { fill: 'none', stroke: `url(#${grad})`, 'stroke-width': width, 'stroke-linecap': 'round', pathLength: 1 }, g);
    const hot = el('path', { fill: 'none', stroke: '#FFFFFF', 'stroke-width': Math.max(1, width * 0.28), 'stroke-linecap': 'round', opacity: 0.85, pathLength: 1 }, g);
    const pulse = el('path', { fill: 'none', stroke: '#FFFFFF', 'stroke-width': width * 0.9, 'stroke-linecap': 'round', filter: 'url(#rGlowS)', opacity: 0, pathLength: 1, 'stroke-dasharray': '0.06 0.94' }, g);
    const paths = [glow, core, hot];
    paths.forEach(p => p.setAttribute('stroke-dasharray', '1 1'));
    return { g, glow, core, hot, pulse, paths, lets: [] };
  }

  const roots = [makeRoot('gA', 7), makeRoot('gB', 7)];
  const tap = makeRoot('gT', 4);
  const nodes = EDUCATION.map((e) => {
    const g = el('g', { class: 'node', opacity: 0 }, rootsSvg);
    el('circle', { r: 26, fill: e.glow, opacity: 0.35, filter: 'url(#rGlow)' }, g);
    el('circle', { r: 9, fill: '#fff' }, g);
    el('circle', { r: 15, fill: 'none', stroke: e.glow, 'stroke-width': 2, opacity: 0.9 }, g);
    return g;
  });

  // Rootlets: thin side roots that sprout as each main root passes
  const ROOTLETS = 6;
  [...roots, tap].forEach((r) => {
    for (let i = 0; i < ROOTLETS; i++) {
      const p = el('path', { fill: 'none', stroke: r === tap ? '#FFD9A0' : (r === roots[0] ? '#8FF7FF' : '#D9B8FF'), 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.75, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, r.g);
      r.lets.push({ p, t: 0.15 + (i / ROOTLETS) * 0.8 + Math.random() * 0.05, side: i % 2 ? 1 : -1, len: 30 + Math.random() * 70 });
    }
  });

  // Cards
  const cards = EDUCATION.map((e) => {
    const c = document.createElement('article');
    c.className = 'root-card';
    c.style.setProperty('--glow', e.glow);
    c.innerHTML = `<div class="rc-years">${e.years}</div><h3>${e.title}</h3><div class="rc-where">${e.where}</div><p>${e.line}</p><span class="rc-badge">${e.badge}</span>`;
    cardsBox.appendChild(c);
    return c;
  });

  const YEARS = ['2015', '2017', '2020'];
  const yearEls = YEARS.map((y) => { const s = document.createElement('span'); s.textContent = y; yearsBox.appendChild(s); return s; });

  function layoutSoil() {
    const G = geometry();
    const H = soil.clientHeight;
    rootsSvg.setAttribute('viewBox', `0 0 ${G.W} ${H}`);

    // strata bands
    strataSvg.setAttribute('viewBox', `0 0 ${G.W} ${H}`);
    strataSvg.innerHTML = '';
    const bands = [0.02, 0.07, 0.15, 0.27, 0.42, 0.6];
    const tones = ['rgba(255,190,120,0.10)', 'rgba(255,170,110,0.07)', 'rgba(190,140,255,0.06)', 'rgba(120,200,255,0.05)', 'rgba(255,120,210,0.05)', 'rgba(120,255,220,0.04)'];
    bands.forEach((b, i) => {
      const y = H * b, amp = 10 + i * 4, seg = G.W / 4;
      let d = `M0 ${y}`;
      for (let k = 0; k < 4; k++) d += ` Q${seg * k + seg / 2} ${y + (k % 2 ? amp : -amp)} ${seg * (k + 1)} ${y}`;
      d += ` L${G.W} ${y + H * 0.05} L0 ${y + H * 0.05} Z`;
      el('path', { d, fill: tones[i] }, strataSvg);
      el('path', { d: d.split(' L')[0], fill: 'none', stroke: 'rgba(255,220,190,0.10)', 'stroke-width': 1.5 }, strataSvg);
    });
    // glossy pebbles
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * G.W, y = H * (0.04 + Math.random() * 0.9), r = 3 + Math.random() * 9;
      el('ellipse', { cx: x, cy: y, rx: r * 1.4, ry: r, fill: 'rgba(255,230,210,0.07)' }, strataSvg);
      el('ellipse', { cx: x - r * 0.4, cy: y - r * 0.4, rx: r * 0.4, ry: r * 0.25, fill: 'rgba(255,255,255,0.12)' }, strataSvg);
    }

    // years line up with where each chapter of learning sits
    const ys = [G.seed.y + vh(4), G.nodes[0].y, G.nodes[1].y];
    yearEls.forEach((s, i) => { s.style.top = `${ys[i] - 8}px`; });

    // roots
    const bends = G.P ? [-G.W * 0.06, G.W * 0.06] : [-G.W * 0.05, G.W * 0.06];
    roots.forEach((r, i) => {
      const d = rootPath(G.seed, G.nodes[i], bends[i]);
      [...r.paths, r.pulse].forEach(p => p.setAttribute('d', d));
      nodes[i].setAttribute('transform', `translate(${G.nodes[i].x} ${G.nodes[i].y})`);
    });
    const td = `M${G.seed.x},${G.seed.y} C${G.seed.x + 18},${G.seed.y + vh(20)} ${G.tapEnd.x - 30},${G.tapEnd.y - vh(30)} ${G.tapEnd.x},${G.tapEnd.y}`;
    [...tap.paths, tap.pulse].forEach(p => p.setAttribute('d', td));

    // rootlets hang off the main roots
    [...roots, tap].forEach((r) => {
      const L = r.core.getTotalLength();
      r.lets.forEach((lt) => {
        const p0 = r.core.getPointAtLength(L * lt.t);
        const p1 = r.core.getPointAtLength(Math.min(L, L * lt.t + 2));
        const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x) + lt.side * 0.9;
        const ex = p0.x + Math.cos(ang) * lt.len, ey = p0.y + Math.sin(ang) * lt.len + lt.len * 0.3;
        const cx = p0.x + Math.cos(ang) * lt.len * 0.5 + lt.side * 8, cy = p0.y + Math.sin(ang) * lt.len * 0.5;
        lt.p.setAttribute('d', `M${p0.x},${p0.y} Q${cx},${cy} ${ex},${ey}`);
      });
    });

    // cards sit beside (desktop) or below (phone) their node
    cards.forEach((c, i) => {
      const n = G.nodes[i];
      const cw = c.offsetWidth || 300;
      let left, top;
      if (G.P) {
        left = Math.min(Math.max(12, n.x - cw / 2), G.W - cw - 12);
        top = n.y + 28;
      } else if (n.x < G.W / 2) {
        left = Math.max(16, n.x - cw - 36); top = n.y - 70;
      } else {
        left = Math.min(G.W - cw - 16, n.x + 36); top = n.y - 70;
      }
      c.style.left = `${left}px`;
      c.style.top = `${top}px`;
    });
  }

  // ---------------------------------------------------------------
  // Soil motes (tiny floating light particles)
  // ---------------------------------------------------------------
  const motes = $('#motes');
  const mctx = motes.getContext('2d');
  let moteList = [], motesOn = false;
  function sizeMotes() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    motes.width = soil.clientWidth * dpr; motes.height = soil.clientHeight * dpr;
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    moteList = Array.from({ length: Math.round(soil.clientWidth / 18) }, () => ({
      x: Math.random() * soil.clientWidth, y: Math.random() * soil.clientHeight,
      r: 0.6 + Math.random() * 1.8, s: 0.1 + Math.random() * 0.35, a: Math.random() * Math.PI * 2,
      c: Math.random() > 0.5 ? '255,214,160' : '140,240,255',
    }));
  }
  function drawMotes() {
    if (motesOn) {
      const W = soil.clientWidth, H = soil.clientHeight;
      mctx.clearRect(0, 0, W, H);
      for (const m of moteList) {
        m.y -= m.s; m.a += 0.01; m.x += Math.sin(m.a) * 0.2;
        if (m.y < -5) { m.y = H + 5; m.x = Math.random() * W; }
        mctx.beginPath();
        mctx.fillStyle = `rgba(${m.c},${0.25 + 0.35 * Math.sin(m.a * 2) ** 2})`;
        mctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        mctx.fill();
      }
    }
    requestAnimationFrame(drawMotes);
  }

  // ---------------------------------------------------------------
  // Intro: pop, wave, talk
  // ---------------------------------------------------------------
  function typeInto(bubble, text, speed = 0.035) {
    const span = $('.typed', bubble);
    const obj = { n: 0 };
    return gsap.to(obj, {
      n: text.length, duration: text.length * speed, ease: 'none',
      onUpdate: () => { span.textContent = text.slice(0, Math.round(obj.n)); },
      onComplete: () => bubble.classList.add('done'),
    });
  }

  function intro() {
    gsap.set('#k-pop', { scale: 0 });
    const tl = gsap.timeline({ delay: 0.35 });
    tl.to('#k-pop', { scale: 1.12, duration: 0.45, ease: 'back.out(2.6)' })
      .to('#k-pop', { scaleY: 0.86, scaleX: 1.12, duration: 0.12, ease: 'power1.in' })
      .to('#k-pop', { scaleY: 1, scaleX: 1, duration: 0.9, ease: 'elastic.out(1.1, 0.35)' })
      .fromTo('#kaju-shadow', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, 0.15)
      .to('#k-browL, #k-browR', { y: -8, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' }, 0.6)
      .fromTo('#k-armR', { rotation: 0 }, { rotation: -22, duration: 0.22, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 0.7)
      .fromTo('#b1', { opacity: 0, scale: 0.6, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, 0.8)
      .add(typeInto($('#b1'), "Hi! I'm Kaju."), 1.0)
      .fromTo('#b2', { opacity: 0, scale: 0.6, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, '+=0.35')
      .add(typeInto($('#b2'), 'Kaju means cashew… so yes, that’s me. Want to see where I come from?', 0.028))
      .to('#scroll-cue', { opacity: 1, duration: 0.6 }, '-=0.6');

    if (!reduce) {
      gsap.to('#k-idle', { y: -7, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      const blink = () => {
        gsap.to('.k-eye', { scaleY: 0.08, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.in' });
        gsap.delayedCall(2.2 + Math.random() * 3, blink);
      };
      gsap.delayedCall(2.5, blink);
    }
  }

  // Eyes follow the pointer a little
  window.addEventListener('pointermove', (e) => {
    const dx = (e.clientX / window.innerWidth - 0.5) * 2;
    const dy = (e.clientY / window.innerHeight - 0.5) * 2;
    gsap.to('.k-look', { x: dx * 6, y: dy * 5, duration: 0.4, overwrite: 'auto' });
  }, { passive: true });

  // ---------------------------------------------------------------
  // Impact burst (fires when the dive lands, scrolling forward)
  // ---------------------------------------------------------------
  let scrollDir = 1;
  function burst() {
    if (scrollDir < 0 || reduce) return;
    const box = $('#impact');
    for (let i = 0; i < 26; i++) {
      const d = document.createElement('span');
      d.className = i % 4 === 0 ? 'leafbit' : 'dirt';
      const s = 0.5 + Math.random() * 1.2;
      box.appendChild(d);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const v = 80 + Math.random() * 180;
      gsap.set(d, { x: 0, y: 0, scale: s, rotation: Math.random() * 360 });
      gsap.timeline({ onComplete: () => d.remove() })
        .to(d, { x: Math.cos(ang) * v, duration: 0.9, ease: 'power1.out' }, 0)
        .to(d, { y: Math.sin(ang) * v, duration: 0.4, ease: 'power2.out' }, 0)
        .to(d, { y: 60 + Math.random() * 40, duration: 0.5, ease: 'power2.in' }, 0.4)
        .to(d, { opacity: 0, duration: 0.3 }, 0.6);
    }
  }

  // ---------------------------------------------------------------
  // The scroll story (0 → 100 time units = top → bottom of the page)
  // ---------------------------------------------------------------
  function buildTimeline() {
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    // 1 · Hello → get ready
    tl.to('#bubbles', { opacity: 0, duration: 3 }, 0)
      .to('#k-squash', { scaleY: 0.8, scaleX: 1.14, duration: 4, ease: 'power2.out' }, 2)
      .fromTo('#ground', { y: () => vh(40) }, { y: 0, duration: 12, ease: 'power2.out' }, 0)
      .to('.aura', { opacity: 0.35, duration: 10 }, 4);

    // 2 · Jump, flip, dive
    tl.to('#k-squash', { scaleY: 1.2, scaleX: 0.86, duration: 2, ease: 'power3.out' }, 6)
      .to('#k-squash', { scaleY: 1, scaleX: 1, duration: 4 }, 8)
      .to('#kaju-shadow', { opacity: 0, duration: 3 }, 6)
      .to('#kaju-wrap', { y: () => -vh(22), duration: 7, ease: 'power2.out' }, 6)
      .to('#kaju-wrap', { rotation: -360, duration: 9, ease: 'power1.inOut' }, 10)
      .to('#kaju-wrap', { y: () => vh(84 - kTop()), scale: 0.5, duration: 8, ease: 'power2.in' }, 13)
      .to('#k-armR', { rotation: -60, duration: 4 }, 10)
      .to('#k-armL', { rotation: 50, duration: 4 }, 10)
      .call(burst, null, 20.6)
      .fromTo('#impact .flash', { scale: 0, opacity: 0 }, { scale: 1.4, opacity: 1, duration: 1.2 }, 20.4)
      .to('#impact .flash', { opacity: 0, duration: 3 }, 21.6)
      .fromTo('#impact .ring', { scale: 0, opacity: 1 }, { scale: 1.8, opacity: 0, duration: 4, ease: 'power2.out' }, 20.6)
      .fromTo('#impact .r2', { scale: 0, opacity: 1 }, { scale: 2.6, opacity: 0, duration: 5, ease: 'power2.out' }, 21.2);

    // 3 · Camera follows underground; Kaju curls up into a glowing seed
    tl.to('#world', { y: () => -(vh(72) + vh(3.8) - vh(2)), duration: 12, ease: 'power2.inOut' }, 21)
      .to('#k-sleep', { opacity: 1, duration: 3 }, 24)
      .to('.k-eye', { opacity: 0, duration: 2 }, 24)
      .to('#k-mouth', { scale: 0.45, duration: 3 }, 24)
      .to('#k-armR', { rotation: 70, duration: 4 }, 24)
      .to('#k-armL', { rotation: -30, duration: 4 }, 24)
      .to('#kaju-glow', { opacity: 1, scale: 1, duration: 8, ease: 'power2.out' }, 24)
      .to('#kaju-wrap', { scale: 0.42, duration: 6 }, 26)
      .to('#tag-roots', { opacity: 1, y: 0, duration: 4 }, 29)
      .fromTo('#tag-roots', { y: 20 }, { y: 0, duration: 4 }, 29)
      .to('#tag-roots', { opacity: 0, y: -20, duration: 4 }, 41)
      .fromTo('#years span', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 4, stagger: 1 }, 32);

    // 4 · Roots grow, education blooms
    const grow = (r, start, dur) => {
      tl.to(r.paths, { attr: { 'stroke-dashoffset': 0 }, duration: dur, ease: 'power1.inOut' }, start);
      r.lets.forEach(lt => tl.to(lt.p, { attr: { 'stroke-dashoffset': 0 }, duration: dur * 0.25, ease: 'power1.out' }, start + dur * lt.t));
      tl.to(r.pulse, { opacity: 0.9, duration: 2 }, start + dur);
    };
    [...roots, tap].forEach(r => { r.paths.forEach(p => p.setAttribute('stroke-dashoffset', 1)); });
    grow(roots[0], 36, 17);
    tl.fromTo(nodes[0], { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 2, ease: 'back.out(3)' }, 52.5)
      .to(cards[0], { opacity: 1, y: 0, scale: 1, duration: 3, ease: 'power2.out' }, 53.5);
    grow(roots[1], 52, 16);
    tl.fromTo(nodes[1], { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 2, ease: 'back.out(3)' }, 67.5)
      .to(cards[1], { opacity: 1, y: 0, scale: 1, duration: 3, ease: 'power2.out' }, 68.5);
    grow(tap, 60, 18);

    // 5 · Teaser for the next chapter
    tl.to('#soon', { opacity: 1, duration: 4 }, 86)
      .to({}, { duration: 6 }, 94);

    return tl;
  }

  // Light pulses travel along grown roots forever (cheap, transform-free)
  function pulses() {
    if (reduce) return;
    [...roots, tap].forEach((r, i) => {
      gsap.fromTo(r.pulse, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': -0.06 }, duration: 2.6 + i * 0.4, repeat: -1, ease: 'none', delay: i * 0.7 });
    });
  }

  // ---------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------
  function boot() {
    layoutSoil();
    sizeMotes();
    requestAnimationFrame(drawMotes);
    const tl = buildTimeline();
    ScrollTrigger.create({
      trigger: '#scroll', start: 'top top', end: 'bottom bottom',
      animation: tl, scrub: reduce ? true : 1,
      onUpdate: (self) => {
        scrollDir = self.direction;
        const under = self.progress > 0.24;
        document.body.classList.toggle('underground', under);
        motesOn = self.progress > 0.18;
      },
    });
    ScrollTrigger.addEventListener('refreshInit', () => { placeKaju(); layoutSoil(); sizeMotes(); });
    pulses();
    intro();
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else window.addEventListener('load', boot);
})();
