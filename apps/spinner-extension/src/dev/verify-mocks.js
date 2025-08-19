/**
 * Mock verification module for React components
 * Import this at the top of your entry points to ensure Chrome mocks are available
 */

function checkRequiredAPIs() {
  const requiredAPIs = {
    'chrome.storage': window.chrome?.storage,
    'chrome.storage.local': window.chrome?.storage?.local,
    'chrome.storage.local.get': window.chrome?.storage?.local?.get,
    'chrome.storage.local.set': window.chrome?.storage?.local?.set,
    'chrome.storage.local.remove': window.chrome?.storage?.local?.remove,
    'chrome.storage.local.clear': window.chrome?.storage?.local?.clear,
    'chrome.storage.onChanged': window.chrome?.storage?.onChanged,
    'chrome.storage.onChanged.addListener': window.chrome?.storage?.onChanged?.addListener,
    'chrome.runtime': window.chrome?.runtime,
    'chrome.runtime.getManifest': window.chrome?.runtime?.getManifest,
    'chrome.runtime.sendMessage': window.chrome?.runtime?.sendMessage,
    'chrome.runtime.onMessage': window.chrome?.runtime?.onMessage,
    'chrome.runtime.onMessage.addListener': window.chrome?.runtime?.onMessage?.addListener,
    'chrome.tabs': window.chrome?.tabs,
    'chrome.sidePanel': window.chrome?.sidePanel,
  };
  
  const missingAPIs = [];
  const availableAPIs = [];
  
  for (const [api, value] of Object.entries(requiredAPIs)) {
    if (!value) {
      missingAPIs.push(api);
    } else {
      availableAPIs.push(api);
    }
  }
  
  return { missingAPIs, availableAPIs };
}

function testBasicFunctionality() {
  try {
    // Test storage.local.get
    const testGet = window.chrome.storage.local.get('test');
    if (!(testGet instanceof Promise)) {
      console.warn('[Verify] ⚠️ storage.local.get does not return a Promise');
    }
    
    // Test storage.local.set
    const testSet = window.chrome.storage.local.set({ test: 'value' });
    if (!(testSet instanceof Promise)) {
      console.warn('[Verify] ⚠️ storage.local.set does not return a Promise');
    }
    
    // Test runtime.getManifest
    const manifest = window.chrome.runtime.getManifest();
    if (!manifest || typeof manifest !== 'object') {
      console.warn('[Verify] ⚠️ runtime.getManifest does not return an object');
    }
    
    console.log('[Verify] ✅ Basic functionality tests passed');
    return true;
  } catch (error) {
    console.error('[Verify] ❌ Error testing Chrome API functionality:', error);
    return false;
  }
}

export function verifyChromeMocks() {
  console.log('[Verify] Checking Chrome API mock availability...');
  
  if (typeof window === 'undefined') {
    console.log('[Verify] Not in browser environment, skipping verification');
    return true;
  }
  
  if (!window.chrome) {
    console.error('[Verify] ❌ window.chrome is not defined!');
    console.error('[Verify] Attempting to load mocks...');
    
    // Try to load mocks if not present
    import('./setup-mocks.js').then(() => {
      console.log('[Verify] Mocks loaded successfully');
    }).catch(err => {
      console.error('[Verify] Failed to load mocks:', err);
    });
    
    return false;
  }
  
  // Check for required Chrome APIs
  const { missingAPIs, availableAPIs } = checkRequiredAPIs();
  
  if (missingAPIs.length > 0) {
    console.error('[Verify] ❌ Missing Chrome APIs:', missingAPIs);
    console.log('[Verify] ✅ Available APIs:', availableAPIs);
    return false;
  }
  
  console.log('[Verify] ✅ All required Chrome APIs are available!');
  
  // Test basic functionality
  return testBasicFunctionality();
}

// Run verification immediately when imported
const isValid = verifyChromeMocks();

if (!isValid && typeof window !== 'undefined') {
  console.error('[Verify] Chrome API mocks verification failed!');
  console.error('[Verify] This may cause issues with components that depend on Chrome APIs.');
  
  // Show a warning in the UI if in development
  if (import.meta.env?.DEV) {
    setTimeout(() => {
      const warning = document.createElement('div');
      warning.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff4444;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      `;
      warning.textContent = '⚠️ Chrome API mocks not properly initialized';
      document.body.appendChild(warning);
      
      setTimeout(() => {
        warning.remove();
      }, 5000);
    }, 1000);
  }
}

export default isValid;