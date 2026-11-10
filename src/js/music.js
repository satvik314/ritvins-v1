// The uploaded MP3 is the only audio on the invitation.
// Try autoplay on load. Browsers that block it will start on the first guest interaction.
(function () {
  const audio = new Audio("/assets/music.mp3");
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.55;

  let enabled = window.Sound ? window.Sound.enabled : true;
  let unavailable = false;

  audio.addEventListener("error", () => { unavailable = true; });

  function start() {
    if (!enabled || unavailable || document.hidden) return;
    // Reattempt in a user gesture if the browser rejected autoplay earlier.
    const pending = audio.play();
    if (pending && typeof pending.catch === "function") {
      pending.catch(() => {});
    }
  }

  function setEnabled(next) {
    enabled = Boolean(next);
    if (enabled) start();
    else audio.pause();
  }

  // Start immediately when the browser permits autoplay.
  start();

  // On other browsers, opening the invitation or touching anywhere starts the song.
  // The speaker button handles its own click so it doesn't instantly toggle back off.
  function onInteraction(event) {
    if (event.target && event.target.closest && event.target.closest("#soundToggle")) return;
    if (audio.paused) start();
  }
  document.addEventListener("pointerdown", onInteraction, { passive: true });
  document.addEventListener("touchend", onInteraction, { passive: true });
  document.addEventListener("click", onInteraction);
  document.addEventListener("keydown", onInteraction);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else start();
  });

  window.WeddingMusic = {
    setEnabled,
    start,
    isPlaying: () => !audio.paused && !audio.ended
  };
})();
