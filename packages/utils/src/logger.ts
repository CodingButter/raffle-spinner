/**
 * Logger Service
 *
 * @description
 * Production-ready logging service that replaces console statements.
 * In development, logs to console. In production, can be configured
 * to send logs to external services.
 *
 * @module utils/logger
 * @since 1.0.0
 */

/**
 * Log levels for categorizing log messages
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

/**
 * Log context for additional metadata
 */
export interface LogContext {
  /** Component or module name */
  component?: string;
  /** User ID if available */
  userId?: string;
  /** Session ID if available */
  sessionId?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Error object if applicable */
  error?: Error | unknown;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  minLevel: LogLevel;
  /** Whether to log in production */
  enableInProduction: boolean;
  /** External logging service endpoint */
  remoteEndpoint?: string;
}

/**
 * Logger class for structured logging
 */
class Logger {
  private config: LoggerConfig = {
    minLevel: LogLevel.DEBUG,
    enableInProduction: false,
  };

  private isDevelopment = (() => {
    // Check if we're in a browser or Node environment
    if (typeof window !== "undefined") {
      // Browser environment - check for development mode
      return (
        window.location?.hostname === "localhost" ||
        window.location?.hostname === "127.0.0.1"
      );
    }
    // Default to development mode for other environments
    return true;
  })();

  /**
   * Configure the logger
   *
   * @param config - Logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if logging is enabled for a given level
   *
   * @param level - Log level to check
   * @returns Whether logging is enabled
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && !this.config.enableInProduction) {
      return false;
    }

    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.FATAL,
    ];
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);

    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Format log message with context
   *
   * @param level - Log level
   * @param message - Log message
   * @param context - Additional context
   * @returns Formatted log entry
   */
  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const component = context?.component || "Unknown";

    return `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`;
  }

  /**
   * Send log to remote service (if configured)
   *
   * @param level - Log level
   * @param message - Log message
   * @param context - Additional context
   */
  private async sendToRemote(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          message,
          context,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Silently fail remote logging
    }
  }

  /**
   * Log a debug message
   *
   * @param message - Debug message
   * @param context - Additional context
   *
   * @example
   * ```typescript
   * logger.debug('Component mounted', { component: 'UserProfile' });
   * ```
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(this.formatLog(LogLevel.DEBUG, message), context);
    }

    void this.sendToRemote(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   *
   * @param message - Info message
   * @param context - Additional context
   *
   * @example
   * ```typescript
   * logger.info('User logged in', { userId: '123' });
   * ```
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(this.formatLog(LogLevel.INFO, message), context);
    }

    void this.sendToRemote(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   *
   * @param message - Warning message
   * @param context - Additional context
   *
   * @example
   * ```typescript
   * logger.warn('API rate limit approaching', { remaining: 10 });
   * ```
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(this.formatLog(LogLevel.WARN, message), context);
    }

    void this.sendToRemote(LogLevel.WARN, message, context);
  }

  /**
   * Log an error message
   *
   * @param message - Error message
   * @param context - Additional context including error object
   *
   * @example
   * ```typescript
   * logger.error('Failed to save user', { error: err, userId: '123' });
   * ```
   */
  error(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(this.formatLog(LogLevel.ERROR, message), context);
    }

    void this.sendToRemote(LogLevel.ERROR, message, context);
  }

  /**
   * Log a fatal error message
   *
   * @param message - Fatal error message
   * @param context - Additional context including error object
   *
   * @example
   * ```typescript
   * logger.fatal('Database connection lost', { error: err });
   * ```
   */
  fatal(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.FATAL)) return;

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(this.formatLog(LogLevel.FATAL, message), context);
    }

    void this.sendToRemote(LogLevel.FATAL, message, context);
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

/**
 * Default export for convenience
 */
export default logger;
