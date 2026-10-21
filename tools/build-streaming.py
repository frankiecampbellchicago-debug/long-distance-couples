"""Build the Movie night top-10 lists into data/streaming/.

Runs on the 10th of every month from .github/workflows/update-streaming.yml, or by hand:
    TMDB_KEY=... python tools/build-streaming.py

What's streaming where: TMDB (streaming data by JustWatch). Needs a free TMDB key in TMDB_KEY.
Critic scores: Rotten Tomatoes and Metacritic scores recorded on Wikidata (CC0), joined by TMDB id.
The site only reads the JSON files this writes, so visitors never call TMDB and the key stays secret.
"""
import json, os, pathlib, re, sys, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "streaming"
KEY = os.environ.get("TMDB_KEY", "").strip()
API = os.environ.get("TMDB_API", "https://api.themoviedb.org/3/")
REGION = os.environ.get("REGION", "US")
UA = "LoveIsInTheAir/1.0 (https://frankiecampbellchicago-debug.github.io/long-distance-couples/)"

# The services people actually have. Matched against TMDB's provider names for the region.
SERVICES = ["Netflix", "Amazon Prime Video", "Disney Plus", "Hulu", "Max", "Apple TV Plus", "Paramount Plus",
            "Peacock", "Peacock Premium", "Tubi TV", "Pluto TV", "Crunchyroll", "Starz", "MGM Plus", "Shudder", "BritBox", "AMC Plus", "Kanopy", "fuboTV"]
PER_LIST = 10


def get(url, headers=None, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as e:
            if i == tries - 1:
                raise
            time.sleep(2 * (i + 1))


def tmdb(path, **params):
    headers = {}
    if len(KEY) > 40:
        headers["Authorization"] = "Bearer " + KEY      # v4 read access token
    else:
        params["api_key"] = KEY                         # v3 api key
    params.setdefault("language", "en-US")
    return get(API + path + "?" + urllib.parse.urlencode(params), headers)


def discover(kind, provider, genre, sort):
    base = dict(watch_region=REGION, with_watch_providers=provider, with_watch_monetization_types="flatrate|free|ads",
                with_genres=genre, include_adult="false")
    if sort == "popular":
        return tmdb("discover/" + kind, sort_by="popularity.desc", **base)["results"][:PER_LIST]
    # a rating only means something with enough votes; loosen the bar for small catalogs
    res = []
    for floor in (500, 100, 20):
        res = tmdb("discover/" + kind, sort_by="vote_average.desc", **{"vote_count.gte": floor}, **base)["results"]
        if len(res) >= PER_LIST:
            break
    return res[:PER_LIST]


def critic_scores(kind, ids):
    """Rotten Tomatoes + Metacritic scores from Wikidata for a batch of TMDB ids."""
    prop = "P4947" if kind == "movie" else "P4983"     # TMDB movie ID / TMDB TV series ID
    out = {}
    ids = list(ids)
    for i in range(0, len(ids), 250):
        values = " ".join('"%s"' % x for x in ids[i:i + 250])
        # Tomatometer (Q108403393) and Metascore (Q106515043) only; skip audience and average-rating scores
        q = """SELECT ?tmdb ?method ?score ?when ?imdb WHERE {
          VALUES ?tmdb { %s } ?f wdt:%s ?tmdb.
          OPTIONAL { ?f wdt:P345 ?imdb. }
          OPTIONAL { ?f p:P444 ?st. ?st ps:P444 ?score; pq:P459 ?method. VALUES ?method { wd:Q108403393 wd:Q106515043 }
                     OPTIONAL { ?st pq:P585 ?when. } }
        }""" % (values, prop)
        try:
            rows = get("https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": q, "format": "json"}))["results"]["bindings"]
        except Exception as e:
            print("wikidata batch failed:", e, file=sys.stderr)
            continue
        latest = {}
        for r in rows:
            tid = r["tmdb"]["value"]
            t = out.setdefault(tid, {})
            if "imdb" in r:
                t["imdb"] = r["imdb"]["value"]
            if "score" in r:
                key = "rt" if r["method"]["value"].endswith("Q108403393") else "mc"
                pct, when = percent(r["score"]["value"]), r.get("when", {}).get("value", "")
                # a title can have several scores over the years; keep the most recent
                if pct is not None and when >= latest.get((tid, key), ""):
                    latest[(tid, key)] = when
                    t[key] = pct
        time.sleep(1)
    return out


