// Dream Life Night (Plus): seven chapters about the life you're building, talked through together,
// ending in a vision board you can download as an image or send as a link (#dream=).
(function () {
  const $ = id => document.getElementById(id);
  const K = window.PlusKit, KEY = "liita-dream";
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  // [key, chapter, talk about, board picks, label for the line you write]
  window.DREAM = [
    ["where", "Where we live", ["If we could live anywhere for five years, where would it be?", "City, small town, or the middle of nowhere?", "What would each of us miss about where we live now?"],
      ["A big city", "A small town", "By the ocean", "In the mountains", "Abroad", "Your city", "My city", "Somewhere new to both of us"], "Name the place, or your best guess"],
    ["home", "Our home", ["Describe the front door. What color is it?", "Which room do we spend the most time in?", "What's one thing the kitchen has to have?"],
      ["An apartment with a view", "An old house with character", "A cabin", "A farmhouse", "A little house, big yard", "A loft", "A place by the water"], "The one thing it has to have"],
    ["tuesday", "A normal Tuesday", ["Who wakes up first, and what do they do?", "What's dinner on a normal Tuesday?", "What do we do after dinner?"],
      ["Coffee together before work", "Walks after dinner", "Cooking together", "Working out together", "A show every night", "Reading in bed", "Game night"], "Our Tuesday, in one sentence"],
    ["work", "Work and money", ["What does each of us do for work in five years?", "What would we save up for together?", "What would we do with a year off?"],
      ["Both work from home", "Start something together", "Go back to school", "Save for a big trip", "Buy a place", "Pay off debt first", "A year off, someday"], "Our first money goal"],
    ["trips", "Adventures", ["What's the first big trip once we're together?", "What's on your bucket list that you've never said out loud?", "Where would we go every year?"],
      ["Japan", "Italy", "A road trip across the country", "The northern lights", "A safari", "A beach and nothing to do", "Somewhere neither of us can pronounce"], "The first big trip"],
    ["family", "Family, pets and people", ["Pets: what kind, how many, and what are their names?", "Kids: someday, no, or not sure? It's okay not to know yet.", "How close to our families do we want to live?"],
      ["A dog", "A cat", "Two of everything", "Kids someday", "No kids, lots of travel", "Not sure yet, and that's okay", "Close to family", "A lot of plants"], "Our first pet's name"],
    ["close", "Closing the distance", ["When could we realistically live in the same place?", "Who moves, or do we both move somewhere new?", "What's one step we can take this month?"],
      ["I move to you", "You move to me", "We both move somewhere new", "We work it out together"], "One step we'll take this month"]
  ];
  const D = window.DREAM;

  const monthsTo = ym => { if (!ym) return null; const [y, m] = ym.split("-").map(Number), n = new Date(); return (y - n.getFullYear()) * 12 + (m - 1 - n.getMonth()); };
  const monthName = ym => { const [y, m] = ym.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }); };
  const blank = () => ({ a: "", b: "", when: "", ch: {}, step: 0 });

  window.setupDream = function () {
    $("dream").hidden = false;
    addEventListener("hashchange", () => location.reload());
    const code = K.fromHash("dream");
    if (code) {
      K.unpack(code).then(s => { if (!s || typeof s.ch !== "object") throw 0; $("drGuide").hidden = true; board(s, true); $("dream").scrollIntoView({ block: "start" }); })
        .catch(() => { $("drBoardWrap").hidden = false; $("drBoard").innerHTML = '<p class="ppempty">This link looks broken. Ask them to send it again.</p>'; });
      return;
    }
    guide();
  };

  function guide() {
    const st = Object.assign(blank(), K.load(KEY, {}));
    const save = () => K.store(KEY, st);
    $("drA").value = st.a; $("drB").value = st.b;
    ["drA", "drB"].forEach(id => $(id).addEventListener("input", () => { st[id === "drA" ? "a" : "b"] = $(id).value.trim(); save(); }));

    $("drDots").innerHTML = D.map((c, i) => '<button type="button" data-i="' + i + '" aria-label="Chapter ' + (i + 1) + ": " + esc(c[1]) + '">' + (i + 1) + "</button>").join("") + '<button type="button" data-i="' + D.length + '" aria-label="The board">♥</button>';
    $("drDots").onclick = e => { const i = e.target.dataset.i; if (i !== undefined) go(+i); };

    function go(i) {
      st.step = i; save();
      [...$("drDots").children].forEach((b, k) => { b.className = k === i ? "on" : k < D.length && filled(D[k][0]) ? "done" : ""; });
      $("drIntro").hidden = i >= D.length;
      if (i >= D.length) { $("drStep").hidden = true; board(st, false); return; }
      $("drBoardWrap").hidden = true; $("drStep").hidden = false;
      const [key, name, talk, picks, label] = D[i], c = st.ch[key] || (st.ch[key] = { p: [], t: "" });
      $("drNum").textContent = "Chapter " + (i + 1) + " of " + D.length;
      $("drName").textContent = name;
      $("drTalk").innerHTML = talk.map(t => "<li>" + esc(t) + "</li>").join("");
      $("drPicks").innerHTML = picks.map(p => '<button type="button" class="stchip' + (c.p.includes(p) ? " on" : "") + '" aria-pressed="' + c.p.includes(p) + '">' + esc(p) + "</button>").join("");
      $("drLineLabel").textContent = label;
      $("drLine").value = c.t;
      $("drWhenWrap").hidden = key !== "close";
      $("drWhen").value = st.when;
      $("drPrev").disabled = i === 0;
      $("drNext").textContent = i === D.length - 1 ? "Make our board" : "Next chapter";
    }
    const filled = k => { const c = st.ch[k]; return c && (c.p.length || c.t); };
    const cur = () => st.ch[D[st.step][0]];

    $("drPicks").onclick = e => {
      const b = e.target.closest(".stchip"); if (!b) return;
      const c = cur(), p = b.textContent, i = c.p.indexOf(p);
      if (i >= 0) c.p.splice(i, 1); else c.p.push(p);
      b.classList.toggle("on", i < 0); b.setAttribute("aria-pressed", i < 0); save();
    };
    $("drLine").addEventListener("input", () => { cur().t = $("drLine").value; save(); });
    $("drWhen").addEventListener("input", () => { st.when = $("drWhen").value; save(); });
    $("drPrev").onclick = () => go(Math.max(0, st.step - 1));
    $("drNext").onclick = () => { go(st.step + 1); $("dream").scrollIntoView({ behavior: K.motion(), block: "start" }); };
    $("drEdit").onclick = () => { go(0); $("dream").scrollIntoView({ behavior: K.motion(), block: "start" }); };
    $("drSend").onclick = async () => {
      const url = K.link("dream-life-night", "dream", await K.pack({ v: 1, a: st.a, b: st.b, when: st.when, ch: st.ch }));
      if (!await K.share("The life we're building", "Our dream life board. Keep it somewhere you'll see it.", url, $("drSend"), "Link copied")) { $("drLink").value = url; $("drLink").hidden = false; $("drLink").select(); }
    };
    go(Math.min(st.step || 0, D.length));
  }

  // the board: one card per chapter, plus the closing-the-distance date
  function board(st, got) {
    $("drBoardWrap").hidden = false;
    $("drEdit").hidden = got; $("drSend").hidden = got;
    $("drBoardNames").textContent = st.a && st.b ? st.a + " & " + st.b : "";
    const cards = D.map(([key, name]) => { const c = (st.ch || {})[key] || {}; return [key, name, (c.p || []).map(String), String(c.t || "")]; }).filter(c => c[2].length || c[3]);
    const m = monthsTo(st.when);
    let html = "";
    if (st.when && /^\d{4}-\d{2}$/.test(st.when)) html += '<div class="drcard drbig"><p class="pplabel">Together for good</p><p class="drwhen">' + esc(monthName(st.when)) + "</p><p>" + (m > 0 ? m + (m === 1 ? " month to go" : " months to go") : m === 0 ? "This month" : "We did it") + "</p></div>";
    cards.forEach(([key, name, picks, t], i) => {
      html += '<div class="drcard tilt' + (i % 4) + '"><p class="pplabel">' + esc(name) + "</p>" + (t ? '<p class="drline">' + esc(t) + "</p>" : "") + (picks.length ? '<ul class="drtags">' + picks.map(p => "<li>" + esc(p) + "</li>").join("") + "</ul>" : "") + "</div>";
    });
    $("drBoard").innerHTML = html || '<p class="ppempty">Nothing on the board yet. Go back and fill in a chapter or two.</p>';
    $("drSave").onclick = () => download(st, cards, m);
  }

  // draw the board onto a canvas so it can be saved as a picture (a phone wallpaper, or printed)
  function download(st, cards, m) {
    const W = 1080, pad = 60, colW = (W - pad * 3) / 2, c = document.createElement("canvas"), x = c.getContext("2d");
    const serif = "'Cormorant Garamond', Georgia, serif", sans = "'Nunito Sans', Arial, sans-serif";
    const wrap = (text, font, max) => { x.font = font; const out = []; let line = ""; String(text).split(/\s+/).forEach(w => { const t = line ? line + " " + w : w; if (x.measureText(t).width > max && line) { out.push(line); line = w; } else line = t; }); if (line) out.push(line); return out; };
    const items = [];
    if (st.when && /^\d{4}-\d{2}$/.test(st.when)) items.push(["Together for good", monthName(st.when), [m > 0 ? m + (m === 1 ? " month to go" : " months to go") : m === 0 ? "This month" : "We did it"], true]);
    cards.forEach(([k, name, picks, t]) => items.push([name, t, picks, false]));
    const measure = it => { const lines = it[1] ? wrap(it[1], "600 38px " + serif, colW - 48) : []; const tags = wrap(it[2].join("  ·  "), "600 22px " + sans, colW - 48); return 40 + 30 + lines.length * 44 + (tags.length ? 12 + tags.length * 32 : 0) + 30; };
    // two columns, each card goes in the shorter one
    const cols = [230, 230], placed = items.map(it => { const h = measure(it), k = cols[0] <= cols[1] ? 0 : 1, y = cols[k]; cols[k] += h + 28; return [it, pad + k * (colW + pad), y, h]; });
    c.width = W; c.height = Math.max(...cols) + 90;
    x.fillStyle = "#f4e9d4"; x.fillRect(0, 0, W, c.height);
    x.textAlign = "center"; x.fillStyle = "#b4532f"; x.font = "800 22px " + sans; x.fillText("THE LIFE WE'RE BUILDING", W / 2, 96);
    x.fillStyle = "#2f241b"; x.font = "600 64px " + serif; x.fillText(st.a && st.b ? st.a + " & " + st.b : "Our dream life", W / 2, 170);
    x.textAlign = "left";
    placed.forEach(([[label, line, picks, big], cx, cy, h], i) => {
      x.save(); x.translate(cx + colW / 2, cy + h / 2); x.rotate(((i * 37) % 5 - 2) * 0.006); x.translate(-colW / 2, -h / 2);
      x.shadowColor = "rgba(47,36,27,.18)"; x.shadowBlur = 14; x.shadowOffsetY = 4;
      x.fillStyle = big ? "#b4532f" : "#fbf5e9"; x.fillRect(0, 0, colW, h); x.shadowColor = "transparent";
      x.fillStyle = big ? "#fdf3e4" : "#b4532f"; x.font = "800 18px " + sans; x.fillText(label.toUpperCase(), 24, 48);
      let y = 70;
      x.fillStyle = big ? "#fdf3e4" : "#2f241b";
      if (line) wrap(line, "600 38px " + serif, colW - 48).forEach(l => { y += 44; x.font = "600 38px " + serif; x.fillText(l, 24, y); });
      if (picks.length) { y += 12; x.fillStyle = big ? "rgba(253,243,228,.85)" : "#6d5a49"; wrap(picks.join("  ·  "), "600 22px " + sans, colW - 48).forEach(l => { y += 32; x.font = "600 22px " + sans; x.fillText(l, 24, y); }); }
      x.restore();
    });
    x.textAlign = "center"; x.fillStyle = "#6d5a49"; x.font = "italic 500 26px " + serif; x.fillText("Love Is In The Air", W / 2, c.height - 40);
    const a = document.createElement("a"); a.download = "our-dream-life.png"; a.href = c.toDataURL("image/png"); a.click();
  }
})();
