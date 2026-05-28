// ─── Sound Engine ─────────────────────────────────────────────
(function () {
  if (window.__auraSound) return;

  let currentAudio = null;
  let currentSrc = null;
  let pendingSrc = null;
  let fadeDuration = 1500;
  let volume = 0.3;
  let userInteracted = false;

  function onFirstInteraction() {
    userInteracted = true;
    window.removeEventListener("click", onFirstInteraction);
    window.removeEventListener("keydown", onFirstInteraction);
    if (pendingSrc) {
      const src = pendingSrc;
      pendingSrc = null;
      play(src);
    }
  }

  window.addEventListener("click", onFirstInteraction);
  window.addEventListener("keydown", onFirstInteraction);

  function fadeOut(audio, callback) {
    if (!audio) { callback?.(); return; }
    const step = audio.volume / (fadeDuration / 50);
    const interval = setInterval(() => {
      if (audio.volume > step) {
        audio.volume = Math.max(0, audio.volume - step);
      } else {
        clearInterval(interval);
        audio.pause();
        audio.src = "";
        callback?.();
      }
    }, 50);
  }

  function fadeIn(audio) {
    audio.volume = 0;
    audio.play().catch(() => {});
    const step = volume / (fadeDuration / 50);
    const interval = setInterval(() => {
      if (audio.volume + step < volume) {
        audio.volume = Math.min(volume, audio.volume + step);
      } else {
        audio.volume = volume;
        clearInterval(interval);
      }
    }, 50);
  }

  function play(src) {
    if (currentSrc === src) return;
    if (!userInteracted) { pendingSrc = src; return; }
    fadeOut(currentAudio, () => {
      const audio = new Audio(src);
      audio.loop = true;
      currentAudio = audio;
      currentSrc = src;
      fadeIn(audio);
    });
  }

  function stop() {
    pendingSrc = null;
    fadeOut(currentAudio, () => {
      currentAudio = null;
      currentSrc = null;
    });
  }

  function setVolume(v) {
    volume = Math.min(1, Math.max(0, v));
    if (currentAudio) currentAudio.volume = volume;
  }

  window.__auraSound = { play, stop, setVolume };
})();

// ─── Particles Engine ─────────────────────────────────────────
(function () {
  if (window.__auraParticles) return;
  if (document.getElementById("aura-canvas")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "aura-canvas";
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0", left: "0",
    width: "100vw", height: "100vh",
    pointerEvents: "none",
    zIndex: "2147483647",
    opacity: "0.5",
  });
  document.body?.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let particles = [];
  let animationId;
  let currentType = "none";
  let currentColor = "#00ffcc";

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function createDust() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.3 - 0.1,
      opacity: Math.random() * 0.6 + 0.2,
    };
  }

  function createRain() {
    return {
      x: Math.random() * canvas.width,
      y: -10,
      length: Math.random() * 15 + 10,
      speed: Math.random() * 4 + 6,
      opacity: Math.random() * 0.4 + 0.1,
    };
  }

  function createStar() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      opacity: Math.random(),
      direction: Math.random() > 0.5 ? 1 : -1,
    };
  }

  function createSpark() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: (Math.random() - 0.5) * 1.5,
      opacity: Math.random() * 0.7 + 0.3,
      life: 1,
      decay: Math.random() * 0.01 + 0.004,
    };
  }

  const COUNTS = { dust: 60, rain: 80, stars: 100, sparks: 50, none: 0 };

  function initParticles(type) {
    particles = [];
    currentType = type;
    const count = COUNTS[type] ?? 0;
    for (let i = 0; i < count; i++) {
      if (type === "dust")   particles.push(createDust());
      if (type === "rain")   particles.push(createRain());
      if (type === "stars")  particles.push(createStar());
      if (type === "sparks") particles.push(createSpark());
    }
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      if (currentType === "dust") {
        p.x += p.speedX; p.y += p.speedY;
        if (p.y < -5) Object.assign(p, createDust(), { y: canvas.height });
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(currentColor, p.opacity);
        ctx.fill();
      }
      if (currentType === "rain") {
        p.y += p.speed;
        if (p.y > canvas.height + 20) Object.assign(p, createRain());
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 1, p.y + p.length);
        ctx.strokeStyle = hexToRgba(currentColor, p.opacity);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (currentType === "stars") {
        p.opacity += p.twinkleSpeed * p.direction;
        if (p.opacity >= 1 || p.opacity <= 0) p.direction *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(currentColor, p.opacity);
        ctx.fill();
      }
      if (currentType === "sparks") {
        p.x += p.speedX; p.y += p.speedY;
        p.life -= p.decay; p.opacity = p.life;
        if (p.life <= 0) Object.assign(p, createSpark());
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(currentColor, p.opacity);
        ctx.shadowBlur = 6;
        ctx.shadowColor = currentColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    animationId = requestAnimationFrame(animate);
  }

  window.__auraParticles = {
    start(type, color) {
      currentColor = color || "#00ffcc";
      initParticles(type || "none");
      cancelAnimationFrame(animationId);
      if (currentType !== "none") animate();
    },
    stop() {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
})();

// ─── Aura Core ────────────────────────────────────────────────
function applyAura(mood, particlesEnabled, soundEnabled) {
  if (!mood) return;

  const root = document.documentElement;
  root.style.setProperty("--aura-color-1", mood.colors[0]);
  root.style.setProperty("--aura-color-2", mood.colors[1]);
  root.setAttribute("data-aura", mood.name);

  if (particlesEnabled && mood.particles && mood.particles !== "none") {
    window.__auraParticles?.start(mood.particles, mood.colors[0]);
  } else {
    window.__auraParticles?.stop();
  }

  if (soundEnabled && mood.sound) {
    const src = chrome.runtime.getURL(`sounds/${mood.sound}.mp3`);
    window.__auraSound?.play(src);
  } else {
    window.__auraSound?.stop();
  }
}

chrome.storage.onChanged.addListener(() => {
  chrome.storage.local.get(["currentMood", "particles", "sound"], (data) => {
    applyAura(data.currentMood, data.particles !== false, data.sound === true);
  });
});

chrome.storage.local.get(["currentMood", "particles", "sound"], (data) => {
  applyAura(data.currentMood, data.particles !== false, data.sound === true);
});