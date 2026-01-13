const { z } = require('zod');

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  status: z
    .enum(['pending', 'in-progress', 'completed'], {
      errorMap: () => ({ message: 'Invalid status. Must be: pending, in-progress, or completed' })
    })
    .optional()
    .default('pending'),
  dueDate: z
    .string()
    .datetime({ precision: 3 })
    .nullable()
    .optional()
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  status: z
    .enum(['pending', 'in-progress', 'completed'], {
      errorMap: () => ({ message: 'Invalid status. Must be: pending, in-progress, or completed' })
    })
    .optional(),
  dueDate: z
    .string()
    .datetime({ precision: 3 })
    .nullable()
    .optional()
}).strict();

const filterSchema = z.object({
  status: z
    .enum(['pending', 'in-progress', 'completed'])
    .optional(),
  search: z
    .string()
    .optional(),
  sortBy: z
    .enum(['createdAt', 'dueDate', 'title'])
    .optional()
    .default('createdAt'),
  order: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc')
});

module.exports = { createTaskSchema, updateTaskSchema, filterSchema };
