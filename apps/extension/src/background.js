/**
 * Background Service Worker
 *
 * Purpose: Handles extension icon clicks and manages navigation to options page
 *
 * SRS Reference:
 * - Extension UX improvements
 */

/* global chrome */

// Open options page when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Allow side panel to be opened programmatically
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSidePanel') {
    // Get the current window ID - works from both tabs and extension pages
    chrome.windows.getCurrent((window) => {
      chrome.sidePanel
        .open({ windowId: window.id })
        .then(() => sendResponse({ success: true }))
        .catch((err) => {
          console.error('Failed to open side panel:', err);
          // Try without window ID as fallback
          chrome.sidePanel
            .open()
            .then(() => sendResponse({ success: true }))
            .catch((fallbackErr) => sendResponse({ success: false, error: fallbackErr.message }));
        });
    });
    return true; // Keep message channel open for async response
  }
});
