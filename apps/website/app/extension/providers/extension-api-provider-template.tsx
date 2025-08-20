/**
 * ExtensionAPIProvider Template - Architecture by David Miller
 * 
 * This provider creates a bridge between the website (running in iframe)
 * and the Chrome Extension APIs via postMessage communication.
 * 
 * USAGE:
 * 1. Wrap your extension pages with this provider
 * 2. Use useExtensionAPI() hook to access Chrome APIs
 * 3. All API calls return Promises that resolve when extension responds
 */

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';

interface ExtensionAPI {
  storage: {
    get: (keys?: string | string[] | null) => Promise<Record<string, any>>;
    set: (items: Record<string, any>) => Promise<boolean>;
    remove: (keys: string | string[]) => Promise<boolean>;
    clear: () => Promise<boolean>;
  };
  tabs: {
    create: (options: { url: string; active?: boolean }) => Promise<any>;
  };
  runtime: {
    getManifest: () => Promise<any>;
  };
  isAvailable: boolean;
}

const ExtensionAPIContext = createContext<ExtensionAPI | null>(null);

export function ExtensionAPIProvider({ children }: { children: React.ReactNode }) {
  const pendingRequests = useRef<Map<string, { resolve: Function; reject: Function }>>(new Map());
  const isExtension = useRef(false);

  // Check if we're running inside extension iframe
  useEffect(() => {
    try {
      // Check if parent exists and is different from current window
      isExtension.current = window.parent !== window && window.parent !== null;
    } catch (e) {
      isExtension.current = false;
    }
  }, []);

  // Listen for responses from extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      const allowedOrigins = ['http://localhost:3000', 'https://www.drawday.app'];
      if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
        return;
      }

      const { id, result, error } = event.data;
      
      // Find pending request
      const pending = pendingRequests.current.get(id);
      if (pending) {
        if (error) {
          pending.reject(new Error(error));
        } else {
          pending.resolve(result);
        }
        pendingRequests.current.delete(id);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Helper to send message to extension
  const sendMessage = useCallback((type: string, payload?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!isExtension.current) {
        reject(new Error('Not running in extension context'));
        return;
      }

      const id = crypto.randomUUID();
      const timeoutId = setTimeout(() => {
        pendingRequests.current.delete(id);
        reject(new Error(`Request timeout: ${type}`));
      }, 5000);

      pendingRequests.current.set(id, {
        resolve: (result: any) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (error: Error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      });

      window.parent.postMessage({ type, payload, id }, '*');
    });
  }, []);

  // Create API object
  const api: ExtensionAPI = {
    storage: {
      get: (keys) => sendMessage('storage.get', { keys }),
      set: (items) => sendMessage('storage.set', { items }),
      remove: (keys) => sendMessage('storage.remove', { keys }),
      clear: () => sendMessage('storage.clear')
    },
    tabs: {
      create: (options) => sendMessage('tabs.create', options)
    },
    runtime: {
      getManifest: () => sendMessage('runtime.getManifest')
    },
    isAvailable: isExtension.current
  };

  return (
    <ExtensionAPIContext.Provider value={api}>
      {children}
    </ExtensionAPIContext.Provider>
  );
}

export function useExtensionAPI() {
  const context = useContext(ExtensionAPIContext);
  if (!context) {
    throw new Error('useExtensionAPI must be used within ExtensionAPIProvider');
  }
  return context;
}

// Example hook for storage operations
export function useExtensionStorage<T = any>(key: string, defaultValue?: T) {
  const { storage, isAvailable } = useExtensionAPI();
  const [value, setValue] = React.useState<T | undefined>(defaultValue);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  // Load initial value
  React.useEffect(() => {
    if (!isAvailable) {
      setLoading(false);
      return;
    }

    storage.get(key)
      .then(result => {
        setValue(result[key] ?? defaultValue);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [key, isAvailable]);

  // Update function
  const update = React.useCallback(async (newValue: T) => {
    if (!isAvailable) return;
    
    try {
      await storage.set({ [key]: newValue });
      setValue(newValue);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [key, isAvailable]);

  return { value, update, loading, error };
}