// Murder Mystery for Two (Plus): one case, two characters, each with their own secret link.
// Each player sees only their own clues, round by round. Whoever is sent a character link doesn't need Plus.
(function () {
  const $ = id => document.getElementById(id);
  const K = window.PlusKit, KEY = "liita-mystery";
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  window.MYSTERY = {
    title: "Midnight at the Marigold",
    when: "New Year's Eve, 1928 · The Marigold Hotel, Chicago",
    setup: "It's New Year's Eve, 1928. The Marigold is the best-kept secret in Chicago: a respectable hotel downstairs, a speakeasy on the roof, and tonight the roof is packed. At midnight the band played, the champagne poured, and the whole city counted down. At ten past twelve, Edith Lane found her husband Victor, the man who owns the Marigold, dead at his desk with a champagne glass by his hand. The snow has shut the roads and the police won't make it until dawn. Until then, it's up to the two of you. The trouble is, you were both in the building tonight, and you both have something to hide.",
    victim: "Victor Lane, owner of the Marigold. Charming, generous with drinks, ruthless about money. He had one tradition everybody knew about: at midnight every New Year's he slipped away to his office alone and drank one glass of champagne from a crystal coupe that belonged to his late brother, Thomas. Then he'd come back out at a quarter past and dance until three.",
    suspects: [
      ["Edith Lane", "Victor's wife", "Married twelve years. At 10:30 she threw a glass of gin in Victor's face by the coat check. She inherits the Marigold."],
      ["Felix Dunn", "Victor's business partner", "Soft-spoken, always polishing his spectacles. He owns a third of the Marigold and keeps the books."],
      ["Rosa Quinn", "The bartender", "Runs the roof bar and every bottle in it. Every New Year's, she's the one who carries Victor's champagne to his office."]
    ],
    rounds: [
      ["Who are you?", "Read your introduction out loud, in character. Then take turns reading your round 1 clue."],
      ["Secrets", "Take turns reading your round 2 clues. Then confess your secret before the other detective digs it up."],
      ["The last pieces", "Read your final clues. Then lay out the night hour by hour, together, and see who had the chance."]
    ],
    roles: {
      a: {
        name: "Jules Romano", title: "The singer",
        look: "Anything that sparkles. A feather in your hair or a bow tie, red lipstick or a pencil mustache.",
        intro: "I'm Jules Romano, the voice of the Marigold. Five nights a week for three years, I've sung on that stage, and people come from all over the city to hear me. Victor gave me my start, I'll give him that. Tonight I sang “Auld Lang Syne” at midnight with the whole roof singing along. I'll miss him. I think.",
        night: [["10:00", "Your first set."], ["11:15", "You went to Victor's office. (See your secret.)"], ["11:30", "Alone in your dressing room, fixing your hair."], ["11:50", "Back on stage for midnight."], ["12:00", "Singing at midnight. Everyone saw you."]],
        secret: "At 11:15 you went to Victor's office, and he told you he was replacing you in the spring with a younger singer from New York. You shouted that he'd regret it, and a waiter heard you slam the door. Then you were alone in your dressing room from 11:30 to 11:50. Nobody can say where you really were.",
        clues: [
          ["At 10:30 you saw Edith Lane throw a glass of gin in Victor's face at the coat check. She hissed, “You'll pay for her, Victor.” Then she walked off toward the stage."],
          ["When you stormed out of Victor's office at 11:15, his cigar box was open on the desk and full to the brim. He'd had it filled for the party that afternoon.",
           "After the body was found you went to get your coat. Stuffed in the pocket of the coat next to yours was a man's handkerchief. It smelled faintly of bitter almonds. The coat's tag read “F.D.”"],
          ["A doctor among the guests examined Victor. You heard him tell Edith: “It's cyanide. It was in the glass. Whatever's left in the bottle is clean.”",
           "Rosa told you that when she carried the champagne into the office at 11:45, Thomas's crystal coupe was already out of the cabinet, sitting on the desk, polished. “Strange,” she said. “Victor never takes it out until midnight. That's the whole point.”"]
        ]
      },
      b: {
        name: "Morgan Hale", title: "The bandleader",
        look: "Suspenders or a long string of pearls, a hat tipped low, and a candy cigarette.",
        intro: "I'm Morgan Hale. I lead the Marigold band and play the piano. Six years I've played for Victor, longer than anyone, so I know every inch of this building and every secret that walks through it. Tonight I played till my fingers hurt. And Victor owed me three weeks' pay, if anyone's asking.",
        night: [["10:00", "At the piano."], ["11:00", "On your break. You went down to the cellar."], ["11:30", "Walking back up past Victor's office."], ["11:40", "Back at the piano. Edith joined the band to sing backup for midnight."], ["12:00", "Playing at midnight."]],
        secret: "This afternoon you bought a tin of rat poison at the drugstore on Clark Street, and the clerk wrote your name in the poison register. It's in your coat pocket right now. The cook asked you to buy it because the cellar has rats, and that's the truth. But with Victor dead of poison, and you owed three weeks' pay, who's going to believe it?",
        clues: [
          ["At 11:30, on your way up from the cellar, you saw Felix Dunn step out of Victor's office, wiping his hands on a handkerchief. He jumped when he saw you. “Just fetching one of Victor's cigars,” he said, and hurried off. You didn't see him smoking anything."],
          ["From 11:40 until well after midnight, Edith Lane stood on the bandstand singing backup, right beside your piano. She never left once.",
           "There are only two keys to the glass cabinet in Victor's office where he keeps Thomas's crystal coupe. Victor wears one on his watch chain, and it was still there when he was found. Felix Dunn has the other, on the ring with the ledger keys."],
          ["Your tin of rat poison is still in your coat pocket with the paper seal unbroken. Hold it up to the camera for the other detective.",
           "In Victor's desk drawer you found a letter to his lawyer, sealed but not yet sent: “Felix has been stealing from the Marigold for two years. I have the proof. After the New Year, I go to the police.”"]
        ]
      }
    },
    ask: {
      who: ["Edith Lane", "Felix Dunn", "Rosa Quinn", "Jules Romano", "Morgan Hale"],
      how: ["Poison in the champagne bottle", "Poison on the crystal glass", "Poison in his cigar", "Rat poison in his drink"],
      why: ["To keep from losing a job", "Jealousy over another woman", "To inherit the Marigold", "To keep a theft from the police"],
      answer: ["Felix Dunn", "Poison on the crystal glass", "To keep a theft from the police"]
    },
    solution: [
      "Felix Dunn killed Victor Lane.",
      "Felix had been stealing from the Marigold for two years, and Victor had found out. The letter in Victor's drawer said he'd go to the police after the New Year. Felix knew about Victor's midnight tradition, like everyone did, and he had the only other key to the cabinet.",
      "At 11:30, while the party roared upstairs, Felix let himself into the office, unlocked the cabinet with his ledger key, and wiped cyanide around the inside of Thomas's crystal coupe. He set it on the desk and left. Morgan saw him come out wiping his hands, and his story about fetching a cigar was a lie: Jules saw the box full at 11:15, and it was still full. On his way out he shoved the handkerchief into his coat pocket at the coat check.",
      "At 11:45 Rosa set the bottle down next to the glass, already out and waiting. At midnight Victor poured his champagne, raised a toast to his brother, and drank. The bottle was clean, which is why Rosa is innocent. The poison was on the glass.",
      "The rest were red herrings. Edith was furious about the singer from New York Victor was courting, but she never left the bandstand after 11:40 and had no key. Jules had a motive and no alibi, but Victor was alive and well after their fight, and Jules had no key either. Morgan's rat poison was never opened."
    ]
  };

  const M = window.MYSTERY;

  window.setupMystery = function () {
    $("mystery").hidden = false;
    addEventListener("hashchange", () => location.reload());
    const role = (location.hash.match(/^#role=([ab])$/) || [])[1];
    $("myTitle").textContent = M.title;
    $("myWhen").textContent = M.when;
    if (!role) return choose();
    play(role);
    $("mystery").scrollIntoView({ block: "start" });
  };

  // Silhouettes for the dossiers: a feather for the singer, a fedora for the bandleader.
  const FACE = {
    a: '<svg viewBox="0 0 80 100" aria-hidden="true"><path d="M8 100c0-22 14-36 32-36s32 14 32 36z"/><circle cx="40" cy="38" r="16"/><path d="M50 24c6-12 14-18 22-19-5 5-9 12-16 22z"/><path d="M24 34c0-12 7-18 16-18s16 6 16 18c-4-6-10-8-16-8s-12 2-16 8z"/></svg>',
    b: '<svg viewBox="0 0 80 100" aria-hidden="true"><path d="M8 100c0-22 14-36 32-36s32 14 32 36z"/><circle cx="40" cy="40" r="16"/><path d="M16 29h48v4H16z"/><path d="M27 14h26l3 16H24z"/></svg>'
  };
  const initials = n => n.split(" ").map(w => w[0]).join("").slice(0, 2);

  // ---- picking characters ----
  function choose() {
    $("myChoose").hidden = false;
    $("mySetupText").textContent = M.setup;
    const box = $("myRoles"); box.innerHTML = "";
    ["a", "b"].forEach(r => {
      const p = M.roles[r], other = r === "a" ? "b" : "a";
      const card = document.createElement("div"); card.className = "myrole";
      card.innerHTML = '<span class="mytab">Case file · ' + esc(p.title) + '</span><span class="mystamp">Confidential</span><div class="myface">' + FACE[r] + '</div><div class="myroletext"><p class="pplabel">' + esc(p.title) + "</p><h4>" + esc(p.name) + '</h4><p class="mylook">' + esc(p.look) + '</p></div><div class="myroleacts"><a class="btn red" href="#role=' + r + '">Play ' + esc(p.name.split(" ")[0]) + '</a><button class="linkbtn" type="button" data-other="' + other + '">Send them ' + esc(M.roles[other].name.split(" ")[0]) + "'s link</button></div>";
      box.appendChild(card);
    });
    box.onclick = async e => {
      const o = e.target.dataset.other; if (!o) return;
      const url = location.origin + location.pathname + "?d=murder-mystery#role=" + o, who = M.roles[o].name;
      if (!await K.share(M.title, "Murder mystery tonight. You're " + who + ". Open this, but don't show me your clues.", url, e.target, "Link copied")) { $("myLink").value = url; $("myLink").hidden = false; $("myLink").select(); }
    };
  }

  // ---- playing ----
  function play(r) {
    const p = M.roles[r], all = K.load(KEY, {}), st = all[r] || { round: 0 };
    const save = () => { all[r] = st; K.store(KEY, all); };
    $("myPlay").hidden = false;
    $("myWho").textContent = p.name;
    $("myFace").innerHTML = FACE[r];
    $("myRole").textContent = p.title;
    $("myLook").textContent = p.look;
    $("myIntro").textContent = p.intro;
    $("mySetup2").textContent = M.setup;
    $("myVictim").textContent = M.victim;
    $("myNight").innerHTML = p.night.map(([t, x]) => "<li><b>" + esc(t) + "</b><span>" + esc(x) + "</span></li>").join("");
    $("mySecret").textContent = p.secret;
    $("mySuspects").innerHTML = M.suspects.map(([n, t, d], i) => '<li><i class="mymug" aria-hidden="true">' + esc(initials(n)) + '</i><em aria-hidden="true">No. ' + (1929 + i * 7) + "</em><b>" + esc(n) + "</b><small>" + esc(t) + "</small><span>" + esc(d) + "</span></li>").join("") +
      ["a", "b"].filter(x => x !== r).map(x => '<li class="you"><i class="mymug" aria-hidden="true">' + FACE[x] + '</i><em aria-hidden="true">Your partner</em><b>' + esc(M.roles[x].name) + "</b><small>" + esc(M.roles[x].title) + "</small><span>They'll tell you about themselves in round 1.</span></li>").join("");

    function rounds() {
      const box = $("myRounds"); box.innerHTML = "";
      M.rounds.forEach(([name, how], i) => {
        const open = i < st.round, next = i === st.round;
        const el = document.createElement("div");
        el.className = "myround" + (open ? " open" : next ? " next" : " shut");
        el.innerHTML = '<div class="myroundhead"><span class="pplabel">Round ' + (i + 1) + "</span><h4>" + esc(name) + "</h4></div>" +
          (open ? '<p class="myhow">' + esc(how) + "</p>" + p.clues[i].map((c, k) => '<div class="myclue"><small>Evidence · clue ' + (i + 1) + String.fromCharCode(65 + k) + " · read it out loud</small><p>" + esc(c) + "</p></div>").join("") + (i === 1 ? '<p class="mynote">And now, your secret. It\'s in your file above.</p>' : "")
            : next ? '<button class="btn red" type="button" data-start="' + i + '">Start round ' + (i + 1) + '</button><p class="myhow">Start it together, at the same time.</p>'
            : '<p class="myhow">Locked until you finish round ' + i + ".</p>");
        box.appendChild(el);
      });
      $("myAccuse").hidden = st.round < M.rounds.length;
      $("mySecretBox").classList.toggle("due", st.round >= 2);
    }
    $("myRounds").onclick = e => {
      const i = e.target.dataset.start; if (i === undefined) return;
      st.round = +i + 1; save(); rounds();
      const el = $("myRounds").children[i]; el.scrollIntoView({ behavior: K.motion(), block: "start" });
    };
    rounds();

    const sel = (id, opts) => { $(id).innerHTML = '<option value="" selected disabled>Choose…</option>' + opts.map(o => "<option>" + esc(o) + "</option>").join(""); };
    sel("myAccWho", M.ask.who); sel("myAccHow", M.ask.how); sel("myAccWhy", M.ask.why);
    $("myAccuseBtn").onclick = () => {
      const got = ["myAccWho", "myAccHow", "myAccWhy"].map(id => $(id).value);
      if (got.some(v => !v)) { $("myAccErr").hidden = false; return; }
      $("myAccErr").hidden = true;
      const right = got.map((v, i) => v === M.ask.answer[i]), n = right.filter(Boolean).length;
      $("myVerdict").textContent = n === 3 ? "Case closed. You got it, every part of it." : right[0] ? "Right killer. " + (3 - n === 1 ? "One detail was off." : "But the how and why were off.") : "Wrong person. The real killer just walked out into the snow.";
      $("myScore").innerHTML = ["Who", "How", "Why"].map((w, i) => '<li class="' + (right[i] ? "ok" : "no") + '"><b>' + w + "</b><span>" + (right[i] ? "✓ " : "✗ ") + esc(M.ask.answer[i]) + "</span></li>").join("");
      $("mySolution").innerHTML = M.solution.map(t => "<p>" + esc(t) + "</p>").join("");
      $("myReveal").hidden = false;
      $("myReveal").scrollIntoView({ behavior: K.motion(), block: "start" });
    };
    $("myReset").onclick = () => { delete all[r]; K.store(KEY, all); location.reload(); };
  }
})();
