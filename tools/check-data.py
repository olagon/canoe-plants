#!/usr/bin/env python3
"""Checks the content files. Run before every push: python3 tools/check-data.py"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
load = lambda n: json.loads((ROOT / "data" / f"{n}.json").read_text())
problems = []
bad = lambda msg: problems.append(msg)

plants, sources, credits = load("plants"), load("sources"), load("credits")
credit_ids = {c["creditId"] for c in credits}
USES = {"food", "medicine", "cloth-cordage", "wood-tools", "light-dye", "ceremony"}
PARTS = {"root", "stem", "leaf", "flower", "fruit", "seed", "bark", "wood", "sap"}
ORIGINS = {"taiwan", "sea", "newguinea", "vanuatu", "indopacific", "southamerica"}


def empty_fields(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "kinolau":
                continue  # blank when no kinolau is recorded
            yield from empty_fields(v, f"{path}.{k}")
    elif isinstance(obj, list):
        if not obj:
            yield path
        for i, v in enumerate(obj):
            yield from empty_fields(v, f"{path}[{i}]")
    elif obj in ("", None):
        yield path


if len(plants) != 26:
    bad(f"expected 26 plants, found {len(plants)}")
for p in plants:
    s = p["slug"]
    for f in empty_fields(p):
        bad(f"{s}: empty field {f}")
    if not 4 <= len(p["facts"]) <= 6: bad(f"{s}: {len(p['facts'])} facts")
    if len(p["images"]) < 3: bad(f"{s}: only {len(p['images'])} images")
    if set(p["useTags"]) - USES: bad(f"{s}: unknown use tag")
    if set(p["partTags"]) - PARTS or {u["part"] for u in p["uses"]} != set(p["partTags"]): bad(f"{s}: part tags do not match uses")
    if p["originMapKey"] not in ORIGINS: bad(f"{s}: unknown origin key")
    if p["status"] not in ("canoe", "debated", "reclassified"): bad(f"{s}: bad status")
    for sid in p["sources"] + [f["source"] for f in p["facts"]]:
        if sid not in sources: bad(f"{s}: source {sid} is not in sources.json")
    for f in p["facts"]:
        if f["source"] not in p["sources"]: bad(f"{s}: fact source {f['source']} missing from plant sources")
    for img in p["images"]:
        if img["creditId"] not in credit_ids: bad(f"{s}: credit {img['creditId']} missing")
        for size in (1600, 960, 480):
            for ext in ("webp", "jpg"):
                if not (ROOT / f"{img['base']}-{size}.{ext}").exists(): bad(f"{s}: missing file {img['base']}-{size}.{ext}")
        if len(img["alt"]) < 25: bad(f"{s}: alt text too short on {img['file']}")

for name in ("companions", "myths", "timeline", "quiz", "glossary"):
    text = (ROOT / "data" / f"{name}.json").read_text()
    for sid in re.findall(r'"source": "([^"]+)"', text):
        if sid not in sources: bad(f"{name}: source {sid} is not in sources.json")

quiz = load("quiz")
if len(quiz) < 40: bad(f"quiz has only {len(quiz)} questions")
for i, q in enumerate(quiz):
    if len(q.get("choices", [])) != 4 or q.get("answer") not in q.get("choices", []): bad(f"quiz {i}: needs four choices with the answer among them")
if len(load("glossary")) < 50: bad("glossary has fewer than 50 terms")

# spelling and punctuation rules for every text file in the repo
for path in ROOT.rglob("*"):
    if path.suffix not in {".html", ".js", ".json", ".css", ".md", ".py", ".svg"} or any(x in path.parts for x in (".git", "_staging", "_cache")) or path.name == "CLAUDE.md":
        continue
    text = path.read_text(errors="ignore")
    for ch, label in ((chr(0x2014), "em dash"), (chr(0x2013), "en dash")):
        if ch in text: bad(f"{path.relative_to(ROOT)}: contains an {label}")
    if path.suffix == ".json" and path.parent.name == "data":
        if re.search(r"[A-Za-zāēīōū]['`‘’][aeiouāēīōū]", text.replace("'s ", " ")) and re.search(r"\b\w*[aeiou]['`‘’][aeiou]\w*", text):
            for m in re.finditer(r"\b\w*[aeiouāēīōū]['`‘’][aeiouāēīōū]\w*", text):
                bad(f"{path.name}: looks like a fake ʻokina in {m.group(0)!r}")
        if re.search(r"(^|[\s\"(])['`‘][A-Za-zĀāŌōŪū]", text): bad(f"{path.name}: word starts with a quote mark where an ʻokina may belong")

print(f"{len(problems)} problems")
for p in problems: print(" ", p)
sys.exit(1 if problems else 0)
