// Track active tab and time spent
let currentTabId = null;
let currentDomain = null;
let startTime = null;

// Helper to extract domain
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
}

// Save time spent to local storage
function saveTime(domain, duration) {
  if (!domain || duration <= 0) return;

  chrome.storage.local.get(["usage"], (data) => {
    const usage = data.usage || {};
    usage[domain] = (usage[domain] || 0) + duration;

    chrome.storage.local.set({ usage });
  });
}

// Handle tab switch
function handleTabSwitch(tab) {
  const newDomain = extractDomain(tab.url);
  const now = Date.now();

  if (currentDomain && startTime) {
    const duration = Math.floor((now - startTime) / 1000); // seconds
    saveTime(currentDomain, duration);
  }

  currentTabId = tab.id;
  currentDomain = newDomain;
  startTime = now;
}

// When tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url.startsWith("chrome://")) return;
    handleTabSwitch(tab);
  });
});

// When tab is updated (e.g. navigated)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.url) {
    handleTabSwitch(tab);
  }
});

// When window is blurred (user switches apps)
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE && currentDomain && startTime) {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    saveTime(currentDomain, duration);
    currentDomain = null;
    startTime = null;
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) handleTabSwitch(tabs[0]);
    });
  }
});

// On startup, initialize tracking
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) handleTabSwitch(tabs[0]);
  });
});
