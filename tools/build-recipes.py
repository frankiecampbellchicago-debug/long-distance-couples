"""Build the cook-off recipe index from two free sources:

  * TheMealDB (about 800 recipes, with photos). The full recipe loads from TheMealDB when opened.
  * Wikibooks Cookbook (thousands of recipes, CC BY-SA). The full text is saved in data/recipes/wb-*.json
    and shown with a credit and a link back to the page.

Writes data/recipes.json (the searchable index: name, kind of food, cuisine, skill level, ingredients)
plus data/recipes/wb-0.json ... wb-31.json (Wikibooks recipe details, loaded only when one is opened).

    python tools/build-recipes.py                (full rebuild)
    python tools/build-recipes.py --photos-only  (just refresh the Wikipedia dish photos)

About 120 requests, a second apart. Runs with the monthly update.
"""
import html, json, pathlib, re, string, sys, time, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "recipes.json"
DETAIL = ROOT / "data" / "recipes"
MEALDB = "https://www.themealdb.com/api/json/v1/1/"
WIKI = "https://en.wikibooks.org/w/api.php?format=json&formatversion=2&"
UA = "LoveIsInTheAir/1.0 (+https://frankiecampbellchicago-debug.github.io/long-distance-couples/; recipe index)"
BUCKETS = 32


