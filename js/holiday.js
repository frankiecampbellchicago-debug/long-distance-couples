// Holiday packs (Plus): Valentine's Day, birthdays, anniversaries and the holidays, apart.
// Each pack: what to do before (with real mail-by dates), what goes in the box, and the night hour by hour.
// Checkmarks, dates and call times are saved on this device.
(function () {
  const $ = id => document.getElementById(id);
  const K = window.PlusKit, KEY = "liita-holiday";
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  const next = (m, d) => { const n = new Date(), t = new Date(n.getFullYear(), m - 1, d); if (t < new Date(n.getFullYear(), n.getMonth(), n.getDate())) t.setFullYear(t.getFullYear() + 1); return t; };
  const ymd = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

  // before: [days ahead, task]; night: [minutes after the call starts, what, link?]
  window.HOLIDAY_PACKS = [
    { id: "valentines", name: "Valentine's Day", date: () => next(2, 14), ask: "Valentine's Day",
      intro: "The one day the distance feels loudest. Make it the night you both get dressed up for.",
      before: [[14, "Order or make your gift. Pick something they can open on camera."],
        [10, "Mail the box and write “Open on February 14” on it. Going abroad? Mail it three weeks ahead."],
        [7, "Put a three-hour call on both calendars, in both time zones."],
        [3, "Choose dinner: the same takeout in both cities, or one recipe you'll both cook."],
        [1, "Pick your outfits. You're dressing up, even if it's only from the waist up."]],
      box: ["A handwritten letter (the main event, so take your time)", "Something that smells like you: a shirt you've worn, or your perfume or cologne on a card", "Their favorite candy, plus one from where you live", "A candle, to light at the same moment", "A printed photo of the two of you", "A coupon for the next visit"],
      night: [[0, "Dressed up, candles lit. Say hello like it's a first date."], [10, "Open the boxes on camera. Save the letters for last."], [40, "Dinner together, same food on both screens."],
        [90, "Three questions: When did you know? What's your favorite memory of us? What are you looking forward to most?"], [120, "Movie night, pressing play at the same time.", "date.html?d=movie-night"], [240, "Slow dance. Same song, phones propped up. Yes, really."]] },
    { id: "birthday", name: "Their birthday", ask: "Their birthday",
      intro: "Being far away on their birthday is the worst. Make it the day they feel the most surrounded, from a distance.",
      before: [[21, "Message three to five of their friends and family. Ask each one for a 20-second birthday video. People are slow, so ask early."],
        [14, "Order a cake or cupcakes from a bakery near them, delivered on the day. Set the time to match your call."],
        [10, "Mail the box, marked “Don't open until your birthday”."],
        [3, "Put the videos together in one shared album or one edited video."],
        [1, "Decorate your side of the call: balloons, a banner, a party hat. Commit to it."]],
      box: ["A long card. Actually long.", "Birthday candles for the cake you're having delivered", "Two party hats: one for them, and you wear the other on camera", "A real gift and one silly one", "A list of reasons you love them, one for each year they're turning", "A coupon for a birthday dinner on the next visit"],
      night: [[0, "Sing to them. Badly, loudly, with the party hat on."], [5, "The cake arrives. Candles, a wish, and you count down."], [15, "Play the birthday videos from their friends and family."],
        [35, "Open the box together."], [55, "Their pick: a game, a movie, or just talking. It's their day."], [100, "Read your list of reasons out loud, one by one."]] },
    { id: "anniversary", name: "Your anniversary", ask: "Your anniversary",
      intro: "Another year of choosing each other from far away. That's worth a real celebration.",
      before: [[21, "Go through your phone and pull your favorite photos from every year together."],
        [14, "Put them in one place: a shared album, a slideshow, or your Our Story timeline.", "date.html?d=our-story"],
        [10, "Mail something from your first date or first visit: the same snack, a ticket, a postcard from that place."],
        [7, "Put a long call on both calendars."],
        [2, "Each write a letter to read out loud on the call."]],
      box: ["Your letter, sealed", "Something from your first date: the same snack, drink or candy", "A printed photo from each year together", "A small gift for the year. Paper for the first, cotton for the second, leather for the third.", "A candle"],
      night: [[0, "Recreate your first date as best you can: same food, same drink, same song."], [30, "Go through the photos year by year. Each pick a favorite and say why."], [60, "Read your letters out loud."],
        [75, "Three questions: What surprised you most this year? What do you want more of next year? When did you feel closest to me?"], [100, "Plan the next visit, and put a date on the calendar before you hang up."], [120, "Raise a glass. To next year, hopefully in the same room."]] },
    { id: "holidays", name: "Holidays apart", date: () => next(12, 25), ask: "The holiday",
      intro: "You're each with your own families, in two different places. Carve out one hour that's just yours.",
      before: [[21, "Agree on a gift budget so nobody feels weird about it."],
        [14, "Mail the gifts, labeled “Open on our call”. Going abroad? Mail it by early December, or three weeks ahead."],
        [10, "Swap one recipe from each of your family traditions."],
        [5, "Pick the holiday movie."],
        [1, "Choose a call time that works around both families. Even 45 minutes counts."]],
      box: ["The gifts, wrapped and labeled “Open on our call”", "Two matching ornaments: one for each of you", "Matching pajamas or socks", "Hot chocolate or tea for the call", "A card"],
      night: [[0, "Matching pajamas on, mugs filled."], [10, "Hang your matching ornaments, on a tree or on anything."], [20, "Open gifts one at a time, taking turns."],
        [50, "Eat or cook each other's family recipe."], [80, "Holiday movie, pressing play together.", "date.html?d=movie-night"], [200, "Before you hang up, each say one thing you're grateful for this year."]] }
  ];
  const P = window.HOLIDAY_PACKS;
  // each occasion's color and icon, for its gift tag and the whole page
  const svg = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  const LOOK = {
    valentines: ["#b0303a", svg('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>')],
    birthday: ["#2c5d8a", svg('<path d="M4 21h16v-8H4zM4 16c2 1.5 4 1.5 5.3 0 1.4 1.5 4 1.5 5.4 0 1.3 1.5 3.3 1.5 5.3 0"/><path d="M12 13V9M12 5.5c.8-.8.8-1.7 0-2.5-.8.8-.8 1.7 0 2.5z"/>')],
    anniversary: ["#9a6a1c", svg('<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="m10 5 2-2 2 2-2 2z"/>')],
    holidays: ["#3f6b47", svg('<path d="M12 3 6 11h3l-4 6h14l-4-6h3z"/><path d="M12 17v4"/>')]
  };

  window.setupHoliday = function () {
    $("holiday").hidden = false;
    const st = K.load(KEY, { pack: "valentines" });
    const save = () => K.store(KEY, st);
    $("hoTabs").innerHTML = P.map(p => '<button type="button" role="tab" data-id="' + p.id + '" style="--h:' + LOOK[p.id][0] + '"><span class="hoicon">' + LOOK[p.id][1] + "</span>" + esc(p.name) + "</button>").join("");
    $("hoTabs").onclick = e => { const b = e.target.closest("button"); if (b) { st.pack = b.dataset.id; save(); show(); } };

    function show() {
      const p = P.find(x => x.id === st.pack) || P[0], s = st[p.id] || (st[p.id] = { done: [] });
      if (!s.date && p.date) s.date = ymd(p.date());
      if (!s.time) s.time = "19:00";
      [...$("hoTabs").children].forEach(b => b.setAttribute("aria-selected", b.dataset.id === p.id));
      $("holiday").style.setProperty("--h", LOOK[p.id][0]);
      $("hoBadgeIcon").innerHTML = LOOK[p.id][1];
      $("hoIntro").textContent = p.intro;
      $("hoDateLabel").textContent = p.ask;
      $("hoDate").value = s.date || ""; $("hoTime").value = s.time;
      const day = s.date ? new Date(s.date + "T00:00") : null;
      const on = id => s.done.includes(id) ? " checked" : "";
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const item = (id, html) => '<li><label><input type="checkbox" data-id="' + id + '"' + on(id) + "><span>" + html + "</span></label></li>";

      $("hoBefore").innerHTML = p.before.map(([n, t, link], i) => {
        let when = n + " days before";
        if (day) { const d = new Date(day); d.setDate(d.getDate() - n); when = "By " + d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + (d < today && !s.done.includes("b" + i) ? " · late, do it today" : ""); }
        return item("b" + i, "<small>" + esc(when) + "</small>" + esc(t) + (link ? ' <a href="' + link + '">Open it &#8594;</a>' : ""));
      }).join("");
      $("hoBox").innerHTML = p.box.map((t, i) => item("x" + i, esc(t))).join("");
      const [hh, mm] = (s.time || "19:00").split(":").map(Number);
      $("hoNight").innerHTML = p.night.map(([min, t, link]) => {
        const d = new Date(2000, 0, 1, hh, mm + min);
        return "<li><b>" + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) + "</b><span>" + esc(t) + (link ? ' <a href="' + link + '">Open it &#8594;</a>' : "") + "</span></li>";
      }).join("");
      const n = s.done.length, total = p.before.length + p.box.length;
      const left = day ? Math.max(0, Math.round((day - today) / 864e5)) : null;
      $("hoProgress").textContent = n + " of " + total + " ready";
      $("hoBar").style.width = (n / total * 100) + "%";
      $("hoDays").textContent = left === null ? "?" : left;
      $("hoDaysLabel").textContent = left === null ? "pick the date" : left === 0 ? "it's today" : left === 1 ? "day to go" : "days to go";
      $("hoNeedDate").hidden = !!day;
    }
    $("hoDate").addEventListener("change", () => { st[st.pack].date = $("hoDate").value; save(); show(); });
    $("hoTime").addEventListener("change", () => { st[st.pack].time = $("hoTime").value || "19:00"; save(); show(); });
    $("holiday").addEventListener("change", e => {
      if (e.target.type !== "checkbox") return;
      const s = st[st.pack], id = e.target.dataset.id;
      s.done = e.target.checked ? s.done.concat(id) : s.done.filter(x => x !== id);
      save(); show();
      const again = $("holiday").querySelector('input[data-id="' + id + '"]'); if (again) again.focus({ preventScroll: true });
    });
    show();
  };
})();
