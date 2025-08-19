/**
 * Simplified Background Service Worker
 * Minimal functionality for iframe-based extension
 */

// Open options page when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Handle side panel opening requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSidePanel') {
    chrome.windows.getCurrent((window) => {
      chrome.sidePanel
        .open({ windowId: window.id })
        .then(() => sendResponse({ success: true }))
        .catch((err) => {
          // Fallback without window ID
          chrome.sidePanel
            .open()
            .then(() => sendResponse({ success: true }))
            .catch((fallbackErr) => sendResponse({ success: false, error: fallbackErr.message }));
        });
    });
    return true; // Keep message channel open for async response
  }
});