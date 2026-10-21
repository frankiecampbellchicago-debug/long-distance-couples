// date.html: one date idea in full, plus the dinner finder, movie finder and (in stars.js) the sky guide.
(function () {
  const $ = id => document.getElementById(id);
  const slug = new URLSearchParams(location.search).get("d");
  const all = window.DATES.filter(d => d.k !== "plus");
  const idx = all.findIndex(d => d.s === slug);
  if (idx < 0) { $("missing").hidden = false; document.title = "Date not found · Love Is In The Air"; return; }

  const d = all[idx], more = window.DATE_MORE[d.s] || {};
  document.title = d.t + " · Love Is In The Air";
  $("dIcon").innerHTML = window.dateIcon(d.i, "big", d.k);
  $("dWhere").textContent = d.where || window.DATE_WHERE[d.k];
  $("dTitle").textContent = d.t;
  $("dText").textContent = d.d;
  d.f.forEach(t => { const s = document.createElement("span"); s.textContent = t; $("dFacts").appendChild(s); });
  (more.steps || []).forEach(t => { const li = document.createElement("li"), s = document.createElement("span"); s.textContent = t; li.appendChild(s); $("dSteps").appendChild(li); });
  (more.need || []).forEach(t => { const li = document.createElement("li"); li.textContent = t; $("dNeed").appendChild(li); });
  if (more.tip) { const b = document.createElement("b"); b.textContent = "Tip: "; $("dTip").append(b, more.tip); } else $("dTip").hidden = true;
  $("soon").hidden = !more.app;

  const link = (el, label, date) => {
    el.href = "date.html?d=" + date.s;
    el.innerHTML = "<small></small><strong></strong>";
    el.firstChild.textContent = label; el.lastChild.textContent = date.t;
  };
  link($("prevLink"), "← Previous date", all[(idx - 1 + all.length) % all.length]);
  link($("nextLink"), "Next date →", all[(idx + 1) % all.length]);
  $("page").hidden = false;

  if (more.tool === "food") setupFood();
  if (more.tool === "movies") setupMovies();
  if (more.tool === "stars") window.setupStars();

  // Small type-to-search dropdown. items() returns [{id, name, img?}]; the picked id lands on input.dataset.id.
  function combo(input, listEl, items) {
    let shown = [], active = -1;
    const close = () => { listEl.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); active = -1; };
    const pick = it => { input.value = it.name; input.dataset.id = it.id; close(); };
    const match = () => {
      const q = input.value.trim().toLowerCase(), all = items();
      if (!q) return all.slice(0, 12);
      const starts = all.filter(it => it.name.toLowerCase().startsWith(q));
      return starts.concat(all.filter(it => !starts.includes(it) && it.name.toLowerCase().includes(q))).slice(0, 12);
    };
    const open = () => {
      shown = match(); listEl.innerHTML = ""; active = -1;
      shown.forEach((it, i) => {
        const li = document.createElement("li");
        li.id = listEl.id + "-" + i; li.setAttribute("role", "option"); li.setAttribute("aria-selected", "false");
        if (it.img) { const im = document.createElement("img"); im.src = it.img; im.alt = ""; im.loading = "lazy"; li.appendChild(im); }
        li.append(it.name);
        li.addEventListener("mousedown", e => { e.preventDefault(); pick(it); });
        listEl.appendChild(li);
      });
      listEl.hidden = !shown.length; input.setAttribute("aria-expanded", String(!!shown.length));
    };
    const move = d => {
      if (listEl.hidden) open();
      if (!shown.length) return;
      active = (active + d + shown.length) % shown.length;
      [...listEl.children].forEach((li, i) => li.setAttribute("aria-selected", String(i === active)));
      listEl.children[active].scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", listEl.children[active].id);
    };
    input.addEventListener("input", () => { delete input.dataset.id; open(); });
    input.addEventListener("focus", open);
    input.addEventListener("blur", () => setTimeout(close, 100));
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Escape") close();
      else if (e.key === "Enter" && !listEl.hidden && active >= 0) { e.preventDefault(); pick(shown[active]); }
    });
    // what the person meant, even if they typed instead of picking: exact name, then best match
    return () => {
      const all = items();
      if (input.dataset.id) return all.find(it => String(it.id) === input.dataset.id) || null;
      const q = input.value.trim().toLowerCase();
      if (!q) return null;
      return all.find(it => it.name.toLowerCase() === q) || match()[0] || closest(q, all);
    };
  }

  // forgive small typos ("netflx", "comdy"): nearest name start within 2 edits
  function closest(q, all) {
    const dist = (a, b) => {
      const row = Array.from({ length: b.length + 1 }, (_, i) => i);
      for (let i = 1; i <= a.length; i++) {
        let prev = row[0]; row[0] = i;
        for (let j = 1; j <= b.length; j++) { const t = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; }
      }
      return row[b.length];
    };
    let best = null, bestD = q.length < 4 ? 1 : 2;
    all.forEach(it => {
      const n = it.name.toLowerCase();
      const d = Math.min(dist(q, n.slice(0, q.length)), dist(q, n.slice(0, q.length + 1)), dist(q, n.slice(0, Math.max(1, q.length - 1))));
      if (d <= bestD && (!best || d < bestD)) { best = it; bestD = d; }
    });
    return best;
  }

  function setupMovies() {
    // Lists are prebuilt on the 10th of each month by tools/build-streaming.py into data/streaming/.
    $("movies").hidden = false;
    const status = (msg, err) => { $("movieStatus").textContent = msg; $("movieStatus").classList.toggle("err", !!err); };
    const WORD = { movie: ["movie", "movies"], tv: ["show", "shows"] };
    let index = null, kind = "movie", sort = "top";
    const files = {};

    const getPlat = combo($("mPlat"), $("mPlatList"), () => index ? index.services : []);
    const getGenre = combo($("mGenre"), $("mGenreList"), () => index ? index.genres[kind] : []);

    const seg = (sel, fn) => document.querySelectorAll(sel).forEach(b => b.addEventListener("click", () => {
      document.querySelectorAll(sel).forEach(x => x.setAttribute("aria-pressed", String(x === b))); fn(b);
    }));
    seg("#movieForm .seg button", b => { sort = b.dataset.sort; });
    seg("#movies .seg.kind button", b => {
      kind = b.dataset.kind;
      $("mGenreLabel").textContent = kind === "tv" ? "Type of show" : "Type of movie";
      $("mGenre").placeholder = kind === "tv" ? "Drama, comedy, reality…" : "Action, comedy, romance…";
      // movie and TV genres differ (TV has "Action & Adventure"), so re-match what was typed
      delete $("mGenre").dataset.id;
    });

    const ready = fetch("data/streaming/index.json", { cache: "no-cache" })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(j => { index = j; })
      .catch(() => { status("Movie and show picks are almost ready. Check back soon."); });

    $("movieForm").addEventListener("submit", async e => {
      e.preventDefault();
      await ready;
      if (!index) { status("Movie and show picks are almost ready. Check back soon."); return; }
      const plat = getPlat(), genre = getGenre(), w = WORD[kind];
      if (!plat) { status($("mPlat").value.trim() ? "We don't have \"" + $("mPlat").value.trim() + "\" yet. Try Netflix, Hulu, Max, or Prime Video." : "Type the streaming service you want to watch on.", true); $("mPlat").focus(); return; }
      if (!genre) { status($("mGenre").value.trim() ? "We don't know \"" + $("mGenre").value.trim() + "\" as a kind of " + w[0] + ". Try " + (kind === "tv" ? "Drama, Comedy, or Crime." : "Action, Comedy, Romance, or Horror.") : "Type the kind of " + w[0] + " you're in the mood for.", true); $("mGenre").focus(); return; }
      $("mPlat").value = plat.name; $("mPlat").dataset.id = plat.id; $("mGenre").value = genre.name; $("mGenre").dataset.id = genre.id;
      $("movieGo").disabled = true; $("movieList").innerHTML = ""; $("movieCredit").hidden = true;
      try {
        if (!files[plat.id]) files[plat.id] = fetch("data/streaming/" + plat.id + ".json", { cache: "no-cache" }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
        const data = await files[plat.id];
        const picks = (data.lists[kind + "|" + genre.id + "|" + sort] || []).map(k => data.titles[k]).filter(Boolean);
        if (!picks.length) { status("No " + genre.name.toLowerCase() + " " + w[1] + " are on " + plat.name + " right now. Try another kind of " + w[0] + ".", true); return; }
        status(picks.length < 10 ? "Only " + picks.length + " " + genre.name.toLowerCase() + " " + w[1] + " are on " + plat.name + " right now." : "");
        renderMovies(picks, plat);
      } catch (err) {
        files[plat.id] = null;
        status("We couldn't load that list. Refresh the page and try again.", true);
      } finally { $("movieGo").disabled = false; }
    });

    function renderMovies(picks, plat) {
      const list = $("movieList");
      picks.forEach((m, i) => {
        const li = document.createElement("li"), rtUrl = "https://www.rottentomatoes.com" + m.u;
        li.className = "mcard";
        li.innerHTML = '<img class="poster" alt="" loading="lazy" referrerpolicy="no-referrer"><div class="mbody"><div class="rtop"><h3></h3><span class="rnum"></span></div><div class="scores"></div><p class="rmeta"></p><div class="ractions"></div></div>';
        const img = li.querySelector(".poster");
        img.onerror = () => img.removeAttribute("src");
        if (m.p) img.src = m.p; else img.removeAttribute("src");
        li.querySelector("h3").textContent = m.t;
        li.querySelector(".rnum").textContent = String(i + 1).padStart(2, "0");
        li.querySelector(".rmeta").textContent = m.d || "";
        const sc = li.querySelector(".scores");
        const score = (cls, txt, title) => { const b = document.createElement("span"); b.className = "score " + cls; b.textContent = txt; b.title = title; sc.appendChild(b); };
        score("rt", "🍅 " + (m.rt != null ? m.rt + "%" : "– –") + " critics", "Rotten Tomatoes Tomatometer");
        if (m.au != null) score("mc", "🍿 " + m.au + "% audience", "Rotten Tomatoes Popcornmeter");
        const acts = li.querySelector(".ractions");
        const btn = (txt, href, cls) => { const a = document.createElement("a"); a.className = "btn " + cls; a.textContent = txt; a.href = href; a.target = "_blank"; a.rel = "noopener"; acts.appendChild(a); };
        btn("Where to watch", rtUrl + "#where-to-watch", "");
        btn("Trailer", "https://www.youtube.com/results?search_query=" + encodeURIComponent(m.t + " trailer"), "ghost");
        list.appendChild(li);
      });
      $("movieUpdated").textContent = index.updated ? "Lists updated " + new Date(index.updated + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) + "." : "";
      $("movieCredit").hidden = false;
    }
  }

  function setupFood() {
    $("food").hidden = false;
    // OpenStreetMap "cuisine" values for each choice in the menu
    const CUISINE = {
      pizza: "pizza", burger: "burger", sushi: "sushi|japanese|ramen|poke", chinese: "chinese|dim_sum|dumpling|szechuan|cantonese",
      mexican: "mexican|tex-mex|taco|burrito", italian: "italian|pasta", thai: "thai", indian: "indian|nepalese|pakistani|bangladeshi",
      med: "mediterranean|greek|lebanese|turkish|middle_eastern|falafel|kebab|persian", korean: "korean", vietnamese: "vietnamese|pho",
      chicken: "chicken|wings|fried_chicken", sandwich: "sandwich|deli|bagel|sub", breakfast: "breakfast|brunch|pancake|diner",
      dessert: "dessert|ice_cream|donut|cake|frozen_yogurt|bakery|crepe"
    };
    const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
    const RADII = [2500, 6000, 12000];
    const sel = $("cuisine");
    try { const saved = localStorage.getItem("liita-food"); if (saved && sel.querySelector('option[value="' + saved + '"]')) sel.value = saved; } catch (e) {}

    const status = (msg, err) => { $("foodStatus").textContent = msg; $("foodStatus").classList.toggle("err", !!err); };

    $("foodForm").addEventListener("submit", async e => {
      e.preventDefault();
      const q = $("addr").value.trim();
      if (q.length < 4) { status("Type the street address and city you're sending dinner to.", true); $("addr").focus(); return; }
      try { localStorage.setItem("liita-food", sel.value); } catch (e2) {}
      $("foodGo").disabled = true; $("foodList").innerHTML = ""; $("foodNear").hidden = true; $("foodCredit").hidden = true;
      try {
        status("Finding that address…");
        const place = await geocode(q);
        if (!place) { status("We couldn't find that address. Try adding the city and zip code.", true); return; }
        $("foodNear").innerHTML = "Showing places near <b></b>";
        $("foodNear").lastChild.textContent = place.label;
        $("foodNear").hidden = false;
        status("Looking for " + (sel.value === "any" ? "places" : sel.options[sel.selectedIndex].text.toLowerCase() + " places") + " nearby…");
        const picks = await findPlaces(place, sel.value);
        if (!picks.length) { status("No " + (sel.value === "any" ? "" : sel.options[sel.selectedIndex].text.toLowerCase() + " ") + "places turned up near there. Try another type of food.", true); return; }
        status(picks.length < 10 ? "We found " + picks.length + " places nearby." : "");
        render(picks, place);
      } catch (err) {
        status("Something went wrong reaching the map service. Wait a few seconds and try again.", true);
      } finally { $("foodGo").disabled = false; }
    });

    async function geocode(q) {
      try {
        const r = await fetch("https://photon.komoot.io/api/?limit=1&lang=en&q=" + encodeURIComponent(q));
        const f = (await r.json()).features[0];
        if (f) {
          const p = f.properties, street = [p.housenumber, p.street].filter(Boolean).join(" ") || p.name;
          return { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], city: p.city || p.county || "",
                   label: [street, p.city, p.state, p.postcode].filter(Boolean).join(", ") };
        }
      } catch (e) {}
      const r = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=" + encodeURIComponent(q));
      const n = (await r.json())[0];
      if (!n) return null;
      const a = n.address || {};
      return { lat: +n.lat, lon: +n.lon, city: a.city || a.town || a.village || "", label: n.display_name.split(", ").slice(0, 4).join(", ") };
    }

    async function overpass(query, signal) {
      for (const url of OVERPASS) {
        try {
          const r = await fetch(url, { method: "POST", signal, body: "data=" + encodeURIComponent(query), headers: { "Content-Type": "application/x-www-form-urlencoded" } });
          if (r.ok) return (await r.json()).elements;
        } catch (e) { if (signal.aborted) break; }
      }
      throw new Error("overpass");
    }

    // Detailed search: OpenStreetMap restaurant data with cuisine, website and delivery tags.
    // The public Overpass servers are often busy, so this gets a time limit.
    async function detailedSearch(place, kind, signal) {
      const amen = kind === "dessert" ? "restaurant|fast_food|ice_cream|cafe" : "restaurant|fast_food";
      const filter = kind === "vegan" ? '["diet:vegan"~"yes|only"]' : CUISINE[kind] ? '["cuisine"~"' + CUISINE[kind] + '",i]' : "";
      let best = [];
      for (const r of RADII) {
        const q = '[out:json][timeout:15];nwr(around:' + r + "," + place.lat + "," + place.lon + ')["amenity"~"^(' + amen + ')$"]["name"]' + filter + ";out center tags 400;";
        best = rank(await overpass(q, signal), place);
        if (best.length >= 10) break;
      }
      return best.slice(0, 10);
    }

    // Quick search: Photon matches restaurant names near the address. Always fast, less detail.
    const WORDS = {
      any: ["restaurant", "grill", "kitchen", "pizza", "tacos", "sushi"], pizza: ["pizza", "pizzeria"], burger: ["burger"],
      sushi: ["sushi", "ramen", "japanese"], chinese: ["chinese", "wok", "dumpling", "szechuan"], mexican: ["taco", "taqueria", "mexican", "burrito"],
      italian: ["italian", "trattoria", "pasta", "osteria"], thai: ["thai"], indian: ["indian", "curry", "tandoor", "masala"],
      med: ["mediterranean", "gyro", "falafel", "kebab", "shawarma", "greek"], korean: ["korean", "bbq", "bibimbap"], vietnamese: ["pho", "vietnamese", "banh mi"],
      chicken: ["chicken", "wings"], sandwich: ["sandwich", "deli", "subs"], breakfast: ["breakfast", "pancake", "diner", "brunch"],
      dessert: ["ice cream", "dessert", "donut", "bakery", "gelato"], vegan: ["vegan", "plant"]
    };
    async function quickSearch(place, kind) {
      const dLat = 0.075, dLon = 0.075 / Math.cos(place.lat * Math.PI / 180);
      const box = [place.lon - dLon, place.lat - dLat, place.lon + dLon, place.lat + dLat].map(n => n.toFixed(4)).join(",");
      const tags = ["amenity:restaurant", "amenity:fast_food"].concat(kind === "dessert" ? ["amenity:ice_cream", "amenity:cafe", "shop:bakery"] : []);
      const urls = (WORDS[kind] || WORDS.any).map(w => "https://photon.komoot.io/api/?limit=40&lang=en&lat=" + place.lat + "&lon=" + place.lon +
        "&bbox=" + box + "&q=" + encodeURIComponent(w) + tags.map(t => "&osm_tag=" + t).join(""));
      const sets = await Promise.all(urls.map(u => fetch(u).then(r => r.json()).then(j => j.features).catch(() => [])));
      const els = [].concat(...sets).filter(f => f.properties.name).map(f => {
        const p = f.properties;
        return { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0],
                 tags: { name: p.name, amenity: p.osm_value, "addr:housenumber": p.housenumber, "addr:street": p.street, "addr:city": p.city } };
      });
      return rank(els, place).slice(0, 10);
    }

    async function findPlaces(place, kind) {
      const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 8000);
      const quick = quickSearch(place, kind);
      try {
        const detailed = await detailedSearch(place, kind, ctrl.signal);
        if (detailed.length >= 10) return detailed;
        const extra = (await quick).filter(q => !detailed.some(d => d.t.name.toLowerCase() === q.t.name.toLowerCase()));
        return detailed.concat(extra).sort((a, b) => a.score - b.score).slice(0, 10);
      } catch (e) {
        return quick;
      } finally { clearTimeout(timer); }
    }

    function rank(els, place) {
      const seen = new Map();
      els.forEach(el => {
        const t = el.tags || {}, lat = el.lat || (el.center && el.center.lat), lon = el.lon || (el.center && el.center.lon);
        if (!lat || t.delivery === "no" || t.disused || t["disused:amenity"]) return;
        const mi = miles(place.lat, place.lon, lat, lon);
        // delivery listed first, then places with a website or menu, then nearest
        const score = mi + (t.delivery === "yes" ? 0 : 1.2) + (t["website:menu"] || t.website || t["contact:website"] ? 0 : 0.6);
        const key = t.name.toLowerCase();
        const prev = seen.get(key);
        if (!prev || score < prev.score) seen.set(key, { t, mi, score });
      });
      return [...seen.values()].sort((a, b) => a.score - b.score);
    }

    function miles(a, b, c, d) {
      const R = 3958.8, r = x => x * Math.PI / 180, dl = r(c - a), dn = r(d - b);
      const h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dn / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    }

    const nice = v => v.split(/[;,]/)[0].replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const safeUrl = u => { try { const x = new URL(/^https?:/i.test(u) ? u : "https://" + u); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch (e) { return ""; } };

    function render(picks, place) {
      const list = $("foodList");
      picks.forEach((p, i) => {
        const t = p.t, li = document.createElement("li");
        li.className = "rcard";
        const addr = [[t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "), t["addr:city"]].filter(Boolean).join(", ");
        const menu = safeUrl(t["website:menu"] || t["menu:url"] || "");
        const site = safeUrl(t.website || t["contact:website"] || "");
        const where = [t.name, addr || place.city].filter(Boolean).join(" ");
        li.innerHTML = '<div class="rtop"><h3></h3><span class="rnum"></span></div><p class="rmeta"></p><div class="badges"></div><div class="ractions"></div>';
        li.querySelector("h3").textContent = t.name;
        li.querySelector(".rnum").textContent = String(i + 1).padStart(2, "0");
        li.querySelector(".rmeta").textContent = [t.cuisine ? nice(t.cuisine) : t.amenity === "fast_food" ? "Quick bites" : "Restaurant", p.mi.toFixed(1) + " mi away", addr].filter(Boolean).join(" · ");
        const badges = li.querySelector(".badges");
        const badge = (txt, ok) => { const b = document.createElement("span"); b.className = "badge" + (ok ? " ok" : ""); b.textContent = txt; badges.appendChild(b); };
        if (t.delivery === "yes") badge("Delivers", true);
        if (t.takeaway === "yes" || t.takeaway === "only") badge("Takeout");
        if (t["diet:vegan"] === "yes" || t["diet:vegan"] === "only") badge("Vegan options");
        if (t.opening_hours) badge(t.opening_hours.length > 42 ? "Hours listed" : t.opening_hours);
        if (!badges.children.length) badges.remove();
        const acts = li.querySelector(".ractions");
        const btn = (txt, href, cls) => { const a = document.createElement("a"); a.className = "btn " + cls; a.textContent = txt; a.href = href; a.target = "_blank"; a.rel = "noopener"; acts.appendChild(a); };
        btn("Order on Uber Eats", "https://www.ubereats.com/search?q=" + encodeURIComponent(t.name), "");
        btn("See the menu", menu || "https://www.google.com/search?q=" + encodeURIComponent(where + " menu"), "ghost");
        if (site && site !== menu) btn("Website", site, "ghost");
        list.appendChild(li);
      });
      $("foodCredit").hidden = false;
    }
  }
})();
