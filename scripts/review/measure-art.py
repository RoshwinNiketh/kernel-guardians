"""Measure changed sprites and keep existing anchors for unchanged artwork."""

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import label

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
METRICS_PATH = ROOT / "src/cinematic/stage/art-metrics.json"


def sprite_paths():
    for path in sorted((PUBLIC / "assets/characters").glob("*/*.png")):
        yield f"{path.parent.name}/{path.stem}", path


def measure(path, sha256):
    with Image.open(path) as source:
        alpha = np.array(source.convert("RGBA").getchannel("A"))

    components, count = label(alpha > 160)
    if count == 0:
        raise ValueError(f"No visible sprite in {path}")
    sizes = np.bincount(components.ravel())
    sizes[0] = 0
    primary = components == sizes.argmax()
    ys, xs = np.where(primary)
    top, bottom = int(ys.min()), int(ys.max() + 1)
    foot_pixels = xs[ys >= int(top + (bottom - top) * 0.83)]

    height, width = alpha.shape
    return {
        "file": "/" + path.relative_to(PUBLIC).as_posix(),
        "width": width,
        "height": height,
        "anchorX": round(float(foot_pixels.mean() if foot_pixels.size else xs.mean()), 2),
        "footY": bottom,
        "top": top,
        "bodyHeight": bottom - top,
        "sha256": sha256,
        "transparentFraction": round(float((alpha == 0).mean()), 4),
    }


def main():
    previous = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
    result = {}
    changed = 0

    for key, path in sprite_paths():
        prior = previous.get(key, {})
        sha256 = hashlib.sha256(path.read_bytes()).hexdigest()
        if prior.get("sha256") == sha256:
            result[key] = prior
            continue

        metric = measure(path, sha256)
        for field in ("sourceSha256", "rendering"):
            if field in prior:
                metric[field] = prior[field]
        result[key] = metric
        changed += 1

    if result != previous:
        METRICS_PATH.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(f"Measured {changed} changed poses. Checked {len(result)} sprites.")


if __name__ == "__main__":
    main()
