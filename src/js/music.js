// Optional locally hosted soundtrack. This site's authorized audio is served from public/assets/music.mp3.
// The existing speaker icon controls BOTH the soundtrack and page sound effects.
// Browsers prevent audible autoplay before a visitor's first interaction.
(function () {
  const source = "/assets/music.mp3";
  const audio = new Audio();
  audio.src = source;
  audio.loop = true;
  audio.preload = "none";
  audio.volume = 0.55;

  let enabled = window.Sound ? window.Sound.enabled : true;
  let unavailable = false;
  let unlocked = false;

  audio.addEventListener("error", () => {
    unavailable = true; // Music file not installed yet, keep the sound-effects control working.
  });

  function play() {
    if (!enabled || unavailable || !unlocked) return;
    const result = audio.play();
    if (result && typeof result.catch === "function") result.catch(() => {});
  }

  function setEnabled(next) {
    enabled = Boolean(next);
    if (!enabled) {
      audio.pause();
    } else {
      // This is called directly from the speaker button click, a user gesture.
      unlocked = true;
      play();
    }
  }

  // Opening or interacting with the invitation unlocks music on supporting browsers.
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    play();
  }
  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else play();
  });

  window.WeddingMusic = { setEnabled };
})();
