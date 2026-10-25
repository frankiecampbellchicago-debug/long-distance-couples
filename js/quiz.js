// How Well Do You Know Me (Plus): answer twenty questions about yourself, send the link, and they guess.
// The quiz travels in the link (#q=). Whoever receives it doesn't need Plus. The draft is saved on this device.
(function () {
  const $ = id => document.getElementById(id);
  const K = window.PlusKit, DRAFT = "liita-quiz", COUNT = 20;

  // about you, with four answers to start from. You pick yours and can rewrite any of them.
  window.QUIZ_BANK = [
    ["What's my go-to comfort food?", ["Pizza", "Mac and cheese", "Ramen or noodles", "Ice cream"]],
    ["What would I order at a coffee shop?", ["Black coffee", "Something sweet and iced", "Tea", "A hot chocolate"]],
    ["What's my dream vacation?", ["A beach and nothing to do", "A big city I've never seen", "Mountains and hiking", "A road trip with no plan"]],
    ["What am I most afraid of?", ["Heights", "Spiders or bugs", "Being alone", "Deep water"]],
    ["What's my ideal Saturday morning?", ["Sleeping in as late as possible", "Up early, a workout, then breakfast", "Coffee and a slow scroll in bed", "Out the door to go somewhere"]],
    ["What's my love language?", ["Words: tell me", "Time: be here with me", "Touch: hold my hand", "Little gifts and favors"]],
    ["What do I do when I'm stressed?", ["Go quiet and want space", "Talk it all out", "Clean or organize something", "Eat, watch something, ignore it"]],
    ["Which superpower would I pick?", ["Teleporting", "Flying", "Reading minds", "Stopping time"]],
    ["What's my biggest pet peeve?", ["Loud chewing", "People being late", "Slow walkers", "Being interrupted"]],
    ["What was I like as a kid?", ["Shy and quiet", "Loud and always in trouble", "Bookish and curious", "Sporty and outside all day"]],
    ["What would I do with a free afternoon alone?", ["Nap", "Watch a show or a movie", "Go for a long walk", "Make or fix something"]],
    ["What's my favorite season?", ["Spring", "Summer", "Fall", "Winter"]],
    ["What kind of movie do I pick?", ["Comedy", "Horror or thriller", "Romance", "Action or sci-fi"]],
    ["How do I like to celebrate my birthday?", ["A big party", "Dinner with a few close people", "A trip somewhere", "Quietly, please don't make a fuss"]],
    ["What's my dream job if money didn't matter?", ["Something creative", "Traveling the world for work", "Running my own small business", "Not working at all"]],
    ["What do I spend too much money on?", ["Food and takeout", "Clothes and shoes", "Gadgets and games", "Travel"]],
    ["What's the first thing I do when I wake up?", ["Check my phone", "Bathroom, then coffee", "Hit snooze. Twice.", "Stretch, then get up right away"]],
    ["If I could live anywhere, where?", ["A big city", "By the ocean", "A cabin in the woods", "A different country"]],
    ["What's my hidden talent?", ["Cooking", "Singing or music", "Remembering random facts", "Doing impressions"]],
    ["Which animal am I most like?", ["A cat", "A golden retriever", "An owl", "A sloth"]],
    ["What makes me feel most loved by you?", ["When you check in during the day", "When you plan something for us", "When you say it out loud", "When you remember little things"]],
    ["What's my favorite way to fall asleep?", ["With a show playing", "In total silence", "With music or a podcast", "On a call with you"]],
    ["What would I grab first in a fire (after people and pets)?", ["My phone", "Old photos", "A sentimental gift", "My laptop"]],
    ["Breakfast, lunch or dinner?", ["Breakfast", "Brunch counts and it's that", "Lunch", "Dinner"]],
    ["What's my karaoke song?", ["A big power ballad", "An old classic everyone knows", "A rap verse", "I'm not singing. Ever."]],
    ["What do I want more of in my life?", ["Time with you", "Adventure", "Rest", "Money, honestly"]],
    ["What's my favorite thing about where I live?", ["The food", "The people", "The weather", "Not much, honestly"]],
    ["How do I handle a fight?", ["I need time before I can talk", "I want to fix it right now", "I make a joke to break the tension", "I write out what I feel"]],
    ["Which would I rather give up for a year?", ["Coffee", "Social media", "Sweets", "Music"]],
    ["What's my favorite kind of date with you?", ["A fancy dinner", "Staying in with food and a movie", "Doing something active", "Exploring somewhere new"]],
    ["What's the first thing I want to do when we're together again?", ["Hug for way too long", "Go eat somewhere", "Sleep in together", "Go somewhere new"]],
    ["What do I want to be remembered for?", ["Being kind", "Being funny", "Making something", "Being there for people"]],
    ["What's my favorite snack at 2am?", ["Chips", "Cereal", "Leftovers straight from the fridge", "Something sweet"]],
    ["What song do I play when I'm in a good mood?", ["Something to dance to", "An old favorite from years ago", "Whatever's new this week", "Something I can sing loud"]],
    ["What's my favorite way to spend a rainy day?", ["Under a blanket with a movie", "Reading", "Baking or cooking something", "Going out anyway"]],
    ["What's my worst habit?", ["Staying up too late", "Being on my phone", "Running late", "Leaving things to the last minute"]],
    ["What would my perfect pizza have on it?", ["Just cheese", "Pepperoni", "Everything", "Pineapple, and I'll defend it"]],
    ["Which would I rather be: early or late?", ["Twenty minutes early", "Right on time", "A little late", "Late, but with snacks"]],
    ["What do I miss most when we're apart?", ["Your hugs", "Talking face to face", "Doing nothing together", "Falling asleep next to you"]],
    ["How do I take my eggs?", ["Scrambled", "Fried, runny yolk", "Boiled", "I don't eat eggs"]],
    ["What's my go-to drink when we go out?", ["A cocktail", "Beer or wine", "Something without alcohol", "Whatever you're having"]],
    ["What was my favorite subject in school?", ["Art or music", "English", "Math or science", "Lunch"]],
    ["What's the best gift you could give me?", ["Something handmade", "An experience together", "Something I mentioned once", "Food. Always food."]],
    ["Where would I go for a first trip together?", ["Somewhere warm with a beach", "A big city", "Mountains or a cabin", "Wherever you live"]],
    ["What kind of shows do I binge?", ["Reality TV", "Crime and mysteries", "Comedies I've seen ten times", "Fantasy or sci-fi"]],
    ["What do I do when I can't sleep?", ["Scroll on my phone", "Watch something", "Lie there overthinking", "Text you"]],
    ["What's my favorite thing about myself?", ["My sense of humor", "My heart", "How hard I work", "My style"]],
    ["What would I name a pet?", ["A human name, like Kevin", "A food, like Noodle", "Something from a movie or show", "Something fancy"]],
    ["Cats or dogs?", ["Cats", "Dogs", "Both, obviously", "Neither, honestly"]],
    ["What's my favorite kind of weather?", ["Sunny and hot", "Crisp and cool", "Rainy", "Snowy"]],
    ["Where do I sit at the movies?", ["Right in the middle", "Near the back", "Close to the front", "On the aisle for easy escape"]],
    ["What am I most proud of?", ["My work", "My friends and family", "Getting through a hard time", "Us"]],
    ["How would I spend a surprise $1,000?", ["Save it", "A trip to see you", "Treat myself to something", "Give some of it away"]],
    ["What's the first thing I notice about someone?", ["Their smile", "Their eyes", "How they talk to people", "Their style"]],
    ["What's my comfort movie?", ["An animated movie", "A rom-com", "A movie from when I was a kid", "Something I can quote every line of"]],
    ["What chore do I hate most?", ["Dishes", "Laundry", "Cleaning the bathroom", "Taking out the trash"]],
    ["What would I bring to a desert island?", ["A good book", "Music", "Snacks", "You"]],
    ["How do I like to say I love you?", ["Out loud", "Little gifts", "Doing things for you", "Random texts during the day"]],
    ["What's my favorite holiday?", ["New Year's", "Halloween", "The winter holidays", "My birthday counts"]],
    ["What do I think we'll be doing in ten years?", ["Living together somewhere new", "Traveling all the time", "Settled with a family", "Still laughing at the same jokes"]]
  ];

  const shuffled = (keep) => {
    const pool = window.QUIZ_BANK.map((q, i) => i).filter(i => !keep.includes(i));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool;
  };
  const fresh = i => ({ b: i, q: window.QUIZ_BANK[i][0], o: window.QUIZ_BANK[i][1].slice(), a: -1 });

  window.setupQuiz = function () {
    $("quiz").hidden = false;
    addEventListener("hashchange", () => location.reload());
    const code = K.fromHash("q");
    if (code) {
      $("qzMake").hidden = true;
      K.unpack(code).then(qz => {
        if (!qz || !Array.isArray(qz.q) || !qz.q.length) throw new Error("bad quiz");
        take(qz, false); $("quiz").scrollIntoView({ block: "start" });
      }).catch(() => { $("qzTake").hidden = false; $("qzHead").textContent = "This quiz link looks broken"; $("qzSub").textContent = "Ask them to send it again, and make sure you copy the whole link."; $("qzCard").hidden = true; });
      return;
    }
    make();
  };

  // ---- making one ----
  function make() {
    let st = K.load(DRAFT, null);
    if (!st || !Array.isArray(st.q) || !st.q.length) st = { a: "", q: [] };
    // older drafts had ten questions: keep those and top up to the full count
    st.q = st.q.slice(0, COUNT);
    if (st.q.length < COUNT) st.q = st.q.concat(shuffled(st.q.map(x => x.b)).slice(0, COUNT - st.q.length).map(fresh));
    $("qzName").value = st.a;
    const save = () => K.store(DRAFT, st);

    function render() {
      const list = $("qzList"); list.innerHTML = "";
      st.q.forEach((x, i) => {
        const li = document.createElement("li"); li.className = "qzrow"; li.dataset.i = i;
        li.innerHTML = '<div class="qzrowhead"><b>' + (i + 1) + '</b><input class="qzq" type="text" maxlength="120" aria-label="Question ' + (i + 1) + '"><button class="linkbtn" type="button" data-act="swap">Different question</button></div>' +
          '<div class="qzopts">' + x.o.map((o, j) => '<label class="qzopt"><input type="radio" name="qzr' + i + '" value="' + j + '" aria-label="This one is me"><span class="qzletter" aria-hidden="true">' + "ABCDEF"[j] + "</span>" + '<input type="text" maxlength="80" data-j="' + j + '" aria-label="Answer ' + (j + 1) + '"></label>').join("") + "</div>";
        li.querySelector(".qzq").value = x.q;
        li.querySelectorAll('input[type=text][data-j]').forEach(t => { t.value = x.o[t.dataset.j]; });
        if (x.a >= 0) li.querySelector('input[type=radio][value="' + x.a + '"]').checked = true;
        list.appendChild(li);
      });
      count();
    }
    const count = () => { const n = st.q.filter(x => x.a >= 0).length; $("qzCount").textContent = n + " of " + COUNT + " answered"; };

    $("qzList").addEventListener("input", e => {
      const li = e.target.closest(".qzrow"); if (!li) return;
      const x = st.q[li.dataset.i];
      if (e.target.classList.contains("qzq")) x.q = e.target.value;
      else if (e.target.dataset.j) x.o[e.target.dataset.j] = e.target.value;
      else if (e.target.type === "radio") { x.a = +e.target.value; li.classList.remove("empty"); count(); }
      save();
    });
    $("qzList").addEventListener("click", e => {
      if (e.target.dataset.act !== "swap") return;
      const i = +e.target.closest(".qzrow").dataset.i;
      st.q[i] = fresh(shuffled(st.q.map(x => x.b))[0]);
      save(); render();
      $("qzList").children[i].querySelector(".qzq").focus();
    });
    $("qzName").addEventListener("input", () => { st.a = $("qzName").value; save(); });
    // Clear my answers: unpicks every answer and keeps the questions. The first tap asks, the second one clears.
    let disarm;
    $("qzReset").addEventListener("click", () => {
      const b = $("qzReset");
      if (!b.dataset.armed) {
        b.dataset.armed = "1"; b.textContent = "Tap again to clear all " + COUNT;
        disarm = setTimeout(() => { delete b.dataset.armed; b.textContent = "Clear my answers"; }, 4000);
        return;
      }
      clearTimeout(disarm); delete b.dataset.armed; b.textContent = "Clear my answers";
      st.q.forEach(x => { x.a = -1; });
      $("qzOut").hidden = true; $("qzErr").hidden = true;
      save(); render();
    });
    $("qzShuffle").addEventListener("click", () => {
      // keep the ones you've already answered, swap the rest
      const fill = shuffled(st.q.map(x => x.b));
      st.q = st.q.map(x => x.a >= 0 ? x : fresh(fill.shift()));
      save(); render();
    });

    const fail = (msg, el) => { $("qzErr").textContent = msg; $("qzErr").hidden = false; el.focus(); return false; };
    const ready = () => {
      $("qzErr").hidden = true;
      if (!st.a.trim()) return fail("Add your name so they know whose quiz it is.", $("qzName"));
      const rows = [...$("qzList").children];
      const blank = rows.find(li => { const x = st.q[li.dataset.i]; return !x.q.trim() || x.o.some(o => !o.trim()); });
      if (blank) return fail("Question " + (+blank.dataset.i + 1) + " has an empty box.", blank.querySelector(".qzq"));
      const open = rows.filter(li => st.q[li.dataset.i].a < 0);
      open.forEach(li => li.classList.add("empty"));
      if (open.length) return fail("Pick your answer for " + (open.length === 1 ? "question " + (+open[0].dataset.i + 1) : open.length + " questions") + ". Tap the circle next to the one that's you.", open[0].querySelector("input[type=radio]"));
      return true;
    };
    const build = () => ({ v: 1, a: st.a.trim().slice(0, 40), q: st.q.map(x => [x.q.trim(), x.o.map(o => o.trim()), x.a]) });

    $("qzMakeLink").addEventListener("click", async () => {
      if (!ready()) return;
      $("qzLink").value = K.link("how-well-do-you-know-me", "q", await K.pack(build()));
      $("qzOut").hidden = false;
      $("qzOut").scrollIntoView({ behavior: K.motion(), block: "center" });
    });
    $("qzSend").addEventListener("click", async () => {
      if (!await K.share("How well do you know me?", "I made you a quiz about me. Let's see how well you really know me.", $("qzLink").value, $("qzSend"), "Link copied")) $("qzLink").select();
    });
    $("qzPreview").addEventListener("click", () => { if (!ready()) return; $("qzMake").hidden = true; take(build(), true); $("quiz").scrollIntoView({ block: "start" }); });
    $("qzBack").addEventListener("click", () => { $("qzTake").hidden = true; $("qzMake").hidden = false; $("quiz").scrollIntoView({ block: "start" }); });
    render();
  }

  // ---- taking one ----
  function take(qz, peek) {
    const name = qz.a || "them", qs = qz.q.filter(x => Array.isArray(x) && Array.isArray(x[1]) && x[1].length >= 2).slice(0, 20);
    let i = 0, right = 0;
    const picks = [];
    $("qzTake").hidden = false; $("qzPeek").hidden = !peek; $("qzEnd").hidden = true; $("qzCard").hidden = false;
    $("qzHead").textContent = "How well do you know " + name + "?";
    $("qzSub").textContent = name + " answered " + qs.length + " questions about themselves. Pick what you think they said.";

    $("qzDots").innerHTML = qs.map(() => "<li></li>").join(""); $("qzLive").textContent = "0";
    function ask() {
      const [q, opts] = qs[i];
      $("qzStep").textContent = "Question " + (i + 1) + " of " + qs.length;
      $("qzBar").style.width = (i / qs.length * 100) + "%";
      $("qzDots").children[i].classList.add("now");
      $("qzQ").textContent = q;
      $("qzNext").hidden = true; $("qzVerdict").textContent = "";
      const box = $("qzChoices"); box.innerHTML = "";
      opts.forEach((o, j) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "qzchoice"; b.dataset.j = j;
        b.innerHTML = '<span class="qzl" aria-hidden="true">' + "ABCDEF"[j] + "</span><span></span>"; b.lastChild.textContent = o;
        box.appendChild(b);
      });
      box.firstChild.focus({ preventScroll: true });
    }
    $("qzChoices").onclick = e => {
      const b = e.target.closest(".qzchoice"); if (!b || $("qzChoices").dataset.done === "1") return;
      const ans = qs[i][2], j = +b.dataset.j, ok = j === ans;
      $("qzChoices").dataset.done = "1";
      [...$("qzChoices").children].forEach(c => { c.disabled = true; if (+c.dataset.j === ans) c.classList.add("right"); });
      if (!ok) b.classList.add("wrong");
      if (ok) right++;
      const dot = $("qzDots").children[i]; dot.classList.remove("now"); dot.classList.add(ok ? "ok" : "no");
      $("qzLive").textContent = right;
      picks.push([j, ans]);
      $("qzVerdict").textContent = ok ? pick(["Yes! You know " + name + ".", "Correct.", "Nailed it.", "That's the one."]) : name + " said “" + qs[i][1][ans] + "”.";
      $("qzVerdict").className = "qzverdict " + (ok ? "ok" : "no");
      $("qzNext").textContent = i + 1 < qs.length ? "Next question" : "See my score";
      $("qzNext").hidden = false; $("qzNext").focus({ preventScroll: true });
    };
    $("qzNext").onclick = () => { $("qzChoices").dataset.done = ""; i++; if (i < qs.length) ask(); else end(); };

    function end() {
      $("qzCard").hidden = true; $("qzEnd").hidden = false; $("qzBar").style.width = "100%";
      const pct = right / qs.length;
      $("qzScore").textContent = right + "/" + qs.length;
      $("qzRing").style.setProperty("--p", 0); void $("qzRing").offsetWidth;
      $("qzRing").style.setProperty("--p", pct);
      $("qzTitle").textContent = pct === 1 ? "Perfect score. You really know " + name + "." : pct >= .8 ? "You know " + name + " really well." : pct >= .5 ? "Not bad. Some surprises in there." : "Okay. You two have some talking to do.";
      const recap = $("qzRecap"); recap.innerHTML = "";
      qs.forEach(([q, opts], k) => {
        const [j, ans] = picks[k], li = document.createElement("li");
        li.className = j === ans ? "ok" : "no";
        li.innerHTML = "<b></b><span></span>";
        li.firstChild.textContent = q;
        li.lastChild.textContent = j === ans ? "✓ " + opts[ans] : "✗ You said “" + opts[j] + "”. " + name + " said “" + opts[ans] + "”.";
        recap.appendChild(li);
      });
      $("qzEnd").scrollIntoView({ behavior: K.motion(), block: "start" });
    }
    $("qzShare").onclick = async () => {
      const msg = "I got " + $("qzScore").textContent + " on your quiz. " + (right === qs.length ? "Perfect score. 😌" : "Tell me about the ones I missed.");
      if (!await K.share("My score", msg, "", $("qzShare"), "Copied. Paste it to " + name)) location.href = "sms:?&body=" + encodeURIComponent(msg);
    };
    const pick = a => a[Math.floor(Math.random() * a.length)];
    ask();
  }
})();
