// Passport Night (Plus): spin a country, cook its dish, play its music, learn five phrases, walk one of its streets,
// then stamp your passport. Stamps are saved on this device.
(function () {
  const $ = id => document.getElementById(id);

  // words: [what it means, how it's written, how to say it]
  window.PASSPORT = [
    { c: "Italy", city: "Rome", walk: [41.8894, 12.4699], place: "Trastevere", dish: "Cacio e pepe", note: "Pasta, pecorino and lots of black pepper. Three ingredients, about 20 minutes.", music: ["Laura Pausini", "Lucio Dalla", "Måneskin"],
      words: [["Hello", "Ciao", "CHOW"], ["Thank you", "Grazie", "GRAHT-see-eh"], ["I love you", "Ti amo", "tee AH-mo"], ["I miss you", "Mi manchi", "mee MAHN-kee"], ["Cheers!", "Salute!", "sah-LOO-teh"]] },
    { c: "France", city: "Paris", walk: [48.8874, 2.3394], place: "Montmartre", dish: "Croque monsieur", note: "The Paris café toastie: ham, Gruyère and a little béchamel, grilled until golden. About 25 minutes.", music: ["Édith Piaf", "Charles Aznavour", "Stromae"],
      words: [["Hello", "Bonjour", "bohn-ZHOOR"], ["Thank you", "Merci", "mair-SEE"], ["I love you", "Je t'aime", "zhuh TEM"], ["I miss you", "Tu me manques", "tew muh MAHNK"], ["Cheers!", "Santé !", "sahn-TAY"]] },
    { c: "Japan", city: "Kyoto", walk: [34.9982, 135.7809], place: "Ninenzaka", dish: "Oyakodon", note: "Chicken and egg simmered in a sweet soy broth, spooned over rice. About 30 minutes.", music: ["Hikaru Utada", "Mariya Takeuchi", "YOASOBI"],
      words: [["Hello", "Konnichiwa", "kon-NEE-chee-wah"], ["Thank you", "Arigatō", "ah-ree-GAH-toh"], ["I love you", "Daisuki da yo", "dye-SKEE dah yo"], ["I want to see you", "Aitai", "eye-TIE"], ["Cheers!", "Kanpai!", "kahn-PIE"]] },
    { c: "Mexico", city: "Mexico City", walk: [19.3497, -99.1622], place: "Coyoacán", dish: "Chilaquiles", note: "Tortilla chips simmered in red or green salsa, topped with a fried egg, crema and cheese. About 25 minutes.", music: ["Natalia Lafourcade", "Luis Miguel", "Vicente Fernández"],
      words: [["Hello", "Hola", "OH-lah"], ["Thank you", "Gracias", "GRAH-see-ahs"], ["I love you", "Te amo", "teh AH-mo"], ["I miss you", "Te extraño", "teh ex-TRAH-nyo"], ["Cheers!", "¡Salud!", "sah-LOOD"]] },
    { c: "Greece", city: "Santorini", walk: [36.4618, 25.3753], place: "Oia", dish: "Chicken souvlaki with tzatziki", note: "Lemon and oregano chicken skewers with a cool yogurt and cucumber dip. About 40 minutes.", music: ["Haris Alexiou", "Mikis Theodorakis", "Nana Mouskouri"],
      words: [["Hello", "Yia sou", "YAH-soo"], ["Thank you", "Efcharistó", "ef-hah-ree-STOH"], ["I love you", "S'agapó", "sah-gah-POH"], ["I miss you", "Mou leípeis", "moo LEE-pees"], ["Cheers!", "Yamas!", "YAH-mas"]] },
    { c: "Spain", city: "Seville", walk: [37.3851, -5.99], place: "Barrio Santa Cruz", dish: "Tortilla española", note: "A thick potato and onion omelet, flipped with a plate. About 45 minutes.", music: ["Rosalía", "Paco de Lucía", "Alejandro Sanz"],
      words: [["Hello", "Hola", "OH-lah"], ["Thank you", "Gracias", "GRAH-thee-ahs"], ["I love you", "Te quiero", "teh kee-EH-ro"], ["I miss you", "Te echo de menos", "teh EH-cho deh MEH-nos"], ["Cheers!", "¡Salud!", "sah-LOOD"]] },
    { c: "Portugal", city: "Lisbon", walk: [38.7114, -9.13], place: "Alfama", dish: "Bacalhau à Brás", note: "Salt cod with crispy matchstick potatoes, onion and soft egg. About 40 minutes.", music: ["Amália Rodrigues", "Mariza", "Salvador Sobral"],
      words: [["Hello", "Olá", "oh-LAH"], ["Thank you", "Obrigado / Obrigada", "oh-bree-GAH-doo / -dah"], ["I love you", "Amo-te", "AH-moo-teh"], ["I miss you", "Tenho saudades tuas", "TEN-yoo sow-DAH-desh TOO-ash"], ["Cheers!", "Saúde!", "sah-OO-deh"]] },
    { c: "Morocco", city: "Marrakesh", walk: [31.6258, -7.9891], place: "Jemaa el-Fnaa", dish: "Chicken tagine with lemon and olives", note: "Chicken slow-cooked with ginger, saffron, preserved lemon and olives. Any heavy pot works. About an hour.", music: ["Hindi Zahra", "Mahmoud Guinia", "Oum"],
      words: [["Hello", "Salam", "sah-LAHM"], ["Thank you", "Shukran", "SHOO-kran"], ["I love you", "Kanbghik", "kan-BGHEEK"], ["I miss you", "Twehhashtek", "tweh-HASH-tek"], ["Enjoy!", "Bsaha!", "b-SAH-ha"]] },
    { c: "Thailand", city: "Bangkok", walk: [13.7398, 100.5097], place: "Yaowarat, Chinatown", dish: "Pad kra pao", note: "Minced chicken or pork stir-fried with chilli and holy basil, with a crispy fried egg on rice. About 20 minutes.", music: ["Phum Viphurit", "Bird Thongchai", "Polycat"],
      words: [["Hello", "Sawasdee krap / ka", "sah-wah-DEE krahp (men) / kah (women)"], ["Thank you", "Khob khun krap / ka", "kop KOON krahp / kah"], ["I love you", "Phom / Chan rak khun", "pom (men) / chahn (women) RAHK koon"], ["I miss you", "Kit thueng", "kit TUNG"], ["Cheers!", "Chon kaew!", "chon GAE-oh"]] },
    { c: "India", city: "Jaipur", walk: [26.9239, 75.8267], place: "Hawa Mahal", dish: "Chana masala", note: "Chickpeas in a spiced tomato and onion gravy, with rice or warm flatbread. About 35 minutes.", music: ["A. R. Rahman", "Lata Mangeshkar", "Arijit Singh"],
      words: [["Hello", "Namaste", "NUH-mus-tay"], ["Thank you", "Dhanyavaad", "DHUN-yuh-vaad"], ["I love you", "Main tumse pyaar karta / karti hoon", "main TUM-say pyaar KAR-ta (men) / KAR-tee (women) hoon"], ["I miss you", "Tumhari yaad aati hai", "tum-HAA-ree yaad AA-tee hai"], ["Delicious!", "Bahut swaadisht!", "buh-HOOT SWAA-disht"]] },
    { c: "Brazil", city: "Rio de Janeiro", walk: [-22.9153, -43.1792], place: "the Selarón Steps", dish: "Moqueca", note: "Fish stewed in coconut milk with peppers, tomato and lime. About 45 minutes.", music: ["Gilberto Gil", "João Gilberto", "Anitta"],
      words: [["Hello", "Oi", "oy"], ["Thank you", "Obrigado / Obrigada", "oh-bree-GAH-doo / -dah"], ["I love you", "Eu te amo", "EH-oo chee AH-moo"], ["I miss you", "Saudade de você", "sow-DAH-jee jee voh-SAY"], ["Cheers!", "Saúde!", "sah-OO-jee"]] },
    { c: "South Korea", city: "Seoul", walk: [37.5826, 126.9837], place: "Bukchon Hanok Village", dish: "Kimchi fried rice", note: "Day-old rice fried with kimchi, a little gochujang and a runny egg on top. About 20 minutes.", music: ["IU", "BTS", "AKMU"],
      words: [["Hello", "Annyeonghaseyo", "ahn-nyong-ha-SAY-yo"], ["Thank you", "Gamsahamnida", "gahm-sah-HAM-nee-da"], ["I love you", "Saranghae", "sah-rahng-HEH"], ["I miss you", "Bogo sipeo", "BO-go SHIP-uh"], ["Cheers!", "Geonbae!", "gun-BEH"]] },
    { c: "Peru", city: "Cusco", walk: [-13.5167, -71.9787], place: "Plaza de Armas", dish: "Lomo saltado", note: "Beef, onion and tomato stir-fried with soy sauce, served with fries and rice. About 35 minutes.", music: ["Susana Baca", "Chabuca Granda", "Gian Marco"],
      words: [["Hello", "Hola", "OH-lah"], ["Thank you", "Gracias", "GRAH-see-ahs"], ["I love you", "Te quiero", "teh kee-EH-ro"], ["I miss you", "Te extraño", "teh ex-TRAH-nyo"], ["So tasty!", "¡Qué rico!", "keh REE-ko"]] },
    { c: "Turkey", city: "Istanbul", walk: [41.0294, 28.9486], place: "Balat", dish: "Menemen", note: "Eggs softly scrambled into tomatoes and green peppers, with bread for dipping. About 20 minutes.", music: ["Sezen Aksu", "Barış Manço", "Tarkan"],
      words: [["Hello", "Merhaba", "MEHR-ha-ba"], ["Thank you", "Teşekkürler", "teh-shek-kur-LER"], ["I love you", "Seni seviyorum", "seh-NEE seh-VEE-yo-room"], ["I miss you", "Seni özledim", "seh-NEE urz-leh-DEEM"], ["Cheers!", "Şerefe!", "sheh-reh-FEH"]] },
    { c: "Vietnam", city: "Hội An", walk: [15.877, 108.3266], place: "the Ancient Town", dish: "Bánh mì", note: "A crusty roll with grilled pork or tofu, pickled carrot, cucumber, coriander and chilli. About 30 minutes.", music: ["Trịnh Công Sơn", "Sơn Tùng M-TP", "Hoàng Thùy Linh"],
      words: [["Hello", "Xin chào", "sin CHOW"], ["Thank you", "Cảm ơn", "gahm UHN"], ["I love you", "Anh yêu em / Em yêu anh", "ahn YEW em (men) / em YEW ahn (women)"], ["I miss you", "Anh nhớ em / Em nhớ anh", "ahn NYUH em / em NYUH ahn"], ["Cheers!", "Một, hai, ba, dô!", "moht, hai, bah, YO"]] },
    { c: "Argentina", city: "Buenos Aires", walk: [-34.6393, -58.363], place: "Caminito, La Boca", dish: "Choripán with chimichurri", note: "Grilled chorizo in crusty bread with a sharp parsley and garlic sauce. About 25 minutes.", music: ["Mercedes Sosa", "Astor Piazzolla", "Carlos Gardel"],
      words: [["Hello", "Hola", "OH-lah"], ["Thank you", "Gracias", "GRAH-see-ahs"], ["I love you", "Te amo", "teh AH-mo"], ["I miss you", "Te extraño", "teh ex-TRAH-nyo"], ["Cheers!", "¡Salud!", "sah-LOOD"]] },
    { c: "Ireland", city: "Galway", walk: [53.2724, -9.0527], place: "Shop Street", dish: "Irish soda bread", note: "No yeast, no waiting: flour, buttermilk and baking soda, warm from the oven with butter. About 45 minutes.", music: ["The Dubliners", "Christy Moore", "Hozier"],
      words: [["Hello", "Dia duit", "DEE-ah gwitch"], ["Thank you", "Go raibh maith agat", "guh rev MAH ah-gut"], ["I love you", "Is breá liom thú", "iss BRAW lum hoo"], ["You're my love", "Mo ghrá thú", "muh GRAW hoo"], ["Cheers!", "Sláinte!", "SLAWN-cha"]] },
    { c: "Jamaica", city: "Kingston", walk: [18.0059, -76.7866], place: "New Kingston", dish: "Jerk chicken", note: "Chicken marinated in scotch bonnet, allspice and thyme, then roasted or grilled. About an hour, plus marinating.", music: ["Bob Marley", "Toots and the Maytals", "Koffee"],
      words: [["Hello", "Wah gwaan", "wah GWAHN"], ["Thank you", "Tank yuh", "TANK yoo"], ["I love you", "Mi love yuh", "mee LUV yoo"], ["I miss you", "Mi miss yuh", "mee MISS yoo"], ["All good!", "Irie!", "EYE-ree"]] },
    { c: "Lebanon", city: "Beirut", walk: [33.8946, 35.5168], place: "Gemmayzeh", dish: "Fattoush and hummus", note: "A crunchy salad with toasted pita and sumac, next to homemade hummus. About 30 minutes.", music: ["Fairuz", "Wadih El Safi", "Mashrou' Leila"],
      words: [["Hello", "Marhaba", "MAR-ha-ba"], ["Thank you", "Shukran", "SHOO-kran"], ["I love you", "Bhebbak / Bhebbik", "BHEB-bak (to a man) / BHEB-bik (to a woman)"], ["I miss you", "Eshta'tellak / Eshta'tellik", "esh-TAA-tel-lak / -lik"], ["Cheers!", "Kessak!", "KAS-sak"]] },
    { c: "Iceland", city: "Reykjavík", walk: [64.1446, -21.929], place: "Laugavegur", dish: "Plokkfiskur", note: "Iceland's comfort food: flaked white fish and potatoes in a creamy sauce, with rye bread. About 35 minutes.", music: ["Björk", "Sigur Rós", "Of Monsters and Men"],
      words: [["Hello", "Halló", "HAH-loh"], ["Thank you", "Takk", "tahk"], ["I love you", "Ég elska þig", "yeh EL-skah thikh"], ["I miss you", "Ég sakna þín", "yeh SAHK-nah theen"], ["Cheers!", "Skál!", "skowl"]] },
    { c: "Sweden", city: "Stockholm", walk: [59.3249, 18.0707], place: "Gamla stan", dish: "Swedish meatballs", note: "Small meatballs in a creamy gravy, with mashed potatoes and lingonberry (or cranberry) jam. About 45 minutes.", music: ["ABBA", "Robyn", "José González"],
      words: [["Hello", "Hej", "hey"], ["Thank you", "Tack", "tahk"], ["I love you", "Jag älskar dig", "yah EL-skar day"], ["I miss you", "Jag saknar dig", "yah SAHK-nar day"], ["Cheers!", "Skål!", "skohl"]] },
    { c: "Philippines", city: "Manila", walk: [14.5906, 120.9752], place: "Intramuros", dish: "Chicken adobo", note: "Chicken braised in vinegar, soy sauce, garlic and bay leaves, over rice. About 45 minutes.", music: ["Ben&Ben", "Moira Dela Torre", "APO Hiking Society"],
      words: [["Hello", "Kumusta", "koo-MOOS-tah"], ["Thank you", "Salamat", "sah-LAH-mat"], ["I love you", "Mahal kita", "mah-HAL kee-TAH"], ["I miss you", "Miss na kita", "miss nah kee-TAH"], ["Cheers!", "Mabuhay!", "mah-BOO-high"]] },
    { c: "Indonesia", city: "Bali", walk: [-8.5069, 115.2624], place: "Ubud", dish: "Nasi goreng", note: "Fried rice with sweet soy sauce, shallots and chilli, topped with a fried egg. About 20 minutes.", music: ["Tulus", "Raisa", "Nadin Amizah"],
      words: [["Hello", "Halo", "HAH-lo"], ["Thank you", "Terima kasih", "teh-REE-mah KAH-see"], ["I love you", "Aku cinta kamu", "AH-koo CHIN-tah KAH-moo"], ["I miss you", "Aku kangen kamu", "AH-koo KAHNG-en KAH-moo"], ["Delicious!", "Enak!", "eh-NAHK"]] },
    { c: "Nigeria", city: "Lagos", walk: [6.4474, 3.4553], place: "Lekki", dish: "Jollof rice", note: "Rice cooked in a smoky tomato and pepper sauce. Every family swears theirs is the best. About an hour.", music: ["Burna Boy", "Fela Kuti", "Tems"],
      words: [["Hello", "How far?", "how FAR (Nigerian Pidgin)"], ["Thank you", "Thank you well well", "thank you WELL well"], ["I love you", "I love you die", "I love you DIE (\"so much\")"], ["I miss you", "I dey miss you", "I day MISS you"], ["So tasty!", "E sweet well well!", "eh SWEET well well"]] }
  ];

  const KEY = "liita-passport";
  const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || "{}"); return { stamps: v.stamps || [], skip: v.skip || [] }; } catch (e) { return { stamps: [], skip: [] }; } };
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  const yt = q => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
  const pano = ([lat, lon]) => "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + lat + "," + lon;
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const INKS = ["#a8362f", "#2c4a7a", "#5f7148", "#7a3a6a", "#9a5b16"];
  // The airport you'd fly into for each city, for the boarding pass.
  const CODES = { Italy: "FCO", France: "CDG", Japan: "KIX", Mexico: "MEX", Greece: "JTR", Spain: "SVQ", Portugal: "LIS", Morocco: "RAK", Thailand: "BKK", India: "JAI", Brazil: "GIG", "South Korea": "ICN",
    Peru: "CUZ", Turkey: "IST", Vietnam: "DAD", Argentina: "EZE", Ireland: "SNN", Jamaica: "KIN", Lebanon: "BEY", Iceland: "KEF", Sweden: "ARN", Philippines: "MNL", Indonesia: "DPS", Nigeria: "LOS" };
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flap = el => { el.classList.remove("flap"); void el.offsetWidth; el.classList.add("flap"); };

  function stampSvg(s, i) {
    const ink = INKS[i % INKS.length], rot = ((i * 37) % 21) - 10, round = i % 3 !== 1;
    const when = new Date(s.t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
    const frame = round
      ? '<circle cx="60" cy="60" r="54" fill="none" stroke="' + ink + '" stroke-width="3"/><circle cx="60" cy="60" r="46" fill="none" stroke="' + ink + '" stroke-width="1.2"/>'
      : '<rect x="8" y="18" width="104" height="84" rx="8" fill="none" stroke="' + ink + '" stroke-width="3"/><rect x="15" y="25" width="90" height="70" rx="5" fill="none" stroke="' + ink + '" stroke-width="1.2"/>';
    return '<svg viewBox="0 0 120 120" class="stamp" style="transform:rotate(' + rot + 'deg)" role="img" aria-label="' + esc(s.c) + ', ' + esc(when) + '">' + frame +
      '<text x="60" y="52" text-anchor="middle" fill="' + ink + '" font-family="var(--mono)" font-weight="800" font-size="' + (s.c.length > 10 ? 8.5 : s.c.length > 7 ? 10.5 : 13) + '" letter-spacing="' + (s.c.length > 10 ? 0.6 : 1.5) + '">' + esc(s.c.toUpperCase()) + "</text>" +
      '<path d="M30 61h60" stroke="' + ink + '" stroke-width="1"/>' +
      '<text x="60" y="76" text-anchor="middle" fill="' + ink + '" font-family="var(--mono)" font-weight="700" font-size="8" letter-spacing="1">' + esc(when) + "</text>" +
      '<text x="60" y="89" text-anchor="middle" fill="' + ink + '" font-family="var(--display)" font-style="italic" font-size="10">' + esc(s.city) + "</text></svg>";
  }

  window.setupPassport = function () {
    $("passport").hidden = false;
    const P = window.PASSPORT;
    let st = load(), cur = null;

    const pickSel = $("ppPick");
    P.forEach((p, i) => { const o = document.createElement("option"); o.value = i; o.textContent = p.c; pickSel.appendChild(o); });

    // The data page: passport number and issue date come from the first stamp, plus the two machine-readable lines.
    function fillDataPage() {
      const first = st.stamps[0], n = st.stamps.length;
      const no = "LI" + String(first ? first.t % 1e7 : 0).padStart(7, "0");
      const d = first ? new Date(first.t) : null;
      const yymmdd = d ? String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") : "000000";
      $("ppNo").textContent = no;
      $("ppIssued").textContent = d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "FIRST STAMP";
      $("ppHeld").textContent = n + " / " + P.length;
      const line = t => (t + "<".repeat(44)).slice(0, 44);
      $("ppMrz").textContent = line("P<LITATHE<TWO<OF<YOU<<LONG<DISTANCE") + "\n" + line(no + "<" + (n % 10) + "LDR" + yymmdd + "<" + String(n).padStart(2, "0") + "<<TOGETHER");
    }

    // fresh: the stamp that was just added lands with a thump.
    function renderBook(fresh) {
      const book = $("ppStamps");
      book.innerHTML = "";
      $("ppCount").textContent = st.stamps.length ? st.stamps.length + " of " + P.length + " countries" : "No stamps yet";
      fillDataPage();
      $("ppReset").hidden = !st.stamps.length && !st.skip.length;
      st.stamps.forEach((s, i) => { const d = document.createElement("div"); d.className = "ppstamp" + (fresh && i === st.stamps.length - 1 ? " fresh" : ""); d.innerHTML = stampSvg(s, i); book.appendChild(d); });
      if (st.stamps.length < P.length) { const slot = document.createElement("div"); slot.className = "ppslot"; slot.textContent = st.stamps.length ? "Your next stamp" : "Your first stamp goes here"; book.appendChild(slot); }
    }

    function show(i) {
      cur = i;
      const p = P[i];
      pickSel.value = i;
      $("ppCountry").textContent = p.c;
      $("ppCity").textContent = "Tonight: " + p.city;
      $("ppCode").textContent = $("ppStubCode").textContent = CODES[p.c] || p.city.slice(0, 3).toUpperCase();
      $("ppFlight").textContent = "Flight LI " + (214 + i * 37);
      [$("ppCountry"), $("ppCode")].forEach(flap);
      $("passport").classList.remove("spinning");
      $("ppTicket").classList.add("landed");
      $("ppDish").textContent = p.dish;
      $("ppNote").textContent = p.note;
      $("ppRecipe").href = "https://www.google.com/search?q=" + encodeURIComponent(p.dish + " recipe");
      const mu = $("ppMusic"); mu.innerHTML = "";
      p.music.forEach(a => { const li = document.createElement("li"), l = document.createElement("a"); l.href = yt(a); l.target = "_blank"; l.rel = "noopener"; l.textContent = a; li.appendChild(l); mu.appendChild(li); });
      $("ppSpotify").href = "https://open.spotify.com/search/" + encodeURIComponent(p.c + " " + p.music[0]);
      const w = $("ppWords"); w.innerHTML = "";
      p.words.forEach(([mean, said, how]) => {
        const li = document.createElement("li");
        li.innerHTML = '<button type="button" class="ppflip" aria-pressed="false"><span class="ppf"><small>How do you say</small><b></b><span class="pphint">Tap to flip</span></span><span class="ppf back" aria-hidden="true"><small></small><b></b><span></span></span></button>';
        const [front, back] = li.querySelectorAll(".ppf");
        front.querySelector("b").textContent = mean;
        back.querySelector("small").textContent = mean; back.querySelector("b").textContent = said; back.querySelector("span").textContent = how;
        w.appendChild(li);
      });
      $("ppFlipAll").textContent = "Flip them all";
      $("ppWalkName").textContent = p.place + ", " + p.city;
      $("ppWalk").href = pano(p.walk);
      const done = st.stamps.some(s => s.c === p.c);
      $("ppStamp").textContent = done ? "Stamped. Spin for the next one" : "We did it. Stamp our passports";
      $("ppStamp").dataset.done = done ? "1" : "";
      $("ppVisited").hidden = !done;
      const res = $("ppResult");
      res.hidden = false; res.classList.remove("fresh"); void res.offsetWidth; res.classList.add("fresh");
    }

    function spin() {
      const done = new Set(st.stamps.map(s => s.c).concat(st.skip));
      let pool = P.map((p, i) => i).filter(i => !done.has(P[i].c) && i !== cur);
      if (!pool.length) pool = P.map((p, i) => i).filter(i => i !== cur);
      const box = $("ppCountry"), code = $("ppCode");
      let n = 0;
      const final = pool[Math.floor(Math.random() * pool.length)];
      if (reduce()) return show(final);
      // Departure-board shuffle while the plane takes off again from home.
      $("passport").classList.add("spinning");
      $("ppTicket").classList.remove("landed");
      $("ppVisited").hidden = true;
      $("ppCity").textContent = "Finding tonight's flight…";
      const tick = () => {
        const r = P[Math.floor(Math.random() * P.length)];
        box.textContent = r.c; code.textContent = CODES[r.c] || "???";
        flap(box); flap(code);
        if (++n < 16) setTimeout(tick, 45 + n * 10); else show(final);
      };
      tick();
    }

    $("ppSpin").addEventListener("click", spin);
    pickSel.addEventListener("change", () => show(+pickSel.value));
    $("ppSkip").addEventListener("click", () => {
      if (cur === null) return;
      if (!st.skip.includes(P[cur].c)) st.skip.push(P[cur].c);
      save(st); spin();
    });
    $("ppStamp").addEventListener("click", () => {
      if (cur === null) return;
      if ($("ppStamp").dataset.done) return spin();
      st.stamps.push({ c: P[cur].c, city: P[cur].city, t: Date.now() });
      save(st); renderBook(true); show(cur);
      $("ppBook").scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "center" });
    });
    $("ppWords").addEventListener("click", e => {
      const b = e.target.closest(".ppflip"); if (!b) return;
      const on = b.classList.toggle("on");
      b.setAttribute("aria-pressed", on);
      b.children[0].setAttribute("aria-hidden", on); b.children[1].setAttribute("aria-hidden", !on);
    });
    $("ppFlipAll").addEventListener("click", () => {
      const cards = [...$("ppWords").querySelectorAll(".ppflip")], on = cards.some(b => !b.classList.contains("on"));
      cards.forEach((b, i) => setTimeout(() => {
        b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
        b.children[0].setAttribute("aria-hidden", on); b.children[1].setAttribute("aria-hidden", !on);
      }, reduce() ? 0 : i * 90));
      $("ppFlipAll").textContent = on ? "Flip them back" : "Flip them all";
    });
    $("ppSend").addEventListener("click", async () => {
      if (cur === null) return;
      const url = location.origin + location.pathname + "?d=passport-night&c=" + encodeURIComponent(P[cur].c);
      const text = "Passport Night: we're going to " + P[cur].c + " tonight.";
      try { if (navigator.share) { await navigator.share({ title: "Passport Night", text, url }); return; } } catch (e) { return; }
      try { await navigator.clipboard.writeText(url); $("ppSend").textContent = "Link copied"; setTimeout(() => { $("ppSend").textContent = "Send them tonight's country"; }, 2200); }
      catch (e) { $("ppLink").value = url; $("ppLink").hidden = false; $("ppLink").select(); }
    });

    // Reset clears every stamp and skipped country. The first tap asks, the second one clears.
    let disarm;
    $("ppReset").addEventListener("click", () => {
      const b = $("ppReset");
      if (!b.dataset.armed) {
        b.dataset.armed = "1"; b.textContent = "Tap again to clear every stamp";
        disarm = setTimeout(() => { delete b.dataset.armed; b.textContent = "Reset"; }, 4000);
        return;
      }
      clearTimeout(disarm); delete b.dataset.armed; b.textContent = "Reset";
      st = { stamps: [], skip: [] }; save(st); renderBook();
      if (cur !== null) show(cur);
    });

    // A guilloche rosette, like the security print on a real passport page.
    const ros = '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width=".55">' +
      Array.from({ length: 40 }, (_, i) => { const a = i * Math.PI / 20; return '<circle cx="' + (100 + 44 * Math.cos(a)).toFixed(1) + '" cy="' + (100 + 44 * Math.sin(a)).toFixed(1) + '" r="44"/>'; }).join("") + "</svg>";
    document.querySelectorAll("#ppBook .ppros").forEach(el => { el.innerHTML = ros; });

    renderBook();
    const want = new URLSearchParams(location.search).get("c");
    const wi = want ? P.findIndex(p => p.c.toLowerCase() === want.toLowerCase()) : -1;
    if (wi >= 0) show(wi);
  };
})();
