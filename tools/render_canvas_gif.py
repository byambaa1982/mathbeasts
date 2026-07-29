"""Render a canvas sketch (scenes/scene_N.html) to a perfectly-looping GIF.

Instead of screenshotting in real time (which drifts), this calls the
engine's `window.__seek()` hook: each call advances the sketch exactly STEP
draw() steps and paints one frame, so capture speed never affects timing and
the loop is mathematically exact.

Requires: pip install -r tools/requirements.txt
          python -m playwright install chromium

If the page calls the engine's `loop(frames, step)` (which sets
`window.__frames`), --frames may be omitted.

Usage:
    python tools/render_canvas_gif.py --html scenes/scene_5.html --fps 12
    python tools/render_canvas_gif.py --html sketch.html --frames 240 --fps 20 --size 400x400 --scale 2
"""

import argparse
import asyncio
import io
import sys
from pathlib import Path

from PIL import Image
from playwright.async_api import async_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


async def capture(html_path: Path, frames_n: int | None, width: int, height: int,
                  scale: float) -> list[Image.Image]:
    frames = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            viewport={"width": width, "height": height},
            device_scale_factor=scale,
        )
        await page.goto(f"file:///{html_path.resolve().as_posix()}")
        await page.wait_for_timeout(300)
        has_seek = await page.evaluate("() => typeof window.__seek === 'function'")
        if not has_seek:
            raise SystemExit("[err] page does not define window.__seek(frameIndex)")
        if frames_n is None:
            frames_n = await page.evaluate("() => window.__frames")
            if not frames_n:
                raise SystemExit("[err] --frames not given and page never called loop(frames, step)")

        print(f"[..] capturing {frames_n} frames ({width}x{height} @ {scale}x)")
        for i in range(frames_n):
            await page.evaluate("(n) => window.__seek(n)", i)
            shot = await page.screenshot(type="png")
            frames.append(Image.open(io.BytesIO(shot)).convert("RGB"))
            if (i + 1) % 30 == 0:
                print(f"     frame {i + 1}/{frames_n}")
        await browser.close()
    return frames


def save_gif(frames: list[Image.Image], out_path: Path, fps: int, max_colors: int,
             dither: bool = False) -> None:
    # One shared adaptive palette (from a mid-loop frame, when everything is
    # on screen) keeps colors stable across frames and the file small.
    # Dithering is off by default: on animated soft gradients it turns into
    # per-frame noise that defeats GIF compression (~3x larger files).
    ref = frames[len(frames) // 2].quantize(colors=max_colors, method=Image.MEDIANCUT)
    mode = Image.FLOYDSTEINBERG if dither else Image.Dither.NONE
    pal_frames = [f.quantize(palette=ref, dither=mode) for f in frames]
    pal_frames[0].save(
        out_path, save_all=True, append_images=pal_frames[1:],
        duration=int(round(1000 / fps)), loop=0, optimize=True,
    )
    print(f"[ok] wrote {out_path} ({out_path.stat().st_size / 1024:.0f} KB)")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--html", required=True, help="path to the sketch HTML")
    ap.add_argument("--frames", type=int,
                    help="total frames (one full loop); default: page's loop() value")
    ap.add_argument("--fps", type=int, default=12,
                    help="GIF playback fps (default 12; on-screen speed = dt * STEP * fps)")
    ap.add_argument("--size", default="400x400", help="viewport WxH")
    ap.add_argument("--scale", type=float, default=2.0, help="device scale factor")
    ap.add_argument("--max-colors", type=int, default=128)
    ap.add_argument("--resize", type=int,
                    help="downscale captured frames to NxN px before encoding "
                         "(e.g. 200 for a small preview GIF)")
    ap.add_argument("--out", help="output path (default: <html>.gif next to the sketch)")
    a = ap.parse_args()

    html_path = Path(a.html)
    width, height = (int(x) for x in a.size.lower().split("x"))
    frames = asyncio.run(capture(html_path, a.frames, width, height, a.scale))
    if a.resize:
        frames = [f.resize((a.resize, a.resize), Image.LANCZOS) for f in frames]
    out_path = Path(a.out) if a.out else html_path.with_suffix(".gif")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    save_gif(frames, out_path, a.fps, a.max_colors)


if __name__ == "__main__":
    main()
