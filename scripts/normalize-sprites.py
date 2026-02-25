#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from statistics import median
from typing import Iterable

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "assets"
OUTPUT_DIR = ASSETS_DIR / "normalized"


@dataclass(frozen=True)
class SpriteSet:
    name: str
    files: list[str]
    baseline: str
    target_anchor_x_ratio: float = 0.5


SPRITE_SETS: list[SpriteSet] = [
    SpriteSet(
      name="megaman",
      files=[
          "MMBN3_MM_LEFT_FIELD_READY_1.png",
          "MMBN3_MM_LEFT_FIELD_READY_2.png",
          "MMBN3_MM_LEFT_FIELD_READY_3.png",
          "MMBN3_MM_LEFT_FIELD_READY_4.png",
          "MMBN3_MM_LEFT_FIELD_MOVE_1.png",
          "MMBN3_MM_LEFT_FIELD_MOVE_2.png",
          "MMBN3_MM_LEFT_FIELD_MOVE_3.png",
          "MMBN3_MM_LEFT_FIELD_BUSTER_1.png",
          "MMBN3_MM_LEFT_FIELD_BUSTER_2.png",
          "MMBN3_MM_LEFT_FIELD_BUSTER_3.png",
          "MMBN3_MM_LEFT_FIELD_BUSTER_4.png",
      ],
      baseline="MMBN3_MM_LEFT_FIELD_READY_1.png",
    ),
    SpriteSet(
      name="forte",
      files=[
          "MMBN3_FORTE_RIGHT_FIELD_READY_1.png",
          "MMBN3_FORTE_RIGHT_FIELD_READY_2.png",
          "MMBN3_FORTE_RIGHT_FIELD_READY_3.png",
          "MMBN3_FORTE_RIGHT_FIELD_READY_4.png",
          "MMBN3_FORTE_RIGHT_FIELD_MOVE_1.png",
          "MMBN3_FORTE_RIGHT_FIELD_MOVE_2.png",
          "MMBN3_FORTE_RIGHT_FIELD_MOVE_3.png",
          "MMBN3_FORTE_RIGHT_FIELD_BUSTER_1.png",
          "MMBN3_FORTE_RIGHT_FIELD_BUSTER_2.png",
          "MMBN3_FORTE_RIGHT_FIELD_BUSTER_3.png",
          "MMBN3_FORTE_RIGHT_FIELD_BUSTER_4.png",
      ],
      baseline="MMBN3_FORTE_RIGHT_FIELD_READY_1.png",
    ),
]


def get_alpha_points(image: Image.Image) -> list[tuple[int, int]]:
    alpha = image.convert("RGBA").split()[-1]
    width, height = image.size
    points: list[tuple[int, int]] = []
    for y in range(height):
        for x in range(width):
            if alpha.getpixel((x, y)) > 0:
                points.append((x, y))
    return points


def detect_foot_anchor(image: Image.Image) -> tuple[int, int]:
    points = get_alpha_points(image)
    if not points:
        return (image.size[0] // 2, image.size[1] - 1)

    max_y = max(y for _, y in points)
    foot_row = [x for x, y in points if y == max_y]
    if foot_row:
        return (int(round(median(foot_row))), max_y)

    min_x = min(x for x, _ in points)
    max_x = max(x for x, _ in points)
    return ((min_x + max_x) // 2, max_y)


def load_images(files: Iterable[str]) -> dict[str, Image.Image]:
    images: dict[str, Image.Image] = {}
    for filename in files:
        path = ASSETS_DIR / filename
        images[filename] = Image.open(path).convert("RGBA")
    return images


def normalize_set(sprite_set: SpriteSet) -> None:
    images = load_images(sprite_set.files)
    anchors = {name: detect_foot_anchor(image) for name, image in images.items()}
    padding = 2
    baseline_anchor = anchors[sprite_set.baseline]

    max_anchor_x = max(ax for ax, _ in anchors.values())
    max_right_extent = max(image.size[0] - anchors[name][0] for name, image in images.items())

    # Find a canvas width where the chosen centered anchor keeps all frames inside bounds.
    canvas_width = max(image.size[0] for image in images.values()) + padding * 2
    target_anchor_x = round((canvas_width - 1) * sprite_set.target_anchor_x_ratio)
    while True:
        min_left = min(target_anchor_x - anchors[name][0] for name in images)
        max_right = max(target_anchor_x - anchors[name][0] + images[name].size[0] for name in images)
        if min_left >= padding and max_right <= canvas_width - padding:
            break
        canvas_width += 1
        target_anchor_x = round((canvas_width - 1) * sprite_set.target_anchor_x_ratio)

    target_anchor = (target_anchor_x, baseline_anchor[1])

    placements: dict[str, tuple[int, int]] = {}
    min_top = 10**9
    max_bottom = -10**9
    for name, image in images.items():
        anchor_x, anchor_y = anchors[name]
        offset_x = target_anchor[0] - anchor_x
        offset_y = target_anchor[1] - anchor_y
        placements[name] = (offset_x, offset_y)
        min_top = min(min_top, offset_y)
        max_bottom = max(max_bottom, offset_y + image.size[1])

    shift_y = -min_top + padding
    canvas_height = max_bottom - min_top + padding * 2

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, image in images.items():
        canvas = Image.new("RGBA", (canvas_width, canvas_height), (0, 0, 0, 0))
        offset_x, offset_y = placements[name]
        paste_x = offset_x
        paste_y = offset_y + shift_y
        canvas.paste(image, (paste_x, paste_y), image)
        canvas.save(OUTPUT_DIR / name)

    print(
        f"[{sprite_set.name}] normalized {len(images)} frames to "
        f"{canvas_width}x{canvas_height}, anchor={target_anchor} "
        f"(max_anchor_x={max_anchor_x}, right_extent={max_right_extent})"
    )


def main() -> None:
    for sprite_set in SPRITE_SETS:
        normalize_set(sprite_set)


if __name__ == "__main__":
    main()
