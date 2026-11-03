// One fixed canvas shared by every petal moment on the page. It only runs
// while petals are in the air.
window.Petals = (function () {
  const canvas = document.getElementById("petals");
  const c = canvas.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sprites = [];
  const live = [];
  let running = false;

  for (let i = 1; i <= 12; i++) {
    const img = new Image();
    img.src = `assets/art/petal-${i}.webp`;
    img.onload = () => sprites.push(img);
  }

  function fit() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener("resize", fit);
  fit();

  function add(x, y, vx, vy) {
    live.push({
      x, y, vx, vy,
      size: 16 + Math.random() * 18,
      spin: Math.random() * 6.28,
      spinV: (Math.random() - 0.5) * 0.12,
      sway: Math.random() * 6.28,
      flip: Math.random() * 6.28,
      sprite: sprites.length ? sprites[Math.floor(Math.random() * sprites.length)] : null,
      hue: ["#FFFFFF", "#F6EEDF", "#F3DDD4"][Math.floor(Math.random() * 3)],
    });
  }

  function frame() {
    c.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = live.length - 1; i >= 0; i--) {
      const p = live[i];
      p.vy = Math.min(p.vy + 0.05, 2.4);
      p.vx *= 0.985;
      p.sway += 0.04;
      p.flip += 0.07;
      p.spin += p.spinV;
      p.x += p.vx + Math.sin(p.sway) * 0.8;
      p.y += p.vy;
      if (p.y > innerHeight + 40) { live.splice(i, 1); continue; }
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.spin);
      c.scale(1, 0.35 + Math.abs(Math.cos(p.flip)) * 0.65);
      if (p.sprite) {
        c.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        c.fillStyle = p.hue;
        c.beginPath();
        c.ellipse(0, 0, p.size / 2, p.size / 3, 0, 0, 6.29);
        c.fill();
      }
      c.restore();
    }
    if (live.length) requestAnimationFrame(frame);
    else { running = false; c.clearRect(0, 0, innerWidth, innerHeight); }
  }

  function go() {
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  return {
    rain(count) {
      if (still) return;
      for (let i = 0; i < count; i++) {
        add(Math.random() * innerWidth, -30 - Math.random() * innerHeight * 0.7, 0, 0.6 + Math.random());
      }
      go();
    },
    burst(x, y, count) {
      if (still) return;
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
        const speed = 3 + Math.random() * 6;
        add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed);
      }
      go();
    },
  };
})();
