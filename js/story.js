// Our Story Timeline (Plus): add your moments together, with photos, and print it as a keepsake.
// Saved on this device. "Send it to them" shares the words (photos stay on your device) in a #story= link.
(function () {
  const $ = id => document.getElementById(id);
  const K = window.PlusKit, KEY = "liita-story";
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  window.STORY_PROMPTS = [
    ["The first hello", "How did we start talking? Who said what first?"],
    ["The first long call", "The first time we lost track of time talking. What did we talk about?"],
    ["Meeting in person", "The first time we saw each other for real. What do you remember?"],
    ["The first “I love you”", "Who said it first, and how did it happen?"],
    ["Our first goodbye", "The first airport or station goodbye. How did it feel?"],
    ["A trip together", "Where did we go, and what's the moment you still think about?"],
    ["The hardest stretch", "A time the distance was really hard, and how we got through it."],
    ["An inside joke is born", "What's the joke, and where did it come from?"],
    ["The day we knew", "When did you know this was it?"]
  ];

  const fmt = s => { if (!s) return ""; const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); };
  const year = s => (s || "").slice(0, 4);
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const WORDS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  // the postmark on each moment: month, day and year, or "someday" for an undated one
  const post = d => {
    if (!d) return '<span class="stpost none" aria-hidden="true"><b>Some day</b></span>';
    const [y, m, dd] = d.split("-").map(Number);
    return '<span class="stpost" aria-hidden="true"><i>' + MON[m - 1] + "</i><b>" + dd + "</b><i>" + y + "</i></span>";
  };
  const sorted = m => m.slice().sort((a, b) => (a.d || "9999").localeCompare(b.d || "9999"));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // phones take huge photos; shrink to 900px so a whole timeline fits in the browser's storage
  const shrink = file => new Promise((ok, bad) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); ok(c.toDataURL("image/jpeg", .78));
    };
    img.onerror = () => { URL.revokeObjectURL(url); bad(); };
    img.src = url;
  });

  window.setupStory = function () {
    $("story").hidden = false;
    addEventListener("hashchange", () => location.reload());
    const code = K.fromHash("story");
    if (code) {
      K.unpack(code).then(s => { if (!s || !Array.isArray(s.m)) throw 0; received(s); $("story").scrollIntoView({ block: "start" }); })
        .catch(() => { $("stGot").hidden = false; $("stGotHead").textContent = "This link looks broken. Ask them to send it again."; });
      return;
    }
    edit();
  };

  function timeline(box, st, editable) {
    const m = sorted(st.m);
    box.innerHTML = "";
    if (!m.length) { box.innerHTML = '<li class="stghost"><span>Your first memory goes here</span><small>Start with how you met</small></li>'; return; }
    const since = st.since ? new Date(st.since + "T00:00") : null;
    // each year is a chapter: a tag on the thread, then its moments hung on alternating sides.
    // On a phone the two sides fold into one column, and order keeps them in date order.
    let y = null, ch = 0, n = 0, cols;
    m.forEach(x => {
      if (year(x.d) !== y) {
        y = year(x.d); ch++;
        const h = document.createElement("li"); h.className = "styear";
        h.innerHTML = '<span class="sttag"><small>Chapter ' + (WORDS[ch - 1] || ch) + "</small><b>" + esc(y || "Someday") + "</b></span>";
        const g = document.createElement("li"); g.className = "stgroup";
        g.innerHTML = '<div class="stcol l"></div><div class="stcol r"></div>';
        box.append(h, g); cols = g.children; n = 0;
      }
      const day = since && x.d ? Math.floor((new Date(x.d + "T00:00") - since) / 864e5) + 1 : 0;
      const li = document.createElement("div");
      li.className = "stmoment k" + (n % 4) + " tape" + (n % 4) + (x.img ? " pol" : ""); li.dataset.id = x.id;
      li.style.order = n;
      li.innerHTML = '<span class="stknot" aria-hidden="true"></span>' + post(x.d) +
        (x.img ? '<span class="stpol"><img alt="" src="' + x.img + '"></span>' : "") +
        '<p class="vh">' + esc(fmt(x.d) || "Undated") + "</p><h4>" + esc(x.t) + "</h4>" +
        (day > 0 ? '<p class="stday">Day ' + day.toLocaleString() + " of us</p>" : "") +
        (x.x ? '<p class="sttext">' + esc(x.x) + "</p>" : "") +
        (editable ? '<div class="stacts"><button class="linkbtn" type="button" data-act="edit">Edit</button><button class="linkbtn" type="button" data-act="del">Remove</button></div>' : "");
      cols[n++ % 2].appendChild(li);
    });
  }

  function edit() {
    const st = K.load(KEY, { a: "", b: "", since: "", m: [] });
    let editing = null, photo = "";
    $("stMake").hidden = false;
    $("stA").value = st.a; $("stB").value = st.b; $("stSince").value = st.since;
    const save = () => { if (!K.store(KEY, st)) { $("stErr").textContent = "Your browser is out of room for photos. Try a smaller photo, or remove one."; $("stErr").hidden = false; return false; } return true; };

    const head = () => {
      const n = st.m.length, d = st.since ? Math.floor((Date.now() - new Date(st.since + "T00:00")) / 864e5) : 0;
      $("stStats").textContent = (n ? n + (n === 1 ? " moment" : " moments") : "No moments yet") + (d > 0 ? " · " + d.toLocaleString() + " days together" : "");
      const a = $("stA").value.trim(), b = $("stB").value.trim();
      $("stNames").textContent = a && b ? a + " & " + b : a || b || "The two of us";
    };
    const draw = () => { timeline($("stList"), st, true); head(); };

    $("stPrompts").innerHTML = window.STORY_PROMPTS.map((p, i) => '<button type="button" class="stchip" data-i="' + i + '">' + esc(p[0]) + "</button>").join("");
    $("stPrompts").onclick = e => {
      const i = e.target.dataset.i; if (i === undefined) return;
      const [t, q] = window.STORY_PROMPTS[i];
      $("stPrompts").querySelectorAll(".stchip").forEach(b => b.classList.toggle("on", b === e.target));
      $("stTitle").value = t; $("stText").placeholder = q; $("stDate").focus();
    };
    ["stA", "stB", "stSince"].forEach(id => $(id).addEventListener("input", () => { st[id === "stA" ? "a" : id === "stB" ? "b" : "since"] = $(id).value.trim(); save(); head(); }));

    $("stPhoto").addEventListener("change", async () => {
      const f = $("stPhoto").files[0]; if (!f) return;
      try { photo = await shrink(f); $("stThumb").src = photo; $("stThumbWrap").hidden = false; } catch (e) { photo = ""; }
    });
    $("stNoPhoto").addEventListener("click", () => { photo = ""; $("stPhoto").value = ""; $("stThumbWrap").hidden = true; });

    const reset = () => {
      editing = null; photo = ""; $("stForm").reset(); $("stThumbWrap").hidden = true;
      $("stPrompts").querySelectorAll(".on").forEach(b => b.classList.remove("on"));
      $("stAdd").textContent = "Add it to our story"; $("stCancel").hidden = true; $("stText").placeholder = "What happened? What do you remember?";
    };
    $("stForm").addEventListener("submit", e => {
      e.preventDefault(); $("stErr").hidden = true;
      const t = $("stTitle").value.trim();
      if (!t) { $("stErr").textContent = "Give this moment a name."; $("stErr").hidden = false; $("stTitle").focus(); return; }
      const x = { id: editing || uid(), d: $("stDate").value, t, x: $("stText").value.trim(), img: photo };
      const i = st.m.findIndex(m => m.id === x.id), before = st.m.slice();
      if (i >= 0) st.m[i] = x; else st.m.push(x);
      if (!save()) { st.m = before; return; }
      reset(); draw();
      const li = $("stList").querySelector('[data-id="' + x.id + '"]'); if (li) li.scrollIntoView({ behavior: K.motion(), block: "nearest" });
    });
    $("stCancel").addEventListener("click", reset);
    $("stList").addEventListener("click", e => {
      const act = e.target.dataset.act; if (!act) return;
      const id = e.target.closest(".stmoment").dataset.id, x = st.m.find(m => m.id === id);
      if (act === "del") { st.m = st.m.filter(m => m.id !== id); save(); draw(); return; }
      editing = id; photo = x.img || "";
      $("stDate").value = x.d; $("stTitle").value = x.t; $("stText").value = x.x;
      $("stThumb").src = photo; $("stThumbWrap").hidden = !photo;
      $("stAdd").textContent = "Save changes"; $("stCancel").hidden = false;
      $("stForm").scrollIntoView({ behavior: K.motion(), block: "center" }); $("stTitle").focus({ preventScroll: true });
    });

    $("stPrint").addEventListener("click", () => keepsake(st));
    $("stSend").addEventListener("click", async () => {
      if (!st.m.length) { $("stErr").textContent = "Add a moment first."; $("stErr").hidden = false; return; }
      const url = K.link("our-story", "story", await K.pack({ v: 1, a: st.a, b: st.b, since: st.since, m: st.m.map(({ id, d, t, x }) => ({ id, d, t, x })) }));
      if (!await K.share("Our story", "I started writing down our story. Add what I missed.", url, $("stSend"), "Link copied")) { $("stLink").value = url; $("stLink").hidden = false; $("stLink").select(); }
    });
    draw();
  }

  // someone sent us their timeline: show it, and offer to merge it into ours
  function received(s) {
    $("stGot").hidden = false;
    $("stGotHead").textContent = (s.a && s.b ? s.a + " & " + s.b : "Our story") + ", so far";
    timeline($("stGotList"), s, false);
    $("stMerge").onclick = () => {
      const mine = K.load(KEY, { a: "", b: "", since: "", m: [] }), have = new Set(mine.m.map(m => m.id));
      s.m.forEach(m => { if (!have.has(m.id)) mine.m.push({ id: String(m.id), d: String(m.d || ""), t: String(m.t || "").slice(0, 120), x: String(m.x || "").slice(0, 2000), img: "" }); });
      if (!mine.a && s.b) mine.a = String(s.b).slice(0, 40);
      if (!mine.b && s.a) mine.b = String(s.a).slice(0, 40);
      if (!mine.since && s.since) mine.since = String(s.since);
      K.store(KEY, mine);
      location.href = location.pathname + "?d=our-story";
    };
  }

  // a clean page with just the story, for printing or saving as a PDF
  function keepsake(st) {
    const w = window.open("", "_blank");
    if (!w) { $("stErr").textContent = "Your browser blocked the keepsake window. Allow pop-ups for this site and try again."; $("stErr").hidden = false; return; }
    const names = st.a && st.b ? esc(st.a) + " &amp; " + esc(st.b) : "Our story";
    const items = sorted(st.m).map(x => '<article>' + (x.img ? '<img src="' + x.img + '" alt="">' : "") + '<p class="d">' + esc(fmt(x.d)) + "</p><h2>" + esc(x.t) + "</h2>" + (x.x ? "<p>" + esc(x.x) + "</p>" : "") + "</article>").join("");
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + names + '</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Nunito+Sans:wght@400;700&display=swap"><style>' +
      "body{margin:0;background:#f4e9d4;color:#2f241b;font:16px/1.6 'Nunito Sans',sans-serif}main{max-width:720px;margin:0 auto;padding:56px 32px}" +
      "header{text-align:center;margin-bottom:40px}header p{font:700 12px 'Nunito Sans';letter-spacing:.2em;text-transform:uppercase;color:#b4532f;margin:0}h1{font:600 56px/1.05 'Cormorant Garamond',serif;margin:8px 0}header em{font:italic 500 20px 'Cormorant Garamond',serif;color:#6d5a49}" +
      "article{border-left:2px solid #b4532f;padding:0 0 32px 24px;position:relative;break-inside:avoid}article::before{content:'';position:absolute;left:-7px;top:6px;width:12px;height:12px;border-radius:50%;background:#b4532f}" +
      "article img{display:block;max-width:100%;max-height:360px;border:8px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.15);margin-bottom:12px;transform:rotate(-1deg)}.d{font:700 12px 'Nunito Sans';letter-spacing:.14em;text-transform:uppercase;color:#b4532f;margin:0}h2{font:600 30px/1.15 'Cormorant Garamond',serif;margin:2px 0 6px}article p{white-space:pre-line;margin:0}" +
      "footer{text-align:center;font:italic 500 20px 'Cormorant Garamond',serif;color:#6d5a49;margin-top:16px}@page{margin:16mm}@media print{body{background:#fff}main{padding:0}}</style></head><body><main><header><p>Our story so far</p><h1>" + names + "</h1>" +
      (st.since ? "<em>since " + esc(fmt(st.since)) + "</em>" : "") + "</header>" + items + "<footer>To be continued.</footer></main><script>addEventListener('load',()=>setTimeout(()=>print(),400))<\/script></body></html>");
    w.document.close();
  }
})();
