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
  if (more.alt) { $("dAltText").textContent = more.alt; $("dAlt").hidden = false; }

  // Extra bonus: questions from one Deep Talks topic to answer during the date
  const talk = more.talks && window.DEEP_TALKS && window.DEEP_TALKS[more.talks];
  if (talk) {
    let qi = Math.floor(Math.random() * talk.q.length);
    const showQ = () => { $("bonusQ").textContent = talk.q[qi % talk.q.length]; };
    $("bonusSub").textContent = "While you're out there, take turns answering a question from the “" + more.talks + "” topic.";
    $("bonusNext").addEventListener("click", () => { qi++; showQ(); });
    showQ();
    $("dBonus").hidden = false;
  }

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
  if (more.tool === "museums") setupMuseums();
  if (more.tool === "city") window.setupCityTour();
  if (more.tool === "recipes") setupRecipes();
  if (more.tool === "post") setupPost();
  if (more.tool === "books") setupBooks();
  if (more.tool === "escape") window.setupEscapeRooms();
  if (more.tool === "classes") window.setupClasses();
  if (more.tool === "board") { $("boardWrap").hidden = false; if (window.openTripBoard) window.openTripBoard(); window.setupMeetup(); }

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

  function setupRecipes() {
    $("recipes").hidden = false;
    const API = "https://www.themealdb.com/api/json/v1/1/", PAGE = 9;
    const status = (msg, err) => { $("recipeStatus").textContent = msg; $("recipeStatus").classList.toggle("err", !!err); };
    const get = path => fetch(API + path).then(r => r.json()).then(j => Array.isArray(j.meals) ? j.meals : []);
    let found = [], count = 0, lists = null;

    // Recipe index (data/recipes.json, built by tools/build-recipes.py) lets us filter by kind of food and skill level
    // instantly. If it can't load, searching still works straight from TheMealDB, just without those filters.
    const NICE = { France: "French", India: "Indian", Argentina: "Argentine", Netherlands: "Dutch", Norway: "Norwegian", Slovakia: "Slovak",
      Venezuela: "Venezuelan", "United States": "American", "Saudi Arabian": "Saudi" };
    const nice = a => NICE[a] || a;
    let index = null;
    const ready = fetch("data/recipes.json", { cache: "no-cache" }).then(r => r.ok ? r.json() : null).catch(() => null).then(j => {
      index = j && Array.isArray(j.recipes) ? j : null;
      if (!index) { $("recipeKind").disabled = $("recipeSkill").disabled = true; return; }
      const sel = $("recipeKind");
      const group = (label, items, prefix, show) => {
        const g = document.createElement("optgroup"); g.label = label;
        items.forEach(x => { const o = document.createElement("option"); o.value = prefix + x; o.textContent = show(x); g.appendChild(o); });
        sel.appendChild(g);
      };
      group("Type of dish", index.categories, "c:", x => x === "Miscellaneous" ? "Something different" : x);
      group("Cuisine", index.areas.slice().sort((a, b) => nice(a).localeCompare(nice(b))), "a:", nice);
    });
    const asMeal = r => ({ idMeal: r.i, strMeal: r.n, strCategory: r.c, strArea: r.a, strMealThumb: r.t, photoFile: r.f, skill: r.k, ni: r.ni, ns: r.ns });
    // Wikibooks recipes ("wb123") are saved in data/recipes/wb-N.json; TheMealDB ones load from TheMealDB
    const buckets = {};
    async function fullRecipe(m) {
      const extra = { skill: m.skill, ni: m.ni, ns: m.ns };
      if (String(m.idMeal).startsWith("wb")) {
        const id = String(m.idMeal).slice(2), n = (index && index.buckets) || 32, b = +id % n;
        if (!buckets[b]) buckets[b] = fetch("data/recipes/wb-" + b + ".json").then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
        let d;
        try { d = (await buckets[b])[id]; } catch (e) { buckets[b] = null; }
        if (!d) return null;
        return Object.assign({}, m, extra, { ings: d.ing, steps: d.steps, serv: d.serv, time: d.time,
          wiki: "https://en.wikibooks.org/wiki/" + encodeURIComponent(d.title.replace(/ /g, "_")).replace(/%3A/g, ":") });
      }
      if (m.strInstructions) return Object.assign({}, m, extra);
      const [full] = await get("lookup.php?i=" + m.idMeal);
      return full ? Object.assign(full, extra) : null;
    }

    // best photos first: TheMealDB's styled shots, then Wikipedia's dish photos, then home snapshots from Wikibooks
    const pic = r => !r.t ? 0 : /themealdb/.test(r.t) ? 3 : r.f ? 2 : 1;
    // recipes that match what's typed and picked, best matches first
    function matches(q) {
      const kindV = $("recipeKind").value, skill = $("recipeSkill").value;
      const words = q.toLowerCase().split(/[^a-z0-9À-ɏ]+/).filter(w => w.length > 1).map(w => w.replace(/(es|s)$/, ""));
      return index.recipes.map(r => {
        if (kindV && !(kindV === "c:" + r.c || kindV === "a:" + r.a)) return null;
        if (skill && r.k !== skill) return null;
        if (!words.length) return { r, score: 0 };
        const name = r.n.toLowerCase(), meta = (r.c + " " + r.a + " " + nice(r.a)).toLowerCase();
        let score = 0;
        for (const w of words) {
          const hit = name.includes(w) ? 3 : r.g.some(g => g.includes(w)) ? 2 : meta.includes(w) ? 2 : 0;
          if (!hit) return null;
          score += hit;
        }
        return { r, score };
      }).filter(Boolean).sort((a, b) => b.score - a.score || pic(b.r) - pic(a.r) || a.r.n.localeCompare(b.r.n)).map(x => x.r);
    }
    const describe = q => {
      const k = $("recipeKind"), sk = $("recipeSkill").value;
      // "13 medium dessert recipes for “chocolate”", "21 Italian recipes"
      const kindText = k.value ? (k.value.startsWith("a:") ? k.options[k.selectedIndex].text : k.options[k.selectedIndex].text.toLowerCase()) : "";
      return { what: [sk ? SKILL[sk].toLowerCase() : "", kindText].filter(Boolean).join(" "), q: q ? " for “" + q + "”" : "" };
    };

    $("recipeForm").addEventListener("submit", async e => {
      e.preventDefault();
      await ready;
      const q = $("recipeQ").value.trim(), filtered = index && ($("recipeKind").value || $("recipeSkill").value);
      if (q.length < 2 && !filtered) { status("Type a dish or an ingredient, pick a kind of food, or hit Surprise us.", true); $("recipeQ").focus(); return; }
      if (!index) { liveSearch(q); return; }
      clear();
      found = matches(q).map(asMeal);
      const d = describe(q), what = d.what ? d.what + " " : "";
      if (!found.length) { status("No " + what + "recipes" + d.q + ". Try changing the kind of food or skill level, or hit Surprise us.", true); return; }
      status(found.length + " " + what + "recipe" + (found.length > 1 ? "s" : "") + d.q + " to choose from.");
      more();
    });
    // picking from a dropdown searches right away
    ["recipeKind", "recipeSkill"].forEach(id => $(id).addEventListener("change", () => $("recipeForm").requestSubmit()));

    async function liveSearch(q) {
      $("recipeGo").disabled = true; clear(); status("Looking for " + q + " recipes…");
      try {
        // dishes by name, plus dishes that use it as an ingredient ("chicken" finds both)
        const ing = s => s.toLowerCase().trim().replace(/\s+/g, "_");
        const sets = await Promise.all([get("search.php?s=" + encodeURIComponent(q)), get("filter.php?i=" + encodeURIComponent(ing(q))), get("filter.php?i=" + encodeURIComponent(ing(q).replace(/e?s$/, "")))]);
        const seen = new Set();
        found = [].concat(...sets).filter(m => !seen.has(m.idMeal) && seen.add(m.idMeal));
        if (!found.length) { status("No recipes for “" + q + "”. Try one ingredient, like beef, rice or cheese, or hit Surprise us.", true); return; }
        status(found.length + " recipe" + (found.length > 1 ? "s" : "") + " to choose from.");
        more();
      } catch (err) {
        status("We couldn't reach the recipe site. Wait a few seconds and try again.", true);
      } finally { $("recipeGo").disabled = false; }
    }

    $("recipeRandom").addEventListener("click", async () => {
      $("recipeRandom").disabled = true; clear();
      try {
        await ready;
        let m;
        if (index) {
          // a surprise that still fits the kind of food and skill level you picked
          const all = matches($("recipeQ").value.trim()), good = all.filter(r => pic(r) >= 2);
          const pool = good.length >= 5 ? good : all;  // prefer ones with a good photo when there are enough
          if (!pool.length) { status("Nothing fits those choices. Change the kind of food or skill level and try again.", true); return; }
          m = asMeal(pool[Math.floor(Math.random() * pool.length)]);
          m = (await fullRecipe(m)) || m;
        } else [m] = await get("random.php");
        status("Tonight's challenge: you both cook this. Not feeling it? Hit Surprise us again.");
        const li = card(m); $("recipeList").appendChild(li); open(li, m);
        $("recipeCredit").hidden = false;
      } catch (err) {
        status("We couldn't reach the recipe site. Wait a few seconds and try again.", true);
      } finally { $("recipeRandom").disabled = false; }
    });
    $("recipeMore").addEventListener("click", more);

    function clear() { $("recipeList").innerHTML = ""; found = []; count = 0; $("recipeMore").hidden = true; }
    function more() {
      found.slice(count, count + PAGE).forEach(m => $("recipeList").appendChild(card(m)));
      count = Math.min(count + PAGE, found.length);
      $("recipeMore").hidden = count >= found.length;
      $("recipeMore").textContent = "Show more (" + (found.length - count) + ")";
      $("recipeCredit").hidden = false;
    }

    const kind = m => [nice(m.strArea || ""), m.strCategory].filter(x => x && x !== "Unknown").join(" \u00b7 ");
    const SKILL = { easy: "Easy", medium: "Medium", hard: "Hard" };
    function skillTag(li, m) {
      if (!m.skill) return;
      const t = document.createElement("span");
      t.className = "skill " + m.skill; t.textContent = SKILL[m.skill];
      t.title = m.ni + " ingredients, about " + m.ns + " steps";
      li.querySelector(".rkind").append(" ", t);
    }
    function card(m) {
      const li = document.createElement("li");
      li.className = "recipe";
      li.innerHTML = '<div class="rpic"><img alt="" loading="lazy"></div><div class="rbody"><h4></h4><p class="rkind"></p><div class="ractions"><button type="button" class="btn">See the recipe</button></div></div>';
      const img = li.querySelector("img"), thumb = m.strMealThumb || "";
      const noPic = () => { const pic = li.querySelector(".rpic"); pic.classList.add("none"); pic.innerHTML = window.dateIcon ? window.dateIcon("pan", "", "together") : ""; pic.setAttribute("aria-hidden", "true"); };
      if (!thumb) noPic();
      else if (/themealdb/.test(thumb)) { img.src = thumb + "/medium"; img.onerror = () => { img.onerror = noPic; img.src = thumb; }; }
      else { img.src = thumb; img.onerror = noPic; }
      li.querySelector("h4").textContent = m.strMeal;
      li.querySelector(".rkind").textContent = kind(m);
      skillTag(li, m);
      li.querySelector(".ractions .btn").addEventListener("click", async () => {
        if (li.classList.contains("open")) { close(li); return; }
        let full = null;
        try { full = await fullRecipe(m); } catch (e) {}
        if (!full) { status("We couldn't load that recipe. Try again.", true); return; }
        open(li, full);
      });
      return li;
    }

    function close(li) {
      li.classList.remove("open");
      const f = li.querySelector(".rfull"); if (f) f.remove();
      li.querySelectorAll(".ractions a, .ractions .copy").forEach(x => x.remove());
      li.querySelector(".ractions .btn").textContent = "See the recipe";
    }

    function open(li, m) {
      li.classList.add("open");
      li.querySelector(".ractions .btn").textContent = "Hide recipe";
      li.querySelector(".rkind").textContent = kind(m);
      skillTag(li, m);
      const ings = [];
      if (m.ings) m.ings.forEach(x => ings.push(["", x]));
      else for (let i = 1; i <= 20; i++) {
        const n = (m["strIngredient" + i] || "").trim(), q = (m["strMeasure" + i] || "").trim();
        if (n) ings.push([q, n]);
      }
      const steps = m.steps || (m.strInstructions || "").split(/\r?\n+/).map(x => x.replace(/^(step\s*)?\d+[.):]?\s*/i, "").trim()).filter(x => x.length > 2 && !/^step\s*\d*$/i.test(x));
      const full = document.createElement("div");
      full.className = "rfull";
      full.innerHTML = '<div><h5>Ingredients</h5><ul class="ings"></ul></div><div><h5>How to make it</h5><ol class="howto"></ol></div>';
      ings.forEach(([q, n]) => { const x = document.createElement("li"), b = document.createElement("b"); b.textContent = q ? q + " " : ""; x.append(b, n); full.querySelector(".ings").appendChild(x); });
      steps.forEach(t => { const x = document.createElement("li"); x.textContent = t; full.querySelector(".howto").appendChild(x); });
      const acts = li.querySelector(".ractions");
      li.querySelector(".rbody").insertBefore(full, acts);
      const facts = [m.serv ? "Serves " + m.serv : "", m.time ? m.time : ""].filter(Boolean).join(" \u00b7 ");
      if (facts) { const f = document.createElement("p"); f.className = "rfacts"; f.textContent = facts; full.prepend(f); }
      acts.querySelectorAll("a, .copy").forEach(x => x.remove());
      const copy = document.createElement("button");
      copy.type = "button"; copy.className = "btn ghost copy"; copy.textContent = "Copy shopping list";
      copy.addEventListener("click", async () => {
        const text = m.strMeal + " shopping list:\n" + ings.map(([q, n]) => "- " + (q ? q + " " : "") + n).join("\n");
        try { await navigator.clipboard.writeText(text); copy.textContent = "Copied \u2713"; setTimeout(() => { copy.textContent = "Copy shopping list"; }, 2500); }
        catch (e) { status("Couldn't copy. Select the ingredients and copy them by hand.", true); }
      });
      acts.appendChild(copy);
      const link = (txt, href) => { if (!/^https?:\/\//i.test(href || "")) return; const a = document.createElement("a"); a.className = "btn ghost"; a.textContent = txt; a.href = href; a.target = "_blank"; a.rel = "noopener"; acts.appendChild(a); };
      link("Watch how", m.strYoutube);
      link("Original recipe", m.strSource);
      if (m.wiki) {
        link("On Wikibooks", m.wiki);
        const c = document.createElement("p");
        c.className = "rcredit";
        c.innerHTML = 'Recipe from the <a target="_blank" rel="noopener">Wikibooks Cookbook</a>, shared under <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>.';
        c.querySelector("a").href = m.wiki;
        if (m.photoFile) {
          const a = document.createElement("a");
          a.href = "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(m.photoFile.replace(/ /g, "_"));
          a.target = "_blank"; a.rel = "noopener"; a.textContent = "Wikimedia Commons";
          c.append(" Photo from Wikipedia, via ", a, ".");
        }
        full.appendChild(c);
      }
    }
  }

  function setupPost() {
    $("post").hidden = false;
    const status = (msg, err) => { $("postStatus").textContent = msg; $("postStatus").classList.toggle("err", !!err); };
    // post offices go by many names: "Post Office", "USPS", "Canada Post", "Royal Mail", "La Poste", "Correos"...
    // Ask for just the words that fit the country, so each search stays light on the free map service.
    const LOCAL = { us: "usps", fr: "poste", be: "poste", ch: "poste", lu: "poste", it: "poste", es: "correos", mx: "correos", ar: "correos", co: "correos", cl: "correos", pe: "correos", br: "correio", pt: "correio" };
    const wordsFor = cc => ["post", "mail"].concat(LOCAL[(cc || "").toLowerCase()] || []);
    const getJson = async url => {
      const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 9000);
      try { const r = await fetch(url, { signal: ctrl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
      finally { clearTimeout(timer); }
    };

    $("postForm").addEventListener("submit", async e => {
      e.preventDefault();
      const q = $("postAddr").value.trim();
      if (q.length < 4) { status("Type your street address and city, or use your location.", true); $("postAddr").focus(); return; }
      $("postGo").disabled = true;
      try {
        status("Finding that address…");
        let home = null;
        try {
          const f = (await getJson("https://photon.komoot.io/api/?limit=1&lang=en&q=" + encodeURIComponent(q))).features[0];
          if (f) { const p = f.properties; home = { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], country: p.countrycode || "", label: [[p.housenumber, p.street].filter(Boolean).join(" ") || p.name, p.city].filter(Boolean).join(", ") }; }
        } catch (e2) {}
        if (!home) {
          const n = (await getJson("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=" + encodeURIComponent(q)))[0];
          if (n) home = { lat: +n.lat, lon: +n.lon, country: (n.address && n.address.country_code) || "", label: n.display_name.split(", ").slice(0, 3).join(", ") };
        }
        if (!home) { status("We couldn't find that address. Try adding the city and zip code.", true); return; }
        await search(home);
      } catch (err) {
        status("We couldn't reach the map service. Wait a few seconds and try again.", true);
      } finally { $("postGo").disabled = false; }
    });

    $("postHere").addEventListener("click", () => {
      if (!navigator.geolocation) { status("Your browser can't share your location. Type your address instead.", true); return; }
      status("Getting your location…");
      navigator.geolocation.getCurrentPosition(
        pos => getJson("https://photon.komoot.io/reverse?lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude).then(j => (j.features[0] || { properties: {} }).properties.countrycode).catch(() => "")
          .then(cc => search({ lat: pos.coords.latitude, lon: pos.coords.longitude, country: cc || "", label: "your location" }))
          .catch(() => status("We couldn't reach the map service. Wait a few seconds and try again.", true)),
        () => status("We couldn't get your location. Type your address instead.", true),
        { timeout: 10000, maximumAge: 300000 });
    });

    async function search(home) {
      status("Looking for post offices near " + home.label + "…");
      let found = [];
      for (const d of [0.08, 0.3]) {
        const dLon = d / Math.cos(home.lat * Math.PI / 180);
        const box = [home.lon - dLon, home.lat - d, home.lon + dLon, home.lat + d].map(n => n.toFixed(4)).join(",");
        const sets = await Promise.all(wordsFor(home.country).map(w => getJson("https://photon.komoot.io/api/?limit=25&lang=en&osm_tag=amenity:post_office&lat=" + home.lat + "&lon=" + home.lon + "&bbox=" + box + "&q=" + encodeURIComponent(w))
          .then(j => j.features).catch(() => [])));
        const seen = new Set();
        found = [].concat(...sets).map(f => {
          const p = f.properties, lat = f.geometry.coordinates[1], lon = f.geometry.coordinates[0];
          return { name: p.name || "Post office", lat, lon, mi: miles(home.lat, home.lon, lat, lon),
                   addr: [[p.housenumber, p.street].filter(Boolean).join(" "), p.city || p.district, p.postcode].filter(Boolean).join(", "), id: p.osm_type + p.osm_id };
        }).filter(x => !seen.has(x.id) && seen.add(x.id)).sort((a, b) => a.mi - b.mi);
        if (found.length >= 3) break;
      }
      if (!found.length) { status("We couldn't find a post office near " + home.label + ". Try a nearby town, or search \u201cpost office\u201d in your maps app.", true); $("postResult").hidden = true; return; }
      status("");
      render(home, found.slice(0, 5));
    }

    function miles(a, b, c, d) {
      const R = 3958.8, r = x => x * Math.PI / 180, dl = r(c - a), dn = r(d - b);
      const h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dn / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    }

    function showMap(home, po) {
      const pad = 0.004, s = Math.min(home.lat, po.lat) - pad, n = Math.max(home.lat, po.lat) + pad;
      const padLon = pad / Math.cos(home.lat * Math.PI / 180), w = Math.min(home.lon, po.lon) - padLon, e = Math.max(home.lon, po.lon) + padLon;
      $("postMap").src = "https://www.openstreetmap.org/export/embed.html?bbox=" + [w, s, e, n].map(x => x.toFixed(5)).join("%2C") + "&layer=mapnik&marker=" + po.lat.toFixed(6) + "%2C" + po.lon.toFixed(6);
      $("postMap").title = "Map showing " + po.name;
    }

    function render(home, list) {
      // miles in the US and UK, kilometers everywhere else
      const metric = home.country && !/^(us|gb|lr|mm)$/i.test(home.country);
      const dist = mi => metric ? (mi * 1.609).toFixed(1) + " km" : mi.toFixed(1) + " mi";
      const ol = $("postList"); ol.innerHTML = "";
      list.forEach((po, i) => {
        const li = document.createElement("li");
        if (i === 0) li.className = "best";
        li.innerHTML = (i === 0 ? '<span class="pbadge">Closest to you</span>' : "") + '<div class="ptop"><h4></h4><span class="pdist"></span></div><p class="paddr"></p><div class="slinks"></div>';
        li.querySelector("h4").textContent = po.name;
        li.querySelector(".pdist").textContent = dist(po.mi) + " away";
        li.querySelector(".paddr").textContent = po.addr || "";
        const links = li.querySelector(".slinks");
        const add = (txt, href) => { const a = document.createElement("a"); a.textContent = txt; a.href = href; a.target = "_blank"; a.rel = "noopener"; links.appendChild(a); };
        add("Directions", "https://www.google.com/maps/dir/?api=1&origin=" + home.lat + "," + home.lon + "&destination=" + po.lat + "," + po.lon + "&travelmode=" + (po.mi < 1 ? "walking" : "driving"));
        add("Hours", "https://www.google.com/search?q=" + encodeURIComponent(po.name + " " + po.addr + " hours"));
        const b = document.createElement("button"); b.type = "button"; b.className = "showmap"; b.textContent = "Show on map";
        b.addEventListener("click", () => showMap(home, po));
        links.appendChild(b);
        ol.appendChild(li);
      });
      showMap(home, list[0]);
      $("postResult").hidden = false; $("postCredit").hidden = false;
    }
  }

  function setupBooks() {
    $("books").hidden = false;
    const API = "https://openlibrary.org/search.json?fields=key,title,author_name,first_publish_year,cover_i,number_of_pages_median,ratings_average,ratings_count,ebook_access&", PAGE = 8;
    const status = (msg, err) => { $("bookStatus").textContent = msg; $("bookStatus").classList.toggle("err", !!err); };
    // Genres for the dropdown: [name, Open Library subject]. Searches are ranked by how many readers have the book on their shelves.
    const GENRES = [["Romance", "romance"], ["Contemporary romance", "contemporary romance"], ["Mystery", "fiction, mystery & detective, general"],
      ["Thriller", "fiction, thrillers, general"], ["Crime", "fiction, crime"], ["Horror", "fiction, horror"], ["Fantasy", "fiction, fantasy, general"],
      ["Science fiction", "fiction, science fiction, general"], ["Dystopian", "fiction, dystopian"], ["Historical fiction", "historical fiction"],
      ["Literary fiction", "literary fiction"], ["Classics", "classics"], ["Young adult", "young adult fiction"], ["Funny books", "fiction, humorous"],
      ["Psychological fiction", "fiction, psychological"], ["Short stories", "fiction, short stories (single author)"], ["Poetry", "poetry"],
      ["Biography & memoir", "biography & autobiography"], ["Self-help", "self-actualization (psychology)"], ["Spirituality", "spiritual life"],
      ["History", "world history"], ["Philosophy", "philosophy"], ["Cooking", "cookery"]];
    // words people type that mean one of those genres
    const WORDS = { romance: 0, love: 0, "romantic": 0, "rom com": 1, "romcom": 1, mystery: 2, detective: 2, whodunit: 2, thriller: 3, suspense: 3, crime: 4, horror: 5, scary: 5,
      fantasy: 6, "science fiction": 7, "sci-fi": 7, "sci fi": 7, scifi: 7, dystopia: 8, dystopian: 8, "historical fiction": 9, "literary fiction": 10, classic: 11,
      "young adult": 12, ya: 12, "teen": 12, funny: 13, humor: 13, humour: 13, comedy: 13, psychological: 14, "short stor": 15, poetry: 16, poem: 16,
      biograph: 17, memoir: 17, autobiograph: 17, "self-help": 18, "self help": 18, "self improvement": 18, spiritual: 19, history: 20, philosoph: 21, cook: 22, recipe: 22 };
    const sel = $("bookGenre");
    GENRES.forEach(([name], i) => { const o = document.createElement("option"); o.value = i; o.textContent = name; sel.appendChild(o); });
    sel.addEventListener("change", () => { if (sel.value !== "") $("bookForm").requestSubmit(); });
    let found = [], count = 0;

    $("bookForm").addEventListener("submit", async e => {
      e.preventDefault();
      let q = $("bookQ").value.trim();
      const free = $("bookFree").checked, short = $("bookShort").checked;
      // typing just a genre ("mysteries", "sci-fi books") picks it in the dropdown
      const ql = q.toLowerCase().replace(/\s*(books?|novels?|stories)$/, "").replace(/(ie)?s$/, m => m === "ies" ? "y" : "");
      // exact genre words only, plus a few word stems ("biographies", "cookbooks"), so titles like "Love Hypothesis" stay title searches
      const STEMS = ["biograph", "autobiograph", "philosoph", "short stor", "spiritual", "cook"];
      const typed = Object.keys(WORDS).find(k => ql === k || (STEMS.includes(k) && ql.startsWith(k) && ql.split(" ").length <= 2));
      if (typed !== undefined && ql) { sel.value = WORDS[typed]; $("bookQ").value = q = ""; }
      const g = sel.value === "" ? null : GENRES[+sel.value];
      if (q.length < 2 && !g && !free) { status("Type a title or author, or pick a genre.", true); $("bookQ").focus(); return; }
      let query = [q, g ? 'subject:"' + g[1] + '"' : "", g && !q ? "language:eng" : "", free ? "ebook_access:public" : ""].filter(Boolean).join(" ");
      const url = API + "limit=" + (short ? 60 : 40) + "&q=" + encodeURIComponent(query) + (g && !q ? "&sort=readinglog" : "");
      $("bookGo").disabled = true; clear(); status("Looking for books…");
      try {
        const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 15000);
        const j = await (await fetch(url, { signal: ctrl.signal })).json();
        clearTimeout(timer);
        // one card per book, not one per edition or volume
        const seen = new Set();
        found = (j.docs || []).filter(b => {
          const k = (b.title + "|" + (b.author_name || [""])[0]).toLowerCase();
          if (seen.has(k) || /\[\d\/\d\]/.test(b.title)) return false;
          seen.add(k); return true;
        }).filter(b => !short || (b.number_of_pages_median && b.number_of_pages_median < 300))
          // genre lists sometimes show a translation's original title in another alphabet; keep those for title searches only
          .filter(b => q || !/[^\u0000-\u024F\u1E00-\u1EFF\u2000-\u206F]/.test(b.title));
        const what = [q ? "\u201c" + q + "\u201d" : "", g ? g[0].toLowerCase() : ""].filter(Boolean).join(" in ");
        if (!found.length) { status("No books found for " + what + (free || short ? " with those filters. Try turning one off." : ". Try another genre, or check the spelling."), true); return; }
        status(g && !q ? "The most-read " + g[0].toLowerCase() + " books" + (free ? " you can read free online" : "") + "." : "");
        more();
      } catch (err) {
        status("We couldn't reach the book library. Wait a few seconds and try again.", true);
      } finally { $("bookGo").disabled = false; }
    });
    $("bookMore").addEventListener("click", more);

    function clear() { $("bookList").innerHTML = ""; found = []; count = 0; $("bookMore").hidden = true; }
    function more() {
      found.slice(count, count + PAGE).forEach(b => $("bookList").appendChild(card(b)));
      count = Math.min(count + PAGE, found.length);
      $("bookMore").hidden = count >= found.length;
      $("bookMore").textContent = "Show more (" + (found.length - count) + ")";
      $("bookCredit").hidden = false;
    }

    function card(b) {
      const li = document.createElement("li"), author = (b.author_name || [])[0] || "";
      li.className = "book";
      li.innerHTML = '<div class="cover"></div><div class="bbody"><h4></h4><p class="by"></p><p class="bmeta"></p><p class="pace"></p><div class="slinks"></div><button type="button" class="more">What it\'s about</button></div>';
      const cov = li.querySelector(".cover");
      if (b.cover_i) {
        const img = document.createElement("img");
        img.className = "cover"; img.alt = ""; img.loading = "lazy"; img.src = "https://covers.openlibrary.org/b/id/" + b.cover_i + "-M.jpg";
        cov.replaceWith(img);
      } else cov.textContent = b.title;
      li.querySelector("h4").textContent = b.title;
      li.querySelector(".by").textContent = author ? "by " + author : "";
      const meta = [b.first_publish_year, b.number_of_pages_median ? b.number_of_pages_median + " pages" : "", b.ratings_count >= 5 ? "\u2605 " + b.ratings_average.toFixed(1) + " (" + b.ratings_count + ")" : ""].filter(Boolean);
      li.querySelector(".bmeta").textContent = meta.join(" \u00b7 ");
      // a pace that fits a long-distance book club: done in a month of weekly calls
      const pace = li.querySelector(".pace");
      if (b.number_of_pages_median) { const day = Math.max(1, Math.ceil(b.number_of_pages_median / 28)); pace.textContent = "About " + day + " page" + (day > 1 ? "s" : "") + " a day to finish in 4 weeks"; } else pace.remove();
      if (b.ebook_access === "public") { const f = document.createElement("span"); f.className = "free"; f.textContent = "Free to read online"; li.querySelector(".by").after(f); }
      const links = li.querySelector(".slinks"), olUrl = "https://openlibrary.org" + b.key;
      const add = (txt, href) => { const a = document.createElement("a"); a.textContent = txt; a.href = href; a.target = "_blank"; a.rel = "noopener"; links.appendChild(a); };
      if (b.ebook_access === "public") add("Read free", olUrl);
      else if (b.ebook_access === "borrowable") add("Borrow free", olUrl);
      add("Find at a library", "https://search.worldcat.org/search?q=" + encodeURIComponent(b.title + " " + author));
      add("Buy", "https://bookshop.org/search?keywords=" + encodeURIComponent(b.title + " " + author));
      add("Open Library", olUrl);
      const btn = li.querySelector("button.more");
      btn.addEventListener("click", async () => {
        const open = li.querySelector(".desc");
        if (open) { open.remove(); btn.textContent = "What it's about"; return; }
        btn.disabled = true;
        let text = "";
        try {
          const w = await (await fetch("https://openlibrary.org" + b.key + ".json")).json();
          text = typeof w.description === "string" ? w.description : (w.description && w.description.value) || "";
          text = text.split(/\r?\n\s*-{3,}|\(\[source\]|\[source\]|\r?\n\s*Also contained in/)[0].replace(/\[([^\]]+)\]\[\d+\]/g, "$1").trim();
        } catch (e) {}
        btn.disabled = false;
        const p = document.createElement("p");
        p.className = "desc";
        p.textContent = text ? (text.length > 650 ? text.slice(0, 630).replace(/\s+\S*$/, "") + "\u2026" : text) : "There's no description for this one yet. Open it on Open Library for more.";
        btn.before(p);
        btn.textContent = "Hide";
      });
      return li;
    }
  }

  function setupMuseums() {
    $("museums").hidden = false;
    const ALL = window.MUSEUMS, PAGE = 6;
    const status = (msg, err) => { $("museumStatus").textContent = msg; $("museumStatus").classList.toggle("err", !!err); };
    const getKind = combo($("mKind"), $("mKindList"), () => window.MUSEUM_KINDS.map(k => ({ id: k, name: k })));
    let shown = [], count = 0, lastRandom = -1;

    $("museumForm").addEventListener("submit", e => {
      e.preventDefault();
      const q = $("mKind").value.trim();
      if (!q) { status("Type a kind of museum, like art, history or space. Or hit Surprise me.", true); $("mKind").focus(); return; }
      const kind = $("mKind").dataset.id || window.MUSEUM_KINDS.find(k => k.toLowerCase() === q.toLowerCase());
      let hits;
      if (kind) hits = ALL.filter(m => m.k.includes(kind));
      else {
        // free text ("van gogh", "dinosaurs"): match words against the name, place, kinds and description, best first
        const words = q.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 1 && !["and", "the", "museum", "museums", "of"].includes(w));
        hits = ALL.map(m => {
          const tags = (m.k.join(" ") + " " + m.n).toLowerCase(), hay = tags + " " + (m.city + " " + m.d).toLowerCase();
          const score = words.reduce((n, w) => { const st = w.replace(/s$/, ""); return n + (m.n.toLowerCase().includes(st) ? 2 : 0) + (tags.includes(st) ? 3 : 0) + (hay.includes(st) ? 1 : 0); }, 0);
          return { m, score };
        }).filter(x => x.score > 0).sort((x, y) => y.score - x.score).map(x => x.m);
        if (!hits.length) {
          const near = getKind();
          if (near) { $("mKind").value = near.name; hits = ALL.filter(m => m.k.includes(near.id)); }
        }
      }
      clear();
      if (!hits.length) { status("We don't have a \u201c" + q + "\u201d museum yet. Try art, history, science, animals or music, or hit Surprise me.", true); return; }
      status(hits.length + " free tour" + (hits.length > 1 ? "s" : "") + " to choose from.");
      shown = hits; more();
    });

    $("museumRandom").addEventListener("click", () => {
      let i;
      do { i = Math.floor(Math.random() * ALL.length); } while (i === lastRandom && ALL.length > 1);
      lastRandom = i;
      clear();
      status("Here's where you're going tonight. Not feeling it? Hit Surprise me again.");
      render(ALL[i], 0, true);
    });
    $("museumMore").addEventListener("click", more);

    function clear() { $("museumList").innerHTML = ""; shown = []; count = 0; $("museumMore").hidden = true; }
    function more() {
      shown.slice(count, count + PAGE).forEach((m, i) => render(m, count + i, false));
      count = Math.min(count + PAGE, shown.length);
      $("museumMore").hidden = count >= shown.length;
      $("museumMore").textContent = "Show more (" + (shown.length - count) + ")";
    }
    function render(m, i, lucky) {
      const li = document.createElement("li");
      li.className = "rcard" + (lucky ? " lucky" : "");
      li.innerHTML = '<div class="rtop"><h3></h3><span class="rnum"></span></div><p class="rmeta"></p><p class="blurb"></p><div class="ractions"></div>';
      li.querySelector("h3").textContent = m.n;
      li.querySelector(".rnum").textContent = lucky ? "SURPRISE" : String(i + 1).padStart(2, "0");
      li.querySelector(".rmeta").textContent = m.city + " \u00b7 " + m.how;
      li.querySelector(".blurb").textContent = m.d;
      const a = document.createElement("a");
      a.className = "btn"; a.href = m.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Take the virtual tour \u2192";
      li.querySelector(".ractions").appendChild(a);
      $("museumList").appendChild(li);
      $("museumCredit").hidden = false;
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
    window.addLocateButton($("addr"), { kind: "address", status });

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
