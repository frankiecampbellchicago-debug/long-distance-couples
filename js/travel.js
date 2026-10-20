// Travel: city search, local clocks, nearest airports, meet-halfway, and fare watch.
(function () {
  const $ = id => document.getElementById(id);
  const AIRPORTS = window.AIRPORTS || [];
  const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
  const pad = n => String(n).padStart(2, "0");
  const store = {
    get(k, fallback) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? fallback; } catch (e) { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // ---------- geometry and time ----------
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  function miles(a, b) {
    const dLa = rad(b.lat - a.lat), dLo = rad(b.lon - a.lon);
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLo / 2) ** 2;
    return 2 * 3958.8 * Math.asin(Math.sqrt(h));
  }
  function offsetMin(tz) {
    const d = new Date();
    const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(d).reduce((o, x) => (o[x.type] = x.value, o), {});
    return (Date.UTC(+p.year, p.month - 1, +p.day, +p.hour % 24, +p.minute) - Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes())) / 60000;
  }
  const fmtTime = tz => new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(new Date());
  const fmtDay = tz => new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "long" }).format(new Date());
  const airport = code => AIRPORTS.find(a => a[0] === code);
  const apPoint = a => ({ lat: a[3], lon: a[4] });
  function nearestAirport(p) {
    let best = null, bd = Infinity;
    AIRPORTS.forEach(a => { const d = miles(p, apPoint(a)); if (d < bd) { bd = d; best = a; } });
    // prefer a city's main airport (e.g. ORD over MDW) when it's nearly as close
    if (best && best[1].includes("(")) {
      let main = null, md = Infinity;
      AIRPORTS.forEach(a => { if (!a[1].includes("(")) { const d = miles(p, apPoint(a)); if (d < md) { md = d; main = a; } } });
      if (main && md < bd + 35) { best = main; bd = md; }
    }
    return { ap: best, mi: bd };
  }

  // ---------- state ----------
  const DEFAULTS = [
    { name: "Chicago", label: "Chicago, Illinois, United States", lat: 41.88, lon: -87.63, tz: "America/Chicago" },
    { name: "New York", label: "New York, New York, United States", lat: 40.71, lon: -74.01, tz: "America/New_York" }
  ];
  const cities = store.get("liita-cities", DEFAULTS);
  if (!Array.isArray(cities) || cities.length !== 2 || !cities.every(c => c && c.tz)) cities.splice(0, cities.length, ...DEFAULTS);

  // ---------- city search (autocomplete) ----------
  function setupSearch(idx) {
    const key = idx === 0 ? "A" : "B";
    const input = $("city" + key), list = $("list" + key), status = $("status" + key);
    let results = [], active = -1, timer = null, req = 0;
    input.value = cities[idx].label;

    function close() { list.hidden = true; input.setAttribute("aria-expanded", "false"); active = -1; }
    function render() {
      list.innerHTML = "";
      results.forEach((r, i) => {
        const li = document.createElement("li");
        li.id = "opt" + key + i; li.setAttribute("role", "option"); li.setAttribute("aria-selected", i === active);
        const b = document.createElement("strong"); b.textContent = r.name;
        const s = document.createElement("span"); s.textContent = [r.admin1, r.country].filter(Boolean).join(", ");
        li.append(b, s);
        li.addEventListener("mousedown", e => { e.preventDefault(); choose(i); });
        list.appendChild(li);
      });
      list.hidden = results.length === 0;
      input.setAttribute("aria-expanded", String(!list.hidden));
      if (active >= 0) input.setAttribute("aria-activedescendant", "opt" + key + active); else input.removeAttribute("aria-activedescendant");
    }
    function choose(i) {
      const r = results[i]; if (!r) return;
      meetPick = 0;
      cities[idx] = { name: r.name, label: [r.name, r.admin1, r.country].filter(Boolean).join(", "), lat: r.latitude, lon: r.longitude, tz: r.timezone || "UTC" };
      input.value = cities[idx].label; status.textContent = "";
      store.set("liita-cities", cities); close(); update(true);
    }
    async function search(q) {
      const my = ++req;
      status.textContent = "Searching…";
      try {
        const res = await fetch(GEO_URL + "?count=6&language=en&format=json&name=" + encodeURIComponent(q));
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        if (my !== req) return;
        results = (data.results || []).filter(r => r.timezone);
        active = results.length ? 0 : -1;
        status.textContent = results.length ? "" : "No cities match \"" + q + "\". Check the spelling or try a nearby bigger city.";
        render();
      } catch (e) {
        if (my !== req) return;
        results = []; render();
        status.textContent = "City search isn't reachable right now. Check your connection and try again.";
      }
    }
    input.addEventListener("input", () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 2) { results = []; render(); status.textContent = ""; return; }
      timer = setTimeout(() => search(q), 250);
    });
    input.addEventListener("keydown", e => {
      if (list.hidden) return;
      if (e.key === "ArrowDown") { e.preventDefault(); active = (active + 1) % results.length; render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); active = (active - 1 + results.length) % results.length; render(); }
      else if (e.key === "Enter") { e.preventDefault(); choose(active < 0 ? 0 : active); }
      else if (e.key === "Escape") { close(); }
    });
    input.addEventListener("focus", () => input.select());
    input.addEventListener("blur", () => setTimeout(() => { close(); if (!input.value.trim()) input.value = cities[idx].label; }, 120));
  }

  // ---------- fare watch ----------
  const fromEl = $("fareFrom"), toEl = $("fareTo"), depEl = $("fareDep"), retEl = $("fareRet");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const addDays = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return iso(d); };
  const niceDate = s => s ? new Date(s + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
  const validCode = c => /^[A-Z]{3}$/.test(c);

  function links(from, to, dep, ret) {
    const q = "Flights from " + from + " to " + to + (dep ? " on " + dep : "") + (dep && ret ? " through " + ret : "");
    const yymmdd = s => s.slice(2).replace(/-/g, "");
    const kDep = dep || addDays(iso(new Date()), 14);
    return {
      google: "https://www.google.com/travel/flights?q=" + encodeURIComponent(q),
      kayak: "https://www.kayak.com/flights/" + from + "-" + to + "/" + kDep + (ret ? "/" + ret : "") + "?sort=price_a",
      sky: "https://www.skyscanner.com/transport/flights/" + from.toLowerCase() + "/" + to.toLowerCase() + "/" + yymmdd(kDep) + "/" + (ret ? yymmdd(ret) + "/" : "")
    };
  }
  function apLabel(code) {
    const a = airport(code);
    return a ? a[1] : (validCode(code) ? "Airport code " + code : "Enter a 3-letter airport code");
  }
  function refreshFare() {
    const from = fromEl.value.trim().toUpperCase(), to = toEl.value.trim().toUpperCase();
    $("fareFromName").textContent = apLabel(from);
    $("fareToName").textContent = apLabel(to);
    const ok = validCode(from) && validCode(to) && from !== to;
    const msg = $("fareMsg");
    if (!ok) msg.textContent = from && from === to ? "Pick two different airports." : "Enter both airport codes, like ORD or JFK.";
    else if (retEl.value && depEl.value && retEl.value < depEl.value) msg.textContent = "Your return date is before your leave date.";
    else msg.textContent = "";
    const bad = !ok || !!msg.textContent;
    const l = ok ? links(from, to, depEl.value, retEl.value) : null;
    [["fareGoogle", "google"], ["fareKayak", "kayak"], ["fareSky", "sky"]].forEach(([id, k]) => {
      const a = $(id); a.setAttribute("aria-disabled", bad); if (l && !bad) a.href = l[k]; else a.removeAttribute("href");
    });
    $("fareWatch").disabled = bad;
  }
  function defaultDates() {
    const today = iso(new Date());
    depEl.min = today; retEl.min = today;
    const visit = ($("visitDate") && $("visitDate").value || "").slice(0, 10);
    const dep = visit && visit > today ? visit : addDays(today, 14);
    if (!depEl.value) depEl.value = dep;
    if (!retEl.value) retEl.value = addDays(depEl.value, 3);
  }

  // watched routes (saved on this device)
  let watched = store.get("liita-watch", []);
  if (!Array.isArray(watched)) watched = [];
  function renderWatched() {
    const ul = $("watchList"); ul.innerHTML = "";
    $("watchEmpty").hidden = watched.length > 0;
    watched.forEach((w, i) => {
      const li = document.createElement("li");
      const t = document.createElement("div"); t.className = "wroute";
      const b = document.createElement("strong"); b.textContent = w.from + " → " + w.to;
      const s = document.createElement("span"); s.textContent = w.dep ? niceDate(w.dep) + (w.ret ? " – " + niceDate(w.ret) : " · one way") : "Any dates";
      t.append(b, s);
      const l = links(w.from, w.to, w.dep, w.ret);
      const acts = document.createElement("div"); acts.className = "wacts";
      [["Google Flights", l.google], ["Kayak", l.kayak]].forEach(([txt, href]) => {
        const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.rel = "noopener"; a.textContent = txt; acts.appendChild(a);
      });
      const x = document.createElement("button"); x.type = "button"; x.className = "wx"; x.textContent = "Remove";
      x.setAttribute("aria-label", "Stop watching " + w.from + " to " + w.to);
      x.addEventListener("click", () => { watched.splice(i, 1); store.set("liita-watch", watched); renderWatched(); });
      acts.appendChild(x);
      li.append(t, acts); ul.appendChild(li);
    });
  }
  $("fareWatch").addEventListener("click", () => {
    const w = { from: fromEl.value.trim().toUpperCase(), to: toEl.value.trim().toUpperCase(), dep: depEl.value, ret: retEl.value };
    if (!watched.some(x => x.from === w.from && x.to === w.to && x.dep === w.dep && x.ret === w.ret)) {
      watched.unshift(w); watched = watched.slice(0, 8); store.set("liita-watch", watched);
    }
    renderWatched();
    $("fareWatch").textContent = "Saved to your watch list ✓";
    setTimeout(() => { $("fareWatch").textContent = "Watch this route"; }, 2200);
  });
  $("fareSwap").addEventListener("click", () => { const t = fromEl.value; fromEl.value = toEl.value; toEl.value = t; refreshFare(); });
  [fromEl, toEl].forEach(el => el.addEventListener("input", () => { el.value = el.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3); refreshFare(); }));
  [depEl, retEl].forEach(el => el.addEventListener("change", refreshFare));
  document.querySelectorAll(".fbtns a").forEach(a => a.addEventListener("click", e => { if (a.getAttribute("aria-disabled") === "true") e.preventDefault(); }));

  // ---------- meet halfway ----------
  // Pick the airport cities that make the trip as even as possible for both people:
  // score = the longer of the two trips, plus a penalty for how lopsided they are.
  let meetOptions = [], meetPick = 0;
  const flightTime = d => { const h = d / 500 + 0.5; return Math.floor(h) + "h " + pad(Math.round((h % 1) * 60)) + "m"; };
  const cityName = ap => ap[1].replace(/ \(.*\)$/, "");
  function findMeetups(a, b, total) {
    const seen = new Set(), out = [];
    AIRPORTS.forEach(ap => {
      if (ap[1].includes("(")) return;                    // main airports only
      const city = cityName(ap); if (seen.has(city)) return; seen.add(city);
      const p = apPoint(ap), da = miles(a, p), db = miles(b, p);
      if (da < 120 || db < 120) return;                   // not either person's home area
      if (da + db > total * 1.6 + 300) return;            // has to be roughly on the way
      out.push({ ap, da, db, score: Math.max(da, db) + 0.5 * Math.abs(da - db) });
    });
    return out.sort((x, y) => x.score - y.score).slice(0, 4);
  }
  function renderMeet(na, nb, total) {
    const mid = $("mid"), note = $("midnote"), ml = $("midLinks"), alts = $("midAlts");
    alts.innerHTML = "";
    if (total < 150) {
      mid.textContent = "You're already close"; note.textContent = "You live less than 150 miles apart. Just pick a weekend!"; ml.hidden = true; return;
    }
    if (!meetOptions.length) {
      mid.textContent = "Pick a spot together"; note.textContent = "We couldn't find a big airport between you. Try a city along the way."; ml.hidden = true; return;
    }
    if (meetPick >= meetOptions.length) meetPick = 0;
    const o = meetOptions[meetPick];
    mid.textContent = cityName(o.ap) + " (" + o.ap[0] + ")";
    note.textContent = "You: " + Math.round(o.da).toLocaleString() + " mi, about " + flightTime(o.da) + " · Them: " + Math.round(o.db).toLocaleString() + " mi, about " + flightTime(o.db);
    ml.hidden = !(na.ap && nb.ap);
    if (na.ap && nb.ap) {
      $("midYou").href = links(na.ap[0], o.ap[0], depEl.value, retEl.value).google;
      $("midThem").href = links(nb.ap[0], o.ap[0], depEl.value, retEl.value).google;
    }
    if (meetOptions.length > 1) {
      const lab = document.createElement("span"); lab.textContent = "Other fair picks:"; alts.appendChild(lab);
      meetOptions.forEach((x, i) => {
        if (i === meetPick) return;
        const btn = document.createElement("button"); btn.type = "button"; btn.className = "malt";
        btn.textContent = cityName(x.ap) + " (" + x.ap[0] + ")";
        btn.addEventListener("click", () => { meetPick = i; renderMeet(na, nb, total); });
        alts.appendChild(btn);
      });
    }
  }

  // ---------- main update ----------
  function update(citiesChanged) {
    const [a, b] = cities;
    $("timeA").textContent = fmtTime(a.tz); $("dayA").textContent = fmtDay(a.tz);
    $("timeB").textContent = fmtTime(b.tz); $("dayB").textContent = fmtDay(b.tz);
    const diff = (offsetMin(b.tz) - offsetMin(a.tz)) / 60;
    $("gap").textContent = diff === 0 ? "same time" : (diff > 0 ? "+" : "−") + Math.abs(diff) + "h";
    const mi = miles(a, b);
    $("miles").textContent = Math.round(mi).toLocaleString();
    const hrs = mi / 500 + 0.5;
    $("flight").textContent = mi < 50 ? "—" : Math.floor(hrs) + "h " + pad(Math.round((hrs % 1) * 60)) + "m";
    let ov = 0; for (let h = 8; h < 23; h++) { const t = ((h + diff) % 24 + 24) % 24; if (t >= 8 && t < 23) ov++; }
    $("overlap").textContent = ov + " h";

    const na = nearestAirport(a), nb = nearestAirport(b);
    $("apA").textContent = na.ap ? "Nearest airport: " + na.ap[0] + " · " + Math.round(na.mi) + " mi" : "";
    $("apB").textContent = nb.ap ? "Nearest airport: " + nb.ap[0] + " · " + Math.round(nb.mi) + " mi" : "";

    if (citiesChanged) meetOptions = findMeetups(a, b, mi);
    renderMeet(na, nb, mi);
    if (citiesChanged && na.ap && nb.ap) { fromEl.value = na.ap[0]; toEl.value = nb.ap[0]; }
    refreshFare();
  }

  setupSearch(0); setupSearch(1);
  defaultDates();
  update(true);
  renderWatched();
  setInterval(() => update(false), 30000);
})();
