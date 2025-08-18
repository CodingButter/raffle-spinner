/**
 * Chrome Tabs API Mock
 * 
 * Provides mock implementation of chrome.tabs
 * for testing tab management and side panel operations.
 */

import { vi } from 'vitest';

export class ChromeTabsMock {
  private tabs: Map<number, chrome.tabs.Tab> = new Map();
  private nextTabId = 1;
  private activeTabId: number | null = null;

  create = vi.fn((
    createProperties: chrome.tabs.CreateProperties,
    callback?: (tab: chrome.tabs.Tab) => void
  ) => {
    const tab: chrome.tabs.Tab = {
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
      highlighted: false,
    };

    this.tabs.set(tab.id!, tab);
    
    if (tab.active) {
      this.activeTabId = tab.id!;
    }

    if (callback) {
      callback(tab);
    }
    
    return Promise.resolve(tab);
  });

  query = vi.fn((
    queryInfo: chrome.tabs.QueryInfo,
    callback?: (result: chrome.tabs.Tab[]) => void
  ) => {
    let results = Array.from(this.tabs.values());

    if (queryInfo.active !== undefined) {
      results = results.filter(tab => tab.active === queryInfo.active);
    }

    if (queryInfo.currentWindow !== undefined && queryInfo.currentWindow) {
      results = results.filter(tab => tab.windowId === 1);
    }

    if (queryInfo.url !== undefined) {
      const patterns = Array.isArray(queryInfo.url) ? queryInfo.url : [queryInfo.url];
      results = results.filter(tab => 
        patterns.some(pattern => this.matchPattern(tab.url!, pattern))
      );
    }

    if (callback) {
      callback(results);
    }

    return Promise.resolve(results);
  });

  get = vi.fn((
    tabId: number,
    callback?: (tab: chrome.tabs.Tab) => void
  ) => {
    const tab = this.tabs.get(tabId);
    
    if (callback && tab) {
      callback(tab);
    }

    return Promise.resolve(tab || null);
  });

  update = vi.fn((
    tabId: number,
    updateProperties: chrome.tabs.UpdateProperties,
    callback?: (tab?: chrome.tabs.Tab) => void
  ) => {
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
      callback(tab);
    }

    return Promise.resolve(tab || null);
  });

  remove = vi.fn((
    tabIds: number | number[],
    callback?: () => void
  ) => {
    const ids = Array.isArray(tabIds) ? tabIds : [tabIds];
    ids.forEach(id => this.tabs.delete(id));

    if (callback) {
      callback();
    }

    return Promise.resolve();
  });

  onUpdated = {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
  };

  onCreated = {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
  };

  onRemoved = {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
  };

  // Helper method for pattern matching
  private matchPattern(url: string, pattern: string): boolean {
    if (pattern === '<all_urls>') return true;
    if (pattern === url) return true;
    
    // Simple pattern matching for tests
    const regex = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    return new RegExp(`^${regex}$`).test(url);
  }

  // Test utilities
  _addTab(tab: Partial<chrome.tabs.Tab>) {
    const fullTab: chrome.tabs.Tab = {
      id: tab.id || this.nextTabId++,
      index: tab.index || this.tabs.size,
      windowId: tab.windowId || 1,
      active: tab.active || false,
      pinned: tab.pinned || false,
      url: tab.url || 'about:blank',
      title: tab.title || '',
      favIconUrl: tab.favIconUrl || '',
      incognito: tab.incognito || false,
      selected: tab.selected || false,
      discarded: tab.discarded || false,
      autoDiscardable: tab.autoDiscardable !== false,
      groupId: tab.groupId || -1,
      highlighted: tab.highlighted || false,
    };

    this.tabs.set(fullTab.id!, fullTab);
    return fullTab;
  }

  _getActiveTabId() {
    return this.activeTabId;
  }

  _reset() {
    this.tabs.clear();
    this.nextTabId = 1;
    this.activeTabId = null;
    this.create.mockClear();
    this.query.mockClear();
    this.get.mockClear();
    this.update.mockClear();
    this.remove.mockClear();
  }
}

// Default instance
export const chromeTabsMock = new ChromeTabsMock();