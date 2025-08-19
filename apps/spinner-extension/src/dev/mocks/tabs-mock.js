/**
 * Chrome Tabs API Mock
 * Browser-compatible implementation without test framework dependencies
 */

// Helper to create a mock function that logs calls
function mockFn(name) {
  const fn = function(...args) {
    console.log(`[Chrome Mock] ${name} called with:`, args);
    return fn.mockImplementation ? fn.mockImplementation(...args) : undefined;
  };
  fn.calls = [];
  fn.mockImplementation = null;
  fn.mockClear = () => { fn.calls = []; };
  return fn;
}

export class ChromeTabsMock {
  constructor() {
    this.tabs = new Map();
    this.nextTabId = 1;
    this.activeTabId = null;
    console.log('[Chrome Mock] Tabs initialized');
  }

  create = (createProperties, callback) => {
    console.log('[Chrome Mock] tabs.create called with:', createProperties);
    const tab = {
      id: this.nextTabId++,
      index: this.tabs.size,
      windowId: 1,
      active: createProperties.active || false,
      pinned: createProperties.pinned || false,
      url: createProperties.url || 'about:blank',
      title: '',
      favIconUrl: '',
      incognito: false,
      selected: false,
      discarded: false,
      autoDiscardable: true,
      groupId: -1,
    };

    this.tabs.set(tab.id, tab);
    
    if (tab.active) {
      this.activeTabId = tab.id;
    }

    if (callback) {
      setTimeout(() => callback(tab), 0);
    }
    
    return Promise.resolve(tab);
  };

  query = (queryInfo, callback) => {
    console.log('[Chrome Mock] tabs.query called with:', queryInfo);
    let results = Array.from(this.tabs.values());

    if (queryInfo.active !== undefined) {
      results = results.filter(tab => tab.active === queryInfo.active);
    }

    if (queryInfo.currentWindow !== undefined && queryInfo.currentWindow) {
      results = results.filter(tab => tab.windowId === 1);
    }

    if (callback) {
      setTimeout(() => callback(results), 0);
    }

    return Promise.resolve(results);
  };

  get = (tabId, callback) => {
    console.log('[Chrome Mock] tabs.get called with tabId:', tabId);
    const tab = this.tabs.get(tabId);
    
    if (callback && tab) {
      setTimeout(() => callback(tab), 0);
    }

    return Promise.resolve(tab || null);
  };

  update = (tabId, updateProperties, callback) => {
    console.log('[Chrome Mock] tabs.update called with:', tabId, updateProperties);
    const tab = this.tabs.get(tabId);
    
    if (tab) {
      if (updateProperties.url !== undefined) {
        tab.url = updateProperties.url;
      }
      if (updateProperties.active !== undefined) {
        tab.active = updateProperties.active;
        if (updateProperties.active) {
          // Deactivate other tabs
          this.tabs.forEach(t => {
            if (t.id !== tabId) {
              t.active = false;
            }
          });
          this.activeTabId = tabId;
        }
      }
      if (updateProperties.pinned !== undefined) {
        tab.pinned = updateProperties.pinned;
      }
    }

    if (callback) {
      setTimeout(() => callback(tab), 0);
    }

    return Promise.resolve(tab || null);
  };

  remove = (tabIds, callback) => {
    console.log('[Chrome Mock] tabs.remove called with:', tabIds);
    const ids = Array.isArray(tabIds) ? tabIds : [tabIds];
    ids.forEach(id => this.tabs.delete(id));

    if (callback) {
      setTimeout(() => callback(), 0);
    }

    return Promise.resolve();
  };

  onUpdated = {
    addListener: mockFn('tabs.onUpdated.addListener'),
    removeListener: mockFn('tabs.onUpdated.removeListener'),
    hasListener: mockFn('tabs.onUpdated.hasListener')
  };

  onCreated = {
    addListener: mockFn('tabs.onCreated.addListener'),
    removeListener: mockFn('tabs.onCreated.removeListener'),
    hasListener: mockFn('tabs.onCreated.hasListener')
  };

  onRemoved = {
    addListener: mockFn('tabs.onRemoved.addListener'),
    removeListener: mockFn('tabs.onRemoved.removeListener'),
    hasListener: mockFn('tabs.onRemoved.hasListener')
  };
}