// "Online escape room": a hand-checked list of escape rooms two people can play together from two places.
// Three formats: browser escape rooms you buy and play from a link (checked on each company's site, Oct 2026),
// live rooms hosted over Zoom, and downloadable co-op games (Steam details checked Oct 2026).
(function () {
  const STEAM = id => "https://store.steampowered.com/app/" + id + "/";
  const IMG = id => "https://cdn.akamai.steamstatic.com/steam/apps/" + id + "/header.jpg";
  const TEG = "https://theescapegame.com/remote-adventures/";

  const WOLF = "https://wolfescapegames.com/en-us/pages/", ENCH = "https://www.enchambered.com/", EV = "https://www.escapeventure.com/en/", ELGIN = "https://elginescape.com/";
  // f: format (browser, live, game). t: themes. on: what you play it on. price: what one booking or copy costs.
  const ROOMS = [
    // ---- play in your browser: buy it, get a link, both open it on your own screens while you're on a call ----
    { f: "browser", by: "Wolf Escape Games", n: "Miami Bay", url: WOLF + "miami-bay", price: "$35 per team", on: "Laptop or desktop", t: ["Mystery & detective", "Heist & spy"],
      d: "Neon-lit Miami, 1985: you're rogue detectives chasing a case across airplanes, nightclubs and super-yachts. Award-winning and a popular date night. About 3 hours, difficulty 4/5." },
    { f: "browser", by: "Wolf Escape Games", n: "Pharaoh's Tomb", url: WOLF + "pharaohs-tomb", price: "$35 per team", on: "Laptop or desktop", t: ["Mystery & detective", "Adventure"],
      d: "Sherlock Holmes and Dr. Watson follow a thief's death all the way to Egypt and a 3,000-year-old mystery. About 2½ hours, difficulty 3.5/5." },
    { f: "browser", by: "Wolf Escape Games", n: "Phantom's Hour", url: WOLF + "phantoms-hour", price: "$35 per team", on: "Laptop or desktop", t: ["Horror", "Mystery & detective"],
      d: "London, 1896: Sherlock and Watson take on a chilling case where the killer may be a ghost. About 2 hours, difficulty 3/5." },
    { f: "browser", by: "Wolf Escape Games", n: "Hallows Hill", url: WOLF + "hallows-hill", price: "$35 per team", on: "Laptop or desktop", t: ["Horror"],
      d: "A spine-tingling escape through an old house to uncover the long-buried secrets of the family who lived there. About 90 minutes, difficulty 3.5/5." },
    { f: "browser", by: "Enchambered", n: "Alone Together", url: ENCH + "puzzles/alone-together/", img: ENCH + "puzzles/alone-together/images/thumb/alone-together-escape-puzzle-thumbnail.jpg",
      price: "Free", on: "Computer, tablet or phone", t: ["Classic escape rooms", "Free"],
      d: "Made for exactly two people on two devices. Each of you sees half of the puzzles, so you have to describe everything to each other. Short, free and a perfect first try." },
    { f: "browser", by: "Enchambered", n: "Together Apart", url: ENCH + "puzzles/together-apart/", img: ENCH + "puzzles/together-apart/assets/logo/together-apart-escape-puzzle-thumbnail.jpg",
      price: "Pay what you want, from $5", on: "Computer, tablet or phone", t: ["Classic escape rooms"],
      d: "The sequel to Alone Together: twice as long, with puzzles that need constant talking between your two screens. One code covers both of you for 24 hours." },
    { f: "browser", by: "Enchambered", n: "Together at Heart", url: ENCH + "puzzles/together-at-heart/", img: ENCH + "puzzles/together-at-heart/assets/logo/together-at=heart-escape-puzzle-thumbnail.jpg",
      price: "Pay what you want, from $10", on: "Computer, tablet or phone", t: ["Cute & cozy", "Classic escape rooms"],
      d: "Work out a strange machine together and repair a little robot's broken heart. A gentler difficulty curve, about 60 to 90 minutes, and very fitting for couples." },
    { f: "browser", by: "Enchambered", n: "Apart In Time", url: ENCH + "online-games/apart-in-time/", img: ENCH + "online-games/apart-in-time/assets/logo/apart-in-time-escape-puzzle-thumbnail.jpg",
      price: "Pay what you want, from $10", on: "Computer, tablet or phone", t: ["Fantasy & castles", "Mystery & detective"],
      d: "A brilliant clockmaker will do anything to save his family from a curse. Two players, two screens, one truth to uncover." },
    { f: "browser", by: "EscapeVenture", n: "Adele: Haunted Hotel", url: EV + "haunted-hotel-escape-game-adele/", img: "https://www.escapeventure.com/images/video/adele-free-hero-20261003.jpg",
      price: "€29.90 per team", on: "Computer or tablet", t: ["Horror"],
      d: "Follow Adele's trail through the abandoned Hotel Waldlust to uncover its secret. Someone is still here. Great for beginners, with hints if you get stuck." },
    { f: "browser", by: "EscapeVenture", n: "Carrie's Family", url: EV + "escape-game-online-psycho/", img: "https://www.escapeventure.com/templates/rt_supra/custom/images/escapeventure/ev_carrieGk.jpg",
      price: "€29.90 per team", on: "Computer or tablet", t: ["Horror"],
      d: "Explore eerie real places alongside Carrie in 360° panoramas and find out what happened to her family. 60 to 90 minutes." },
    { f: "browser", by: "EscapeVenture", n: "Secret Society", url: EV + "escape-online-game/", img: "https://www.escapeventure.com/images/escape/poster-artefacts-escape.jpg",
      price: "€29.90 per team", on: "Computer or tablet", t: ["Mystery & detective"],
      d: "Follow the clues, investigate, and expose a secret society. 60 to 90 minutes, with hints when you need them." },
    { f: "browser", by: "EscapeVenture", n: "Bermuda Wrecks", url: EV + "escape-game-adventure/", img: "https://www.escapeventure.com/images/escape-online/bermudas-tauchen-escape.webp",
      price: "€29.90 per team", on: "Computer or tablet", t: ["Adventure"],
      d: "Search a shipwreck for lost gold ducats, following a trail that's been under the sea for centuries. 60 to 90 minutes." },
    { f: "browser", by: "Elgin Escape", n: "Piper Asylum", url: ELGIN + "asylum", price: "£9.99 per team", on: "Laptop or desktop", t: ["Horror"],
      d: "You sneak into Piper Asylum with friends and get trapped inside. Find a way out. About 90 minutes, and reviewers called it great for players in different homes." },
    { f: "browser", by: "Elgin Escape", n: "Killer Above the Clouds", url: ELGIN + "flight", price: "£9.99 per team", on: "Laptop or desktop", t: ["Mystery & detective"],
      d: "A murder at 35,000 feet. Work out which passenger did it before the plane lands. About 1 hour." },
    { f: "browser", by: "Elgin Escape", n: "Murder Mansion", url: ELGIN + "online", price: "£9.99 per team", on: "Laptop or desktop", t: ["Mystery & detective", "Horror"],
      d: "Explore the abandoned Palmer mansion and solve the unsolved murder of the housemaid, Jenny. About 1 hour." },
    { f: "browser", by: "Elgin Escape", n: "Santa's Last Parcel", url: ELGIN + "xmas", price: "£9.99 per team", on: "Laptop or desktop", t: ["Cute & cozy"],
      d: "Santa missed a delivery. Get the parcel to a child before Christmas morning. Light, festive and about an hour." },
    // ---- live over Zoom with a real host ----
    { f: "live", by: "Headlock Escape Rooms", n: "The Keeper & the Fungus Among Us", url: "https://www.headlockescaperooms.co.uk/", price: "See their booking page", on: "Zoom, any device", t: ["Cute & cozy", "Fantasy & castles"],
      d: "A puppet musical escape game: guide a puppet hero through miniature sets over Zoom to defeat the Mushroom King. About 90 minutes, and one of the most loved online games around." },
    { f: "live", by: "Headlock Escape Rooms", n: "Rise of the Fungi", url: "https://www.headlockescaperooms.co.uk/", price: "See their booking page", on: "Zoom, any device", t: ["Cute & cozy", "Fantasy & castles"],
      d: "The award-winning prequel: guide the puppet Paxillus through Toadstool Forest, with songs along the way. About 90 minutes, and it works on its own." },
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
    { by: "The Escape Game", n: "Prison Break (live)", url: TEG, price: "$30–35 per person", on: "Zoom, any device", t: ["Live with a real host", "Heist & spy"],
      d: "A real escape room, played over Zoom: a live game guide walks the actual room with a camera while you two tell them what to do. 60 minutes, rated 9/10 difficulty." },
    { by: "The Escape Game", n: "The Depths (live)", url: TEG, price: "$30–35 per person", on: "Zoom, any device", t: ["Live with a real host", "Sci-fi & space", "Adventure"],
      d: "Uncover the secrets of an undersea lab, live over Zoom with a real game guide inside the room. 60 minutes, rated 7/10 difficulty." },
    { by: "The Escape Game", n: "The Heist (live)", url: TEG, price: "$30–35 per person", on: "Zoom, any device", t: ["Live with a real host", "Heist & spy"],
      d: "Steal back a priceless painting, directing a live game guide through the real room over Zoom. 60 minutes, rated 8/10 difficulty." }
  ];
  const THEMES = ["Horror", "Mystery & detective", "Fantasy & castles", "Sci-fi & space", "Heist & spy", "Classic escape rooms", "Under pressure", "Adventure", "Cute & cozy", "Free"];
  const FORMAT = r => r.f || (r.url ? "live" : "game");
  const FORMATS = { browser: "browser escape room", live: "live-hosted escape room", game: "escape room video game" };
  // words people might type that mean a theme
  const WORDS = { scary: "Horror", spooky: "Horror", creepy: "Horror", ghost: "Horror", haunted: "Horror", murder: "Mystery & detective", detective: "Mystery & detective", crime: "Mystery & detective",
    mystery: "Mystery & detective", castle: "Fantasy & castles", magic: "Fantasy & castles", fantasy: "Fantasy & castles", space: "Sci-fi & space", "sci-fi": "Sci-fi & space", scifi: "Sci-fi & space",
    robot: "Sci-fi & space", heist: "Heist & spy", spy: "Heist & spy", prison: "Heist & spy", bomb: "Under pressure", timer: "Under pressure", cute: "Cute & cozy", cozy: "Cute & cozy", easy: "Cute & cozy",
    free: "Free", classic: "Classic escape rooms", christmas: "Cute & cozy", sherlock: "Mystery & detective", egypt: "Adventure", treasure: "Adventure", ghost: "Horror" };

  window.setupEscapeRooms = function () {
    const $ = id => document.getElementById(id);
    $("escape").hidden = false;
    const status = (msg, err) => { $("escStatus").textContent = msg; $("escStatus").classList.toggle("err", !!err); };
    const sel = $("escTheme");
    THEMES.forEach(t => { const o = document.createElement("option"); o.value = t; o.textContent = t; sel.appendChild(o); });
    sel.addEventListener("change", () => $("escForm").requestSubmit());
    $("escFormat").addEventListener("change", () => $("escForm").requestSubmit());
    $("escPhone").addEventListener("change", () => $("escForm").requestSubmit());

    function search() {
      const q = $("escQ").value.trim().toLowerCase(), theme = sel.value, phone = $("escPhone").checked, format = $("escFormat").value;
      const words = q.split(/[^a-z0-9-]+/).filter(w => w.length > 1);
      const themeWords = words.map(w => WORDS[w] || WORDS[w.replace(/s$/, "")]).filter(Boolean);
      return ROOMS.map(r => {
        if (format && FORMAT(r) !== format) return null;
        if (theme && !r.t.includes(theme)) return null;
        if (phone && !/phone|zoom|any device/i.test(r.on)) return null;
        if (!words.length) return { r, s: 0 };
        const hay = (r.n + " " + (r.by || "") + " " + r.d + " " + r.t.join(" ")).toLowerCase();
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
      if (!list.length) { status("Nothing matches that yet. Try another type or format, or clear the search.", true); return; }
      const theme = sel.value, format = $("escFormat").value;
      const SAY = { "Classic escape rooms": "classic", "Under pressure": "race-the-clock", "Free": "free" };
      const kind = format ? FORMATS[format] : "escape room";
      status(list.length + (theme ? " " + (SAY[theme] || theme.toLowerCase()) : "") + " " + kind + (list.length > 1 ? "s" : "") + " you can play together from two places.");
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
      const fmt = FORMAT(r), img = r.img || (r.id ? IMG(r.id) : null);
      const art = '<div class="escart ' + fmt + '" aria-hidden="true"><span>' + (fmt === "live" ? "LIVE OVER ZOOM" : "PLAY IN YOUR BROWSER") + '</span><b></b><small></small></div>';
      li.innerHTML = (img ? '<img alt="" loading="lazy" referrerpolicy="no-referrer">' : art) +
        '<div class="mbody"><h4></h4><div class="etags"></div><p class="mmeta"></p><p class="edesc"></p><div class="ractions"></div></div>';
      const fillArt = () => { li.querySelector(".escart b").textContent = r.n.replace(" (live)", ""); li.querySelector(".escart small").textContent = r.by || ""; };
      if (img) { const im = li.querySelector("img"); im.src = img; im.onerror = () => { im.insertAdjacentHTML("afterend", art); im.remove(); fillArt(); }; }
      else fillArt();
      li.querySelector("h4").textContent = r.n;
      r.t.forEach(t => { const s = document.createElement("span"); s.className = "etag"; s.textContent = t; li.querySelector(".etags").appendChild(s); });
      li.querySelector(".mmeta").textContent = [r.by, r.price, r.on].filter(Boolean).join(" \u00b7 ");
      li.querySelector(".edesc").textContent = r.d;
      const acts = li.querySelector(".ractions");
      const a = document.createElement("a");
      a.className = "btn"; a.href = r.url || STEAM(r.id); a.target = "_blank"; a.rel = "noopener";
      a.textContent = fmt === "live" ? "Book it" : r.price === "Free" ? "Play free" : "Get it";
      acts.appendChild(a);
      const tr = document.createElement("a");
      tr.className = "btn ghost"; tr.target = "_blank"; tr.rel = "noopener"; tr.textContent = "Watch a trailer";
      tr.href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(fmt === "game" ? r.n + " trailer" : (r.by || "") + " " + r.n.replace(" (live)", "") + " online escape room");
      acts.appendChild(tr);
      return li;
    }
  };
})();
