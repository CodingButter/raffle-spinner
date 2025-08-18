/**
 * Session Persistence Hook
 *
 * Purpose: Custom hook to handle automatic saving and restoring of spinner session state
 * across page refreshes and extension reloads. Provides debounced saving to prevent
 * excessive storage operations.
 *
 * SRS Reference:
 * - FR-2.1: Side Panel Interface (session state persistence)
 * - Data Layer: Session persistence abstraction
 */

import { useEffect, useCallback, useRef } from 'react';
import { storage } from '@raffle-spinner/storage';
import { SpinnerSession, SessionWinner } from '@raffle-spinner/storage';

// Session timeout: 24 hours
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000;

// Debounce delay for saving session state (500ms)
const SAVE_DEBOUNCE_MS = 500;

interface UseSessionPersistenceOptions {
  onSessionRestore?: (session: SpinnerSession) => void;
  onSessionExpired?: () => void;
  onError?: (error: string) => void;
}

// Define local Winner type to match the UI component interface
interface Winner {
  firstName: string;
  lastName: string;
  ticketNumber: string;
  competition: string;
  timestamp: number;
}

interface SessionState {
  selectedCompetitionId?: string;
  sessionWinners: Winner[];
  currentTicketNumber: string;
  isSpinning: boolean;
  currentWinner?: {
    firstName: string;
    lastName: string;
    ticketNumber: string;
  };
  spinTarget: string;
}

export function useSessionPersistence(options: UseSessionPersistenceOptions = {}) {
  const { onSessionRestore, onSessionExpired, onError } = options;
  const saveTimeoutRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);


  // Helper function to convert SessionWinner to Winner for UI
  const sessionWinnerToWinner = (sessionWinner: SessionWinner): Winner => ({
    firstName: sessionWinner.firstName,
    lastName: sessionWinner.lastName,
    ticketNumber: sessionWinner.ticketNumber,
    competition: sessionWinner.competition,
    timestamp: sessionWinner.timestamp,
  });

  // Initialize or restore session on mount
  const initializeSession = useCallback(async () => {
    try {
      const existingSession = await storage.getSession();
      
      if (existingSession) {
        // Check if session has expired
        const now = Date.now();
        const sessionAge = now - existingSession.sessionStartTime;
        
        if (sessionAge > SESSION_TIMEOUT_MS) {
          // Session expired, clear it
          await storage.clearSession();
          onSessionExpired?.();
          sessionStartTimeRef.current = now;
        } else {
          // Valid session, restore it - convert SessionWinner to Winner for UI
          const restoredSession = {
            ...existingSession,
            sessionWinners: existingSession.sessionWinners.map(sessionWinnerToWinner),
          };
          onSessionRestore?.(restoredSession);
          sessionStartTimeRef.current = existingSession.sessionStartTime;
        }
      } else {
        // No existing session, start a new one
        sessionStartTimeRef.current = Date.now();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown session error';
      onError?.(`Failed to initialize session: ${errorMessage}`);
      sessionStartTimeRef.current = Date.now();
    }
  }, [onSessionRestore, onSessionExpired, onError]);

  // Debounced save function
  const debouncedSave = useCallback((sessionState: SessionState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!sessionStartTimeRef.current) {
        sessionStartTimeRef.current = Date.now();
      }

      const session: SpinnerSession = {
        ...sessionState,
        sessionStartTime: sessionStartTimeRef.current,
        lastActivity: Date.now(),
      };

      try {
        await storage.saveSession(session);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown save error';
        onError?.(`Failed to save session: ${errorMessage}`);
      }
    }, SAVE_DEBOUNCE_MS);
  }, [onError]);

  // Save session state
  const saveSession = useCallback((sessionState: SessionState) => {
    debouncedSave(sessionState);
  }, [debouncedSave]);

  // Clear session
  const clearSession = useCallback(async () => {
    try {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      await storage.clearSession();
      sessionStartTimeRef.current = null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown clear error';
      onError?.(`Failed to clear session: ${errorMessage}`);
    }
  }, [onError]);

  // Get session age in milliseconds
  const getSessionAge = useCallback(() => {
    if (!sessionStartTimeRef.current) return 0;
    return Date.now() - sessionStartTimeRef.current;
  }, []);

  // Check if session is near expiry (within 1 hour)
  const isSessionNearExpiry = useCallback(() => {
    const age = getSessionAge();
    return age > (SESSION_TIMEOUT_MS - 60 * 60 * 1000); // 1 hour before expiry
  }, [getSessionAge]);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
    
    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [initializeSession]);

  return {
    saveSession,
    clearSession,
    initializeSession,
    getSessionAge,
    isSessionNearExpiry,
  };
}