/**
 * Test file to verify subset logic
 * This can be run in the browser console to test the logic
 */

// Mock participants generator
function generateParticipants(count) {
  const participants = [];
  for (let i = 1; i <= count; i++) {
    participants.push({
      firstName: `First${i}`,
      lastName: `Last${i}`,
      ticketNumber: String(i).padStart(3, '0'),
    });
  }
  return participants;
}

// Test initial subset creation
function createInitialSubset(sortedParticipants) {
  const SUBSET_SIZE = 100;
  const SUBSET_HALF = 50;

  let initialSubset;

  if (sortedParticipants.length <= SUBSET_SIZE) {
    // If we have 100 or fewer participants, use all of them
    initialSubset = [...sortedParticipants];

    // If we have fewer than SUBSET_SIZE, repeat to fill the wheel
    if (initialSubset.length < SUBSET_SIZE) {
      const repeated = [...initialSubset];
      while (repeated.length < SUBSET_SIZE) {
        repeated.push(
          ...sortedParticipants.slice(
            0,
            Math.min(sortedParticipants.length, SUBSET_SIZE - repeated.length)
          )
        );
      }
      initialSubset = repeated;
    }
  } else {
    // Take first 50 and last 50 entries to create wrap-around effect
    const firstHalf = sortedParticipants.slice(0, SUBSET_HALF);
    const lastHalf = sortedParticipants.slice(-SUBSET_HALF);
    initialSubset = [...firstHalf, ...lastHalf];
  }

  return initialSubset;
}

// Test winner subset creation
function createWinnerSubset(sortedParticipants, winnerIndex) {
  const SUBSET_SIZE = 100;
  const SUBSET_HALF = 50;

  if (winnerIndex === -1) {
    // Winner not found - fallback to initial subset pattern
    if (sortedParticipants.length <= SUBSET_SIZE) {
      return sortedParticipants;
    }
    const firstHalf = sortedParticipants.slice(0, SUBSET_HALF);
    const lastHalf = sortedParticipants.slice(-SUBSET_HALF);
    return [...firstHalf, ...lastHalf];
  }

  // If we have 100 or fewer participants, return all of them
  if (sortedParticipants.length <= SUBSET_SIZE) {
    return [...sortedParticipants];
  }

  // Create subset with winner approximately in the middle
  const subset = [];
  const halfSize = Math.floor(SUBSET_SIZE / 2);

  // Calculate start index to center the winner
  let startIdx = winnerIndex - halfSize;

  if (startIdx < 0) {
    // Winner is in the first half, need to wrap around
    const fromEnd = sortedParticipants.slice(startIdx); // Get from end
    const fromStart = sortedParticipants.slice(0, winnerIndex + halfSize);
    subset.push(...fromEnd, ...fromStart);
  } else if (startIdx + SUBSET_SIZE > sortedParticipants.length) {
    // Winner is in the last half, need to wrap around
    const fromMiddle = sortedParticipants.slice(startIdx);
    const fromBeginning = sortedParticipants.slice(0, SUBSET_SIZE - fromMiddle.length);
    subset.push(...fromMiddle, ...fromBeginning);
  } else {
    // Winner is in the middle, can take a continuous slice
    subset.push(...sortedParticipants.slice(startIdx, startIdx + SUBSET_SIZE));
  }

  return subset;
}

// Run tests
function runTests() {
  console.log('🧪 Testing Subset Logic\n');

  // Test with different participant counts
  const testCases = [
    { count: 50, winnerIndex: 25, description: '50 participants (less than subset)' },
    { count: 100, winnerIndex: 50, description: '100 participants (exact subset size)' },
    { count: 200, winnerIndex: 25, description: '200 participants, winner near start' },
    { count: 200, winnerIndex: 100, description: '200 participants, winner in middle' },
    { count: 200, winnerIndex: 175, description: '200 participants, winner near end' },
    { count: 1000, winnerIndex: 10, description: '1000 participants, winner at start' },
    { count: 1000, winnerIndex: 990, description: '1000 participants, winner at end' },
  ];

  testCases.forEach((test) => {
    console.log(`\n📊 Test: ${test.description}`);
    const participants = generateParticipants(test.count);

    // Test initial subset
    const initial = createInitialSubset(participants);
    console.log(`Initial subset: ${initial.length} entries`);
    console.log(
      `  First 3: ${initial
        .slice(0, 3)
        .map((p) => p.ticketNumber)
        .join(', ')}`
    );
    console.log(
      `  Last 3: ${initial
        .slice(-3)
        .map((p) => p.ticketNumber)
        .join(', ')}`
    );

    // Test winner subset
    const winner = createWinnerSubset(participants, test.winnerIndex);
    const winnerPos = winner.findIndex(
      (p) => p.ticketNumber === participants[test.winnerIndex].ticketNumber
    );
    console.log(`Winner subset: ${winner.length} entries`);
    console.log(
      `  Winner ticket #${participants[test.winnerIndex].ticketNumber} at position ${winnerPos}`
    );
    console.log(
      `  First 3: ${winner
        .slice(0, 3)
        .map((p) => p.ticketNumber)
        .join(', ')}`
    );
    console.log(
      `  Last 3: ${winner
        .slice(-3)
        .map((p) => p.ticketNumber)
        .join(', ')}`
    );
  });

  console.log('\n✅ Tests complete!');
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateParticipants, createInitialSubset, createWinnerSubset, runTests };
} else {
  // Run tests if loaded in browser
  runTests();
}
