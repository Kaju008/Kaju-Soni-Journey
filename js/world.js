/* The living world: mist, seed, soil, roots, tree, fruit, fireflies.
   Everything is drawn from one number, p (0 → 1 scroll progress), so the
   story scrubs forwards and backwards perfectly. */
(() => {
  const cvs = document.getElementById('world');
  const ctx = cvs.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- story keyframes (fractions of the full scroll) ----------
  const K = {
    drop0: 0.045, drop1: 0.105,
    roots0: 0.11, roots1: 0.30,
    rise0: 0.305, rise1: 0.365,
    sprout0: 0.355, sprout1: 0.41,
    tree0: 0.405, tree1: 0.665,
    fruit0: 0.655, fruit1: 0.755,
    about0: 0.775, about1: 0.86,
    dusk0: 0.84, dusk1: 0.95,
  };

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eOut = (t) => 1 - Math.pow(1 - t, 3);

  // seeded random, so roots and tree look the same every visit
  let _s = 7;
  const rnd = () => ((_s = (_s * 16807) % 2147483647) / 2147483647);
  const reseed = (n) => { _s = n; };

  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // sky palettes: [top, bottom]
  const SKY = {
    mist: [hex('#D8ECE4'), hex('#F5FAF7')],
    dawn: [hex('#CFE2F0'), hex('#FCE7D8')],
    day: [hex('#BCDDEB'), hex('#F1F8F2')],
    dusk: [hex('#2A3656'), hex('#EFB39C')],
    night: [hex('#0A1520'), hex('#1A2E3A')],
  };

  let W = 0, H = 0, DPR = 1, portrait = false;
  let Ys = 0; // world y of the ground surface
  let roots = [], nodes = [], branches = [], leaves = [], fruitTips = [], eraAnchors = [];
  let motes = [], fogSprite = null, grass = [];
  const state = { p: 0, ps: 0, t: 0, mx: 0.5, my: 0.5, smx: 0.5, smy: 0.5, cam: 0, gate: 0 };

  // ---------- geometry ----------
  function layout() {
    DPR = Math.min(window.devicePixelRatio || 1, W < 700 ? 1.5 : 1.75);
    W = innerWidth; H = innerHeight; portrait = W / H < 0.85;
    cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR);
    cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
    Ys = H * 0.86;
    buildRoots(); buildTree(); buildMotes(); buildFog(); buildGrass();
  }

  const seedRest = () => ({ x: W * 0.5, y: Ys + H * 0.07 });

  function wobblyPath(a, b, bend, steps, jitter) {
    const pts = [];
    const ph1 = rnd() * 6.28, ph2 = rnd() * 6.28, f1 = 5 + rnd() * 4, f2 = 11 + rnd() * 6;
    const mx = (a.x + b.x) / 2 + bend, my = (a.y + b.y) / 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x;
      const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y;
      const j = Math.sin(t * Math.PI) * jitter;
      const n = Math.sin(t * f1 + ph1) * 0.65 + Math.sin(t * f2 + ph2) * 0.35;
      pts.push({ x: x + n * j * 0.9, y: y + Math.sin(t * f2 * 0.7 + ph2) * j * 0.15 });
    }
    return pts;
  }

  function buildRoots() {
    reseed(11);
    roots = [];
    const s = seedRest();
    const depth = H * 0.92;
    nodes = portrait
      ? [{ x: W * 0.26, y: Ys + depth * 0.38 }, { x: W * 0.74, y: Ys + depth * 0.66 }]
      : [{ x: W * 0.27, y: Ys + depth * 0.44 }, { x: W * 0.73, y: Ys + depth * 0.7 }];
    const mains = [
      { to: nodes[0], bend: -W * 0.06, start: 0.0, dur: 0.55, w: 4.2, hue: hex('#7CF2E4'), node: 0 },
      { to: nodes[1], bend: W * 0.07, start: 0.35, dur: 0.55, w: 4.2, hue: hex('#FFC57A'), node: 1 },
      { to: { x: s.x + W * 0.02, y: Ys + depth * 0.95 }, bend: W * 0.02, start: 0.2, dur: 0.8, w: 2.6, hue: hex('#E8F3EE') },
    ];
    for (const m of mains) {
      const pts = wobblyPath(s, m.to, m.bend, 60, 26);
      roots.push({ pts, start: m.start, dur: m.dur, w: m.w, hue: m.hue, node: m.node });
      // rootlets
      for (let k = 0; k < 7; k++) {
        const at = 0.15 + rnd() * 0.8;
        const i = Math.floor(at * pts.length);
        const a = pts[i];
        const dir = rnd() > 0.5 ? 1 : -1;
        const len = (40 + rnd() * 110) * (W < 700 ? 0.7 : 1);
        const b = { x: a.x + dir * len, y: a.y + len * (0.4 + rnd() * 0.6) };
        roots.push({ pts: wobblyPath(a, b, dir * len * 0.2, 18, 10), start: m.start + m.dur * at, dur: 0.25, w: 1.4, hue: m.hue });
      }
    }
  }

  function buildTree() {
    reseed(23);
    branches = []; leaves = [];
    const base = { x: W * 0.5, y: Ys };
    const trunk = Math.min(H * 0.2, W * 0.32);
    const maxLevel = 7;
    function grow(x, y, ang, len, lvl, t0, thick) {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      const dur = 0.13;
      const cx = (x + x2) / 2 + Math.cos(ang + Math.PI / 2) * len * (rnd() - 0.5) * 0.25;
      const cy = (y + y2) / 2 + Math.sin(ang + Math.PI / 2) * len * (rnd() - 0.5) * 0.25;
      const b = { x, y, cx, cy, x2, y2, lvl, t0, dur, thick };
      branches.push(b);
      if (lvl >= maxLevel) {
        b.tip = true; return;
      }
      const kids = lvl < 2 ? 2 : (rnd() > 0.35 ? 2 : 3);
      const spread = lvl === 0 ? 0.55 : 0.42 + rnd() * 0.2;
      for (let k = 0; k < kids; k++) {
        const f = kids === 1 ? 0 : k / (kids - 1) - 0.5;
        const a2 = ang + f * spread * 2 + (rnd() - 0.5) * 0.25 - (ang + Math.PI / 2) * 0.08;
        grow(x2, y2, a2, len * (0.72 + rnd() * 0.12), lvl + 1, t0 + dur * (0.75 + rnd() * 0.2), thick * 0.68);
      }
      if (lvl >= 3) {
        const n = 3 + Math.floor(rnd() * 4);
        for (let k = 0; k < n; k++) {
          leaves.push({
            x: x2 + (rnd() - 0.5) * len * 0.9, y: y2 + (rnd() - 0.5) * len * 0.9,
            r: (6 + rnd() * 10) * (W < 700 ? 0.7 : 1) * (1 + (maxLevel - lvl) * 0.08),
            rot: rnd() * Math.PI, t0: t0 + dur, blossom: rnd() < 0.16, sway: rnd() * 6.28,
          });
        }
      }
    }
    grow(base.x, base.y, -Math.PI / 2, trunk, 0, 0, Math.max(10, W * 0.014));
    const maxT = Math.max(...branches.map(b => b.t0 + b.dur));
    branches.forEach(b => { b.t0 /= maxT; b.dur /= maxT; });
    leaves.forEach(l => { l.t0 /= maxT; });

    // era anchors: a few level-2/3 branch ends spread through growth time, alternating sides
    const cands = branches.filter(b => b.lvl === 2 || b.lvl === 3).sort((a, b) => a.t0 - b.t0);
    const wanted = [0.18, 0.42, 0.66, 0.9];
    eraAnchors = wanted.map((w, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      let best = null, bd = 1e9;
      for (const c of cands) {
        if (Math.sign(c.x2 - W * 0.5) !== side) continue;
        const d = Math.abs(c.t0 + c.dur - w);
        if (d < bd) { bd = d; best = c; }
      }
      return best || cands[Math.floor(w * (cands.length - 1))];
    });

    // fruit: 8 tips spread across the canopy
    const tips = branches.filter(b => b.tip).sort((a, b) => a.x2 - b.x2);
    fruitTips = [];
    const N = 8;
    for (let i = 0; i < N; i++) {
      const pool = tips.slice(Math.floor(i * tips.length / N), Math.floor((i + 1) * tips.length / N));
      pool.sort((a, b) => (a.y2 - b.y2) * (i % 2 ? -1 : 1));
      const t = pool[Math.floor(pool.length / 2)];
      if (t) fruitTips.push({ x: t.x2, y: t.y2 + 14, i });
    }
  }

  function buildMotes() {
    reseed(5);
    const n = Math.round(Math.min(160, (W * H) / 9000));
    motes = Array.from({ length: n }, () => ({
      x: rnd() * W, y: rnd() * H, z: 0.2 + rnd() * 0.9, r: 0.6 + rnd() * 1.8,
      ph: rnd() * 6.28, sp: 0.15 + rnd() * 0.5,
    }));
  }

  function buildFog() {
    const s = 512;
    fogSprite = document.createElement('canvas');
    fogSprite.width = s; fogSprite.height = s;
    const g = fogSprite.getContext('2d');
    reseed(3);
    for (let i = 0; i < 26; i++) {
      const r = s * (0.1 + rnd() * 0.13);
      const x = r + rnd() * (s - 2 * r), y = s * 0.5 + (rnd() - 0.5) * (s - 2 * r) * 0.5;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(255,255,255,0.26)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.1)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, s, s);
    }
  }

  function buildGrass() {
    reseed(9);
    grass = [];
    const n = Math.round(W / 6);
    for (let i = 0; i < n; i++) grass.push({ x: (i / n) * W + rnd() * 6, h: 6 + rnd() * 16, lean: (rnd() - 0.5) * 6, c: rnd() });
  }

  // ---------- drawing helpers ----------
  function skyColors(p) {
    const stops = [
      [0, SKY.mist], [K.drop1, SKY.mist], [K.rise0, SKY.dawn], [K.sprout1, SKY.dawn],
      [K.tree0 + 0.12, SKY.day], [K.fruit1, SKY.day], [K.dusk0 + 0.04, SKY.dusk], [K.dusk1, SKY.night], [1, SKY.night],
    ];
    for (let i = 0; i < stops.length - 1; i++) {
      const [a, ca] = stops[i], [b, cb] = stops[i + 1];
      if (p <= b) { const t = ease(seg(p, a, b)); return [mix(ca[0], cb[0], t), mix(ca[1], cb[1], t)]; }
    }
    return SKY.night;
  }

  function cashewPath(c, s) {
    // a plump kidney / cashew silhouette, centred on 0,0, size s
    c.beginPath();
    c.moveTo(-0.05 * s, -0.62 * s);
    c.bezierCurveTo(0.42 * s, -0.66 * s, 0.6 * s, -0.2 * s, 0.46 * s, 0.18 * s);
    c.bezierCurveTo(0.34 * s, 0.52 * s, -0.02 * s, 0.7 * s, -0.3 * s, 0.56 * s);
    c.bezierCurveTo(-0.5 * s, 0.46 * s, -0.42 * s, 0.22 * s, -0.2 * s, 0.2 * s);
    c.bezierCurveTo(0.02 * s, 0.18 * s, 0.1 * s, 0.02 * s, 0.02 * s, -0.12 * s);
    c.bezierCurveTo(-0.06 * s, -0.26 * s, -0.36 * s, -0.24 * s, -0.36 * s, -0.42 * s);
    c.bezierCurveTo(-0.36 * s, -0.56 * s, -0.22 * s, -0.62 * s, -0.05 * s, -0.62 * s);
    c.closePath();
  }

  function drawSeed(x, y, s, rot, glow, alpha) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha;
    if (glow > 0) {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 3.2);
      g.addColorStop(0, `rgba(255,214,150,${0.55 * glow})`);
      g.addColorStop(0.4, `rgba(124,242,228,${0.18 * glow})`);
      g.addColorStop(1, 'rgba(124,242,228,0)');
      ctx.fillStyle = g; ctx.fillRect(-s * 3.2, -s * 3.2, s * 6.4, s * 6.4);
    }
    // soft contact shadow / under-glow
    cashewPath(ctx, s);
    const body = ctx.createRadialGradient(-s * 0.2, -s * 0.35, s * 0.05, 0, 0, s * 0.8);
    body.addColorStop(0, '#FFF9EC'); body.addColorStop(0.45, '#F2DDB3'); body.addColorStop(0.85, '#D7B07A'); body.addColorStop(1, '#B98E58');
    ctx.fillStyle = body; ctx.fill();
    // inner curl shading
    ctx.save(); ctx.clip();
    const sh = ctx.createRadialGradient(s * 0.05, s * 0.05, 0, s * 0.05, s * 0.05, s * 0.5);
    sh.addColorStop(0, 'rgba(150,105,55,0.35)'); sh.addColorStop(1, 'rgba(150,105,55,0)');
    ctx.fillStyle = sh; ctx.fillRect(-s, -s, s * 2, s * 2);
    // speckles
    reseed(41);
    ctx.fillStyle = 'rgba(170,125,75,0.35)';
    for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.arc((rnd() - 0.5) * s, (rnd() - 0.5) * s * 1.2, s * 0.012 * (0.5 + rnd()), 0, 6.28); ctx.fill(); }
    ctx.restore();
    // gloss
    ctx.beginPath(); ctx.ellipse(s * 0.12, -s * 0.42, s * 0.16, s * 0.06, 0.35, 0, 6.28);
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * 0.34, -s * 0.12, s * 0.04, s * 0.12, 0.2, 0, 6.28);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
    ctx.restore();
  }

  function strokePartial(pts, frac, width, color, blur) {
    const n = Math.max(1, Math.floor(frac * (pts.length - 1)));
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i <= n; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.lineWidth = width; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (blur) { ctx.shadowBlur = blur; ctx.shadowColor = color; }
    ctx.stroke(); ctx.shadowBlur = 0;
    return pts[n];
  }

  // ---------- frame ----------
  function frame(now) {
    const dt = Math.min(0.05, (now - (state.t || now)) / 1000); state.t = now;
    state.ps += (state.p - state.ps) * (reduce ? 1 : 1 - Math.exp(-dt * 6));
    state.smx += (state.mx - state.smx) * 0.06; state.smy += (state.my - state.smy) * 0.06;
    const p = state.ps, time = now / 1000;

    // camera
    const down = ease(seg(p, K.drop0, K.drop1 + 0.03));
    const up = ease(seg(p, K.rise0, K.rise1));
    const camDown = Ys - H * 0.12, camUp = Ys - H * 0.8;
    const cam = up > 0 ? lerp(camDown, camUp, up) : lerp(0, camDown, down);
    state.cam = cam;
    const px = (state.smx - 0.5), py = (state.smy - 0.5);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // sky
    const [top, bot] = skyColors(p);
    const sg = ctx.createLinearGradient(0, 0, 0, H);
    sg.addColorStop(0, rgb(top)); sg.addColorStop(1, rgb(bot));
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

    // sun / moon glow
    const dawnT = seg(p, K.rise0, K.tree0 + 0.1), duskT = seg(p, K.dusk0, K.dusk1);
    if (dawnT > 0) {
      const sx = W * (0.78 - 0.1 * duskT), sy = lerp(H * 0.55, H * 0.2, eOut(dawnT)) + duskT * H * 0.35 - cam * 0 ;
      const r = Math.max(W, H) * 0.45;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      const c = duskT > 0.5 ? '255,190,150' : '255,236,200';
      g.addColorStop(0, `rgba(${c},${0.55 * (1 - duskT * 0.6)})`); g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    ctx.save();
    ctx.translate(px * -14, -cam);

    // distant hills (only above ground, after rising)
    const hillA = seg(p, K.rise0, K.sprout1);
    if (hillA > 0) {
      const tint = mix(hex('#A9CDBE'), hex('#20334A'), duskT);
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        const yb = Ys - H * (0.1 - layer * 0.03);
        ctx.moveTo(-60, Ys + 2);
        for (let x = -60; x <= W + 60; x += 30) {
          const y = yb - (Math.sin(x * 0.004 + layer * 2) * 0.5 + 0.5) * H * (0.08 + layer * 0.02) - Math.sin(x * 0.011 + layer) * H * 0.012;
          ctx.lineTo(x + px * layer * 10, y);
        }
        ctx.lineTo(W + 60, Ys + 2); ctx.closePath();
        ctx.fillStyle = rgb(mix(tint, mix(top, bot, 0.6), 0.55 - layer * 0.15), hillA * (0.35 + layer * 0.2));
        ctx.fill();
      }
    }

    // soil
    const soilG = ctx.createLinearGradient(0, Ys, 0, Ys + H * 1.1);
    soilG.addColorStop(0, '#5A4636'); soilG.addColorStop(0.08, '#3A2D27'); soilG.addColorStop(0.4, '#1E1A1C'); soilG.addColorStop(1, '#0D1214');
    ctx.fillStyle = soilG; ctx.fillRect(-40, Ys, W + 80, H * 1.2);
    // strata
    reseed(17);
    for (let i = 0; i < 6; i++) {
      const y = Ys + H * (0.08 + i * 0.16);
      ctx.beginPath(); ctx.moveTo(-40, y);
      for (let x = -40; x <= W + 40; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 8);
      ctx.strokeStyle = `rgba(255,220,190,${0.05 - i * 0.005})`; ctx.lineWidth = 1.2; ctx.stroke();
    }
    // pebbles
    for (let i = 0; i < 40; i++) {
      const x = rnd() * W, y = Ys + H * (0.05 + rnd() * 1.0), r = 2 + rnd() * 7;
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.4, r, rnd(), 0, 6.28);
      ctx.fillStyle = 'rgba(255,235,215,0.05)'; ctx.fill();
    }

    // ground surface: moss band + glowing horizon
    const mossG = ctx.createLinearGradient(0, Ys - 10, 0, Ys + 14);
    const moss = mix(hex('#7DC48F'), hex('#2B4A44'), duskT);
    mossG.addColorStop(0, rgb(mix(moss, [255, 255, 255], 0.25))); mossG.addColorStop(1, rgb(mix(moss, [20, 40, 30], 0.5)));
    ctx.fillStyle = mossG; ctx.fillRect(-40, Ys - 6, W + 80, 18);
    ctx.lineCap = 'round';
    for (const g of grass) {
      const sw = Math.sin(time * 1.2 + g.x * 0.03) * 2;
      ctx.beginPath(); ctx.moveTo(g.x, Ys); ctx.quadraticCurveTo(g.x + g.lean, Ys - g.h * 0.6, g.x + g.lean * 1.4 + sw, Ys - g.h);
      ctx.strokeStyle = rgb(mix(mix(hex('#5DB27A'), hex('#B9E8A0'), g.c), hex('#22403A'), duskT), 0.9); ctx.lineWidth = 1.6; ctx.stroke();
    }
    const glowA = 0.5 + down * 0.5;
    const hl = ctx.createLinearGradient(0, 0, W, 0);
    hl.addColorStop(0, 'rgba(220,255,240,0)'); hl.addColorStop(0.5, `rgba(235,255,248,${glowA})`); hl.addColorStop(1, 'rgba(220,255,240,0)');
    ctx.fillStyle = hl; ctx.fillRect(0, Ys + 11, W, 2);

    // impact ripple when the seed lands
    const land = seg(p, K.drop0 + 0.035, K.drop0 + 0.07);
    if (land > 0 && land < 1) {
      for (let k = 0; k < 2; k++) {
        const t = clamp(land * 1.3 - k * 0.25);
        if (t <= 0) continue;
        ctx.beginPath(); ctx.ellipse(W / 2, Ys + 4, 20 + t * W * 0.35, 4 + t * 26, 0, 0, 6.28);
        ctx.strokeStyle = `rgba(230,255,245,${(1 - t) * 0.8})`; ctx.lineWidth = 2; ctx.stroke();
      }
    }

    // roots
    const rootG = seg(p, K.roots0, K.roots1);
    if (rootG > 0) {
      ctx.globalCompositeOperation = 'lighter';
      for (const r of roots) {
        const f = clamp((rootG - r.start) / r.dur);
        if (f <= 0) continue;
        const c = rgb(r.hue, 0.9);
        strokePartial(r.pts, eOut(f), r.w * 3.2, rgb(r.hue, 0.12), 0);
        const tip = strokePartial(r.pts, eOut(f), r.w, c, W < 700 ? 6 : 14);
        // travelling pulse
        const pulse = (time * 0.35 + r.start) % 1;
        const pi = Math.floor(pulse * eOut(f) * (r.pts.length - 1));
        const pp = r.pts[pi];
        ctx.beginPath(); ctx.arc(pp.x, pp.y, r.w * 1.2, 0, 6.28); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
        if (r.node !== undefined && f >= 1) {
          const n = nodes[r.node], pr = 10 + Math.sin(time * 2 + r.node) * 2;
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pr * 4);
          g.addColorStop(0, rgb(r.hue, 0.9)); g.addColorStop(0.3, rgb(r.hue, 0.3)); g.addColorStop(1, rgb(r.hue, 0));
          ctx.fillStyle = g; ctx.fillRect(n.x - pr * 4, n.y - pr * 4, pr * 8, pr * 8);
          ctx.beginPath(); ctx.arc(n.x, n.y, 5, 0, 6.28); ctx.fillStyle = '#fff'; ctx.fill();
        } else if (f < 1) {
          ctx.beginPath(); ctx.arc(tip.x, tip.y, r.w * 1.6, 0, 6.28); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // seed
    const gate = state.gate; // 0..1 while holding
    const fallT = seg(p, K.drop0, K.drop0 + 0.045);
    const s0 = { x: W * 0.5, y: H * (portrait ? 0.43 : 0.42) };
    const rest = seedRest();
    const seedSize = Math.min(W, H) * (portrait ? 0.13 : 0.1) * (1 - 0.35 * fallT) * (1 - 0.2 * seg(p, K.roots0, K.roots0 + 0.05));
    const bob = Math.sin(time * 1.4) * 8 * (1 - fallT);
    let sx = lerp(s0.x, rest.x, fallT), sy = lerp(s0.y + bob, rest.y, fallT * fallT);
    const spin = fallT * 2.6 + Math.sin(time * 0.8) * 0.12 * (1 - fallT) - 0.3 + gate * 0.4;
    const seedVis = 1 - seg(p, K.sprout0, K.sprout0 + 0.04);
    if (seedVis > 0) drawSeed(sx, sy, seedSize * (1 + gate * 0.08), spin, 0.25 + 0.75 * seg(p, K.drop1, K.roots0 + 0.02) + gate * 0.5, seedVis);

    // tree
    const sprout = seg(p, K.sprout0, K.sprout1);
    const tg = sprout > 0 ? lerp(0, 0.06, sprout) + ease(seg(p, K.tree0, K.tree1)) * 0.94 : 0;
    if (tg > 0) {
      const wind = Math.sin(time * 0.9) * 0.006;
      for (const b of branches) {
        const f = clamp((tg - b.t0) / b.dur);
        if (f <= 0) continue;
        const ex = lerp(b.x, b.x2, f), ey = lerp(b.y, b.y2, f);
        const sway = (Ys - b.y) * wind * (1 + b.lvl * 0.3);
        ctx.beginPath(); ctx.moveTo(b.x + sway * 0.7, b.y);
        ctx.quadraticCurveTo(lerp(b.x, b.cx, f) + sway, lerp(b.y, b.cy, f), ex + sway, ey);
        const bark = mix(mix(hex('#6E5643'), hex('#8FB98A'), clamp((b.lvl - 3) / 4)), hex('#1B2730'), duskT * 0.7);
        ctx.strokeStyle = rgb(bark); ctx.lineWidth = Math.max(1, b.thick * (0.4 + 0.6 * clamp(tg * 1.4 - b.lvl * 0.05))); ctx.lineCap = 'round'; ctx.stroke();
      }
      // sprout leaf (first job) – visible early, stays as a leaf on the trunk
      if (sprout > 0) {
        const ly = Ys - Math.min(60, H * 0.08) * eOut(sprout);
        const lr = 16 * eOut(seg(p, K.sprout0 + 0.02, K.sprout1)) * (W < 700 ? 0.8 : 1);
        if (lr > 0.5) {
          ctx.save(); ctx.translate(W * 0.5 + 2, ly); ctx.rotate(-0.6 + Math.sin(time) * 0.05);
          ctx.beginPath(); ctx.ellipse(lr, 0, lr, lr * 0.45, 0, 0, 6.28);
          const lg = ctx.createLinearGradient(0, -lr, lr * 2, lr); lg.addColorStop(0, '#CFF5B5'); lg.addColorStop(1, '#4FA86A');
          ctx.fillStyle = lg; ctx.fill(); ctx.restore();
        }
      }
      // leaves
      for (const l of leaves) {
        const f = clamp((tg - l.t0) / 0.08);
        if (f <= 0) continue;
        const sway = Math.sin(time * 1.3 + l.sway) * 2;
        ctx.save(); ctx.translate(l.x + sway, l.y); ctx.rotate(l.rot + sway * 0.02);
        ctx.globalAlpha = 0.9 * f;
        ctx.beginPath(); ctx.ellipse(0, 0, l.r * eOut(f), l.r * 0.55 * eOut(f), 0, 0, 6.28);
        let c1, c2;
        if (l.blossom) { c1 = '#FFE1EA'; c2 = '#F29CB8'; } else { c1 = '#D9F7C2'; c2 = '#5FAE74'; }
        if (duskT > 0) { c1 = rgb(mix(hex(c1), hex('#3A5A60'), duskT * 0.7)); c2 = rgb(mix(hex(c2), hex('#173038'), duskT * 0.7)); }
        const lg = ctx.createLinearGradient(-l.r, -l.r, l.r, l.r); lg.addColorStop(0, c1); lg.addColorStop(1, c2);
        ctx.fillStyle = lg; ctx.fill(); ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    // fruit glow (DOM buttons sit on top of these)
    const fr = seg(p, K.fruit0, K.fruit1);
    if (fr > 0) {
      ctx.globalCompositeOperation = 'lighter';
      for (const f of fruitTips) {
        const t = clamp(fr * 1.6 - f.i * 0.08);
        if (t <= 0) continue;
        const r = 40 * eOut(t);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
        g.addColorStop(0, 'rgba(255,240,200,0.55)'); g.addColorStop(1, 'rgba(255,240,200,0)');
        ctx.fillStyle = g; ctx.fillRect(f.x - r, f.y - r, r * 2, r * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();

    // fog layers (screen space, parallax)
    if (fogSprite) {
      const under = down * (1 - up);
      const fogA = (0.85 - 0.5 * seg(p, K.tree0, K.fruit1) + 0.25 * duskT) * (1 - under * 0.55);
      for (let i = 0; i < 4; i++) {
        const sp = (i + 1) * 9;
        const x = ((time * sp + i * 300) % (W + 900)) - 600 + px * -40 * (i + 1);
        const y = H * (0.25 + i * 0.16) + py * -20 * (i + 1) + Math.sin(time * 0.2 + i) * 20;
        ctx.globalAlpha = fogA * (i === 3 ? 0.9 : 0.55);
        ctx.drawImage(fogSprite, x, y - H * 0.4, Math.max(900, W * 0.9), H * 0.8);
      }
      if (under > 0) {
        ctx.globalAlpha = under * 0.35;
        const tint = ctx.createLinearGradient(0, 0, 0, H);
        tint.addColorStop(0, 'rgba(20,40,45,0)'); tint.addColorStop(1, 'rgba(10,20,25,0.8)');
        ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H);
      }
      ctx.globalAlpha = 1;
    }

    // motes: dust in mist, sparks underground, pollen by day, fireflies at night
    const night = seg(p, K.dusk0 + 0.03, K.dusk1);
    const under = down * (1 - up);
    for (const m of motes) {
      m.y -= m.sp * m.z * (dt * 60) * 0.35;
      m.x += Math.sin(time * 0.6 + m.ph) * 0.15;
      if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
      const x = m.x + px * -60 * m.z, y = m.y + py * -30 * m.z;
      let col, a, r = m.r * (0.6 + m.z);
      if (night > 0.2) { col = '214,255,140'; a = night * (0.4 + 0.6 * Math.max(0, Math.sin(time * 2 + m.ph * 3))); r *= 1.3; }
      else if (under > 0.5) { col = '255,214,160'; a = 0.25 + 0.4 * m.z; }
      else { col = '255,255,255'; a = 0.35 + 0.4 * m.z; }
      if (night > 0.2) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
        g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g; ctx.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
      } else {
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fillStyle = `rgba(${col},${a})`; ctx.fill();
      }
    }

    // vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.8);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(10,20,25,${0.18 + under * 0.35 + night * 0.3})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

    if (World.onFrame) World.onFrame(state);
    requestAnimationFrame(frame);
  }

  // ---------- public API ----------
  const World = {
    K, state,
    setProgress(p) { state.p = p; },
    setGate(g) { state.gate = g; },
    toScreen(x, y) { return { x: x - (state.smx - 0.5) * 14, y: y - state.cam }; },
    get nodes() { return nodes; },
    get eraAnchors() { return eraAnchors; },
    get fruitTips() { return fruitTips; },
    get size() { return { W, H, Ys, portrait }; },
    onFrame: null,
  };
  window.World = World;

  addEventListener('pointermove', (e) => { state.mx = e.clientX / innerWidth; state.my = e.clientY / innerHeight; }, { passive: true });
  addEventListener('resize', () => { layout(); });
  layout();
  requestAnimationFrame(frame);
})();
