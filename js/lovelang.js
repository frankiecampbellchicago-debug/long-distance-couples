// Love Language Night (Plus): each of you picks between pairs of gestures, then you compare results
// side by side, with ideas for loving each other's way from far away. Results travel in the link (#ll=).
(function () {
  const $ = id => document.getElementById(id);
  const K = window.PlusKit, KEY = "liita-lovelang";
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  // w words, t time, g gifts, a acts, h touch
  const LANGS = {
    w: { name: "Words", long: "Words of affirmation", color: "#c0563b",
      about: "Hearing it matters. Compliments, “I'm proud of you” and messages out of nowhere fill the tank.",
      ideas: ["Send a voice note saying three things you love about them", "Write a letter by hand and mail it", "Leave a good-morning text before they wake up", "Tell them specifically what they did well this week", "Make a list of 25 reasons and send one a day", "Say it out loud on a call, even if it feels cheesy"] },
    t: { name: "Time", long: "Quality time", color: "#2c5d8a",
      about: "Undivided attention is the gift. A call with no phone scrolling beats a long one with half your mind elsewhere.",
      ideas: ["Plan a weekly date night that never gets cancelled", "Watch a movie in sync with no phones out", "Do a slow walk-along call through your neighborhood", "Fall asleep on a call", "Read the same book and talk about it every Sunday", "Count down to the next visit together"] },
    g: { name: "Gifts", long: "Receiving gifts", color: "#9a6a1c",
      about: "It's not about the price. It's proof you were thinking of them when they weren't around.",
      ideas: ["Mail a care package with their favorite snacks", "Send a small thing that made you think of them", "Order them dinner to their door", "Send flowers on a random Tuesday", "Make a playlist and give it a cover", "Keep a little box of things to give them at the next visit"] },
    a: { name: "Acts", long: "Acts of service", color: "#5f7148",
      about: "Actions speak louder. Taking something off their plate says “I've got you.”",
      ideas: ["Plan the whole next visit so they don't have to", "Order their groceries on a hard week", "Help with their résumé, budget or to-do list over a call", "Book the tickets before they have to ask", "Remind them about the thing they always forget", "Research the thing they've been stressing about"] },
    h: { name: "Touch", long: "Physical touch", color: "#8a3a6a",
      about: "The hardest one apart. Closeness, a hand to hold, a hug. Far away, it's about making them feel physically held.",
      ideas: ["Send a hoodie that smells like you", "Get matching blankets or pillows", "Mail a hand-written note they can hold", "Hold the phone to your chest so they hear your heartbeat", "Plan the first hug of the next visit, down to the spot", "Fall asleep together on video"] }
  };
  // every language meets every other one twice
  window.LOVE_PAIRS = [
    [["w", "They tell you they're proud of you"], ["t", "They clear a whole evening just for you"]],
    [["g", "A package shows up with your favorite snack"], ["a", "They sort out something you've been dreading"]],
    [["h", "A long hug the moment you see them"], ["w", "A message that says exactly why they love you"]],
    [["t", "A long call with nothing else going on"], ["g", "A little gift that made them think of you"]],
    [["a", "They plan the whole trip so you don't have to"], ["h", "Holding hands all day"]],
    [["w", "A handwritten letter"], ["g", "A surprise delivery"]],
    [["t", "Watching a movie together with no phones"], ["a", "They do the boring thing for you"]],
    [["h", "Falling asleep next to them"], ["g", "A gift you didn't ask for"]],
    [["w", "Hearing “you've got this” before a big day"], ["a", "Them helping you prepare for it"]],
    [["t", "A walk together, just talking"], ["h", "Sitting close with their arm around you"]],
    [["g", "Flowers for no reason"], ["w", "A voice note telling you how much you mean to them"]],
    [["a", "They fix the thing that's been broken for weeks"], ["t", "They spend the afternoon with you instead"]],
    [["w", "A compliment out of nowhere"], ["h", "A kiss on the forehead"]],
    [["g", "Something small from their trip"], ["t", "A whole day together when they're back"]],
    [["h", "Cuddling on the couch"], ["a", "Them making you dinner"]],
    [["t", "Their full attention when you're talking"], ["w", "Them telling you what they love about you"]],
    [["a", "They take care of you when you're sick"], ["g", "They bring you a little get-well gift"]],
    [["h", "A hand on your back in a crowd"], ["t", "An evening with no plans except each other"]],
    [["g", "A keepsake from a special day"], ["h", "A long hug goodbye"]],
    [["a", "They handle a hard phone call for you"], ["w", "They tell you everything will be okay"]]
  ];
  const ORDER = ["w", "t", "g", "a", "h"];
  const blank = () => ({ name: "", x: [] });
  const score = x => { const s = { w: 0, t: 0, g: 0, a: 0, h: 0 }; x.forEach((k, i) => { const p = window.LOVE_PAIRS[i]; if (p && (k === 0 || k === 1)) s[p[k][0]]++; }); return ORDER.map(l => s[l]); };
  const top = s => ORDER.map((l, i) => [l, s[i]]).sort((a, b) => b[1] - a[1]);
  const okScores = s => Array.isArray(s) && s.length === 5 && s.every(n => Number.isInteger(n) && n >= 0 && n <= 8);
  const show = id => ["llStart", "llPlay", "llResult"].forEach(k => { $(k).hidden = k !== id; });

  window.setupLoveLang = function () {
    $("lovelang").hidden = false;
    addEventListener("hashchange", () => location.reload());
    const code = K.fromHash("ll");
    if (!code) return mine(null);
    K.unpack(code).then(s => {
      if (!s || !okScores(s.s)) throw 0;
      if (okScores(s.t)) compare({ a: s.a, s: s.s }, { a: s.b, s: s.t }, false);
      else mine(s);
      $("lovelang").scrollIntoView({ block: "start" });
    }).catch(() => { show(""); $("llHead").textContent = "This link looks broken"; $("llSub").textContent = "Ask them to send it again."; });
  };

  function play(st, save, done) {
    show("llPlay");
    let i = Math.min(st.x.length, window.LOVE_PAIRS.length - 1);
    const ask = () => {
      const p = window.LOVE_PAIRS[i];
      $("llStep").textContent = (i + 1) + " of " + window.LOVE_PAIRS.length;
      $("llBar").style.width = (i / window.LOVE_PAIRS.length * 100) + "%";
      [...$("llVs").querySelectorAll(".wyopt")].forEach((b, k) => { b.lastChild.textContent = p[k][1]; b.classList.toggle("on", st.x[i] === k); });
      $("llVs").classList.remove("in"); void $("llVs").offsetWidth; $("llVs").classList.add("in");
      $("llPrev").disabled = i === 0;
    };
    $("llVs").onclick = e => {
      const b = e.target.closest(".wyopt"); if (!b || $("llVs").dataset.busy) return;
      st.x[i] = +b.dataset.k; b.classList.add("on"); save();
      $("llVs").dataset.busy = "1";
      setTimeout(() => { delete $("llVs").dataset.busy; if (i + 1 < window.LOVE_PAIRS.length) { i++; ask(); } else done(); }, 260);
    };
    $("llPrev").onclick = () => { if (i > 0) { i--; ask(); } };
    ask();
  }

  // take it yourself; if they sent theirs (got), the end is the side-by-side
  function mine(got) {
    const st = Object.assign(blank(), K.load(KEY, {}));
    const save = () => K.store(KEY, st);
    const finished = () => st.x.length >= window.LOVE_PAIRS.length;
    $("llName").value = st.name;
    $("llName").oninput = () => { st.name = $("llName").value.trim(); save(); };
    if (got) {
      $("llEye").textContent = (got.a || "They") + " took it";
      $("llHead").textContent = "Now you";
      $("llSub").textContent = "Twenty quick choices. There are no wrong answers, only what feels more like love to you. Then you'll see your results side by side.";
    }
    const done = () => {
      $("llBar").style.width = "100%";
      if (got) compare({ a: got.a, s: got.s }, { a: st.name, s: score(st.x) }, true);
      else result(st);
    };
    $("llGo").textContent = finished() ? (got ? "Compare us" : "See my result") : st.x.length ? "Keep going" : "Start";
    show("llStart");
    $("llGo").onclick = () => {
      $("llErr").hidden = true;
      if (!st.name) { $("llErr").textContent = "Add your name first."; $("llErr").hidden = false; $("llName").focus(); return; }
      if (finished()) return done();
      play(st, save, done);
    };
    $("llRedo").onclick = () => { st.x = []; save(); play(st, save, done); };
  }

  const bars = (s, cls) => { const t = top(s), max = Math.max(1, ...s); return '<ul class="llbars ' + (cls || "") + '">' + t.map(([l, n], k) => '<li style="--c:' + LANGS[l].color + ";--w:" + (n / max) + '"' + (k === 0 ? ' class="top"' : "") + '><span>' + esc(LANGS[l].long) + "</span><i><b></b></i><em>" + n + "</em></li>").join("") + "</ul>"; };
  const ideas = (name, s) => { const [[l1], [l2]] = top(s); return '<div class="llideas"><h4>Love ' + esc(name) + " from far away</h4>" + [l1, l2].map(l => '<div style="--c:' + LANGS[l].color + '"><p class="lllang">' + esc(LANGS[l].long) + "</p><ul>" + LANGS[l].ideas.slice(0, 4).map(t => "<li>" + esc(t) + "</li>").join("") + "</ul></div>").join("") + "</div>"; };

  function result(st) {
    show("llResult");
    const s = score(st.x), [[l]] = top(s);
    $("llEye").textContent = st.name + "'s love language";
    $("llHead").textContent = LANGS[l].long;
    $("llSub").textContent = LANGS[l].about;
    $("llResult").style.setProperty("--c", LANGS[l].color);
    $("llOut").innerHTML = '<div class="llcard">' + bars(s) + "</div>" + ideas(st.name, s);
    $("llSend").hidden = false; $("llSend").textContent = "Send it to them";
    $("llSend").onclick = async () => {
      const url = K.link("love-languages", "ll", await K.pack({ v: 1, a: st.name.slice(0, 40), s }));
      if (!await K.share("Love Language Night", "I took the love language quiz. Your turn, then we can compare:", url, $("llSend"), "Link copied")) { $("llLink").value = url; $("llLink").hidden = false; $("llLink").select(); }
    };
    $("llRedo").hidden = false;
  }

  function compare(p1, p2, send) {
    show("llResult");
    const n1 = p1.a || "Them", n2 = p2.a || "You";
    const [[l1]] = top(p1.s), [[l2]] = top(p2.s);
    $("llEye").textContent = "Love Language Night";
    $("llHead").textContent = n1 + " & " + n2;
    $("llSub").textContent = l1 === l2 ? "You both feel loved the same way: " + LANGS[l1].long.toLowerCase() + ". Easy to get right, easy to forget." : n1 + " is mostly " + LANGS[l1].long.toLowerCase() + ", " + n2 + " is mostly " + LANGS[l2].long.toLowerCase() + ". You might be showing love in your own language instead of theirs.";
    $("llResult").style.removeProperty("--c");
    $("llOut").innerHTML = '<div class="llduo">' + [[n1, p1.s], [n2, p2.s]].map(([n, s]) => { const [[l]] = top(s); return '<div class="llcard" style="--c:' + LANGS[l].color + '"><p class="llwho">' + esc(n) + "</p><h3>" + esc(LANGS[l].long) + "</h3>" + bars(s) + "</div>"; }).join("") + "</div>" +
      '<div class="llduo">' + ideas(n1, p1.s) + ideas(n2, p2.s) + "</div>";
    $("llRedo").hidden = true;
    $("llSend").hidden = !send; $("llSend").textContent = "Send " + n1 + " our results";
    $("llSend").onclick = async () => {
      const url = K.link("love-languages", "ll", await K.pack({ v: 1, a: p1.a, s: p1.s, b: p2.a, t: p2.s }));
      if (!await K.share("Our love languages", "I took it too. Here's us side by side:", url, $("llSend"), "Link copied")) { $("llLink").value = url; $("llLink").hidden = false; $("llLink").select(); }
    };
  }
})();
