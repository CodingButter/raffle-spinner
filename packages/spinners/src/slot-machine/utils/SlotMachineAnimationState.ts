/**
 * SlotMachineAnimationState Utility
 * 
 * Manages animation state and callbacks for the slot machine wheel.
 * Optimized for performance with minimal re-renders and efficient state tracking.
 * 
 * @module SlotMachineAnimationState
 * @category Animation Utils
 */

import { Participant } from '@raffle-spinner/storage';
import { normalizeTicketNumber, logger } from '@drawday/utils';

/**
 * Animation state configuration
 */
export interface AnimationStateConfig {
  onSpinComplete: (winner: Participant) => void;
  onError?: (error: string) => void;
  onPositionUpdate: (position: number) => void;
  onMaxVelocity?: () => number;
  getParticipants?: () => Participant[];
}

/**
 * Animation state tracking
 */
export interface AnimationState {
  isSpinning: boolean;
  hasTriggeredMaxVelocity: boolean;
  hasRecalculatedTarget: boolean;
  startTime: number;
  winner: Participant | null;
}

/**
 * Animation state manager class for efficient state tracking
 */
export class SlotMachineAnimationStateManager {
  private animationRef: number | null = null;
  private state: AnimationState = {
    isSpinning: false,
    hasTriggeredMaxVelocity: false,
    hasRecalculatedTarget: false,
    startTime: 0,
    winner: null,
  };

  private config: AnimationStateConfig;

  constructor(config: AnimationStateConfig) {
    this.config = config;
  }

  /**
   * Updates the configuration (useful for prop changes)
   */
  updateConfig(config: AnimationStateConfig): void {
    this.config = config;
  }

  /**
   * Starts animation with initial winner
   */
  startAnimation(initialWinner: Participant): void {
    this.state = {
      isSpinning: true,
      hasTriggeredMaxVelocity: false,
      hasRecalculatedTarget: false,
      startTime: performance.now(),
      winner: initialWinner,
    };
  }

  /**
   * Stops animation and resets state
   */
  stopAnimation(): void {
    if (this.animationRef) {
      cancelAnimationFrame(this.animationRef);
      this.animationRef = null;
    }
    
    this.state.isSpinning = false;
  }

  /**
   * Handles max velocity trigger and subset swap
   */
  handleMaxVelocity(currentPosition: number): boolean {
    if (this.state.hasTriggeredMaxVelocity || !this.config.onMaxVelocity) {
      return false;
    }

    this.state.hasTriggeredMaxVelocity = true;
    const newWinnerIndex = this.config.onMaxVelocity();

    if (typeof newWinnerIndex === 'number' && newWinnerIndex >= 0) {
      this.updateWinnerAfterSwap(newWinnerIndex);
      return true;
    }

    return false;
  }

  /**
   * Updates winner reference after subset swap
   */
  private updateWinnerAfterSwap(newWinnerIndex: number): void {
    if (!this.config.getParticipants || this.state.hasRecalculatedTarget) {
      return;
    }

    this.state.hasRecalculatedTarget = true;
    const updatedParticipants = this.config.getParticipants();
    
    // Winner is always at index 0 in our new subset structure
    const actualWinner = updatedParticipants[0];
    if (actualWinner) {
      this.state.winner = actualWinner;
      
      logger.debug('Animation state: Winner updated after subset swap', {
        component: 'SlotMachineAnimationState',
        metadata: {
          winnerIndex: 0,
          winnerTicket: actualWinner.ticketNumber,
          subsetSize: updatedParticipants.length,
        },
      });
    }
  }

  /**
   * Handles animation frame updates
   */
  updateAnimation(
    currentTime: number,
    progress: number,
    position: number,
    isComplete: boolean
  ): void {
    // Update position
    this.config.onPositionUpdate(position);

    if (isComplete) {
      this.completeAnimation();
    } else {
      // Continue animation
      this.scheduleNextFrame((time) => 
        this.config.onPositionUpdate ? this.updateAnimation(time, progress, position, isComplete) : undefined
      );
    }
  }

  /**
   * Completes animation and triggers callback
   */
  private completeAnimation(): void {
    this.state.isSpinning = false;
    this.animationRef = null;

    if (this.state.winner) {
      this.config.onSpinComplete(this.state.winner);
    } else {
      this.config.onError?.('No winner found after animation completion');
    }
  }

  /**
   * Schedules next animation frame
   */
  scheduleNextFrame(callback: (time: number) => void): void {
    this.animationRef = requestAnimationFrame(callback);
  }

  /**
   * Handles animation errors
   */
  handleError(error: string): void {
    this.stopAnimation();
    this.resetState();
    this.config.onError?.(error);
  }

  /**
   * Resets state for new animation
   */
  resetState(): void {
    this.state = {
      isSpinning: false,
      hasTriggeredMaxVelocity: false,
      hasRecalculatedTarget: false,
      startTime: 0,
      winner: null,
    };
  }

  /**
   * Gets current animation state (read-only)
   */
  getState(): Readonly<AnimationState> {
    return { ...this.state };
  }

  /**
   * Checks if animation is currently running
   */
  isAnimating(): boolean {
    return this.state.isSpinning;
  }

  /**
   * Gets elapsed time since animation start
   */
  getElapsedTime(): number {
    return this.state.isSpinning ? performance.now() - this.state.startTime : 0;
  }
}

/**
 * Finds winner participant by ticket number
 * 
 * @param participants - Participant array to search
 * @param targetTicketNumber - Target ticket number
 * @returns Winner participant or undefined
 */
export function findWinnerParticipant(
  participants: Participant[],
  targetTicketNumber: string
): Participant | undefined {
  const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
  return participants.find(
    (p) => normalizeTicketNumber(p.ticketNumber) === normalizedTarget
  );
}

/**
 * Validates animation completion state
 * 
 * @param finalPosition - Final animation position
 * @param participants - Current participants
 * @param targetTicketNumber - Expected winner ticket
 * @param itemHeight - Height of each item
 * @returns Validation result
 */
export function validateAnimationCompletion(
  finalPosition: number,
  participants: Participant[],
  targetTicketNumber: string,
  itemHeight: number
): {
  isCorrect: boolean;
  actualCenterTicket: string;
  expectedTicket: string;
  centerIndex: number;
} {
  const wheelCircumference = participants.length * itemHeight;
  const normalizedPosition = ((finalPosition % wheelCircumference) + wheelCircumference) % wheelCircumference;
  
  // Calculate which participant is at the center
  const topIndex = Math.floor(normalizedPosition / itemHeight);
  const centerIndex = (topIndex + 2) % participants.length; // Center is 2 items down from top
  const actualCenterTicket = participants[centerIndex]?.ticketNumber || '';
  
  // Normalize for comparison
  const normalizedTarget = normalizeTicketNumber(targetTicketNumber);
  const normalizedCenter = normalizeTicketNumber(actualCenterTicket);
  
  return {
    isCorrect: normalizedCenter === normalizedTarget,
    actualCenterTicket,
    expectedTicket: targetTicketNumber,
    centerIndex,
  };
}