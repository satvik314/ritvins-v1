// Everything you are likely to change lives here.
window.SITE = {
  // 11 am Pacific on the wedding day. December in San Jose is UTC-8.
  weddingStart: "2026-12-17T11:00:00-08:00",
  weddingEnd: "2026-12-17T16:00:00-08:00",

  // Swap for the venue's Google Maps link once it is confirmed.
  mapUrl: "https://www.google.com/maps/search/?api=1&query=San+Jose%2C+California",

  // Leave empty to show "Please reply as soon as you can."
  replyBy: "",

  // Where replies are stored: the "ritvik-vineesha-wedding" Supabase project.
  // The publishable key is meant to be public. Row level security lets guests
  // add a reply but never read one (see supabase/rsvps.sql). VITE_SUPABASE_URL
  // and VITE_SUPABASE_ANON_KEY override these, for example to test elsewhere.
  rsvp: {
    url: import.meta.env.VITE_SUPABASE_URL || "https://zsqalbgdmrcuuviicinm.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_tx1x3byQsLZ57xgD9xFbrA_Myb73js-",
  },

  reel: [
    { src: "reel-9", caption: "Brunch, then forever.", alt: "Ritvik and Vineesha outside a cafe under pink bougainvillea" },
    { src: "reel-7", caption: "The city can wait.", alt: "Ritvik and Vineesha on a boat with a city skyline behind them" },
    { src: "reel-4", caption: "Snow and sand in one photo.", alt: "Ritvik and Vineesha on a picnic bench with snow and pine trees behind them" },
    { src: "reel-6", caption: "Arm's length is as far apart as we get.", alt: "Ritvik and Vineesha taking a selfie by an ivy wall" },
    { src: "reel-5", caption: "High above the city, still looking at the camera.", alt: "Ritvik and Vineesha at a window high above a city at night" },
    { src: "reel-8", caption: "Going up.", alt: "Ritvik and Vineesha taking a mirror selfie in an elevator" },
    { src: "reel-3", caption: "Table for two, as usual.", alt: "Ritvik and Vineesha smiling at a cafe table" },
    { src: "reel-2", caption: "Tree included at no extra charge.", alt: "Ritvik and Vineesha on a granite overlook beside a pine tree" },
    { src: "reel-1", caption: "The one where we hired a photographer.", alt: "Ritvik and Vineesha facing each other among green trees" },
  ],
};
