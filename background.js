importScripts("mood-engine.js");

// Inicializa o mood ao instalar
chrome.runtime.onInstalled.addListener(() => {
  detectAndSaveMood("newtab");
});

// Escuta mudança de aba ativa
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;
    detectAndSaveMood(tab.url);
  } catch (e) {}
});

// Escuta navegação dentro da mesma aba
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    detectAndSaveMood(tab.url);
  }
});

function detectAndSaveMood(url) {
  try {
    const hostname = new URL(url).hostname;
    const mood = resolveMood(hostname);
    chrome.storage.local.get(["autoMood", "manualMood"], (data) => {
      // Só muda automaticamente se autoMood estiver ativo
      if (data.autoMood === false) return;
      chrome.storage.local.set({
        currentMood: mood,
        manualMood: false,
      });
    });
  } catch (e) {
    // URL inválida como chrome:// ou about://
  }
}