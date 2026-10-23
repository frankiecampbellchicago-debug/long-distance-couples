// "Use my location" for any place box on a date page: asks the browser where you are, turns that into
// an address or a city name, fills the box and runs the search. Nothing is saved.
window.addLocateButton = function (input, opts) {
  const b = document.createElement("button");
  b.type = "button"; b.className = "locbtn";
  b.innerHTML = '<svg class="bi" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg> <span>Use my location</span>';
  input.closest(".field").appendChild(b);
  const label = b.lastChild, say = (msg, err) => opts.status && opts.status(msg, err);
  const done = () => { b.disabled = false; label.textContent = "Use my location"; };

  const getJson = async url => {
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 8000);
    try { const r = await fetch(url, { signal: ctrl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
    finally { clearTimeout(timer); }
  };
  const uniq = parts => parts.filter((v, i, a) => v && a.indexOf(v) === i).join(", ");

  async function describe(lat, lon) {
    try {
      const f = (await getJson("https://photon.komoot.io/reverse?lang=en&lat=" + lat + "&lon=" + lon)).features[0];
      if (f) {
        const p = f.properties;
        if (opts.kind === "city") return uniq([p.city || p.town || p.name, p.state, p.country]);
        return uniq([[p.housenumber, p.street].filter(Boolean).join(" ") || p.name, p.city, p.state, p.postcode]);
      }
    } catch (e) {}
    const n = await getJson("https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" + lat + "&lon=" + lon + "&zoom=" + (opts.kind === "city" ? 10 : 18));
    const a = n.address || {};
    if (opts.kind === "city") return uniq([a.city || a.town || a.village || a.county, a.state, a.country]);
    return uniq([[a.house_number, a.road].filter(Boolean).join(" "), a.city || a.town || a.village, a.state, a.postcode]);
  }

  b.addEventListener("click", () => {
    if (!navigator.geolocation) { say("Your browser can't share your location. Type it in instead.", true); return; }
    b.disabled = true; label.textContent = "Finding you…";
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const text = await describe(pos.coords.latitude, pos.coords.longitude);
        if (!text) throw new Error("no place");
        input.value = text;
        delete input.dataset.id;
        done();
        input.form.requestSubmit();
      } catch (e) {
        done(); say("We found you, but couldn't name the place. Type it in instead.", true);
      }
    }, err => {
      done();
      say(err.code === 1 ? "Location is turned off for this site. Allow it in your browser, or type it in instead." : "We couldn't get your location. Type it in instead.", true);
    }, { timeout: 12000, maximumAge: 300000, enableHighAccuracy: opts.kind !== "city" });
  });
};
