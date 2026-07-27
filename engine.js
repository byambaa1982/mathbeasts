// Mini p5.js shim so tweet-sized p5 sketches run verbatim in a plain page,
// deterministically steppable by tools/render_canvas_gif.py.
//
// Supported p5 API (what these sketches actually use): createCanvas, background,
// stroke, strokeWeight, point, mag, dist, constrain, and the math globals
// (sin cos tan atan2 sqrt abs pow exp log floor ceil round min max sign,
// PI TAU TWO_PI HALF_PI QUARTER_PI). Chaining like background(9).stroke(w,96)
// works. NOT supported: noise(), colorMode/HSB, line/vertex shapes — extend
// here if a sketch needs them.
//
// Scene contract: after the sketch defines draw(), call
//   loop(FRAMES, STEP)
// FRAMES = GIF frames per seamless loop, STEP = draw() calls per frame;
// FRAMES * STEP must equal the sketch's full period in draw-steps (see README).

(() => {
  const dpr = window.devicePixelRatio || 1;
  let ctx = null, W = 400, H = 400;
  let strokeCol = 'rgba(255,255,255,1)', weight = 1, dirty = true;

  const clamp = v => { v = Math.round(v); return v < 0 ? 0 : v > 255 ? 255 : v; };
  const rgba = a => {
    let r, g, b, al = 255;
    if (a.length <= 2) { r = g = b = a[0]; if (a.length === 2) al = a[1]; }
    else { [r, g, b] = a; if (a.length === 4) al = a[3]; }
    return `rgba(${clamp(r)},${clamp(g)},${clamp(b)},${(clamp(al) / 255).toFixed(3)})`;
  };

  const api = {};
  window.createCanvas = (w, h) => {
    W = w; H = h;
    const c = document.createElement('canvas');
    c.style.cssText = `width:${w}px;height:${h}px;display:block`;
    c.width = w * dpr; c.height = h * dpr;
    (document.getElementById('stage') || document.body).appendChild(c);
    ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    window.width = w; window.height = h;
    return api;
  };
  window.background = (...a) => {
    ctx.fillStyle = rgba(a); ctx.fillRect(0, 0, W, H); dirty = true; return api;
  };
  window.stroke = (...a) => { strokeCol = rgba(a); dirty = true; return api; };
  window.strokeWeight = n => { weight = n; return api; };
  window.point = (x, y) => {
    if (dirty) { ctx.fillStyle = strokeCol; dirty = false; }
    ctx.fillRect(x - weight / 2, y - weight / 2, weight, weight);
  };
  api.background = window.background;
  api.stroke = window.stroke;
  api.strokeWeight = window.strokeWeight;

  for (const k of ['sin', 'cos', 'tan', 'atan2', 'sqrt', 'abs', 'pow', 'exp',
                   'log', 'floor', 'ceil', 'round', 'min', 'max', 'sign'])
    window[k] = Math[k];
  window.mag = Math.hypot;
  window.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  window.constrain = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  window.PI = Math.PI;
  window.TAU = window.TWO_PI = 2 * Math.PI;
  window.HALF_PI = Math.PI / 2;
  window.QUARTER_PI = Math.PI / 4;

  // Tiny overlays, same faint white as the dots. Override per scene before
  // loop(): window.WATERMARK = 'your name' (bottom-right signature, '' to
  // disable), window.FORMULA = 'k = ...' or ['k = ...', 'q = ...'] (upper-left
  // math annotation).
  window.WATERMARK = '';
  window.FORMULA = null;
  const overlays = () => {
    if (!ctx) return;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textBaseline = 'alphabetic';
    if (window.WATERMARK) {
      ctx.font = '9px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(window.WATERMARK, W - 8, H - 8);
    }
    if (window.FORMULA) {
      const lines = Array.isArray(window.FORMULA) ? window.FORMULA : [window.FORMULA];
      ctx.font = '8px Consolas, monospace';
      ctx.textAlign = 'left';
      lines.forEach((ln, j) => ctx.fillText(ln, 8, 15 + j * 11));
    }
    dirty = true;
  };

  let step = 1;
  window.__frames = null;
  window.loop = (frames, s = 1) => { window.__frames = frames; step = s; };
  window.__step = () => step;
  window.__seek = () => {
    if (typeof window.draw !== 'function')
      throw new Error('scene never defined draw() — paste the tweet code before loop()');
    for (let s = 0; s < step; s++) window.draw();
    overlays();
  };
})();
