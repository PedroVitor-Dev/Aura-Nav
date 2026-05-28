(function () {
  // Evita duplicar o canvas se o script rodar mais de uma vez
  if (document.getElementById("aura-canvas")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "aura-canvas";

  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "2147483647",
    opacity: "0.5",
  });

  document.body.appendChild(canvas);

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

  // ─── Tipos de partícula ───────────────────────────────────────

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

  // ─── Init por tipo ────────────────────────────────────────────

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

  // ─── Update por tipo ──────────────────────────────────────────

  function updateDust(p) {
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.y < -5) Object.assign(p, createDust(), { y: canvas.height });
    if (p.x < -5 || p.x > canvas.width + 5) p.x = Math.random() * canvas.width;
  }

  function updateRain(p) {
    p.y += p.speed;
    if (p.y > canvas.height + 20) Object.assign(p, createRain());
  }

  function updateStar(p) {
    p.opacity += p.twinkleSpeed * p.direction;
    if (p.opacity >= 1 || p.opacity <= 0) p.direction *= -1;
  }

  function updateSpark(p) {
    p.x += p.speedX;
    p.y += p.speedY;
    p.life -= p.decay;
    p.opacity = p.life;
    if (p.life <= 0) Object.assign(p, createSpark());
  }

  // ─── Draw por tipo ────────────────────────────────────────────

  function drawDust(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(currentColor, p.opacity);
    ctx.fill();
  }

  function drawRain(p) {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - 1, p.y + p.length);
    ctx.strokeStyle = hexToRgba(currentColor, p.opacity);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawStar(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(currentColor, p.opacity);
    ctx.fill();
  }

  function drawSpark(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(currentColor, p.opacity);
    ctx.shadowBlur = 6;
    ctx.shadowColor = currentColor;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ─── Loop principal ───────────────────────────────────────────

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      if (currentType === "dust")   { updateDust(p);  drawDust(p);  }
      if (currentType === "rain")   { updateRain(p);  drawRain(p);  }
      if (currentType === "stars")  { updateStar(p);  drawStar(p);  }
      if (currentType === "sparks") { updateSpark(p); drawSpark(p); }
    });

    animationId = requestAnimationFrame(animate);
  }

  // ─── API pública ──────────────────────────────────────────────

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

  // ─── Helpers ──────────────────────────────────────────────────

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
})();