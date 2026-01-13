# 🐛 Task History - Troubleshooting & Testing Guide

## Issue Found & Fixed ✅

**Problem**: MongoDB update query was malformed when creating history entries

**Root Cause**: The update operation was mixing regular object properties with MongoDB operators

**Solution**: Properly structured the update query to use `$set` and `$push` operators correctly

---

## Testing Steps

### 1. Create a Task
```
1. Open the app
2. Click "+ New Task"
3. Fill in:
   - Title: "Test Task"
   - Description: "Testing history"
   - Due Date: Any date
4. Click "Add Task"
5. Expected: Task appears in "Pending" column
```

### 2. Check Creation History
```
1. Find the task in Pending column
2. Hover over it - you should see 📜 button appear
3. Click the 📜 button
4. Expected: Modal opens and shows "Task Created" entry
   with timestamp and initial details
```

### 3. Change Status (Test Status Change)
```
1. In the same task, click 📜 to verify creation entry
2. Close modal
3. Drag the task to "In Progress" column
4. The task should move
5. Click 📜 button again
6. Expected: You should now see TWO entries:
   - ✨ Task Created
   - 🔄 Status Changed: Pending → In Progress
```

### 4. Test Due Date Change
```
1. Close the modal
2. Create a new task with a due date
3. Drag it to In Progress
4. Now click 📜 to view history
5. In the modal, modify the due date (if editable)
   OR the backend should track if you update it
6. Expected: 📅 Due Date Updated entry should appear
```

### 5. Test Multiple Changes
```
1. Create a task with all details
2. Make several changes:
   - Change status multiple times
   - Update due date
   - (Edit title/description if implemented)
3. Click 📜
4. Expected: All changes visible in timeline
   with correct timestamps and values
```

---

## What to Look For

### ✅ Success Indicators
- [ ] 📜 button appears when hovering over tasks
- [ ] Modal opens smoothly with animations
- [ ] "Task Created" entry shows on creation
- [ ] "Status Changed" entry shows when dragging between columns
- [ ] Multiple entries appear with correct order (newest first)
- [ ] Timestamps are accurate
- [ ] Color coding matches action types
- [ ] Before/after values are shown correctly

### ❌ Failure Indicators
- Modal shows "No history available"
- Only shows one entry even after multiple changes
- Entries are blank or missing data
- Wrong timestamps or dates
- No "Status Changed" entry when dragging

---

## Browser Console Debugging

### What to Check
```javascript
// Open DevTools (F12)
// Go to Console tab
// Look for any errors

// Expected:
- No errors about history
- Network requests should return 200 OK
- Task objects should have history array
```

### Check Network Response
```
1. Open DevTools (F12)
2. Go to Network tab
3. Drag a task between columns
4. Look for PATCH request to /tasks/:id
5. Check the Response
6. Expected: Should include history array with status_changed entry
```

### Verify Task Data
```
// In Console, after making changes:
// Look at the task object and check:
task.history // Should be an array
task.history[0].action // Should be 'created'
task.history[0].details // Should have newValue
task.history[0].timestamp // Should be a date
```

---

## Specific Test Cases

### Test Case 1: Initial Creation
```javascript
// Expected task.history after creation:
[
  {
    action: 'created',
    timestamp: Date,
    details: {
      newValue: {
        title: "Test Task",
        description: "Testing history",
        status: "pending",
        dueDate: Date
      }
    }
  }
]
```

### Test Case 2: Status Change
```javascript
// Expected task.history after drag to In Progress:
[
  {
    action: 'created',
    timestamp: Date,
    details: { ... }
  },
  {
    action: 'status_changed',
    timestamp: Date,
    details: {
      field: 'status',
      oldValue: 'pending',
      newValue: 'in-progress'
    }
  }
]
```

---

## Common Issues & Solutions

### Issue: Modal Shows "No history available"
**Possible Causes:**
- History array is empty
- task prop is not being passed correctly
- Backend not returning history field

**Solution:**
1. Check browser console for errors
2. Look at Network tab - response should include history
3. Verify task object has history array

### Issue: History Button (📜) Doesn't Appear
**Possible Causes:**
- TaskHistoryModal not imported
- showHistory state not working
- Button click handler not set up

**Solution:**
1. Check console for import errors
2. Verify TaskCard.jsx has the button code
3. Test clicking the button - should trigger setShowHistory(true)

### Issue: Status Change Not Creating History Entry
**Possible Causes:**
- MongoDB update query malformed (FIXED)
- Backend not detecting status change
- Wrong status value being sent

**Solution:**
1. Restart backend server to load fixed code
2. Check Network tab - request body should have status field
3. Verify status is actually changing (task moves to new column)

### Issue: Timestamps Are Wrong
**Possible Causes:**
- Server timezone issue
- Browser locale settings
- Date conversion issue

**Solution:**
1. Check server logs for timestamp values
2. Verify new Date() is being used in backend
3. Check browser's locale settings

---

## Step-by-Step Debug Process

### If Feature Isn't Working

1. **Check Backend**
   ```
   cd backend
   - Verify task.model.js has history schema
   - Verify task.service.js has updateTask logic
   - Check server is running without errors
   ```

2. **Check Frontend**
   ```
   cd frontend
   - Verify TaskHistoryModal.jsx exists and imports correctly
   - Verify TaskCard.jsx has history button and modal integration
   - Check console for JavaScript errors
   ```

3. **Test API**
   ```
   Create a task via API:
   POST /tasks
   {
     "title": "Test",
     "description": "Test",
     "dueDate": "2026-01-20"
   }
   
   Response should have history array:
   "history": [{"action": "created", ...}]
   ```

4. **Test Update**
   ```
   Update task status:
   PATCH /tasks/:id
   {"status": "in-progress"}
   
   Response should have updated history:
   "history": [
     {"action": "created", ...},
     {"action": "status_changed", ...}
   ]
   ```

5. **Test Frontend**
   ```
   - Create task in UI ✓
   - Click 📜 button ✓
   - Modal shows history ✓
   - Drag task between columns ✓
   - Click 📜 again ✓
   - New entry appears ✓
   ```

---

## Quick Verification Checklist

### Backend Check
```bash
cd backend
# Verify files have correct code
grep -n "history:" src/modules/task/task.model.js
grep -n "action: 'status_changed'" src/modules/task/task.service.js

# Server should be running on port 5001
curl http://localhost:5001/health
```

### Frontend Check
```bash
cd frontend
# Verify files exist
ls src/components/TaskHistoryModal.jsx
grep -n "TaskHistoryModal" src/components/TaskCard.jsx

# Run build/dev server
npm run dev
```

### Browser Check
```javascript
// In DevTools Console
// After creating task:
console.log(JSON.stringify(lastTask.history, null, 2))

// Should show:
{
  "action": "created",
  "timestamp": "2026-01-13T...",
  "details": {...}
}
```

---

## Success!

When everything is working, you should see:

1. ✅ 📜 button on task cards (hover to see)
2. ✅ Modal opens with smooth animation
3. ✅ "Task Created" entry visible
4. ✅ Status changes create new entries
5. ✅ Timeline shows chronologically
6. ✅ Before/after values displayed
7. ✅ Timestamps accurate
8. ✅ Color-coded by action type

If all these work, the feature is ready! 🎉
