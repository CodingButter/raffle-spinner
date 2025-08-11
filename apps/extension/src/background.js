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
    chrome.sidePanel
      .open({ windowId: sender.tab.windowId })
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async response
  }
});
