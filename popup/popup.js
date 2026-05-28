const MOOD_META = {
  morning:   { emoji: "🌤", label: "Manhã",    color1: "#fceabb", color2: "#f8b500" },
  energetic: { emoji: "⚡", label: "Tarde",    color1: "#f7971e", color2: "#ffd200" },
  chill:     { emoji: "🌊", label: "Chill",    color1: "#4facfe", color2: "#00f2fe" },
  cyber:     { emoji: "🌐", label: "Cyber",    color1: "#00ffff", color2: "#000814" },
  focus:     { emoji: "🎯", label: "Foco",     color1: "#e0e0e0", color2: "#ffffff" },
  dev:       { emoji: "💻", label: "Dev",      color1: "#00ffcc", color2: "#0d0d0d" },
  neon:      { emoji: "🔮", label: "Neon",     color1: "#ff00ff", color2: "#1a001a" },
  cozy:      { emoji: "☕", label: "Cozy",     color1: "#f6d365", color2: "#fda085" },
};

const moodOrb    = document.getElementById("moodOrb");
const moodLabel  = document.getElementById("moodLabel");
const moodSource = document.getElementById("moodSource");
const moodGrid   = document.getElementById("moodGrid");

// Atualiza o orb principal com as cores do mood
function updateOrbDisplay(moodName) {
  const meta = MOOD_META[moodName];
  if (!meta) return;

  document.documentElement.style.setProperty("--aura-1", meta.color1);
  document.documentElement.style.setProperty("--aura-2", meta.color2);

  moodOrb.style.background = `radial-gradient(circle, ${meta.color1}, ${meta.color2})`;
  moodOrb.style.boxShadow  = `0 0 20px ${meta.color1}`;
  moodLabel.textContent    = meta.label;

  // Dispara animação de troca
  moodOrb.classList.remove("switching");
  void moodOrb.offsetWidth; // força reflow
  moodOrb.classList.add("switching");

  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mood === moodName);
  });
}

// Renderiza os botões do grid
function renderGrid() {
  moodGrid.innerHTML = "";

  Object.entries(MOOD_META).forEach(([key, meta]) => {
    const btn = document.createElement("button");
    btn.className = "mood-btn";
    btn.dataset.mood = key;
    btn.innerHTML = `
      <div class="orb" style="background: radial-gradient(circle, ${meta.color1}, ${meta.color2});
        box-shadow: 0 0 8px ${meta.color1};"></div>
      <span>${meta.emoji} ${meta.label}</span>
    `;
    btn.addEventListener("click", () => selectMoodManually(key));
    moodGrid.appendChild(btn);
  });
}

// Seleciona mood manualmente
function selectMoodManually(moodName) {
  const meta = MOOD_META[moodName];
  if (!meta) return;

  const mood = {
    name: moodName,
    label: meta.label,
    colors: [meta.color1, meta.color2],
    particles: getParticlesByMood(moodName),
    sound: getSoundByMood(moodName),
  };

  chrome.storage.local.set({
    currentMood: mood,
    manualMood: true,
    autoMood: false,
  });

  moodSource.textContent = "Selecionado manualmente";
  document.getElementById("toggleAuto").checked = false;
  updateOrbDisplay(moodName);
}

// Mapas auxiliares para o popup
function getParticlesByMood(name) {
  const map = {
    morning: "dust", energetic: "sparks", chill: "stars",
    cyber: "rain", focus: "none", dev: "rain",
    neon: "sparks", cozy: "dust",
  };
  return map[name] ?? "none";
}

function getSoundByMood(name) {
  const map = {
    chill: "rain", cyber: "keyboard", focus: "cafe",
    dev: "keyboard", cozy: "cafe",
  };
  return map[name] ?? null;
}

// Carrega estado inicial
chrome.storage.local.get(["currentMood", "manualMood", "particles", "sound", "autoMood"], (data) => {
  if (data.currentMood) {
    updateOrbDisplay(data.currentMood.name);
    moodSource.textContent = data.manualMood ? "Selecionado manualmente" : "Detectado automaticamente";
  }

  document.getElementById("toggleParticles").checked = data.particles !== false;
  document.getElementById("toggleSound").checked     = data.sound === true;
  document.getElementById("toggleAuto").checked      = data.autoMood !== false;
});

// Salva preferências dos toggles
document.getElementById("toggleParticles").addEventListener("change", (e) => {
  chrome.storage.local.set({ particles: e.target.checked });
});

document.getElementById("toggleSound").addEventListener("change", (e) => {
  chrome.storage.local.set({ sound: e.target.checked });
});

document.getElementById("toggleAuto").addEventListener("change", (e) => {
  chrome.storage.local.set({ autoMood: e.target.checked, manualMood: !e.target.checked });
  if (e.target.checked) moodSource.textContent = "Detectado automaticamente";
});

renderGrid();
