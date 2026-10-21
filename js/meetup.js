// "Meet somewhere new": find a hotel and things to do in the city you're meeting in.
// Places come from OpenStreetMap (Nominatim, one request per search) and Wikipedia; prices and booking open on the booking sites.
(function () {
  const $ = id => document.getElementById(id);
  const NOMI = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=40&extratags=1&addressdetails=1&q=";
  const PAGE = 9;

  // kinds of things to do: [name, Nominatim phrase(s), trip board type]
  const KINDS = [
    ["Top sights", null, "See"],
    ["Museums", ["museums in"], "See"],
    ["Parks & gardens", ["parks in", "gardens in"], "See"],
    ["Views & lookouts", ["viewpoints in"], "See"],
    ["Zoos & aquariums", ["zoo in", "aquarium in"], "See"],
    ["Theaters & shows", ["theatres in"], "Do"],
    ["Live music & clubs", ["nightclubs in"], "Do"],
    ["Bars", ["bars in"], "Eat"],
    ["Cafés", ["cafes in"], "Eat"],
    ["Restaurants", ["restaurants in"], "Eat"],
    ["Beaches", ["beaches in"], "Do"],
    ["Tours & experiences", "links", "Do"]
  ];

  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function getJson(url, ms) {
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), ms || 12000);
    try { const r = await fetch(url, { signal: ctrl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
    finally { clearTimeout(timer); }
  }
  // Nominatim asks for no more than one request a second, so phrases run one after another
  async function nominatim(phrases, city) {
    let all = [];
    for (let i = 0; i < phrases.length; i++) {
      if (i) await wait(1100);
      all = all.concat(await getJson(NOMI + encodeURIComponent(phrases[i] + " " + city)));
    }
    const seen = new Set();
    return all.filter(x => x.name && !seen.has(x.osm_type + x.osm_id) && seen.add(x.osm_type + x.osm_id))
      // well-known places first (they have a Wikipedia page), then ones with a website
      .map((x, i) => ({ x, rank: i - ((x.extratags || {}).wikipedia || (x.extratags || {}).wikidata ? 60 : 0) - ((x.extratags || {}).website ? 15 : 0) - (+(x.extratags || {}).stars || 0) * 4 }))
      .sort((a, b) => a.rank - b.rank).map(r => r.x);
  }
  const area = x => { const a = x.address || {}; return a.neighbourhood || a.suburb || a.quarter || a.city_district || ""; };
  const street = x => { const a = x.address || {}; return [a.house_number, a.road].filter(Boolean).join(" "); };
  const safeUrl = u => { try { const x = new URL(/^https?:/i.test(u) ? u : "https://" + u); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch (e) { return ""; } };

  function addButton(li, name, where, kind, status) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "addbtn";
    const sync = () => { const on = window.tripBoardHas && window.tripBoardHas(name, where); b.textContent = on ? "✓ On your trip board" : "+ Add to trip board"; b.classList.toggle("on", !!on); };
    b.addEventListener("click", () => {
      if (!window.tripBoardAddPlace) return;
      if (window.tripBoardAddPlace(name, where, kind)) status("Added " + name + " to Places to go on your trip board.");
      sync();
    });
    sync();
    li.querySelector(".mbody").appendChild(b);
  }
  function linkRow(box, items) {
    items.forEach(([txt, href]) => { if (!href) return; const a = document.createElement("a"); a.textContent = txt; a.href = href; a.target = "_blank"; a.rel = "noopener"; box.appendChild(a); });
  }

  window.setupMeetup = function () {
    $("meetFinders").hidden = false;
    const trip = window.tripBoardTrip ? window.tripBoardTrip() : null;
    if (trip) {
      if (trip.place) { $("hotelCity").value = trip.place; $("actCity").value = trip.place; }
      if (trip.start) $("hotelIn").value = trip.start;
      if (trip.end) $("hotelOut").value = trip.end;
    }
    // one city for both boxes until you change one of them
    $("hotelCity").addEventListener("change", () => { if (!$("actCity").value.trim()) $("actCity").value = $("hotelCity").value; });
    $("actCity").addEventListener("change", () => { if (!$("hotelCity").value.trim()) $("hotelCity").value = $("actCity").value; });
    hotels(); activities();
  };

  /* ---------- hotels ---------- */
  function hotels() {
    const status = (msg, err) => { $("hotelStatus").textContent = msg; $("hotelStatus").classList.toggle("err", !!err); };
    window.addLocateButton($("hotelCity"), { kind: "city", status });
    let found = [], count = 0, city = "";

    $("hotelForm").addEventListener("submit", async e => {
      e.preventDefault();
      city = $("hotelCity").value.trim();
      const cin = $("hotelIn").value, cout = $("hotelOut").value;
      if (city.length < 2) { status("Type the city you're meeting in.", true); $("hotelCity").focus(); return; }
      if (cin && cout && cout <= cin) { status("Check-out has to be after check-in.", true); $("hotelOut").focus(); return; }
      $("hotelGo").disabled = true; $("hotelList").innerHTML = ""; $("hotelMore").hidden = true; status("Looking for hotels in " + city + "…");
      try {
        found = await nominatim(["hotels in"], city);
        count = 0;
        cityLinks(city, cin, cout);
        if (!found.length) { status("We couldn't find hotels in " + city + ". Try the searches above, or a bigger city nearby.", true); return; }
        status(found.length + " hotels in " + city + ". Prices and rooms open on the booking site" + (cin ? " for your dates." : ". Add dates to see prices."));
        more();
      } catch (err) {
        status("We couldn't reach the map service. Wait a few seconds and try again.", true);
      } finally { $("hotelGo").disabled = false; }
    });
    $("hotelMore").addEventListener("click", more);

    const dates = () => ({ cin: $("hotelIn").value, cout: $("hotelOut").value });
    const booking = (q, d) => "https://www.booking.com/searchresults.html?ss=" + encodeURIComponent(q) + "&group_adults=2&no_rooms=1" + (d.cin && d.cout ? "&checkin=" + d.cin + "&checkout=" + d.cout : "");
    const gHotels = q => "https://www.google.com/travel/search?q=" + encodeURIComponent(q);

    function cityLinks(c, cin, cout) {
      const box = $("hotelLinks"); box.innerHTML = "";
      const d = { cin, cout };
      linkRow(box, [["All hotels on Booking.com", booking(c, d)], ["Airbnb stays", "https://www.airbnb.com/s/" + encodeURIComponent(c) + "/homes?adults=2" + (cin && cout ? "&checkin=" + cin + "&checkout=" + cout : "")], ["Google Hotels", gHotels("hotels in " + c)]]);
      box.querySelectorAll("a").forEach(a => { a.className = "btn ghost"; });
      box.hidden = false;
    }

    function more() {
      found.slice(count, count + PAGE).forEach(x => $("hotelList").appendChild(card(x)));
      count = Math.min(count + PAGE, found.length);
      $("hotelMore").hidden = count >= found.length;
      $("hotelMore").textContent = "Show more (" + (found.length - count) + ")";
      $("hotelCredit").hidden = false;
    }

    function card(x) {
      const t = x.extratags || {}, li = document.createElement("li");
      li.className = "mcard2";
      li.innerHTML = '<div class="mbody"><div class="rtop"><h4></h4><span class="stars"></span></div><p class="mmeta"></p><div class="slinks"></div></div>';
      li.querySelector("h4").textContent = x.name;
      const st = +t.stars;
      li.querySelector(".stars").textContent = st >= 1 && st <= 5 ? "★".repeat(Math.round(st)) : "";
      li.querySelector(".mmeta").textContent = [x.type === "hotel" ? "" : x.type.replace(/_/g, " "), area(x), street(x)].filter(Boolean).join(" · ") || city;
      const q = x.name + ", " + city;
      linkRow(li.querySelector(".slinks"), [["See prices", booking(q, dates())], ["Google Hotels", gHotels(q)], ["Map", "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q)], ["Website", safeUrl(t.website || t["contact:website"] || "")]]);
      li.querySelector(".slinks a").className = "strong";
      addButton(li, x.name, city, "Stay", status);
      return li;
    }
  }

  /* ---------- things to do ---------- */
  function activities() {
    const status = (msg, err) => { $("actStatus").textContent = msg; $("actStatus").classList.toggle("err", !!err); };
    window.addLocateButton($("actCity"), { kind: "city", status });
    const sel = $("actKind");
    KINDS.forEach(([name], i) => { const o = document.createElement("option"); o.value = i; o.textContent = name; sel.appendChild(o); });
    sel.addEventListener("change", () => { if ($("actCity").value.trim().length > 1) $("actForm").requestSubmit(); });
    let found = [], count = 0, city = "", kind = KINDS[0];

    $("actForm").addEventListener("submit", async e => {
      e.preventDefault();
      city = $("actCity").value.trim(); kind = KINDS[+sel.value];
      if (city.length < 2) { status("Type the city you're meeting in.", true); $("actCity").focus(); return; }
      $("actGo").disabled = true; $("actList").innerHTML = ""; $("actMore").hidden = true; $("actLinks").hidden = true; count = 0;
      status("Looking for " + kind[0].toLowerCase() + " in " + city + "…");
      try {
        if (kind[1] === "links") { found = []; tourLinks(city); status("Tours and experiences open on these sites, with reviews and booking."); return; }
        if (kind[1]) found = (await nominatim(kind[1], city)).map(x => ({ n: x.name, d: [area(x), street(x)].filter(Boolean).join(" · "), lat: +x.lat, lon: +x.lon, web: safeUrl((x.extratags || {}).website || "") }));
        else {
          const g = await getJson("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=" + encodeURIComponent(city));
          if (!g[0]) { status("We couldn't find “" + city + "”. Try adding the state or country.", true); return; }
          const a = g[0].address || {};
          found = await window.CityTools.findSpots({ name: a.city || a.town || a.village || g[0].name, state: a.state || "", country: a.country || "", lat: +g[0].lat, lon: +g[0].lon });
        }
        if (!found.length) { status("We couldn't find " + kind[0].toLowerCase() + " in " + city + ". Try another kind of thing to do.", true); return; }
        status(found.length + " " + kind[0].toLowerCase() + " in " + city + ".");
        more();
      } catch (err) {
        status("We couldn't reach the map service. Wait a few seconds and try again.", true);
      } finally { $("actGo").disabled = false; }
    });
    $("actMore").addEventListener("click", more);

    function tourLinks(c) {
      const box = $("actLinks"); box.innerHTML = "";
      linkRow(box, [["GetYourGuide", "https://www.getyourguide.com/s/?q=" + encodeURIComponent(c)], ["Airbnb Experiences", "https://www.airbnb.com/s/" + encodeURIComponent(c) + "/experiences"],
                    ["Tripadvisor things to do", "https://www.tripadvisor.com/Search?q=" + encodeURIComponent(c + " things to do")], ["Events this weekend", "https://www.google.com/search?q=" + encodeURIComponent("events in " + c + " this weekend")]]);
      box.querySelectorAll("a").forEach(a => { a.className = "btn ghost"; });
      box.hidden = false;
    }

    function more() {
      found.slice(count, count + PAGE).forEach(s => $("actList").appendChild(card(s)));
      count = Math.min(count + PAGE, found.length);
      $("actMore").hidden = count >= found.length;
      $("actMore").textContent = "Show more (" + (found.length - count) + ")";
      $("actCredit").hidden = false;
    }

    function card(s) {
      const li = document.createElement("li");
      li.className = "mcard2" + (s.img ? " pic" : "");
      li.innerHTML = (s.img ? '<img alt="" loading="lazy">' : "") + '<div class="mbody"><h4></h4><p class="mmeta"></p><div class="slinks"></div></div>';
      if (s.img) li.querySelector("img").src = s.img;
      li.querySelector("h4").textContent = s.n;
      li.querySelector(".mmeta").textContent = s.d ? s.d.charAt(0).toUpperCase() + s.d.slice(1) : city;
      const q = s.n + ", " + city, links = li.querySelector(".slinks");
      if (s.lat != null && window.CityTools) { const a = document.createElement("a"); a.textContent = "Street View"; a.target = "_blank"; a.rel = "noopener"; links.appendChild(a); window.CityTools.streetLink(a, s.lat, s.lon); }
      linkRow(links, [["Map", "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q)], ["Photos", "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(q)],
                      ["Website", s.web || ""], ["About", s.title ? "https://en.wikipedia.org/wiki/" + encodeURIComponent(s.title.replace(/ /g, "_")) : ""]]);
      addButton(li, s.n, city, kind[2], status);
      return li;
    }
  }
})();
