const taskService = require('./task.service');
const { createTaskSchema, updateTaskSchema, filterSchema } = require('./task.schema');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/**
 * Create a new task
 * POST /tasks
 */
async function create(req, res, next) {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return next(new ApiError(400, 'Validation failed', details));
    }

    const task = await taskService.createTask(req.user._id, parsed.data);
    return res.status(201).json(
      new ApiResponse({
        data: task,
        message: 'Task created successfully'
      })
    );
  } catch (err) {
    return next(err);
  }
}

/**
 * List all tasks for the current user with optional filters
 * GET /tasks?status=pending&search=query&sortBy=createdAt&order=desc
 */
async function list(req, res, next) {
  try {
    const filterParsed = filterSchema.safeParse(req.query);
    if (!filterParsed.success) {
      const details = filterParsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return next(new ApiError(400, 'Invalid filter parameters', details));
    }

    const tasks = await taskService.getTasks(req.user._id, filterParsed.data);
    return res.json(
      new ApiResponse({
        data: tasks,
        meta: {
          total: tasks.length,
          filters: filterParsed.data
        }
      })
    );
  } catch (err) {
    return next(err);
  }
}

/**
 * Get a single task by ID
 * GET /tasks/:id
 */
async function getOne(req, res, next) {
  try {
    const task = await taskService.getTaskById(req.user._id, req.params.id);
    return res.json(new ApiResponse({ data: task }));
  } catch (err) {
    return next(err);
  }
}

/**
 * Update a task
 * PATCH /tasks/:id
 */
async function update(req, res, next) {
  try {
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return next(new ApiError(400, 'Validation failed', details));
    }

    if (Object.keys(parsed.data).length === 0) {
      return next(new ApiError(400, 'No fields to update'));
    }

    const task = await taskService.updateTask(
      req.user._id,
      req.params.id,
      parsed.data
    );
    return res.json(
      new ApiResponse({
        data: task,
        message: 'Task updated successfully'
      })
    );
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete a task
 * DELETE /tasks/:id
 */
async function remove(req, res, next) {
  try {
    const task = await taskService.deleteTask(req.user._id, req.params.id);
    return res.json(
      new ApiResponse({
        data: task,
        message: 'Task deleted successfully'
      })
    );
  } catch (err) {
    return next(err);
  }
}

/**
 * Get task statistics for current user
 * GET /tasks/stats/overview
 */
async function getStats(req, res, next) {
  try {
    const stats = await taskService.getTaskStats(req.user._id);
    return res.json(
      new ApiResponse({
        data: stats,
        message: 'Task statistics retrieved successfully'
      })
    );
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  getStats
};
