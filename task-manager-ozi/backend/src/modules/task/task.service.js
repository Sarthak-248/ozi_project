const Task = require('./task.model');
const ApiError = require('../../utils/ApiError');
const mongoose = require('mongoose');
const { calculateDaysRemaining, isTaskOverdue } = require('../../utils/dateHelper');

/**
 * Enrich task with computed fields (isOverdue, daysRemaining)
 * @param {object} task - Task object
 * @returns {object} Task with computed fields
 */
function enrichTaskWithDueDateFields(task) {
  const enriched = { ...task };
  
  if (task.dueDate) {
    enriched.daysRemaining = calculateDaysRemaining(task.dueDate);
    enriched.isOverdue = isTaskOverdue(task.status, task.dueDate);
  } else {
    enriched.daysRemaining = null;
    enriched.isOverdue = false;
  }
  
  return enriched;
}

/**
 * Smart sort comparator for tasks
 * Priority: Overdue (descending) > Due date (ascending) > Completed last
 * @param {object} taskA
 * @param {object} taskB
 * @returns {number} Sort order
 */
function smartTaskSort(taskA, taskB) {
  // Completed tasks always go last
  if (taskA.status === 'completed' && taskB.status !== 'completed') return 1;
  if (taskA.status !== 'completed' && taskB.status === 'completed') return -1;
  
  // Both completed - maintain original order
  if (taskA.status === 'completed' && taskB.status === 'completed') return 0;
  
  // Overdue tasks first (by days overdue descending)
  const aOverdue = taskA.isOverdue;
  const bOverdue = taskB.isOverdue;
  
  if (aOverdue && !bOverdue) return -1;
  if (!aOverdue && bOverdue) return 1;
  
  if (aOverdue && bOverdue) {
    // Both overdue - sort by most overdue first
    return (taskA.daysRemaining || 0) - (taskB.daysRemaining || 0);
  }
  
  // Non-overdue tasks - sort by nearest due date first
  if (taskA.daysRemaining !== null && taskB.daysRemaining !== null) {
    return (taskA.daysRemaining || 0) - (taskB.daysRemaining || 0);
  }
  
  // No due date tasks go last
  if (taskA.daysRemaining === null && taskB.daysRemaining === null) return 0;
  if (taskA.daysRemaining === null) return 1;
  if (taskB.daysRemaining === null) return -1;
  
  return 0;
}

/**
 * Create a new task
 * @param {string} userId - User ID
 * @param {object} dto - Task data (title, description, status, dueDate)
 * @returns {object} Created task with computed fields
 */
async function createTask(userId, dto) {
  try {
    let task = await Task.create({
      ...dto,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [{
        action: 'created',
        timestamp: new Date(),
        details: {
          newValue: {
            title: dto.title,
            description: dto.description || '',
            status: dto.status || 'pending',
            dueDate: dto.dueDate || null
          }
        }
      }]
    });
    task = task.toObject();
    
    // Enrich with computed fields
    task = enrichTaskWithDueDateFields(task);
    return task;
  } catch (err) {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(e => e.message).join(', ');
      throw new ApiError(400, message);
    }
    throw err;
  }
}

/**
 * Get all tasks for a user with optional filters
 * @param {string} userId - User ID
 * @param {object} filter - Filter options (status, search, sortBy, order)
 * @returns {array} Array of tasks with computed due date fields
 */
async function getTasks(userId, filter = {}) {
  const query = { userId };

  // Filter by status
  if (filter.status) {
    if (!['pending', 'in-progress', 'completed'].includes(filter.status)) {
      throw new ApiError(400, 'Invalid status filter');
    }
    query.status = filter.status;
  }

  // Search by title or description
  if (filter.search) {
    const searchRegex = new RegExp(filter.search, 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex }
    ];
  }

  // Get tasks and enrich with computed fields
  let tasks = await Task
    .find(query)
    .select('-__v')
    .lean();

  // Enrich each task with due date computed fields
  tasks = tasks.map(task => enrichTaskWithDueDateFields(task));

  // Apply smart sorting (overdue first, then by due date, completed last)
  tasks.sort(smartTaskSort);

  return tasks;
}