def get_json(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:
            print("  retry", url[:90], e, file=sys.stderr)
            time.sleep(5 * (i + 1))
    return None


def count_steps(text):
    parts = [p.strip() for p in re.split(r"\r?\n+", text or "")]
    parts = [re.sub(r"^(step\s*)?\d+[.):]?\s*", "", p, flags=re.I) for p in parts]
    parts = [p for p in parts if len(p) > 2 and not re.fullmatch(r"step\s*\d*", p, re.I)]
    if len(parts) <= 1:  # one big paragraph: count sentences instead
        parts = [s for s in re.split(r"(?<=[.!?])\s+", text or "") if len(s) > 15]
    return len(parts)


def effort(n_ings, n_steps, words):
    # how much there is to do: ingredients to prep, steps to follow, and how much reading
    return n_ings + n_steps * 1.2 + words / 60


# ---------- TheMealDB ----------
def mealdb():
    meals = {}
    for ch in string.ascii_lowercase + string.digits:
        j = get_json(MEALDB + "search.php?f=" + ch)
        if j is None:
            return None
        for m in j.get("meals") or []:
            meals[m["idMeal"]] = m
        time.sleep(1)
    items = []
    for m in meals.values():
        ings = [(m.get("strIngredient%d" % i) or "").strip().lower() for i in range(1, 21)]
        ings = [x for x in ings if x]
        ns, words = count_steps(m.get("strInstructions")), len((m.get("strInstructions") or "").split())
        items.append({"i": m["idMeal"], "n": m["strMeal"].strip(), "c": m.get("strCategory") or "", "a": ADJ.get(m.get("strArea") or "", m.get("strArea") or ""),
                      "t": m.get("strMealThumb") or "", "g": ings, "ni": len(ings), "ns": ns, "e": effort(len(ings), ns, words)})
    return items


# ---------- Wikibooks Cookbook ----------
ADJ = {"Unknown": "", "France": "French", "India": "Indian", "Argentina": "Argentine", "Netherlands": "Dutch", "Norway": "Norwegian", "Slovakia": "Slovak",
       "Venezuela": "Venezuelan", "United States": "American", "the United States": "American", "Saudi Arabian": "Saudi", "Mexico": "Mexican", "Italy": "Italian",
       "China": "Chinese", "Japan": "Japanese", "Korea": "Korean", "South Korea": "Korean", "Thailand": "Thai", "Vietnam": "Vietnamese", "Greece": "Greek",
       "Spain": "Spanish", "Portugal": "Portuguese", "Germany": "German", "Austria": "Austrian", "Hungary": "Hungarian", "Poland": "Polish", "Russia": "Russian",
       "Ukraine": "Ukrainian", "Turkey": "Turkish", "Lebanon": "Lebanese", "Iran": "Persian", "Persia": "Persian", "Morocco": "Moroccan", "Ethiopia": "Ethiopian",
       "Nigeria": "Nigerian", "Ghana": "Ghanaian", "Kenya": "Kenyan", "Egypt": "Egyptian", "Israel": "Israeli", "Pakistan": "Pakistani", "Bangladesh": "Bangladeshi",
       "Sri Lanka": "Sri Lankan", "Nepal": "Nepalese", "Indonesia": "Indonesian", "Malaysia": "Malaysian", "Philippines": "Filipino", "the Philippines": "Filipino",
       "Singapore": "Singaporean", "Australia": "Australian", "New Zealand": "New Zealand", "Canada": "Canadian", "Brazil": "Brazilian", "Peru": "Peruvian",
       "Chile": "Chilean", "Colombia": "Colombian", "Cuba": "Cuban", "Jamaica": "Jamaican", "Puerto Rico": "Puerto Rican", "Ireland": "Irish", "Scotland": "Scottish",
       "England": "British", "Wales": "Welsh", "United Kingdom": "British", "the United Kingdom": "British", "Sweden": "Swedish", "Denmark": "Danish",
       "Finland": "Finnish", "Belgium": "Belgian", "Switzerland": "Swiss", "Czech Republic": "Czech", "Romania": "Romanian", "Bulgaria": "Bulgarian",
       "Serbia": "Serbian", "Croatia": "Croatian", "Armenia": "Armenian", "Georgia": "Georgian", "Syria": "Syrian", "Iraq": "Iraqi", "Afghanistan": "Afghan",
       "Tunisia": "Tunisian", "Algeria": "Algerian", "South Africa": "South African", "Uruguay": "Uruguayan", "Hawaii": "Hawaiian", "Taiwan": "Taiwanese",
       "Cambodia": "Cambodian", "Laos": "Lao", "Burma": "Burmese", "Myanmar": "Burmese", "Iceland": "Icelandic", "Norway ": "Norwegian", "Mongolia": "Mongolian",
       "Cajun": "Cajun", "Louisiana": "Cajun", "Southern United States": "American", "Tex-Mex": "Tex-Mex",
       "Albania": "Albanian", "Azerbaijan": "Azerbaijani", "Bengal": "Bengali", "Sylhet": "Bengali", "Cyprus": "Cypriot", "Czechia": "Czech", "Estonia": "Estonian",
       "Gambia": "Gambian", "Gibraltar": "British", "Lithuania": "Lithuanian", "Nicaragua": "Nicaraguan", "Ontario": "Canadian", "Slovenia": "Slovenian",
       "Suriname": "Surinamese", "Swahili": "East African", "Tanzania": "Tanzanian", "Tibet": "Tibetan", "Trinidad and Tobago": "Trinidadian",
       "the Mediterranean": "Mediterranean", "the Netherlands": "Dutch", "Latvia": "Latvian", "Rwanda": "Rwandan", "Uganda": "Ugandan", "Senegal": "Senegalese",
       "Cameroon": "Cameroonian", "Zimbabwe": "Zimbabwean", "Haiti": "Haitian", "Dominican Republic": "Dominican", "Ecuador": "Ecuadorian", "Bolivia": "Bolivian",
       "Paraguay": "Paraguayan", "Guatemala": "Guatemalan", "El Salvador": "Salvadoran", "Honduras": "Honduran", "Belize": "Belizean", "Barbados": "Barbadian",
       "Fiji": "Fijian", "Samoa": "Samoan", "Kazakhstan": "Kazakh", "Uzbekistan": "Uzbek", "Jordan": "Jordanian", "Yemen": "Yemeni", "Kuwait": "Kuwaiti",
       "Palestine": "Palestinian", "Libya": "Libyan", "Sudan": "Sudanese", "Somalia": "Somali", "Eritrea": "Eritrean", "Madagascar": "Malagasy", "Malta": "Maltese",
       "Luxembourg": "Luxembourgish", "Belarus": "Belarusian", "Moldova": "Moldovan", "Bosnia and Herzegovina": "Bosnian", "Montenegro": "Montenegrin",
       "North Macedonia": "Macedonian", "Macedonia": "Macedonian", "Kosovo": "Kosovan", "Brunei": "Bruneian", "Bhutan": "Bhutanese", "Maldives": "Maldivian"}

# Wikibooks recipe categories -> the kinds of food in the dropdown
KINDS = [("Dessert", r"dessert|cake|cookie|biscuit|pie|pastr|candy|confection|pudding|ice cream|sweet|chocolate|frosting|icing|tart|muffin|brownie|fudge|custard"),
         ("Breakfast", r"breakfast|pancake|waffle|egg recipes|omelet|cereal|porridge|brunch"),
         ("Bread", r"bread|flatbread|roll|bun|biscuit|scone|yeast|dough|bagel|tortilla"),
         ("Soup", r"soup|stew|chowder|broth|chili|chilli|bisque"),
         ("Salad", r"salad"),
         ("Chicken", r"chicken|poultry|turkey|duck"),
         ("Beef", r"beef|steak|veal"),
         ("Pork", r"pork|ham|bacon|sausage"),
         ("Lamb", r"lamb|mutton|goat"),
         ("Seafood", r"seafood|fish|shellfish|shrimp|prawn|crab|lobster|salmon|tuna|clam|mussel|oyster|squid"),
         ("Pasta", r"pasta|noodle|spaghetti|lasagn|macaroni|dumpling"),
         ("Vegan", r"vegan"),
         ("Vegetarian", r"vegetarian|tofu|bean|lentil|legume|vegetable|potato|mushroom"),
         ("Starter", r"appetizer|starter|snack|dip|finger food|hors"),
         ("Side", r"side dish|rice|grain"),
         ("Sauces & dips", r"sauce|condiment|dressing|spice mix|seasoning|marinade|salsa|chutney|relish|pickle|jam|preserve"),
         ("Drinks", r"drink|beverage|cocktail|smoothie|juice|tea|coffee|punch|lemonade|shake")]


def clean(s):
    s = re.sub(r"<ref[^>]*/>|<ref[^>]*>.*?</ref>", "", s, flags=re.S)
    s = re.sub(r"\[\[(?:Image|File):[^\]]*\]\]", "", s, flags=re.I)
    for _ in range(3):
        s = re.sub(r"\{\{[^{}]*\}\}", "", s)
    s = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", s)
    s = re.sub(r"\[https?://\S+ ([^\]]*)\]", r"\1", s)
    s = re.sub(r"\[https?://[^\]]*\]", "", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("'''", "").replace("''", "")
    s = html.unescape(s)
    return re.sub(r"\s+", " ", s).strip(" .;:*#").strip()


def sections(text):
    """{lowercased heading: body} for == level 2 == sections, with their subsections included."""
    out, cur, buf = {}, "_intro", []
    for line in text.split("\n"):
        m = re.match(r"^==\s*([^=].*?)\s*==\s*$", line)
        if m:
            out[cur] = "\n".join(buf); cur, buf = m.group(1).lower(), []
        else:
            buf.append(line)
    out[cur] = "\n".join(buf)
    return out


def parse_wb(page):
    rev = (page.get("revisions") or [{}])[0]
    text = (rev.get("slots", {}).get("main", {}) or {}).get("content", "") or ""
    if not text or text.lstrip().upper().startswith("#REDIRECT"):
        return None
    summ = {}
    m = re.search(r"\{\{\s*recipe\s*summary(.*?)\n?\}\}", text, re.I | re.S)
    if m:
        body = m.group(1)
        for k in ("category", "servings", "time", "difficulty", "image"):
            mm = re.search(r"\|\s*" + k + r"\s*=\s*(.*?)(?=\n\s*\||\|\s*\w+\s*=|$)", body, re.I | re.S)
            if mm:
                summ[k] = mm.group(1).strip()
    secs = sections(text)
    ing_sec = next((v for k, v in secs.items() if k.startswith("ingredient")), "")
    proc_sec = next((v for k, v in secs.items() if re.match(r"procedure|direction|method|preparation|instruction|steps", k)), "")
    ings = [clean(l[1:]) for l in ing_sec.split("\n") if l.startswith("*")]
    ings = [x for x in ings if 1 < len(x) < 200]
    steps = [clean(re.sub(r"^#+", "", l)) for l in proc_sec.split("\n") if l.startswith("#")]
    steps = [x for x in steps if len(x) > 3]
    if len(ings) < 3 or len(steps) < 2:
        return None
    # ingredient keywords for search: the linked ingredient pages, e.g. [[Cookbook:Garlic|garlic]]
    keys = re.findall(r"\[\[Cookbook:([^|\]#]+)", ing_sec)
    units = re.compile(r"^(cup|teaspoon|tablespoon|tsp|tbsp|gram|g|kg|ounce|oz|pound|lb|ml|millilitre|milliliter|liter|litre|pinch|dash|clove|quart|pint|inch|centimetre|cm)s?$", re.I)
    # skip links to measurements and techniques ("Chopping", "Kilogram") so search sticks to real ingredients
    techniques = re.compile(r"^(chop|chopping|mince|mincing|dice|dicing|slice|slicing|grate|grating|grater|beat|beating|cube|cubing|julienne|zest|peel|peeling|"
                            r"boil|boiling|bake|baking|fry|frying|simmer|simmering|whisk|whisking|knead|kneading|blend|blender|food processor|sift|sifting|crush|"
                            r"each|kilogram|deciliter|decilitre|milligram|centimetre \(cm\)|millimetre|degree|fahrenheit|celsius|oil and fat|garnish|to taste)s?$", re.I)
    keys = [k.strip().lower() for k in keys if not units.match(k.strip()) and not techniques.match(k.strip())]
    g = list(dict.fromkeys(keys))[:14]
    cat = clean(summ.get("category", "")).lower()
    allcats = cat + " " + " ".join(re.findall(r"\[\[Category:([^\]|]+)", text)).lower() + " " + page["title"].lower()
    kind = next((k for k, rx in KINDS if re.search(rx, cat)), None) or next((k for k, rx in KINDS if re.search(rx, allcats)), "Miscellaneous")
    cz = re.findall(r"Cookbook:Cuisine of ([^|\]]+)", text)
    # "France#Provence" -> France -> French
    place = cz[0].split("#")[0].strip() if cz else ""
    area = ADJ.get(place, place)
    img = ""
    im = re.search(r"\[\[(?:Image|File):([^|\]]+)", summ.get("image", ""), re.I) or re.search(r"^\s*([^|\[\]{}]+\.(?:jpe?g|png|gif|webp))\s*$", summ.get("image", ""), re.I)
    if im:
        img = "https://en.wikibooks.org/wiki/Special:FilePath/" + urllib.parse.quote(im.group(1).strip().replace(" ", "_")) + "?width=480"
    diff = re.search(r"\d", summ.get("difficulty", ""))
    words = sum(len(x.split()) for x in steps)
    return {"id": page["pageid"], "n": page["title"].split(":", 1)[1].strip(), "c": kind, "a": area, "t": img, "g": g,
            "ni": len(ings), "ns": len(steps), "e": effort(len(ings), len(steps), words), "d": int(diff.group(0)) if diff else 0,
            "detail": {"ing": ings, "steps": steps, "serv": clean(summ.get("servings", ""))[:40], "time": clean(summ.get("time", "").replace("<br/>", ", ").replace("<br>", ", "))[:80]}}


def wikibooks():
    out, cont = [], {}
    for _ in range(200):
        params = {"action": "query", "generator": "categorymembers", "gcmtitle": "Category:Recipes", "gcmnamespace": "102", "gcmlimit": "50",
                  "gcmtype": "page", "prop": "revisions", "rvprop": "content", "rvslots": "main"}
        params.update(cont)
        j = get_json(WIKI + urllib.parse.urlencode(params))
        if j is None:
            break
        for p in (j.get("query") or {}).get("pages", []):
            r = parse_wb(p)
            if r:
                out.append(r)
        if "continue" not in j:
            break
        cont = {k: v for k, v in j["continue"].items()}
        time.sleep(1)
    return out


# Wikibooks photos are home snapshots, and most recipes have none. Wikipedia's article on the dish nearly always
# leads with a good photo picked by its editors, so use that when the dish has an article that is about food.
WP = "https://en.wikipedia.org/w/api.php?format=json&formatversion=2&"
FOODY = re.compile(r"\b(dish|dishes|food|foods|cuisine|cake|cakes|bread|breads|soup|sauce|dessert|pastry|pastries|salad|drink|beverage|cocktail|stew|"
                   r"sandwich|cookie|biscuit|pie|condiment|snack|noodle|pasta|rice|meat|chicken|fish|cheese|vegetable|fruit|confection|candy|porridge|"
                   r"pancake|dumpling|curry|spice|herb|wine|beer|tea|coffee|liqueur|egg|dip|spread|sausage|bean|legume|cooking|baked|fried|meal|"
                   r"breakfast|seafood|pudding|custard|tart|bun|flatbread|dough|frosting|icing|jam|pickle|relish|marinade|dressing|seasoning|"
                   r"casserole|omelette|roast|kebab|taco|burrito|pizza|chutney|syrup|smoothie|juice|punch|lemonade|milk|yogurt|butter|cracker|"
                   r"muffin|scone|waffle|crepe|fritter|patty|salsa|gravy|broth|chowder|risotto|stir|steak|pork|beef|lamb|mutton|duck|shrimp|prawn|"
                   r"crab|lobster|oyster|clam|mussel|squid|octopus|tofu|lentil|grain|cereal|flour|nut|almond|chocolate|caramel|ice cream|sorbet|"
                   r"preserve|appetizer|hors|street food|staple|delicacy|specialty|speciality)\b", re.I)

# lead photos that show the plant, the place or the market rather than the food
NOT_FOOD_PIC = re.compile(r"(plant|tree|leaf|leaves|flower|blossom|field|map|logo|market|harvest|farm|portrait|statue|seed|crop|orchard|vendor|stall)", re.I)


def wiki_candidates(name):
    n = re.sub(r"\s+(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+)$", "", name.strip())
    out = []
    m = re.match(r"^(.*?)\s*\((.*?)\)\s*$", n)
    parts = [m.group(1), m.group(2)] if m else [n]
    for part in parts:
        part = part.strip(" -")
        if not part or len(part) > 60:
            continue
        for t in (part, part[0].upper() + part[1:].lower()):
            if t not in out:
                out.append(t)
    return out


def wiki_photos(items):
    """Point each Wikibooks recipe at its Wikipedia dish photo when there is one. Returns how many changed."""
    want = {}
    for x in items:
        if str(x["i"]).startswith("wb"):
            for t in wiki_candidates(x["n"]):
                want.setdefault(t, [])
    titles, found = list(want), {}
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        url = WP + "action=query&prop=pageimages|description|pageprops&piprop=thumbnail|name&pithumbsize=640&pilicense=any&ppprop=disambiguation&redirects=1&titles=" + \
            urllib.parse.quote("|".join(batch))
        data = get_json(url)
        time.sleep(0.5)
        if not data or "query" not in data:
            continue
        q = data["query"]
        alias = {}
        for k in ("normalized", "redirects"):
            for r in q.get(k, []):
                # a redirect into one section of a bigger article would bring that article's photo, not this dish
                alias[r["from"]] = None if r.get("tofragment") else r["to"]
        pages = {pg["title"]: pg for pg in q.get("pages", [])}
        for t in batch:
            tt = t
            for _ in range(3):
                tt = alias.get(tt, tt) if tt else None
            pg = pages.get(tt) if tt else None
            if not pg or pg.get("missing") or "disambiguation" in pg.get("pageprops", {}):
                continue
            th, img = pg.get("thumbnail", {}).get("source", ""), pg.get("pageimage", "")
            if not th or not re.search(r"\.jpe?g$", img, re.I):
                continue
            if not FOODY.search(pg.get("description", "")) or NOT_FOOD_PIC.search(img):
                continue
            found[t] = (th, img)
        print("  wikipedia photos: %d/%d titles checked, %d found" % (min(i + 50, len(titles)), len(titles), len(found)), file=sys.stderr)
    changed = 0
    for x in items:
        if not str(x["i"]).startswith("wb"):
            continue
        for t in wiki_candidates(x["n"]):
            if t in found:
                th, img = found[t]
                if x.get("t") != th:
                    changed += 1
                x["t"], x["f"] = th, img
                break
        else:
            x.pop("f", None)
    return changed


def main():
    md = mealdb()
    wb = wikibooks()
    if not md and len(wb) < 500:
        raise SystemExit("Couldn't read the recipe sources; keeping the old index")
    if md is None:
        old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"recipes": []}
        md = [x for x in old["recipes"] if not str(x["i"]).startswith("wb")]
        print("TheMealDB unreachable; kept", len(md), "of its recipes from last time")
    names = {x["n"].lower() for x in md}
    wb = [x for x in wb if x["n"].lower() not in names]

    # skill: Wikibooks' own 1-5 difficulty where it has one; otherwise effort, split the same way for both sources
    pool = sorted(x["e"] for x in md + wb if "e" in x)
    easy_cut, hard_cut = pool[int(len(pool) * 0.35)], pool[int(len(pool) * 0.75)]
    level = lambda e: "easy" if e <= easy_cut else "hard" if e > hard_cut else "medium"
    items = []
    for x in md:
        k = x.get("k") or level(x["e"])
        items.append({"i": x["i"], "n": x["n"], "c": x["c"], "a": x["a"], "t": x["t"], "g": x["g"], "ni": x["ni"], "ns": x["ns"], "k": k})
    DETAIL.mkdir(parents=True, exist_ok=True)
    buckets = [dict() for _ in range(BUCKETS)]
    for x in wb:
        # Wikibooks' own rating, nudged up a level when the recipe is long for that rating
        if x["d"]:
            k = "easy" if x["d"] <= 2 else "medium" if x["d"] == 3 else "hard"
            if k == "easy" and x["e"] > hard_cut: k = "medium"
            elif k == "medium" and x["e"] > hard_cut: k = "hard"
        else:
            k = level(x["e"])
        items.append({"i": "wb" + str(x["id"]), "n": x["n"], "c": x["c"], "a": x["a"], "t": x["t"], "g": x["g"], "ni": x["ni"], "ns": x["ns"], "k": k})
        d = dict(x["detail"]); d["title"] = "Cookbook:" + x["n"]
        buckets[x["id"] % BUCKETS][str(x["id"])] = d
    for i, b in enumerate(buckets):
        (DETAIL / ("wb-%d.json" % i)).write_text(json.dumps(b, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    items.sort(key=lambda x: x["n"].lower())
    print("Wikipedia photos:", wiki_photos(items), "recipes updated")

    cats = sorted({x["c"] for x in items if x["c"]})
    areas = sorted({x["a"] for x in items if x["a"]})
    OUT.write_text(json.dumps({"updated": time.strftime("%Y-%m-%d"), "sources": ["TheMealDB", "Wikibooks Cookbook"], "buckets": BUCKETS,
                               "categories": cats, "areas": areas, "recipes": items}, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    counts = {k: sum(1 for x in items if x["k"] == k) for k in ("easy", "medium", "hard")}
    print("done:", len(items), "recipes (TheMealDB %d, Wikibooks %d)" % (len(md), len(wb)), counts, "|", len(cats), "kinds,", len(areas), "cuisines")


def photos_only():
    d = json.loads(OUT.read_text(encoding="utf-8"))
    n = wiki_photos(d["recipes"])
    OUT.write_text(json.dumps(d, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    have = sum(1 for x in d["recipes"] if x.get("t"))
    print("updated", n, "photos;", have, "of", len(d["recipes"]), "recipes now have one")


if __name__ == "__main__":
    photos_only() if "--photos-only" in sys.argv else main()
