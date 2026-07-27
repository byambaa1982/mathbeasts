// ==== ORIGINAL SKETCH — "butterfly" ====
// A butterfly on the Temple Fay curve r = e^sin θ − 2 cos 4θ + sin⁵((2θ−π)/24),
// flapping by squashing the wings horizontally with cos 2t, plus a dotted
// body, antennae, and edge sparkle.
G = 2.39996  // golden angle

r = h => exp(sin(h)) - 2 * cos(4 * h) + pow(sin((2 * h - PI) / 24), 5)

t = 0
draw = $ => {
  t || createCanvas(w = 400, w)
  background(9).stroke(w, 96)
  t += PI / 40
  F = 0.62 + 0.38 * cos(2 * t)          // flap: 1 open .. 0.24 folded
  cx = 200
  cy = 205 + 6 * sin(t)                 // gentle hover bob
  for (i = 2e4; i--;) {
    if (i % 8 < 6) {
      // wing membrane: fill the curve, density pushed toward the edge
      h = 24 * PI * ((i * G) % 1)
      q = r(h) * (0.3 + 0.7 * pow((i / 15000) % 1, 0.35))
      x = 40 * q * sin(h)
      y = -34 * q * cos(h)
      point(cx + x * F + sin(i * 47),
            cy + y + 0.22 * (1 - F) * abs(x) + cos(i * 31))   // wings tilt up as they fold
    } else if (i % 8 == 6) {
      // edge sparkle: bright rim right on the curve
      h = 24 * PI * ((i / 2500) % 1)
      q = r(h)
      point(cx + 40 * q * sin(h) * F, cy - 34 * q * cos(h) + 0.22 * (1 - F) * abs(40 * q * sin(h)))
    } else {
      // body + antennae
      u = (i / 999) % 1
      side = (i >> 3) % 2 ? 1 : -1
      if ((i >> 4) % 3) {
        // body: slim vertical ellipse of dots
        point(cx + 4 * cos(i * G) * (1 - 0.5 * u) + sin(i * 43),
              cy - 60 + 105 * u)
      } else {
        // antennae: two arcs curling out of the head
        point(cx + side * (3 + 26 * u - 8 * u * u) + cos(i * G),
              cy - 62 - 30 * u + 18 * u * u + 1.5 * sin(t + 3 * u))
      }
    }
  }
}
// ==== END SKETCH ====

WATERMARK = 'Byamba Enkhbat'
FORMULA = [
  'r(θ) = e^sin θ − 2 cos 4θ + sin⁵((2θ − π)/24)',
  'wing = (40 r sin θ · F,  −34 r cos θ),  F = 0.62 + 0.38 cos 2t',
]

// t coefficients {1, 2}, dt = PI/40  ->  full period 2*PI = 80 draw-steps.
loop(80, 1)
