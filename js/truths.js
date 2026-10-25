// Two Truths and a Lie: Us (Plus): write rounds of two true things and one lie about yourself,
// send the link (#tl=), and they try to catch every lie. The lie is shuffled in when the link is made.
(function () {
  const $ = id => document.getElementById(id);
  const K = window.PlusKit, KEY = "liita-truths", MIN = 3, MAX = 8;

  // a topic for each round, so nobody stares at a blank box
  window.TRUTH_TOPICS = [
    "When you were a kid", "Your family", "Something you've never told them", "A job you've had", "School days",
    "A trip you took", "Food", "A talent, hidden or not", "Your most embarrassing moment", "Something you broke",
    "A famous person", "Your first car, phone or pet", "A fear", "A record you hold", "A night out that went wrong"
  ];
  const topic = k => window.TRUTH_TOPICS[k % window.TRUTH_TOPICS.length];
  const blank = k => ({ t: topic(k), s: ["", "", ""], lie: -1, story: "" });

  window.setupTruths = function () {
    $("truths").hidden = false;
    addEventListener("hashchange", () => location.reload());
    const code = K.fromHash("tl");
    if (code) {
      $("tlMake").hidden = true;
      K.unpack(code).then(g => {
        if (!g || !Array.isArray(g.r) || !g.r.length) throw 0;
        play(g, false); $("truths").scrollIntoView({ block: "start" });
      }).catch(() => { $("tlPlay").hidden = false; $("tlHead").textContent = "This link looks broken"; $("tlSub").textContent = "Ask them to send it again, and make sure you copy the whole link."; $("tlTable").hidden = true; });
      return;
    }
    make();
  };

  function make() {
    let st = K.load(KEY, null);
    if (!st || !Array.isArray(st.r) || !st.r.length) { const o = Math.floor(Math.random() * 15); st = { a: "", r: [0, 1, 2, 3, 4].map(k => blank(k + o)) }; }
    const save = () => K.store(KEY, st);
    $("tlName").value = st.a;
    $("tlName").oninput = () => { st.a = $("tlName").value.trim(); save(); };

    function render() {
      $("tlRounds").innerHTML = "";
      st.r.forEach((r, i) => {
        const li = document.createElement("li"); li.className = "tlround"; li.dataset.i = i;
        li.innerHTML = '<div class="tlroundhead"><b>Round ' + (i + 1) + '</b><span class="tltopic"></span><button class="linkbtn" type="button" data-act="topic">Different idea</button>' +
          (st.r.length > MIN ? '<button class="linkbtn" type="button" data-act="del">Remove</button>' : "") + "</div>" +
          '<div class="tlhand">' + [0, 1, 2].map(j => '<div class="tlslot"><span class="tlcorner" aria-hidden="true">' + "ABC"[j] + '</span><textarea data-j="' + j + '" rows="3" maxlength="140" aria-label="Round ' + (i + 1) + ", card " + "ABC"[j] + '" placeholder="' + (j === 2 ? "And one more" : j ? "Another thing" : "Something about you") + '"></textarea><label class="tlpick"><input class="vh" type="radio" name="tll' + i + '" value="' + j + '"><span>This one\'s the lie</span></label></div>').join("") + "</div>" +
          '<input class="tlstory" type="text" maxlength="200" placeholder="The real story behind the lie (optional)" aria-label="The real story, round ' + (i + 1) + '">';
        li.querySelector(".tltopic").textContent = "Idea: " + r.t.toLowerCase();
        li.querySelectorAll("textarea[data-j]").forEach(t => { t.value = r.s[t.dataset.j]; });
        if (r.lie >= 0) li.querySelector('input[type=radio][value="' + r.lie + '"]').checked = true;
        li.querySelector(".tlstory").value = r.story || "";
        $("tlRounds").appendChild(li);
      });
      $("tlAdd").hidden = st.r.length >= MAX;
      count();
    }
    const done = r => r.s.every(x => x.trim()) && r.lie >= 0;
    const count = () => { $("tlCount").textContent = st.r.filter(done).length + " of " + st.r.length + " rounds ready"; };

    $("tlRounds").addEventListener("input", e => {
      const li = e.target.closest(".tlround"); if (!li) return;
      const r = st.r[li.dataset.i];
      if (e.target.dataset.j) r.s[e.target.dataset.j] = e.target.value;
      else if (e.target.type === "radio") { r.lie = +e.target.value; li.classList.remove("empty"); }
      else if (e.target.classList.contains("tlstory")) r.story = e.target.value;
      save(); count();
    });
    $("tlRounds").addEventListener("click", e => {
      const act = e.target.dataset.act; if (!act) return;
      const i = +e.target.closest(".tlround").dataset.i;
      if (act === "del") st.r.splice(i, 1);
      if (act === "topic") st.r[i].t = topic(window.TRUTH_TOPICS.indexOf(st.r[i].t) + 1 + Math.floor(Math.random() * 5));
      save(); render();
    });
    $("tlAdd").onclick = () => { st.r.push(blank(Math.floor(Math.random() * 15))); save(); render(); $("tlRounds").lastChild.querySelector("textarea[data-j]").focus(); };

    const fail = (msg, el) => { $("tlErr").textContent = msg; $("tlErr").hidden = false; if (el) el.focus(); return false; };
    const ready = () => {
      $("tlErr").hidden = true;
      if (!st.a) return fail("Add your name so they know who's lying.", $("tlName"));
      const rows = [...$("tlRounds").children];
      const gap = rows.find(li => st.r[li.dataset.i].s.some(x => !x.trim()));
      if (gap) return fail("Round " + (+gap.dataset.i + 1) + " needs all three.", gap.querySelector("textarea[data-j]"));
      const open = rows.filter(li => st.r[li.dataset.i].lie < 0);
      open.forEach(li => li.classList.add("empty"));
      if (open.length) return fail("Mark the lie in round " + (+open[0].dataset.i + 1) + ". Tap the circle next to it.", open[0].querySelector("input[type=radio]"));
      return true;
    };
    // shuffle each round so the lie isn't always in the same spot
    const build = () => ({ v: 1, a: st.a.slice(0, 40), r: st.r.map(r => {
      const order = [0, 1, 2].sort(() => Math.random() - .5);
      return [order.map(j => r.s[j].trim()), order.indexOf(r.lie), (r.story || "").trim()];
    }) });

    $("tlMakeLink").onclick = async () => {
      if (!ready()) return;
      $("tlLink").value = K.link("two-truths", "tl", await K.pack(build()));
      $("tlOut").hidden = false; $("tlOut").scrollIntoView({ behavior: K.motion(), block: "center" });
    };
    $("tlSend").onclick = async () => { if (!await K.share("Two truths and a lie", "Two truths and a lie, about me. Can you catch every lie?", $("tlLink").value, $("tlSend"), "Link copied")) $("tlLink").select(); };
    $("tlPreview").onclick = () => { if (!ready()) return; $("tlMake").hidden = true; play(build(), true); $("truths").scrollIntoView({ block: "start" }); };
    $("tlBack").onclick = () => { $("tlPlay").hidden = true; $("tlMake").hidden = false; $("truths").scrollIntoView({ block: "start" }); };
    render();
  }

  function play(g, peek) {
    const name = g.a || "They", rs = g.r.filter(r => Array.isArray(r) && Array.isArray(r[0]) && r[0].length === 3).slice(0, MAX);
    let i = 0, caught = 0;
    $("tlPlay").hidden = false; $("tlPeek").hidden = !peek; $("tlEnd").hidden = true; $("tlTable").hidden = false;
    $("tlHead").textContent = name + "'s two truths and a lie";
    $("tlSub").textContent = rs.length + " rounds. In each one, two things are true and one is a lie. Find the lie.";
    function deal() {
      const [s] = rs[i];
      $("tlStep").textContent = "Round " + (i + 1) + " of " + rs.length;
      $("tlScore").textContent = caught + " caught";
      $("tlCards").innerHTML = ""; $("tlCards").dataset.done = "";
      s.forEach((t, j) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "tlcard"; b.dataset.j = j; b.style.setProperty("--k", j);
        b.innerHTML = '<small aria-hidden="true">' + "ABC"[j] + "</small><span></span><em class=\"tlstamp\" aria-hidden=\"true\"></em>"; b.children[1].textContent = t;
        $("tlCards").appendChild(b);
      });
      $("tlVerdict").textContent = ""; $("tlStory").hidden = true; $("tlNext").hidden = true;
      $("tlCards").firstChild.focus({ preventScroll: true });
    }
    $("tlCards").onclick = e => {
      const b = e.target.closest(".tlcard"); if (!b || $("tlCards").dataset.done) return;
      $("tlCards").dataset.done = "1";
      const lie = rs[i][1], ok = +b.dataset.j === lie;
      if (ok) caught++;
      [...$("tlCards").children].forEach(c => {
        c.disabled = true;
        const isLie = +c.dataset.j === lie;
        c.classList.add(isLie ? "lie" : "true"); c.querySelector(".tlstamp").textContent = isLie ? "Lie" : "True";
        if (c === b) c.classList.add("picked");
      });
      $("tlScore").textContent = caught + " caught";
      $("tlVerdict").textContent = ok ? ["Caught it.", "You saw right through that.", "Nice. That was the lie."][i % 3] : "Got you. That one's true.";
      $("tlVerdict").className = "tlverdict " + (ok ? "ok" : "no");
      if (rs[i][2]) { $("tlStory").hidden = false; $("tlStoryText").textContent = rs[i][2]; }
      $("tlNext").textContent = i + 1 < rs.length ? "Next round" : "See how I did";
      $("tlNext").hidden = false; $("tlNext").focus({ preventScroll: true });
    };
    $("tlNext").onclick = () => { i++; if (i < rs.length) deal(); else end(); };
    function end() {
      $("tlTable").hidden = true; $("tlEnd").hidden = false;
      $("tlFinal").textContent = caught + " of " + rs.length;
      $("tlFinalTitle").textContent = caught === rs.length ? "You caught every single lie." : caught >= rs.length * .6 ? "Hard to fool. " + name + " will have to try harder." : caught ? name + " is a better liar than you thought." : name + " fooled you every time.";
      $("tlEnd").scrollIntoView({ behavior: K.motion(), block: "center" });
    }
    $("tlShare").onclick = async () => {
      const msg = "I caught " + caught + " of your " + rs.length + " lies. " + (caught === rs.length ? "You can't fool me. 😌" : "Some of those true ones though… tell me everything.");
      if (!await K.share("Two truths and a lie", msg, "", $("tlShare"), "Copied. Paste it to " + name)) location.href = "sms:?&body=" + encodeURIComponent(msg);
    };
    deal();
  }
})();
