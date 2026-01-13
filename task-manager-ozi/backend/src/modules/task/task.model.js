const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'in-progress', 'completed'],
      message: 'Status must be one of: pending, in-progress, completed'
    },
    default: 'pending'
  },
  dueDate: { 
    type: Date,
    validate: {
      validator: function(val) {
        if (!val) return true; // Allow null/undefined
        // Compare dates at midnight to avoid time-of-day issues
        const today = new Date();
        const dueDateAtMidnight = new Date(Date.UTC(
          val.getUTCFullYear(),
          val.getUTCMonth(),
          val.getUTCDate()
        ));
        const todayAtMidnight = new Date(Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate()
        ));
        return dueDateAtMidnight >= todayAtMidnight;
      },
      message: 'Due date must be today or in the future'
    }
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'],
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now
  },
  history: [{
    action: {
      type: String,
      enum: ['created', 'status_changed', 'due_date_updated', 'title_updated', 'description_updated'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    details: {
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      field: String
    }
  }]
}, { timestamps: true });

// Composite index for efficient queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
