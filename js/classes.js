// "Take a class together": pick a kind of class and a city, get one-tap searches on the sites people book classes
// through (with the class and city filled in), plus studios and schools found on OpenStreetMap near you.
(function () {
  const $ = id => document.getElementById(id);

  // name, what to search the booking sites for, words that show up in studio names, OpenStreetMap kinds of place
  const KINDS = [
    ["Pottery", "pottery class", ["pottery", "ceramic", "clay"], ["craft:pottery", "shop:pottery", "amenity:arts_centre", "shop:craft", "craft:atelier"]],
    ["Salsa dancing", "salsa dance class", ["salsa", "dance", "latin"], ["amenity:dancing_school", "leisure:dance"]],
    ["Ballroom & swing dancing", "ballroom dance lessons", ["ballroom", "dance", "swing", "tango"], ["amenity:dancing_school", "leisure:dance"]],
    ["Cooking", "couples cooking class", ["cooking", "culinary", "kitchen", "chef"], ["amenity:cooking_school", "amenity:school", "amenity:college", "shop:kitchen"]],
    ["Pasta & sushi making", "pasta making class", ["pasta", "sushi", "cooking", "culinary"], []],
    ["Painting & sip and paint", "sip and paint class", ["paint", "art studio", "canvas", "pinot"], ["amenity:arts_centre", "shop:art", "craft:atelier", "shop:craft"]],
    ["Cocktail making", "cocktail making class", ["cocktail", "mixology", "bar"], []],
    ["Wine tasting", "wine tasting class", ["wine", "winery", "vineyard"], ["craft:winery"]],
    ["Glassblowing", "glassblowing class", ["glass"], ["craft:glass", "craft:atelier", "shop:craft", "amenity:arts_centre"]],
    ["Candle & perfume making", "candle making class", ["candle", "perfume", "scent"], ["shop:craft", "shop:perfumery", "craft:atelier", "shop:gift"]],
    ["Jewelry making", "jewelry making class", ["jewelry", "jewellery", "silver", "bead"], ["craft:jeweller", "shop:jewelry", "shop:craft", "shop:beads"]],
    ["Woodworking", "woodworking class", ["wood", "makerspace", "workshop"], ["craft:carpenter", "leisure:hackerspace", "shop:craft", "craft:atelier"]],
    ["Flower arranging", "flower arranging class", ["flower", "floral", "florist"], ["shop:florist"]],
    ["Rock climbing", "intro to climbing class", ["climbing", "boulder", "climb"], ["leisure:sports_centre", "leisure:fitness_centre", "sport:climbing"]],
    ["Yoga", "couples yoga class", ["yoga"], ["leisure:fitness_centre", "leisure:sports_centre"]],
    ["Photography", "photography class", ["photo", "camera"], ["shop:photo", "amenity:arts_centre", "craft:photographer"]],
    ["Improv comedy", "improv class", ["improv", "comedy", "theater", "theatre"], ["amenity:theatre", "amenity:arts_centre"]],
    ["Music & singing", "music lessons", ["music", "guitar", "piano", "vocal"], ["amenity:music_school", "amenity:school", "shop:musical_instrument"]],
    ["Language", "language class", ["language", "spanish", "french", "italian"], ["amenity:language_school", "amenity:school"]],
    ["Archery & axe throwing", "archery lesson", ["archery", "axe"], ["leisure:sports_centre", "sport:archery", "leisure:pitch"]]
  ];
  const STATES = { Alabama: "al", Alaska: "ak", Arizona: "az", Arkansas: "ar", California: "ca", Colorado: "co", Connecticut: "ct", Delaware: "de", Florida: "fl", Georgia: "ga",
    Hawaii: "hi", Idaho: "id", Illinois: "il", Indiana: "in", Iowa: "ia", Kansas: "ks", Kentucky: "ky", Louisiana: "la", Maine: "me", Maryland: "md", Massachusetts: "ma",
    Michigan: "mi", Minnesota: "mn", Mississippi: "ms", Missouri: "mo", Montana: "mt", Nebraska: "ne", Nevada: "nv", "New Hampshire": "nh", "New Jersey": "nj",
    "New Mexico": "nm", "New York": "ny", "North Carolina": "nc", "North Dakota": "nd", Ohio: "oh", Oklahoma: "ok", Oregon: "or", Pennsylvania: "pa", "Rhode Island": "ri",
    "South Carolina": "sc", "South Dakota": "sd", Tennessee: "tn", Texas: "tx", Utah: "ut", Vermont: "vt", Virginia: "va", Washington: "wa", "West Virginia": "wv",
    Wisconsin: "wi", Wyoming: "wy", "District of Columbia": "dc" };
  const slug = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const getJson = async (url, ms) => {
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), ms || 10000);
    try { const r = await fetch(url, { signal: ctrl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
    finally { clearTimeout(timer); }
  };
  function km(a, b, c, d) {
    const r = x => x * Math.PI / 180, dl = r(c - a), dn = r(d - b);
    const h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dn / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(h));
  }
  const PLACE = { pottery: "Pottery studio", dancing_school: "Dance school", dance: "Dance studio", cooking_school: "Cooking school", arts_centre: "Arts center", craft: "Craft shop",
    atelier: "Studio", art: "Art shop", music_school: "Music school", language_school: "Language school", fitness_centre: "Studio", sports_centre: "Sports center",
    winery: "Winery", wine: "Wine shop", florist: "Florist", glass: "Glass studio", jeweller: "Jeweler", jewelry: "Jewelry shop", theatre: "Theater", hackerspace: "Makerspace",
    bar: "Bar", pub: "Pub", restaurant: "Restaurant", school: "School", college: "College", photo: "Photo shop", perfumery: "Perfume shop", carpenter: "Workshop" };

  window.setupClasses = function () {
    $("classes").hidden = false;
    const status = (msg, err) => { $("classStatus").textContent = msg; $("classStatus").classList.toggle("err", !!err); };
    window.addLocateButton($("classCity"), { kind: "city", status });
    const sel = $("classKind");
    KINDS.forEach(([n], i) => { const o = document.createElement("option"); o.value = i; o.textContent = n; sel.appendChild(o); });
    sel.addEventListener("change", () => { $("classQ").value = ""; if ($("classCity").value.trim().length > 1) $("classForm").requestSubmit(); });
    try { const c = localStorage.getItem("liita-sky") || localStorage.getItem("liita-city"); if (c && !$("classCity").value) $("classCity").value = c; } catch (e) {}

    $("classForm").addEventListener("submit", async e => {
      e.preventDefault();
      const cityQ = $("classCity").value.trim(), typed = $("classQ").value.trim();
      if (cityQ.length < 2) { status("Type the city where you'll take the class, or use your location.", true); $("classCity").focus(); return; }
      // a typed class wins; otherwise the dropdown; a typed word that matches a kind uses that kind's map search too
      const tl = typed.toLowerCase();
      const kind = typed ? (KINDS.find(k => k[0].toLowerCase().includes(tl) || k[2].some(w => tl.includes(w))) || null) : KINDS[+sel.value];
      const what = typed ? (/class|lesson|workshop/i.test(typed) ? typed : typed + " class") : kind[1];
      const label = typed || kind[0];
      $("classGo").disabled = true; $("classList").innerHTML = ""; $("classMapHead").hidden = true;
      status("Finding " + cityQ + "…");
      try {
        let city = null;
        try {
          const f = (await getJson("https://photon.komoot.io/api/?limit=1&lang=en&osm_tag=place&q=" + encodeURIComponent(cityQ))).features[0];
          if (f) city = { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], name: f.properties.name, state: f.properties.state || "", country: f.properties.country || "", cc: (f.properties.countrycode || "").toLowerCase() };
        } catch (e2) {}
        if (!city) {
          const n = (await getJson("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=" + encodeURIComponent(cityQ)))[0];
          if (n) { const a = n.address || {}; city = { lat: +n.lat, lon: +n.lon, name: a.city || a.town || a.village || n.name, state: a.state || "", country: a.country || "", cc: (a.country_code || "").toLowerCase() }; }
        }
        if (!city) { status("We couldn't find “" + cityQ + "”. Try adding the state or country.", true); return; }
        try { localStorage.setItem("liita-city", cityQ); } catch (e3) {}
        bookingLinks(what, label, city);
        status("Looking for " + label.toLowerCase() + " studios on the map…");
        const places = kind ? await mapSearch(kind, city) : null;
        showPlaces(places, label, city);
        status("");
      } catch (err) {
        status("We couldn't reach the map service. Wait a few seconds and try again.", true);
      } finally { $("classGo").disabled = false; }
    });

    function bookingLinks(what, label, city) {
      const where = [city.name, city.state && city.cc === "us" ? city.state : city.country].filter(Boolean).join(", ");
      const st = STATES[city.state];
      const ebLoc = city.cc === "us" && st ? st + "--" + slug(city.name) : slug(city.country || "") + "--" + slug(city.name);
      const sites = [
        ["Google Maps", "Studios with reviews, hours and photos", "https://www.google.com/maps/search/" + encodeURIComponent(what + " near " + where)],
        ["Yelp", "Reviews from people who took the class", "https://www.yelp.com/search?find_desc=" + encodeURIComponent(what) + "&find_loc=" + encodeURIComponent(where)],
        ["Eventbrite", "One-time workshops with dates and tickets", "https://www.eventbrite.com/d/" + ebLoc + "/" + slug(what) + "/"],
        ["Airbnb Experiences", "Classes run by local hosts", "https://www.airbnb.com/s/" + encodeURIComponent(where) + "/experiences?query=" + encodeURIComponent(what)],
        ["Google", "Everything else, including deals", "https://www.google.com/search?q=" + encodeURIComponent(what + " for couples in " + where)]
      ];
      const box = $("classLinks"); box.innerHTML = "";
      const h = document.createElement("h3"); h.textContent = "Book " + (/^[aeiou]/i.test(label) ? "an " : "a ") + label.toLowerCase() + " class in " + city.name;
      box.appendChild(h);
      const grid = document.createElement("div"); grid.className = "views";
      sites.forEach(([n, sub, href]) => {
        const a = document.createElement("a");
        a.className = "view"; a.href = href; a.target = "_blank"; a.rel = "noopener";
        a.innerHTML = '<span><strong></strong><small></small></span>';
        a.querySelector("strong").textContent = n + " →"; a.querySelector("small").textContent = sub;
        grid.appendChild(a);
      });
      box.appendChild(grid);
      box.hidden = false;
    }

    // a few name searches near the city, limited to the kinds of place that kind of class happens in
    async function mapSearch(kind, city) {
      // some classes happen in restaurants and bars, which the map can't tell apart from places that teach
      if (!kind[3].length) return null;
      const d = 0.3, dLon = d / Math.cos(city.lat * Math.PI / 180);
      const box = [city.lon - dLon, city.lat - d, city.lon + dLon, city.lat + d].map(n => n.toFixed(4)).join(",");
      const tags = kind[3].map(t => "&osm_tag=" + encodeURIComponent(t)).join("");
      const sets = await Promise.all(kind[2].slice(0, 3).map(w => getJson("https://photon.komoot.io/api/?limit=30&lang=en&lat=" + city.lat + "&lon=" + city.lon + "&bbox=" + box + tags + "&q=" + encodeURIComponent(w))
        .then(j => j.features).catch(() => [])));
      const seen = new Set(), words = kind[2];
      return [].concat(...sets).map(f => {
        const p = f.properties, lat = f.geometry.coordinates[1], lon = f.geometry.coordinates[0];
        return { n: p.name || "", type: PLACE[p.osm_value] || PLACE[p.osm_key] || "", lat, lon, dist: km(city.lat, city.lon, lat, lon),
                 addr: [[p.housenumber, p.street].filter(Boolean).join(" "), p.district || p.city].filter(Boolean).join(", "), key: (p.name || "").toLowerCase() + "|" + (p.street || "") };
      }).filter(x => x.n && words.some(w => x.n.toLowerCase().includes(w.split(" ")[0])) && !/barn|supply|supplies|union|repair|replacement|hair|nail|tattoo|former/i.test(x.n))
        .filter(x => !seen.has(x.key) && seen.add(x.key))
        .sort((a, b) => a.dist - b.dist).slice(0, 12);
    }

    function showPlaces(places, label, city) {
      const ul = $("classList"); ul.innerHTML = "";
      if (places === null) { $("classMapHead").hidden = true; return; }
      $("classMapHead").hidden = false;
      $("classMapHead").textContent = places.length ? "Studios and schools on the map near " + city.name : "We didn't find " + label.toLowerCase() + " studios on the free map for " + city.name + ". The searches above will have them.";
      places.forEach(x => {
        const li = document.createElement("li");
        li.className = "mcard2";
        li.innerHTML = '<div class="mbody"><h4></h4><p class="mmeta"></p><div class="slinks"></div></div>';
        li.querySelector("h4").textContent = x.n;
        li.querySelector(".mmeta").textContent = [x.type, x.addr, x.dist < 1 ? "in the center" : x.dist.toFixed(0) + " km from the center"].filter(Boolean).join(" · ");
        const q = x.n + ", " + city.name, links = li.querySelector(".slinks");
        [["Classes & reviews", "https://www.google.com/search?q=" + encodeURIComponent(q + " classes")], ["Map", "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q)]]
          .forEach(([t, h], i) => { const a = document.createElement("a"); a.textContent = t; a.href = h; a.target = "_blank"; a.rel = "noopener"; if (!i) a.className = "strong"; links.appendChild(a); });
        if (window.tripBoardAddPlace) {
          const b = document.createElement("button"); b.type = "button"; b.className = "addbtn";
          const sync = () => { const on = window.tripBoardHas(x.n, city.name); b.textContent = on ? "✓ On your trip board" : "+ Add to trip board"; b.classList.toggle("on", on); };
          b.addEventListener("click", () => { if (window.tripBoardAddPlace(x.n, city.name, "Do")) status("Added " + x.n + " to Places to go on your trip board."); sync(); });
          sync(); li.querySelector(".mbody").appendChild(b);
        }
        ul.appendChild(li);
      });
      $("classCredit").hidden = false;
    }
  };
})();
