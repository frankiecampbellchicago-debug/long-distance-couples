// The articles, shared by articles.html (the list) and article.html (the reading page).
// An article with a `body` is finished and opens on its own page; one without is still being written,
// and its card opens a preview with the outline in `inside`.
window.ARTICLES = [
  {
    id: "travel", topic: "Travel", k: "apart", icon: "plane",
    title: "Making the miles work: how to travel for love without burning out",
    sum: "How often to visit, how to share the travel and the cost, and how to keep it going without wearing yourselves out.",
    inside: ["Figure out how often you can realistically visit", "Share the traveling", "Talk about money before it becomes an argument", "Leave some of the visit unplanned"],
    body: `
<p>When your partner lives far away, seeing each other takes planning. You’re comparing flights, checking how much time you can take off, and figuring out whether you can afford another trip this month. Sometimes you spend almost as much time getting there as you do together.</p>
<p>You want to visit as often as possible. But you also need a way to keep doing it without spending all your savings or coming home exhausted every time.</p>
<p>Here are a few things worth working out together.</p>

<h2>Figure out how often you can realistically visit</h2>
<p>Early on, you might be happy to spend every spare weekend traveling. After a while, though, the late arrivals, Sunday goodbyes, and Monday mornings at work can catch up with you.</p>
<p>Talk about what actually works for both of you:</p>
<ul>
  <li>How long are you comfortable going between visits?</li>
  <li>How much can you each spend without putting yourselves under pressure?</li>
  <li>How much time off do you have, and how much do you want to save for other things?</li>
</ul>
<p>You might prefer a weekend together every few weeks, or a longer stay every couple of months. Your schedules might mean doing a bit of both.</p>
<p>Try not to commit to a schedule just because you think you should be seeing each other more. Start with what you can manage and adjust as you go.</p>
<p>If possible, put a few visits on the calendar ahead of time. You don’t have to book everything immediately, but it helps to have a date to look forward to when you’re saying goodbye.</p>

<h2>Share the traveling</h2>
<p>It’s easy to fall into a routine where one person always makes the trip, especially if their job is more flexible or the tickets are cheaper in one direction.</p>
<p>That can work, as long as you’re both happy with it. Just don’t assume the person doing the traveling is fine with it because they haven’t complained. They’re also spending time packing, getting to stations or airports, and being away from their own home.</p>
<p>Taking turns gives you both a chance to spend time in each other’s everyday lives, too. You get to know their friends, their neighborhood, and the place they’re always talking about getting breakfast.</p>
<p>Meeting somewhere else is another option. Our <a href="index.html#travel">travel planner</a> can help you look for a halfway point and compare flights from both cities.</p>

<h2>Make booking less of a last-minute scramble</h2>
<p>If you regularly travel the same route, set up fare alerts so you don’t have to start searching from scratch for every visit.</p>
<p>When your schedules allow it, compare a few different dates rather than sticking to Friday evening through Sunday night. Check nearby airports too, but include the extra transport costs and travel time before deciding a cheaper flight is worth it.</p>
<p>It’s also worth comparing the whole journey. A flight might look quicker until you add the trip to the airport, security, and the wait before boarding. Depending on where you live, a train, bus, or drive may be a better fit.</p>
<p>And if you use the same airline regularly, look into its loyalty program. Just don’t pay more for a ticket solely to collect points.</p>

<h2>Talk about money before it becomes an argument</h2>
<p>Travel costs can be awkward to bring up, particularly when one of you earns more or has more bills to cover. But avoiding the conversation can leave someone spending money they don’t really have because they don’t want to disappoint the other person.</p>
<p>There isn’t one right way to split things. You could:</p>
<ul>
  <li>Each pay for your own travel, with the person hosting covering more of the food and activities.</li>
  <li>Share the total cost of each visit.</li>
  <li>Contribute different amounts based on what you can afford.</li>
  <li>Put money into a shared travel fund each month.</li>
</ul>
<p>Be specific about what works for you. “We’ll figure it out” is fine until a ticket needs booking and neither person knows who’s paying.</p>
<p>If someone’s circumstances change, talk about it again. An arrangement that worked six months ago might not work now.</p>

<h2>Leave a few things at each other’s places</h2>
<p>If you visit regularly and have the space, keeping a few basics there saves you packing the same things every time.</p>
<p>A toothbrush, charger, toiletries, and some spare clothes can be enough. Ask first rather than gradually taking over a drawer, but it doesn’t need to be a big relationship milestone.</p>
<p>Keeping your travel essentials together at home helps too, especially when you’re leaving straight after work.</p>

<h2>Leave some of the visit unplanned</h2>
<p>When you’ve waited weeks to see each other, it’s tempting to fill the whole visit. You want to go out, do something memorable, and make the most of the time.</p>
<p>But you might also arrive tired. One of you may still have work to finish. Sometimes you’ll both just want dinner and an early night.</p>
<p>Pick something you’re excited to do, then leave room to decide the rest when you’re together. Staying in doesn’t mean you’ve wasted the trip. You’re allowed to spend an afternoon doing very little.</p>
<p>And if the first few hours feel slightly awkward, try not to turn that into a verdict on the relationship. Give yourselves a little time to settle in rather than expecting the reunion to feel perfect immediately.</p>

<h2>Think about the journey home, too</h2>
<p>A late return might give you a few extra hours together, but consider what the following day will look like. Sometimes it’s worth getting home earlier so you can eat, unpack, and sleep before work.</p>
<p>Keep an eye on your time off as well. Before booking another visit, check what you’ll have left for holidays, family plans, or a break that doesn’t involve traveling.</p>
<p>You can want to see your partner and still need a weekend at home. If the current schedule is wearing you out, say so. That’s something you can work on together—not something you need to prove you can put up with.</p>

<h2>Find an arrangement you both want to keep doing</h2>
<p>Some visits will be wonderful. Others will involve delays, bad sleep, or an argument about where to eat. You don’t have to make every trip worth it by having an amazing time from start to finish.</p>
<p>What matters is whether you can afford the visits, share the effort, and enjoy being together without putting too much pressure on the time you have. If something isn’t working, change the plan rather than waiting until one of you dreads the next journey.</p>
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
