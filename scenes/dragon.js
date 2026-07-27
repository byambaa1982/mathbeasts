// ==== ORIGINAL SKETCH — "dragon" (Byamba Enkhbat) ====
// A serpentine dragon: spine curve with a traveling wave, ribbed tube body,
// sawtooth dorsal spikes, horns and whiskers at the head.
G = 2.39996  // golden angle, decorrelates ring particles
// spine: s = 0 head .. 1 tail tip (s < 0 = snout)
P = s => [
  330 - 288 * s + 10 * s * sin(2 * s + 2 * t),
  140 + 130 * s + (14 + 44 * s) * sin(6 * s - t)
]
// body radius: slender tube + gaussian head bulge, snout taper below s=0
R = s => s < 0 ? 6 * (1 + s / 0.06)
              : 2.5 + 15 * sin(PI * (0.06 + 0.94 * s)) * (1 - 0.55 * s)
                    + 8 * exp(-(s - 0.03) * (s - 0.03) / 0.004)

t = 0
draw = $ => {
  t || createCanvas(w = 400, w)
  background(9).stroke(w, 96)
  t += PI / 40
  for (i = 2e4; i--;) {
    if (i % 8 < 6) {
      // body tube: rings of points around the spine (ribs / scales)
      s = -0.06 + 1.06 * ((i / 15000) % 1)
      p = P(s); p2 = P(s + 0.01)
      dx = p2[0] - p[0]; dy = p2[1] - p[1]; L = mag(dx, dy) + 1e-6
      ring = cos(i * G) * R(s)
      jit = 2 * sin(i * 47)
      point(p[0] - dy / L * ring + dx / L * jit,
            p[1] + dx / L * ring + dy / L * jit)
    } else if (i % 8 == 6) {
      // dorsal spikes: sawtooth fins along the back
      s = 0.1 + 0.85 * ((i / 2500) % 1)
      f = (s * 16) % 1
      p = P(s)
      h = (10 + 15 * sin(PI * s)) * (1 - f)
      point(p[0] + 2 * sin(i), p[1] - R(s) * 0.9 - h * ((i * G) % 1))
    } else {
      // head gear — i%8==7 fixes the low bits, so derive role/side from
      // higher bits: role 0 = horns, 1 = whiskers, 2 = eye, 3 = tail tuft
      u = (i / 999) % 1
      side = (i >> 3) % 2 ? 1 : -1
      role = (i >> 4) % 4
      th = cos(i * G) * 2 * (1 - 0.6 * u)
      if (role == 2) {
        hd = P(0.02)
        r = 2 * sqrt((i * G) % 1)
        point(hd[0] + 5 + r * cos(i * G * 7), hd[1] - 3 + r * sin(i * G * 7))
      } else if (role == 1) {
        st = P(-0.045)
        point(st[0] + 4 + 8 * u - 20 * u * u + th * 0.8,
              st[1] + 4 + side * (1 + 2 * u) + 14 * u + 3 * u * sin(6 * u - t) + th)
      } else if (role == 0) {
        bp = P(0.035)
        point(bp[0] - 2 - 16 * u - 8 * u * u + side * (2 + 3 * u) + th,
              bp[1] - R(0.035) * 0.8 - 14 * u + 9 * u * u + th * 0.8 + 1.5 * sin(t + 2 * u))
      } else {
        tp = P(0.985)
        point(tp[0] - 4 - 20 * u + th,
              tp[1] + side * u * (3 + 8 * u) + 4 * u * sin(6 * u - t) + th)
      }
    }
  }
}
// ==== END SKETCH ====

WATERMARK = 'Byamba Enkhbat'
FORMULA = [
  'spine(s) = (330 − 288s,  140 + 130s + (14 + 44s) sin(6s − t))',
  'body     = spine ± n̂ R(s) cos(iφ),  R = 2.5 + 15 sin πs (1 − 0.55s) + 8e^(−(s−.03)²/.004)',
  'spikes   = (10 + 15 sin πs) × (1 − frac 16s)',
]

// t coefficients {1, 2}, dt = PI/40  ->  full period 2*PI = 80 draw-steps.
loop(80, 1)
