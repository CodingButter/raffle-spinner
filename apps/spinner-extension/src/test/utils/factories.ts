/**
 * Test Data Factories
 * 
 * Provides factory functions for generating test data
 * with realistic variations for comprehensive testing.
 */

import type { Competition, Participant, Winner, Session } from '@raffle-spinner/storage';
import type { SpinnerSettings } from '@raffle-spinner/storage';

/**
 * Factory for creating participants
 */
export class ParticipantFactory {
  private static counter = 0;

  static create(overrides?: Partial<Participant>): Participant {
    this.counter++;
    return {
      firstName: `First${this.counter}`,
      lastName: `Last${this.counter}`,
      ticketNumber: `T${String(this.counter).padStart(4, '0')}`,
      ...overrides,
    };
  }

  static createMany(count: number, overrides?: Partial<Participant>[]): Participant[] {
    return Array.from({ length: count }, (_, i) => 
      this.create(overrides?.[i] || {})
    );
  }

  static createWithPattern(pattern: {
    firstNamePrefix?: string;
    lastNamePrefix?: string;
    ticketPrefix?: string;
    startNumber?: number;
  }, count: number): Participant[] {
    const { 
      firstNamePrefix = 'First',
      lastNamePrefix = 'Last',
      ticketPrefix = 'T',
      startNumber = 1,
    } = pattern;

    return Array.from({ length: count }, (_, i) => ({
      firstName: `${firstNamePrefix}${startNumber + i}`,
      lastName: `${lastNamePrefix}${startNumber + i}`,
      ticketNumber: `${ticketPrefix}${String(startNumber + i).padStart(4, '0')}`,
    }));
  }

  static reset() {
    this.counter = 0;
  }
}

/**
 * Factory for creating competitions
 */
export class CompetitionFactory {
  private static counter = 0;

  static create(overrides?: Partial<Competition>): Competition {
    this.counter++;
    const now = new Date().toISOString();
    
    return {
      id: `comp-${this.counter}-${Date.now()}`,
      name: `Competition ${this.counter}`,
      participants: ParticipantFactory.createMany(10),
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  static createWithParticipants(participantCount: number): Competition {
    return this.create({
      participants: ParticipantFactory.createMany(participantCount),
    });
  }

  static createEmpty(name?: string): Competition {
    return this.create({
      name: name || 'Empty Competition',
      participants: [],
    });
  }

  static reset() {
    this.counter = 0;
  }
}

/**
 * Factory for creating winners
 */
export class WinnerFactory {
  private static counter = 0;

  static create(overrides?: Partial<Winner>): Winner {
    this.counter++;
    const participant = ParticipantFactory.create();
    
    return {
      ...participant,
      competitionId: `comp-${this.counter}`,
      competitionName: `Competition ${this.counter}`,
      timestamp: new Date().toISOString(),
      sessionId: `session-${this.counter}`,
      position: this.counter,
      ...overrides,
    };
  }

  static createMany(count: number, competitionId?: string): Winner[] {
    return Array.from({ length: count }, (_, i) => 
      this.create({
        competitionId: competitionId || `comp-${Date.now()}`,
        position: i + 1,
      })
    );
  }

  static reset() {
    this.counter = 0;
  }
}

/**
 * Factory for creating sessions
 */
export class SessionFactory {
  private static counter = 0;

  static create(overrides?: Partial<Session>): Session {
    this.counter++;
    const now = new Date().toISOString();
    
    return {
      id: `session-${this.counter}-${Date.now()}`,
      competitionId: `comp-${this.counter}`,
      startedAt: now,
      winners: [],
      ...overrides,
    };
  }

  static createWithWinners(winnerCount: number): Session {
    const session = this.create();
    return {
      ...session,
      winners: WinnerFactory.createMany(winnerCount, session.competitionId),
    };
  }

  static reset() {
    this.counter = 0;
  }
}

/**
 * Factory for creating spinner settings
 */
export class SettingsFactory {
  static create(overrides?: Partial<SpinnerSettings>): SpinnerSettings {
    return {
      minSpinDuration: 3,
      maxSpinDuration: 5,
      decelerationRate: 0.98,
      soundEnabled: true,
      confettiEnabled: true,
      wheelColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      ...overrides,
    };
  }

  static createFast(): SpinnerSettings {
    return this.create({
      minSpinDuration: 1,
      maxSpinDuration: 2,
      decelerationRate: 0.95,
    });
  }

  static createSlow(): SpinnerSettings {
    return this.create({
      minSpinDuration: 5,
      maxSpinDuration: 10,
      decelerationRate: 0.99,
    });
  }

  static createSilent(): SpinnerSettings {
    return this.create({
      soundEnabled: false,
      confettiEnabled: false,
    });
  }
}

/**
 * Reset all factories
 */
export const resetAllFactories = () => {
  ParticipantFactory.reset();
  CompetitionFactory.reset();
  WinnerFactory.reset();
  SessionFactory.reset();
};