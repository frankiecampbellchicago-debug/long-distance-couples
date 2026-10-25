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
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const safeUrl = u => { u = (u || "").trim(); if (!u) return ""; if (!/^https?:\/\//i.test(u)) u = "https://" + u; try { return /^https?:$/.test(new URL(u).protocol) ? u : ""; } catch (e) { return ""; } };

  // the calendar travels in the link: JSON, deflated where the browser can, then base64url
  const b64 = bytes => { let s = ""; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  const unb64 = s => { const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/")); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; };
  async function pack(cal) {
    const raw = new TextEncoder().encode(JSON.stringify(cal));
    if (window.CompressionStream) {
      try { return "z" + b64(new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer())); } catch (e) {}
    }
    return "j" + b64(raw);
  }
  async function unpack(code) {
    let bytes = unb64(code.slice(1));
    if (code[0] === "z") bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
    const cal = JSON.parse(new TextDecoder().decode(bytes));
    if (!cal || !/^\d{4}-\d{2}-\d{2}$/.test(cal.w) || !Array.isArray(cal.d) || !cal.d.length) throw new Error("bad calendar");
    cal.d = cal.d.slice(0, MAX).map(x => [KINDS[x[0]] ? x[0] : "n", String(x[1] || "").slice(0, 400), String(x[2] || "").slice(0, 600)]);
    return cal;
  }
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36); };

  async function share(title, text, url, btn, done) {
    try { if (navigator.share) { await navigator.share(url ? { title, text, url } : { title, text }); return true; } } catch (e) { return true; }
    try { await navigator.clipboard.writeText(url ? text + " " + url : text); const was = btn.textContent; btn.textContent = done; setTimeout(() => { btn.textContent = was; }, 2200); return true; }
    catch (e) { return false; }
  }

  window.setupCountdown = function () {
    $("countdown").hidden = false;
    // pasting a calendar link into a tab already on this page only changes the #, so reload to open it
    addEventListener("hashchange", () => location.reload());
    const code = (location.hash.match(/^#cal=([zj][A-Za-z0-9_-]+)$/) || [])[1];
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
        li.innerHTML = '<div class="cdrowhead"><b></b><span></span></div>' +
          '<select aria-label="What goes behind this door">' + Object.keys(KINDS).map(k => '<option value="' + k + '">' + KINDS[k].name + "</option>").join("") + "</select>" +
          '<textarea rows="2" maxlength="280"></textarea>' +
          '<div class="cdrowfoot"><input type="url" inputmode="url" placeholder="Link (optional): a song, a photo, a video"><button class="linkbtn" type="button">Give me an idea</button></div>';
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
      const url = location.origin + location.pathname + "?d=countdown-calendar#cal=" + await pack(build());
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
      if (ms <= 0) { $("cdClock").textContent = left === 0 ? "Go open the last door." : "Every door is open now. Hope the visit was everything."; return; }
      const s = Math.floor(ms / 1000), p = v => String(v).padStart(2, "0");
      $("cdClock").textContent = fmt(visit, { weekday: "long", month: "long", day: "numeric" }) + " · " + Math.floor(s / 3600) + ":" + p(Math.floor(s / 60) % 60) + ":" + p(s % 60) + " to go";
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
        b.innerHTML = '<span class="cdnum"></span><small></small>';
        b.firstChild.textContent = left ? left : "♥";
        b.lastChild.textContent = !can ? "Opens " + fmt(when, { month: "short", day: "numeric" }) : opened.has(i) ? KINDS[x[0]].name : left ? (left === 1 ? "day to go" : "days to go") : "Together";
        b.setAttribute("aria-label", (left ? plural(left, "day") + " to go" : "The visit") + ", " + (!can ? "opens " + fmt(when, { weekday: "long", month: "long", day: "numeric" }) : opened.has(i) ? "opened" : "ready to open"));
        li.appendChild(b); grid.appendChild(li);
      });
    }
    grid.onclick = e => {
      const b = e.target.closest(".cddoor"); if (!b || b.disabled) return;
      const i = +b.dataset.i;
      if (!peek) { opened.add(i); all[key] = [...opened]; store(OPENED, all); }
      drawGrid(); reveal(cal.d[i], n - 1 - i, from);
      const nb = grid.querySelector('[data-i="' + i + '"]'); if (nb) nb.classList.add("pop");
    };
    drawGrid();
    // land on today's door if it's waiting
    if (!peek) { const t = [...grid.querySelectorAll(".cddoor.ready")].pop(); if (t) t.classList.add("today"); }
  }

  function reveal([k, text, link], left, from) {
    const box = $("cdReveal");
    box.className = "cdreveal kind-" + k; box.hidden = false;
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
