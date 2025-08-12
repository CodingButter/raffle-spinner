/**
 * Notification Context
 * 
 * Provides a centralized notification system for displaying
 * toast messages, alerts, and confirmations.
 * 
 * @example
 * ```tsx
 * // Wrap app with provider
 * <NotificationProvider>
 *   <App />
 * </NotificationProvider>
 * 
 * // Use in components
 * const { showNotification, showError } = useNotifications();
 * showNotification('Success!', 'success');
 * ```
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Notification types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification object interface
 */
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Notification context value interface
 */
interface NotificationContextValue {
  /** Current notifications */
  notifications: Notification[];
  /** Show a notification */
  showNotification: (
    message: string,
    type?: NotificationType,
    options?: Partial<Omit<Notification, 'id' | 'message' | 'type'>>
  ) => void;
  /** Show success notification */
  showSuccess: (message: string, title?: string) => void;
  /** Show error notification */
  showError: (message: string, title?: string) => void;
  /** Show warning notification */
  showWarning: (message: string, title?: string) => void;
  /** Show info notification */
  showInfo: (message: string, title?: string) => void;
  /** Remove a notification */
  dismissNotification: (id: string) => void;
  /** Clear all notifications */
  clearNotifications: () => void;
}

/**
 * Default notification duration in milliseconds
 */
const DEFAULT_DURATION = 5000;

/**
 * Notification Context
 */
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

/**
 * Notification Provider Props
 */
interface NotificationProviderProps {
  children: ReactNode;
  /** Maximum number of notifications to display */
  maxNotifications?: number;
  /** Default duration for notifications */
  defaultDuration?: number;
}

/**
 * Generate unique ID for notifications
 */
function generateId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Notification Provider Component
 * 
 * Manages notification state and provides methods to show/dismiss notifications.
 * Automatically handles notification lifecycle and cleanup.
 */
export function NotificationProvider({
  children,
  maxNotifications = 5,
  defaultDuration = DEFAULT_DURATION,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Add a new notification
   */
  const addNotification = useCallback(
    (notification: Notification) => {
      setNotifications((prev) => {
        // Limit number of notifications
        const updated = [...prev, notification];
        if (updated.length > maxNotifications) {
          return updated.slice(-maxNotifications);
        }
        return updated;
      });

      // Auto-dismiss after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          dismissNotification(notification.id);
        }, notification.duration || defaultDuration);
      }
    },
    [maxNotifications, defaultDuration]
  );

  /**
   * Show a notification with options
   */
  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType = 'info',
      options?: Partial<Omit<Notification, 'id' | 'message' | 'type'>>
    ) => {
      const notification: Notification = {
        id: generateId(),
        message,
        type,
        ...options,
      };
      addNotification(notification);
    },
    [addNotification]
  );

  /**
   * Convenience methods for different notification types
   */
  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showNotification(message, 'success', { title: title || 'Success' });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showNotification(message, 'error', { 
        title: title || 'Error',
        duration: 0, // Errors don't auto-dismiss by default
      });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showNotification(message, 'warning', { title: title || 'Warning' });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      showNotification(message, 'info', { title: title || 'Info' });
    },
    [showNotification]
  );

  /**
   * Dismiss a specific notification
   */
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextValue = {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to access notification context
 * 
 * @throws Error if used outside of NotificationProvider
 * @returns Notification context value
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}