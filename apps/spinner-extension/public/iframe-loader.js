/**
 * Iframe Loader for DrawDay Spinner Extension
 * Handles loading the appropriate page from the website into an iframe
 */

(async function() {
  'use strict';
  
  const iframe = document.getElementById('content');
  const loader = document.getElementById('loader');
  const errorDiv = document.getElementById('error');
  
  // Configuration
  const CONFIG = {
    DEV_URL: 'http://localhost:3000',
    PROD_URL: 'https://www.drawday.app',
    STORAGE_KEY: 'drawday_dev_mode',
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
  };
  
  // Determine which page we're on
  const isOptionsPage = window.location.pathname.includes('options');
  const pagePath = isOptionsPage ? '/extension/options' : '/extension/sidepanel';
  
  // Get the appropriate base URL
  async function getBaseUrl() {
    try {
      const result = await chrome.storage.local.get(CONFIG.STORAGE_KEY);
      return result[CONFIG.STORAGE_KEY] ? CONFIG.DEV_URL : CONFIG.PROD_URL;
    } catch (e) {
      // Default to production if storage access fails
      return CONFIG.PROD_URL;
    }
  }
  
  // Show error message
  function showError(message) {
    loader.classList.add('hidden');
    errorDiv.style.display = 'block';
    errorDiv.innerHTML = `
      <h3>Unable to load DrawDay</h3>
      <p>${message}</p>
      <p style="margin-top: 10px;">
        <button onclick="location.reload()" style="padding: 8px 16px; cursor: pointer;">
          Try Again
        </button>
      </p>
    `;
  }
  
  // Load iframe with retry logic
  async function loadIframe(attempt = 1) {
    try {
      const baseUrl = await getBaseUrl();
      const fullUrl = `${baseUrl}${pagePath}`;
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        if (attempt < CONFIG.RETRY_ATTEMPTS) {
          console.log(`Attempt ${attempt} timed out, retrying...`);
          loadIframe(attempt + 1);
        } else {
          showError('Connection timed out. Please check your internet connection.');
        }
      }, CONFIG.TIMEOUT);
      
      // Set up iframe load handlers
      iframe.onload = () => {
        clearTimeout(timeoutId);
        loader.classList.add('hidden');
        iframe.classList.add('loaded');
        console.log('DrawDay loaded successfully');
      };
      
      iframe.onerror = () => {
        clearTimeout(timeoutId);
        if (attempt < CONFIG.RETRY_ATTEMPTS) {
          console.log(`Attempt ${attempt} failed, retrying...`);
          setTimeout(() => loadIframe(attempt + 1), CONFIG.RETRY_DELAY);
        } else {
          showError('Failed to connect to DrawDay. Please try again later.');
        }
      };
      
      // Load the iframe
      iframe.src = fullUrl;
      
    } catch (error) {
      console.error('Error loading iframe:', error);
      showError('An unexpected error occurred. Please try again.');
    }
  }
  
  // Handle messages from the iframe (for future extension API bridge)
  window.addEventListener('message', (event) => {
    // Only accept messages from our known origins
    const allowedOrigins = [CONFIG.DEV_URL, CONFIG.PROD_URL];
    if (!allowedOrigins.includes(event.origin)) {
      return;
    }
    
    const { type, payload, id } = event.data;
    
    // Handle specific message types
    switch (type) {
      case 'openTab':
        if (payload && payload.url) {
          chrome.tabs.create({ url: payload.url });
        }
        break;
        
      case 'getVersion':
        const version = chrome.runtime.getManifest().version;
        event.source.postMessage({ id, result: version }, event.origin);
        break;
        
      case 'setDevMode':
        chrome.storage.local.set({ [CONFIG.STORAGE_KEY]: payload }, () => {
          event.source.postMessage({ id, result: true }, event.origin);
        });
        break;
        
      default:
        console.log('Unknown message type:', type);
    }
  });
  
  // Start loading
  loadIframe();
})();