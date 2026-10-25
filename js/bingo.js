// Date Night Bingo (Plus): a card of long-distance moments you mark off together over a month.
// Five in a row wins the prize you set. Saved on this device; the card and its marks travel in a #bg= link.
(function () {
  const $ = id => document.getElementById(id);
  const K = window.PlusKit, KEY = "liita-bingo";
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  window.BINGO = [
    "Fell asleep on a call", "Sent a song that made us think of each other", "Watched a movie at the same time", "Ate the same dinner",
    "Mailed a real letter", "Sent a surprise delivery", "A call over two hours", "Said good morning before 8am",
    "Shared a sunset photo", "Played a game online together", "Learned something new together", "Called from somewhere outside",
    "Planned the next visit", "Sent a voice note", "Read the same chapter", "Cooked the same recipe",
    "Showed them my neighborhood", "Laughed until we cried", "Talked about the future", "Had a really deep talk",
    "Sent a selfie, no filter", "Sent a care package", "Took a walk together on the phone", "Dressed up for a video date",
    "Watched a sunrise together", "Worked out together", "Stargazed on the same night", "Shared a childhood photo",
    "Got ready together on video", "Made a playlist together", "Wrote what I love about them", "Sent flowers",
    "Did a Plus date together", "Said I love you in another language", "Ordered each other dinner", "Toured a museum online",
    "A call with no screens, just voices", "Told them about a dream I had", "Made holiday plans", "Sent a meme at 2am",
    "Had a full day with no fights", "Counted down the days out loud", "Shopped for something together online", "Sent a photo of my view"
  ];
  window.BINGO_PRIZES = [
    "The loser plans the next date night", "Winner picks the next movie", "The loser mails a care package",
    "Breakfast in bed on the next visit", "A massage on the next visit", "The loser cooks the first dinner together"
  ];
  const FREE = 12;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const newCard = () => { const c = shuffle(window.BINGO.slice()).slice(0, 24); c.splice(FREE, 0, ""); return c; };
  const LINES = [];
  for (let r = 0; r < 5; r++) LINES.push([0, 1, 2, 3, 4].map(c => r * 5 + c));
  for (let c = 0; c < 5; c++) LINES.push([0, 1, 2, 3, 4].map(r => r * 5 + c));
  LINES.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const short = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
  const valid = s => s && Array.isArray(s.c) && s.c.length === 25 && s.c.every(x => typeof x === "string") && Array.isArray(s.m) && s.m.length === 25;
  const fresh = () => ({ c: newCard(), m: Array(25).fill(""), r: window.BINGO_PRIZES[0], d: today() });

  window.setupBingo = function () {
    $("bingo").hidden = false;
    addEventListener("hashchange", () => location.reload());
    const code = K.fromHash("bg");
    let st = K.load(KEY, null);
    if (!valid(st)) st = fresh();
    if (code) {
      K.unpack(code).then(g => {
        if (!valid(g)) throw 0;
        const theirs = { c: g.c.map(x => String(x).slice(0, 60)), m: g.m.map(x => /^\d{4}-\d{2}-\d{2}$/.test(x) ? x : ""), r: String(g.r || "").slice(0, 100), d: String(g.d || today()) };
        const same = st.c.join("|") === theirs.c.join("|");
        // the same card: combine both sets of marks. A different one: ask before replacing.
        if (same) { theirs.m.forEach((x, i) => { if (x && !st.m[i]) st.m[i] = x; }); if (!st.r) st.r = theirs.r; K.store(KEY, st); history.replaceState(null, "", location.pathname + location.search); run(st, "merged"); }
        else { run(theirs, "preview"); $("bgTake").onclick = () => { K.store(KEY, theirs); location.href = location.pathname + "?d=date-bingo"; }; }
        $("bingo").scrollIntoView({ block: "start" });
      }).catch(() => run(st, ""));
      return;
    }
    run(st, "");
  };

  function run(st, mode) {
    const own = mode !== "preview";
    const save = () => own && K.store(KEY, st);
    let editing = false, celebrated = null;
    $("bgGotBar").hidden = mode !== "preview";
    $("bgMerged").hidden = mode !== "merged";
    $("bgTools").hidden = !own;
    $("bgPrize").value = st.r; $("bgPrize").readOnly = !own;
    $("bgPrizeIdeas").hidden = !own;
    $("bgPrizeIdeas").innerHTML = window.BINGO_PRIZES.map(p => '<button type="button" class="stchip">' + esc(p) + "</button>").join("");
    $("bgPrizeIdeas").onclick = e => { const b = e.target.closest(".stchip"); if (!b) return; st.r = b.textContent; $("bgPrize").value = st.r; save(); };
    $("bgPrize").oninput = () => { st.r = $("bgPrize").value.trim(); save(); };

    const lines = () => LINES.filter(l => l.every(i => i === FREE || st.m[i]));
    function draw() {
      const won = lines(), hot = new Set(won.flat());
      $("bgCard").innerHTML = st.c.map((t, i) => i === FREE
        ? '<li class="bgfree"><span>Free</span><small>We miss each other</small></li>'
        : '<li class="' + (st.m[i] ? "on" : "") + (hot.has(i) ? " win" : "") + '"><button type="button" data-i="' + i + '" aria-pressed="' + !!st.m[i] + '"' + (own ? "" : " disabled") + '><span>' + esc(t) + "</span>" + (st.m[i] ? '<em>' + esc(short(st.m[i])) + "</em>" : "") + "</button></li>").join("");
      $("bgCard").classList.toggle("editing", editing);
      const n = st.m.filter(Boolean).length;
      $("bgCount").textContent = n + " of 24 marked" + (won.length ? " · " + won.length + (won.length === 1 ? " bingo" : " bingos") : "");
      $("bgWin").hidden = !won.length;
      if (won.length) $("bgWinPrize").textContent = st.r || "Pick a prize below.";
      // celebrate a new line once, not on every redraw
      const key = won.map(l => l.join()).join("|");
      if (won.length && celebrated !== null && key !== celebrated && key.length > celebrated.length) { $("bgWin").classList.remove("pop"); void $("bgWin").offsetWidth; $("bgWin").classList.add("pop"); }
      celebrated = key;
      $("bgSince").textContent = st.d ? "Card started " + short(st.d) : "";
    }
    $("bgCard").onclick = e => {
      const b = e.target.closest("button[data-i]"); if (!b || !own) return;
      const i = +b.dataset.i;
      if (editing) {
        // swap this square for one that isn't on the card yet
        const pool = window.BINGO.filter(t => !st.c.includes(t));
        st.c[i] = pool[Math.floor(Math.random() * pool.length)] || st.c[i]; st.m[i] = "";
      } else st.m[i] = st.m[i] ? "" : today();
      save(); draw();
      const nb = $("bgCard").querySelector('[data-i="' + i + '"]'); if (nb) nb.focus();
    };
    $("bgEdit").onclick = () => { editing = !editing; $("bgEdit").textContent = editing ? "Done swapping" : "Swap squares"; $("bgEdit").setAttribute("aria-pressed", editing); $("bgHint").hidden = !editing; draw(); };
    let disarm;
    $("bgNew").onclick = () => {
      const b = $("bgNew");
      if (!b.dataset.armed) { b.dataset.armed = "1"; b.textContent = "Tap again for a new card"; disarm = setTimeout(() => { delete b.dataset.armed; b.textContent = "New card"; }, 4000); return; }
      clearTimeout(disarm); delete b.dataset.armed; b.textContent = "New card";
      Object.assign(st, fresh(), { r: st.r }); celebrated = null; save(); draw();
    };
    $("bgSend").onclick = async () => {
      const url = K.link("date-bingo", "bg", await K.pack({ v: 1, c: st.c, m: st.m, r: st.r, d: st.d }));
      if (!await K.share("Our bingo card", "Our date night bingo card. Mark what we've done and send it back:", url, $("bgSend"), "Link copied")) { $("bgLink").value = url; $("bgLink").hidden = false; $("bgLink").select(); }
    };
    draw();
  }
})();
