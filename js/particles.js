/* Hero: a field of particles that assembles into the Gikpik mark, reacts to the
   pointer and bursts on click. Pauses when off screen or in a hidden tab. */
(() => {
  "use strict";
  const stage = document.getElementById("stage");
  const canvas = document.getElementById("particles");
  if (!stage || !canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext && canvas.getContext("2d");
  if (reduced || !ctx || typeof Path2D === "undefined") { stage.classList.add("no-particles"); return; }

  const PATH = "M256.5,0 L512,265.5 L268.5,512 L268.5,240 L272.5,240 L318,285.5 L318,342 L394,266 L256.5,126 L119,266 L195,342 L195,285.5 L240.5,240 L244.5,240 L244.5,512 L0,265.5 Z";
  const COLORS = ["#00EB8A", "#00EE9C", "#00E9AA", "#00E6B6"];
  const INSET = 0.08;
  const S = 512;

  // mask of the mark, sampled once
  const off = document.createElement("canvas");
  off.width = off.height = S;
  const octx = off.getContext("2d", { willReadFrequently: true });
  octx.fillStyle = "#fff";
  octx.fill(new Path2D(PATH));
  const mask = octx.getImageData(0, 0, S, S).data;
  const inside = (x, y) => x >= 0 && y >= 0 && x < S && y < S && mask[((y | 0) * S + (x | 0)) * 4 + 3] > 128;

  let W = 0, H = 0, dpr = 1, parts = [], t0 = performance.now();
  const ptr = { x: -9999, y: -9999, on: false };

  function build() {
    const r = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const gap = W < 420 ? 6.5 : 5.8;                 // screen px between particles
    const markPx = W * (1 - 2 * INSET);
    const step = gap * S / markPx;                   // same gap in mask units
    const targets = [];
    for (let y = step / 2; y < S; y += step) {
      const row = Math.round(y / step) % 2;          // staggered rows read denser
      for (let x = step / 2 + (row ? step / 2 : 0); x < S; x += step) {
        if (inside(x, y)) targets.push([W * INSET + x / S * markPx, H * INSET + y / S * markPx]);
      }
    }
    const next = [];
    targets.forEach(([tx, ty], i) => {
      const p = parts[i] || {
        x: Math.random() * W, y: H * (0.7 + Math.random() * 0.5), vx: 0, vy: 0,
        s: 1.6 + Math.random() * 1.4, ph: Math.random() * 6.28
      };
      p.tx = tx; p.ty = ty;
      p.delay = 350 + (1 - ty / H) * 1000 + Math.random() * 350;   // climbs bottom to top
      p.c = Math.min(3, Math.floor(ty / H * 4));
      next.push(p);
    });
    parts = next;
  }

  let raf = 0, running = false, last = performance.now();
  function frame(now) {
    raf = 0;
    if (!running) return;
    const settled = !ptr.on && now - t0 > 3200;
    if (settled && now - last < 30) { raf = requestAnimationFrame(frame); return; }   // idle: ~30fps
    const dt = Math.min(now - last, 40) / 16.67; last = now;
    const el = now - t0;
    const damp = Math.pow(0.84, dt);
    const R = 96, R2 = R * R;

    for (const p of parts) {
      if (el > p.delay) {
        let ax = (p.tx - p.x) * 0.05, ay = (p.ty - p.y) * 0.05;
        if (ptr.on) {
          const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1, f = (1 - d / R) * (1 - d / R) * 7;
            ax += dx / d * f; ay += dy / d * f;
          }
        }
        p.vx = (p.vx + ax * dt) * damp;
        p.vy = (p.vy + ay * dt) * damp;
      } else {
        p.vx += Math.sin(now / 900 + p.ph) * 0.02 * dt;
        p.vy += Math.cos(now / 1100 + p.ph) * 0.02 * dt;
        p.vx *= 0.97; p.vy *= 0.97;
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
    }

    ctx.clearRect(0, 0, W, H);
    for (let c = 0; c < 4; c++) {
      ctx.fillStyle = COLORS[c];
      ctx.beginPath();
      for (const p of parts) {
        if (p.c !== c) continue;
        const a = el > p.delay ? 1 : 0.35;
        if (a < 1) continue;
        const s = p.s;
        ctx.rect(p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.fill();
    }
    ctx.fillStyle = "rgba(0,235,138,.35)";
    ctx.beginPath();
    for (const p of parts) if (el <= p.delay) ctx.rect(p.x - 0.8, p.y - 0.8, 1.6, 1.6);
    ctx.fill();

    raf = requestAnimationFrame(frame);
  }
  function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  function local(e) {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)];
  }
  canvas.addEventListener("pointermove", (e) => { [ptr.x, ptr.y] = local(e); ptr.on = true; });
  canvas.addEventListener("pointerleave", () => { ptr.on = false; });
  canvas.addEventListener("pointerdown", (e) => {
    const [cx, cy] = local(e);
    for (const p of parts) {
      const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) || 1;
      if (d < 280) { const f = (1 - d / 280) * 22; p.vx += dx / d * f; p.vy += dy / d * f; }
    }
  });

  let rt;
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(build, 120); }).observe(stage);

  build();
  stage.classList.add("has-particles");
  window.addEventListener("gk:intro", () => {
    t0 = performance.now();
    for (const p of parts) { p.x = Math.random() * W; p.y = H * (0.7 + Math.random() * 0.5); p.vx = 0; p.vy = 0; }
  });
  const io = new IntersectionObserver((en) => { en[0].isIntersecting && !document.hidden ? start() : stop(); }, { threshold: 0 });
  io.observe(stage);
  document.addEventListener("visibilitychange", () => { document.hidden ? stop() : start(); });
})();
