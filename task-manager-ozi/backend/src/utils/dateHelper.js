/**
 * Date utility functions for task due date handling
 * All comparisons use UTC midnight to ensure timezone-safe operations
 */

/**
 * Get today's date at midnight UTC
 * @returns {Date} Today at 00:00:00 UTC
 */
function getTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Get due date at midnight UTC for comparison
 * @param {Date|string} dueDate - The due date to normalize
 * @returns {Date} Due date at 00:00:00 UTC
 */
function normalizeDueDate(dueDate) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Calculate days remaining until due date
 * Positive = future, Negative = past, 0 = today
 * @param {Date|string} dueDate - The due date
 * @returns {number} Days remaining (can be negative)
 */
function calculateDaysRemaining(dueDate) {
  if (!dueDate) return null;
  
  const today = getTodayUTC();
  const due = normalizeDueDate(dueDate);
  
  const diffTime = due - today;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if a task is overdue
 * @param {string} status - Task status
 * @param {Date|string} dueDate - The due date
 * @returns {boolean} True if overdue
 */
function isTaskOverdue(status, dueDate) {
  if (status === 'completed' || !dueDate) return false;
  return calculateDaysRemaining(dueDate) < 0;
}

/**
 * Get a human-readable countdown message
 * @param {string} status - Task status
 * @param {Date|string} dueDate - The due date
 * @returns {string|null} Countdown message or null
 */
function getCountdownMessage(status, dueDate) {
  if (!dueDate) return null;
  if (status === 'completed') return null;
  
  const daysRemaining = calculateDaysRemaining(dueDate);
  
  if (daysRemaining < 0) {
    const daysOverdue = Math.abs(daysRemaining);
    return `Overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`;
  }
  if (daysRemaining === 0) return 'Due today';
  if (daysRemaining === 1) return 'Due tomorrow';
  
  return `Due in ${daysRemaining} days`;
}

module.exports = {
  getTodayUTC,
  normalizeDueDate,
  calculateDaysRemaining,
  isTaskOverdue,
  getCountdownMessage
};
