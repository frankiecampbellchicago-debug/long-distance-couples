"""Build the Movie night top-10 lists into data/streaming/ from Rotten Tomatoes' "at home" browse pages.

Runs on the 10th of every month from .github/workflows/update-streaming.yml, or by hand:
    python tools/build-streaming.py

One page per service + genre (about 200 pages), a few seconds apart, once a month. Every title links
back to its Rotten Tomatoes page. No keys, no accounts.
"""
import html, json, pathlib, re, sys, time, urllib.error, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "streaming"
BASE = "https://www.rottentomatoes.com/"
UA = "LoveIsInTheAir/1.0 (+https://frankiecampbellchicago-debug.github.io/long-distance-couples/; monthly list update)"
DELAY = 3          # seconds between requests
PER_LIST = 10

SERVICES = [("netflix", "Netflix"), ("prime-video", "Prime Video"), ("disney-plus", "Disney+"), ("hulu", "Hulu"),
            ("max", "Max"), ("apple-tv-plus", "Apple TV+"), ("paramount-plus", "Paramount+"), ("peacock", "Peacock"),
            ("amc-plus", "AMC+"), ("acorn-tv", "Acorn TV")]
GENRES = {
    "movie": [("action", "Action"), ("adventure", "Adventure"), ("animation", "Animation"), ("comedy", "Comedy"), ("crime", "Crime"),
              ("documentary", "Documentary"), ("drama", "Drama"), ("fantasy", "Fantasy"), ("horror", "Horror"),
              ("kids_and_family", "Kids & family"), ("musical", "Musical"), ("mystery_and_thriller", "Mystery & thriller"),
              ("romance", "Romance"), ("sci_fi", "Sci-fi"), ("war", "War"), ("western", "Western")],
    "tv": [("action", "Action"), ("animation", "Animation"), ("comedy", "Comedy"), ("crime", "Crime"), ("documentary", "Documentary"),
           ("drama", "Drama"), ("fantasy", "Fantasy"), ("horror", "Horror"), ("kids_and_family", "Kids & family"),
           ("mystery_and_thriller", "Mystery & thriller"), ("reality", "Reality"), ("romance", "Romance"), ("sci_fi", "Sci-fi")],
}
SECTION = {"movie": "browse/movies_at_home/", "tv": "browse/tv_series_browse/"}

_last = [0.0]


def fetch(path, tries=3):
    for i in range(tries):
        wait = _last[0] + DELAY - time.time()
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
        try:
            req = urllib.request.Request(BASE + path, headers={"User-Agent": UA, "Accept-Language": "en-US"})
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.read().decode("utf-8", "ignore")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            print("  retry", path, e, file=sys.stderr)
            time.sleep(10 * (i + 1))
        except Exception as e:
            print("  retry", path, e, file=sys.stderr)
            time.sleep(10 * (i + 1))
    return None


def attr(block, pattern):
    m = re.search(pattern, block, re.S)
    return html.unescape(m.group(1).strip()) if m else ""


def pct(s):
    m = re.search(r"(\d{1,3})%", s)
    return int(m.group(1)) if m else None


def tiles(page):
    out = []
    for block in page.split("<media-info-tile")[1:]:
        block = block.split("</media-info-tile>")[0]
        url = attr(block, r'media-url="([^"]+)"')
        title = attr(block, r'data-qa="discovery-media-list-item-title"[^>]*>(.*?)</rt-text>')
        if not url or not title:
            continue
        poster = attr(block, r'<rt-img[^>]*?\ssrc="([^"]+)"')
        out.append({"u": url, "t": title, "p": poster if poster.startswith("https://") else "",
                    "rt": pct(attr(block, r'slot="criticsScore"[^>]*>(.*?)</rt-text>')),
                    "au": pct(attr(block, r'slot="audienceScore"[^>]*>(.*?)</rt-text>')),
                    "d": attr(block, r'data-qa="discovery-media-list-item-start-date"[^>]*>(.*?)</rt-text>')})
    return out


def listing(kind, *filters):
    page = fetch(SECTION[kind] + "~".join(list(filters) + ["sort:popular"]))
    return None if page is None else tiles(page)


def same(a, b):
    return [x["u"] for x in a[:12]] == [x["u"] for x in b[:12]]


def filters_ok(kind, base, flt):
    """True if the filter changes the list. Checks twice, since a page can come back unfiltered by accident."""
    for _ in range(2):
        test = listing(kind, flt)
        if test and not same(test, base):
            return True
    return False


def main():
    # Rotten Tomatoes ignores filters it doesn't recognize and shows everything, so compare each
    # service and genre against the unfiltered list and drop any that don't actually filter.
    base = {k: listing(k) for k in SECTION}
    if not all(base.values()):
        sys.exit("Couldn't read Rotten Tomatoes; keeping last month's lists")

    services = []
    for slug, name in SERVICES:
        if filters_ok("movie", base["movie"], "affiliates:" + slug):
            services.append((slug, name))
        else:
            print("skipping service", slug)
    genres = {}
    for kind in SECTION:
        genres[kind] = []
        for slug, name in GENRES[kind]:
            if filters_ok(kind, base[kind], "genres:" + slug):
                genres[kind].append((slug, name))
            else:
                print("skipping", kind, "genre", slug)
    print("services:", [s for s, _ in services])

    total = failed = 0
    OUT.mkdir(parents=True, exist_ok=True)
    files = {}
    for slug, name in services:
        data = {"lists": {}, "titles": {}}
        for kind in SECTION:
            for g, _ in genres[kind]:
                total += 1
                items = listing(kind, "affiliates:" + slug, "genres:" + g)
                if items is None:
                    failed += 1
                    continue
                popular = items[:PER_LIST]
                # Top rated: the best critic scores among what people are watching on that service,
                # so you get well-known, well-reviewed picks instead of obscure titles with five reviews.
                rated = [x for x in items if x["rt"] is not None]
                top = sorted(rated, key=lambda x: (-x["rt"], -(x["au"] or 0)))[:PER_LIST]
                for sort, picks in (("popular", popular), ("top", top)):
                    data["lists"]["%s|%s|%s" % (kind, g, sort)] = [x["u"] for x in picks]
                    for x in picks:
                        data["titles"][x["u"]] = x
        files[slug] = data
        print(slug, len(data["titles"]), "titles")

    if not total or failed > total * 0.15:
        sys.exit("%d of %d pages failed; keeping last month's lists" % (failed, total))
    for slug, data in files.items():
        (OUT / (slug + ".json")).write_text(json.dumps(data, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    for old in OUT.glob("*.json"):
        if old.stem != "index" and old.stem not in files:
            old.unlink()
    index = {"updated": time.strftime("%Y-%m-%d"), "source": "Rotten Tomatoes",
             "services": [{"id": s, "name": n} for s, n in services],
             "genres": {k: [{"id": s, "name": n} for s, n in v] for k, v in genres.items()}}
    (OUT / "index.json").write_text(json.dumps(index, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    print("done:", len(services), "services,", total - failed, "lists")


if __name__ == "__main__":
    main()
