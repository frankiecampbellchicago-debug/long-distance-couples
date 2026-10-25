// Countdown Calendar (Plus): fill one door for every day until the visit, send the link, and they open one a day.
// The whole calendar lives in the link (compressed, after the #), so nothing is stored on a server.
// The person who receives it doesn't need Plus. Draft and opened doors are saved on each device.
(function () {
  const $ = id => document.getElementById(id);
  const DRAFT = "liita-countdown", OPENED = "liita-countdown-opened", MAX = 31, DAY = 864e5;

  const KINDS = {
    n: { name: "A note", label: "A note for today", ph: "Something you want them to read today" },
    s: { name: "A song", label: "A song for today", ph: "Song and artist, and why it made you think of them" },
    q: { name: "A question", label: "Today's question", ph: "A question for them to answer" },
    m: { name: "A little mission", label: "Today's mission", ph: "Something small for them to do today" },
    c: { name: "A coupon for the visit", label: "A coupon for the visit", ph: "Good for one…" },
    p: { name: "A photo", label: "A photo for today", ph: "A caption, then paste the photo's link below" }
  };
  const IDEAS = {
    n: ["The first thing I noticed about you was…", "Something you did this week that made me smile:", "My favorite memory of us so far is…", "Three things I can't wait to do when I see you:", "The moment I knew I liked you was…", "What I'd tell you right now if you were next to me:", "Something I've never told you:", "The little thing you do that I miss the most:"],
    s: ["The song I've had on repeat because of you", "The song that was playing the first time we…", "A song that sounds like how I feel about seeing you", "The song I want to play in the car when I pick you up", "Our song. Play it loud.", "A song I think you'll love that you've never heard"],
    q: ["If we could spend the first day anywhere, where would we go?", "What's the first thing you want to eat together?", "What's one thing you want to do on this visit that we've never done?", "What's a memory of us you think about when you can't sleep?", "What should we name our future dog?", "What's one thing I do that makes you feel loved?", "If we had a whole free day with no plans, how would you spend it?", "What are you most looking forward to?"],
    m: ["Look at the sky tonight and send me a photo of it", "Pick the first restaurant we go to", "Make a playlist for the drive and send it to me", "Pack one thing you want to show me", "Write down three things you want to do together, and don't show me until the visit", "Send me a voice note of you saying good morning", "Find one place near me you've never been and want to try", "Go to bed early. You'll need the energy."],
    c: ["Good for one breakfast in bed", "Good for one movie of your choice, no complaining", "Good for one long walk wherever you want", "Good for one back rub, no time limit", "Good for picking every song in the car for a whole day", "Good for one dinner I cook, you choose the dish", "Good for one lazy morning with no alarms", "Good for one yes to anything (within reason)"],
    p: ["A photo from our last visit", "The view from my window right now", "A photo of us I've never shown you", "Where I'll be waiting for you"]
  };
  const LAST = "The last door. Today we're together.";
  // each kind gets a color and an icon, on the editor tiles, the doors and the letter
  const KCOL = { n: "#a8362f", s: "#2c4a7a", q: "#5f7148", m: "#9a5b16", c: "#7a3a6a", p: "#2f6f6a" };
  const svg = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  const ICON = {
    n: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    s: svg('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
    q: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7v.5M12 17h.01"/>'),
    m: svg('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
    c: svg('<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v8a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2z"/><path d="M14 6v12" stroke-dasharray="2 2.5"/>'),
    p: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
    heart: svg('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>'),
    lock: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>')
  };

  // dates are "YYYY-MM-DD", read as local midnight
  const day = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const ymd = t => { const d = new Date(t); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const between = (a, b) => Math.round((b - a) / DAY);
  // n calendar days before a date (not n × 24 hours, which drifts an hour across daylight saving)
  const back = (t, n) => { const d = new Date(t); return +new Date(d.getFullYear(), d.getMonth(), d.getDate() - n); };
  const fmt = (t, o) => new Date(t).toLocaleDateString("en-US", o || { weekday: "short", month: "short", day: "numeric" });
  const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const { load, store, safeUrl, share } = window.PlusKit;
  async function unpack(code) {
    const cal = await window.PlusKit.unpack(code);
    if (!cal || !/^\d{4}-\d{2}-\d{2}$/.test(cal.w) || !Array.isArray(cal.d) || !cal.d.length) throw new Error("bad calendar");
    cal.d = cal.d.slice(0, MAX).map(x => [KINDS[x[0]] ? x[0] : "n", String(x[1] || "").slice(0, 400), String(x[2] || "").slice(0, 600)]);
    return cal;
  }
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36); };

  window.setupCountdown = function () {
    $("countdown").hidden = false;
    // pasting a calendar link into a tab already on this page only changes the #, so reload to open it
    addEventListener("hashchange", () => location.reload());
    const code = window.PlusKit.fromHash("cal");
    if (code) {
      $("cdMake").hidden = true;
      unpack(code).then(cal => { view(cal, false, hash(code)); $("countdown").scrollIntoView({ block: "start" }); })
        .catch(() => { $("cdView").hidden = false; $("cdHead").textContent = "This calendar link looks broken"; $("cdClock").textContent = "Ask them to send it again, and make sure you copy the whole link."; });
      return;
    }
    make();
  };

  // ---- making one ----
  function make() {
    const draft = load(DRAFT, { a: "", b: "", w: "", d: [] });
    const t0 = today();
    if (!draft.w || day(draft.w) < t0) draft.w = ymd(back(t0, -14));
    $("cdFrom").value = draft.a; $("cdTo").value = draft.b;
    $("cdWhen").min = ymd(t0); $("cdWhen").value = draft.w;
    let doors = draft.d;

    const save = () => store(DRAFT, { a: $("cdFrom").value.trim(), b: $("cdTo").value.trim(), w: $("cdWhen").value, d: doors });
    const size = () => Math.min(MAX, Math.max(1, between(today(), day($("cdWhen").value)) + 1));
    // keep doors lined up with the visit day when the date moves: the last door is always the visit itself
    const fit = n => { doors = doors.slice(-n); while (doors.length < n) doors.unshift(["n", "", ""]); };
    const count = () => {
      const n = doors.length, full = doors.filter(x => x[1].trim()).length;
      $("cdCount").textContent = plural(n, "door") + " to fill · " + full + " done" + (between(today(), day($("cdWhen").value)) + 1 > MAX ? " · it starts " + MAX + " days before the visit" : "");
      // the little calendar up top fills in as doors do
      $("cdMini").innerHTML = doors.map((x, i) => '<li><button type="button" data-i="' + i + '" class="' + (x[1].trim() ? "full" : "") + (i === n - 1 ? " last" : "") + '" style="--k:' + KCOL[x[0]] + '" aria-label="Door ' + (i + 1) + (x[1].trim() ? ", filled" : ", empty") + '">' + (i === n - 1 ? "♥" : n - 1 - i) + "</button></li>").join("");
    };

    function render() {
      const w = $("cdWhen").value;
      if (!w || day(w) < today()) { $("cdDoors").innerHTML = ""; $("cdCount").textContent = "Pick a day that hasn't happened yet."; return; }
      fit(size());
      const list = $("cdDoors"), n = doors.length, visit = +day(w);
      list.innerHTML = "";
      doors.forEach((x, i) => {
        const left = n - 1 - i, li = document.createElement("li");
        li.className = "cdrow"; li.dataset.i = i;
        li.style.setProperty("--k", KCOL[x[0]]);
        li.innerHTML = '<div class="cdtile">' + (left ? ICON[x[0]] : ICON.heart) + '<i class="cdtnum">' + (left || "♥") + '</i><i class="cdtday">' + (left ? (left === 1 ? "day left" : "days left") : "together") + "</i></div>" +
          '<div class="cdrowbody"><div class="cdrowhead"><b></b><span></span></div>' +
          '<select aria-label="What goes behind this door">' + Object.keys(KINDS).map(k => '<option value="' + k + '">' + KINDS[k].name + "</option>").join("") + "</select>" +
          '<textarea rows="2" maxlength="280"></textarea>' +
          '<div class="cdrowfoot"><input type="url" inputmode="url" placeholder="Link (optional): a song, a photo, a video"><button class="linkbtn" type="button">Give me an idea</button></div></div>';
        li.querySelector("b").textContent = left ? "Door " + (i + 1) : "The visit";
        li.querySelector("span").textContent = fmt(back(visit, left)) + (left ? " · " + plural(left, "day") + " to go" : " · you're together");
        li.querySelector("select").value = x[0];
        const ta = li.querySelector("textarea"); ta.value = x[1]; ta.placeholder = left ? KINDS[x[0]].ph : LAST;
        ta.setAttribute("aria-label", li.querySelector("b").textContent + ", " + li.querySelector("span").textContent);
        li.querySelector("input").value = x[2];
        list.appendChild(li);
      });
      count(); save();
    }

    const row = e => e.target.closest(".cdrow");
    $("cdDoors").addEventListener("input", e => {
      const li = row(e); if (!li) return;
      const x = doors[li.dataset.i];
      if (e.target.tagName === "TEXTAREA") x[1] = e.target.value;
      if (e.target.tagName === "INPUT") x[2] = e.target.value;
      li.classList.remove("empty"); count(); save();
    });
    $("cdDoors").addEventListener("change", e => {
      const li = row(e); if (!li || e.target.tagName !== "SELECT") return;
      const x = doors[li.dataset.i]; x[0] = e.target.value;
      li.style.setProperty("--k", KCOL[x[0]]);
      if (+li.dataset.i < doors.length - 1) li.querySelector(".cdtile svg").outerHTML = ICON[x[0]];
      count();
      if (+li.dataset.i < doors.length - 1) li.querySelector("textarea").placeholder = KINDS[x[0]].ph;
      save();
    });
    const idea = (x, i) => {
      const used = new Set(doors.map(d => d[1]));
      if (i === doors.length - 1) { x[1] = LAST; return; }
      const fresh = IDEAS[x[0]].filter(t => !used.has(t));
      x[1] = pick(fresh.length ? fresh : IDEAS[x[0]]);
    };
    $("cdDoors").addEventListener("click", e => {
      const li = row(e); if (!li || e.target.tagName !== "BUTTON") return;
      const i = +li.dataset.i, x = doors[i];
      idea(x, i); li.querySelector("textarea").value = x[1]; li.classList.remove("empty"); count(); save();
    });
    // empty doors get a mix: mostly notes and questions, a song or two, a coupon, a mission
    $("cdIdeas").addEventListener("click", () => {
      const mix = ["n", "q", "s", "m", "n", "c", "q", "p", "n", "s", "c", "m"];
      doors.forEach((x, i) => { if (x[1].trim()) return; if (i < doors.length - 1) x[0] = mix[i % mix.length]; idea(x, i); });
      render();
    });
    $("cdWhen").addEventListener("change", render);
    $("cdMini").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const li = $("cdDoors").children[b.dataset.i]; if (!li) return;
      $("cdDoors").scrollTo({ top: li.offsetTop - $("cdDoors").offsetTop, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      li.querySelector("textarea").focus({ preventScroll: true });
    });
    ["cdFrom", "cdTo"].forEach(id => $(id).addEventListener("input", save));

    const build = () => ({ v: 1, a: $("cdFrom").value.trim().slice(0, 40), b: $("cdTo").value.trim().slice(0, 40), w: $("cdWhen").value, d: doors.map(x => [x[0], x[1].trim(), safeUrl(x[2])]) });
    const ready = () => {
      $("cdErr").hidden = true;
      if (!$("cdFrom").value.trim()) return fail("Add your name so they know who it's from.", $("cdFrom"));
      const w = $("cdWhen").value;
      if (!w || day(w) < today()) return fail("Pick the day you'll see each other.", $("cdWhen"));
      const empty = [...$("cdDoors").children].filter(li => !doors[li.dataset.i][1].trim());
      empty.forEach(li => li.classList.add("empty"));
      if (empty.length) return fail(plural(empty.length, "door") + (empty.length === 1 ? " is" : " are") + " still empty. Fill " + (empty.length === 1 ? "it" : "them") + ", or tap Fill the empty doors with ideas.", empty[0].querySelector("textarea"));
      return true;
    };
    const fail = (msg, el) => { $("cdErr").textContent = msg; $("cdErr").hidden = false; el.focus(); return false; };

    $("cdMakeLink").addEventListener("click", async () => {
      if (!ready()) return;
      const url = window.PlusKit.link("countdown-calendar", "cal", await window.PlusKit.pack(build()));
      $("cdLink").value = url; $("cdOut").hidden = false;
      $("cdOut").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    });
    $("cdSend").addEventListener("click", async () => {
      const name = $("cdTo").value.trim();
      if (!await share("Our countdown", (name ? name + ", I" : "I") + " made us a countdown. Open one door a day until I see you.", $("cdLink").value, $("cdSend"), "Link copied")) $("cdLink").select();
    });
    $("cdPreview").addEventListener("click", () => {
      if (!$("cdWhen").value || day($("cdWhen").value) < today()) return fail("Pick the day you'll see each other.", $("cdWhen"));
      $("cdMake").hidden = true; view(build(), true);
      $("countdown").scrollIntoView({ block: "start" });
    });
    $("cdBack").addEventListener("click", () => {
      clearInterval(clock); $("cdView").hidden = true; $("cdMake").hidden = false;
      $("countdown").scrollIntoView({ block: "start" });
    });

    render();
  }

  // ---- opening one ----
  let clock;
  function view(cal, peek, key) {
    $("cdView").hidden = false; $("cdPeek").hidden = !peek; $("cdReveal").hidden = true;
    const n = cal.d.length, visit = +day(cal.w), from = cal.a || "them";
    const all = load(OPENED, {}), opened = new Set(peek ? [] : all[key] || []);
    $("cdFromLine").textContent = (cal.b ? "For " + cal.b + " · " : "") + "From " + from;

    function tickClock() {
      const left = between(today(), visit), ms = visit - Date.now();
      $("cdHead").textContent = left > 1 ? left + " days until you see " + from : left === 1 ? "Tomorrow you see " + from : left === 0 ? "Today's the day" : "You made it";
      if (ms <= 0) { $("cdFlip").hidden = true; $("cdClock").textContent = left === 0 ? "Go open the last door." : "Every door is open now. Hope the visit was everything."; return; }
      const s = Math.floor(ms / 1000), p = v => String(v).padStart(2, "0");
      $("cdClock").textContent = fmt(visit, { weekday: "long", month: "long", day: "numeric" });
      $("cdFlip").hidden = false;
      [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].forEach((v, i) => { const b = $("cdFlip").children[i].firstChild, t = i ? p(v) : String(v); if (b.textContent !== t) b.textContent = t; });
    }
    clearInterval(clock); tickClock(); clock = setInterval(tickClock, 1000);

    const grid = $("cdGrid");
    function drawGrid() {
      grid.innerHTML = "";
      const t0 = +today();
      cal.d.forEach((x, i) => {
        const left = n - 1 - i, when = back(visit, left), can = peek || when <= t0, li = document.createElement("li"), b = document.createElement("button");
        b.type = "button"; b.className = "cddoor" + (opened.has(i) ? " opened" : can ? " ready" : " locked") + (left ? "" : " last");
        b.disabled = !can; b.dataset.i = i;
        if (!left) li.className = "cdlast";
        b.style.setProperty("--k", KCOL[x[0]]);
        // the inside (seen once it swings open) and the paper door on its hinge
        b.innerHTML = '<span class="cdinside">' + ICON[x[0]] + "<small></small></span>" +
          '<span class="cdleaf"><span class="cdnum"></span><small></small>' + (can ? "" : ICON.lock) + "</span>";
        b.querySelector(".cdinside small").textContent = KINDS[x[0]].name.replace(/^An? /, "");
        b.querySelector(".cdnum").textContent = left ? left : "♥";
        b.querySelector(".cdleaf small").textContent = !can ? "Opens " + fmt(when, { month: "short", day: "numeric" }) : left ? (left === 1 ? "day to go" : "days to go") : "Together";
        b.setAttribute("aria-label", (left ? plural(left, "day") + " to go" : "The visit") + ", " + (!can ? "opens " + fmt(when, { weekday: "long", month: "long", day: "numeric" }) : opened.has(i) ? "opened" : "ready to open"));
        li.appendChild(b); grid.appendChild(li);
      });
    }
    grid.onclick = e => {
      const b = e.target.closest(".cddoor"); if (!b || b.disabled) return;
      const i = +b.dataset.i;
      if (!peek) { opened.add(i); all[key] = [...opened]; store(OPENED, all); }
      const was = b.classList.contains("opened");
      drawGrid(); reveal(cal.d[i], n - 1 - i, from);
      // swing the door open the first time
      const nb = grid.querySelector('[data-i="' + i + '"]');
      if (nb && !was) { nb.classList.remove("opened"); void nb.offsetWidth; nb.classList.add("opened"); }
    };
    drawGrid();
    // land on today's door if it's waiting
    if (!peek) { const t = [...grid.querySelectorAll(".cddoor.ready")].pop(); if (t) t.classList.add("today"); }
  }

  function reveal([k, text, link], left, from) {
    const box = $("cdReveal");
    box.className = "cdreveal kind-" + k; box.hidden = false;
    box.style.setProperty("--k", KCOL[k]);
    $("cdIcon").innerHTML = left ? ICON[k] : ICON.heart;
    void box.offsetWidth; box.classList.add("in");
    $("cdKind").textContent = (left ? plural(left, "day") + " to go · " : "The visit · ") + KINDS[k].label;
    $("cdText").textContent = text;
    const a = $("cdLinkOut");
    const url = safeUrl(link) || (k === "s" ? "https://www.youtube.com/results?search_query=" + encodeURIComponent(text.split(/[\n,.]| because | - /)[0]) : "");
    a.hidden = !url; a.href = url || "#";
    a.textContent = k === "s" ? (link ? "Play it" : "Find it on YouTube") : k === "p" ? "See the photo" : "Open the link";
    $("cdAnswer").hidden = k !== "q";
    if (k === "q") {
      $("cdAns").value = "";
      $("cdAnsSend").onclick = async () => {
        const ans = $("cdAns").value.trim(); if (!ans) { $("cdAns").focus(); return; }
        const msg = "“" + text + "”\n" + ans;
        if (!await share("My answer", msg, "", $("cdAnsSend"), "Copied. Paste it to " + from)) location.href = "sms:?&body=" + encodeURIComponent(msg);
      };
    }
    box.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
  }
})();
