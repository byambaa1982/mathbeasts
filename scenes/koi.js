// ==== ORIGINAL SKETCH — "koi" ====
// Two koi circling a pond like a yin-yang: undulating teardrop bodies chasing
// each other on a circular path, fan tails, fluttering pectoral fins, and
// ripple rings expanding from the pond's center beneath them.
G = 2.39996  // golden angle, decorrelates particles

SW = 0.92                                     // body arc length along the path (radians)
// half-width of the body: rounded snout below s=0, teardrop taper behind
W = s => s < 0 ? 8 * (1 + s / 0.06)
               : 3 + 13 * pow(sin(PI * (0.1 + 0.9 * s)), 0.8) * (1 - 0.55 * s)

t = 0
draw = $ => {
  t || createCanvas(w = 400, w)
  background(9).stroke(w, 96)
  t += PI / 40
  for (i = 2e4; i--;) {
    q = (i >> 3) % 2                          // which fish (half a lap apart)
    A = t + PI * q                            // head angle on the path
    r0 = i % 10
    if (r0 < 7) {
      // body: rib-rings around a spine that trails the head along the circle
      s = -0.06 + 1.06 * ((i / 13000) % 1)    // s = 0 head .. 1 tail root
      a = A - SW * s
      rr = 95 + (2 + 6 * abs(s)) * sin(5 * s - 2 * t + PI * q)
      off = cos(i * G) * W(s) * (0.86 + 0.14 * ((i * 2.2360679) % 1))
      jt = 1.5 * sin(i * 47)
      point(200 + rr * cos(a) + cos(a) * off - sin(a) * jt,
            200 + rr * sin(a) + sin(a) * off + cos(a) * jt)
    } else if (r0 == 7) {
      // tail fan: spreads past the body's end, swaying with the same wave
      u = (i / 2000) % 1
      a = A - SW * (1 + 0.38 * u)
      rr = 95 + (8 + 7 * u) * sin(5 + 2.2 * u - 2 * t + PI * q)
      off = cos(i * G) * (2 + 16 * u * (0.55 + 0.45 * ((i * 2.2360679) % 1)))
      point(200 + rr * cos(a) + cos(a) * off + sin(i * 43),
            200 + rr * sin(a) + sin(a) * off + cos(i * 37))
    } else if (r0 == 8) {
      // pectoral fins: two blades at the shoulders, swept back, fluttering
      u = (i / 1000) % 1                      // outward fraction along the fin
      v = (i * G) % 1
      side = (i >> 4) % 2 ? 1 : -1
      a = A - SW * 0.3
      rr = 95 + 4 * sin(1.5 - 2 * t + PI * q)
      d = W(0.3) + 1 + 15 * u * (0.75 + 0.25 * ((i * 2.2360679) % 1))
      bk = 4 * u + (1 + (2 + 9 * u) * v) * (1 + 0.3 * sin(2 * t + PI * q)) + 0.8 * sin(i * 43)
      point(200 + rr * cos(a) + cos(a) * side * d + sin(a) * bk + sin(i * 53),
            200 + rr * sin(a) + sin(a) * side * d - cos(a) * bk + cos(i * 41))
    } else {
      // details: eyes + the ripple rings
      u = (i * G) % 1
      if ((i >> 4) % 4 == 0) {
        // eyes: two bright discs on the head
        side = (i >> 6) % 2 ? 1 : -1
        a = A - SW * 0.04
        rr = 95 + 2 * sin(0.2 - 2 * t + PI * q)
        r = 1.7 * sqrt(u)
        point(200 + rr * cos(a) + cos(a) * side * 4.5 + r * cos(i * G * 7),
              200 + rr * sin(a) + sin(a) * side * 4.5 + r * sin(i * G * 7))
      } else {
        // ripples: three rings expanding from the center, thinning as they grow
        k = i % 3
        ru = (k / 3 + t / TWO_PI + 0.03 * u) % 1
        if ((i * 1.41421356) % 1 > 0.25 + ru * 0.75) {
          rr = 26 + 142 * ru
          an = TWO_PI * ((i * 2.2360679) % 1)
          point(200 + rr * cos(an) + sin(i * 59),
                200 + rr * sin(an) + cos(i * 61))
        }
      }
    }
  }
}
// ==== END SKETCH ====

WATERMARK = 'Byamba Enkhbat'
FORMULA = [
  'spine(s) = C + (95 + (2+6|s|) sin(5s − 2t + πf)) · (cos a, sin a),  a = t + πf − 0.92s',
  'body     = spine ± n̂ W(s) cos(iφ),  W = 3 + 13 sin^0.8 π(0.1+0.9s)(1 − 0.55s)',
  'ripple   = r = 26 + 142 · frac(k/3 + t/2π)',
]

// t coefficients {1, 2} (path angle a carries t·1), dt = PI/40
//   ->  full period 2*PI = 80 draw-steps.
loop(80, 1)
