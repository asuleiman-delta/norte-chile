/* NCI · Fondo "Conexiones" — trazos ortogonales con encendido por cursor, pulsos y entrada.
   window.NCICircuit.mount(canvas, { theme:'dark'|'light' }) -> { setTheme, setPaused, destroy } */
(function () {
  const CFG = {
    grid: 46, density: 0.11, minSteps: 3, maxSteps: 12, turnChance: 0.28, cornerDot: 0.35,
    valveChance: 0.18, radius: 300, pulses: 14, pulseSpeed: [90, 170], tail: 70, introDur: 2200, lerp: 0.12, blur: 2.5, litBlur: 0.6, pulseBlur: 1.6
  };
  const THEMES = {
    dark:  { bg: '#060F2B', valveFill: '#0D1B3E', base: 'rgba(140,160,215,0.09)', baseNode: 'rgba(160,178,225,0.20)',
             lit: [232, 44, 52], node: [255, 92, 98], pulse: [255, 80, 86], core: '#FFE9EA', glow: true },
    light: { bg: '#F7F6F3', base: 'rgba(10,26,68,0.07)', baseNode: 'rgba(10,26,68,0.16)',
             lit: [10, 26, 68], node: [215, 25, 32], pulse: [215, 25, 32], core: '#FFFFFF', glow: false },
    lightStrong: { bg: '#EDF0F5', base: 'rgba(10,26,68,0.18)', baseNode: 'rgba(10,26,68,0.34)',
             lit: [10, 26, 68], node: [215, 25, 32], pulse: [215, 25, 32], core: '#FFFFFF', glow: false }
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const rand = (a, b) => a + Math.random() * (b - a);

  function mount(cvs, opts) {
    opts = opts || {};
    const ctx = cvs.getContext('2d');
    const baseCvs = document.createElement('canvas');
    baseCvs.setAttribute('aria-hidden', 'true');
    baseCvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0;filter:blur(' + CFG.blur + 'px);transform:translateZ(0);';
    cvs.parentNode.insertBefore(baseCvs, cvs);
    const bctx = baseCvs.getContext('2d');
    const pCvs = document.createElement('canvas');
    pCvs.setAttribute('aria-hidden', 'true');
    pCvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0;filter:blur(' + CFG.pulseBlur + 'px);transform:translateZ(0);';
    cvs.parentNode.insertBefore(pCvs, cvs.nextSibling);
    const pctx = pCvs.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let theme = THEMES[opts.theme] || THEMES.dark;
    let W = 0, H = 0, DPR = 1, traces = [], edges = [], nodes = [], valves = [], base, pulses = [], rings = [];
    let paused = reduce || !!opts.paused, introDone = reduce, t0 = performance.now(), last = t0, raf = 0, alive = true;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false, amt: reduce ? 1 : 0, auto: 0 };

    function build() {
      const r = cvs.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      cvs.width = W * DPR; cvs.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const G = CFG.grid, cols = Math.ceil(W / G) + 1, rows = Math.ceil(H / G) + 1;
      const ox = Math.round((W - (cols - 1) * G) / 2) + .5, oy = Math.round((H - (rows - 1) * G) / 2) + .5;
      const used = new Set(), key = (c, r) => c + ',' + r, DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
      traces = []; edges = []; nodes = []; valves = [];
      const count = Math.round(cols * rows * CFG.density);
      for (let i = 0; i < count * 2 && traces.length < count; i++) {
        let c = (Math.random() * cols) | 0, r2 = (Math.random() * rows) | 0;
        if (used.has(key(c, r2))) continue;
        let d = (Math.random() * 4) | 0;
        const path = [[c, r2]], local = new Set([key(c, r2)]);
        const steps = CFG.minSteps + ((Math.random() * (CFG.maxSteps - CFG.minSteps + 1)) | 0);
        for (let s = 0; s < steps; s++) {
          const turn = Math.random() < CFG.turnChance, side = Math.random() < .5 ? 1 : 3;
          const o = turn ? [(d + side) % 4, (d + 4 - side) % 4, d] : [d, (d + side) % 4, (d + 4 - side) % 4];
          let moved = false;
          for (const nd of o) {
            const nc = c + DIRS[nd][0], nr = r2 + DIRS[nd][1], k = key(nc, nr);
            if (nc < 0 || nr < 0 || nc >= cols || nr >= rows || used.has(k) || local.has(k)) continue;
            c = nc; r2 = nr; d = nd; path.push([c, r2]); local.add(k); moved = true; break;
          }
          if (!moved) break;
        }
        if (path.length < CFG.minSteps + 1) continue;
        local.forEach(k => used.add(k));
        const pts = path.map(([c, r]) => ({ x: ox + c * G, y: oy + r * G }));
        const tr = { pts, len: (pts.length - 1) * G, delay: Math.random() * CFG.introDur * .6, nodes: [], valves: [], e0: edges.length };
        for (let j = 0; j < pts.length - 1; j++) {
          const a = pts[j], b = pts[j + 1];
          edges.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 });
        }
        tr.nodes.push({ x: pts[0].x, y: pts[0].y, end: true }, { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y, end: true });
        for (let j = 1; j < pts.length - 1; j++) {
          const p = pts[j - 1], q = pts[j], n = pts[j + 1];
          if ((p.x - q.x) * (n.y - q.y) - (p.y - q.y) * (n.x - q.x) !== 0 && Math.random() < CFG.cornerDot) tr.nodes.push({ x: q.x, y: q.y });
        }
        if (pts.length >= 4 && Math.random() < CFG.valveChance) {
          const e = edges[tr.e0 + 1 + ((Math.random() * (pts.length - 3)) | 0)];
          tr.valves.push({ x: e.mx, y: e.my, h: e.ay === e.by });
        }
        nodes.push(...tr.nodes); valves.push(...tr.valves); traces.push(tr);
      }
      baseCvs.width = W * DPR; baseCvs.height = H * DPR;
      pCvs.width = W * DPR; pCvs.height = H * DPR; pctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      bctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (introDone) renderBase();
      pulses = Array.from({ length: CFG.pulses }, () => newPulse(true)).filter(Boolean);
      rings = [];
      if (!mouse.active) { mouse.x = mouse.tx = W * .7; mouse.y = mouse.ty = H * .5; }
    }
    function renderBase() { drawBase(bctx, Infinity); }
    function pointAt(tr, s) {
      const G = CFG.grid; s = clamp(s, 0, tr.len);
      const i = Math.min(tr.pts.length - 2, Math.floor(s / G)), f = (s - i * G) / G, a = tr.pts[i], b = tr.pts[i + 1];
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
    function tracePath(g, tr, upto) {
      const G = CFG.grid, full = Math.floor(upto / G);
      g.moveTo(tr.pts[0].x, tr.pts[0].y);
      for (let i = 1; i <= full && i < tr.pts.length; i++) g.lineTo(tr.pts[i].x, tr.pts[i].y);
      if (full < tr.pts.length - 1) { const p = pointAt(tr, upto); g.lineTo(p.x, p.y); }
    }
    function drawValve(g, v, stroke) {
      const s = 6;
      g.save(); g.translate(v.x, v.y); if (!v.h) g.rotate(Math.PI / 2);
      g.beginPath();
      g.moveTo(-s, -s * .75); g.lineTo(-s, s * .75); g.lineTo(0, 0); g.closePath();
      g.moveTo(s, -s * .75); g.lineTo(s, s * .75); g.lineTo(0, 0); g.closePath();
      g.fillStyle = theme.valveFill || theme.bg; g.fill(); g.strokeStyle = stroke; g.stroke();
      g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -s * 1.15); g.moveTo(-s * .6, -s * 1.15); g.lineTo(s * .6, -s * 1.15); g.stroke();
      g.restore();
    }
    function drawBase(g, el) {
      g.clearRect(0, 0, W, H);
      g.lineWidth = 1; g.strokeStyle = theme.base; g.lineCap = 'square';
      g.beginPath();
      const done = [];
      for (const tr of traces) {
        const p = el === Infinity ? 1 : ease(clamp((el - tr.delay) / (CFG.introDur * .4), 0, 1));
        if (p <= 0) continue;
        tracePath(g, tr, tr.len * p);
        if (p >= 1) done.push(tr);
      }
      g.stroke();
      g.fillStyle = theme.baseNode;
      for (const tr of done) for (const n of tr.nodes) { g.beginPath(); g.arc(n.x, n.y, n.end ? 2 : 1.5, 0, 6.2832); g.fill(); }
      g.lineWidth = 1;
      for (const tr of done) for (const v of tr.valves) drawValve(g, v, theme.baseNode);
    }
    function drawLit() {
      const R = CFG.radius, amt = mouse.amt;
      if (amt < .01) return;
      const N = 10, paths = Array.from({ length: N }, () => new Path2D()), has = new Array(N).fill(false);
      for (const e of edges) {
        const d = Math.hypot(e.mx - mouse.x, e.my - mouse.y);
        if (d > R) continue;
        const k = Math.pow(1 - d / R, 1.5) * amt;
        if (k < .03) continue;
        const bi = Math.min(N - 1, Math.floor(k * N));
        paths[bi].moveTo(e.ax, e.ay); paths[bi].lineTo(e.bx, e.by); has[bi] = true;
      }
      const [r, g, b] = theme.lit;
      ctx.lineWidth = 1.25; ctx.lineCap = 'square';
      for (let i = 0; i < N; i++) {
        if (!has[i]) continue;
        ctx.strokeStyle = `rgba(${r},${g},${b},${((i + 1) / N * .95).toFixed(3)})`;
        if (theme.glow && i > 7) { ctx.shadowColor = `rgba(${r},${g},${b},.55)`; ctx.shadowBlur = 6; }
        ctx.stroke(paths[i]); ctx.shadowBlur = 0;
      }
      const [nr, ng, nb] = theme.node;
      for (const n of nodes) {
        const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (d > R) continue;
        ctx.fillStyle = `rgba(${nr},${ng},${nb},${(Math.pow(1 - d / R, 1.5) * amt).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.end ? 2.6 : 2, 0, 6.2832); ctx.fill();
      }
      ctx.lineWidth = 1.25;
      for (const v of valves) {
        const d = Math.hypot(v.x - mouse.x, v.y - mouse.y);
        if (d > R) continue;
        drawValve(ctx, v, `rgba(${r},${g},${b},${(Math.pow(1 - d / R, 1.5) * amt).toFixed(3)})`);
      }
    }
    function newPulse(initial) {
      for (let tries = 0; tries < 20; tries++) {
        const tr = traces[(Math.random() * traces.length) | 0];
        if (tr && tr.len >= CFG.grid * 4)
          return { tr, s: initial ? -Math.random() * 900 : -Math.random() * 300, v: rand(...CFG.pulseSpeed), rev: Math.random() < .5, hit: false };
      }
      return null;
    }
    function drawPulses(dt) {
      const [r, g, b] = theme.pulse;
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        if (!paused) p.s += p.v * dt;
        if (p.s < 0) continue;
        const at = s => pointAt(p.tr, p.rev ? p.tr.len - s : s);
        for (let k = 1; k <= 10; k++) {
          const s = p.s - k * (CFG.tail / 10);
          if (s < 0 || s > p.tr.len) continue;
          const q = at(s);
          pctx.fillStyle = `rgba(${r},${g},${b},${((1 - k / 10) * .7).toFixed(3)})`;
          pctx.beginPath(); pctx.arc(q.x, q.y, 1.6 * (1 - k / 12), 0, 6.2832); pctx.fill();
        }
        if (p.s <= p.tr.len) {
          const q = at(p.s), gr = pctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 12);
          gr.addColorStop(0, `rgba(${r},${g},${b},.55)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
          pctx.fillStyle = gr; pctx.beginPath(); pctx.arc(q.x, q.y, 12, 0, 6.2832); pctx.fill();
          pctx.fillStyle = theme.core; pctx.beginPath(); pctx.arc(q.x, q.y, 2, 0, 6.2832); pctx.fill();
        } else if (!p.hit) { p.hit = true; const q = at(p.tr.len); rings.push({ x: q.x, y: q.y, t: 0 }); }
        if (p.s > p.tr.len + CFG.tail) pulses[i] = newPulse(false) || p;
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const o = rings[i]; if (!paused) o.t += dt / .6;
        if (o.t >= 1) { rings.splice(i, 1); continue; }
        pctx.strokeStyle = `rgba(${r},${g},${b},${(1 - o.t).toFixed(3)})`; pctx.lineWidth = 1.25;
        pctx.beginPath(); pctx.arc(o.x, o.y, 2 + 14 * ease(o.t), 0, 6.2832); pctx.stroke();
      }
    }
    function frame(now) {
      if (!alive) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const el = now - t0;
      ctx.clearRect(0, 0, W, H);
      if (!introDone) { drawBase(bctx, el); if (el > CFG.introDur + 200) { introDone = true; renderBase(); } }
      if (!mouse.active && !paused) {
        mouse.auto += dt * 1000;
        mouse.tx = W * (.5 + .32 * Math.sin(mouse.auto * .00021));
        mouse.ty = H * (.5 + .28 * Math.sin(mouse.auto * .00029 + 1.3));
      }
      mouse.x += (mouse.tx - mouse.x) * CFG.lerp;
      mouse.y += (mouse.ty - mouse.y) * CFG.lerp;
      mouse.amt += ((introDone ? 1 : 0) - mouse.amt) * .05;
      drawLit();
      pctx.clearRect(0, 0, W, H);
      if (!reduce) drawPulses(dt);
      raf = requestAnimationFrame(frame);
    }
    const onMove = e => {
      if (e.pointerType === 'touch') return;
      const r = cvs.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) { mouse.active = false; return; }
      mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top; mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };
    let rt; const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { introDone = true; build(); }, 200); };
    addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    if (ro) ro.observe(cvs); else addEventListener('resize', onResize);
    build();
    raf = requestAnimationFrame(frame);
    return {
      setTheme(name) { const t = THEMES[name]; if (!t || t === theme) return; theme = t; renderBase(); },
      setPaused(v) { paused = reduce || !!v; },
      isReduced: reduce,
      destroy() {
        alive = false; cancelAnimationFrame(raf);
        removeEventListener('pointermove', onMove); document.documentElement.removeEventListener('mouseleave', onLeave);
        if (ro) ro.disconnect(); else removeEventListener('resize', onResize);
        baseCvs.remove(); pCvs.remove();
      }
    };
  }
  window.NCICircuit = { mount };
})();
