// This MP3 is the only audible soundtrack. The existing speaker is the only music control.
// Browsers can block autoplay; the first visitor interaction or speaker tap unlocks playback.
(function () {
  const audio = document.createElement("audio");
  audio.id = "weddingSoundtrack";
  audio.src = "/assets/music.mp3";
  audio.preload = "auto";
  audio.loop = true;
  audio.volume = 0.65;
  audio.playsInline = true;
  document.body.appendChild(audio);

  const button = document.getElementById("soundToggle");
  const hint = document.getElementById("musicHint");
  const Sound = window.Sound;
  if (!button || !Sound) return;

  let enabled = Sound.enabled;
  let blocked = false;
  let loadFailed = false;
  let attempt = 0;

  function showHint(message) {
    if (!hint) return;
    hint.textContent = message || "";
    hint.hidden = !message;
  }

  function paint() {
    button.classList.toggle("is-off", !enabled);
    button.setAttribute("aria-pressed", String(enabled));
    const label = !enabled ? "Music off — tap to play" :
      (!audio.paused ? "Music playing — tap to mute" : "Music on — tap to start");
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  function start() {
    if (!enabled || loadFailed || document.hidden) return;
    const myAttempt = ++attempt;
    let playing;
    try { playing = audio.play(); }
    catch (_) { blocked = true; showHint("Tap the speaker to play our song"); paint(); return; }
    if (playing && typeof playing.then === "function") {
      playing.then(() => {
        if (myAttempt !== attempt || !enabled) return;
        blocked = false;
        showHint("");
        paint();
      }).catch(error => {
        if (myAttempt !== attempt || !enabled) return;
        blocked = true;
        if (error && error.name === "NotAllowedError") showHint("Tap the speaker to play our song");
        else showHint("Music couldn’t start. Tap the speaker to retry.");
        paint();
      });
    }
  }

  function setEnabled(next) {
    enabled = Boolean(next);
    if (!enabled) {
      ++attempt;
      audio.pause();
      showHint("");
    } else start();
    paint();
  }

  button.addEventListener("click", () => {
    // If sound is marked ON but the browser blocked autoplay, this tap should
    // START playback, rather than immediately switching it OFF.
    if (enabled && audio.paused) {
      start();
      return;
    }
    Sound.toggle();
    setEnabled(Sound.enabled);
  });

  // The browser can allow audio after opening the envelope or any guest tap.
  function interaction(event) {
    if (event.target && event.target.closest && event.target.closest("#soundToggle")) return;
    if (enabled && audio.paused) start();
  }
  document.addEventListener("pointerdown", interaction, { passive: true });
  document.addEventListener("click", interaction);
  document.addEventListener("keydown", interaction);

  audio.addEventListener("playing", () => { blocked = false; showHint(""); paint(); });
  audio.addEventListener("pause", paint);
  audio.addEventListener("error", () => {
    loadFailed = true;
    showHint("Song unavailable. Check the uploaded MP3 file.");
    paint();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (enabled) start();
  });

  paint();
  if (enabled) start();

  window.WeddingMusic = { start, setEnabled, isPlaying: () => !audio.paused && !audio.ended };
})();
