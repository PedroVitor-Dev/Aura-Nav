let particlesLoaded = false;
let soundLoaded = false;

function loadScript(url, callback) {
  const existing = document.querySelector(`script[src="${url}"]`);
  if (existing) { callback?.(); return; }

  const script = document.createElement("script");
  script.src = url;
  script.onload = callback;
  document.documentElement.appendChild(script);
}

function loadParticles(callback) {
  if (particlesLoaded) { callback?.(); return; }
  loadScript(chrome.runtime.getURL("particles/particles.js"), () => {
    particlesLoaded = true;
    callback?.();
  });
}

function loadSound(callback) {
  if (soundLoaded) { callback?.(); return; }
  loadScript(chrome.runtime.getURL("sounds/sound-engine.js"), () => {
    soundLoaded = true;
    callback?.();
  });
}

function applyAura(mood, particlesEnabled, soundEnabled) {
  if (!mood) return;

  const root = document.documentElement;
  root.style.setProperty("--aura-color-1", mood.colors[0]);
  root.style.setProperty("--aura-color-2", mood.colors[1]);
  root.setAttribute("data-aura", mood.name);

  // Partículas
  if (particlesEnabled && mood.particles && mood.particles !== "none") {
    loadParticles(() => {
      const tryStart = setInterval(() => {
        if (window.__auraParticles) {
          clearInterval(tryStart);
          window.__auraParticles.start(mood.particles, mood.colors[0]);
        }
      }, 100);
    });
  } else {
    window.__auraParticles?.stop();
  }

  // Sons
  if (soundEnabled && mood.sound) {
    loadSound(() => {
      const tryPlay = setInterval(() => {
        if (window.__auraSound) {
          clearInterval(tryPlay);
          const src = chrome.runtime.getURL(`sounds/${mood.sound}.mp3`);
          window.__auraSound.play(src);
        }
      }, 100);
    });
  } else {
    window.__auraSound?.stop();
  }
}

// Escuta mudanças no storage
chrome.storage.onChanged.addListener(() => {
  chrome.storage.local.get(["currentMood", "particles", "sound"], (data) => {
    applyAura(data.currentMood, data.particles !== false, data.sound === true);
  });
});

// Aplica na carga inicial
chrome.storage.local.get(["currentMood", "particles", "sound"], (data) => {
  applyAura(data.currentMood, data.particles !== false, data.sound === true);
});