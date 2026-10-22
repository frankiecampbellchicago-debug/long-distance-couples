// The articles, shared by articles.html (the list) and article.html (the reading page).
// An article with a `body` is finished and opens on its own page; one without is still being written,
// and its card opens a preview with the outline in `inside`.
window.ARTICLES = [
  {
    id: "travel", topic: "Travel", k: "apart", icon: "plane",
    title: "Making the miles work: how to travel for love without burning out",
    sum: "How often to visit, how to book and split the cost, and how to make the trips feel like life, not a vacation.",
    inside: ["Pick a visit rhythm you can actually keep", "Book smarter, and split the cost fairly", "Pack for two lives", "Don't plan every minute of the visit"],
    body: `
<p>When you love someone who lives somewhere else, travel stops being a treat and starts being part of the relationship. The flights, the bus rides, the long drives at night: that's how you get to be together. And because it happens again and again, the way you handle it matters as much as any single trip.</p>
<p>Here's what helps couples keep visiting without running out of money, vacation days, or energy.</p>

<h2>Pick a rhythm you can keep</h2>
<p>The first few months, it's tempting to visit every chance you get. That's lovely, and it's also how a lot of couples end up broke and exhausted by month six. Before you book the next trip, sit down together and pick a rhythm you can keep for a year, not just a season.</p>
<p>Ask each other three questions:</p>
<ul>
  <li><strong>How long can we go between visits before it starts to hurt?</strong> For some couples that's three weeks. For others it's three months.</li>
  <li><strong>What can we each afford?</strong> Be honest here. A rhythm one of you can't pay for will turn into resentment.</li>
  <li><strong>How much time off do we have?</strong> Count your vacation days, holidays, and long weekends for the next few months.</li>
</ul>
<p>Then choose: shorter trips more often, or longer trips less often. Neither one is better. Long weekends keep the gaps short. Longer stays let you settle in and see each other's real life. Many couples mix the two.</p>
<p>Once you have a rhythm, put the next few visits on a shared calendar. Having the next one already booked makes every goodbye easier, because you're never saying goodbye without knowing when.</p>

<h2>Take turns, or meet in the middle</h2>
<p>If one person always does the traveling, it adds up: the cost, the tiredness, the time away from friends at home. Taking turns keeps it fair. It also means you each get to show the other your world, from your favorite coffee place to the friends you keep talking about.</p>
<p>Sometimes the best answer is neither city. Meeting halfway can cut travel time for both of you and turns the visit into a small adventure. Our <a href="index.html#travel">travel planner</a> finds a fair halfway point between your two cities and shows the flights from each side.</p>

<h2>Book smarter</h2>
<ul>
  <li><strong>Watch prices before you need them.</strong> Set fare alerts on your usual route in both directions, so you notice a good price when it shows up instead of booking in a rush.</li>
  <li><strong>Be flexible with dates.</strong> Flying midweek, or leaving a day earlier, is often cheaper than the Friday-to-Sunday trip everyone else wants.</li>
  <li><strong>Check nearby airports.</strong> A slightly longer drive at either end can sometimes save more than you'd expect.</li>
  <li><strong>Pick one loyalty program and stick to it.</strong> If you fly the same route a lot, the points add up faster than you think.</li>
  <li><strong>Don't forget the ground.</strong> Trains, buses, and road trips can be cheaper and less stressful than flying, and the drive can become its own date with a shared playlist.</li>
</ul>

<h2>Split the cost in a way that feels fair</h2>
<p>Money is one of the quietest strains in a long-distance relationship, because the costs are constant and they aren't always even. Talk about it early, before anyone feels taken for granted.</p>
<p>A few ways couples handle it:</p>
<ul>
  <li><strong>The traveler pays for the trip, the host pays for the visit.</strong> Simple, and it evens out when you take turns.</li>
  <li><strong>Split by income.</strong> If one of you earns a lot more, splitting in proportion can feel fairer than going half and half.</li>
  <li><strong>A shared travel fund.</strong> You both put a set amount in every month, and trips come out of it. It turns "who's paying" into "what can we do."</li>
</ul>
<p>Whatever you choose, the point is that you chose it together. Revisit it if someone's situation changes.</p>

<h2>Pack for two lives</h2>
<p>Packing gets easier when part of you already lives at their place. Leave a toothbrush, a charger, a few clothes, maybe a pair of shoes. It saves space, and it's a small, real sign that you belong there too.</p>
<p>Keep a travel kit ready to go, with the basics always packed, so getting ready for a trip takes ten minutes, not an evening. Carry-on only, when you can manage it, means no waiting at baggage claim and more time together.</p>

<h2>Don't plan every minute</h2>
<p>When you only see each other a few times a year, every visit can start to feel like it has to be perfect. So you plan the big dinner, the day trip, the show, the brunch, and come home more tired than when you left.</p>
<p>Try this instead: one special thing per visit, and the rest ordinary. Grocery shopping. Cooking together. Falling asleep on the couch during a movie. Those ordinary moments are what you miss most when you're apart, and they're a preview of the life you're building.</p>
<p>It's also normal if the first day feels a little strange. You've been talking through a screen for weeks, and it can take a few hours to fall back into the rhythm of being in the same room. Don't read too much into it. It passes.</p>

<h2>Look after yourself on the way</h2>
<p>Regular travel is tiring in ways that sneak up on you. If you can, give yourself a quiet evening when you get home instead of going straight back to a full schedule. If you're crossing time zones, try to get some daylight soon after you land. And plan your vacation days a few months ahead, so you aren't spending them all in the first half of the year.</p>

<h2>The trip is the relationship</h2>
<p>It's easy to think of visits as a break from the long-distance part. But the way you plan together, share the cost, and take care of each other on the road is the relationship, practiced in real life. Couples who get good at it are building the same skills they'll need when the distance finally closes.</p>
<p>Keep the trips sustainable, keep the next one on the calendar, and leave room for the boring parts. Those are usually the best ones.</p>
`
  },
  {
    id: "trust", topic: "Trust", k: "table", icon: "key",
    title: "Trust across the miles: how to build it, keep it, and repair it",
    sum: "What trust looks like when you can't see each other's day, and what to do when it gets shaky.",
    inside: ["Why distance makes trust feel harder", "Small habits that build it every week", "Telling worry apart from a real red flag", "Repairing trust after it breaks"]
  },
  {
    id: "love-languages", topic: "Love languages", k: "together", icon: "heart",
    title: "Love languages from far away: how to show up in the way they feel it",
    sum: "Words, gifts, time, help, and touch, and how to speak each one when you're not in the same place.",
    inside: ["A quick refresher on the five love languages", "Finding out which ones you each speak", "Ideas for every language, from a distance", "What to do when your languages don't match"]
  },
  {
    id: "feeling-alone", topic: "Feeling alone", k: "apart", icon: "moon",
    title: "When the distance gets heavy: pressure, loneliness, and what helps",
    sum: "Feeling alone in a relationship is real. Here's how to name it, share it, and get through the hard weeks.",
    inside: ["Why loneliness shows up even when you're in love", "The pressure to make every call and visit count", "How to tell your partner without blaming them", "Building a life where you are, too"]
  },
  {
    id: "communication", topic: "Communication", k: "together", icon: "phone",
    title: "Talking across the distance: communication that brings you closer",
    sum: "How to move past daily updates, handle disagreements over text, and stay in sync across time zones.",
    inside: ["Getting past the daily status report", "Why hard talks belong on calls, not texts", "Making time zones work for you", "Checking in on the relationship itself"]
  },
  {
    id: "online-dates", topic: "Date nights", k: "arcade", icon: "popcorn",
    title: "Why online dates work, and how to make them feel real",
    sum: "Doing something together, not just talking, is what makes a long-distance date feel like a date.",
    inside: ["Why doing beats talking", "Setting the scene on both ends", "Dates to try this week", "Making it a habit, not a chore"]
  },
  {
    id: "airport-goodbye", topic: "Travel", k: "apart", icon: "hourglass",
    title: "Surviving the airport goodbye",
    sum: "How to make the last day of a visit hurt a little less, and what to do once you're home.",
    inside: ["Planning a gentle last day", "Booking the next visit before this one ends", "The goodbye itself", "The first night home alone"]
  }
];

// reading time from the body, or a fair guess for an article still being written
window.ARTICLES.forEach(a => {
  a.min = a.body ? Math.max(3, Math.round(a.body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 220)) : 6;
});
