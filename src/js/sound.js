// All sound is synthesised, so there are no audio files to load and nothing
// plays until a guest has tapped something.
window.Sound = (function () {
  let ctx = null;
  let drums = null;
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

  function burst({ at = 0, length, type, freq, q = 0.8, gain, out }) {
    const t = ctx.currentTime + at;
    const source = noise(length);
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + length);
    source.connect(filter).connect(amp).connect(out || ctx.destination);
    source.start(t);
  }

  function tone({ at = 0, from, to = from, glide, length, gain, type = "sine", attack = 0.006, out }) {
    const t = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + (glide || length));
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(amp).connect(out || ctx.destination);
    osc.start(t);
    osc.stop(t + length + 0.02);
  }

  // The dholak plays through a small room so it doesn't sound like a dry test tone.
  function drumBus() {
    if (drums) return drums;
    const length = Math.ceil(ctx.sampleRate * 1.1);
    const room = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = room.getChannelData(c);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-5 * i / ctx.sampleRate);
    }
    const verb = ctx.createConvolver();
    verb.buffer = room;
    const wet = ctx.createGain();
    wet.gain.value = 0.2;
    const squeeze = ctx.createDynamicsCompressor();
    squeeze.threshold.value = -14;
    squeeze.ratio.value = 4;
    squeeze.connect(ctx.destination);
    drums = ctx.createGain();
    drums.connect(squeeze);
    drums.connect(verb).connect(wet).connect(squeeze);
    return drums;
  }

  const vary = (n, by) => n * (1 + (Math.random() * 2 - 1) * by);

  // The bass head: a low boom that bends up a little as the palm lifts.
  function ge(at, level = 1) {
    const out = drumBus();
    const f = vary(88, 0.02);
    const t = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(f * 1.9, t);
    osc.frequency.exponentialRampToValueAtTime(f, t + 0.035);
    osc.frequency.exponentialRampToValueAtTime(f * 1.12, t + 0.4);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.62 * level, t + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.connect(amp).connect(out);
    osc.start(t);
    osc.stop(t + 0.6);
    tone({ at, from: f * 2.6, to: f * 1.7, length: 0.12, gain: 0.12 * level, attack: 0.003, out });
    burst({ at, length: 0.05, type: "lowpass", freq: 420, gain: 0.32 * level, out });
  }

  // The treble head: a bright slap with ringing overtones, like a struck skin.
  function na(at, level = 1) {
    const out = drumBus();
    const f = vary(392, 0.015);
    [[1, 0.26, 0.26], [2, 0.15, 0.17], [3, 0.08, 0.11], [4.1, 0.045, 0.07]].forEach(([ratio, gain, length]) => {
      tone({ at, from: f * ratio * 1.03, to: f * ratio, glide: 0.03, length, gain: gain * level, attack: 0.002, out });
    });
    burst({ at, length: 0.025, type: "bandpass", freq: 3400, q: 1.1, gain: 0.34 * level, out });
  }

  // A muted flick of the fingers, for the quiet notes in between.
  function ti(at, level = 1) {
    const out = drumBus();
    tone({ at, from: vary(620, 0.02), to: 560, length: 0.06, gain: 0.1 * level, attack: 0.002, out });
    burst({ at, length: 0.02, type: "bandpass", freq: 2600, q: 1.4, gain: 0.26 * level, out });
  }

  const voices = { ge, na, ti, dha: (at, level) => { ge(at, level); na(at, level * 0.85); } };

  // A short sangeeth-style chaal on a triplet swing. Each stroke: [step, voice, loudness].
  const STEP = 60 / 118 / 3;
  const CHAAL = [
    [0, "dha", 1], [2, "ge", 0.45], [3, "na", 0.8], [5, "ge", 0.5],
    [6, "dha", 0.95], [8, "ge", 0.45], [9, "na", 0.8], [10, "ti", 0.7], [11, "ge", 0.5],
    [12, "dha", 1], [14, "ge", 0.45], [15, "na", 0.8], [17, "ge", 0.5],
    [18, "dha", 0.95], [20, "na", 0.7], [21, "na", 0.85], [22, "ti", 0.7], [23, "na", 0.75],
    [24, "dha", 1.1],
  ];

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
    // Plays the chaal and returns when each stroke lands, so the page can move in time.
    groove() {
      const strokes = CHAAL.map(([step, voice, level]) => ({
        at: step * STEP + (step ? (Math.random() - 0.5) * 0.012 : 0),
        voice,
        level,
        accent: voice === "dha",
      }));
      if (ready()) strokes.forEach(({ at, voice, level }) => voices[voice](0.03 + at, vary(level, 0.08)));
      return strokes;
    },
    chime() {
      if (!ready()) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone({ at: i * 0.11, from: f, length: 0.9, gain: 0.13, type: "triangle" });
      });
    },
  };
})();
