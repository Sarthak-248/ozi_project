# Due Date Intelligence - Quick Reference

## What Was Implemented

A complete due date intelligence system that automatically sorts tasks and displays countdown badges without changing any existing APIs or database schema.

## Key Features

### 1. Automatic Sorting ✓
Tasks are automatically sorted in each Kanban column:
1. **Overdue tasks first** (most overdue at top)
2. **Due soon tasks next** (nearest due date)
3. **No due date tasks** at bottom
4. **Completed tasks** always at the end

### 2. Countdown Badges ✓
Tasks display smart countdown messages:
- 🚨 "Overdue by 2 days" (red, for overdue tasks)
- ⏰ "Due today" (yellow)
- ⏳ "Due tomorrow" (orange)
- 📅 "Due in 5 days" (default)
- (no badge for tasks without due dates)

### 3. Visual Highlighting ✓
Overdue tasks stand out with:
- Red border on card
- Red text in countdown badge
- Red shadow effect
- Only applies to incomplete overdue tasks

## How It Works

### Backend Flow
```
getTasks() API Call
    ↓
Database query returns tasks
    ↓
enrichTaskWithDueDateFields() adds:
    - daysRemaining (calculated from dueDate)
    - isOverdue (if daysRemaining < 0 AND status !== 'completed')
    ↓
smartTaskSort() sorts all tasks:
    - Completed → end
    - Overdue → start
    - By dueDate → middle
    ↓
API returns pre-sorted, enriched tasks
```

### Frontend Flow
```
Task Data from API
    ↓
TaskCard component receives task with:
    - daysRemaining
    - isOverdue
    ↓
Helper functions determine styling:
    - getCountdownMessage(daysRemaining, status)
    - getOverdueCardBorderClasses(isOverdue, status)
    - getCountdownEmoji(daysRemaining)
    ↓
UI renders with countdown badge and styling
```

## Important Details

### Timezone Safety
- All date comparisons use UTC midnight
- Handles DST transitions correctly
- Safe for global users in different timezones

### Completed Tasks
- Never show as overdue (even if past due date)
- Always appear at bottom of column
- No countdown badge displayed

### Missing Due Dates
- `daysRemaining` is `null`
- `isOverdue` is `false`
- No countdown badge shown
- Tasks appear at bottom of column

### Sorting Stability
- Overdue tasks sorted by most overdue first
- Non-overdue tasks sorted by nearest due date
- No due date tasks at bottom (in creation order)
- Completed tasks at very bottom (in any order)

## No Breaking Changes
- ✓ No new API routes
- ✓ No schema changes
- ✓ No database migrations needed
- ✓ Drag-and-drop still works
- ✓ Existing task operations unchanged
- ✓ Backward compatible with old tasks (no due date)

## Files to Know About

**Backend:**
- `backend/src/utils/dateHelper.js` - Date calculation engine
- `backend/src/modules/task/task.service.js` - Sorting & enrichment logic

**Frontend:**
- `frontend/src/utils/dateHelper.js` - UI styling helpers
- `frontend/src/components/TaskCard.jsx` - Countdown badge display

## Testing Checklist

- [ ] Create task with past due date → see "Overdue by X days" in red
- [ ] Create task due today → see "Due today" with ⏰ emoji
- [ ] Create task with no due date → no countdown badge
- [ ] Complete overdue task → badge disappears, no red highlight
- [ ] Verify overdue tasks appear first in Kanban columns
- [ ] Drag-and-drop tasks between columns still works
- [ ] Test in different browser timezones
- [ ] Verify task creation/update still works normally

## Performance

- Zero additional database queries
- Sorting happens in-memory (fast)
- Computation is O(n) where n = number of tasks
- No impact on drag-and-drop performance