def percent(s):
    """'93%' -> 93, '8.1/10' -> 81, '74/100' -> 74. Anything else is skipped."""
    s = s.strip()
    m = re.fullmatch(r"(\d{1,3})\s*%", s)
    if m:
        return int(m.group(1))
    m = re.fullmatch(r"(\d+(?:\.\d+)?)\s*/\s*(10|100)", s)
    if m:
        return round(float(m.group(1)) * 100 / float(m.group(2)))
    return None


def main():
    if not KEY:
        sys.exit("TMDB_KEY is not set. Get a free key at https://www.themoviedb.org/settings/api")
    providers = tmdb("watch/providers/movie", watch_region=REGION)["results"]
    by_name = {p["provider_name"].lower(): p for p in providers}
    chosen = [by_name[n.lower()] for n in SERVICES if n.lower() in by_name]
    print("services:", ", ".join(p["provider_name"] for p in chosen))

    genres = {k: [g for g in tmdb("genre/%s/list" % k)["genres"]] for k in ("movie", "tv")}
    jobs = [(k, p["provider_id"], g["id"], s) for k in ("movie", "tv") for p in chosen for g in genres[k] for s in ("top", "popular")]
    print(len(jobs), "lists to build")

    def run(job):
        try:
            return job, discover(*job)
        except Exception as e:
            print("failed", job, e, file=sys.stderr)
            return job, None
    with ThreadPoolExecutor(8) as pool:
        results = list(pool.map(run, jobs))
    failed = sum(1 for _, r in results if r is None)
    if failed > len(jobs) * 0.1:
        sys.exit("%d of %d lists failed; keeping last month's data" % (failed, len(jobs)))

    titles = {"movie": {}, "tv": {}}
    for (kind, _, _, _), res in results:
        for m in res or []:
            titles[kind][str(m["id"])] = m
    scores = {k: critic_scores(k, titles[k].keys()) for k in titles}

    OUT.mkdir(parents=True, exist_ok=True)
    for p in chosen:
        pid = p["provider_id"]
        data = {"lists": {}, "titles": {}}
        for (kind, prov, genre, sort), res in results:
            if prov != pid or not res:
                continue
            data["lists"]["%s|%s|%s" % (kind, genre, sort)] = [kind[0] + str(m["id"]) for m in res]
            for m in res:
                key = kind[0] + str(m["id"])
                if key in data["titles"]:
                    continue
                ov = (m.get("overview") or "").strip()
                if len(ov) > 240:
                    ov = ov[:240].rsplit(" ", 1)[0] + "…"
                t = {"id": m["id"], "t": m.get("title") or m.get("name"), "y": (m.get("release_date") or m.get("first_air_date") or "")[:4],
                     "p": m.get("poster_path"), "ov": ov, "v": round(m.get("vote_average") or 0, 1), "n": m.get("vote_count") or 0}
                t.update(scores[kind].get(str(m["id"]), {}))
                data["titles"][key] = t
        (OUT / ("%d.json" % pid)).write_text(json.dumps(data, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")

    index = {"updated": time.strftime("%Y-%m-%d"), "region": REGION,
             "services": [{"id": p["provider_id"], "name": p["provider_name"], "logo": p.get("logo_path")} for p in chosen],
             "genres": {k: [{"id": g["id"], "name": g["name"]} for g in v] for k, v in genres.items()}}
    (OUT / "index.json").write_text(json.dumps(index, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    rated = sum(1 for k in scores for v in scores[k].values() if "rt" in v or "mc" in v)
    print("wrote", len(chosen), "services;", sum(len(v) for v in titles.values()), "titles;", rated, "with critic scores")


if __name__ == "__main__":
    main()
