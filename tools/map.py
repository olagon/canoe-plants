#!/usr/bin/env python3
"""Draw the Pacific land shapes for the voyage map.

Takes the public domain Natural Earth 1:50m land file, recenters it on the Pacific,
simplifies the coastlines, and writes one SVG path to assets/svg/pacific.svg.
Projection is plain equirectangular. x = (lon - 95) * 5, y = (52 - lat) * 5.
Usage: python3 tools/map.py
"""
import json, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson"
LON0, LON1, LAT0, LAT1, K = 95, 295, 52, -52, 5
TOLERANCE = 0.9      # simplification, in output units
MIN_AREA = 14        # drop specks smaller than this, in square output units


def simplify(pts, tol):
    """Douglas-Peucker, iterative."""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        (x1, y1), (x2, y2) = pts[a], pts[b]
        dx, dy = x2 - x1, y2 - y1
        norm = (dx * dx + dy * dy) ** 0.5 or 1e-9
        best, idx = 0, None
        for i in range(a + 1, b):
            d = abs(dy * (pts[i][0] - x1) - dx * (pts[i][1] - y1)) / norm
            if d > best:
                best, idx = d, i
        if idx is not None and best > tol:
            keep[idx] = True
            stack += [(a, idx), (idx, b)]
    return [p for p, k in zip(pts, keep) if k]


def area(pts):
    return abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1]))) / 2


def main():
    cache = ROOT / "tools/_cache/ne_50m_land.geojson"
    cache.parent.mkdir(exist_ok=True)
    if not cache.exists():
        cache.write_bytes(urllib.request.urlopen(SRC, timeout=120).read())
    rings = []
    for feat in json.loads(cache.read_text())["features"]:
        g = feat["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        rings += [poly[0] for poly in polys]  # outer rings only

    parts = []
    for ring in rings:
        pts = [(((lon + 360 if lon < -25 else lon) - LON0) * K, (LAT0 - lat) * K) for lon, lat in ring]
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        if max(xs) < -20 or min(xs) > (LON1 - LON0) * K + 20 or max(ys) < -20 or min(ys) > (LAT0 - LAT1) * K + 20:
            continue
        if max(xs) - min(xs) > 1500:  # a ring torn by the recentering, all of them far off the map
            continue
        hawaii = (min(xs) > (199 - LON0) * K and max(xs) < (206 - LON0) * K and min(ys) > (LAT0 - 23) * K and max(ys) < (LAT0 - 18) * K)
        if area(pts) < (2 if hawaii else MIN_AREA):
            continue
        # a ring starts and ends at the same point, so simplify it as two halves
        far = max(range(len(pts)), key=lambda i: (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2)
        tol = 0.35 if hawaii else TOLERANCE
        pts = simplify(pts[:far + 1], tol)[:-1] + simplify(pts[far:], tol)[:-1]
        if len(pts) < 4:
            continue
        # clamp far away points so the path stays small
        pts = [(min(max(x, -40), 1040), min(max(y, -40), 560)) for x, y in pts]
        parts.append("M" + "L".join(f"{x:.1f},{y:.1f}".replace(".0", "") for x, y in pts) + "Z")

    w, h = (LON1 - LON0) * K, (LAT0 - LAT1) * K
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">'
           f'<!-- Land shapes from Natural Earth (public domain), simplified by tools/map.py -->'
           f'<path id="land" fill="#1B3553" d="{"".join(parts)}"/></svg>\n')
    out = ROOT / "assets/svg/pacific.svg"
    out.write_text(svg)
    print(f"{len(parts)} shapes, {len(svg) // 1024} KB")


if __name__ == "__main__":
    main()
