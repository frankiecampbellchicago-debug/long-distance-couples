"""Stamp every local script in the site's HTML pages with ?v=<content hash>.

Browsers cache JS files separately from the page. Without a version tag, a visitor
can get the new index.html with an old script, and features silently stop working.
Run this before every commit:  python tools/version-assets.py
"""
import hashlib, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent

def stamp(m):
    path = m.group(1)
    digest = hashlib.sha1((root / path).read_bytes()).hexdigest()[:8]
    return f'src="{path}?v={digest}"'

for page in sorted(root.glob("*.html")):
    html = page.read_text(encoding="utf-8")
    new = re.sub(r'src="(js/[\w./-]+\.js)(?:\?v=[0-9a-f]+)?"', stamp, html)
    if new != html:
        page.write_text(new, encoding="utf-8", newline="\n")
    print(page.name, " ".join(re.findall(r'src="js/[^"]+"', new)))
