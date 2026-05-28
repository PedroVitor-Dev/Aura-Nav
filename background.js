importScripts("mood-engine.js");

chrome.runtime.onInstalled.addListener(() => {
  detectAndSaveMood("newtab");
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;
    detectAndSaveMood(tab.url);
    injectScripts(tabId, tab.url);
  } catch (e) {}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    detectAndSaveMood(tab.url);
    injectScripts(tabId, tab.url);
  }
});

function detectAndSaveMood(url) {
  try {
    const hostname = new URL(url).hostname;
    const mood = resolveMood(hostname);
    chrome.storage.local.get(["autoMood"], (data) => {
      if (data.autoMood === false) return;
      chrome.storage.local.set({ currentMood: mood, manualMood: false });
    });
  } catch (e) {}
}

function injectScripts(tabId, url) {
  // Ignora páginas do sistema
  if (!url.startsWith("http")) return;

  chrome.scripting.executeScript({
    target: { tabId },
    files: ["particles/particles.js"],
  }).catch(() => {});

  chrome.scripting.executeScript({
    target: { tabId },
    files: ["sounds/sound-engine.js"],
  }).catch(() => {});
}