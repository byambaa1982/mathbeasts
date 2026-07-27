# The math behind the beasts

Every beast is the same machine: **one particle function evaluated 20,000
times per frame**. Each particle `i` is assigned a role by residue arithmetic
(`i % 8`, `i % 5`, …), pushed through a few trig fields, and drawn as a 1px
white dot at low alpha on a near-black background — overlapping trajectories
build up the glowing filament look. Time $t$ advances by a fixed step
$\Delta t$ per frame, and only $t$ animates; everything else is deterministic
in $i$, which is what lets the renderer step frames exactly.

Notation: $\mathrm{mag}(a,b) = \sqrt{a^2+b^2}$ (p5's `mag`, i.e. `hypot`);
$\varphi = 2.39996$ is the golden angle, used everywhere as a cheap
decorrelator — $\operatorname{frac}(i\varphi)$ behaves like a uniform random
number that never changes frame-to-frame.

---

## Dragon — `scenes/dragon.js`

A Chinese dragon coiled in a spiral, chasing a flaming pearl. The **spine**
is a spiral in polar form — angle sweeps $\theta = 7.3s - 1.15$ while the
radius shrinks and carries a traveling wave (the swimming):

$$
\text{spine}(s) = C + \big(146 - 84s + 10\sin(5s - t)\big)\,(\cos\theta,\; 0.84\sin\theta),
\qquad s \in [-0.028, 1]
$$

(head at $s = 0$, negative $s$ = snout; the $0.84$ squashes the coil into a
slight ellipse). The body radius is a tapered tube with a Gaussian skull:

$$
R(s) = 2.2 + 13\sin^{0.7}\!\pi s\,(1 - 0.55s) + 11\,e^{-(s-0.02)^2/0.0045}
$$

Roles by residue (`i % 10`): 70% form rib-rings around the spine at
$\pm\hat n\,R(s)\cos(i\varphi)$ (with the ring radius roughened by
$\operatorname{frac}(i\sqrt5)$ so the tube reads organic, not lathed);
10% are sawtooth dorsal spikes pointing radially out of the coil; 10% are
the **mane** — 34 filament strands along the neck ($s \le 0.15$), each
rotated by the swaying term $13u\sin(4s - t + 1.6u)$; and 10% split by
higher bits into forked antler horns, curling whiskers, a bright eye disc,
the tail tuft, and the **pearl** — a dense disc floating $56$ px off the
snout with a ring of sparks orbiting it on $\cos(i\varphi + t)$ and bobbing
on $\sin 2t$. Head frame (snout heading $\hat F$, head-up $\hat O$) is
computed once per frame from spine tangent and the radial direction.
$\Delta t = \pi/40$, $t$ coefficients $\{1, 2\}$ → period $2\pi$ = 80 frames.

## Jellyfish — `scenes/jellyfish.js`

Three parts: bell, frill, tentacles. The breath is one scalar
$B = 1 + 0.12\sin t$ that widens the bell while $(2 - B)$ flattens it —
squash-and-stretch from a single term. The body bobs with $\sin(t - 1.2)$,
*lagging* the breath like real jet propulsion.

**Bell** (60% of particles): nested membrane arcs, uniform in the horizontal
parameter $u \in [-1, 1]$, all anchored at the rim corners:

$$
\big(95\,u\,B,\;\; -76\,\mathrm{sh}\,(1 - u^2)^{0.62}\,(2 - B)\big),
\qquad \mathrm{sh} \in [0.68, 1]
$$

The shell fraction $\mathrm{sh}$ is sampled from $\operatorname{frac}(i\sqrt5)$
while $u$ comes from $\operatorname{frac}(i\varphi)$ — two different
irrationals, so the pair never forms moiré bands.

**Frill** (20%): a scalloped curtain hanging from the rim line,
depth $(9\,|\sin(6u + t)| + 3)\cdot\operatorname{frac}(i\varphi)$.

**Tentacles** (20%): nine strands, $k = i \bmod 9$, arc-length $s \in [0,1]$,
swaying with a wave that travels downward:

$$
x = (k-4)\,19\,B\,(1 - 0.3s) + (6 + 34s)\sin(5s - t + 0.9k)\,(0.2 + 0.8s)
$$

Lengths vary per strand by the static factor $0.7 + 0.3\sin 2.7k$.
$t$ coefficients $\{1\}$ → period $2\pi$ = 80 frames.

## Butterfly — `scenes/butterfly.js`

The silhouette is the classic **Temple Fay butterfly curve**:

$$
r(\theta) = e^{\sin\theta} - 2\cos 4\theta + \sin^5\!\Big(\frac{2\theta - \pi}{24}\Big)
$$

sampled over $\theta \in [0, 24\pi]$ (the $\sin^5$ term needs 12 turns to
close). Wing points map as $(40\,r\sin\theta \cdot F,\; -34\,r\cos\theta)$
where $F = 0.62 + 0.38\cos 2t$ is the **flap** — a pure horizontal squash
from 1 (wings spread) to 0.24 (folded). A small term
$0.22\,(1-F)\,|x|$ lifts the wingtips as they fold, faking the third
dimension. Membrane density is pushed toward the curve's edge with
$q \mapsto q\,(0.3 + 0.7\,f^{0.35})$; a separate particle class draws the rim
itself brighter. Body = a slim ellipse of dots; antennae = two quadratic
arcs with a slight $\sin(t + 3u)$ quiver.
$t$ coefficients $\{1, 2\}$ → period $2\pi$ = 80 frames.

---

## Why the GIF loops: the period math

Everything animates through terms of the form $\sin(\ldots + a\,t)$ or
$\cos(\ldots + a\,t)$, each with period $2\pi/a$ in $t$. The whole sketch
repeats after the smallest $T$ that is a whole number of periods for
*every* coefficient $a$:

$$
T = \frac{2\pi}{\gcd(a_1, a_2, \ldots)}
$$

Divide by the per-draw step $\Delta t$ to get the period in draw-steps,
which `loop(FRAMES, STEP)` must cover exactly
($\text{FRAMES} \times \text{STEP} = T/\Delta t$):

| Beast | $t$ coefficients | $T$ | $\Delta t$ | steps | `loop()` |
|---|---|---|---|---|---|
| dragon | $1,\ 2$ | $2\pi$ | $\pi/40$ | 80 | `loop(80, 1)` |
| jellyfish | $1$ | $2\pi$ | $\pi/40$ | 80 | `loop(80, 1)` |
| butterfly | $1,\ 2$ | $2\pi$ | $\pi/40$ | 80 | `loop(80, 1)` |

On-screen speed is $\Delta t \cdot \text{STEP} \cdot \text{fps}$. STEP trades
file size against motion speed: halve the frames with STEP=2 and the GIF is
half the size but moves twice as fast. Fractional coefficients (say a
$t/4$ term) stretch the period — keep every coefficient a power of ½ (or an
integer) and the loop stays short.

## Design recipe

1. **Skeleton first.** Pick one parametric curve (spine, rim, wing outline)
   and make every other feature an offset from it. Constructive beasts stay
   legible; pure field soup rarely does.
2. **One clock, few gears.** Animate through 2–3 $t$-terms max, with
   integer/half coefficients. One term should be the "motion" (a traveling
   wave like $\sin(ks - t)$), one the "breath" (a global scale on $\sin t$).
3. **Roles by residue.** `i % 8 < 6` body, `== 6` fins, `== 7` details —
   and inside a class, derive sub-roles from *higher* bits (`i >> 3`,
   `i >> 4`) so classes don't correlate.
4. **Golden-angle everything.** $\operatorname{frac}(i\varphi)$ for one
   axis, a *different* irrational ($\sqrt5$, $\sqrt2$) for the other; the
   same irrational on both axes makes moiré bands.
5. **Jitter kills banding.** 1–2 px of $\sin(47i)$-style hash on every
   point turns CAD lines into organic film grain.
