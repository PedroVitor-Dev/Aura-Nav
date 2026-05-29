importScripts("mood-engine.js");

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.clear();
  detectAndSaveMood("https://newtab");
});

// Força reload do mood ao iniciar o service worker
detectAndSaveMoodFromActiveTab();

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;
    detectAndSaveMood(tab.url);
  } catch (e) {}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    detectAndSaveMood(tab.url);
  }
});

function detectAndSaveMood(url) {
  try {
    const hostname = new URL(url).hostname;
    // Sempre busca mood fresco do mood-engine
    const mood = resolveMood(hostname);
    chrome.storage.local.get(["autoMood"], (data) => {
      if (data.autoMood === false) return;
      // Salva cópia profunda para garantir dados atualizados
      chrome.storage.local.set({
        currentMood: JSON.parse(JSON.stringify(mood)),
        manualMood: false,
      });
    });
  } catch (e) {}
}

async function detectAndSaveMoodFromActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) detectAndSaveMood(tab.url);
  } catch (e) {}
}