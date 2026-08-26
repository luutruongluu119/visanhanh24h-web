# -*- coding: utf-8 -*-
"""
Releases the next pending cam-nang article from _scheduled_cam_nang/ onto the
live site: moves the HTML file into the repo root, links it from cam-nang.html,
adds it to sitemap.xml, and marks it published in the queue.

Run manually, or on a schedule via .github/workflows/publish-cam-nang.yml
(GitHub Actions commits + pushes whatever this script changes).

Exits with code 0 and prints "NOTHING_TO_RELEASE" if the queue is empty/done,
so the workflow can skip the commit step cleanly.
"""
import json, os, re, sys, datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGE_DIR = os.path.join(REPO, "_scheduled_cam_nang")
QUEUE_PATH = os.path.join(STAGE_DIR, "_queue.json")
CAM_NANG = os.path.join(REPO, "cam-nang.html")
SITEMAP = os.path.join(REPO, "sitemap.xml")

CARD_TMPL = '''      <div class="post-card reveal">
        <div class="thumb"><img src="{photo_src}" alt="{alt}" loading="lazy" width="500" height="340"></div>
        <div class="body">
          <span class="cat">{category}</span>
          <h3><a href="{slug}.html" style="color:inherit;text-decoration:none;">{title}</a></h3>
          <p>{teaser}</p>
          <a href="{slug}.html" style="color:var(--gold-600);font-weight:600;font-size:14px;">Đọc tiếp →</a>
        </div>
      </div>
'''


def photo_src_for(item: dict) -> str:
    """Bài do app "Xưởng Viết Bài Web" xếp hàng có ảnh thật lưu trong repo
    (photo_local); bài viết tay trước đó dùng ảnh Unsplash hotlink (photo)."""
    if item.get("photo_local"):
        return f"images/{item['photo_local']}"
    return (f"https://images.unsplash.com/{item.get('photo', '')}"
            "?q=75&w=500&h=340&auto=format&fit=crop")

def main():
    if not os.path.exists(QUEUE_PATH):
        print("NOTHING_TO_RELEASE")
        return 0

    with open(QUEUE_PATH, "r", encoding="utf-8") as f:
        queue = json.load(f)

    pending = [item for item in queue if not item["published"]]
    if not pending:
        print("NOTHING_TO_RELEASE")
        return 0

    item = pending[0]
    slug = item["slug"]
    src = os.path.join(STAGE_DIR, slug + ".html")
    dst = os.path.join(REPO, slug + ".html")

    if not os.path.exists(src):
        print(f"ERROR: staged file missing for {slug}: {src}")
        return 1

    with open(src, "r", encoding="utf-8") as f:
        page_html = f.read()
    with open(dst, "w", encoding="utf-8") as f:
        f.write(page_html)
    os.remove(src)

    # 1) link into cam-nang.html grid
    with open(CAM_NANG, "r", encoding="utf-8") as f:
        cam_html = f.read()
    card = CARD_TMPL.format(
        photo_src=photo_src_for(item), alt=item["post_title"], category=item["category"],
        slug=slug, title=item["post_title"], teaser=item["teaser"],
    )
    marker = '<div class="grid-3">\n'
    idx = cam_html.index(marker) + len(marker)
    cam_html = cam_html[:idx] + card + cam_html[idx:]
    with open(CAM_NANG, "w", encoding="utf-8") as f:
        f.write(cam_html)

    # 2) add to sitemap.xml
    with open(SITEMAP, "r", encoding="utf-8") as f:
        sitemap = f.read()
    entry = f'  <url><loc>https://visanhanh24h.com/{slug}.html</loc><priority>0.6</priority></url>\n'
    sitemap = sitemap.replace("</urlset>", entry + "</urlset>")
    with open(SITEMAP, "w", encoding="utf-8") as f:
        f.write(sitemap)

    # 3) mark published in queue
    item["published"] = True
    item["published_date"] = datetime.date.today().isoformat()
    with open(QUEUE_PATH, "w", encoding="utf-8") as f:
        json.dump(queue, f, ensure_ascii=False, indent=2)

    remaining = len([i for i in queue if not i["published"]])
    print(f"RELEASED: {slug} — {item['post_title']}")
    print(f"REMAINING: {remaining}")
    return 0

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
