# -*- coding: utf-8 -*-
"""
SEO audit script — run this any time after adding/editing pages.
Checks every HTML file in this folder for:
  - missing/duplicate <title>
  - missing/duplicate meta description, or bad length
  - missing or multiple <h1>
  - missing canonical tag
  - <img> tags without alt text
  - internal links (href="xxx.html") pointing to files that don't exist
Usage:  python seo_audit.py
"""
import re
import glob
import os
from collections import defaultdict

SITE_DIR = os.path.dirname(os.path.abspath(__file__))

title_re = re.compile(r"<title>(.*?)</title>", re.DOTALL)
desc_re = re.compile(r'<meta name="description" content="([^"]*)"')
canonical_re = re.compile(r'<link rel="canonical" href="([^"]*)"')
h1_re = re.compile(r"<h1[^>]*>", re.IGNORECASE)
img_re = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
img_alt_re = re.compile(r'alt="[^"]*"', re.IGNORECASE)
href_re = re.compile(r'href="([^"]*\.html)(?:#[^"]*)?"')

files = sorted(glob.glob(os.path.join(SITE_DIR, "*.html")))
existing = {os.path.basename(p) for p in files}

titles = defaultdict(list)
descs = defaultdict(list)
issues = []

for path in files:
    fname = os.path.basename(path)
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()

    t = title_re.search(html)
    if not t:
        issues.append(f"[{fname}] THIEU the <title>")
    else:
        title = t.group(1).strip()
        titles[title].append(fname)
        if len(title) > 65:
            issues.append(f"[{fname}] Title qua dai ({len(title)} ky tu): {title}")

    d = desc_re.search(html)
    if not d:
        issues.append(f"[{fname}] THIEU meta description")
    else:
        desc = d.group(1).strip()
        descs[desc].append(fname)
        if len(desc) > 165:
            issues.append(f"[{fname}] Meta description qua dai ({len(desc)} ky tu)")
        elif len(desc) < 50:
            issues.append(f"[{fname}] Meta description qua ngan ({len(desc)} ky tu)")

    if not canonical_re.search(html):
        issues.append(f"[{fname}] THIEU the canonical")

    h1_count = len(h1_re.findall(html))
    if h1_count == 0:
        issues.append(f"[{fname}] THIEU the <h1>")
    elif h1_count > 1:
        issues.append(f"[{fname}] Co {h1_count} the <h1> (nen chi co 1)")

    for img in img_re.findall(html):
        if not img_alt_re.search(img):
            issues.append(f"[{fname}] The <img> thieu alt: {img[:60]}...")

    for href in href_re.findall(html):
        if href.startswith(("http://", "https://")):
            continue
        if href not in existing:
            issues.append(f"[{fname}] Link noi bo hong -> {href}")

# duplicate title / description across pages
for title, fnames in titles.items():
    if len(fnames) > 1:
        issues.append(f"[TRUNG TITLE] '{title}' dung o {len(fnames)} trang: {', '.join(fnames)}")

for desc, fnames in descs.items():
    if len(fnames) > 1:
        issues.append(f"[TRUNG META DESCRIPTION] dung o {len(fnames)} trang: {', '.join(fnames)}")

report_path = os.path.join(SITE_DIR, "seo_audit_report.txt")
with open(report_path, "w", encoding="utf-8") as f:
    f.write(f"Da quet {len(files)} trang HTML.\n")
    f.write(f"Tong so van de phat hien: {len(issues)}\n\n")
    for i in issues:
        f.write(i + "\n")
    if not issues:
        f.write("Khong phat hien van de nao. Site sach ve mat SEO ky thuat co ban.\n")

# console summary only (avoid Windows console encoding crashes on Vietnamese text)
print(f"Da quet {len(files)} trang HTML. Tong so van de: {len(issues)}")
print(f"Chi tiet day du: {report_path}")
