// Trip board: plans, tickets, costs, and a shared places list. Saved on this device;
// "Share with your partner" sends a copy of the board as a link.
(function () {
  const $ = id => document.getElementById(id);
  const KEY = "liita-board";
  const pad = n => String(n).padStart(2, "0");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const addDays = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return iso(d); };
  const uid = () => Math.random().toString(36).slice(2, 9);
  const money = n => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
  const dayLabel = s => s ? new Date(s + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Any day";
  const timeLabel = t => { if (!t) return ""; const [h, m] = t.split(":").map(Number); return ((h + 11) % 12 + 1) + ":" + pad(m) + (h < 12 ? " AM" : " PM"); };
  const partnerName = () => ($("visitName") && $("visitName").value.trim()) || "";
  const partner = () => partnerName() || "Your partner";
  const partnerLower = () => partnerName() || "your partner";
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  // ---------- data ----------
  function exampleBoard() {
    const start = ($("fareDep") && $("fareDep").value) || addDays(iso(new Date()), 14);
    const end = ($("fareRet") && $("fareRet").value) || addDays(start, 3);
    const t = {
      id: uid(), example: true, name: "Example: Pittsburgh weekend", place: "Pittsburgh, PA", start, end,
      plans: [
        { id: uid(), day: start, time: "18:30", text: "Meet at PIT arrivals, then dinner downtown" },
        { id: uid(), day: addDays(start, 1), time: "10:00", text: "Brunch in the Strip District" },
        { id: uid(), day: addDays(start, 1), time: "17:45", text: "Ride the Duquesne Incline at sunset" }
      ],
      tickets: [
        { id: uid(), kind: "Flight", title: "ORD → PIT, your flight", code: "K7Q2LM", when: start + "T15:05" },
        { id: uid(), kind: "Hotel", title: "Riverside apartment, 2 nights", code: "HM4482910", when: start + "T16:00" }
      ],
      costs: [
        { id: uid(), what: "Apartment, 2 nights", amount: 240, paidBy: "me", split: "half" },
        { id: uid(), what: "Brunch", amount: 46, paidBy: "them", split: "half" },
        { id: uid(), what: "Your flight", amount: 138, paidBy: "me", split: "me" }
      ]
    };
    return {
      v: 1, active: t.id, trips: [t],
      places: [
        { id: uid(), example: true, name: "Duquesne Incline", where: "Pittsburgh", kind: "See", done: false },
        { id: uid(), example: true, name: "Take a pottery class", where: "Anywhere", kind: "Do", done: false },
        { id: uid(), example: true, name: "See the northern lights", where: "Reykjavík", kind: "See", done: false }
      ]
    };
  }
  function valid(b) { return b && Array.isArray(b.trips) && Array.isArray(b.places); }
  let board = null;
  try { board = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
  if (!valid(board)) board = exampleBoard();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(board)); } catch (e) {} };
  const trip = () => board.trips.find(t => t.id === board.active) || board.trips[0] || null;

  function newTrip(o) {
    o = o || {};
    const start = o.start || ($("fareDep") && $("fareDep").value) || addDays(iso(new Date()), 14);
    const t = { id: uid(), name: o.name || "New trip", place: o.place || "", start, end: o.end || addDays(start, 3), plans: [], tickets: [], costs: [] };
    board.trips.unshift(t); board.active = t.id; save(); renderAll();
    return t;
  }

  // ---------- tabs ----------
  let tab = "plans";
  document.querySelectorAll(".btab").forEach(b => b.addEventListener("click", () => { tab = b.dataset.tab; renderTabs(); }));
  function renderTabs() {
    document.querySelectorAll(".btab").forEach(b => { const on = b.dataset.tab === tab; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
    ["plans", "tickets", "costs", "places"].forEach(k => { $("p-" + k).hidden = k !== tab; });
  }

  // ---------- trip header ----------
  const tName = $("tName"), tPlace = $("tPlace"), tStart = $("tStart"), tEnd = $("tEnd");
  function renderTripPicker() {
    const pick = $("tripPick"); pick.innerHTML = "";
    board.trips.forEach(t => pick.add(new Option(t.name || "Untitled trip", t.id)));
    pick.value = board.active;
    const t = trip(), has = !!t;
    $("tripMeta").hidden = !has; $("tripTabs").hidden = !has; $("noTrip").hidden = has;
    if (!has) return;
    tName.value = t.name; tPlace.value = t.place; tStart.value = t.start || ""; tEnd.value = t.end || "";
    $("bExample").hidden = !(t.example || board.places.some(p => p.example));
  }
  $("tripPick").addEventListener("change", e => { board.active = e.target.value; save(); renderAll(); });
  $("tripNew").addEventListener("click", () => { newTrip(); tName.focus(); tName.select(); });
  $("noTripNew").addEventListener("click", () => { newTrip(); tName.focus(); });
  [[tName, "name"], [tPlace, "place"], [tStart, "start"], [tEnd, "end"]].forEach(([inp, k]) => inp.addEventListener("input", () => {
    const t = trip(); if (!t) return; t[k] = inp.value;
    if (k === "name") { const o = $("tripPick").selectedOptions[0]; if (o) o.textContent = inp.value || "Untitled trip"; }
    save(); if (k === "start" || k === "end") renderPlans();
  }));
  const delBtn = $("tDelete");
  let confirmDel = false;
  delBtn.addEventListener("click", () => {
    if (!confirmDel) { confirmDel = true; delBtn.textContent = "Click again to delete this trip"; setTimeout(() => { confirmDel = false; delBtn.textContent = "Delete trip"; }, 3000); return; }
    confirmDel = false; delBtn.textContent = "Delete trip";
    board.trips = board.trips.filter(t => t.id !== board.active); board.active = board.trips[0] ? board.trips[0].id : null; save(); renderAll();
  });
  $("bClearEx").addEventListener("click", () => {
    board.trips = board.trips.filter(t => !t.example); board.places = board.places.filter(p => !p.example);
    board.active = board.trips[0] ? board.trips[0].id : null; save(); renderAll();
  });

  // ---------- generic list helpers ----------
  function removeBtn(label, onClick) { const b = el("button", "bx", "×"); b.type = "button"; b.setAttribute("aria-label", label); b.addEventListener("click", onClick); return b; }
  function emptyNote(ul, text) { const li = el("li", "bempty", text); ul.appendChild(li); }

  // plans
  function renderPlans() {
    const t = trip(), ul = $("planList"); ul.innerHTML = ""; if (!t) return;
    const items = [...t.plans].sort((a, b) => (a.day || "9").localeCompare(b.day || "9") || (a.time || "").localeCompare(b.time || ""));
    if (!items.length) emptyNote(ul, "No plans yet. Add the first thing you want to do together.");
    let lastDay = null;
    items.forEach(p => {
      if (p.day !== lastDay) { ul.appendChild(el("li", "bday", dayLabel(p.day))); lastDay = p.day; }
      const li = el("li", "bitem");
      li.append(el("span", "btime", timeLabel(p.time) || "—"), el("span", "btext", p.text),
        removeBtn("Remove plan: " + p.text, () => { t.plans = t.plans.filter(x => x.id !== p.id); save(); renderAll(); }));
      ul.appendChild(li);
    });
    $("planDay").min = t.start || ""; $("planDay").max = t.end || "";
    if (!$("planDay").value && t.start) $("planDay").value = t.start;
  }
  $("planForm").addEventListener("submit", e => {
    e.preventDefault(); const t = trip(); const text = $("planText").value.trim(); if (!t || !text) { $("planText").focus(); return; }
    t.plans.push({ id: uid(), day: $("planDay").value, time: $("planTime").value, text }); $("planText").value = ""; $("planTime").value = ""; save(); renderAll(); $("planText").focus();
  });

  // tickets
  function renderTickets() {
    const t = trip(), ul = $("ticketList"); ul.innerHTML = ""; if (!t) return;
    if (!t.tickets.length) emptyNote(ul, "No tickets yet. Add flights, hotels, and events with their confirmation codes.");
    [...t.tickets].sort((a, b) => (a.when || "~").localeCompare(b.when || "~")).forEach(k => {
      const li = el("li", "bitem tk");
      const info = el("div", "tkinfo");
      info.append(el("span", "tkkind", k.kind), el("strong", null, k.title));
      if (k.when) info.append(el("span", "tkwhen", dayLabel(k.when.slice(0, 10)) + (k.when.length > 10 ? " · " + timeLabel(k.when.slice(11, 16)) : "")));
      li.appendChild(info);
      if (k.code) {
        const c = el("button", "tkcode", k.code); c.type = "button"; c.title = "Copy confirmation code";
        c.addEventListener("click", () => {
          const done = () => { c.textContent = "Copied ✓"; setTimeout(() => c.textContent = k.code, 1400); };
          (navigator.clipboard ? navigator.clipboard.writeText(k.code) : Promise.reject()).then(done).catch(() => { const r = document.createRange(); r.selectNodeContents(c); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
        });
        li.appendChild(c);
      }
      li.appendChild(removeBtn("Remove ticket: " + k.title, () => { t.tickets = t.tickets.filter(x => x.id !== k.id); save(); renderAll(); }));
      ul.appendChild(li);
    });
  }
  $("ticketForm").addEventListener("submit", e => {
    e.preventDefault(); const t = trip(); const title = $("tkTitle").value.trim(); if (!t || !title) { $("tkTitle").focus(); return; }
    t.tickets.push({ id: uid(), kind: $("tkKind").value, title, code: $("tkCode").value.trim(), when: $("tkWhen").value });
    ["tkTitle", "tkCode", "tkWhen"].forEach(id => $(id).value = ""); save(); renderAll(); $("tkTitle").focus();
  });

  // costs
  function renderCosts() {
    const t = trip(), ul = $("costList"); ul.innerHTML = ""; if (!t) return;
    const them = partner();
    $("costPaid").options[1].textContent = them;
    $("costSplit").options[2].textContent = "Just for " + partnerLower();
    let total = 0, myPaid = 0, myShare = 0;
    t.costs.forEach(c => {
      total += c.amount; if (c.paidBy === "me") myPaid += c.amount;
      myShare += c.split === "half" ? c.amount / 2 : c.split === "me" ? c.amount : 0;
    });
    const bal = Math.round((myPaid - myShare) * 100) / 100;
    $("costTotal").textContent = money(total);
    $("costYou").textContent = money(myShare);
    $("costThem").textContent = money(total - myShare);
    const settle = $("costSettle");
    settle.textContent = !t.costs.length ? "Add what you spend and we'll work out who owes whom." : bal > 0 ? them + " owes you " + money(bal) : bal < 0 ? "You owe " + partnerLower() + " " + money(-bal) : "You're even. Nobody owes anything.";
    settle.className = "settle" + (bal === 0 ? " even" : "");
    if (!t.costs.length) emptyNote(ul, "No costs yet.");
    t.costs.forEach(c => {
      const li = el("li", "bitem");
      const who = c.paidBy === "me" ? "You paid" : them + " paid";
      const split = c.split === "half" ? "split 50/50" : c.split === "me" ? "just for you" : "just for " + partnerLower();
      const txt = el("span", "btext"); txt.append(el("strong", null, c.what), el("small", null, who + " · " + split));
      li.append(txt, el("span", "bamt", money(c.amount)), removeBtn("Remove cost: " + c.what, () => { t.costs = t.costs.filter(x => x.id !== c.id); save(); renderAll(); }));
      ul.appendChild(li);
    });
  }
  $("costForm").addEventListener("submit", e => {
    e.preventDefault(); const t = trip(); const what = $("costWhat").value.trim(); const amount = parseFloat($("costAmt").value);
    const msg = $("costMsg");
    if (!what) { msg.textContent = "Say what the cost was for, like 'Dinner'."; $("costWhat").focus(); return; }
    if (!(amount > 0)) { msg.textContent = "Enter an amount greater than $0."; $("costAmt").focus(); return; }
    msg.textContent = "";
    t.costs.push({ id: uid(), what, amount: Math.round(amount * 100) / 100, paidBy: $("costPaid").value, split: $("costSplit").value });
    $("costWhat").value = ""; $("costAmt").value = ""; save(); renderAll(); $("costWhat").focus();
  });

  // places (shared across trips)
  function renderPlaces() {
    const ul = $("placeList"); ul.innerHTML = "";
    if (!board.places.length) emptyNote(ul, "Your bucket list is empty. Add a place you want to go together someday.");
    [...board.places].sort((a, b) => a.done - b.done).forEach(p => {
      const li = el("li", "bitem pl" + (p.done ? " done" : ""));
      const cb = el("input"); cb.type = "checkbox"; cb.checked = p.done; cb.id = "pl-" + p.id;
      cb.addEventListener("change", () => { p.done = cb.checked; save(); renderPlaces(); });
      const lab = el("label", "btext"); lab.htmlFor = cb.id; lab.append(el("strong", null, p.name), el("small", null, p.kind + (p.where ? " · " + p.where : "")));
      const add = el("button", "badd2", "Add to trip"); add.type = "button";
      add.addEventListener("click", () => {
        const t = trip(); if (!t) { newTrip({ name: "Trip to " + (p.where || p.name), place: p.where }); }
        const tt = trip(); tt.plans.push({ id: uid(), day: "", time: "", text: p.name + (p.where ? " (" + p.where + ")" : "") });
        save(); renderAll(); add.textContent = "Added ✓";
      });
      li.append(cb, lab, add, removeBtn("Remove place: " + p.name, () => { board.places = board.places.filter(x => x.id !== p.id); save(); renderAll(); }));
      ul.appendChild(li);
    });
  }
  $("placeForm").addEventListener("submit", e => {
    e.preventDefault(); const name = $("plName").value.trim(); if (!name) { $("plName").focus(); return; }
    board.places.push({ id: uid(), name, where: $("plWhere").value.trim(), kind: $("plKind").value, done: false });
    $("plName").value = ""; $("plWhere").value = ""; save(); renderAll(); $("plName").focus();
  });

  function renderCounts() {
    const t = trip();
    $("cnt-plans").textContent = t ? t.plans.length : 0;
    $("cnt-tickets").textContent = t ? t.tickets.length : 0;
    $("cnt-costs").textContent = t ? t.costs.length : 0;
    $("cnt-places").textContent = board.places.length;
  }
  // ---------- open / close ----------
  const toggle = $("boardToggle"), body = $("boardBody");
  function setOpen(open) {
    body.hidden = !open; toggle.setAttribute("aria-expanded", String(open));
    $("boardToggleLabel").textContent = open ? "Minimize" : "Open";
    try { localStorage.setItem(KEY + "-open", open ? "1" : "0"); } catch (e) {}
  }
  toggle.addEventListener("click", () => setOpen(body.hidden));
  try { if (localStorage.getItem(KEY + "-open") === "1") setOpen(true); } catch (e) {}
  function renderSummary() {
    const n = board.trips.length, t = trip();
    $("boardSum").textContent = !n ? "No trips yet. Open to plan your next visit."
      : n + (n === 1 ? " trip" : " trips") + (t ? " · " + (t.name || "Untitled trip") + (t.start ? ", " + dayLabel(t.start) : "") : "");
  }

  function renderAll() { renderSummary(); renderTripPicker(); renderTabs(); renderPlans(); renderTickets(); renderCosts(); renderPlaces(); renderCounts(); }

  // ---------- share by link ----------
  const enc = obj => btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const dec = str => JSON.parse(decodeURIComponent(escape(atob(str.replace(/-/g, "+").replace(/_/g, "/")))));
  $("boardShare").addEventListener("click", () => {
    const url = location.href.split("#")[0] + "#board=" + enc(board);
    $("shareLink").value = url; $("bShare").hidden = false; $("shareLink").select();
  });
  $("shareCopy").addEventListener("click", () => {
    const inp = $("shareLink"); const btn = $("shareCopy");
    (navigator.clipboard ? navigator.clipboard.writeText(inp.value) : Promise.reject()).then(() => { btn.textContent = "Copied ✓"; setTimeout(() => btn.textContent = "Copy link", 1600); })
      .catch(() => { inp.focus(); inp.select(); btn.textContent = "Press Ctrl+C to copy"; });
  });
  $("shareClose").addEventListener("click", () => { $("bShare").hidden = true; });

  let incoming = null;
  const m = location.hash.match(/^#board=([A-Za-z0-9_-]+)$/);
  if (m) {
    try { const b = dec(m[1]); if (valid(b)) incoming = b; } catch (e) {}
    history.replaceState(null, "", location.pathname + location.search + "#travel");
    if (incoming) {
      $("bImportText").textContent = "Your partner shared a trip board with " + incoming.trips.length + (incoming.trips.length === 1 ? " trip" : " trips") + " and " + incoming.places.length + " places. Do you want to use it?";
      $("bImport").hidden = false; setOpen(true);
      setTimeout(() => $("tripBoard").scrollIntoView({ behavior: "smooth", block: "start" }), 400);
    } else {
      $("bImportText").textContent = "That shared link didn't open. Ask your partner to copy it again and send the whole link.";
      $("bImport").hidden = false; setOpen(true); $("bImportYes").hidden = true; $("bImportNo").textContent = "OK";
    }
  }
  $("bImportYes").addEventListener("click", () => { board = incoming; board.active = board.active || (board.trips[0] && board.trips[0].id); save(); $("bImport").hidden = true; renderAll(); });
  $("bImportNo").addEventListener("click", () => { $("bImport").hidden = true; });

  if ($("visitName")) $("visitName").addEventListener("input", renderCosts);
  window.TripBoard = {
    newTrip(o) { setOpen(true); const t = newTrip(o); tab = "plans"; renderTabs(); $("tripBoard").scrollIntoView({ behavior: "smooth", block: "start" }); return t; }
  };
  renderAll();
})();