/**
 * Get a single task by ID
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @returns {object} Task object with computed fields
 */
async function getTaskById(userId, taskId) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, 'Invalid task ID format');
  }

  let task = await Task.findOne({ _id: taskId, userId }).select('-__v').lean();
  if (!task) {
    throw new ApiError(404, 'Task not found or you do not have permission to access it');
  }
  
  // Enrich with computed fields
  task = enrichTaskWithDueDateFields(task);
  return task;
}

/**
 * Update a task
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @param {object} payload - Fields to update
 * @returns {object} Updated task with computed fields
 */
async function updateTask(userId, taskId, payload) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, 'Invalid task ID format');
  }

  try {
    // Get the current task to track changes
    const currentTask = await Task.findOne({ _id: taskId, userId }).lean();
    if (!currentTask) {
      throw new ApiError(404, 'Task not found or you do not have permission to access it');
    }

    // Build history entries for changes
    const historyEntries = [];
    
    if (payload.status && payload.status !== currentTask.status) {
      historyEntries.push({
        action: 'status_changed',
        timestamp: new Date(),
        details: {
          field: 'status',
          oldValue: currentTask.status,
          newValue: payload.status
        }
      });
    }

    if (payload.dueDate && payload.dueDate !== currentTask.dueDate) {
      historyEntries.push({
        action: 'due_date_updated',
        timestamp: new Date(),
        details: {
          field: 'dueDate',
          oldValue: currentTask.dueDate,
          newValue: payload.dueDate
        }
      });
    }

    if (payload.title && payload.title !== currentTask.title) {
      historyEntries.push({
        action: 'title_updated',
        timestamp: new Date(),
        details: {
          field: 'title',
          oldValue: currentTask.title,
          newValue: payload.title
        }
      });
    }

    if (payload.description !== undefined && payload.description !== currentTask.description) {
      historyEntries.push({
        action: 'description_updated',
        timestamp: new Date(),
        details: {
          field: 'description',
          oldValue: currentTask.description,
          newValue: payload.description
        }
      });
    }

    // Build update query with MongoDB operators
    const updateQuery = {};
    
    // Set regular fields
    updateQuery.$set = {
      ...payload,
      updatedAt: new Date()
    };
    
    // Push history entries if there are any changes
    if (historyEntries.length > 0) {
      updateQuery.$push = {
        history: { $each: historyEntries }
      };
    }

    let task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      updateQuery,
      { new: true, runValidators: true }
    ).select('-__v').lean();

    if (!task) {
      throw new ApiError(404, 'Task not found or you do not have permission to access it');
    }
    
    // Enrich with computed fields
    task = enrichTaskWithDueDateFields(task);
    return task;
  } catch (err) {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(e => e.message).join(', ');
      throw new ApiError(400, message);
    }
    if (err instanceof ApiError) throw err;
    throw err;
  }
}

/**
 * Delete a task
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @returns {object} Deleted task
 */
async function deleteTask(userId, taskId) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, 'Invalid task ID format');
  }

  const task = await Task.findOneAndDelete({ _id: taskId, userId }).lean();
  if (!task) {
    throw new ApiError(404, 'Task not found or you do not have permission to access it');
  }
  return task;
}

/**
 * Get task statistics for a user
 * @param {string} userId - User ID
 * @returns {object} Task statistics
 */
async function getTaskStats(userId) {
  const stats = await Task.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    pending: 0,
    'in-progress': 0,
    completed: 0,
    total: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
}

/**
 * Delete all tasks for a user (admin/cleanup function)
 * @param {string} userId - User ID
 * @returns {object} Result of deletion
 */
async function deleteUserTasks(userId) {
  const result = await Task.deleteMany({ userId });
  return result;
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  deleteUserTasks
};
