#!/usr/bin/env python3
"""WCAG contrast check for every text and background pair used in css/tokens.css."""
import re, sys
from pathlib import Path

css = (Path(__file__).resolve().parent.parent / "css/tokens.css").read_text()
root = dict(re.findall(r"--([\w-]+):\s*(#[0-9A-Fa-f]{6})", css.split("}")[0]))


def lum(hex_):
    ch = [int(hex_[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    ch = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in ch]
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


fails = 0
for names, body in re.findall(r"((?:\.ground-[\w-]+,?\s*)+)\{([^}]*--bg[^}]*)\}", css):
    val = {k: (root.get(v[6:-1], v) if v.startswith("var(") else v) for k, v in re.findall(r"--([\w-]+):\s*([^;]+);", body)}
    if "fg" not in val:
        continue
    for ground in re.findall(r"\.ground-[\w-]+", names):
        bgs = {"bg": val["bg"], "panel": val["panel"]}
        if ground == ".ground-kapa-light":
            bgs = {"bg": root["kapa-light"], "panel": root["kapa"]}
        for fg in ("fg", "muted", "accent", "link"):
            for bg_name, bg in bgs.items():
                r = ratio(val[fg], bg)
                ok = r >= 4.5
                fails += not ok
                print(f"{'ok  ' if ok else 'FAIL'} {ground:20} {fg:7} on {bg_name:6} {r:5.2f}")
sys.exit(1 if fails else 0)
