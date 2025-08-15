/**
 * useWinnerCalculationWorker Hook
 * 
 * React hook for offloading winner calculation to a WebWorker
 * Maintains 60fps performance during heavy calculations
 */

import { useEffect, useRef, useCallback } from 'react';
import type { Participant } from '@raffle-spinner/storage';
import type { 
  WinnerCalculationRequest, 
  WinnerCalculationResponse 
} from '../workers/winnerCalculation.worker';

export interface UseWinnerCalculationWorkerOptions {
  enabled?: boolean;
  onResult?: (result: WinnerCalculationResponse) => void;
  onError?: (error: Error) => void;
}

export function useWinnerCalculationWorker(options: UseWinnerCalculationWorkerOptions = {}) {
  const { enabled = true, onResult, onError } = options;
  const workerRef = useRef<Worker | null>(null);
  const pendingRequestRef = useRef<((result: WinnerCalculationResponse) => void) | null>(null);

  // Initialize worker
  useEffect(() => {
    if (!enabled || typeof Worker === 'undefined') {
      return;
    }

    try {
      // Create worker with inline code for better bundling
      const workerCode = `
        // Normalize ticket number for comparison
        function normalizeTicketNumber(ticketNumber) {
          return ticketNumber.replace(/\\D/g, '').replace(/^0+/, '') || '0';
        }

        // Sort participants by ticket number
        function sortParticipantsByTicket(participants) {
          return [...participants].sort((a, b) => {
            const aNum = parseInt(a.ticketNumber.replace(/\\D/g, '')) || 0;
            const bNum = parseInt(b.ticketNumber.replace(/\\D/g, '')) || 0;
            return aNum - bNum;
          });
        }

        // Create winner-centered subset
        function createWinnerSubset(sortedParticipants, targetTicketNumber, subsetSize) {
          if (sortedParticipants.length === 0) {
            return { subset: [], winnerIndex: -1 };
          }

          const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
          const winnerIndex = sortedParticipants.findIndex(
            (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
          );

          if (winnerIndex === -1) {
            const subset = sortedParticipants.slice(0, Math.min(subsetSize, sortedParticipants.length));
            return { subset, winnerIndex: -1 };
          }

          if (sortedParticipants.length <= subsetSize) {
            return { subset: [...sortedParticipants], winnerIndex };
          }

          const subset = [];
          const halfSize = Math.floor(subsetSize / 2);
          const startIdx = winnerIndex - halfSize;

          if (startIdx < 0) {
            const wrapStartIdx = sortedParticipants.length + startIdx;
            const fromEnd = sortedParticipants.slice(wrapStartIdx);
            const fromStart = sortedParticipants.slice(0, winnerIndex + halfSize);
            subset.push(...fromEnd, ...fromStart);
          } else if (startIdx + subsetSize > sortedParticipants.length) {
            const fromMiddle = sortedParticipants.slice(startIdx);
            const fromBeginning = sortedParticipants.slice(0, subsetSize - fromMiddle.length);
            subset.push(...fromMiddle, ...fromBeginning);
          } else {
            subset.push(...sortedParticipants.slice(startIdx, startIdx + subsetSize));
          }

          const newWinnerIndex = subset.findIndex(
            (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
          );

          return { subset, winnerIndex: newWinnerIndex };
        }

        // Handle messages from main thread
        self.addEventListener('message', (event) => {
          const { type, participants, targetTicketNumber, subsetSize } = event.data;

          if (type === 'CALCULATE_WINNER') {
            const startTime = performance.now();

            const sortedParticipants = sortParticipantsByTicket(participants);
            const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
            const winner = participants.find(
              (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
            ) || null;

            const { subset, winnerIndex } = createWinnerSubset(
              sortedParticipants,
              targetTicketNumber,
              subsetSize
            );

            const calculationTime = performance.now() - startTime;

            self.postMessage({
              type: 'WINNER_RESULT',
              winner,
              winnerIndex,
              subset,
              stats: {
                calculationTime,
                participantCount: participants.length,
                subsetSize: subset.length,
              },
            });
          }
        });
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.addEventListener('message', (event: MessageEvent<WinnerCalculationResponse>) => {
        if (event.data.type === 'WINNER_RESULT') {
          onResult?.(event.data);
          
          if (pendingRequestRef.current) {
            pendingRequestRef.current(event.data);
            pendingRequestRef.current = null;
          }
        }
      });

      worker.addEventListener('error', (error) => {
        console.error('Worker error:', error);
        onError?.(new Error(`Worker error: ${error.message}`));
      });

      workerRef.current = worker;

      // Cleanup
      return () => {
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        workerRef.current = null;
      };
    } catch (error) {
      console.error('Failed to create worker:', error);
      onError?.(error as Error);
    }
  }, [enabled, onResult, onError]);

  // Calculate winner using worker
  const calculateWinner = useCallback(
    async (
      participants: Participant[],
      targetTicketNumber: string,
      subsetSize: number = 100
    ): Promise<WinnerCalculationResponse> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          // Fallback to synchronous calculation
          const normalizedTarget = targetTicketNumber.replace(/\D/g, '').replace(/^0+/, '') || '0';
          const winner = participants.find(
            (p) => (p.ticketNumber.replace(/\D/g, '').replace(/^0+/, '') || '0') === normalizedTarget
          ) || null;

          const result: WinnerCalculationResponse = {
            type: 'WINNER_RESULT',
            winner,
            winnerIndex: winner ? participants.indexOf(winner) : -1,
            subset: participants.slice(0, Math.min(subsetSize, participants.length)),
            stats: {
              calculationTime: 0,
              participantCount: participants.length,
              subsetSize: Math.min(subsetSize, participants.length),
            },
          };

          resolve(result);
          return;
        }

        // Set up promise resolver
        pendingRequestRef.current = resolve;

        // Send request to worker
        const request: WinnerCalculationRequest = {
          type: 'CALCULATE_WINNER',
          participants,
          targetTicketNumber,
          subsetSize,
        };

        workerRef.current.postMessage(request);

        // Timeout after 5 seconds
        setTimeout(() => {
          if (pendingRequestRef.current === resolve) {
            pendingRequestRef.current = null;
            reject(new Error('Worker calculation timed out'));
          }
        }, 5000);
      });
    },
    []
  );

  // Check if worker is available
  const isWorkerAvailable = useCallback(() => {
    return workerRef.current !== null && typeof Worker !== 'undefined';
  }, []);

  return {
    calculateWinner,
    isWorkerAvailable,
  };
}