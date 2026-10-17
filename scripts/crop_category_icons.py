"""Crop icons and punch out sheet card background → transparent PNG + single CSS card."""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(r'c:\Users\Administrator\Documents\divarvanciver\divarvanciver\divarvanciver\public\categories')
SHEET = ROOT / '_sheet.png'

GRID = [
    ['real-estate', 'jobs', 'vehicles', 'repairs', 'beauty'],
    ['education', 'transport', 'travel', 'buy-sell', 'pets'],
    ['sports', 'restaurant', 'health', 'dating', 'exchange'],
    ['migration', 'services', 'more', None, None],
]
MORE_BOX = (700, 652, 920, 768)

im = Image.open(SHEET).convert('RGBA')
w, h = im.size
cols = 5
pad_x, pad_y = 18, 12
cell_w = (w - 2 * pad_x) / cols
cell_h = (h - 2 * pad_y) / 4
ICON_TOP, ICON_BOT, ICON_SIDE = 0.04, 0.68, 0.10

aliases = {
    'food': 'restaurant',
    'kitchen': 'buy-sell',
    'home-appliances': 'buy-sell',
    'tools-rental': 'buy-sell',
    'furniture': 'buy-sell',
    'occupations': 'jobs',
    'favorites': 'health',  # heart glyph from sheet
    'saved': 'health',
}


def remove_card_bg(rgba: Image.Image) -> Image.Image:
    """Make near-white / light-gray card pixels transparent (keep subject + soft shadow)."""
    arr = np.asarray(rgba).copy()
    rgb = arr[:, :, :3].astype(np.float32)
    # Lightness
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    # Near-white / light gray (low saturation, high value)
    sat = (mx - mn) / (mx + 1e-6)
    is_bg = (mx > 220) & (sat < 0.12)
    # Also flood from corners: anything connected that is bright
    h0, w0 = is_bg.shape
    from collections import deque
    visited = np.zeros_like(is_bg, dtype=bool)
    q = deque()
    for y, x in [(0, 0), (0, w0 - 1), (h0 - 1, 0), (h0 - 1, w0 - 1),
                 (0, w0 // 2), (h0 - 1, w0 // 2), (h0 // 2, 0), (h0 // 2, w0 - 1)]:
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
    # Soften: also clear bright neighbors of bg
    arr[:, :, 3] = np.where(visited, 0, arr[:, :, 3])
    out = Image.fromarray(arr, 'RGBA')
    # Trim transparent margins
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    return out


def export_icon(crop: Image.Image, path: Path, punch: bool = True):
    if punch:
        subject = remove_card_bg(crop)
    else:
        subject = crop
    # Pad into square with transparent bg
    side = max(subject.size) + 16
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(
        subject,
        ((side - subject.size[0]) // 2, (side - subject.size[1]) // 2),
        subject,
    )
    canvas = canvas.resize((256, 256), Image.Resampling.LANCZOS)
    canvas.save(path, optimize=True)
    return path.stat().st_size


for r, row in enumerate(GRID):
    for c, cat_id in enumerate(row):
        if not cat_id:
            continue
        if cat_id == 'more':
            crop = im.crop(MORE_BOX)
            # More is white-on-white — keep as-is without aggressive punch
            size = export_icon(crop, ROOT / f'{cat_id}.png', punch=False)
        else:
            x0 = pad_x + c * cell_w
            y0 = pad_y + r * cell_h
            ix0 = int(x0 + cell_w * ICON_SIDE)
            iy0 = int(y0 + cell_h * ICON_TOP)
            ix1 = int(x0 + cell_w * (1 - ICON_SIDE))
            iy1 = int(y0 + cell_h * ICON_BOT)
            crop = im.crop((ix0, iy0, ix1, iy1))
            size = export_icon(crop, ROOT / f'{cat_id}.png', punch=True)
        print('saved', cat_id, size)

for alias, src in aliases.items():
    Image.open(ROOT / f'{src}.png').save(ROOT / f'{alias}.png', optimize=True)
    print('alias', alias, '->', src)

print('done')
