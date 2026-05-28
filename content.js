// Aplica as cores da aura como variáveis CSS na página
function applyAura(mood) {
  const root = document.documentElement;

  root.style.setProperty("--aura-color-1", mood.colors[0]);
  root.style.setProperty("--aura-color-2", mood.colors[1]);
  root.setAttribute("data-aura", mood.name);
}

// Escuta mudanças no storage
chrome.storage.onChanged.addListener((changes) => {
  if (changes.currentMood) {
    applyAura(changes.currentMood.newValue);
  }
});

// Aplica na carga inicial
chrome.storage.local.get("currentMood", ({ currentMood }) => {
  if (currentMood) applyAura(currentMood);
});