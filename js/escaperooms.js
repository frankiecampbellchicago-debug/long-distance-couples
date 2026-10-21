// "Online escape room": a hand-checked list of escape rooms two people can play together from two places.
// Steam details (online co-op, price, devices) checked October 2026. Regular prices; sales change often.
(function () {
  const STEAM = id => "https://store.steampowered.com/app/" + id + "/";
  const IMG = id => "https://cdn.akamai.steamstatic.com/steam/apps/" + id + "/header.jpg";
  const TEG = "https://theescapegame.com/remote-adventures/";

  // t: themes. on: where it runs. price: regular price for one copy.
  const ROOMS = [
    { n: "We Were Here", id: 582500, price: "Free", on: "PC & Mac", t: ["Fantasy & castles", "Free"],
      d: "Split up inside a frozen castle with only a walkie-talkie between you. One of you sees the clues, the other sees the puzzle, so you have to talk it through. A great free first try." },
    { n: "We Were Here Too", id: 677160, price: "$9.99", on: "PC & Mac", t: ["Fantasy & castles", "Horror"],
      d: "A darker castle in a relentless storm. Same walkie-talkie idea, with spookier rooms and tougher puzzles than the first one." },
    { n: "We Were Here Together", id: 865360, price: "$12.99", on: "PC & Mac", t: ["Fantasy & castles"],
      d: "A rescue mission through frozen wastes after a cry for help over the radio. Can you make it back together? Fitting for long distance." },
    { n: "We Were Here Forever", id: 1341290, price: "$17.99", on: "PC", t: ["Fantasy & castles", "Horror"],
      d: "You both wake up imprisoned in the sinister Castle Rock. The biggest and most polished of the series." },
    { n: "We Were Here Tomorrow", id: 2315050, price: "$19.99", on: "PC", t: ["Sci-fi & space"],
      d: "You wake up in a mysterious research facility with no memory of how you got there. Each of you sees something different, so you have to describe everything." },
    { n: "We Were Here Expeditions: The FriendShip", id: 2296990, price: "$3.99", on: "PC", t: ["Cute & cozy", "Adventure"],
      d: "A short, cheerful puzzle trip on a ship, built to be finished in one evening. A low-stress place to start." },
    { n: "The Past Within", id: 1515210, price: "$5.99", on: "PC, Mac & phones", t: ["Mystery & detective", "Fantasy & castles"],
      d: "From the makers of Rusty Lake. One of you is in the past, the other in the future, and you can only solve it by describing what you see. Plays on phones too, and there's a free Lite version to try first." },
    { n: "Tick Tock: A Tale for Two", id: 790740, price: "$5.99", on: "PC, Mac & phones", t: ["Mystery & detective", "Fantasy & castles"],
      d: "Two of you trapped in a mystical world as time runs out, each with half of every clue. Made to be played on two devices, even far apart." },
    { n: "Unboxing the Cryptic Killer", id: 2069040, price: "$5.99", on: "PC & Mac", t: ["Mystery & detective", "Horror"],
      d: "Two detectives, one creepy box left by a killer. Crack the codes together before the killer outsmarts you." },
    { n: "Unsolved Case", id: 2084050, price: "Free", on: "PC, Mac & phones", t: ["Mystery & detective", "Free"],
      d: "A free co-op detective case: a new lead, an old murder, and a possible copycat. A great sample of the Cryptic Killer series. Free on phones too." },
    { n: "Escape Simulator", id: 1435790, price: "$19.99", on: "PC & Mac", t: ["Classic escape rooms", "Sci-fi & space", "Horror"],
      d: "The closest thing to a real escape room: pick up everything, smash pots, break locks. Lots of themed rooms, plus thousands of free fan-made rooms." },
    { n: "Escape Simulator 2", id: 2879840, price: "$19.99", on: "PC & Mac", t: ["Classic escape rooms"],
      d: "The sequel, with a new set of hands-on escape rooms to play together, and a room builder if you want to make one for each other." },
    { n: "Escape Academy", id: 1812090, price: "$19.99", on: "PC", t: ["Classic escape rooms"],
      d: "Train at a school for escape artists, one themed room at a time. Funny and clever, and you can play every room as a pair online." },
    { n: "Keep Talking and Nobody Explodes", id: 341800, price: "$14.99", on: "PC, Mac & phones", t: ["Under pressure"],
      d: "One of you is alone with a ticking bomb. The other has the defusal manual but can't see the bomb. Only the one defusing needs the game; the other reads the free manual at bombmanual.com." },
    { n: "Operation: Tango", id: 1335790, price: "$24.99", on: "PC", t: ["Heist & spy", "Under pressure"],
      d: "A spy mission for two: one of you is the agent in the field, the other is the hacker. Only one of you has to buy it; the other plays free with the Friend Pass." },
    { n: "Escape Memoirs: Mansion Heist", id: 1925320, price: "$7.99", on: "PC", t: ["Heist & spy"],
      d: "A reverse escape room: you're thieves breaking into a mysterious mansion full of puzzles instead of trying to get out." },
    { n: "Escape Memoirs: Safe House", id: 2722360, price: "$9.99", on: "PC", t: ["Heist & spy"],
      d: "Break into your own crime ring's safe house to grab the tools you need. Another reverse escape room from the Mansion Heist team." },
    { n: "The Escapists 2", id: 641990, price: "$26.99", on: "PC & Mac", t: ["Heist & spy"],
      d: "Plan a prison break together: craft tools, dodge guards and dig your way out. Playful and pixel-art, not scary." },
    { n: "Portal 2", id: 620, price: "$9.99", on: "PC", t: ["Sci-fi & space"],
      d: "A classic. The co-op campaign has you both as test robots solving portal puzzles in a sarcastic AI's lab. Very funny." },
    { n: "BOKURA: planet", id: 3126150, price: "$5.49", on: "PC & Mac", t: ["Sci-fi & space", "Mystery & detective"],
      d: "You're a two-person spaceship exploration crew trying to escape a strange planet, sharing what each of you finds. Built only for two players." },
    { n: "BOKURA", id: 1801110, price: "$5.49", on: "PC, Mac & phones", t: ["Cute & cozy", "Adventure"],
      d: "Two kids run away together, and you each see a different version of the world. A sweet, surprising puzzle story only playable as a pair." },
    { n: "Biped", id: 1071870, price: "$14.99", on: "PC", t: ["Cute & cozy", "Adventure"],
      d: "Two tiny robots, one leg at a time, cooperating through cheerful puzzle courses. Lots of laughing at each other's fails." },
    { n: "Biped 2", id: 2560240, price: "$14.99", on: "PC", t: ["Cute & cozy", "Adventure"],
      d: "More of the robot pair, with new worlds and puzzles that need both of you moving in sync." },
    { n: "Labyrinthine", id: 1302240, price: "$9.99", on: "PC", t: ["Horror"],
      d: "A co-op horror maze: solve puzzles, collect items and run from what's hunting you. Properly scary, best with the lights off." },
    { n: "Escape the Backrooms", id: 1943950, price: "$9.99", on: "PC", t: ["Horror"],
      d: "Explore 30+ eerie, endless 'backrooms' levels together while avoiding the things that live there. Creepy and atmospheric." },
    { n: "The Escape: Together", id: 2242760, price: "$3.99", on: "PC", t: ["Horror"],
      d: "A paranormal creature has taken over the house. Use whatever you find to survive and get out. Short, cheap and jumpy." },
    { n: "Prison Break (live)", url: TEG, img: "", price: "$30–35 per person", on: "Zoom, any device", t: ["Live with a real host", "Heist & spy"],
      d: "A real escape room, played over Zoom: a live game guide walks the actual room with a camera while you two tell them what to do. 60 minutes, rated 9/10 difficulty." },
    { n: "The Depths (live)", url: TEG, img: "", price: "$30–35 per person", on: "Zoom, any device", t: ["Live with a real host", "Sci-fi & space", "Adventure"],
      d: "Uncover the secrets of an undersea lab, live over Zoom with a real game guide inside the room. 60 minutes, rated 7/10 difficulty." },
    { n: "The Heist (live)", url: TEG, img: "", price: "$30–35 per person", on: "Zoom, any device", t: ["Live with a real host", "Heist & spy"],
      d: "Steal back a priceless painting, directing a live game guide through the real room over Zoom. 60 minutes, rated 8/10 difficulty." }
  ];
  const THEMES = ["Horror", "Mystery & detective", "Fantasy & castles", "Sci-fi & space", "Heist & spy", "Classic escape rooms", "Under pressure", "Adventure", "Cute & cozy", "Live with a real host", "Free"];
  // words people might type that mean a theme
  const WORDS = { scary: "Horror", spooky: "Horror", creepy: "Horror", ghost: "Horror", haunted: "Horror", murder: "Mystery & detective", detective: "Mystery & detective", crime: "Mystery & detective",
    mystery: "Mystery & detective", castle: "Fantasy & castles", magic: "Fantasy & castles", fantasy: "Fantasy & castles", space: "Sci-fi & space", "sci-fi": "Sci-fi & space", scifi: "Sci-fi & space",
    robot: "Sci-fi & space", heist: "Heist & spy", spy: "Heist & spy", prison: "Heist & spy", bomb: "Under pressure", timer: "Under pressure", cute: "Cute & cozy", cozy: "Cute & cozy", easy: "Cute & cozy",
    zoom: "Live with a real host", live: "Live with a real host", real: "Live with a real host", free: "Free", classic: "Classic escape rooms" };

  window.setupEscapeRooms = function () {
    const $ = id => document.getElementById(id);
    $("escape").hidden = false;
    const status = (msg, err) => { $("escStatus").textContent = msg; $("escStatus").classList.toggle("err", !!err); };
    const sel = $("escTheme");
    THEMES.forEach(t => { const o = document.createElement("option"); o.value = t; o.textContent = t; sel.appendChild(o); });
    sel.addEventListener("change", () => $("escForm").requestSubmit());
    $("escPhone").addEventListener("change", () => $("escForm").requestSubmit());

    function search() {
      const q = $("escQ").value.trim().toLowerCase(), theme = sel.value, phone = $("escPhone").checked;
      const words = q.split(/[^a-z0-9-]+/).filter(w => w.length > 1);
      const themeWords = words.map(w => WORDS[w] || WORDS[w.replace(/s$/, "")]).filter(Boolean);
      return ROOMS.map(r => {
        if (theme && !r.t.includes(theme)) return null;
        if (phone && !/phone|zoom/i.test(r.on)) return null;
        if (!words.length) return { r, s: 0 };
        const hay = (r.n + " " + r.d + " " + r.t.join(" ")).toLowerCase();
        let s = 0;
        for (const w of words) {
          if (r.n.toLowerCase().includes(w)) s += 3;
          else if (hay.includes(w)) s += 1;
          else if (!themeWords.some(t => r.t.includes(t))) return null;
        }
        s += themeWords.filter(t => r.t.includes(t)).length * 2;
        return { r, s };
      }).filter(Boolean).sort((a, b) => b.s - a.s).map(x => x.r);
    }

    $("escForm").addEventListener("submit", e => {
      e.preventDefault();
      const list = search();
      $("escList").innerHTML = "";
      if (!list.length) { status("Nothing matches that yet. Try another type, or clear the search.", true); return; }
      const theme = sel.value;
      const SAY = { "Live with a real host": "live-hosted", "Classic escape rooms": "classic", "Under pressure": "race-the-clock", "Free": "free" };
      status(list.length + (theme ? " " + (SAY[theme] || theme.toLowerCase()) : "") + " escape room" + (list.length > 1 ? "s" : "") + " you can play together from two places.");
      list.forEach(r => $("escList").appendChild(card(r)));
      $("escNote").hidden = false;
    });

    $("escRandom").addEventListener("click", () => {
      const pool = search();
      if (!pool.length) { status("Nothing matches those choices. Change the type and try again.", true); return; }
      const r = pool[Math.floor(Math.random() * pool.length)];
      $("escList").innerHTML = "";
      status("Tonight's room. Not feeling it? Hit Surprise us again.");
      $("escList").appendChild(card(r)); $("escNote").hidden = false;
    });

    function card(r) {
      const li = document.createElement("li");
      li.className = "mcard2 pic esc";
      const img = r.img === "" ? null : IMG(r.id);
      li.innerHTML = (img ? '<img alt="" loading="lazy">' : '<div class="escart" aria-hidden="true"><span>LIVE</span><b></b></div>') +
        '<div class="mbody"><h4></h4><div class="etags"></div><p class="mmeta"></p><p class="edesc"></p><div class="ractions"></div></div>';
      if (img) { const im = li.querySelector("img"); im.src = img; im.onerror = () => im.remove(); }
      else li.querySelector(".escart b").textContent = r.n.replace(" (live)", "");
      li.querySelector("h4").textContent = r.n;
      r.t.forEach(t => { const s = document.createElement("span"); s.className = "etag"; s.textContent = t; li.querySelector(".etags").appendChild(s); });
      li.querySelector(".mmeta").textContent = r.price + " · " + r.on;
      li.querySelector(".edesc").textContent = r.d;
      const acts = li.querySelector(".ractions");
      const a = document.createElement("a");
      a.className = "btn"; a.href = r.url || STEAM(r.id); a.target = "_blank"; a.rel = "noopener";
      a.textContent = r.url ? "Book it" : r.price === "Free" ? "Play free" : "Get it";
      acts.appendChild(a);
      const tr = document.createElement("a");
      tr.className = "btn ghost"; tr.target = "_blank"; tr.rel = "noopener"; tr.textContent = "Watch a trailer";
      tr.href = "https://www.youtube.com/results?search_query=" + encodeURIComponent((r.url ? "The Escape Game remote adventures " + r.n.replace(" (live)", "") : r.n + " trailer"));
      acts.appendChild(tr);
      return li;
    }
  };
})();
