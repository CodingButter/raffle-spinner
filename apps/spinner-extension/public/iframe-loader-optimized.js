/**
 * Optimized Iframe Loader for DrawDay Spinner Extension
 * Performance optimizations: preloading, caching, progressive loading
 * Target: <1s TTI, 60fps canvas, <50ms message latency
 */

(async function() {
  'use strict';
  
  // Performance-optimized configuration
  const CONFIG = {
    DEV_URL: 'http://localhost:3000',
    PROD_URL: 'https://www.drawday.app',
    STORAGE_KEY: 'drawday_dev_mode',
    TIMEOUT: 5000, // Reduced from 10s for faster error detection
    RETRY_ATTEMPTS: 2, // Reduced from 3 for faster failure recovery
    RETRY_DELAY: 500, // Reduced from 1s
    PRELOAD_TIMEOUT: 2000, // Preload timeout
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes cache
    PROGRESSIVE_THRESHOLD: 1000 // Show partial content after 1s
  };

  // Cache for performance optimization
  const cache = {
    baseUrl: null,
    baseUrlTimestamp: null,
    preloadPromises: new Map(),
    resources: new Map()
  };

  // Performance monitoring
  const perf = {
    startTime: performance.now(),
    milestones: {},
    
    mark(name) {
      this.milestones[name] = performance.now() - this.startTime;
      console.log(`⚡ ${name}: ${this.milestones[name].toFixed(1)}ms`);
    },
    
    getReport() {
      return {
        total: performance.now() - this.startTime,
        milestones: this.milestones
      };
    }
  };

  // DOM elements
  const iframe = document.getElementById('content');
  const loader = document.getElementById('loader');
  const errorDiv = document.getElementById('error');
  
  // Enhanced error display with retry options
  function showError(message, canRetry = true) {
    perf.mark('Error Shown');
    loader.classList.add('hidden');
    errorDiv.style.display = 'block';
    errorDiv.innerHTML = `
      <h3>Unable to load DrawDay</h3>
      <p>${message}</p>
      <div style="margin-top: 15px;">
        ${canRetry ? `<button onclick="location.reload()" style="padding: 8px 16px; cursor: pointer; margin-right: 10px;">Try Again</button>` : ''}
        <button onclick="chrome.tabs.create({url: 'https://www.drawday.app'})" style="padding: 8px 16px; cursor: pointer;">Open in New Tab</button>
      </div>
      <details style="margin-top: 10px; font-size: 12px; color: #666;">
        <summary>Performance Report</summary>
        <pre>${JSON.stringify(perf.getReport(), null, 2)}</pre>
      </details>
    `;
  }

  // Cached base URL retrieval
  async function getBaseUrl() {
    // Use cached value if still valid
    if (cache.baseUrl && cache.baseUrlTimestamp && 
        (Date.now() - cache.baseUrlTimestamp) < CONFIG.CACHE_DURATION) {
      return cache.baseUrl;
    }

    try {
      const result = await chrome.storage.local.get(CONFIG.STORAGE_KEY);
      cache.baseUrl = result[CONFIG.STORAGE_KEY] ? CONFIG.DEV_URL : CONFIG.PROD_URL;
      cache.baseUrlTimestamp = Date.now();
      return cache.baseUrl;
    } catch (e) {
      // Default to production and cache the result
      cache.baseUrl = CONFIG.PROD_URL;
      cache.baseUrlTimestamp = Date.now();
      return cache.baseUrl;
    }
  }

  // Progressive loading - show partial content quickly
  function enableProgressiveLoading() {
    const progressiveTimeout = setTimeout(() => {
      if (!iframe.classList.contains('loaded')) {
        // Show a minimal interface while loading
        iframe.style.filter = 'blur(2px)';
        iframe.style.display = 'block';
        loader.innerHTML = 'Almost ready...';
        perf.mark('Progressive Content Shown');
      }
    }, CONFIG.PROGRESSIVE_THRESHOLD);

    return () => clearTimeout(progressiveTimeout);
  }

  // Resource preloading for faster initialization
  async function preloadCriticalResources(baseUrl) {
    perf.mark('Preload Started');
    
    const criticalResources = [
      '/favicon.ico',
      '/globals.css',
      // Add other critical resources based on actual website structure
    ];

    const preloadPromises = criticalResources.map(resource => {
      return new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = baseUrl + resource;
        link.as = 'style'; // or 'script', 'font', etc.
        link.onload = () => resolve(resource);
        link.onerror = () => resolve(resource); // Don't fail on missing resources
        document.head.appendChild(link);
        
        // Cleanup after timeout
        setTimeout(() => {
          document.head.removeChild(link);
          resolve(resource);
        }, CONFIG.PRELOAD_TIMEOUT);
      });
    });

    try {
      await Promise.all(preloadPromises);
      perf.mark('Preload Completed');
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  }

  // Optimized iframe loading with performance monitoring
  async function loadIframe(attempt = 1) {
    perf.mark(`Load Attempt ${attempt} Started`);
    
    try {
      const baseUrl = await getBaseUrl();
      perf.mark('Base URL Retrieved');
      
      // Start preloading critical resources
      const preloadPromise = preloadCriticalResources(baseUrl);
      
      // Determine page path
      const isOptionsPage = window.location.pathname.includes('options');
      const pagePath = isOptionsPage ? '/extension/options' : '/extension/sidepanel';
      const fullUrl = `${baseUrl}${pagePath}`;
      
      perf.mark('URL Constructed');
      
      // Enable progressive loading
      const clearProgressive = enableProgressiveLoading();
      
      // Set up performance-optimized timeout
      const timeoutId = setTimeout(() => {
        clearProgressive();
        if (attempt < CONFIG.RETRY_ATTEMPTS) {
          perf.mark(`Attempt ${attempt} Timeout`);
          console.log(`⚠️ Attempt ${attempt} timed out after ${CONFIG.TIMEOUT}ms, retrying...`);
          loadIframe(attempt + 1);
        } else {
          showError(`Connection timed out after ${CONFIG.TIMEOUT}ms. The website may be experiencing issues.`);
        }
      }, CONFIG.TIMEOUT);
      
      // Enhanced iframe load handlers with performance tracking
      iframe.onload = async () => {
        clearTimeout(timeoutId);
        clearProgressive();
        
        perf.mark('Iframe Loaded');
        
        // Wait for preload to complete for optimal performance
        await preloadPromise;
        perf.mark('Preload Synchronized');
        
        // Apply final optimizations
        iframe.style.filter = 'none';
        loader.classList.add('hidden');
        iframe.classList.add('loaded');
        
        perf.mark('Load Complete');
        console.log('✅ DrawDay loaded successfully');
        console.log('📊 Performance Report:', perf.getReport());
        
        // Post load optimizations for better user experience
        requestIdleCallback(() => {
          // Cache the successful URL for faster subsequent loads
          cache.resources.set(fullUrl, Date.now());
        });
      };
      
      iframe.onerror = () => {
        clearTimeout(timeoutId);
        clearProgressive();
        perf.mark(`Attempt ${attempt} Error`);
        
        if (attempt < CONFIG.RETRY_ATTEMPTS) {
          console.log(`❌ Attempt ${attempt} failed, retrying in ${CONFIG.RETRY_DELAY}ms...`);
          setTimeout(() => loadIframe(attempt + 1), CONFIG.RETRY_DELAY);
        } else {
          showError('Failed to connect to DrawDay. Please check your internet connection and try again.');
        }
      };
      
      // Optimize iframe attributes for performance
      iframe.setAttribute('loading', 'eager'); // Prioritize loading
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      
      // Start loading
      perf.mark('Iframe Src Set');
      iframe.src = fullUrl;
      
    } catch (error) {
      perf.mark('Load Error');
      console.error('💥 Error loading iframe:', error);
      showError('An unexpected error occurred. Please try again.', false);
    }
  }

  // Optimized message handling with performance monitoring
  window.addEventListener('message', (event) => {
    const messageStart = performance.now();
    
    // Security check with performance consideration
    const allowedOrigins = [CONFIG.DEV_URL, CONFIG.PROD_URL];
    if (!allowedOrigins.includes(event.origin)) {
      return;
    }
    
    const { type, payload, id } = event.data;
    
    // Performance-optimized message handlers
    const handlers = {
      'openTab': () => {
        if (payload && payload.url) {
          chrome.tabs.create({ url: payload.url });
          return true;
        }
        return false;
      },
      
      'getVersion': () => {
        const version = chrome.runtime.getManifest().version;
        event.source.postMessage({ id, result: version }, event.origin);
        return version;
      },
      
      'setDevMode': () => {
        chrome.storage.local.set({ [CONFIG.STORAGE_KEY]: payload }, () => {
          // Clear cache when dev mode changes
          cache.baseUrl = null;
          cache.baseUrlTimestamp = null;
          event.source.postMessage({ id, result: true }, event.origin);
        });
        return true;
      },
      
      'performanceReport': () => {
        const report = perf.getReport();
        event.source.postMessage({ id, result: report }, event.origin);
        return report;
      }
    };
    
    // Execute handler with performance tracking
    const handler = handlers[type];
    if (handler) {
      try {
        const result = handler();
        const messageTime = performance.now() - messageStart;
        
        if (messageTime > 50) { // Log slow messages
          console.warn(`⚠️ Slow message processing: ${type} took ${messageTime.toFixed(1)}ms`);
        }
      } catch (error) {
        console.error(`❌ Message handler error for ${type}:`, error);
      }
    } else {
      console.log(`❓ Unknown message type: ${type}`);
    }
  });

  // Performance monitoring setup
  if (typeof PerformanceObserver !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.duration > 100) { // Log long tasks
          console.warn(`⚠️ Long task detected: ${entry.name} (${entry.duration.toFixed(1)}ms)`);
        }
      });
    });
    
    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'longtask'] });
    } catch (e) {
      // PerformanceObserver not supported in all contexts
      console.log('PerformanceObserver not available');
    }
  }

  // Initialize with performance tracking
  perf.mark('Initialization Started');
  
  // Start the optimized loading process
  await loadIframe();
  
})();