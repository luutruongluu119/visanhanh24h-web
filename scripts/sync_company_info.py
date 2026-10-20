"""Use the homepage footer as the source of company information for every page."""
import argparse
from html import unescape
from pathlib import Path
import re

REPO = Path(__file__).resolve().parents[1]
FOOTER = re.compile(r"<footer\b[^>]*>.*?</footer>", re.S | re.I)


def source_footer():
    matches = FOOTER.findall((REPO / "index.html").read_text(encoding="utf-8"))
    if len(matches) != 1:
        raise ValueError("The homepage must have exactly one footer")
    return matches[0]


def normalize_company_info(page, footer):
    """Update only company details; leave service and article content intact."""
    address = unescape(re.search(r"VP giao dịch:\s*([^<]+)", footer).group(1)).strip()
    email = re.search(r'href="mailto:([^"?]+)', footer).group(1)
    phone = re.search(r'href="tel:[^"]+">([^<]+)', footer).group(1)
    company = re.search(r"—\s*(Công ty[^<]+?)\. MSDN:", footer).group(1)
    page, count = FOOTER.subn(lambda match: footer, page)
    if count != 1:
        raise ValueError("Each page must have exactly one footer")
    page = re.sub(r"Công ty TNHH (?:Du lịch )?Skyway", lambda match: company, page)
    page = re.sub(r"Skywaytravelvn@gmail\.com|visa@skywaytravel\.vn|info@skywaytravel\.vn",
                  lambda match: email, page, flags=re.I)
    page = re.sub(r"(?:\+84 888 282 286|0888[. ]282[. ]286)", lambda match: phone, page)
    page = re.sub(
        r"(?:Số|số) 4,?\s*(?:phố\s+)?Phạm Tuấn Tài,\s*(?:Cầu Giấy|Nghĩa Đô),\s*Hà Nội",
        lambda match: address, page,
    )
    page = re.sub(
        r"Lô 25 TT1,\s*(?:Khu đô thị\s+)?Mỹ Đình,\s*(?:Phường Từ Liêm,\s*)?(?:Thành phố |TP\. )?Hà Nội",
        lambda match: address, page,
    )
    page = page.replace("văn phòng Cầu Giấy, Hà Nội", "văn phòng tại " + address)
    page = page.replace("văn phòng giao dịch cố định tại Cầu Giấy, Hà Nội",
                        "văn phòng giao dịch cố định tại " + address)
    return page


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Report differences without writing")
    parser.add_argument("--published-only", action="store_true", help="Only check or update published pages")
    args = parser.parse_args()
    footer = source_footer()
    changed = []
    pages = sorted(REPO.glob("*.html"))
    if not args.published_only:
        pages += sorted((REPO / "_scheduled_cam_nang").glob("*.html"))
    for path in pages:
        original = path.read_text(encoding="utf-8")
        updated = normalize_company_info(original, footer)
        if updated != original:
            changed.append(str(path.relative_to(REPO)))
            if not args.check:
                path.write_text(updated, encoding="utf-8")
    print(f"Checked {len(pages)} HTML pages; {'inconsistent' if args.check else 'updated'}: {len(changed)}")
    if args.check and changed:
        print("\n".join(changed))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
