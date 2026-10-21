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

    const getPlat = combo($("mPlat"), $("mPlatList"), () => index ? index.services.map(s => ({ id: s.id, name: s.name, img: s.logo ? "https://image.tmdb.org/t/p/w92" + s.logo : "" })) : []);
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
      const list = $("movieList"), region = index.region || "US";
      picks.forEach((m, i) => {
        const li = document.createElement("li");
        li.className = "mcard";
        li.innerHTML = '<img class="poster" alt="" loading="lazy"><div class="mbody"><div class="rtop"><h3></h3><span class="rnum"></span></div><p class="rmeta"></p><div class="scores"></div><p class="ov"></p><div class="ractions"></div></div>';
        const img = li.querySelector(".poster");
        img.onerror = () => img.removeAttribute("src");
        if (m.p) img.src = "https://image.tmdb.org/t/p/w185" + m.p; else img.removeAttribute("src");
        li.querySelector("h3").textContent = m.t;
        li.querySelector(".rnum").textContent = String(i + 1).padStart(2, "0");
        li.querySelector(".rmeta").textContent = m.y || "";
        const sc = li.querySelector(".scores");
        const score = (cls, txt, title) => { const b = document.createElement("span"); b.className = "score " + cls; b.textContent = txt; b.title = title; sc.appendChild(b); };
        if (m.rt != null) score("rt", "🍅 " + m.rt + "%", "Rotten Tomatoes Tomatometer");
        if (m.mc != null) score("mc", "Metacritic " + m.mc, "Metascore");
        if (m.n) score("", "★ " + m.v.toFixed(1) + " (" + m.n.toLocaleString() + ")", "Audience rating on TMDB");
        li.querySelector(".ov").textContent = m.ov || "";
        const acts = li.querySelector(".ractions");
        const btn = (txt, href, cls) => { const a = document.createElement("a"); a.className = "btn " + cls; a.textContent = txt; a.href = href; a.target = "_blank"; a.rel = "noopener"; acts.appendChild(a); };
        btn("Watch on " + plat.name, "https://www.themoviedb.org/" + kind + "/" + m.id + "/watch?locale=" + region, "");
        btn("Trailer", "https://www.youtube.com/results?search_query=" + encodeURIComponent(m.t + " " + (m.y || "") + " trailer"), "ghost");
        list.appendChild(li);
      });
      $("movieUpdated").textContent = index.updated ? "Lists updated " + new Date(index.updated + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) + "." : "";
      $("movieCredit").hidden = false;
    }
  }
})();
