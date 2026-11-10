// YouTube's official IFrame Player API supplies user-initiated playback.
// Browsers generally block autoplay with audio until a user interacts.
(function () {
  const button = document.getElementById("musicToggle");
  const label = document.getElementById("musicLabel");
  const panel = document.getElementById("musicPanel");
  const status = document.getElementById("musicStatus");
  if (!button || !label || !panel || !status) return;

  let player = null;
  let loading = false;
  let playing = false;
  let requestedPlay = false;

  function paint() {
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute("aria-label", playing ? "Pause our song" : "Play our song");
    label.textContent = playing ? "Pause our song" : "Play our song";
  }

  function initialize() {
    if (player || loading) return;
    loading = true;
    status.textContent = "Loading our song…";
    const existing = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof existing === "function") existing();
      player = new window.YT.Player("musicVideo", {
        height: "180", width: "320",
        videoId: "5p_cIdoAVaM",
        playerVars: { playsinline: 1, controls: 1, rel: 0, origin: location.origin },
        events: {
          onReady(event) {
            loading = false;
            status.textContent = "Ready to play.";
            if (requestedPlay) event.target.playVideo();
          },
          onStateChange(event) {
            const state = window.YT.PlayerState;
            playing = event.data === state.PLAYING;
            if (playing) status.textContent = "Playing our song.";
            else if (event.data === state.PAUSED) status.textContent = "Music paused.";
            else if (event.data === state.ENDED) status.textContent = "Song finished. Tap to replay.";
            paint();
          },
          onError() {
            playing = false;
            requestedPlay = false;
            status.textContent = "Playback is unavailable here. Use the YouTube Music link below.";
            paint();
          }
        }
      });
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => {
      loading = false;
      requestedPlay = false;
      status.textContent = "Could not load the player. Open our song in YouTube Music instead.";
      paint();
    };
    document.head.appendChild(script);
  }

  button.addEventListener("click", () => {
    panel.hidden = false;
    if (!player) {
      requestedPlay = true;
      initialize();
      return;
    }
    if (playing) {
      requestedPlay = false;
      player.pauseVideo();
    } else {
      requestedPlay = true;
      player.playVideo();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && player && playing) player.pauseVideo();
  });
  paint();
})();
