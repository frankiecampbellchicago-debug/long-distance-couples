// date.html: one date idea in full, plus the dinner finder for "Order each other dinner".
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
      return all.find(it => it.name.toLowerCase() === q) || match()[0] || null;
    };
  }

  function setupMovies() {
    $("movies").hidden = false;
    const KEY = ((window.LIITA_CONFIG || {}).tmdbKey || "").trim();
    const lang = navigator.language || "en-US";
    const REGION = /-([A-Z]{2})$/.test(lang) ? lang.slice(-2) : "US";
    const status = (msg, err) => { $("movieStatus").textContent = msg; $("movieStatus").classList.toggle("err", !!err); };
    let providers = [], genres = [], sort = "top";

    // The short v3 "API Key" goes in the URL; the long v4 "Read Access Token" goes in a header.
    const tm = (path, params) => {
      const bearer = KEY.length > 40, q = new URLSearchParams(Object.assign({ language: "en-US" }, params, bearer ? {} : { api_key: KEY }));
      return fetch("https://api.themoviedb.org/3/" + path + "?" + q, bearer ? { headers: { Authorization: "Bearer " + KEY } } : {})
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
    };

    const getPlat = combo($("mPlat"), $("mPlatList"), () => providers);
    const getGenre = combo($("mGenre"), $("mGenreList"), () => genres);
    document.querySelectorAll("#movieForm .seg button").forEach(b => b.addEventListener("click", () => {
      sort = b.dataset.sort;
      document.querySelectorAll("#movieForm .seg button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    }));

    let ready = null;
    const load = () => ready || (ready = Promise.all([
      tm("watch/providers/movie", { watch_region: REGION }).then(j => {
        providers = j.results.sort((a, b) => (a.display_priority || 99) - (b.display_priority || 99))
          .map(p => ({ id: p.provider_id, name: p.provider_name, img: p.logo_path ? "https://image.tmdb.org/t/p/w92" + p.logo_path : "" }));
      }),
      tm("genre/movie/list", {}).then(j => { genres = j.genres.map(g => ({ id: g.id, name: g.name })); })
    ]).catch(e => { ready = null; throw e; }));

    if (!KEY) status("Movie search is almost ready. Check back soon.");
    else load().catch(() => status("We couldn't reach the movie database. Refresh the page to try again.", true));

    $("movieForm").addEventListener("submit", async e => {
      e.preventDefault();
      if (!KEY) { status("Movie search is almost ready. Check back soon."); return; }
      $("movieGo").disabled = true; $("movieList").innerHTML = ""; $("movieCredit").hidden = true;
      try {
        await load();
        const plat = getPlat(), genre = getGenre();
        if (!plat) { status($("mPlat").value.trim() ? "We don't have \"" + $("mPlat").value.trim() + "\" in our list. Try typing it differently, like Netflix or Max." : "Type the streaming service you want to watch on.", true); $("mPlat").focus(); return; }
        if (!genre) { status($("mGenre").value.trim() ? "We don't know \"" + $("mGenre").value.trim() + "\" as a kind of movie. Try Action, Comedy, Romance, or Horror." : "Type the kind of movie you're in the mood for.", true); $("mGenre").focus(); return; }
        $("mPlat").value = plat.name; $("mPlat").dataset.id = plat.id; $("mGenre").value = genre.name; $("mGenre").dataset.id = genre.id;
        status("Finding the top " + genre.name.toLowerCase() + " movies on " + plat.name + "…");
        const base = { watch_region: REGION, with_watch_providers: plat.id, with_watch_monetization_types: "flatrate|free|ads", with_genres: genre.id, include_adult: false };
        let movies = [];
        if (sort === "top") {
          // ratings only mean something with enough votes; loosen the bar if the service has few titles
          for (const min of [500, 100, 10]) {
            movies = (await tm("discover/movie", Object.assign({ sort_by: "vote_average.desc", "vote_count.gte": min }, base))).results;
            if (movies.length >= 10) break;
          }
        } else movies = (await tm("discover/movie", Object.assign({ sort_by: "popularity.desc" }, base))).results;
        movies = movies.slice(0, 10);
        if (!movies.length) { status("No " + genre.name.toLowerCase() + " movies are on " + plat.name + " right now. Try another kind of movie.", true); return; }
        status(movies.length < 10 ? "Only " + movies.length + " " + genre.name.toLowerCase() + " movies are on " + plat.name + " right now." : "");
        renderMovies(movies, plat);
      } catch (err) {
        status("We couldn't reach the movie database. Wait a few seconds and try again.", true);
      } finally { $("movieGo").disabled = false; }
    });

    function renderMovies(movies, plat) {
      const list = $("movieList");
      movies.forEach((m, i) => {
        const li = document.createElement("li"), year = (m.release_date || "").slice(0, 4);
        li.className = "mcard";
        li.innerHTML = '<img class="poster" alt="" loading="lazy"><div class="mbody"><div class="rtop"><h3></h3><span class="rnum"></span></div><p class="rmeta"></p><p class="ov"></p><div class="ractions"></div></div>';
        const img = li.querySelector(".poster");
        if (m.poster_path) img.src = "https://image.tmdb.org/t/p/w185" + m.poster_path; else img.removeAttribute("src");
        li.querySelector("h3").textContent = m.title;
        li.querySelector(".rnum").textContent = String(i + 1).padStart(2, "0");
        li.querySelector(".rmeta").textContent = [year, m.vote_count ? "★ " + m.vote_average.toFixed(1) + " (" + m.vote_count.toLocaleString() + " votes)" : ""].filter(Boolean).join(" · ");
        li.querySelector(".ov").textContent = m.overview || "";
        const acts = li.querySelector(".ractions");
        const btn = (txt, href, cls) => { const a = document.createElement("a"); a.className = "btn " + cls; a.textContent = txt; a.href = href; a.target = "_blank"; a.rel = "noopener"; acts.appendChild(a); };
        btn("Watch on " + plat.name, "https://www.themoviedb.org/movie/" + m.id + "/watch?locale=" + REGION, "");
        btn("Trailer", "https://www.youtube.com/results?search_query=" + encodeURIComponent(m.title + " " + year + " trailer"), "ghost");
        list.appendChild(li);
      });
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
