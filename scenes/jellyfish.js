// ==== ORIGINAL SKETCH — "jellyfish" ====
// A moon jelly: breathing bell (dome of golden-angle rings), scalloped rim
// frill, and nine trailing tentacles waving out of phase.
G = 2.39996  // golden angle, decorrelates particles

t = 0
draw = $ => {
  t || createCanvas(w = 400, w)
  background(9).stroke(w, 96)
  t += PI / 40
  B = 1 + 0.12 * sin(t)                  // breath: wide-squash factor
  cx = 200
  cy = 138 + 8 * sin(t - 1.2)            // bob lags the breath (jet propulsion)
  for (i = 2e4; i--;) {
    if (i % 5 < 3) {
      // bell dome: nested membrane arcs, all anchored at the rim corners
      u = -1 + 2 * ((i * G) % 1)                   // horizontal param
      sh = 0.68 + 0.32 * ((i * 2.2360679) % 1) + 0.03 * sin(i * 7.3)
      point(cx + 95 * u * B + 1.5 * sin(i * 47),
            cy - 76 * sh * pow(abs(1 - u * u), 0.62) * (2 - B) + 1.5 * cos(i * 31))
    } else if (i % 5 == 3) {
      // rim frill: scalloped curtain hanging from the bell's lower edge
      u = -1 + 2 * ((i / 4000) % 1)
      f = (9 * abs(sin(6 * u + t)) + 3) * ((i * G) % 1)
      point(cx + 95 * u * B + sin(i * 53),
            cy + 1 + 5 * u * u + f)
    } else {
      // tentacles: nine strands of varied length, waves travel downward
      k = i % 9
      s = (i / 2200) % 1                            // 0 root .. 1 tip
      L = 0.7 + 0.3 * sin(k * 2.7)
      point(cx + (k - 4) * 19 * B * (1 - 0.3 * s)
              + (6 + 34 * s) * sin(5 * s - t + 0.9 * k) * (0.2 + 0.8 * s)
              + 1.5 * sin(i * 59),
            cy + 6 + 215 * s * L + 7 * s * sin(t + k))
    }
  }
}
// ==== END SKETCH ====

WATERMARK = 'Byamba Enkhbat'
FORMULA = [
  'bell      = (95u·B,  −76·sh·(1 − u²)^.62 · (2 − B)),  B = 1 + 0.12 sin t',
  'frill     = (9 |sin(6u + t)| + 3) · frac(iφ)',
  'tentacle  = (6 + 34s) · sin(5s − t + 0.9k)',
]

// t coefficients {1}, dt = PI/40  ->  full period 2*PI = 80 draw-steps.
loop(80, 1)
