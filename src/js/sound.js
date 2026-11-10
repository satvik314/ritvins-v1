// The soundtrack is the ONLY audible source on the invitation.
// Retain these silent hooks for the existing visual interactions and drum animations.
window.Sound = (function () {
  let enabled = true;
  try { enabled = localStorage.getItem("sound") !== "off"; } catch (e) {}

  const STEP = 60 / 118 / 3;
  const CHAAL = [
    [0,"dha",1],[2,"ge",.45],[3,"na",.8],[5,"ge",.5],
    [6,"dha",.95],[8,"ge",.45],[9,"na",.8],[10,"ti",.7],[11,"ge",.5],
    [12,"dha",1],[14,"ge",.45],[15,"na",.8],[17,"ge",.5],
    [18,"dha",.95],[20,"na",.7],[21,"na",.85],[22,"ti",.7],[23,"na",.75],
    [24,"dha",1.1]
  ];
  const silent = () => {};
  return {
    init: silent,
    get enabled() { return enabled; },
    toggle() {
      enabled = !enabled;
      try { localStorage.setItem("sound", enabled ? "on" : "off"); } catch (e) {}
      return enabled;
    },
    tick: silent,
    paper: silent,
    shutter: silent,
    thud: silent,
    chime: silent,
    // Preserve timing for visuals, but never synthesize drums or other audio.
    groove() {
      return CHAAL.map(([step, voice, level]) => ({
        at: step * STEP,
        voice,
        level,
        accent: voice === "dha"
      }));
    }
  };
})();
