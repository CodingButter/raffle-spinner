/**
 * Chrome Runtime API Mock
 * 
 * Provides a complete mock implementation of chrome.runtime
 * for message passing, extension info, and lifecycle events.
 */

import { vi } from 'vitest';

export class ChromeRuntimeMock {
  private messageListeners: Set<Function> = new Set();
  private connectListeners: Set<Function> = new Set();
  private ports: Map<string, MockPort> = new Map();
  
  id = 'mock-extension-id';
  
  getManifest = vi.fn(() => ({
    name: 'DrawDay Spinner Extension',
    version: '1.0.0',
    manifest_version: 3,
    permissions: ['storage', 'sidePanel'],
  }));

  getURL = vi.fn((path: string) => {
    return `chrome-extension://${this.id}/${path}`;
  });

  sendMessage = vi.fn((
    message: any,
    responseCallback?: (response: any) => void
  ) => {
    // Simulate async message handling
    setTimeout(() => {
      this.messageListeners.forEach(listener => {
        const sendResponse = (response: any) => {
          if (responseCallback) {
            responseCallback(response);
          }
        };
        listener(message, { id: this.id, tab: null }, sendResponse);
      });
    }, 0);
    
    return Promise.resolve();
  });

  onMessage = {
    addListener: vi.fn((listener: Function) => {
      this.messageListeners.add(listener);
    }),
    removeListener: vi.fn((listener: Function) => {
      this.messageListeners.delete(listener);
    }),
    hasListener: vi.fn((listener: Function) => {
      return this.messageListeners.has(listener);
    }),
  };

  connect = vi.fn((connectInfo?: { name?: string }) => {
    const port = new MockPort(connectInfo?.name || 'default');
    this.ports.set(port.name, port);
    
    // Notify connect listeners
    setTimeout(() => {
      this.connectListeners.forEach(listener => {
        listener(port);
      });
    }, 0);
    
    return port;
  });

  onConnect = {
    addListener: vi.fn((listener: Function) => {
      this.connectListeners.add(listener);
    }),
    removeListener: vi.fn((listener: Function) => {
      this.connectListeners.delete(listener);
    }),
    hasListener: vi.fn((listener: Function) => {
      return this.connectListeners.has(listener);
    }),
  };

  reload = vi.fn();

  openOptionsPage = vi.fn(() => Promise.resolve());

  setUninstallURL = vi.fn((_url: string) => Promise.resolve());

  // Test utilities
  _simulateMessage(message: any, sender?: any) {
    const senderInfo = sender || { id: this.id, tab: null };
    this.messageListeners.forEach(listener => {
      listener(message, senderInfo, vi.fn());
    });
  }

  _getPort(name: string) {
    return this.ports.get(name);
  }

  _reset() {
    this.messageListeners.clear();
    this.connectListeners.clear();
    this.ports.clear();
    this.getManifest.mockClear();
    this.getURL.mockClear();
    this.sendMessage.mockClear();
    this.reload.mockClear();
    this.openOptionsPage.mockClear();
  }
}

export class MockPort {
  name: string;
  onMessage = {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };
  onDisconnect = {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };
  postMessage = vi.fn();
  disconnect = vi.fn();

  constructor(name: string) {
    this.name = name;
  }
}

// Default instance
export const chromeRuntimeMock = new ChromeRuntimeMock();