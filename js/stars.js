// Sky guide for the "Stargazing call" date: type a city, see which constellations, planets and moon
// are up that night and where to look. All the sky math runs here in the browser, no keys.
(function () {
  const $ = id => document.getElementById(id);
  const RAD = Math.PI / 180, DEG = 180 / Math.PI;
  const sin = x => Math.sin(x * RAD), cos = x => Math.cos(x * RAD);
  const norm = x => ((x % 360) + 360) % 360;

  // Bright stars, J2000 [right ascension in hours, declination in degrees]
  const S = {
    Dubhe: [11.062, 61.75], Merak: [11.031, 56.38], Phecda: [11.897, 53.69], Megrez: [12.257, 57.03], Alioth: [12.9, 55.96], Mizar: [13.399, 54.93], Alkaid: [13.792, 49.31],
    Polaris: [2.53, 89.26], Yildun: [17.537, 86.59], epsUMi: [16.766, 82.04], zetUMi: [15.734, 77.79], Kochab: [14.845, 74.16], Pherkad: [15.345, 71.83], etaUMi: [16.292, 75.76],
    Caph: [0.153, 59.15], Schedar: [0.675, 56.54], gamCas: [0.945, 60.72], Ruchbah: [1.43, 60.24], Segin: [1.907, 63.67],
    Alderamin: [21.31, 62.59], betCep: [21.478, 70.56], gamCep: [23.656, 77.63], iotCep: [22.828, 66.2], zetCep: [22.181, 58.2],
    Eltanin: [17.943, 51.49], Rastaban: [17.507, 52.3], xiDra: [17.892, 56.87], nuDra: [17.536, 55.18],
    Betelgeuse: [5.919, 7.41], Bellatrix: [5.419, 6.35], Mintaka: [5.533, -0.3], Alnilam: [5.604, -1.2], Alnitak: [5.679, -1.94], Saiph: [5.796, -9.67], Rigel: [5.242, -8.2], Meissa: [5.585, 9.93],
    Aldebaran: [4.599, 16.51], Elnath: [5.438, 28.61], zetTau: [5.627, 21.14], gamTau: [4.33, 15.63], delTau: [4.382, 17.54], epsTau: [4.477, 19.18], Pleiades: [3.79, 24.12],
    Castor: [7.577, 31.89], Pollux: [7.755, 28.03], Alhena: [6.629, 16.4], Mebsuta: [6.732, 25.13], Wasat: [7.335, 21.98], Tejat: [6.383, 22.51],
    Sirius: [6.752, -16.72], Mirzam: [6.378, -17.96], Adhara: [6.977, -28.97], Wezen: [7.14, -26.39], Aludra: [7.402, -29.3],
    Procyon: [7.655, 5.22], Gomeisa: [7.453, 8.29],
    Capella: [5.278, 46.0], Menkalinan: [5.992, 44.95], thetAur: [5.995, 37.21], Hassaleh: [4.95, 33.17], epsAur: [5.033, 43.82],
    Mirfak: [3.405, 49.86], Algol: [3.136, 40.96], delPer: [3.715, 47.79], gamPer: [3.08, 53.51], epsPer: [3.964, 40.01],
    Regulus: [10.14, 11.97], etaLeo: [10.122, 16.76], Algieba: [10.333, 19.84], Adhafera: [10.278, 23.42], muLeo: [9.879, 26.01], epsLeo: [9.764, 23.77], Denebola: [11.818, 14.57], Zosma: [11.235, 20.52], Chertan: [11.237, 15.43],
    Spica: [13.42, -11.16],
    Gienah: [12.263, -17.54], Kraz: [12.573, -23.4], Algorab: [12.498, -16.52], epsCrv: [12.169, -22.62],
    Arcturus: [14.261, 19.18], Izar: [14.75, 27.07], delBoo: [15.258, 33.31], Nekkar: [15.032, 40.39], gamBoo: [14.535, 38.31], rhoBoo: [14.531, 30.37],
    thetCrB: [15.549, 31.36], betCrB: [15.464, 29.11], Alphecca: [15.578, 26.71], gamCrB: [15.712, 26.3], delCrB: [15.826, 26.07], epsCrB: [15.96, 26.88], iotCrB: [16.024, 29.85],
    epsHer: [17.004, 30.93], zetHer: [16.688, 31.6], etaHer: [16.715, 38.92], piHer: [17.251, 36.81],
    Vega: [18.616, 38.78], zetLyr: [18.746, 37.61], delLyr: [18.908, 36.9], gamLyr: [18.982, 32.69], betLyr: [18.835, 33.36],
    Deneb: [20.69, 45.28], Sadr: [20.37, 40.26], Albireo: [19.512, 27.96], epsCyg: [20.77, 33.97], delCyg: [19.75, 45.13],
    Altair: [19.846, 8.87], Tarazed: [19.771, 10.61], Alshain: [19.922, 6.41],
    Sualocin: [20.661, 15.91], Rotanev: [20.626, 14.6], delDel: [20.724, 15.07], gamDel: [20.777, 16.12], epsDel: [20.554, 11.3],
    Markab: [23.079, 15.21], Scheat: [23.063, 28.08], Alpheratz: [0.14, 29.09], Algenib: [0.221, 15.18],
    delAnd: [0.656, 30.86], Mirach: [1.162, 35.62], Almach: [2.065, 42.33],
    Fomalhaut: [22.961, -29.62],
    Antares: [16.49, -26.43], Dschubba: [16.006, -22.62], Acrab: [16.091, -19.81], piSco: [15.981, -26.11], sigSco: [16.353, -25.59], tauSco: [16.598, -28.22], epsSco: [16.836, -34.29],
    muSco: [16.864, -38.05], zetSco: [16.91, -42.36], etaSco: [17.202, -43.24], Sargas: [17.622, -43.0], iotSco: [17.793, -40.13], kapSco: [17.708, -39.03], Shaula: [17.56, -37.1],
    KausAus: [18.403, -34.38], KausMed: [18.35, -29.83], KausBor: [18.466, -25.42], Nunki: [19.044, -26.3], Ascella: [19.043, -29.88], tauSgr: [19.116, -27.67], phiSgr: [18.761, -26.99], Alnasl: [18.097, -30.42],
    Acrux: [12.443, -63.1], Mimosa: [12.795, -59.69], Gacrux: [12.519, -57.11], delCru: [12.252, -58.75],
    RigilKent: [14.66, -60.84], Hadar: [14.064, -60.37],
    Canopus: [6.399, -52.7], Achernar: [1.629, -57.24], LMC: [5.39, -69.75], SMC: [0.877, -72.8]
  };
  const BRIGHT = new Set(["Sirius", "Canopus", "RigilKent", "Arcturus", "Vega", "Capella", "Rigel", "Procyon", "Achernar", "Betelgeuse", "Hadar", "Altair", "Acrux",
    "Aldebaran", "Antares", "Spica", "Pollux", "Fomalhaut", "Deneb", "Mimosa", "Regulus", "Castor", "Polaris", "Dubhe", "Alkaid", "Alnilam", "Mirfak", "Alpheratz"]);

  const NAMES = { RigilKent: "Alpha Centauri", KausAus: "Kaus Australis", LMC: "Large Magellanic Cloud", SMC: "Small Magellanic Cloud" };

  // w: how easy it is to spot (3 = anyone can find it, 1 = needs dark skies)
  const C = [
    { n: "Big Dipper", also: "part of Ursa Major, the Great Bear", w: 3, star: "Dubhe", lines: [["Alkaid", "Mizar", "Alioth", "Megrez", "Dubhe", "Merak", "Phecda", "Megrez"]],
      look: "Seven bright stars shaped like a ladle or a pot with a long bent handle.",
      fact: "Mizar, the star at the bend of the handle, has a faint partner called Alcor right next to it. People once used spotting the pair as an eyesight test.",
      find: "Face north and look for the big pot. The two stars at the end of the bowl point straight at Polaris, the North Star." },
    { n: "Little Dipper", also: "Ursa Minor, with Polaris", w: 2, star: "Polaris", lines: [["Polaris", "Yildun", "epsUMi", "zetUMi", "Kochab", "Pherkad", "etaUMi", "zetUMi"]],
      look: "A smaller, fainter ladle. Polaris, the North Star, is the tip of its handle and barely moves all night.",
      fact: "Polaris won't be the North Star forever. Earth slowly wobbles like a spinning top, and in about 12,000 years Vega will take over the job.",
      find: "Follow the two pointer stars of the Big Dipper's bowl about five times their distance apart to Polaris. It sits due north." },
    { n: "Cassiopeia", also: "the Queen", w: 3, star: "Schedar", lines: [["Caph", "Schedar", "gamCas", "Ruchbah", "Segin"]],
      look: "Five stars in a bright W or M shape, depending on how it's turned.",
      fact: "In Greek myth she was a queen who bragged that she was more beautiful than the sea nymphs. As punishment she circles the pole forever, upside down half the night.",
      find: "Look on the other side of Polaris from the Big Dipper. When one is low, the other is high." },
    { n: "Cepheus", also: "the King", w: 1, star: "Alderamin", lines: [["Alderamin", "betCep", "gamCep", "iotCep", "zetCep", "Alderamin"], ["betCep", "iotCep"]],
      look: "A faint house with a pointed roof, like a kid's drawing.",
      fact: "Its Garnet Star, Mu Cephei, is one of the biggest stars known. Put it where the Sun is and it would swallow everything out past Mars.",
      find: "Next to Cassiopeia, with the roof pointing toward Polaris. Needs a darker sky." },
    { n: "Draco's head", also: "the Dragon", w: 1, star: "Eltanin", lines: [["Eltanin", "Rastaban", "nuDra", "xiDra", "Eltanin"]],
      look: "A small lopsided box of four stars, the head of a long faint dragon that winds between the two Dippers.",
      fact: "When the Egyptian pyramids were built, the North Star wasn't Polaris. It was Thuban, a star in Draco's tail.",
      find: "Look near bright Vega, toward Polaris." },
    { n: "Orion", also: "the Hunter", w: 3, star: "Betelgeuse", lines: [["Meissa", "Betelgeuse", "Alnitak", "Saiph"], ["Meissa", "Bellatrix", "Mintaka", "Rigel"], ["Mintaka", "Alnilam", "Alnitak"], ["Betelgeuse", "Bellatrix"]],
      look: "Three bright stars in a short straight line make his belt, with orange-red Betelgeuse at one shoulder and blue-white Rigel at one foot.",
      fact: "Betelgeuse is so huge that in place of the Sun it would reach past Mars. It's near the end of its life and will one day explode, bright enough to see in daylight.",
      find: "The belt is the giveaway. Nothing else in the sky has three stars that bright in such a neat row." },
    { n: "Taurus", also: "the Bull, with the Pleiades", w: 2, star: "Aldebaran", lines: [["zetTau", "Aldebaran", "gamTau", "delTau", "epsTau", "Elnath"]], dots: ["Pleiades"],
      look: "A V of stars for the bull's face, with orange Aldebaran as its eye. The Pleiades, a tiny misty cluster like a mini dipper, sit nearby.",
      fact: "The Pleiades are also called the Seven Sisters, though most people see six. Subaru is the Japanese name for the cluster, and it's the six stars on the car logo.",
      find: "Follow Orion's belt away from Sirius to Aldebaran. Keep going a bit further to reach the Pleiades." },
    { n: "Gemini", also: "the Twins", w: 2, star: "Pollux", lines: [["Castor", "Mebsuta", "Tejat"], ["Pollux", "Wasat", "Alhena"]],
      look: "Two bright stars side by side, Castor and Pollux, the heads of two stick-figure twins.",
      fact: "Castor looks like one star, but it's actually six stars orbiting each other.",
      find: "Draw a line from Rigel through Betelgeuse in Orion and keep going." },
    { n: "Canis Major", also: "the Big Dog, with Sirius", w: 3, star: "Sirius", lines: [["Mirzam", "Sirius", "Wezen", "Adhara"], ["Wezen", "Aludra"]],
      look: "Sirius is the brightest star in the whole night sky. It often twinkles in flashes of color when it's low.",
      fact: "Sirius is only 8.6 light years away, which is why it's so bright. The “dog days of summer” are named after it, the Dog Star.",
      find: "Follow Orion's belt down and to the left (in the Southern Hemisphere, up and to the right)." },
    { n: "Canis Minor", also: "the Little Dog, with Procyon", w: 2, star: "Procyon", lines: [["Procyon", "Gomeisa"]],
      look: "Just two stars, but Procyon is one of the brightest in the sky.",
      fact: "Procyon means “before the dog” in Greek, because it rises just before Sirius, the Dog Star.",
      find: "Procyon, Sirius and Betelgeuse make a big, bright triangle, the Winter Triangle." },
    { n: "Auriga", also: "the Charioteer", w: 2, star: "Capella", lines: [["Capella", "Menkalinan", "thetAur", "Elnath", "Hassaleh", "epsAur", "Capella"]],
      look: "A big lopsided pentagon of stars with bright, yellowish Capella at one corner.",
      fact: "Capella looks like one yellow star, but it's two giant stars circling each other, each much bigger than the Sun.",
      find: "Look high above Orion. Capella is the brightest star in that part of the sky." },
    { n: "Perseus", also: "the Hero", w: 1, star: "Mirfak", lines: [["gamPer", "Mirfak", "delPer", "epsPer"], ["Mirfak", "Algol"]],
      look: "A curving line of stars. Algol, the Demon Star, dims for a few hours every three days.",
      fact: "Every August the Perseid meteor shower seems to shoot out of Perseus. The shooting stars are dust left behind by a comet.",
      find: "Between Cassiopeia and the Pleiades." },
    { n: "Leo", also: "the Lion", w: 2, star: "Regulus", lines: [["Regulus", "etaLeo", "Algieba", "Adhafera", "muLeo", "epsLeo"], ["Algieba", "Zosma", "Denebola", "Chertan", "Regulus"]],
      look: "A backward question mark, called the Sickle, makes the lion's head and mane, with a triangle for its tail.",
      fact: "The Leonid meteor shower comes from Leo every November. In 1833 it turned into a storm of tens of thousands of shooting stars an hour.",
      find: "Use the Big Dipper's bowl the other way: the two stars that point to Polaris also point away from it toward Leo." },
    { n: "Virgo's Spica", also: "Virgo, the Maiden", w: 2, star: "Spica", lines: [], dots: ["Spica"],
      look: "Virgo is spread out and faint, but Spica is a bright blue-white star on its own.",
      fact: "Spica is really two stars so close together that they pull each other into egg shapes, whipping around each other every four days.",
      find: "Follow the curve of the Big Dipper's handle: arc to Arcturus, then speed on to Spica." },
    { n: "Corvus", also: "the Crow", w: 1, star: "Gienah", lines: [["Gienah", "Algorab", "Kraz", "epsCrv", "Gienah"]],
      look: "Four stars in a small crooked box, like a ship's sail.",
      fact: "In Greek myth Apollo sent the crow to fetch water. It came back late and lied about why, so it was put in the sky just out of reach of a cup of water, the constellation next to it.",
      find: "Just to the side of Spica, lower toward the horizon." },
    { n: "Boötes", also: "the Herdsman, with Arcturus", w: 3, star: "Arcturus", lines: [["Arcturus", "Izar", "delBoo", "Nekkar", "gamBoo", "rhoBoo", "Arcturus"]],
      look: "A kite or ice-cream-cone shape with orange Arcturus, one of the brightest stars, at the tip.",
      fact: "Light from Arcturus was used to switch on the lights at the 1933 Chicago World's Fair.",
      find: "Follow the curve of the Big Dipper's handle away from the bowl. Arc to Arcturus." },
    { n: "Corona Borealis", also: "the Northern Crown", w: 1, star: "Alphecca", lines: [["thetCrB", "betCrB", "Alphecca", "gamCrB", "delCrB", "epsCrB", "iotCrB"]],
      look: "A small, almost perfect half circle of stars, like a tiara.",
      fact: "One star in the crown, T Coronae Borealis, flares up about every 80 years. In 1866 and 1946 it suddenly became bright enough to see for about a week.",
      find: "Right next to the kite of Boötes, on the side away from Arcturus's bright partner, Vega." },
    { n: "Hercules", also: "the Keystone", w: 1, star: "zetHer", lines: [["epsHer", "zetHer", "etaHer", "piHer", "epsHer"]],
      look: "A lopsided square called the Keystone. A famous star cluster, M13, hides on one side.",
      fact: "In 1974 scientists beamed a radio message toward M13, a ball of 300,000 stars in Hercules. It'll take about 25,000 years to get there.",
      find: "About a third of the way from Vega to Arcturus." },
    { n: "Lyra", also: "the Harp, with Vega", w: 3, star: "Vega", lines: [["Vega", "zetLyr", "delLyr", "gamLyr", "betLyr", "zetLyr"]],
      look: "Brilliant blue-white Vega with a tiny parallelogram of stars hanging beside it.",
      fact: "In the Chinese love story of Qixi, Vega is the Weaver Girl, kept apart from her love Altair by the river of the Milky Way. They're allowed to meet once a year. A long-distance couple, like you two.",
      find: "Vega is the brightest corner of the Summer Triangle." },
    { n: "Cygnus", also: "the Swan, or Northern Cross", w: 2, star: "Deneb", lines: [["Deneb", "Sadr", "Albireo"], ["epsCyg", "Sadr", "delCyg"]],
      look: "A big cross of stars flying along the Milky Way. Deneb is at the top of the cross.",
      fact: "Cygnus X-1, one of the first black holes ever discovered, sits near the swan's neck.",
      find: "Deneb is the Summer Triangle corner closest to Cassiopeia." },
    { n: "Aquila", also: "the Eagle, with Altair", w: 2, star: "Altair", lines: [["Tarazed", "Altair", "Alshain"]],
      look: "Bright Altair with a small star on either side, like a little line of three.",
      fact: "Altair is the Cowherd in the Qixi love story, separated from Vega across the Milky Way. Once a year magpies form a bridge so they can meet. Altair also spins so fast it bulges at the middle.",
      find: "Altair is the Summer Triangle corner farthest from the other two." },
    { n: "Delphinus", also: "the Dolphin", w: 1, star: "Rotanev", lines: [["Rotanev", "Sualocin", "gamDel", "delDel", "Rotanev", "epsDel"]],
      look: "A tiny diamond with a tail, like a dolphin jumping out of the water.",
      fact: "Its two main stars are named Sualocin and Rotanev. Read them backwards: Nicolaus Venator, an astronomer's assistant who sneakily named them after himself.",
      find: "Just next to Altair, on the side toward Deneb." },
    { n: "Pegasus", also: "the Great Square", w: 2, star: "Markab", lines: [["Markab", "Scheat", "Alpheratz", "Algenib", "Markab"]],
      look: "Four stars making a huge, nearly empty square.",
      fact: "51 Pegasi, a faint star near the square, was the first Sun-like star found with a planet, in 1995. That discovery won a Nobel Prize.",
      find: "Fall's landmark. It's bigger than people expect: about the width of your fist and a half at arm's length." },
    { n: "Andromeda", also: "with the Andromeda Galaxy", w: 1, star: "Mirach", lines: [["Alpheratz", "delAnd", "Mirach", "Almach"]],
      look: "A chain of stars from the corner of the Great Square. The Andromeda Galaxy, 2.5 million light years away, is a faint smudge beside it.",
      fact: "The Andromeda Galaxy is the farthest thing you can see with just your eyes. It's heading our way and will merge with the Milky Way in a few billion years.",
      find: "Start at the Great Square's corner toward Cassiopeia and follow the chain." },
    { n: "Fomalhaut", also: "the lonely star of fall", w: 1, star: "Fomalhaut", lines: [], dots: ["Fomalhaut"],
      look: "One bright star alone in a dark patch of sky.",
      fact: "Fomalhaut is surrounded by a huge ring of dust, like a giant version of the icy belt at the edge of our solar system.",
      find: "Follow the west side of the Great Square of Pegasus down toward the horizon and keep going." },
    { n: "Scorpius", also: "the Scorpion", w: 3, star: "Antares", lines: [["Acrab", "Dschubba", "piSco"], ["Dschubba", "sigSco", "Antares", "tauSco", "epsSco", "muSco", "zetSco", "etaSco", "Sargas", "iotSco", "kapSco", "Shaula"]],
      look: "A long curving hook of stars with red Antares, the scorpion's heart, near the top.",
      fact: "In Greek myth the scorpion killed Orion, so the gods put them on opposite sides of the sky. Scorpius rises just as Orion sets.",
      find: "Look low toward the south for a red star in a fishhook of stars." },
    { n: "Sagittarius", also: "the Teapot", w: 2, star: "KausAus", lines: [["Alnasl", "KausMed", "KausAus", "Alnasl"], ["KausMed", "KausBor", "phiSgr", "KausMed"], ["phiSgr", "Nunki", "tauSgr", "Ascella", "phiSgr"], ["Ascella", "KausAus"]],
      look: "Looks just like a teapot. On a dark night the Milky Way rises from its spout like steam.",
      fact: "The center of our galaxy is this way, home to a black hole four million times heavier than the Sun.",
      find: "Just past the tail of Scorpius. The center of our galaxy is in this direction." },
    { n: "Southern Cross", also: "Crux", w: 3, star: "Acrux", lines: [["Acrux", "Gacrux"], ["Mimosa", "delCru"]],
      look: "A small, bright cross of four stars, smaller than most people expect.",
      fact: "It's on the flags of Australia, New Zealand, Brazil, Samoa and Papua New Guinea.",
      find: "The two bright Pointers next to it lead right to it." },
    { n: "The Pointers", also: "Alpha and Beta Centauri", w: 3, star: "RigilKent", lines: [["RigilKent", "Hadar"]],
      look: "Two very bright stars side by side. Alpha Centauri is the closest star system to us, 4.4 light years away.",
      fact: "Alpha Centauri is really three stars. The faintest, Proxima Centauri, is the closest star to the Sun, and it has a planet.",
      find: "Next to the Southern Cross. Follow them to find the cross." },
    { n: "Canopus", also: "in Carina", w: 2, star: "Canopus", lines: [], dots: ["Canopus"],
      look: "The second-brightest star in the night sky, after Sirius.",
      fact: "Spacecraft use Canopus to steer. Many probes carry a star tracker that locks onto it to know which way they're pointing.",
      find: "Far below Sirius, toward the south." },
    { n: "Achernar", also: "the end of the river Eridanus", w: 1, star: "Achernar", lines: [], dots: ["Achernar"],
      look: "A bright star at the end of a long winding river of faint stars.",
      fact: "Achernar spins so fast it's one of the flattest stars known, much wider around the middle than from top to bottom.",
      find: "Low in the south, between Canopus and Fomalhaut." },
    { n: "Magellanic Clouds", also: "two small galaxies", w: 1, star: "LMC", lines: [], dots: ["LMC", "SMC"],
      look: "Two faint misty patches, like torn-off pieces of the Milky Way. They're other galaxies.",
      fact: "They're named after Magellan's crew, who wrote about them on the first voyage around the world. They're two small galaxies orbiting our own.",
      find: "High in the south on a dark night, away from city lights." }
  ];

  const PLANETS = [
    // JPL approximate Keplerian elements (Standish), 1800–2050: a, e, I, L, long. perihelion, long. node, and rates per century
    { n: "Venus", mag: -4.2, hue: "bright white", el: [0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255], r: [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418] },
    { n: "Mars", mag: 0.5, hue: "orange-red", el: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891], r: [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343] },
    { n: "Jupiter", mag: -2.3, hue: "bright cream", el: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], r: [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106] },
    { n: "Saturn", mag: 0.6, hue: "pale gold", el: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], r: [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794] }
  ];
  const EARTH = { el: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0], r: [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0] };

  /* ---------- sky math ---------- */
  const jd = t => t / 86400000 + 2440587.5;
  const OBL = 23.43928;
  function eclToEq(lon, lat) {
    const x = cos(lat) * cos(lon), y = cos(lat) * sin(lon) * cos(OBL) - sin(lat) * sin(OBL), z = cos(lat) * sin(lon) * sin(OBL) + sin(lat) * cos(OBL);
    return { ra: norm(Math.atan2(y, x) * DEG), dec: Math.asin(z) * DEG };
  }
  function altAz(raDeg, dec, t, lat, lon) {
    const d = jd(t) - 2451545, lst = norm(280.46061837 + 360.98564736629 * d + lon), H = lst - raDeg;
    const alt = Math.asin(sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(H)) * DEG;
    const az = norm(Math.atan2(-cos(dec) * sin(H), sin(dec) * cos(lat) - cos(dec) * sin(lat) * cos(H)) * DEG);
    return { alt, az };
  }
  function sunEcl(t) {
    const d = jd(t) - 2451545, g = norm(357.529 + 0.98560028 * d), q = norm(280.459 + 0.98564736 * d);
    return norm(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
  }
  const sunPos = t => eclToEq(sunEcl(t), 0);
  function moonEcl(t) {
    const d = jd(t) - 2451545;
    const L = 218.316 + 13.176396 * d, M = 134.963 + 13.064993 * d, F = 93.272 + 13.22935 * d;
    const D = 297.85 + 12.190749 * d, Ms = 357.529 + 0.98560028 * d;
    return { lon: norm(L + 6.289 * sin(M) + 1.274 * sin(2 * D - M) + 0.658 * sin(2 * D) - 0.186 * sin(Ms) + 0.214 * sin(2 * M)), lat: 5.128 * sin(F) };
  }
  function helio(p, T) {
    const [a, e, I, L, wb, O] = p.el.map((v, i) => v + p.r[i] * T);
    const M = norm(L - wb + 180) - 180, w = wb - O;
    let E = M + DEG * e * sin(M);
    for (let i = 0; i < 6; i++) E -= (E - DEG * e * sin(E) - M) / (1 - e * cos(E));
    const x1 = a * (cos(E) - e), y1 = a * Math.sqrt(1 - e * e) * sin(E);
    return [
      (cos(w) * cos(O) - sin(w) * sin(O) * cos(I)) * x1 + (-sin(w) * cos(O) - cos(w) * sin(O) * cos(I)) * y1,
      (cos(w) * sin(O) + sin(w) * cos(O) * cos(I)) * x1 + (-sin(w) * sin(O) + cos(w) * cos(O) * cos(I)) * y1,
      sin(w) * sin(I) * x1 + cos(w) * sin(I) * y1
    ];
  }
  function planetPos(p, t) {
    const T = (jd(t) - 2451545) / 36525, P = helio(p, T), E = helio(EARTH, T);
    const x = P[0] - E[0], y = P[1] - E[1], z = P[2] - E[2];
    return eclToEq(norm(Math.atan2(y, x) * DEG), Math.atan2(z, Math.hypot(x, y)) * DEG);
  }
  const starAA = (name, t, lat, lon) => altAz(S[name][0] * 15, S[name][1], t, lat, lon);

  /* ---------- time zones ---------- */
  // What a wall-clock time in the place's time zone is in real time
  function zoned(tz) {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" });
    const parts = t => { const o = {}; fmt.formatToParts(new Date(t)).forEach(p => { o[p.type] = +p.value; }); return o; };
    const offset = t => { const p = parts(t); return Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute) - Math.floor(t / 60000) * 60000; };
    return {
      at: (y, m, d, h, min) => { const w = Date.UTC(y, m - 1, d, h, min); return w - offset(w - offset(w)); },
      today: () => { const p = parts(Date.now()); return [p.year, p.month, p.day]; },
      time: t => new Date(t).toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }),
      date: t => new Date(t).toLocaleDateString("en-US", { timeZone: tz, weekday: "long", month: "long", day: "numeric" })
    };
  }
  function timeZoneFor(lat, lon) {
    try { if (window.tzlookup) return window.tzlookup(lat, lon); } catch (e) {}
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /* ---------- words ---------- */
  const DIRS = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];
  const dir = az => DIRS[Math.round(az / 45) % 8];
  function where(alt, az) {
    const fists = Math.max(1, Math.round(alt / 10)), f = fists + " fist" + (fists > 1 ? "s" : "");
    if (alt >= 75) return "Almost straight overhead";
    const height = alt < 20 ? "low, " + f + " above the horizon" : alt < 40 ? "about a third of the way up (" + f + ")" : alt < 60 ? "about halfway up (" + f + ")" : "high up (" + f + ")";
    return "Face " + dir(az) + ", " + height;
  }
  function moonPhase(t) {
    const e = norm(moonEcl(t).lon - sunEcl(t)), lit = Math.round((1 - cos(e)) / 2 * 100);
    const name = e < 10 || e > 350 ? "New moon" : e < 80 ? "Waxing crescent" : e < 100 ? "First quarter" : e < 170 ? "Waxing gibbous" : e < 190 ? "Full moon" : e < 260 ? "Waning gibbous" : e < 280 ? "Last quarter" : "Waning crescent";
    return { e, lit, name };
  }

  /* ---------- page ---------- */
  window.setupStars = function () {
    $("stars").hidden = false;
    const status = (msg, err) => { $("skyStatus").textContent = msg; $("skyStatus").classList.toggle("err", !!err); };
    let place = null;
    try { const saved = localStorage.getItem("liita-sky"); if (saved) $("skyPlace").value = saved; } catch (e) {}
    const tzReady = new Promise(res => {
      const s = document.createElement("script");
      s.src = "js/vendor/tz-lookup.js"; s.onload = s.onerror = res; document.head.appendChild(s);
    });

    $("skyForm").addEventListener("submit", async e => {
      e.preventDefault();
      const q = $("skyPlace").value.trim();
      if (q.length < 2) { status("Type your city, or a town near you.", true); $("skyPlace").focus(); return; }
      $("skyGo").disabled = true;
      try {
        if (!place || place.q !== q) {
          status("Finding " + q + "…");
          place = await geocode(q);
          if (!place) { status("We couldn't find \"" + q + "\". Try adding the state or country.", true); return; }
          place.q = q;
          try { localStorage.setItem("liita-sky", q); } catch (e2) {}
        }
        await tzReady;
        place.tz = timeZoneFor(place.lat, place.lon);
        status("");
        show();
      } catch (err) {
        status("We couldn't reach the map service. Wait a few seconds and try again.", true);
      } finally { $("skyGo").disabled = false; }
    });
    $("skyWhen").addEventListener("change", () => { if (place && place.tz) show(); });
    $("skyDay").addEventListener("change", () => { if (place && place.tz) show(); });

    async function geocode(q) {
      // towns and cities first, so "Sydney Australia" finds the city and not a building named after it
      const photon = async extra => (await (await fetch("https://photon.komoot.io/api/?limit=1&lang=en" + extra + "&q=" + encodeURIComponent(q))).json()).features[0];
      try {
        const f = await photon("&osm_tag=place") || await photon("");
        if (f) {
          const p = f.properties;
          return { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], label: [p.name || p.city, p.state, p.country].filter((v, i, a) => v && a.indexOf(v) === i).join(", ") };
        }
      } catch (e) {}
      const r = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=" + encodeURIComponent(q));
      const n = (await r.json())[0];
      return n ? { lat: +n.lat, lon: +n.lon, label: n.display_name.split(", ").slice(0, 3).join(", ") } : null;
    }

    function show() {
      const { lat, lon } = place, z = zoned(place.tz);
      const [y, m, d] = z.today(), day = +$("skyDay").value;
      const noon = z.at(y, m, d + day, 12, 0);
      const sunAlt = t => { const s = sunPos(t); return altAz(s.ra, s.dec, t, lat, lon).alt; };
      // scan from noon to the next noon in 5-minute steps for sunset and full dark
      let sunset = null, dark = null;
      for (let t = noon; t < noon + 86400000; t += 300000) {
        const a = sunAlt(t), b = sunAlt(t + 300000);
        if (sunset == null && a > -0.8 && b <= -0.8) sunset = t + 300000;
        if (dark == null && a > -15 && b <= -15) dark = t + 300000;
      }
      const when = $("skyWhen").value;
      let t = when === "dark" ? dark : z.at(y, m, d + day, +when, 0);
      if (when !== "dark" && +when < 12) t = z.at(y, m, d + day + 1, +when, 0);
      const nightless = dark == null;
      if (t == null) t = z.at(y, m, d + day, 22, 0);

      // constellations: up if their brightest star and most of the figure are clear of the horizon
      const ups = C.map((c, i) => {
        const names = [...new Set([].concat(...c.lines, c.dots || []))];
        const aa = names.map(nm => starAA(nm, t, lat, lon));
        const main = starAA(c.star, t, lat, lon);
        const v = aa.reduce((s, p) => [s[0] + cos(p.alt) * sin(p.az), s[1] + cos(p.alt) * cos(p.az), s[2] + sin(p.alt)], [0, 0, 0]);
        const alt = Math.atan2(v[2], Math.hypot(v[0], v[1])) * DEG, az = norm(Math.atan2(v[0], v[1]) * DEG);
        const share = aa.filter(p => p.alt > 8).length / aa.length;
        return { c, i, alt, az, main, share };
      }).filter(u => u.main.alt > 12 && u.share >= 0.7 && u.alt > 12);
      ups.sort((a, b) => (b.c.w * 25 + Math.min(b.alt, 50)) - (a.c.w * 25 + Math.min(a.alt, 50)));
      const pick = ups.slice(0, 8);

      const mPos = (() => { const e = moonEcl(t); const q = eclToEq(e.lon, e.lat); return altAz(q.ra, q.dec, t, lat, lon); })();
      const phase = moonPhase(t);
      const planets = PLANETS.map(p => { const q = planetPos(p, t); return { p, ...altAz(q.ra, q.dec, t, lat, lon) }; }).filter(x => x.alt > 5);
      planets.sort((a, b) => a.p.mag - b.p.mag);

      // summary line
      $("skyHead").innerHTML = "";
      const h = document.createElement("h3");
      h.textContent = "The sky over " + place.label;
      const sub = document.createElement("p");
      sub.textContent = z.date(t) + " at " + z.time(t) + " local time";
      $("skyHead").append(h, sub);

      const facts = $("skyFacts"); facts.innerHTML = "";
      const fact = (label, value, note) => {
        const li = document.createElement("li"), b = document.createElement("small"), s = document.createElement("strong");
        b.textContent = label; s.textContent = value; li.append(b, s);
        if (note) { const n = document.createElement("span"); n.textContent = note; li.appendChild(n); }
        facts.appendChild(li);
      };
      fact("Sunset", sunset ? z.time(sunset) : "None tonight");
      fact("Dark enough", nightless ? "Not fully tonight" : z.time(dark), nightless ? "The sun doesn't get far below the horizon this time of year, so only the brightest stars show." : "");
      const moonUp = mPos.alt > 0;
      fact("Moon", phase.name + ", " + phase.lit + "% lit",
        moonUp ? where(mPos.alt, mPos.az) + "." + (phase.lit > 60 ? " It'll wash out fainter stars, so stick to the bright ones." : "")
               : "Below the horizon then, so the sky will be darker.");

      const plist = $("skyPlanets"); plist.innerHTML = "";
      planets.forEach(x => {
        const li = document.createElement("li"), b = document.createElement("strong"), s = document.createElement("span");
        b.textContent = x.p.n; s.textContent = where(x.alt, x.az) + ". Looks like a " + x.p.hue + " star that doesn't twinkle.";
        li.append(b, " ", s); plist.appendChild(li);
      });
      $("skyPlanetsWrap").hidden = !planets.length;

      const list = $("skyList"); list.innerHTML = "";
      pick.forEach((u, n) => {
        const li = document.createElement("li");
        li.className = "scard";
        li.innerHTML = '<div class="flip"><div class="face front"><div class="stop"><span class="rnum"></span><h3></h3><button type="button" class="flipbtn">See what it looks like &#8635;</button></div>' +
          '<p class="also"></p><p class="dir"></p><p class="look"></p><p class="find"><b>How to find it: </b></p><p class="fact"><b>Talk about it: </b></p></div>' +
          '<div class="face back" inert><div class="stop"><span class="rnum"></span><h3></h3><button type="button" class="flipbtn">Back to directions &#8635;</button></div>' +
          '<svg class="cfig" viewBox="0 0 300 190" role="img"></svg><p class="cap"></p></div></div>';
        li.querySelectorAll("h3").forEach(h => { h.textContent = u.c.n; });
        li.querySelectorAll(".rnum").forEach(r => { r.textContent = String(n + 1).padStart(2, "0"); });
        li.querySelector(".also").textContent = u.c.also;
        li.querySelector(".dir").textContent = where(u.alt, u.az);
        li.querySelector(".look").textContent = u.c.look;
        li.querySelector(".find").append(u.c.find);
        li.querySelectorAll(".fact").forEach(f => f.append(u.c.fact));
        const fig = li.querySelector(".cfig");
        drawFigure(fig, u, t, lat, lon);
        fig.setAttribute("aria-label", "Drawing of " + u.c.n + " as it looks in the sky");
        li.querySelector(".cap").textContent = (u.alt >= 75 ? "Looking straight up" : "Facing " + dir(u.az)) + " at " + z.time(t) + ". Bigger dots are brighter stars. It slowly turns as the night goes on.";
        const front = li.querySelector(".front"), back = li.querySelector(".back");
        const flip = () => {
          const on = li.classList.toggle("flipped");
          front.inert = on; back.inert = !on;
          (on ? back : front).querySelector(".flipbtn").focus({ preventScroll: true });
        };
        li.querySelectorAll(".flipbtn").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); flip(); }));
        li.addEventListener("click", e => { if (!e.target.closest("a") && !getSelection().toString()) flip(); });
        list.appendChild(li);
      });
      if (!pick.length) status("It doesn't get dark enough there that night to pick out constellations. Try a later time.", true);

      drawChart(t, lat, lon, pick, planets, moonUp ? { ...mPos, phase } : null);
      $("skyResult").hidden = false;
    }

    /* card back: the constellation drawn the way it looks when you face it, with "up" toward the top of the sky */
    function drawFigure(svg, u, t, lat, lon) {
      const NS = "http://www.w3.org/2000/svg", W = 300, H = 190, PAD = 26;
      const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
      const vec = p => [cos(p.alt) * sin(p.az), cos(p.alt) * cos(p.az), sin(p.alt)];
      const cv = vec(u), r = [cos(u.az), -sin(u.az), 0];
      const up = [r[1] * cv[2] - r[2] * cv[1], r[2] * cv[0] - r[0] * cv[2], r[0] * cv[1] - r[1] * cv[0]];
      const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const names = [...new Set([].concat(...u.c.lines, u.c.dots || []))];
      const raw = {};
      names.forEach(nm => { const v = vec(starAA(nm, t, lat, lon)), d = dot(v, cv); raw[nm] = [dot(v, r) / d, -dot(v, up) / d]; });
      const xs = names.map(nm => raw[nm][0]), ys = names.map(nm => raw[nm][1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const k = Math.min((W - 2 * PAD) / Math.max(maxX - minX, 1e-6), (H - 2 * PAD) / Math.max(maxY - minY, 1e-6), 900);
      const ox = W / 2 - (minX + maxX) / 2 * k, oy = H / 2 - (minY + maxY) / 2 * k;
      const P = nm => [ox + raw[nm][0] * k, oy + raw[nm][1] * k];
      el("rect", { x: 0, y: 0, width: W, height: H, rx: 8, class: "fig-bg" });
      // a few faint background stars so it reads as sky
      let seed = u.i * 7 + 3;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 40; i++) el("circle", { cx: rnd() * W, cy: rnd() * H, r: rnd() < 0.2 ? 1.1 : 0.7, class: "fig-dust" });
      u.c.lines.forEach(line => {
        el("polyline", { points: line.map(nm => P(nm).join(",")).join(" "), class: "fig-line" });
      });
      names.forEach(nm => {
        const [x, y] = P(nm);
        if (nm === "LMC" || nm === "SMC" || nm === "Pleiades") el("circle", { cx: x, cy: y, r: nm === "LMC" ? 13 : 8, class: "fig-fuzz" });
        else el("circle", { cx: x, cy: y, r: BRIGHT.has(nm) ? 5 : 3, class: "fig-star" });
      });
      const label = NAMES[u.c.star] || (/^[a-z]+[A-Z]/.test(u.c.star) ? "" : u.c.star);
      if (label) {
        const [x, y] = P(u.c.star), right = x < W - 90;
        const tx = el("text", { x: right ? x + 9 : x - 9, y: y - 7, class: "fig-label", "text-anchor": right ? "start" : "end" });
        tx.textContent = label;
      }
      if (u.c.dots && u.c.dots.includes("Pleiades")) { const [x, y] = P("Pleiades"); const tx = el("text", { x: x + 11, y: y + 4, class: "fig-label" }); tx.textContent = "Pleiades"; }
      const tu = el("text", { x: W - 10, y: 16, class: "fig-up", "text-anchor": "end" }); tu.textContent = "↑ up";
    }

    /* star chart: the whole sky as a circle, horizon at the edge, overhead in the middle */
    function drawChart(t, lat, lon, pick, planets, moon) {
      const R = 150, c = 160, NS = "http://www.w3.org/2000/svg";
      const svg = $("skyChart"); svg.innerHTML = "";
      const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; };
      // east on the left, like a map you hold over your head
      const xy = p => { const r = R * (90 - p.alt) / 90; return [c - r * sin(p.az), c - r * cos(p.az)]; };
      el("circle", { cx: c, cy: c, r: R, class: "sky-bg" });
      [30, 60].forEach(a => el("circle", { cx: c, cy: c, r: R * (90 - a) / 90, class: "sky-ring" }));
      for (let a = 0; a < 360; a += 45) { const [x, y] = xy({ alt: 0, az: a }); el("line", { x1: c, y1: c, x2: x, y2: y, class: "sky-ring" }); }
      const clip = el("clipPath", { id: "skyClip" }); el("circle", { cx: c, cy: c, r: R }, clip);
      const g = el("g", { "clip-path": "url(#skyClip)" });
      const chosen = new Set(pick.map(u => u.i));
      C.forEach((cn, i) => {
        const on = chosen.has(i);
        cn.lines.forEach(line => {
          const pts = line.map(nm => starAA(nm, t, lat, lon));
          for (let k = 1; k < pts.length; k++) {
            if (pts[k - 1].alt < -3 && pts[k].alt < -3) continue;
            const [x1, y1] = xy(pts[k - 1]), [x2, y2] = xy(pts[k]);
            el("line", { x1, y1, x2, y2, class: on ? "con on" : "con" }, g);
          }
        });
      });
      Object.keys(S).forEach(nm => {
        const p = starAA(nm, t, lat, lon);
        if (p.alt < 0) return;
        const [x, y] = xy(p);
        if (nm === "LMC" || nm === "SMC" || nm === "Pleiades") el("circle", { cx: x, cy: y, r: nm === "LMC" ? 6 : 3.5, class: "fuzz" }, g);
        else el("circle", { cx: x, cy: y, r: BRIGHT.has(nm) ? 2.6 : 1.5, class: "star" }, g);
      });
      planets.forEach(x => {
        const [px, py] = xy(x);
        el("circle", { cx: px, cy: py, r: 3.6, class: "planet" }, g);
        const tx = el("text", { x: px + 6, y: py + 3.5, class: "plabel" }, g); tx.textContent = x.p.n;
      });
      if (moon) {
        const [mx, my] = xy(moon);
        el("circle", { cx: mx, cy: my, r: 8, class: "moon" }, g);
        const tx = el("text", { x: mx + 11, y: my + 4, class: "plabel" }, g); tx.textContent = "Moon";
      }
      pick.forEach((u, n) => {
        const [x, y] = xy(u);
        el("circle", { cx: x, cy: y, r: 9, class: "pin" }, g);
        const tx = el("text", { x, y: y + 3.5, class: "pnum" }, g); tx.textContent = n + 1;
      });
      el("circle", { cx: c, cy: c, r: R, class: "sky-edge" });
      [["N", 0], ["E", 90], ["S", 180], ["W", 270]].forEach(([l, a]) => {
        const r = R + 1, x = c - r * sin(a), y = c - r * cos(a);
        el("circle", { cx: x, cy: y, r: 9, class: "compass-bg" });
        const tx = el("text", { x, y: y + 4, class: "compass" }); tx.textContent = l;
      });
    }
  };
})();
