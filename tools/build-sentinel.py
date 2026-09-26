"""Build the Melbourne Sentinel-2 10 m close-up pyramid.

Reads only the needed 1024-pixel tiles of one approved Copernicus Sentinel-2
L2A true-colour COG (Element 84 Earth Search, AWS Open Data) with HTTP range
requests. Standard library + Pillow only; no GDAL.

Output: closeup/melbourne/manifest.json and {level}/{x}_{y}.jpg tiles on a
lat/lon grid (level 0 is about 10 m per pixel), aligned with the NASA pyramid.
The raw crop is cached in tools/_source/ (ignored by git, never published).
"""
from pathlib import Path
import io, json, math, struct, sys
import requests
from PIL import Image

SCENE = 'S2C_T55HCU_20260908T001553_L2A'
URL = ('https://e84-earth-search-sentinel-data.s3.us-west-2.amazonaws.com/'
       'sentinel-2-c1-l2a/55/H/CU/2026/9/' + SCENE + '/TCI.tif')
DATE = '2026-09-08'
# West, south, east, north: about 16 x 10 km around central Melbourne (approved area).
BBOX = (144.875, -37.875, 145.055, -37.785)
ZONE, SOUTH = 55, True
TILE, QUALITY = 512, 82

root = Path(__file__).resolve().parent.parent
cache = root / 'tools' / '_source'
out = root / 'closeup' / 'melbourne'


def utm(lat, lon):
    """WGS84 lat/lon (degrees) to UTM easting/northing (metres)."""
    a, f, k0 = 6378137.0, 1 / 298.257223563, 0.9996
    e2 = f * (2 - f); ep2 = e2 / (1 - e2)
    phi, lam = math.radians(lat), math.radians(lon)
    lam0 = math.radians((ZONE - 1) * 6 - 180 + 3)
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
    return x, y + (10000000 if SOUTH else 0)


def fetch(start, length):
    r = requests.get(URL, headers={'Range': f'bytes={start}-{start + length - 1}'}, timeout=120)
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


def source_crop():
    cache.mkdir(parents=True, exist_ok=True)
    png = cache / f'{SCENE}_melbourne.png'
    meta = cache / f'{SCENE}_melbourne.json'
    if png.exists() and meta.exists():
        return Image.open(png).convert('RGB'), json.loads(meta.read_text())
    tags = read_ifd(fetch(0, 65536))
    if tags[259][0] != 8 or tags[284][0] != 1 or tags[277][0] != 3:
        raise SystemExit(f'Unsupported layout: compression {tags[259]}, planar {tags[284]}')
    scale, tie = tags[33550], tags[33922]
    x0, y0, res, t = tie[3], tie[4], scale[0], tags[322][0]
    across = math.ceil(tags[256][0] / t)
    corners = [utm(lat, lon) for lat in (BBOX[1], BBOX[3]) for lon in (BBOX[0], BBOX[2])]
    ex = [c[0] for c in corners]; ny = [c[1] for c in corners]
    # One extra source pixel margin so resampling never reads outside the crop.
    px0 = math.floor((min(ex) - x0) / res) - 2; px1 = math.ceil((max(ex) - x0) / res) + 2
    py0 = math.floor((y0 - max(ny)) / res) - 2; py1 = math.ceil((y0 - min(ny)) / res) + 2
    crop = Image.new('RGB', (px1 - px0, py1 - py0))
    fetched = 0
    for ty in range(py0 // t, (py1 - 1) // t + 1):
        for tx in range(px0 // t, (px1 - 1) // t + 1):
            k = ty * across + tx
            start, length = tags[324][k], tags[325][k]
            tile = decode_tile(fetch(start, length), tags)
            fetched += length
            crop.paste(tile, (tx * t - px0, ty * t - py0))
            print(f'  tile {tx},{ty}: {length / 1e6:.2f} MB', flush=True)
    info = {'originE': x0 + px0 * res, 'originN': y0 - py0 * res, 'res': res,
            'bytesFetched': fetched + 65536, 'tilesFetched': (py1 // t - py0 // t + 1) * (px1 // t - px0 // t + 1)}
    crop.save(png); meta.write_text(json.dumps(info, indent=2))
    return crop, info


def main():
    crop, info = source_crop()
    lat_mid = math.radians((BBOX[1] + BBOX[3]) / 2)
    m_lat = 111132.92 - 559.82 * math.cos(2 * lat_mid) + 1.175 * math.cos(4 * lat_mid)
    m_lon = 111412.84 * math.cos(lat_mid) - 93.5 * math.cos(3 * lat_mid)
    width = round((BBOX[2] - BBOX[0]) * m_lon / 10)
    height = round((BBOX[3] - BBOX[1]) * m_lat / 10)
    dlon, dlat = (BBOX[2] - BBOX[0]) / width, (BBOX[3] - BBOX[1]) / height

    def src(col, row):  # output pixel corner -> source crop pixel
        e, n = utm(BBOX[3] - row * dlat, BBOX[0] + col * dlon)
        return (e - info['originE']) / info['res'], (info['originN'] - n) / info['res']

    # Piecewise mesh: each 64-pixel cell maps its four corners exactly (UTM is not affine over 16 km).
    step, mesh = 64, []
    for r0 in range(0, height, step):
        for c0 in range(0, width, step):
            c1, r1 = min(width, c0 + step), min(height, r0 + step)
            q = src(c0, r0) + src(c0, r1) + src(c1, r1) + src(c1, r0)
            mesh.append(((c0, r0, c1, r1), q))
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
        raise SystemExit(f'Mesh reprojection error too high: {worst:.3f} px')
    base = crop.transform((width, height), Image.MESH, mesh, Image.BICUBIC)

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
    manifest = {
        'name': ['墨爾本市中心', 'Central Melbourne'],
        'bounds': {'west': BBOX[0], 'south': BBOX[1], 'east': BBOX[2], 'north': BBOX[3]},
        'metresPerPixel': 10, 'tileSize': TILE, 'levels': levels, 'tiles': count, 'bytes': total,
        'date': DATE, 'scene': SCENE,
        'source': 'Copernicus Sentinel-2 L2A true colour (TCI), Element 84 Earth Search on AWS Open Data',
        'credit': 'Contains modified Copernicus Sentinel data 2026',
        'reprojection': f'UTM 55S to lat/lon grid, 64-px mesh, max error {worst:.4f} source px',
    }
    (out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Source read: {info["bytesFetched"] / 1e6:.1f} MB in {info["tilesFetched"]} COG tiles')
    print(f'Output: {width}x{height} px, {count} tiles, {total / 1e6:.2f} MB, mesh error {worst:.4f} px')


if __name__ == '__main__':
    sys.exit(main())
