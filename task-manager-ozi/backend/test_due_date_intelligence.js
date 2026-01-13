/**
 * Test file for Due Date Intelligence feature
 * Run with: npm test -- test_due_date_intelligence.js
 * Or: node test_due_date_intelligence.js (manual test)
 */

const { 
  calculateDaysRemaining, 
  isTaskOverdue, 
  getCountdownMessage,
  getTodayUTC,
  normalizeDueDate
} = require('./src/utils/dateHelper');

function runTests() {
  console.log('=== Due Date Intelligence Tests ===\n');
  
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (err) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${err.message}`);
      failed++;
    }
  }

  // Test 1: Calculate days remaining for future date
  test('Future date returns positive days', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 5);
    const days = calculateDaysRemaining(tomorrow);
    if (days !== 5) throw new Error(`Expected 5, got ${days}`);
  });

  // Test 2: Calculate days remaining for past date
  test('Past date returns negative days', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 3);
    const days = calculateDaysRemaining(yesterday);
    if (days !== -3) throw new Error(`Expected -3, got ${days}`);
  });

  // Test 3: Today returns 0
  test('Today returns 0 days remaining', () => {
    const today = new Date();
    const days = calculateDaysRemaining(today);
    if (days !== 0) throw new Error(`Expected 0, got ${days}`);
  });

  // Test 4: Overdue check for incomplete task
  test('Incomplete task with past date is overdue', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const overdue = isTaskOverdue('pending', pastDate);
    if (!overdue) throw new Error('Expected task to be overdue');
  });

  // Test 5: Completed tasks never overdue
  test('Completed task is never overdue', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const overdue = isTaskOverdue('completed', pastDate);
    if (overdue) throw new Error('Completed task should not be overdue');
  });

  // Test 6: Future date not overdue
  test('Future date is not overdue', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const overdue = isTaskOverdue('pending', futureDate);
    if (overdue) throw new Error('Future date should not be overdue');
  });

  // Test 7: Countdown message for overdue
  test('Overdue countdown message correct', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const msg = getCountdownMessage('pending', pastDate);
    if (!msg.includes('Overdue')) throw new Error(`Expected "Overdue", got "${msg}"`);
  });

  // Test 8: Countdown message for today
  test('Today countdown message correct', () => {
    const today = new Date();
    const msg = getCountdownMessage('pending', today);
    if (msg !== 'Due today') throw new Error(`Expected "Due today", got "${msg}"`);
  });

  // Test 9: Countdown message for tomorrow
  test('Tomorrow countdown message correct', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const msg = getCountdownMessage('pending', tomorrow);
    if (msg !== 'Due tomorrow') throw new Error(`Expected "Due tomorrow", got "${msg}"`);
  });

  // Test 10: Countdown message for future days
  test('Future days countdown message correct', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const msg = getCountdownMessage('pending', futureDate);
    if (msg !== 'Due in 5 days') throw new Error(`Expected "Due in 5 days", got "${msg}"`);
  });

  // Test 11: No message for completed task
  test('No countdown for completed tasks', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const msg = getCountdownMessage('completed', futureDate);
    if (msg !== null) throw new Error(`Expected null, got "${msg}"`);
  });

  // Test 12: No message for null dueDate
  test('No countdown for null dueDate', () => {
    const msg = getCountdownMessage('pending', null);
    if (msg !== null) throw new Error(`Expected null, got "${msg}"`);
  });

  // Test 13: Timezone safety - dates normalize to midnight
  test('Date normalization to UTC midnight', () => {
    const date1 = new Date('2024-01-15T10:30:00');
    const date2 = new Date('2024-01-15T23:45:00');
    const norm1 = normalizeDueDate(date1);
    const norm2 = normalizeDueDate(date2);
    if (norm1.getTime() !== norm2.getTime()) {
      throw new Error('Dates should normalize to same midnight');
    }
  });

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests();
