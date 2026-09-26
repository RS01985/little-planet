"""Build Sentinel-2 10 m close-up pyramids for the approved places.

For each place, reads only the needed 1024-pixel tiles of one approved Copernicus
Sentinel-2 L2A true-colour COG (Element 84 Earth Search, AWS Open Data) with HTTP
range requests. Standard library + Pillow only; no GDAL.

Output per place: closeup/<key>/manifest.json and {level}/{x}_{y}.jpg tiles on a
lat/lon grid (level 0 is about 10 m per pixel), aligned with the NASA pyramid.
The raw crop is cached in tools/_source/ (ignored by git, never published).
Fails loudly if a crop contains missing (black) data.

Usage: python3 tools/build-sentinel.py [key ...]   (default: every place without output yet)
       python3 tools/build-sentinel.py --force key  (rebuild even if output exists)
"""
from pathlib import Path
import io, json, math, re, struct, sys
import requests
from PIL import Image

STAC = 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-c1-l2a/items/'
TILE, QUALITY, MAX_BLACK = 512, 82, .005
# key: (Chinese name, English name, (west, south, east, north), approved scene)
PLACES = {
    'melbourne': ('墨爾本市中心', 'Central Melbourne', (144.875, -37.875, 145.055, -37.785), 'S2C_T55HCU_20260908T001553_L2A'),
    'hongkong': ('香港維多利亞港', 'Victoria Harbour, Hong Kong', (114.10, 22.24, 114.26, 22.35), 'S2B_T49QHE_20260113T030907_L2A'),
    'sydney': ('悉尼海港', 'Sydney Harbour', (151.13, -33.91, 151.30, -33.80), 'S2B_T56HLH_20260920T000410_L2A'),
    'tokyo': ('東京灣', 'Tokyo Bay', (139.68, 35.60, 139.86, 35.71), 'S2B_T54SUE_20260116T013553_L2A'),
    'giza': ('吉薩金字塔', 'Pyramids of Giza', (31.05, 29.93, 31.22, 30.04), 'S2A_T36RUU_20260916T083643_L2A'),
    'grandcanyon': ('大峽谷', 'Grand Canyon', (-112.20, 36.00, -112.02, 36.12), 'S2C_T12SUE_20260710T181750_L2A'),
    'everest': ('珠穆朗瑪峰', 'Mount Everest', (86.84, 27.945, 87.01, 28.065), 'S2B_T45RVM_20250131T045754_L2A'),
    'amazon': ('亞馬遜河兩河交匯', 'Meeting of Waters, Amazon', (-59.98, -3.20, -59.81, -3.08), 'S2A_T20MRB_20260826T142159_L2A'),
}

root = Path(__file__).resolve().parent.parent
cache = root / 'tools' / '_source'


