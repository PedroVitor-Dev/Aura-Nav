let particlesLoaded = false;

// Carrega o script de partículas dinamicamente
function loadParticles() {
  if (particlesLoaded) return;
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("particles/particles.js");
  script.onload = () => { particlesLoaded = true; };
  document.documentElement.appendChild(script);
}

// Aplica aura + partículas
function applyAura(mood, particlesEnabled) {
  const root = document.documentElement;
  root.style.setProperty("--aura-color-1", mood.colors[0]);
  root.style.setProperty("--aura-color-2", mood.colors[1]);
  root.setAttribute("data-aura", mood.name);

  if (!particlesEnabled) {
    window.__auraParticles?.stop();
    return;
  }

  loadParticles();

  // Aguarda o script carregar antes de iniciar
  const tryStart = setInterval(() => {
    if (window.__auraParticles) {
      clearInterval(tryStart);
      window.__auraParticles.start(mood.particles, mood.colors[0]);
    }
  }, 100);
}

// Escuta mudanças no storage
chrome.storage.onChanged.addListener((changes) => {
  chrome.storage.local.get(["currentMood", "particles"], (data) => {
    if (data.currentMood) {
      applyAura(data.currentMood, data.particles !== false);
    }
  });
});

// Aplica na carga inicial
chrome.storage.local.get(["currentMood", "particles"], (data) => {
  if (data.currentMood) {
    applyAura(data.currentMood, data.particles !== false);
  }
});