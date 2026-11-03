// All sound is synthesised, so there are no audio files to load and nothing
// plays until a guest has tapped something.
window.Sound = (function () {
  let ctx = null;
  let enabled = true;
  try { enabled = localStorage.getItem("sound") !== "off"; } catch (e) {}

  function init() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  function ready() { return enabled && ctx; }

  function noise(length) {
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  function burst({ at = 0, length, type, freq, q = 0.8, gain }) {
    const t = ctx.currentTime + at;
    const source = noise(length);
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + length);
    source.connect(filter).connect(amp).connect(ctx.destination);
    source.start(t);
  }

  function tone({ at = 0, from, to = from, length, gain, type = "sine" }) {
    const t = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + length);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + length + 0.02);
  }

  return {
    init,
    get enabled() { return enabled; },
    toggle() {
      enabled = !enabled;
      try { localStorage.setItem("sound", enabled ? "on" : "off"); } catch (e) {}
      return enabled;
    },
    tick() {
      if (!ready()) return;
      burst({ length: 0.018, type: "highpass", freq: 2600, gain: 0.5 });
      tone({ from: 1900, to: 900, length: 0.03, gain: 0.16, type: "triangle" });
    },
    paper() {
      if (!ready()) return;
      burst({ length: 0.34, type: "bandpass", freq: 2400, q: 0.5, gain: 0.09 });
    },
    shutter() {
      if (!ready()) return;
      burst({ length: 0.02, type: "highpass", freq: 3200, gain: 0.32 });
      burst({ at: 0.07, length: 0.03, type: "bandpass", freq: 1500, gain: 0.26 });
    },
    thud() {
      if (!ready()) return;
      tone({ from: 130, to: 48, length: 0.2, gain: 0.5 });
      burst({ length: 0.05, type: "lowpass", freq: 700, gain: 0.3 });
    },
    dha() {
      if (!ready()) return;
      tone({ from: 150, to: 62, length: 0.42, gain: 0.6 });
      burst({ length: 0.03, type: "bandpass", freq: 900, gain: 0.16 });
    },
    tin() {
      if (!ready()) return;
      tone({ from: 430, to: 360, length: 0.2, gain: 0.3, type: "triangle" });
      burst({ length: 0.016, type: "highpass", freq: 3000, gain: 0.14 });
    },
    chime() {
      if (!ready()) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone({ at: i * 0.11, from: f, length: 0.9, gain: 0.13, type: "triangle" });
      });
    },
  };
})();