def utm(lat, lon, zone, south):
    """WGS84 lat/lon (degrees) to UTM easting/northing (metres)."""
    a, f, k0 = 6378137.0, 1 / 298.257223563, 0.9996
    e2 = f * (2 - f); ep2 = e2 / (1 - e2)
    phi, lam = math.radians(lat), math.radians(lon)
    lam0 = math.radians((zone - 1) * 6 - 180 + 3)
    n = a / math.sqrt(1 - e2 * math.sin(phi) ** 2)
    t, c = math.tan(phi) ** 2, ep2 * math.cos(phi) ** 2
    A = math.cos(phi) * (lam - lam0)
    m = a * ((1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * phi
             - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * math.sin(2 * phi)
             + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * math.sin(4 * phi)
             - (35 * e2 ** 3 / 3072) * math.sin(6 * phi))
    x = k0 * n * (A + (1 - t + c) * A ** 3 / 6 + (5 - 18 * t + t * t + 72 * c - 58 * ep2) * A ** 5 / 120) + 500000
    y = k0 * (m + n * math.tan(phi) * (A * A / 2 + (5 - t + 9 * c + 4 * c * c) * A ** 4 / 24
                                       + (61 - 58 * t + t * t + 600 * c - 330 * ep2) * A ** 6 / 720))
    return x, y + (10000000 if south else 0)


def scene_info(scene):
    """Visual asset URL, date and UTM zone of an approved scene, from its STAC record."""
    item = requests.get(STAC + scene, timeout=60).json()
    grid = item['properties']['grid:code']  # e.g. MGRS-55HCU
    m = re.match(r'MGRS-(\d+)([C-X])', grid)
    if not m:
        raise SystemExit(f'{scene}: unexpected grid code {grid}')
    return {'url': item['assets']['visual']['href'], 'date': item['properties']['datetime'][:10],
            'zone': int(m.group(1)), 'south': m.group(2) < 'N', 'cloud': item['properties']['eo:cloud_cover']}


def fetch(url, start, length):
    r = requests.get(url, headers={'Range': f'bytes={start}-{start + length - 1}'}, timeout=120)
    r.raise_for_status()
    if len(r.content) != length:
        raise SystemExit(f'Short read at {start}: {len(r.content)} of {length}')
    return r.content


def read_ifd(head):
    if head[:4] != b'II*\x00':
        raise SystemExit('Unexpected TIFF header')
    off = struct.unpack('<I', head[4:8])[0]
    sizes = {3: 2, 4: 4, 12: 8}
    tags = {}
    for i in range(struct.unpack('<H', head[off:off + 2])[0]):
        tag, typ, cnt = struct.unpack('<HHI', head[off + 2 + i * 12:off + 10 + i * 12])
        raw = head[off + 10 + i * 12:off + 14 + i * 12]
        if typ not in sizes:
            continue
        size = sizes[typ] * cnt
        if size > 4:
            vo = struct.unpack('<I', raw)[0]
            raw = head[vo:vo + size]
            if len(raw) != size:
                raise SystemExit(f'Tag {tag} lies outside the header read')
        fmt = {3: 'H', 4: 'I', 12: 'd'}[typ]
        tags[tag] = struct.unpack('<' + fmt * cnt, raw[:size])
    return tags


def decode_tile(data, tags):
    """Wrap one compressed tile in a minimal TIFF so Pillow's libtiff decodes it."""
    t = tags[322][0]
    entries = [(256, 3, 1, t), (257, 3, 1, t), (258, 3, 3, None), (259, 3, 1, tags[259][0]),
               (262, 3, 1, 2), (277, 3, 1, 3), (284, 3, 1, 1), (317, 3, 1, tags.get(317, (1,))[0]),
               (322, 3, 1, t), (323, 3, 1, t), (324, 4, 1, None), (325, 4, 1, len(data))]
    ifd_off = 8
    extra_off = ifd_off + 2 + len(entries) * 12 + 4
    bits_off, data_off = extra_off, extra_off + 6
    body = struct.pack('<H', len(entries))
    for tag, typ, cnt, val in entries:
        if tag == 258:
            val = bits_off
        if tag == 324:
            val = data_off
        body += struct.pack('<HHI', tag, typ, cnt) + (struct.pack('<HH', val, 0) if typ == 3 and tag != 258 else struct.pack('<I', val))
    blob = b'II*\x00' + struct.pack('<I', ifd_off) + body + b'\0\0\0\0' + struct.pack('<HHH', 8, 8, 8) + data
    img = Image.open(io.BytesIO(blob)); img.load()
    return img.convert('RGB')


def source_crop(key, bbox, scene, info):
    cache.mkdir(parents=True, exist_ok=True)
    png = cache / f'{scene}_{key}.png'
    meta = cache / f'{scene}_{key}.json'
    if png.exists() and meta.exists():
        return Image.open(png).convert('RGB'), json.loads(meta.read_text())
    url = info['url']
    tags = read_ifd(fetch(url, 0, 65536))
    if tags[259][0] != 8 or tags[284][0] != 1 or tags[277][0] != 3:
        raise SystemExit(f'Unsupported layout: compression {tags[259]}, planar {tags[284]}')
    scale, tie = tags[33550], tags[33922]
    x0, y0, res, t = tie[3], tie[4], scale[0], tags[322][0]
    across = math.ceil(tags[256][0] / t)
    corners = [utm(lat, lon, info['zone'], info['south']) for lat in (bbox[1], bbox[3]) for lon in (bbox[0], bbox[2])]
    ex = [c[0] for c in corners]; ny = [c[1] for c in corners]
    # A small source margin so resampling never reads outside the crop.
    px0 = math.floor((min(ex) - x0) / res) - 2; px1 = math.ceil((max(ex) - x0) / res) + 2
    py0 = math.floor((y0 - max(ny)) / res) - 2; py1 = math.ceil((y0 - min(ny)) / res) + 2
    if px0 < 0 or py0 < 0 or px1 > tags[256][0] or py1 > tags[257][0]:
        raise SystemExit(f'{key}: area falls outside scene {scene}')
    crop = Image.new('RGB', (px1 - px0, py1 - py0))
    fetched = count = 0
    for ty in range(py0 // t, (py1 - 1) // t + 1):
        for tx in range(px0 // t, (px1 - 1) // t + 1):
            k = ty * across + tx
            start, length = tags[324][k], tags[325][k]
            tile = decode_tile(fetch(url, start, length), tags)
            fetched += length; count += 1
            crop.paste(tile, (tx * t - px0, ty * t - py0))
            print(f'  {key} tile {tx},{ty}: {length / 1e6:.2f} MB', flush=True)
    meta_info = {'originE': x0 + px0 * res, 'originN': y0 - py0 * res, 'res': res,
                 'bytesFetched': fetched + 65536, 'tilesFetched': count}
    crop.save(png); meta.write_text(json.dumps(meta_info, indent=2))
    return crop, meta_info


def build(key, force=False):
    zh, en, bbox, scene = PLACES[key]
    out = root / 'closeup' / key
    if (out / 'manifest.json').exists() and not force:
        print(f'{key}: already built (use --force to rebuild)'); return None
    info = scene_info(scene)
    crop, src_info = source_crop(key, bbox, scene, info)
    lat_mid = math.radians((bbox[1] + bbox[3]) / 2)
    m_lat = 111132.92 - 559.82 * math.cos(2 * lat_mid) + 1.175 * math.cos(4 * lat_mid)
    m_lon = 111412.84 * math.cos(lat_mid) - 93.5 * math.cos(3 * lat_mid)
    width = round((bbox[2] - bbox[0]) * m_lon / 10)
    height = round((bbox[3] - bbox[1]) * m_lat / 10)
    dlon, dlat = (bbox[2] - bbox[0]) / width, (bbox[3] - bbox[1]) / height

    def src(col, row):  # output pixel corner -> source crop pixel
        e, n = utm(bbox[3] - row * dlat, bbox[0] + col * dlon, info['zone'], info['south'])
        return (e - src_info['originE']) / src_info['res'], (src_info['originN'] - n) / src_info['res']

    # Piecewise mesh: each 64-pixel cell maps its four corners exactly (UTM is not affine over 16 km).
    step, mesh = 64, []
    for r0 in range(0, height, step):
        for c0 in range(0, width, step):
            c1, r1 = min(width, c0 + step), min(height, r0 + step)
            mesh.append(((c0, r0, c1, r1), src(c0, r0) + src(c0, r1) + src(c1, r1) + src(c1, r0)))
    worst = 0.0
    for col, row in [(32.5, 32.5), (width - 20.5, height / 2 + 13), (width / 3 + 7, height * .8 + 5)]:
        c0, r0 = int(col // step) * step, int(row // step) * step
        c1, r1 = min(width, c0 + step), min(height, r0 + step)
        u, v = (col - c0) / (c1 - c0), (row - r0) / (r1 - r0)
        a, b, c, d = src(c0, r0), src(c1, r0), src(c0, r1), src(c1, r1)
        gx = (1 - u) * (1 - v) * a[0] + u * (1 - v) * b[0] + (1 - u) * v * c[0] + u * v * d[0]
        gy = (1 - u) * (1 - v) * a[1] + u * (1 - v) * b[1] + (1 - u) * v * c[1] + u * v * d[1]
        fx, fy = src(col, row)
        worst = max(worst, abs(fx - gx) + abs(fy - gy))
    if worst > 0.25:
        raise SystemExit(f'{key}: mesh reprojection error too high: {worst:.3f} px')
    base = crop.transform((width, height), Image.MESH, mesh, Image.BICUBIC)
    # Missing data in the scene is pure black; refuse to publish a crop with holes.
    black = sum(base.convert('L').point(lambda v: 255 if v == 0 else 0).histogram()[255:])
    black_share = black / (width * height)
    if black_share > MAX_BLACK:
        raise SystemExit(f'{key}: {black_share:.1%} of the crop has no image data (limit {MAX_BLACK:.1%})')

    out.mkdir(parents=True, exist_ok=True)
    levels, img, total, count = [], base, 0, 0
    while True:
        z = len(levels)
        cols, rows = math.ceil(img.width / TILE), math.ceil(img.height / TILE)
        (out / str(z)).mkdir(exist_ok=True)
        for y in range(rows):
            for x in range(cols):
                tile = img.crop((x * TILE, y * TILE, min(img.width, (x + 1) * TILE), min(img.height, (y + 1) * TILE)))
                path = out / str(z) / f'{x}_{y}.jpg'
                tile.save(path, quality=QUALITY, optimize=True, progressive=True)
                total += path.stat().st_size; count += 1
        levels.append({'width': img.width, 'height': img.height, 'cols': cols, 'rows': rows})
        if max(img.size) <= TILE:
            break
        img = img.resize((max(1, img.width // 2), max(1, img.height // 2)), Image.LANCZOS)
    year = info['date'][:4]
    manifest = {
        'name': [zh, en],
        'bounds': {'west': bbox[0], 'south': bbox[1], 'east': bbox[2], 'north': bbox[3]},
        'metresPerPixel': 10, 'tileSize': TILE, 'levels': levels, 'tiles': count, 'bytes': total,
        'date': info['date'], 'scene': scene,
        'source': 'Copernicus Sentinel-2 L2A true colour (TCI), Element 84 Earth Search on AWS Open Data',
        'credit': f'Contains modified Copernicus Sentinel data {year}',
        'reprojection': f'UTM {info["zone"]}{"S" if info["south"] else "N"} to lat/lon grid, 64-px mesh, max error {worst:.4f} source px',
        'missingData': round(black_share, 5),
    }
    (out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'{key}: read {src_info["bytesFetched"] / 1e6:.1f} MB in {src_info["tilesFetched"]} COG tiles; '
          f'output {width}x{height} px, {count} tiles, {total / 1e6:.2f} MB, missing {black_share:.3%}, mesh error {worst:.4f} px')
    return src_info['bytesFetched']


def main():
    args = sys.argv[1:]
    force = '--force' in args
    keys = [a for a in args if a != '--force'] or list(PLACES)
    unknown = [k for k in keys if k not in PLACES]
    if unknown:
        raise SystemExit(f'Unknown place: {unknown}')
    fetched = [b for b in (build(k, force) for k in keys) if b]
    print(f'Total read this run: {sum(fetched) / 1e6:.1f} MB for {len(fetched)} place(s)')


if __name__ == '__main__':
    sys.exit(main())
