// Date Night Bingo (Plus): a card of long-distance moments you both mark off over a month. Each mark
// remembers who made it. Whoever finishes five in a row wins, and the other one draws a challenge.
// Saved on this device; the card, its marks and the challenge travel in a #bg= link.
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
  // what the loser has to do. You can remove any of these and add your own.
  window.BINGO_CHALLENGES = [
    "Sing them a love song on video. The whole chorus, no stopping.",
    "Send a voice note of your best impression of them.",
    "Write them a letter by hand and mail it this week.",
    "Let them pick your profile picture for a week.",
    "Cook a dish they choose and eat it with them on video.",
    "Wear an outfit they pick on your next video call.",
    "Text them three compliments a day for a week.",
    "Tell them an embarrassing story you've never told them.",
    "Dance to a song they choose, on camera, for a full minute.",
    "Write a short poem about them and read it out loud.",
    "Let them choose the next movie. No complaints allowed.",
    "Draw a portrait of them and send them a photo of it.",
    "Read them a bedtime story on a call.",
    "Talk in an accent they choose for ten minutes.",
    "Send them a dessert, delivered to their door.",
    "Make them a playlist of ten songs that remind you of them.",
    "Learn to say “I love you” in three languages and say them on a call.",
    "Call them first thing in the morning and sing them awake.",
    "Answer any three questions they ask, completely honestly.",
    "Hold a plank on camera while they count.",
    "Let them pick your phone wallpaper for a month.",
    "Tell them five things you love about them without laughing.",
    "Film a 30-second video on why you love them.",
    "Wear a silly hat on your next three calls.",
    "Plan the whole next date night, start to finish.",
    "Mail them a care package for under $20."
  ];
  const FREE = 12;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const newCard = () => { const c = shuffle(window.BINGO.slice()).slice(0, 24); c.splice(FREE, 0, ""); return c; };
  const LINES = [];
  for (let r = 0; r < 5; r++) LINES.push([0, 1, 2, 3, 4].map(c => r * 5 + c));
  for (let c = 0; c < 5; c++) LINES.push([0, 1, 2, 3, 4].map(r => r * 5 + c));
  LINES.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const isDay = x => /^\d{4}-\d{2}-\d{2}$/.test(x);
  const short = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
  const name = x => String(x || "").trim().slice(0, 40);
  const blank = () => ({ c: newCard(), m: Array(25).fill(""), w: Array(25).fill(""), d: today(), win: "", ch: "", done: "", deck: null, me: "", them: "" });
  // an older card, or one from a link: fill in anything missing and drop anything odd
  const clean = s => {
    if (!s || !Array.isArray(s.c) || s.c.length !== 25 || !Array.isArray(s.m) || s.m.length !== 25) return null;
    const out = blank();
    out.c = s.c.map(x => String(x).slice(0, 60));
    out.m = s.m.map(x => isDay(x) ? x : "");
    out.w = Array.isArray(s.w) && s.w.length === 25 ? s.w.map(name) : Array(25).fill("");
    out.d = isDay(s.d) ? s.d : today();
    out.win = name(s.win); out.ch = String(s.ch || "").slice(0, 200); out.done = isDay(s.done) ? s.done : "";
    out.deck = Array.isArray(s.deck) ? s.deck.map(x => String(x).slice(0, 160)).filter(Boolean).slice(0, 60) : null;
    out.me = name(s.me); out.them = name(s.them);
    return out;
  };
  const lines = st => LINES.filter(l => l.every(i => i === FREE || st.m[i]));
  const deck = st => st.deck && st.deck.length ? st.deck : window.BINGO_CHALLENGES;
  const draw = (st, not) => { const d = deck(st).filter(x => x !== not); return d[Math.floor(Math.random() * d.length)] || ""; };

  window.setupBingo = function () {
    $("bingo").hidden = false;
    addEventListener("hashchange", () => location.reload());
    const code = K.fromHash("bg");
    const st = clean(K.load(KEY, null)) || blank();
    if (!code) return run(st, "");
    K.unpack(code).then(g => {
      const theirs = clean(g); if (!theirs) throw 0;
      const from = name(g.from);
      if (st.c.join("|") === theirs.c.join("|")) {
        // the same card: combine both sets of marks, and keep whoever won first
        const had = lines(st).length;
        let latest = "";
        theirs.m.forEach((x, i) => { if (x && !st.m[i]) { st.m[i] = x; st.w[i] = theirs.w[i] || from; if (x >= latest) latest = x; } });
        if (from && from !== st.me) st.them = from;
        if (!st.win && theirs.win) { st.win = theirs.win; st.ch = theirs.ch; st.done = theirs.done; }
        else if (!st.win && !had && lines(st).length) { st.win = from || "They"; st.ch = draw(st); }
        if (st.win && theirs.done && !st.done && theirs.ch === st.ch) st.done = theirs.done;
        if (theirs.deck && !st.deck) st.deck = theirs.deck;
        K.store(KEY, st); history.replaceState(null, "", location.pathname + location.search);
        run(st, "merged");
      } else {
        theirs.me = st.me; theirs.them = from;
        run(theirs, "preview");
        $("bgTake").onclick = () => { K.store(KEY, theirs); location.href = location.pathname + "?d=date-bingo"; };
      }
      $("bingo").scrollIntoView({ block: "start" });
    }).catch(() => run(st, ""));
  };

  function run(st, mode) {
    const own = mode !== "preview";
    const save = () => own && K.store(KEY, st);
    let editing = false, celebrated = st.win;
    $("bgGotBar").hidden = mode !== "preview";
    $("bgMerged").hidden = mode !== "merged";
    $("bgTools").hidden = !own; $("bgDeckBox").hidden = !own;
    $("bgMe").value = st.me; $("bgMe").readOnly = !own;
    $("bgMe").oninput = () => {
      const was = st.me; st.me = name($("bgMe").value);
      // your old marks carry your new name
      st.w = st.w.map(x => x && x === was ? st.me : x); if (st.win && st.win === was) st.win = st.me;
      save(); paint();
    };

    const who = () => {
      const me = st.me || "You", them = st.them || st.w.find(x => x && x !== st.me) || "";
      const iWon = st.win === st.me || (!st.me && st.win === "You");
      return { me, them, iWon, loser: iWon ? (them || "Your partner") : (st.me || "You") };
    };
    function paint() {
      const won = lines(st), hot = new Set(won.flat());
      // a line can go away if someone unmarks a square
      if (!won.length && st.win) { st.win = ""; st.ch = ""; st.done = ""; save(); }
      $("bgCard").innerHTML = st.c.map((t, i) => {
        if (i === FREE) return '<li class="bgfree"><span>Free</span><small>We miss each other</small></li>';
        const by = st.w[i], mine = !by || by === st.me;
        return '<li class="' + (st.m[i] ? "on " + (mine ? "mine" : "theirs") : "") + (hot.has(i) ? " win" : "") + '"><button type="button" data-i="' + i + '" aria-pressed="' + !!st.m[i] + '"' + (own ? "" : " disabled") + '><span>' + esc(t) + "</span>" +
          (st.m[i] ? "<em>" + (by ? esc(by.split(" ")[0]) + " · " : "") + esc(short(st.m[i])) + "</em>" : "") + "</button></li>";
      }).join("");
      $("bgCard").classList.toggle("editing", editing);
      const n = st.m.filter(Boolean).length;
      $("bgCount").textContent = n + " of 24 marked" + (won.length ? " · " + won.length + (won.length === 1 ? " bingo" : " bingos") : "");
      $("bgSince").textContent = st.d ? "Card started " + short(st.d) : "";
      const w = who();
      $("bgKeyMe").textContent = w.me; $("bgKeyThem").textContent = w.them || "Them";
      $("bgWin").hidden = !st.win;
      if (st.win) {
        $("bgWinWho").textContent = w.iWon ? "You got it first." : st.win + " got it first.";
        $("bgChalWho").textContent = w.iWon ? (w.them ? w.them + "'s challenge" : "Their challenge") : "Your challenge";
        $("bgChal").textContent = st.ch;
        $("bgDone").hidden = !own || !!st.done; $("bgRedraw").hidden = !own || !!st.done;
        $("bgDoneMark").hidden = !st.done; $("bgDoneMark").textContent = st.done ? "✓ Done " + short(st.done) : "";
        if (celebrated !== st.win) { $("bgWin").classList.remove("pop"); void $("bgWin").offsetWidth; $("bgWin").classList.add("pop"); }
      }
      celebrated = st.win;
      paintDeck();
    }
    function paintDeck() {
      const d = deck(st);
      $("bgDeckCount").textContent = d.length;
      $("bgDeck").innerHTML = d.map((t, i) => '<li><span>' + esc(t) + '</span><button type="button" class="bgx" data-k="' + i + '" aria-label="Remove this challenge"' + (d.length < 2 ? " disabled" : "") + ">&times;</button></li>").join("");
      $("bgDeckReset").hidden = !st.deck;
    }

    $("bgCard").onclick = e => {
      const b = e.target.closest("button[data-i]"); if (!b || !own) return;
      const i = +b.dataset.i;
      if (editing) {
        // swap this square for one that isn't on the card yet
        const pool = window.BINGO.filter(t => !st.c.includes(t));
        st.c[i] = pool[Math.floor(Math.random() * pool.length)] || st.c[i]; st.m[i] = ""; st.w[i] = "";
      } else if (st.m[i]) { st.m[i] = ""; st.w[i] = ""; }
      else {
        st.m[i] = today(); st.w[i] = st.me;
        // the first line on the card wins, and the loser draws a challenge
        if (!st.win && lines(st).length) { st.win = st.me || "You"; st.ch = draw(st); }
      }
      save(); paint();
      const nb = $("bgCard").querySelector('[data-i="' + i + '"]'); if (nb) nb.focus();
    };
    $("bgRedraw").onclick = () => { st.ch = draw(st, st.ch); save(); paint(); };
    $("bgDone").onclick = () => { st.done = today(); save(); paint(); };

    $("bgDeck").onclick = e => {
      const b = e.target.closest(".bgx"); if (!b) return;
      st.deck = deck(st).filter((_, k) => k !== +b.dataset.k); save(); paintDeck();
    };
    $("bgDeckForm").onsubmit = e => {
      e.preventDefault();
      const t = $("bgDeckNew").value.trim(); if (!t) return;
      st.deck = deck(st).concat(t.slice(0, 160)); $("bgDeckNew").value = ""; save(); paintDeck();
      $("bgDeck").lastChild.scrollIntoView({ behavior: K.motion(), block: "nearest" });
    };
    $("bgDeckReset").onclick = () => { st.deck = null; save(); paintDeck(); };

    $("bgEdit").onclick = () => { editing = !editing; $("bgEdit").textContent = editing ? "Done swapping" : "Swap squares"; $("bgEdit").setAttribute("aria-pressed", editing); $("bgHint").hidden = !editing; paint(); };
    let disarm;
    $("bgNew").onclick = () => {
      const b = $("bgNew");
      if (!b.dataset.armed) { b.dataset.armed = "1"; b.textContent = "Tap again for a new card"; disarm = setTimeout(() => { delete b.dataset.armed; b.textContent = "New card"; }, 4000); return; }
      clearTimeout(disarm); delete b.dataset.armed; b.textContent = "New card";
      Object.assign(st, blank(), { deck: st.deck, me: st.me, them: st.them }); celebrated = ""; save(); paint();
    };
    $("bgSend").onclick = async () => {
      $("bgErr").hidden = true;
      if (!st.me) { $("bgErr").textContent = "Add your name first, so your marks show up as yours."; $("bgErr").hidden = false; $("bgMe").focus(); return; }
      const url = K.link("date-bingo", "bg", await K.pack({ v: 2, from: st.me, c: st.c, m: st.m, w: st.w, d: st.d, win: st.win, ch: st.ch, done: st.done, deck: st.deck }));
      if (!await K.share("Our bingo card", "Our date night bingo card. Mark what you've done and send it back:", url, $("bgSend"), "Link copied")) { $("bgLink").value = url; $("bgLink").hidden = false; $("bgLink").select(); }
    };
    paint();
  }
})();
