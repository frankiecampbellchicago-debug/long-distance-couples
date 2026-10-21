"""Build data/recipes.json: a small index of TheMealDB recipes with a skill level, so the cook-off page can
filter by kind of food and Easy / Medium / Hard instantly. The full recipe still loads from TheMealDB when opened.

    python tools/build-recipes.py

About 36 requests (one per letter and digit), a second apart. Run again whenever, e.g. with the monthly update.
"""
import json, pathlib, re, string, sys, time, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "recipes.json"
API = "https://www.themealdb.com/api/json/v1/1/"
UA = "LoveIsInTheAir/1.0 (+https://frankiecampbellchicago-debug.github.io/long-distance-couples/; recipe index)"


def get(path):
    for i in range(3):
        try:
            req = urllib.request.Request(API + path, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8")).get("meals") or []
        except Exception as e:
            print("  retry", path, e, file=sys.stderr)
            time.sleep(5 * (i + 1))
    raise SystemExit("Couldn't reach TheMealDB; keeping the old index")


def steps(text):
    parts = [p.strip() for p in re.split(r"\r?\n+", text or "")]
    parts = [re.sub(r"^(step\s*)?\d+[.):]?\s*", "", p, flags=re.I) for p in parts]
    parts = [p for p in parts if len(p) > 2 and not re.fullmatch(r"step\s*\d*", p, re.I)]
    if len(parts) <= 1:  # one big paragraph: count sentences instead
        parts = [s for s in re.split(r"(?<=[.!?])\s+", text or "") if len(s) > 15]
    return len(parts)


def main():
    meals = {}
    for ch in string.ascii_lowercase + string.digits:
        for m in get("search.php?f=" + ch):
            meals[m["idMeal"]] = m
        time.sleep(1)
    if len(meals) < 100:
        raise SystemExit("Only %d recipes came back; keeping the old index" % len(meals))

    items = []
    for m in meals.values():
        ings = [(m.get("strIngredient%d" % i) or "").strip().lower() for i in range(1, 21)]
        ings = [x for x in ings if x]
        n_steps, words = steps(m.get("strInstructions")), len((m.get("strInstructions") or "").split())
        # how much there is to do: ingredients to prep, steps to follow, and how much reading
        score = len(ings) + n_steps * 1.2 + words / 60
        items.append({"i": m["idMeal"], "n": m["strMeal"].strip(), "c": m.get("strCategory") or "", "a": m.get("strArea") or "",
                      "t": m.get("strMealThumb") or "", "g": ings, "ni": len(ings), "ns": n_steps, "s": round(score, 1)})

    # Easy: the simplest 35%; Hard: the most involved 25%
    ranked = sorted(x["s"] for x in items)
    easy, hard = ranked[int(len(ranked) * 0.35)], ranked[int(len(ranked) * 0.75)]
    for x in items:
        x["k"] = "easy" if x["s"] <= easy else "hard" if x["s"] > hard else "medium"
        del x["s"]
    items.sort(key=lambda x: x["n"].lower())

    cats = sorted({x["c"] for x in items if x["c"]})
    areas = sorted({x["a"] for x in items if x["a"] and x["a"] != "Unknown"})
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"updated": time.strftime("%Y-%m-%d"), "source": "TheMealDB", "categories": cats, "areas": areas, "recipes": items},
                              separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    counts = {k: sum(1 for x in items if x["k"] == k) for k in ("easy", "medium", "hard")}
    print("done:", len(items), "recipes", counts, "|", len(cats), "kinds,", len(areas), "cuisines")


if __name__ == "__main__":
    main()
