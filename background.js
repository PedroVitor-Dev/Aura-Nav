importScripts("mood-engine.js");

// Escuta mudança de aba ativa
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url) return;

  handleTabChange(tab.url);
});

// Escuta navegação dentro da mesma aba
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    handleTabChange(tab.url);
  }
});

function handleTabChange(url) {
  try {
    const hostname = new URL(url).hostname;
    const mood = resolveMood(hostname);

    chrome.storage.local.set({ currentMood: mood });
  } catch (e) {
    // URL inválida (ex: chrome://)
  }
}