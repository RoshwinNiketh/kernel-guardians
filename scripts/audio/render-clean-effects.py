"""Render short tonal effects with no noise generators or sustained layers."""

import hashlib
import json
import math
import wave
from array import array
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RATE = 24000
SOUND_DIR = ROOT / "assets/audio/sound"
METADATA = ROOT / "src/playback/audio"

# Offset, note length, start pitch, end pitch, and relative strength.
EFFECTS = {
    "impact": (0.42, 0.23, [(0, 0.42, 156, 68, 1), (0.015, 0.16, 293, 135, 0.2)]),
    "click": (0.09, 0.12, [(0, 0.09, 580, 390, 1)]),
    "crt": (0.42, 0.20, [(0, 0.10, 360, 170, 1), (0.065, 0.35, 146, 112, 0.45)]),
    "gate": (0.48, 0.23, [(0, 0.47, 140, 82, 1), (0.025, 0.20, 245, 144, 0.25)]),
    "contain": (0.26, 0.19, [(0, 0.12, 380, 250, 1), (0.085, 0.17, 240, 150, 0.75)]),
    "scan": (0.23, 0.14, [(0, 0.10, 390, 440, 0.75), (0.075, 0.15, 523, 523, 1)]),
    "restore": (0.60, 0.18, [(0, 0.36, 392, 392, 0.75), (0.13, 0.47, 523, 523, 1)]),
    "tick": (0.09, 0.08, [(0, 0.075, 480, 420, 1)]),  # Slider feedback only.
}


def render(duration, peak, notes):
    samples = [0.0] * round(duration * RATE)
    for offset, length, start_pitch, end_pitch, strength in notes:
        start = round(offset * RATE)
        for index in range(min(round(length * RATE), len(samples) - start)):
            time = index / RATE
            progress = time / length
            phase = math.tau * time * (start_pitch + (end_pitch - start_pitch) * progress / 2)
            attack = min(1, time / 0.009)
            decay = (1 - progress) ** 2
            tone = math.sin(phase) + 0.1 * math.sin(phase * 2)
            samples[start + index] += tone * strength * attack * decay
    scale = 32767 * peak / max(map(abs, samples))
    return array("h", (round(sample * scale) for sample in samples))


def main():
    metadata_path = METADATA / "sound-assets.json"
    manifest_path = METADATA / "playback-media.json"
    metadata = json.loads(metadata_path.read_text())
    manifest = json.loads(manifest_path.read_text())
    manifest["files"] = [
        entry for entry in manifest["files"]
        if not entry["path"].startswith("assets/audio/sound/")
        or Path(entry["path"]).stem.startswith("score-")
    ]
    metadata = {key: value for key, value in metadata.items() if key.startswith("score-")}
    for name, (duration, peak, notes) in EFFECTS.items():
        path = SOUND_DIR / f"{name}.wav"
        samples = render(duration, peak, notes)
        with wave.open(str(path), "wb") as output:
            output.setparams((1, 2, RATE, 0, "NONE", "not compressed"))
            output.writeframes(samples.tobytes())
        metadata[name] = {
            "file": path.name, "duration": len(samples) / RATE,
            "sampleRate": RATE, "channels": 1, "peak": peak,
            "origin": "Original short tonal synthesis; no noise or samples",
        }
        contents = path.read_bytes()
        manifest["files"].append({
            "path": path.relative_to(ROOT).as_posix(),
            "bytes": len(contents), "sha256": hashlib.sha256(contents).hexdigest(),
        })
    metadata_path.write_text(json.dumps(metadata, indent=2) + "\n")
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Rendered {len(EFFECTS)} tonal effects.")


if __name__ == "__main__":
    main()
