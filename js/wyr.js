// Would You Rather, Couples Edition (Plus): you answer thirty, send the link, they answer the same thirty
// without seeing yours, then you both see where you matched. Everything travels in the link (#wyr=).
(function () {
  const $ = id => document.getElementById(id);
  const K = window.PlusKit, KEY = "liita-wyr", GOT = "liita-wyr-got", COUNT = 30;
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  window.WYR = [
    ["Always be ten minutes late", "Always be twenty minutes early"],
    ["A week at the beach", "A week in a cabin in the mountains"],
    ["Only text each other for a week", "Only call each other for a week"],
    ["Give up coffee forever", "Give up dessert forever"],
    ["Live in a big city", "Live in the countryside"],
    ["Speak every language", "Play every instrument"],
    ["A movie night in", "A fancy dinner out"],
    ["Have a pause button for your life", "Have a rewind button"],
    ["Fly everywhere for free", "Eat at any restaurant for free"],
    ["Breakfast for dinner every night", "Dinner for breakfast every morning"],
    ["See the northern lights", "See a total solar eclipse"],
    ["Be able to talk to animals", "Be able to read minds"],
    ["Have a dog", "Have a cat"],
    ["Plan every detail of a trip", "Show up with no plan at all"],
    ["Sing in front of a crowd", "Dance in front of a crowd"],
    ["Teleport to each other once a week", "Live together but never travel"],
    ["Be a famous actor", "Be a famous musician"],
    ["Always be a little too hot", "Always be a little too cold"],
    ["Get one long letter a month", "Get a short text every hour"],
    ["Live without music", "Live without movies and TV"],
    ["Go back to your first date", "See your tenth anniversary"],
    ["Have a house with a pool", "Have a house with a view"],
    ["Win the lottery", "Live twice as long"],
    ["Road trip across the country", "Fly around the world"],
    ["Only eat pizza for a year", "Only eat tacos for a year"],
    ["Stay up all night talking", "Wake up early to watch the sunrise"],
    ["Live in the past", "Live in the future"],
    ["Have a big wedding", "Elope somewhere beautiful"],
    ["Be the funny one", "Be the smart one"],
    ["Have a chef cook for you", "Have someone clean for you"],
    ["Get a surprise visit", "Plan a visit together for months"],
    ["Never be stuck in traffic again", "Never have a cold again"],
    ["Spend a day in their city", "Have them spend a day in yours"],
    ["Know how the story ends", "Be surprised every time"],
    ["Camp under the stars", "Stay in a fancy hotel"],
    ["Have matching tattoos", "Have matching outfits for a day"],
    ["Cook together every night", "Go out to eat every night"],
    ["Live by the ocean", "Live by a lake"],
    ["Have a garden full of vegetables", "Have a garden full of flowers"],
    ["Be invisible for a day", "Fly for a day"],
    ["Give up your phone for a month", "Give up sweets for a year"],
    ["Hear their voice every morning", "Hear their voice every night"],
    ["Win an argument", "Get the last slice"],
    ["Go to a concert together", "Go to a comedy show together"],
    ["Move somewhere new together", "Stay where one of you already lives"]
  ];

  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const newSet = () => shuffle(window.WYR.map((_, i) => i)).slice(0, COUNT);
  const valid = s => s && Array.isArray(s.q) && Array.isArray(s.x) && s.q.length && s.q.every(i => window.WYR[i]);
  const show = id => ["wyStart", "wyPlay", "wyDone", "wyReveal"].forEach(k => { $(k).hidden = k !== id; });

  window.setupWyr = function () {
    $("wyr").hidden = false;
    addEventListener("hashchange", () => location.reload());
    const code = K.fromHash("wyr");
    if (!code) return make();
    K.unpack(code).then(s => {
      if (!valid(s)) throw 0;
      if (Array.isArray(s.y) && s.y.length === s.q.length) reveal(s, false);
      else answer(s, code);
      $("wyr").scrollIntoView({ block: "start" });
    }).catch(() => { show(""); $("wyHead").textContent = "This link looks broken"; $("wySub").textContent = "Ask them to send it again, and make sure you copy the whole link."; });
  };

  // one question at a time: tap a side and the next one slides in
  function play(q, x, done) {
    show("wyPlay");
    let i = Math.min(x.length, q.length - 1);
    const ask = () => {
      const [a, b] = window.WYR[q[i]];
      $("wyStep").textContent = (i + 1) + " of " + q.length;
      $("wyBar").style.width = (i / q.length * 100) + "%";
      const [ba, bb] = $("wyVs").querySelectorAll(".wyopt");
      ba.lastChild.textContent = a; bb.lastChild.textContent = b;
      [ba, bb].forEach((el, k) => { el.classList.toggle("on", x[i] === k); el.setAttribute("aria-pressed", x[i] === k); });
      $("wyVs").classList.remove("in"); void $("wyVs").offsetWidth; $("wyVs").classList.add("in");
      $("wyPrev").disabled = i === 0;
    };
    $("wyVs").onclick = e => {
      const b = e.target.closest(".wyopt"); if (!b || $("wyVs").dataset.busy) return;
      x[i] = +b.dataset.k; b.classList.add("on");
      done.save && done.save();
      $("wyVs").dataset.busy = "1";
      setTimeout(() => {
        delete $("wyVs").dataset.busy;
        if (i + 1 < q.length) { i++; ask(); } else { $("wyBar").style.width = "100%"; done(); }
      }, 260);
    };
    $("wyPrev").onclick = () => { if (i > 0) { i--; ask(); } };
    ask();
  }

  function make() {
    let st = K.load(KEY, null);
    if (!valid(st)) st = { a: "", q: newSet(), x: [] };
    const save = () => K.store(KEY, st);
    $("wyName").value = st.a;
    $("wyEye").textContent = "Would you rather";
    $("wyHead").textContent = "Couples edition";
    $("wySub").textContent = "Answer thirty quick ones. Then send the link. They answer the same thirty without seeing yours, and you both find out where you match.";
    $("wyGo").textContent = st.x.length ? (st.x.length >= st.q.length ? "See my answers again" : "Keep going") : "Start";
    show("wyStart");
    $("wyName").oninput = () => { st.a = $("wyName").value.trim(); save(); };
    const finished = () => {
      show("wyDone");
      $("wyOut").hidden = true;
      $("wyDoneHead").textContent = "All " + st.q.length + " locked in.";
    };
    const done = finished; done.save = save;
    $("wyGo").onclick = () => {
      $("wyErr").hidden = true;
      if (!st.a) { $("wyErr").textContent = "Add your name so they know whose answers these are."; $("wyErr").hidden = false; $("wyName").focus(); return; }
      if (st.x.length >= st.q.length) { finished(); return; }
      play(st.q, st.x, done);
    };
    $("wyRedo").onclick = () => { st.x = []; save(); play(st.q, st.x, done); };
    $("wyNew").onclick = () => { st.q = newSet(); st.x = []; save(); play(st.q, st.x, done); };
    $("wyMakeLink").onclick = async () => {
      $("wyLink").value = K.link("would-you-rather", "wyr", await K.pack({ v: 1, a: st.a.slice(0, 40), q: st.q, x: st.x }));
      $("wyOut").hidden = false;
      if (!await K.share("Would you rather", "I answered 30 would-you-rathers. Your turn, then we see where we match.", $("wyLink").value, $("wyMakeLink"), "Link copied")) $("wyLink").select();
    };
  }

  // they sent theirs: answer the same questions, then see how you match
  function answer(s, code) {
    const name = s.a || "They";
    let mine = K.load(GOT, null);
    if (!mine || mine.code !== code) mine = { code, b: "", y: [] };
    const save = () => K.store(GOT, mine);
    $("wyName").value = mine.b;
    $("wyEye").textContent = name + " answered " + s.q.length;
    $("wyHead").textContent = "Your turn";
    $("wySub").textContent = "Same questions. Their answers stay hidden until you finish, so go with your gut.";
    $("wyGo").textContent = mine.y.length ? "Keep going" : "Start";
    show("wyStart");
    $("wyName").oninput = () => { mine.b = $("wyName").value.trim(); save(); };
    const done = () => reveal(Object.assign({}, s, { b: mine.b, y: mine.y }), true); done.save = save;
    $("wyGo").onclick = () => {
      $("wyErr").hidden = true;
      if (!mine.b) { $("wyErr").textContent = "Add your name first."; $("wyErr").hidden = false; $("wyName").focus(); return; }
      if (mine.y.length >= s.q.length) return done();
      play(s.q, mine.y, done);
    };
  }

  function reveal(s, mineToSend) {
    show("wyReveal");
    const a = s.a || "You", b = s.b || "Them", n = s.q.length;
    const same = s.q.filter((_, i) => s.x[i] === s.y[i]).length, pct = Math.round(same / n * 100);
    $("wyEye").textContent = "Would you rather";
    $("wyHead").textContent = a + " & " + b;
    $("wySub").textContent = "";
    $("wyPct").textContent = pct + "%";
    $("wyMeter").style.setProperty("--p", pct / 100);
    $("wyVerdict").textContent = pct >= 80 ? "Basically the same person." : pct >= 60 ? "Very in sync, with a few fun surprises." : pct >= 40 ? "Half and half. Plenty to argue about." : "Opposites. You keep things interesting.";
    $("wyTally").textContent = same + " the same, " + (n - same) + " different";
    const ini = t => esc((t.trim()[0] || "?").toUpperCase());
    $("wyList").innerHTML = s.q.map((qi, i) => {
      const [o1, o2] = window.WYR[qi], m = s.x[i] === s.y[i];
      const who = k => '<span class="wywho">' + (s.x[i] === k ? '<b class="wyme" title="' + esc(a) + '">' + ini(a) + "</b>" : "") + (s.y[i] === k ? '<b class="wyyou" title="' + esc(b) + '">' + ini(b) + "</b>" : "") + "</span>";
      return '<li class="' + (m ? "same" : "diff") + '"><span class="wytag">' + (m ? "Same" : "Split") + "</span>" +
        '<p class="' + (s.x[i] === 0 || s.y[i] === 0 ? "picked" : "") + '"><span>' + esc(o1) + "</span>" + who(0) + "</p>" +
        '<p class="' + (s.x[i] === 1 || s.y[i] === 1 ? "picked" : "") + '"><span>' + esc(o2) + "</span>" + who(1) + "</p></li>";
    }).join("");
    $("wyKey").innerHTML = '<b class="wyme">' + ini(a) + "</b> " + esc(a) + ' <b class="wyyou">' + ini(b) + "</b> " + esc(b);
    $("wyFilter").onclick = e => {
      const f = e.target.dataset.f; if (!f) return;
      [...$("wyFilter").children].forEach(x => x.setAttribute("aria-pressed", x === e.target));
      $("wyList").dataset.f = f;
    };
    $("wySendBack").hidden = !mineToSend;
    $("wySendBack").onclick = async () => {
      const url = K.link("would-you-rather", "wyr", await K.pack({ v: 1, a: s.a, q: s.q, x: s.x, b: s.b, y: s.y }));
      if (!await K.share("We matched " + pct + "%", "I finished your would-you-rathers. We matched " + pct + "%. See which ones we split on:", url, $("wySendBack"), "Link copied")) { $("wyBackLink").value = url; $("wyBackLink").hidden = false; $("wyBackLink").select(); }
    };
  }
})();
