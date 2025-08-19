/**
 * Chrome Runtime API Mock
 * Browser-compatible implementation without test framework dependencies
 */

// Mock Port class
export class MockPort {
  constructor(name) {
    this.name = name;
    this.messageListeners = new Set();
    this.disconnectListeners = new Set();
    console.log('[Chrome Mock] Port created:', name);
  }

  onMessage = {
    addListener: (listener) => {
      console.log('[Chrome Mock] port.onMessage.addListener called for port:', this.name);
      this.messageListeners.add(listener);
    },
    removeListener: (listener) => {
      console.log('[Chrome Mock] port.onMessage.removeListener called for port:', this.name);
      this.messageListeners.delete(listener);
    }
  };

  onDisconnect = {
    addListener: (listener) => {
      console.log('[Chrome Mock] port.onDisconnect.addListener called for port:', this.name);
      this.disconnectListeners.add(listener);
    },
    removeListener: (listener) => {
      console.log('[Chrome Mock] port.onDisconnect.removeListener called for port:', this.name);
      this.disconnectListeners.delete(listener);
    }
  };

  postMessage = (message) => {
    console.log('[Chrome Mock] port.postMessage called on port:', this.name, 'with:', message);
    // Simulate message delivery to listeners
    setTimeout(() => {
      this.messageListeners.forEach(listener => {
        listener(message);
      });
    }, 0);
  };

  disconnect = () => {
    console.log('[Chrome Mock] port.disconnect called for port:', this.name);
    setTimeout(() => {
      this.disconnectListeners.forEach(listener => {
        listener();
      });
    }, 0);
  };
}

export class ChromeRuntimeMock {
  constructor() {
    this.messageListeners = new Set();
    this.connectListeners = new Set();
    this.ports = new Map();
    this.id = 'mock-extension-id';
    console.log('[Chrome Mock] Runtime initialized');
  }

  getManifest = () => {
    console.log('[Chrome Mock] runtime.getManifest called');
    return {
      name: 'DrawDay Spinner Extension',
      version: '1.0.0',
      manifest_version: 3,
      permissions: ['storage', 'sidePanel'],
    };
  };

  getURL = (path) => {
    const url = `chrome-extension://${this.id}/${path}`;
    console.log('[Chrome Mock] runtime.getURL called with:', path, '→', url);
    return url;
  };

  sendMessage = (message, responseCallback) => {
    console.log('[Chrome Mock] runtime.sendMessage called with:', message);
    // Simulate async message handling
    setTimeout(() => {
      this.messageListeners.forEach(listener => {
        const sendResponse = (response) => {
          console.log('[Chrome Mock] sendResponse called with:', response);
          if (responseCallback) {
            responseCallback(response);
          }
        };
        listener(message, { id: this.id, tab: null }, sendResponse);
      });
    }, 0);
    
    return Promise.resolve();
  };

  onMessage = {
    addListener: (listener) => {
      console.log('[Chrome Mock] runtime.onMessage.addListener called');
      this.messageListeners.add(listener);
    },
    removeListener: (listener) => {
      console.log('[Chrome Mock] runtime.onMessage.removeListener called');
      this.messageListeners.delete(listener);
    },
    hasListener: (listener) => {
      return this.messageListeners.has(listener);
    }
  };

  connect = (connectInfo) => {
    const portName = connectInfo?.name || 'default';
    console.log('[Chrome Mock] runtime.connect called with name:', portName);
    const port = new MockPort(portName);
    this.ports.set(port.name, port);
    
    // Notify connect listeners
    setTimeout(() => {
      this.connectListeners.forEach(listener => {
        listener(port);
      });
    }, 0);
    
    return port;
  };

  onConnect = {
    addListener: (listener) => {
      console.log('[Chrome Mock] runtime.onConnect.addListener called');
      this.connectListeners.add(listener);
    },
    removeListener: (listener) => {
      console.log('[Chrome Mock] runtime.onConnect.removeListener called');
      this.connectListeners.delete(listener);
    },
    hasListener: (listener) => {
      return this.connectListeners.has(listener);
    }
  };

  reload = () => {
    console.log('[Chrome Mock] runtime.reload called - would reload extension');
    window.location.reload();
  };

  openOptionsPage = () => {
    console.log('[Chrome Mock] runtime.openOptionsPage called');
    return Promise.resolve();
  };

  setUninstallURL = (url) => {
    console.log('[Chrome Mock] runtime.setUninstallURL called with:', url);
    return Promise.resolve();
  };

  // Add lastError support
  get lastError() {
    return null; // No errors in mock
  }
}