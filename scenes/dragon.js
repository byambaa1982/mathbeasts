// ==== ORIGINAL SKETCH — "dragon" ====
// A Chinese dragon coiled in a spiral, chasing a flaming pearl: ribbed tube
// body on a spiral spine with a traveling wave, dorsal spikes, a flowing
// mane along the neck, antler horns, whiskers, and the pearl with orbiting
// sparks in front of the snout.
G = 2.39996  // golden angle, decorrelates particles

TH = s => -1.15 + 7.3 * s                      // spiral angle along the spine
RD = s => 146 - 84 * s + 10 * sin(5 * s - t)   // spiral radius + traveling wave
P = s => [200 + RD(s) * cos(TH(s)),
          192 + 0.84 * RD(s) * sin(TH(s))]     // spine: s = 0 head .. 1 tail
// body radius: tapered tube + gaussian skull bulge, snout taper below s=0
R = s => s < 0 ? 8 * (1 + s / 0.03)
              : 2.2 + 13 * pow(sin(PI * (0.06 + 0.94 * s)), 0.7) * (1 - 0.55 * s)
                    + 11 * exp(-(s - 0.02) * (s - 0.02) / 0.0045)
OUT = p => { d = mag(p[0] - 200, p[1] - 192) + 1e-6
             return [(p[0] - 200) / d, (p[1] - 192) / d] }   // radial out

t = 0
draw = $ => {
  t || createCanvas(w = 400, w)
  background(9).stroke(w, 96)
  t += PI / 40
  hp = P(0.015)                                 // head anchor
  fa = P(-0.03); fb = P(0.05)
  fl = mag(fa[0] - fb[0], fa[1] - fb[1]) + 1e-6
  F = [(fa[0] - fb[0]) / fl, (fa[1] - fb[1]) / fl]   // snout heading
  O = OUT(hp)                                        // head 'up'
  for (i = 2e4; i--;) {
    r0 = i % 10
    if (r0 < 7) {
      // body tube: rings of points around the spine (ribs / scales)
      s = -0.028 + 1.028 * ((i / 14000) % 1)
      p = P(s); p2 = P(s + 0.008)
      dx = p2[0] - p[0]; dy = p2[1] - p[1]; L = mag(dx, dy) + 1e-6
      ring = cos(i * G) * R(s) * (0.86 + 0.14 * ((i * 2.2360679) % 1))
      jit = 1.8 * sin(i * 47)
      point(p[0] - dy / L * ring + dx / L * jit,
            p[1] + dx / L * ring + dy / L * jit)
    } else if (r0 == 7) {
      // dorsal spikes: sawtooth fins pointing out of the coil
      s = 0.16 + 0.81 * ((i / 2000) % 1)
      f = (s * 22) % 1
      p = P(s); o = OUT(p)
      d = R(s) * 0.85 + (7 + 11 * sin(PI * s)) * (1 - f) * ((i * G) % 1)
      point(p[0] + o[0] * d + sin(i * 43), p[1] + o[1] * d + cos(i * 37))
    } else if (r0 == 8) {
      // mane: filament strands flowing off the neck, swaying
      k = (i >> 4) % 34
      sm = 0.02 + 0.004 * k
      u = (i / 900) % 1
      p = P(sm); o = OUT(p)
      ln = 20 + 26 * abs(sin(k * 1.7))
      sw = 13 * u * sin(4 * sm - t + 1.6 * u)
      d = R(sm) * 0.8 + ln * u
      point(p[0] + o[0] * d - o[1] * sw + sin(i * 53),
            p[1] + o[1] * d + o[0] * sw + cos(i * 41))
    } else {
      // head gear + pearl + tail tuft, sub-roles from higher bits
      u = (i / 999) % 1
      side = (i >> 3) % 2 ? 1 : -1
      role = (i >> 4) % 5
      th = cos(i * G) * 1.8 * (1 - 0.5 * u)
      if (role == 0) {
        // antler horns sweeping back from the skull, forked
        b = P(0.05)
        br = (i >> 6) % 2 ? 24 : 8
        point(b[0] - F[0] * (3 + 36 * u) + O[0] * (5 + 30 * u - br * u * u) + side * 2 + th,
              b[1] - F[1] * (3 + 36 * u) + O[1] * (5 + 30 * u - br * u * u) + th)
      } else if (role == 1) {
        // whiskers: long curls trailing from the snout
        tip = P(-0.03)
        point(tip[0] + F[0] * (4 + 18 * u) - O[0] * (2 + 40 * u * u) + side * (2 + 5 * u) + 6 * u * sin(6 * u - t) + th,
              tip[1] + F[1] * (4 + 18 * u) - O[1] * (2 + 40 * u * u) + 6 * u * cos(6 * u - t) + th)
      } else if (role == 2) {
        // eye: bright dense disc
        r = 2.4 * sqrt((i * G) % 1)
        point(hp[0] + O[0] * 5 + F[0] * 3 + r * cos(i * G * 7),
              hp[1] + O[1] * 5 + F[1] * 3 + r * sin(i * G * 7))
      } else if (role == 3) {
        // the flaming pearl the dragon chases, with orbiting sparks
        px = hp[0] + F[0] * 56; py = hp[1] + F[1] * 56 + 3 * sin(2 * t)
        if ((i >> 6) % 4) {
          r = 6.5 * sqrt((i * G) % 1)
          point(px + r * cos(i * G * 7), py + r * sin(i * G * 7))
        } else {
          r = 10 + 4 * ((i * 2.2360679) % 1)
          point(px + r * cos(i * G + t), py + 0.7 * r * sin(i * G + t))
        }
      } else {
        // tail tuft: flame fan
        tp = P(0.985); o = OUT(tp)
        point(tp[0] + o[0] * (2 + 24 * u) - o[1] * side * u * (4 + 10 * u) + 3 * u * sin(5 * u - t) + th,
              tp[1] + o[1] * (2 + 24 * u) + o[0] * side * u * (4 + 10 * u) + 3 * u * cos(5 * u - t) + th)
      }
    }
  }
}
// ==== END SKETCH ====

WATERMARK = 'Byamba Enkhbat'
FORMULA = [
  'spine(s) = C + (146 − 84s + 10 sin(5s − t)) · (cos θ,  0.84 sin θ),  θ = 7.3s − 1.15',
  'body     = spine ± n̂ R(s) cos(iφ),  R = 2.2 + 13 sin^0.7 πs (1 − 0.55s) + 11e^(−(s−.02)²/.0045)',
  'mane     = spine + r̂ (R + ℓu) rotated by 13u sin(4s − t + 1.6u)',
]

// t coefficients {1, 2}, dt = PI/40  ->  full period 2*PI = 80 draw-steps.
loop(80, 1)
