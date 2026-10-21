// Every date idea, shared by the home page carousel and the date.html "View more" page.
window.DATES=[
 {s:"arcade-night",k:"arcade",where:"Virtual date · In the app",i:"arcade",t:"Arcade Night",d:"Walk into a shared arcade, pick a cabinet, and play two-player co-op games in real time. Win tickets as a team and trade them in for prizes you send to each other.",f:["In the app","30–60 min","Co-op games","Shared ticket jar"],tags:["app","fun","adventurous"]},
 {s:"table-for-two",k:"table",where:"Virtual date · In the app",i:"cloche",t:"Table for Two",d:"Sit down at a virtual restaurant with an AI waiter who takes your orders, tells stories, and walks you both through cooking the same recipe in your own kitchens.",f:["In the app","1 hr","AI waiter","Cook-along recipes"],tags:["app","cozy"]},
 {s:"movie-night",k:"apart",i:"popcorn",t:"Movie night, in sync",d:"Count down and press play on the same movie at the same second. Keep a call open for the commentary.",f:["Free","2–3 hrs"],tags:["free","cozy"]},
 {s:"order-dinner",k:"apart",i:"takeout",t:"Order each other dinner",d:"Each of you picks a meal and has it delivered to the other's door. Eat together on video.",f:["$$","1 hr"],tags:["cozy"]},
 {s:"stargazing",k:"apart",i:"moon",t:"Stargazing call",d:"Go outside on the same night, open a star map app, and try to find the same constellation.",f:["Free","1 hr"],tags:["free","cozy"]},
 {s:"first-date",k:"together",i:"heart",t:"Recreate your first date",d:"Same place, same order, same outfits if you can. Talk about what you were thinking back then.",f:["$$","An evening"],tags:["cozy"]},
 {s:"story-playlist",k:"apart",i:"music",t:"Our story playlist",d:"Take turns adding songs that tell the story of your relationship, then listen start to finish together.",f:["Free","1 hr"],tags:["free"]},
 {s:"museum-trip",k:"apart",i:"museum",t:"Virtual museum trip",d:"Pick a museum with a free online tour, like the Louvre or the Smithsonian, and explore it side by side.",f:["Free","1–2 hrs"],tags:["free"]},
 {s:"tourist-in-my-city",k:"together",i:"map",t:"Tourist in my city",d:"Each of you plans one day showing the other your favorite spots, the places you've always wanted to show them.",f:["$$","1 day"],tags:[]},
 {s:"letters",k:"apart",i:"letter",t:"Letters on the same night",d:"Mail each other a handwritten letter, then open them together on a call.",f:["$","1 week"],tags:["cozy"]},
 {s:"book-club",k:"apart",i:"book",t:"Two-person book club",d:"Read the same book, one chapter a week, and talk it through every Sunday.",f:["$","Ongoing"],tags:["cozy"]},
 {s:"meet-somewhere-new",k:"together",i:"plane",t:"Meet somewhere new",d:"Split the trip and meet in a city neither of you has been to. Use Travel to find one between you.",f:["$$$","Weekend"],tags:["adventurous"]},
 {s:"cook-off",k:"apart",i:"pan",t:"Same-box cook-off",d:"Buy the same five ingredients and see who makes the better dinner. Vote on looks and taste.",f:["$$","1–2 hrs"],tags:[]},
 {s:"escape-room",k:"apart",i:"key",t:"Online escape room",d:"Book a two-player virtual escape room and solve it as a team on video.",f:["$$","1 hr"],tags:["adventurous"]},
 {s:"time-capsule",k:"together",i:"hourglass",t:"Build a time capsule",d:"Fill a box with notes, photos, and ticket stubs from this visit. Open it at the next one.",f:["Free","1 hr"],tags:["free","cozy"]},
 {s:"walk-along",k:"apart",i:"phone",t:"Neighborhood walk-along",d:"Take them on a video walk through your neighborhood. Show them your coffee shop, your shortcut, your view.",f:["Free","45 min"],tags:["free"]},
 {s:"take-a-class",k:"together",i:"vase",t:"Take a class together",d:"Pottery, salsa, or a cooking class. You leave with a new skill and a story.",f:["$$","2–3 hrs"],tags:["adventurous"]},
 {s:"plus",k:"plus",where:"Love Is In The Air Plus",i:"sparkle",t:"200+ more date ideas",d:"Holiday dates, anniversary plans, and new ideas every month, plus unlimited virtual dates.",f:["Plus"],tags:["all-only"]}
];
window.DATE_WHERE={apart:"While apart",together:"When you visit"};
window.DATE_ICONS={
 arcade:'<rect x="3" y="15" width="18" height="6" rx="2"/><path d="M12 15V9"/><circle cx="12" cy="6.5" r="2.8"/><circle cx="17.5" cy="18" r=".9"/>',
 cloche:'<path d="M4 18a8 8 0 0 1 16 0Z"/><path d="M3 20.5h18"/><path d="M12 10V8.5"/><circle cx="12" cy="7.5" r="1"/>',
 popcorn:'<path d="M6 10.5 7.6 21h8.8L18 10.5Z"/><path d="M10.4 10.5 10.8 21M13.6 10.5 13.2 21"/><circle cx="8.2" cy="8.4" r="2.2"/><circle cx="12" cy="6.6" r="2.5"/><circle cx="15.8" cy="8.4" r="2.2"/>',
 takeout:'<path d="M5 9.5h14l-1.6 11H6.6Z"/><path d="m5 9.5 2-4.5h10l2 4.5"/><path d="M9.5 5c0-2.2 5-2.2 5 0"/>',
 moon:'<path d="M15.5 4.5a7.5 7.5 0 1 0 4.5 11.8A8.2 8.2 0 0 1 15.5 4.5Z"/><path d="M6 3v3.5M4.25 4.75h3.5M19.5 3v2M18.5 4h2"/>',
 heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z"/><path d="M19.5 2.5v3M18 4h3"/>',
 music:'<path d="M9 18V6.5l10-2.2V16"/><path d="m9 9.5 10-2.2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>',
 museum:'<path d="M3 9.5 12 4l9 5.5Z"/><path d="M5.5 11v7M9.8 11v7M14.2 11v7M18.5 11v7"/><path d="M3.5 20.5h17"/>',
 map:'<path d="m3 6.5 6-2.2 6 2.2 6-2.2v13.4l-6 2.2-6-2.2-6 2.2Z"/><path d="M9 4.3v13.4M15 6.5v13.4"/>',
 letter:'<rect x="3" y="5.5" width="18" height="13.5" rx="1.6"/><path d="m3.5 6.5 8.5 6.3 8.5-6.3"/>',
 book:'<path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5Z"/><path d="M12 6.5v13"/>',
 plane:'<path d="M21.5 3.5 2.5 11l7 2.5 2.5 7Z"/><path d="m9.5 13.5 12-10"/>',
 pan:'<circle cx="9.5" cy="14" r="6"/><path d="M15.5 14H22"/><path d="M7.5 3.5c-1 1.1 1 2.2 0 3.3M11.5 3.5c-1 1.1 1 2.2 0 3.3"/>',
 key:'<circle cx="8" cy="15" r="4.2"/><path d="m11 12 9-9M16.5 6.5l2.2 2.2M14.3 8.7l2 2"/>',
 hourglass:'<path d="M6 3h12M6 21h12"/><path d="M7.5 3c0 4.5 4.5 5.5 4.5 9s-4.5 4.5-4.5 9M16.5 3c0 4.5-4.5 5.5-4.5 9s4.5 4.5 4.5 9"/>',
 phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/><path d="M12 7.2a2.2 2.2 0 0 1 2.2 2.2c0 1.8-2.2 3.6-2.2 3.6s-2.2-1.8-2.2-3.6A2.2 2.2 0 0 1 12 7.2Z"/>',
 vase:'<path d="M9 3h6"/><path d="M10 3c0 2.5-4 4-4 9 0 5 3 8.5 6 8.5s6-3.5 6-8.5c0-5-4-6.5-4-9"/><path d="M7 12.5h10"/>',
 sparkle:'<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z"/><path d="M19 15.5v4M17 17.5h4"/>'
};
window.DATE_WASH={apart:"#9fb4c8",together:"#d6a093",arcade:"#c98b84",table:"#d9b479",plus:"#a9b896"};
window.dateIcon=(k,cls,kind)=>'<span class="stamp '+cls+'" aria-hidden="true"><span class="face"><svg viewBox="0 0 24 24">'+
  '<circle cx="12.6" cy="12.9" r="8.6" fill="'+(DATE_WASH[kind]||DATE_WASH.apart)+'" opacity=".75" filter="url(#wash)"/>'+
  '<g fill="none" stroke="#4a3527" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" filter="url(#inked)">'+(DATE_ICONS[k]||"")+'</g></svg></span></span>';

