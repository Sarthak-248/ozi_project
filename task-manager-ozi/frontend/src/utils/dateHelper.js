/**
 * Frontend date utility functions for task due date display
 */

/**
 * Get countdown message for a task
 * @param {number} daysRemaining - Days remaining (can be negative for overdue)
 * @param {string} status - Task status
 * @returns {string|null} Countdown message
 */
export function getCountdownMessage(daysRemaining, status) {
  if (daysRemaining === null || daysRemaining === undefined) return null;
  if (status === 'completed') return null;

  if (daysRemaining < 0) {
    const daysOverdue = Math.abs(daysRemaining);
    return `Overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`;
  }
  if (daysRemaining === 0) return 'Due today';
  if (daysRemaining === 1) return 'Due tomorrow';

  return `Due in ${daysRemaining} days`;
}

/**
 * Get CSS classes for overdue badge styling
 * @param {boolean} isOverdue - Whether task is overdue
 * @param {string} status - Task status
 * @returns {string} CSS class string
 */
export function getOverdueBadgeClasses(isOverdue, status) {
  if (!isOverdue || status === 'completed') {
    return 'bg-white/5 text-gray-300 border border-white/10';
  }
  return 'bg-red-500/20 text-red-300 border border-red-500/30';
}

/**
 * Get CSS classes for task card border highlighting overdue tasks
 * @param {boolean} isOverdue - Whether task is overdue
 * @param {string} status - Task status
 * @returns {string} CSS class string
 */
export function getOverdueCardBorderClasses(isOverdue, status) {
  if (!isOverdue || status === 'completed') {
    return 'border-white/20';
  }
  return 'border-red-500/50 shadow-red-500/20';
}

/**
 * Get emoji for countdown badge
 * @param {number} daysRemaining - Days remaining
 * @returns {string} Emoji
 */
export function getCountdownEmoji(daysRemaining) {
  if (daysRemaining === null || daysRemaining === undefined) return '📅';
  if (daysRemaining < 0) return '🚨';
  if (daysRemaining === 0) return '⏰';
  if (daysRemaining === 1) return '⏳';
  return '📅';
}
