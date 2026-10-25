// Bucket List Builder (Plus): things to do together once you're in the same place, sorted by kind,
// ticked off with a dated stamp. Saved on this device; "Send it to them" shares it in a #bl= link.
(function () {
  const $ = id => document.getElementById(id);
  const K = window.PlusKit, KEY = "liita-bucket";
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const svg = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";

  // [key, name, color, icon, ideas]
  window.BUCKET = [
    ["go", "Places to go", "#2c5d8a", svg('<path d="M21.5 3.5 2.5 11l7 2.5 2.5 7Z"/><path d="m9.5 13.5 12-10"/>'),
      ["See the northern lights", "Take a train across a country", "Visit each other's hometown", "Spend a weekend in Paris", "Go to a national park", "Watch the sunset in Santorini", "Take a road trip with no plan"]],
    ["eat", "Things to eat", "#b4532f", svg('<path d="M4 3v8a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 0-3 2.5-3 6s1 4 3 4v8"/>'),
      ["Cook a three-course dinner together", "Find the best pizza in your city", "Eat street food in another country", "Have a picnic in the park", "Go to a fancy tasting menu", "Make pasta from scratch", "Try a food neither of us can pronounce"]],
    ["try", "Things to try", "#5f7148", svg('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
      ["Take a dance class", "Go hot air ballooning", "Go skiing or snowboarding", "Learn to surf", "Do a pottery class", "Go to a music festival", "Go camping under the stars"]],
    ["home", "Cozy at home", "#9a6a1c", svg('<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>'),
      ["Build a blanket fort", "Have a full movie marathon", "Do a 1000-piece puzzle", "Grow something together", "Bake a cake from scratch", "Sleep in with nowhere to be", "Have a game night with friends"]],
    ["firsts", "Firsts together", "#a8362f", svg('<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z"/>'),
      ["Our first holiday together", "Meet each other's families", "Our first trip abroad together", "Celebrate a birthday in person", "Wake up in the same place for a week", "Adopt a pet", "Get the keys to our own place"]],
    ["someday", "Someday", "#7a3a6a", svg('<path d="M15.5 4.5a7.5 7.5 0 1 0 4.5 11.8A8.2 8.2 0 0 1 15.5 4.5Z"/>'),
      ["Live in the same city", "Renew our promises somewhere beautiful", "Take a year off to travel", "Build a house", "Learn each other's language", "Grow old somewhere warm", "Write down our story"]]
  ];
  const CAT = Object.fromEntries(window.BUCKET.map(c => [c[0], c]));
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const stamp = d => { const [y, m, dd] = d.split("-").map(Number); return new Date(y, m - 1, dd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  window.setupBucket = function () {
    $("bucket").hidden = false;
    addEventListener("hashchange", () => location.reload());
    const code = K.fromHash("bl");
    if (code) {
      K.unpack(code).then(s => { if (!s || !Array.isArray(s.i)) throw 0; received(s); $("bucket").scrollIntoView({ block: "start" }); })
        .catch(() => { $("blGot").hidden = false; $("blGotHead").textContent = "This link looks broken. Ask them to send it again."; $("blMerge").hidden = true; });
      return;
    }
    edit();
  };

  // the list itself, grouped by kind; editable on your own device, read-only from a link
  function draw(box, items, editable, filter) {
    const show = items.filter(x => filter === "todo" ? !x.done : filter === "done" ? x.done : true);
    box.innerHTML = window.BUCKET.map(([key, name, color, icon]) => {
      const mine = show.filter(x => x.c === key); if (!mine.length) return "";
      const all = items.filter(x => x.c === key), n = all.filter(x => x.done).length;
      return '<section class="blgroup" style="--c:' + color + '"><h3><span class="blico">' + icon + "</span>" + esc(name) + "<small>" + n + " of " + all.length + "</small></h3><ul>" +
        mine.map(x => '<li class="' + (x.done ? "done" : "") + '" data-id="' + esc(x.id) + '">' +
          (editable ? '<button class="blcheck" type="button" data-act="tick" aria-pressed="' + !!x.done + '" aria-label="' + (x.done ? "Mark as not done: " : "Mark as done: ") + esc(x.t) + '"></button>' : '<span class="blcheck" aria-hidden="true"></span>') +
          '<span class="bltext">' + esc(x.t) + "</span>" +
          (x.done ? '<span class="blstamp"><b>Done</b>' + esc(stamp(x.done)) + "</span>" : "") +
          (editable ? '<button class="blx" type="button" data-act="del" aria-label="Remove ' + esc(x.t) + '">&times;</button>' : "") + "</li>").join("") +
        "</ul></section>";
    }).join("") || '<p class="blempty">' + (items.length ? "Nothing here yet." : "Your list is empty. Add the first thing you want to do together.") + "</p>";
  }

  function edit() {
    const st = Object.assign({ a: "", b: "", i: [] }, K.load(KEY, {}));
    let cat = "go", filter = "all";
    const save = () => K.store(KEY, st);
    $("blMake").hidden = false;
    $("blA").value = st.a; $("blB").value = st.b;
    ["blA", "blB"].forEach(id => $(id).addEventListener("input", () => { st[id === "blA" ? "a" : "b"] = $(id).value.trim(); save(); head(); }));

    const head = () => {
      const n = st.i.length, d = st.i.filter(x => x.done).length;
      $("blTitle").textContent = st.a && st.b ? st.a + " & " + st.b + "'s list" : "Our bucket list";
      $("blNum").textContent = d + " of " + n;
      $("blRing").style.setProperty("--done", n ? d / n : 0);
      $("blMsg").textContent = !n ? "Start with three things." : d === n ? "Every single one. Time to add more." : d ? (n - d) + " still to go." : "Nothing ticked off yet. Soon.";
    };
    const render = () => { draw($("blList"), st.i, true, filter); head(); };

    // category tabs for adding, each with ideas you can tap to add
    $("blCats").innerHTML = window.BUCKET.map(([key, name, color, icon]) => '<button type="button" role="tab" data-c="' + key + '" style="--c:' + color + '">' + icon + "<span>" + esc(name) + "</span></button>").join("");
    const pick = c => {
      cat = c;
      [...$("blCats").children].forEach(b => b.setAttribute("aria-selected", b.dataset.c === c));
      $("blAddBox").style.setProperty("--c", CAT[c][2]);
      const have = new Set(st.i.map(x => x.t.toLowerCase()));
      $("blIdeas").innerHTML = CAT[c][4].filter(t => !have.has(t.toLowerCase())).map(t => '<button type="button" class="blidea">' + esc(t) + "</button>").join("") || '<span class="blnone">You\'ve added every idea here. Write your own.</span>';
    };
    $("blCats").onclick = e => { const b = e.target.closest("button"); if (b) pick(b.dataset.c); };
    const add = t => {
      t = t.trim(); if (!t) return;
      if (st.i.some(x => x.t.toLowerCase() === t.toLowerCase())) { $("blErr").textContent = "That's already on your list."; $("blErr").hidden = false; return; }
      $("blErr").hidden = true;
      st.i.push({ id: uid(), t: t.slice(0, 120), c: cat, done: "" });
      if (!save()) { st.i.pop(); $("blErr").textContent = "Your browser is out of room."; $("blErr").hidden = false; return; }
      if (filter === "done") setFilter("all");
      render(); pick(cat);
    };
    $("blIdeas").onclick = e => { const b = e.target.closest(".blidea"); if (b) add(b.textContent); };
    $("blForm").addEventListener("submit", e => { e.preventDefault(); add($("blNew").value); $("blNew").value = ""; $("blNew").focus(); });

    const setFilter = f => { filter = f; [...$("blFilter").children].forEach(b => b.setAttribute("aria-pressed", b.dataset.f === f)); render(); };
    $("blFilter").onclick = e => { const f = e.target.dataset.f; if (f) setFilter(f); };
    $("blList").addEventListener("click", e => {
      const act = e.target.dataset.act; if (!act) return;
      const id = e.target.closest("li").dataset.id, x = st.i.find(m => m.id === id);
      if (act === "del") st.i = st.i.filter(m => m.id !== id);
      if (act === "tick") x.done = x.done ? "" : today();
      save(); render(); pick(cat);
      if (act === "tick") { const b = $("blList").querySelector('[data-id="' + id + '"] .blcheck'); if (b) b.focus(); }
    });
    $("blSend").onclick = async () => {
      if (!st.i.length) { $("blErr").textContent = "Add something first."; $("blErr").hidden = false; return; }
      const url = K.link("bucket-list", "bl", await K.pack({ v: 1, a: st.a, b: st.b, i: st.i.map(x => [x.t, x.c, x.done]) }));
      if (!await K.share("Our bucket list", "Our bucket list so far. Add yours to it:", url, $("blSend"), "Link copied")) { $("blLink").value = url; $("blLink").hidden = false; $("blLink").select(); }
    };
    pick(cat); render();
  }

  // someone sent us their list: show it, and offer to add it to ours
  function received(s) {
    const items = s.i.filter(x => Array.isArray(x) && CAT[x[1]]).map((x, k) => ({ id: "g" + k, t: String(x[0]).slice(0, 120), c: x[1], done: /^\d{4}-\d{2}-\d{2}$/.test(x[2]) ? x[2] : "" }));
    $("blGot").hidden = false;
    $("blGotHead").textContent = s.a && s.b ? s.a + " & " + s.b + "'s bucket list" : "Your bucket list";
    draw($("blGotList"), items, false, "all");
    $("blMerge").onclick = () => {
      const mine = Object.assign({ a: "", b: "", i: [] }, K.load(KEY, {})), have = new Map(mine.i.map(x => [x.t.toLowerCase(), x]));
      items.forEach(x => {
        const m = have.get(x.t.toLowerCase());
        if (m) { if (x.done && !m.done) m.done = x.done; } else mine.i.push({ id: (Date.now() + Math.random()).toString(36), t: x.t, c: x.c, done: x.done });
      });
      if (!mine.a && s.b) mine.a = String(s.b).slice(0, 40);
      if (!mine.b && s.a) mine.b = String(s.a).slice(0, 40);
      K.store(KEY, mine);
      location.href = location.pathname + "?d=bucket-list";
    };
  }
})();
