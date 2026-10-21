// "Tourist in my city": see a whole city before the visit (3D flyover, Street View, live cams), browse its
// best-known spots from Wikipedia, and build a day of stops to send your partner as a link.
(function () {
  const $ = id => document.getElementById(id);
  const WIKI = "https://en.wikipedia.org/w/api.php?format=json&formatversion=2&origin=*&action=query&";
  const PAGE = 9;
  // things in "tourist attractions" lists that you can't really go and look at
  const SKIP = /festival|convention|expo\b|annual|parade|marathon|award|area code|tv series|film\b|album|song|company|brand|\bbus\b|vehicle|locomotive|airline|organization/i;

  const views = {
    street: (lat, lon) => "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + lat + "," + lon,
    earth: (lat, lon, d) => "https://earth.google.com/web/@" + lat + "," + lon + ",0a," + (d || 1200) + "d,35y,0h,60t,0r",
    named: q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q),
    photos: q => "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(q),
    cams: q => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q + " live cam")
  };

  window.setupCityTour = function () {
    $("citytour").hidden = false;
    const status = (msg, err) => { $("cityStatus").textContent = msg; $("cityStatus").classList.toggle("err", !!err); };
    let city = null, spots = [], shownSpots = 0, stops = [], fromLink = false;

    const params = new URLSearchParams(location.search);
    try { const saved = localStorage.getItem("liita-city"); if (saved) $("cityName").value = saved; } catch (e) {}
    if (params.get("city")) {
      $("cityName").value = params.get("city");
      try { stops = JSON.parse(decodeURIComponent(escape(atob(params.get("stops") || "")))).map(s => ({ n: s[0], lat: s[1], lon: s[2], d: s[3] || "" })); fromLink = stops.length > 0; } catch (e) { stops = []; }
      setTimeout(() => $("cityForm").requestSubmit(), 0);
    }

    $("cityForm").addEventListener("submit", async e => {
      e.preventDefault();
      const q = $("cityName").value.trim();
      if (q.length < 2) { status("Type the city you want to show them.", true); $("cityName").focus(); return; }
      $("cityGo").disabled = true;
      status("Finding " + q + "…");
      try {
        const c = await geocode(q);
        if (!c) { status("We couldn't find “" + q + "”. Try adding the state or country.", true); return; }
        if (!city || city.label !== c.label) { if (!fromLink) stops = []; }
        city = c; fromLink = false;
        try { localStorage.setItem("liita-city", q); } catch (e2) {}
        showViews();
        renderStops();
        $("cityResult").hidden = false;
        status("Looking up the best-known spots in " + city.name + "…");
        spots = await findSpots(city);
        shownSpots = 0; $("spotList").innerHTML = "";
        moreSpots();
        status(spots.length ? "" : "We couldn't find a list of sights for " + city.name + ". Use the views above, and add your own stops below.", !spots.length);
      } catch (err) {
        status("We couldn't reach the map service. Wait a few seconds and try again.", true);
      } finally { $("cityGo").disabled = false; }
    });
    $("spotMore").addEventListener("click", moreSpots);

    async function geocode(q) {
      const r = await fetch("https://photon.komoot.io/api/?limit=1&lang=en&osm_tag=place&q=" + encodeURIComponent(q));
      const f = (await r.json()).features[0];
      if (!f) return null;
      const p = f.properties;
      return { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], name: p.name, state: p.state || "", country: p.country || "",
               label: [p.name, p.state, p.country].filter((v, i, a) => v && a.indexOf(v) === i).join(", ") };
    }

    /* ---------- whole-city views ---------- */
    function showViews() {
      const { lat, lon, name } = city;
      $("cityHead").textContent = "See " + city.label;
      const box = $("cityViews"); box.innerHTML = "";
      [["Fly over it in 3D", "Google Earth, from above the city", views.earth(lat, lon, 6000), "&#9992;"],
       ["Walk the streets", "Street View, starting downtown", views.street(lat, lon), "&#128694;"],
       ["Watch it live", "Live webcams from around " + name, views.cams(name), "&#127909;"]].forEach(([t, s, href, icon]) => {
        const a = document.createElement("a");
        a.className = "view"; a.href = href; a.target = "_blank"; a.rel = "noopener";
        a.innerHTML = '<span class="vicon" aria-hidden="true">' + icon + '</span><span><strong></strong><small></small></span>';
        a.querySelector("strong").textContent = t; a.querySelector("small").textContent = s;
        box.appendChild(a);
      });
    }

    /* ---------- popular spots from Wikipedia ---------- */
    async function findSpots(c) {
      const names = [];
      if (c.state && /united states/i.test(c.country)) names.push(c.name + ", " + c.state);
      if (c.state) names.push(c.name + ", " + c.state);
      names.push(c.name);
      const titles = [...new Set(names)].map(n => "Category:Tourist attractions in " + n);
      const check = await (await fetch(WIKI + "titles=" + encodeURIComponent(titles.join("|")))).json();
      const exists = new Set((check.query.pages || []).filter(p => !p.missing).map(p => p.title));
      const cat = titles.find(t => exists.has(t));
      const base = "prop=pageviews|coordinates|pageimages|description&pvipdays=30&piprop=thumbnail&pithumbsize=480&pilimit=50&colimit=50&";
      const gen = cat ? "generator=categorymembers&gcmtype=page&gcmlimit=50&gcmtitle=" + encodeURIComponent(cat)
                      : "generator=geosearch&ggsradius=10000&ggslimit=50&ggscoord=" + c.lat + "|" + c.lon;
      // page views come back in batches, so follow "continue" a few times to rank everything
      const pages = {};
      let cont = "";
      for (let i = 0; i < 5; i++) {
        const j = await (await fetch(WIKI + base + gen + cont)).json();
        ((j.query && j.query.pages) || []).forEach(p => {
          const old = pages[p.pageid] || {};
          pages[p.pageid] = Object.assign(old, p, { pageviews: Object.assign(old.pageviews || {}, p.pageviews || {}) });
        });
        if (!j.continue) break;
        cont = "&" + Object.entries(j.continue).map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&");
      }
      const city = c.name.toLowerCase();
      return Object.values(pages).filter(p => p.title.toLowerCase() !== city && !SKIP.test(p.description || "") && !SKIP.test(p.title) &&
        (cat || (p.thumbnail && !/school|court|post office|station|university|apartment|office/i.test(p.description || ""))))
        .map(p => ({ n: p.title.replace(/ \((?:[^)]*)\)$/, ""), title: p.title, d: p.description || "", img: p.thumbnail ? p.thumbnail.source : "",
                     lat: p.coordinates ? p.coordinates[0].lat : null, lon: p.coordinates ? p.coordinates[0].lon : null,
                     views: Object.values(p.pageviews || {}).reduce((s, v) => s + (v || 0), 0) }))
        .sort((a, b) => (b.views + (b.img ? 500 : 0)) - (a.views + (a.img ? 500 : 0)));
    }

    function moreSpots() {
      spots.slice(shownSpots, shownSpots + PAGE).forEach(s => $("spotList").appendChild(spotCard(s)));
      shownSpots = Math.min(shownSpots + PAGE, spots.length);
      $("spotMore").hidden = shownSpots >= spots.length;
      $("spotMore").textContent = "Show more spots (" + (spots.length - shownSpots) + ")";
      $("spotsWrap").hidden = !spots.length;
    }

    function spotCard(s) {
      const li = document.createElement("li");
      li.className = "spot";
      li.innerHTML = '<div class="spic"></div><div class="sbody"><h4></h4><p class="sdesc"></p><div class="slinks"></div><button type="button" class="addbtn">+ Add to my tour</button></div>';
      if (s.img) { const im = document.createElement("img"); im.src = s.img; im.alt = ""; im.loading = "lazy"; li.querySelector(".spic").appendChild(im); }
      li.querySelector("h4").textContent = s.n;
      li.querySelector(".sdesc").textContent = s.d ? s.d.charAt(0).toUpperCase() + s.d.slice(1) : "";
      links(li.querySelector(".slinks"), s, true);
      const add = li.querySelector(".addbtn");
      const sync = () => { const on = stops.some(x => x.n === s.n); add.textContent = on ? "✓ On your tour" : "+ Add to my tour"; add.classList.toggle("on", on); };
      add.addEventListener("click", () => {
        if (stops.some(x => x.n === s.n)) stops = stops.filter(x => x.n !== s.n);
        else if (stops.length >= 12) { status("That's a full day. Remove a stop to add another.", true); return; }
        else stops.push({ n: s.n, lat: s.lat, lon: s.lon, d: s.d });
        sync(); renderStops();
      });
      li.syncAdd = sync; sync();
      return li;
    }

    function links(box, s, wiki) {
      const where = s.n + ", " + city.name;
      const add = (txt, href) => { const a = document.createElement("a"); a.textContent = txt; a.href = href; a.target = "_blank"; a.rel = "noopener"; box.appendChild(a); };
      if (s.lat != null) add("Street View", views.street(s.lat, s.lon));
      if (s.lat != null) add("3D", views.earth(s.lat, s.lon, 600));
      add("Map", views.named(where));
      add("Photos", views.photos(where));
      if (wiki && s.title) add("About", "https://en.wikipedia.org/wiki/" + encodeURIComponent(s.title.replace(/ /g, "_")));
    }

    /* ---------- your tour ---------- */
    let searchTimer = null;
    $("stopSearch").addEventListener("input", () => {
      clearTimeout(searchTimer);
      const q = $("stopSearch").value.trim();
      if (q.length < 3 || !city) { $("stopOpts").hidden = true; return; }
      searchTimer = setTimeout(async () => {
        try {
          const r = await fetch("https://photon.komoot.io/api/?limit=6&lang=en&lat=" + city.lat + "&lon=" + city.lon + "&location_bias_scale=0.6&q=" + encodeURIComponent(q));
          const feats = (await r.json()).features.filter(f => f.properties.name);
          const ul = $("stopOpts"); ul.innerHTML = "";
          feats.forEach(f => {
            const p = f.properties, li = document.createElement("li");
            li.setAttribute("role", "option");
            const b = document.createElement("strong"), sm = document.createElement("small");
            b.textContent = p.name; sm.textContent = [[p.housenumber, p.street].filter(Boolean).join(" "), p.city, p.state].filter(Boolean).join(", ");
            li.append(b, sm);
            li.addEventListener("mousedown", ev => {
              ev.preventDefault();
              if (stops.length >= 12) { status("That's a full day. Remove a stop to add another.", true); return; }
              stops.push({ n: p.name, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], d: sm.textContent });
              $("stopSearch").value = ""; ul.hidden = true; renderStops();
            });
            ul.appendChild(li);
          });
          ul.hidden = !feats.length;
        } catch (e) {}
      }, 300);
    });
    $("stopSearch").addEventListener("blur", () => setTimeout(() => { $("stopOpts").hidden = true; }, 150));
    $("stopSearch").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); const first = $("stopOpts").querySelector("li"); if (first && !$("stopOpts").hidden) first.dispatchEvent(new MouseEvent("mousedown")); } });
    $("tourShare").addEventListener("click", share);

    function renderStops() {
      const ol = $("stopList"); ol.innerHTML = "";
      stops.forEach((s, i) => {
        const li = document.createElement("li");
        li.innerHTML = '<span class="snum"></span><div class="sinfo"><strong></strong><div class="slinks"></div></div><div class="smove"><button type="button" aria-label="Move up">&#8593;</button><button type="button" aria-label="Move down">&#8595;</button><button type="button" aria-label="Remove">&#10005;</button></div>';
        li.querySelector(".snum").textContent = i + 1;
        li.querySelector("strong").textContent = s.n;
        links(li.querySelector(".slinks"), s, false);
        const [up, down, del] = li.querySelectorAll(".smove button");
        up.disabled = i === 0; down.disabled = i === stops.length - 1;
        up.addEventListener("click", () => { [stops[i - 1], stops[i]] = [stops[i], stops[i - 1]]; renderStops(); });
        down.addEventListener("click", () => { [stops[i + 1], stops[i]] = [stops[i], stops[i + 1]]; renderStops(); });
        del.addEventListener("click", () => { stops.splice(i, 1); renderStops(); });
        ol.appendChild(li);
      });
      $("stopEmpty").hidden = stops.length > 0;
      const route = stops.filter(s => s.lat != null);
      $("tourRoute").hidden = route.length < 2;
      if (route.length >= 2) {
        const pt = s => s.lat + "," + s.lon;
        $("tourRoute").href = "https://www.google.com/maps/dir/?api=1&travelmode=walking&origin=" + pt(route[0]) + "&destination=" + pt(route[route.length - 1]) +
          (route.length > 2 ? "&waypoints=" + encodeURIComponent(route.slice(1, -1).slice(0, 8).map(pt).join("|")) : "");
      }
      $("tourShare").hidden = !stops.length;
      document.querySelectorAll("#spotList .spot").forEach(li => li.syncAdd && li.syncAdd());
      $("tourTitle").textContent = params.get("stops") && stops.length ? "Their day in " + (city ? city.name : "the city") : "Your day in " + (city ? city.name : "the city");
    }

    async function share() {
      const url = new URL(location.href.split("?")[0]);
      url.searchParams.set("d", "tourist-in-my-city");
      url.searchParams.set("city", $("cityName").value.trim());
      const data = stops.map(s => [s.n, s.lat == null ? null : +s.lat.toFixed(5), s.lon == null ? null : +s.lon.toFixed(5)]);
      url.searchParams.set("stops", btoa(unescape(encodeURIComponent(JSON.stringify(data)))));
      const link = url.toString();
      try {
        if (navigator.share && matchMedia("(pointer:coarse)").matches) { await navigator.share({ title: "Our day in " + city.name, url: link }); return; }
        await navigator.clipboard.writeText(link);
        $("tourShare").textContent = "Link copied ✓";
        setTimeout(() => { $("tourShare").textContent = "Send them the tour"; }, 2500);
      } catch (e) {
        if (e && e.name === "AbortError") return;
        status("Copy this link and send it to them: " + link);
      }
    }
  };
})();