// Extra detail for each date's own page: how to do it, what you need, one tip.
// app:true dates live inside the app (coming soon). tool names a widget on the page.
window.DATE_MORE={
 "arcade-night":{app:true,
  steps:["Open Love Is In The Air together and step into the arcade lobby.","Pick a two-player cabinet. Every game is co-op, so you win or lose as a team.","Collect tickets from each round in your shared ticket jar.","Trade the jar for a prize, from a silly sticker to a real gift mailed to their door."],
  need:["The app on a phone, tablet, or computer","A video or voice call","About an hour"],
  tip:"Set a ticket goal at the start. Hitting it together feels better than any single high score."},
 "table-for-two":{app:true,
  steps:["Choose a recipe together from the menu before the date.","Each of you shops for the same ingredients.","Sit down at your virtual table. The AI waiter greets you, takes your orders, and keeps the conversation going.","Cook side by side as the waiter walks you through each step, then eat together."],
  need:["The app","Ingredients for the recipe you picked","A kitchen and a phone stand"],
  tip:"Dress up a little and light a candle. It turns a cooking call into a real night out."},
 "movie-night":{
  steps:["Pick a movie you can both stream. Take turns choosing each week.","Get a call going on your phones, so your laptops are free for the movie.","Count down from three and press play at the same second.","Pause together for snack breaks and talk about it when the credits roll."],
  need:["The same streaming service, or a watch-party feature","Snacks","Headphones if the call echoes"],
  tip:"Use a watch-party feature like Teleparty or Prime Video Watch Party to keep the movie in sync automatically."},
 "order-dinner":{tool:"food",
  steps:["Ask your partner for their delivery address. Keep it a surprise if you can.","Use the search on this page to find places near them, and pick a food you know they love.","Open the restaurant in Uber Eats and send dinner to their door.","They do the same for you. Eat together on video when both meals arrive."],
  need:["Each other's addresses","A delivery app like Uber Eats","A video call"],
  tip:"Time the orders so both meals land within a few minutes of each other."},
 "stargazing":{
  steps:["Check the weather in both cities and pick a clear night.","Each of you goes outside, away from bright lights if you can.","Open a free star map app like Stellarium or SkyView.","Find the moon or a bright constellation, then talk about what you can each see."],
  need:["A clear night","A star map app","A blanket and a warm drink"],
  tip:"If you live far apart in latitude, you'll see different stars. Show each other the ones the other can't see."},
 "first-date":{
  steps:["Plan it for your next visit, and keep the details a secret if you can.","Go back to the same place, or somewhere close to it.","Order what you ordered then, and wear what you wore if you still have it.","Tell each other what you were really thinking that first night."],
  need:["A visit","Your best memory of that night"],
  tip:"Bring a photo from back then and take a new one in the same spot."},
 "story-playlist":{
  steps:["Make a shared playlist on Spotify or Apple Music.","Take turns adding songs: the one from your first trip, the one that reminds you of them, the one you both hate.","Add a short note about why you picked each song.","Listen start to finish together on a call."],
  need:["A music app with shared playlists","An hour on a call"],
  tip:"Keep adding to it after every visit. It becomes a soundtrack of your relationship."},
 "museum-trip":{
  steps:["Pick a museum with a free online tour, like the Louvre, the Smithsonian, or the British Museum.","Share a screen, or open the same tour on both devices.","Take turns choosing which room to walk into next.","Each of you picks a favorite piece and explains why."],
  need:["A laptop or tablet","A call","1–2 hours"],
  tip:"Google Arts & Culture has free tours of hundreds of museums in one place."},
 "tourist-in-my-city":{
  steps:["Before the visit, each of you plans one full day in your own city.","Include the spots you love and the ones you've always wanted to show them.","Keep the plan secret until the morning of.","Swap days on the next visit."],
  need:["A visit","A rough budget","Comfortable shoes"],
  tip:"Add a stop that means something, like where you were standing when they first called."},
 "letters":{
  steps:["Agree on a night to open them, about a week out.","Write a real letter by hand, as long or short as you like.","Mail it early. Some international mail takes two weeks.","Open your letters together on a call and read a favorite line out loud."],
  need:["Paper and a pen","Stamps","Patience"],
  tip:"Tuck something small inside, like a pressed flower or a photo."},
 "book-club":{
  steps:["Pick a book together, and alternate who chooses.","Read one chapter a week, whenever it suits you.","Meet every Sunday on a call to talk it through.","Mark a passage for each other as you read."],
  need:["Two copies of the book, or an ebook","30 minutes a week"],
  tip:"Short books keep it going. Start with something you can finish in a month."},
 "meet-somewhere-new":{
  steps:["Use Travel on the home page to find a city that's fair to both of you.","Check flights from both cities on the same dates.","Book a place to stay together and plan a few things to do.","Explore it as first-timers, together."],
  need:["A weekend","Flights or a drive","A trip board to keep plans in one place"],
  tip:"Arrive on the same day so neither of you waits alone."},
 "cook-off":{
  steps:["Agree on five ingredients you can both find.","Each of you buys them, plus pantry basics like salt, oil, and spices.","Set a timer and cook on video.","Show off your plates and vote on looks and taste."],
  need:["The same five ingredients","A kitchen","A phone stand"],
  tip:"Let a friend judge from photos to keep it fair."},
 "escape-room":{
  steps:["Book an online escape room made for two players.","Get on a video call and share the game link.","Split up the clues and talk through every lead.","Beat the clock together."],
  need:["A laptop each","A booking, usually about $20–40","A call"],
  tip:"Search for \"online escape room for 2 players\" to find live ones with a real host."},
 "time-capsule":{
  steps:["Find a small box or tin during your visit.","Fill it with notes, photos, ticket stubs, and a letter to your future selves.","Seal it and decide who keeps it until next time.","Open it together at your next visit."],
  need:["A box","Things from this visit","Paper for notes"],
  tip:"Write down one prediction each about where you'll be by the next visit."},
 "walk-along":{
  steps:["Start a video call with your back camera facing out.","Walk them through your neighborhood like they're there with you.","Show them your coffee shop, your shortcut, your favorite view.","Let them pick where to turn next."],
  need:["A phone with data","Headphones","45 minutes"],
  tip:"Grab a coffee at your spot and have them order the same thing where they are."},
 "take-a-class":{
  steps:["Pick something neither of you has done: pottery, salsa, or cooking.","Book a class for your next visit.","Show up, get messy, and laugh at each other.","Keep what you make, or try it again at home on a call."],
  need:["A visit","A booking, usually $40–100 each"],
  tip:"Book it for early in the visit, so you can practice together before you leave."},
};
