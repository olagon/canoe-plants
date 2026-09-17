#!/usr/bin/env python3
"""Download, resize, and credit every image on the site.

Reads tools/image-manifest.json. For each entry it
  1. asks Wikimedia Commons for the file's real license and refuses anything
     that is not public domain, CC0, CC BY, or CC BY-SA
  2. downloads the image (cached in tools/_cache)
  3. strips metadata, resizes to 1600px, 960px, and 480px wide, writes WebP and JPEG
  4. writes data/credits.json and fills the "images" arrays in
     data/plants.json and data/companions.json

Needs ImageMagick ("magick") on the PATH. Safe to run again. Finished files are skipped.
Usage: python3 tools/images.py
"""
import json, re, subprocess, sys, time, urllib.parse, urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "tools" / "_cache"
UA = "CanoePlantsEdu/1.0 (https://github.com/olagon/canoe-plants; educational site build)"
ALLOWED = re.compile(r"^(cc0|public domain|pd\b|no restrictions|cc[ -]by(-sa)?[ -][\d.]+)", re.I)
SIZES = (1600, 960, 480)


def fetch(url, tries=5):
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as err:  # 429s and timeouts: wait and try again
            wait = 15 * (attempt + 1)
            print(f"   {err}. Waiting {wait}s", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError(f"Could not fetch {url}")


def commons_info(title):
    q = urllib.parse.urlencode({
        "action": "query", "format": "json", "prop": "imageinfo", "titles": title,
        "iiprop": "url|size|extmetadata", "iiurlwidth": SIZES[0],
    })
    pages = json.loads(fetch(f"https://commons.wikimedia.org/w/api.php?{q}"))["query"]["pages"]
    info = next(iter(pages.values())).get("imageinfo")
    if not info:
        raise RuntimeError(f"Commons has no file named {title}")
    return info[0]


def target(entry, n):
    slug = entry["plantSlug"]
    if slug.startswith("companion-"):
        slug = slug.removeprefix("companion-")
        return slug, ROOT / "assets/img/companions" / slug, f"{slug}-{n:02d}"
    return slug, ROOT / "assets/img/plants" / slug, f"{slug}-{n:02d}"


def main():
    manifest = json.loads((ROOT / "tools/image-manifest.json").read_text())
    CACHE.mkdir(exist_ok=True)
    counts, credits, images, problems = defaultdict(int), [], defaultdict(list), []

    for entry in manifest:
        counts[entry["plantSlug"]] += 1
        slug, folder, name = target(entry, counts[entry["plantSlug"]])
        folder.mkdir(parents=True, exist_ok=True)
        done = all((folder / f"{name}-{s}.{ext}").exists() for s in SIZES for ext in ("webp", "jpg"))
        try:
            if not done:
                print(f"{name}: {entry.get('commonsFile') or entry['downloadUrl']}")
                url = entry.get("downloadUrl")
                if entry.get("commonsFile"):
                    info = commons_info(urllib.parse.unquote(entry["commonsFile"]))  # names may be percent encoded
                    lic = info["extmetadata"].get("LicenseShortName", {}).get("value", "")
                    if not ALLOWED.match(lic):
                        raise RuntimeError(f"license not allowed: {lic!r}")
                    url = info.get("thumburl") if info["width"] > SIZES[0] else info["url"]
                raw = CACHE / (name + Path(urllib.parse.urlparse(url).path).suffix.lower())
                if not raw.exists():
                    raw.write_bytes(fetch(url))
                    time.sleep(1.5)  # be polite to the image servers
                # "crop": "3:2" in the manifest trims a tall photo to a wide one, from the center or from "gravity"
                crop = ["-gravity", entry.get("gravity", "center"), "-crop", f"{entry['crop']}+0+0", "+repage"] if entry.get("crop") else []
                for size in SIZES:
                    base = ["magick", f"{raw}[0]", "-auto-orient", "-strip", "-colorspace", "sRGB", *crop, "-resize", f"{size}x>"]
                    subprocess.run(base + ["-quality", "76", "-interlace", "Plane", "-background", "white", "-flatten", str(folder / f"{name}-{size}.jpg")], check=True)
                    subprocess.run(base + ["-quality", "64", "-define", "webp:method=6", str(folder / f"{name}-{size}.webp")], check=True)
            w, h = subprocess.run(["magick", "identify", "-format", "%w %h", str(folder / f"{name}-{SIZES[0]}.jpg")],
                                  check=True, capture_output=True, text=True).stdout.split()
        except Exception as err:
            problems.append(f"{name}: {err}")
            counts[entry["plantSlug"]] -= 1
            continue

        credit_id = f"c-{name}"
        credits.append({
            "creditId": credit_id, "file": f"{name}.webp", "plantSlug": entry["plantSlug"],
            "author": entry["author"], "license": entry["license"], "licenseUrl": entry["licenseUrl"],
            "sourceUrl": entry["sourceUrl"], "title": entry["title"],
        })
        images[entry["plantSlug"]].append({
            "file": f"{name}.webp", "base": f"{folder.relative_to(ROOT).as_posix()}/{name}",
            "alt": entry["alt"], "creditId": credit_id, "role": entry["role"], "w": int(w), "h": int(h),
        })

    (ROOT / "data/credits.json").write_text(json.dumps(credits, ensure_ascii=False, indent=1) + "\n")
    for file, key in (("data/plants.json", lambda p: p["slug"]), ("data/companions.json", lambda c: "companion-" + c["slug"])):
        path = ROOT / file
        if not path.exists():
            continue
        items = json.loads(path.read_text())
        for item in items:
            item["images"] = images.get(key(item), [])
        path.write_text(json.dumps(items, ensure_ascii=False, indent=1) + "\n")

    print(f"{len(credits)} images ready, {len(problems)} problems")
    for p in problems:
        print("  PROBLEM", p)


if __name__ == "__main__":
    main()
