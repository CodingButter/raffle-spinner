/**
 * Chrome Storage API Mock
 * Browser-compatible implementation without test framework dependencies
 */

export class ChromeStorageMock {
  constructor(initialData = {}) {
    this.storage = new Map(Object.entries(initialData));
    this.listeners = new Set();
    console.log('[Chrome Mock] Storage initialized with:', initialData);
  }

  get = (keys, callback) => {
    console.log('[Chrome Mock] storage.get called with keys:', keys);
    const result = {};
    
    if (keys === null) {
      // Return all storage
      this.storage.forEach((value, key) => {
        result[key] = value;
      });
    } else if (typeof keys === 'string') {
      const value = this.storage.get(keys);
      if (value !== undefined) {
        result[keys] = value;
      }
    } else if (Array.isArray(keys)) {
      keys.forEach(key => {
        const value = this.storage.get(key);
        if (value !== undefined) {
          result[key] = value;
        }
      });
    } else if (typeof keys === 'object' && !Array.isArray(keys)) {
      // Handle object with defaults
      Object.entries(keys).forEach(([key, defaultValue]) => {
        const value = this.storage.get(key);
        result[key] = value !== undefined ? value : defaultValue;
      });
    }

    console.log('[Chrome Mock] storage.get returning:', result);
    
    if (callback) {
      // Simulate async callback
      setTimeout(() => callback(result), 0);
    }
    return Promise.resolve(result);
  };

  set = (items, callback) => {
    console.log('[Chrome Mock] storage.set called with:', items);
    const changes = {};
    
    Object.entries(items).forEach(([key, value]) => {
      const oldValue = this.storage.get(key);
      this.storage.set(key, value);
      changes[key] = { oldValue, newValue: value };
    });

    console.log('[Chrome Mock] storage.set changes:', changes);

    // Notify listeners
    setTimeout(() => {
      this.listeners.forEach(listener => {
        listener(changes, 'local');
      });
    }, 0);

    if (callback) {
      setTimeout(() => callback(), 0);
    }
    return Promise.resolve();
  };

  remove = (keys, callback) => {
    console.log('[Chrome Mock] storage.remove called with:', keys);
    const keysArray = Array.isArray(keys) ? keys : [keys];
    const changes = {};
    
    keysArray.forEach(key => {
      const oldValue = this.storage.get(key);
      if (oldValue !== undefined) {
        this.storage.delete(key);
        changes[key] = { oldValue, newValue: undefined };
      }
    });

    console.log('[Chrome Mock] storage.remove changes:', changes);

    // Notify listeners
    setTimeout(() => {
      this.listeners.forEach(listener => {
        listener(changes, 'local');
      });
    }, 0);

    if (callback) {
      setTimeout(() => callback(), 0);
    }
    return Promise.resolve();
  };

  clear = (callback) => {
    console.log('[Chrome Mock] storage.clear called');
    const changes = {};
    
    this.storage.forEach((value, key) => {
      changes[key] = { oldValue: value, newValue: undefined };
    });
    
    this.storage.clear();

    console.log('[Chrome Mock] storage.clear changes:', changes);

    // Notify listeners
    setTimeout(() => {
      this.listeners.forEach(listener => {
        listener(changes, 'local');
      });
    }, 0);

    if (callback) {
      setTimeout(() => callback(), 0);
    }
    return Promise.resolve();
  };

  onChanged = {
    addListener: (listener) => {
      console.log('[Chrome Mock] storage.onChanged.addListener called');
      this.listeners.add(listener);
    },
    removeListener: (listener) => {
      console.log('[Chrome Mock] storage.onChanged.removeListener called');
      this.listeners.delete(listener);
    },
    hasListener: (listener) => {
      return this.listeners.has(listener);
    }
  };

  // Utility methods for dev environment
  _getData() {
    return Object.fromEntries(this.storage);
  }

  _setData(data) {
    console.log('[Chrome Mock] _setData called with:', data);
    this.storage.clear();
    Object.entries(data).forEach(([key, value]) => {
      this.storage.set(key, value);
    });
  }

  _reset() {
    console.log('[Chrome Mock] _reset called');
    this.storage.clear();
    this.listeners.clear();
  }
}