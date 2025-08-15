/**
 * Performance monitoring utilities
 */

export function measurePageLoadTime() {
  if (typeof window === 'undefined') return;

  // Use Navigation Timing API to measure load time
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
    const tcpTime = perfData.connectEnd - perfData.connectStart;
    const ttfb = perfData.responseStart - perfData.navigationStart;
    const downloadTime = perfData.responseEnd - perfData.responseStart;
    const domInteractive = perfData.domInteractive - perfData.navigationStart;
    const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;

    console.log('=== Page Performance Metrics ===');
    console.log(`Total Page Load Time: ${pageLoadTime}ms`);
    console.log(`DNS Lookup: ${dnsTime}ms`);
    console.log(`TCP Connection: ${tcpTime}ms`);
    console.log(`Time to First Byte (TTFB): ${ttfb}ms`);
    console.log(`Download Time: ${downloadTime}ms`);
    console.log(`DOM Interactive: ${domInteractive}ms`);
    console.log(`DOM Content Loaded: ${domContentLoaded}ms`);

    // Log warning if exceeding 2 second target
    if (pageLoadTime > 2000) {
      console.warn(`⚠️ Page load time exceeds 2s target: ${pageLoadTime}ms`);
    } else {
      console.log(`✅ Page load time within target: ${pageLoadTime}ms`);
    }
  });
}

export function measureLCP() {
  if (typeof window === 'undefined') return;

  // Measure Largest Contentful Paint
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as any;
    if (lastEntry) {
      const time = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
      console.log(`Largest Contentful Paint: ${time}ms`);
    }
  });

  observer.observe({ entryTypes: ['largest-contentful-paint'] });
}

export function measureFID() {
  if (typeof window === 'undefined') return;

  // Measure First Input Delay
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as any;
      const delay = fidEntry.processingStart - fidEntry.startTime;
      console.log(`First Input Delay: ${delay}ms`);
    }
  });

  observer.observe({ entryTypes: ['first-input'] });
}

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  measurePageLoadTime();
  measureLCP();
  measureFID();
}