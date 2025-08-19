/**
 * Competition Test Fixtures
 * 
 * Provides reusable test data for competition-related tests.
 */

import type { Competition } from '@raffle-spinner/storage';

export const mockCompetitions: Record<string, Competition> = {
  basic: {
    id: 'comp-1',
    name: 'Test Competition',
    participants: [
      { firstName: 'John', lastName: 'Doe', ticketNumber: 'T001' },
      { firstName: 'Jane', lastName: 'Smith', ticketNumber: 'T002' },
      { firstName: 'Bob', lastName: 'Johnson', ticketNumber: 'T003' },
    ],
    createdAt: Date.parse('2024-01-01T00:00:00Z'),
    updatedAt: Date.parse('2024-01-01T00:00:00Z'),
  },
  
  large: {
    id: 'comp-2',
    name: 'Large Competition',
    participants: Array.from({ length: 1000 }, (_, i) => ({
      firstName: `First${i}`,
      lastName: `Last${i}`,
      ticketNumber: `T${String(i + 1).padStart(4, '0')}`,
    })),
    createdAt: Date.parse('2024-01-01T00:00:00Z'),
    updatedAt: Date.parse('2024-01-01T00:00:00Z'),
  },

  empty: {
    id: 'comp-3',
    name: 'Empty Competition',
    participants: [],
    createdAt: Date.parse('2024-01-01T00:00:00Z'),
    updatedAt: Date.parse('2024-01-01T00:00:00Z'),
  },

  duplicates: {
    id: 'comp-4',
    name: 'Competition with Duplicates',
    participants: [
      { firstName: 'Alice', lastName: 'Brown', ticketNumber: 'T001' },
      { firstName: 'Charlie', lastName: 'Davis', ticketNumber: 'T002' },
      { firstName: 'Eve', lastName: 'Wilson', ticketNumber: 'T001' }, // Duplicate
      { firstName: 'Frank', lastName: 'Miller', ticketNumber: 'T003' },
    ],
    createdAt: Date.parse('2024-01-01T00:00:00Z'),
    updatedAt: Date.parse('2024-01-01T00:00:00Z'),
  },
};

export const createMockCompetition = (
  overrides?: Partial<Competition>
): Competition => {
  return {
    id: `comp-${Date.now()}`,
    name: 'Mock Competition',
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

export const createMockParticipants = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    firstName: `First${i}`,
    lastName: `Last${i}`,
    ticketNumber: `T${String(i + 1).padStart(4, '0')}`,
  }));
};