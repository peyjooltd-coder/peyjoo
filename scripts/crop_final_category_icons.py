"""Crop 3D category icons from the brand sheet, excluding Persian labels."""
from pathlib import Path
from collections import deque
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(r'c:\Users\Administrator\Documents\divarvanciver\divarvanciver\divarvanciver\public\categories')
SHEET = ROOT / '_final_sheet.png'
DEBUG = ROOT / '_debug'
DEBUG.mkdir(exist_ok=True)

# Measured on the 972×1024 sheet: white cards sit above the label bands.
COLS = [(40, 258), (275, 478), (498, 700), (722, 938)]
ROWS = [(32, 184), (236, 404), (456, 612), (668, 824), (878, 992)]

GRID = [
    ['services', 'buy-sell', 'business', 'real-estate'],
    ['exchange', 'couriers', 'vehicles', 'beauty'],
    ['restaurant', 'health', 'education', 'transport'],
    ['jobs', 'home-market', 'pets', 'sports'],
    [None, None, None, 'migration'],
]

ALIASES = {
    'food': 'restaurant',
    'kitchen': 'home-market',
    'home-appliances': 'home-market',
    'furniture': 'buy-sell',
    'tools-rental': 'buy-sell',
    'occupations': 'jobs',
    'travel': 'couriers',
    'kolbaran': 'couriers',
    'repairs': 'services',
}

im = Image.open(SHEET).convert('RGBA')
W, H = im.size
print('sheet', W, H)
arr_full = np.asarray(im)
bg = arr_full[2, 2, :3].astype(np.int16)


def remove_card_bg(rgba: Image.Image) -> Image.Image:
    """Drop the page, the white card, and leftover gray rims. Keep the 3D subject."""
    arr = np.asarray(rgba).copy()
    rgb = arr[:, :, :3].astype(np.float32)
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    sat = (mx - mn) / (mx + 1e-6)
    is_bg = (mx > 200) & (sat < 0.12)
    h0, w0 = is_bg.shape
    visited = np.zeros_like(is_bg, dtype=bool)
    q = deque()
    for y, x in (
        (0, 0), (0, w0 - 1), (h0 - 1, 0), (h0 - 1, w0 - 1),
        (0, w0 // 2), (h0 - 1, w0 // 2), (h0 // 2, 0), (h0 // 2, w0 - 1),
    ):
        if is_bg[y, x]:
            q.append((y, x))
            visited[y, x] = True
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h0 and 0 <= nx < w0 and not visited[ny, nx] and is_bg[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))
    alpha = np.where(visited, 0, arr[:, :, 3])

    # Delete leftover gray bars that are their own blobs (card rim / shadow strip).
    opaque = alpha > 24
    seen = np.zeros_like(opaque, dtype=bool)
    keep = np.zeros_like(opaque, dtype=bool)
    h0, w0 = opaque.shape
    for y in range(h0):
        for x in range(w0):
            if not opaque[y, x] or seen[y, x]:
                continue
            pixels = []
            qq = deque([(y, x)])
            seen[y, x] = True
            while qq:
                cy, cx = qq.popleft()
                pixels.append((cy, cx))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < h0 and 0 <= nx < w0 and opaque[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        qq.append((ny, nx))
            ys = [p[0] for p in pixels]
            xs = [p[1] for p in pixels]
            sats = sat[ys, xs]
            brs = mx[ys, xs]
            colorful = float((sats > 0.18).mean()) > 0.12 or float(brs.mean()) < 150
            if len(pixels) >= 120 and colorful:
                for py, px in pixels:
                    keep[py, px] = True
    arr[:, :, 3] = np.where(keep, alpha, 0)
    out = Image.fromarray(arr, 'RGBA')
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    return out


def export_icon(crop: Image.Image, path: Path) -> None:
    subject = remove_card_bg(crop)
    # Even padding so the 3D art fills the tile without clipping.
    pad = max(8, int(round(max(subject.size) * 0.04)))
    side = max(subject.size) + pad * 2
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(
        subject,
        ((side - subject.size[0]) // 2, (side - subject.size[1]) // 2),
        subject,
    )
    canvas = canvas.resize((256, 256), Image.Resampling.LANCZOS)
    canvas.save(path, optimize=True)


overlay = im.convert('RGB').copy()
draw = ImageDraw.Draw(overlay)

for r, row in enumerate(GRID):
    y0, y1 = ROWS[r]
    for c, cat_id in enumerate(row):
        if not cat_id:
            continue
        x0, x1 = COLS[c]
        draw.rectangle([x0, y0, x1, y1], outline=(220, 40, 40), width=2)
        crop = im.crop((x0, y0, x1, y1))
        crop.convert('RGB').save(DEBUG / f'probe_{r}{c}_{cat_id}.png')
        export_icon(crop, ROOT / f'{cat_id}.png')
        print('saved', cat_id, (x0, y0, x1, y1))

overlay.save(DEBUG / '_grid_overlay.png')

for alias, src in ALIASES.items():
    src_path = ROOT / f'{src}.png'
    if not src_path.exists():
        print('skip alias', alias)
        continue
    Image.open(src_path).save(ROOT / f'{alias}.png', optimize=True)
    print('alias', alias, '->', src)

print('done')
