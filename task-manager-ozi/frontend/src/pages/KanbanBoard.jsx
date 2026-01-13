import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import TaskCard from '../components/TaskCard'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const STATUSES = ['pending', 'in-progress', 'completed']
const STATUS_LABELS = { 'pending': 'Pending', 'in-progress': 'In Progress', 'completed': 'Completed' }
const STATUS_COLORS = { 
  'pending': { bg: 'from-yellow-900/20 to-yellow-800/10', border: 'border-yellow-500/20', icon: '⏱️' },
  'in-progress': { bg: 'from-blue-900/20 to-blue-800/10', border: 'border-blue-500/20', icon: '🚀' },
  'completed': { bg: 'from-emerald-900/20 to-emerald-800/10', border: 'border-emerald-500/20', icon: '✅' }
}

function SortableTaskCard({ task, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`mb-4 ${isDragging ? 'opacity-50 scale-105' : ''}`}
      layout
    >
      <TaskCard task={task} onDelete={onDelete} dragHandleProps={{ ...attributes, ...listeners }} />
    </motion.div>
  )
}

function Column({ status, tasks, onDelete }) {
  const { setNodeRef } = useDroppable({ id: status })
  const statusTasks = tasks.filter(t => t.status === status)
  const colors = STATUS_COLORS[status]
  const [currentPage, setCurrentPage] = React.useState(1)

  const TASKS_PER_PAGE = 2
  const totalPages = Math.ceil(statusTasks.length / TASKS_PER_PAGE)
  const startIndex = (currentPage - 1) * TASKS_PER_PAGE
  const endIndex = startIndex + TASKS_PER_PAGE
  const paginatedTasks = statusTasks.slice(startIndex, endIndex)

  // Reset to page 1 when tasks change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [statusTasks.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      ref={setNodeRef}
      className={`rounded-2xl overflow-hidden flex flex-col backdrop-blur-xl bg-gradient-to-br ${colors.bg} border ${colors.border} shadow-2xl min-h-96`}
    >
      <motion.div 
        className="bg-white/5 p-6 border-b border-white/10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{colors.icon}</span>
            <motion.h3 
              className="text-xl font-bold text-white"
              whileHover={{ x: 4 }}
            >
              {STATUS_LABELS[status]}
            </motion.h3>
          </div>
          <motion.span 
            className="text-sm bg-white/10 text-white px-3 py-1 rounded-full font-semibold border border-white/20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {statusTasks.length}
          </motion.span>
        </div>
      </motion.div>

      <div className="flex-1 p-4 min-h-96 space-y-3 overflow-y-auto">
        <SortableContext
          items={paginatedTasks.map(t => t._id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {statusTasks.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12 text-gray-400"
              >
                <motion.p 
                  className="text-lg font-semibold"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🎯
                </motion.p>
                <p className="text-sm mt-3">No tasks yet</p>
                <p className="text-xs mt-1 opacity-70">Drag tasks here</p>
              </motion.div>
            ) : (
              paginatedTasks.map((task, idx) => (
                <SortableTaskCard
                  key={task._id}
                  task={task}
                  onDelete={onDelete}
                />
              ))
            )}
          </AnimatePresence>
        </SortableContext>
      </div>

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 p-4 border-t border-white/10 flex items-center justify-between"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold border border-white/20 transition"
          >
            ← Prev
          </motion.button>

          <motion.span
            className="text-sm text-gray-300 font-semibold"
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Page {currentPage} of {totalPages}
          </motion.span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold border border-white/20 transition"
          >
            Next →
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' })
  const [activeId, setActiveId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor)
  )

  // Smart sort function matching backend logic
  function smartTaskSort(taskA, taskB) {
    // Completed tasks always go last
    if (taskA.status === 'completed' && taskB.status !== 'completed') return 1;
    if (taskA.status !== 'completed' && taskB.status === 'completed') return -1;
    if (taskA.status === 'completed' && taskB.status === 'completed') return 0;

    // Overdue tasks first
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

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const r = await api.get('/tasks')
      const tasksData = r.data.data || []
      const validTasks = tasksData.filter(t => t._id && t.status)
      setTasks(validTasks)
    } catch (e) {
      console.error('Fetch error:', e)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setCreating(true)
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      }
      const r = await api.post('/tasks', payload)
      const newTask = r.data.data
      if (newTask && newTask._id) {
        setTasks((prev) => [...prev, newTask].sort(smartTaskSort))
      }
      setForm({ title: '', description: '', dueDate: '' })
      setShowForm(false)
    } catch (e) {
      console.error('Create failed:', e)
    } finally {
      setCreating(false)
    }
  }

  function handleDelete(taskId) {
    setTasks((prev) => prev.filter(t => t._id !== taskId))
  }

  async function handleDragEnd(event) {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeTaskId = active.id
    let overStatus = over.id

    console.log('Drag end - activeTaskId:', activeTaskId, 'over.id:', overStatus)

    const activeTask = tasks.find(t => t._id === activeTaskId)
    if (!activeTask) {
      console.log('Active task not found')
      setActiveId(null)
      return
    }
    
    // If dropping on a task, get the status of that task
    if (!STATUSES.includes(overStatus)) {
      const overTask = tasks.find(t => t._id === overStatus)
      if (overTask) {
        overStatus = overTask.status
        console.log('Dropped on task, using task status:', overStatus)
      } else {
        console.log('Over ID is neither a status nor a valid task ID:', overStatus)
        setActiveId(null)
        return
      }
    }
    
    if (activeTask.status === overStatus) {
      console.log('Same status, no change needed')
      setActiveId(null)
      return
    }

    console.log('Updating task status from', activeTask.status, 'to', overStatus)

    const updatedTasks = tasks.map(t =>
      t._id === activeTaskId ? { ...t, status: overStatus } : t
    )
    // Re-sort tasks after status change
    setTasks(updatedTasks.sort(smartTaskSort))

    try {
      const response = await api.patch(`/tasks/${activeTaskId}`, { status: overStatus })
      // Update the task in state with the response that includes the updated history
      if (response.data && response.data.data) {
        const updatedTask = response.data.data
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t._id === activeTaskId ? updatedTask : t
          ).sort(smartTaskSort)
        )
      }
    } catch (e) {
      console.error('Update failed:', e)
      await fetchAll()
    }

    setActiveId(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
      />
    </div>
  )

  const draggedTask = tasks.find(t => t._id === activeId)
  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length
  const completedCount = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="p-6 bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              Task Board
            </motion.h1>
            <motion.p 
              className="text-gray-400 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Organize and track your tasks across different stages
            </motion.p>
          </div>
          <motion.div 
            className="flex gap-2 text-sm"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            {[
              { label: 'Pending', count: pendingCount, color: 'from-yellow-500 to-yellow-600' },
              { label: 'In Progress', count: inProgressCount, color: 'from-blue-500 to-blue-600' },
              { label: 'Completed', count: completedCount, color: 'from-emerald-500 to-emerald-600' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.25 + 0.08 * idx, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-lg bg-gradient-to-r ${stat.color} text-white font-semibold shadow-lg`}
              >
                {stat.label}: <span className="text-lg">{stat.count}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <motion.div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <motion.h2 
                  className="text-2xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Create New Task
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </motion.button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Task Title *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter task title"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                    disabled={creating}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.02 }}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Enter task description (optional)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition resize-none"
                    rows="3"
                    disabled={creating}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Due Date
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition"
                    disabled={creating}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
                >
                  <p className="text-sm text-blue-300">
                    ℹ️ <span className="font-semibold">Created Date:</span> Automatically set to today's date when task is created. It will be displayed on the task card.
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition shadow-lg shadow-purple-500/50"
                  disabled={creating}
                >
                  {creating ? (
                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      Creating...
                    </motion.span>
                  ) : (
                    'Add Task'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showForm && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="mb-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg shadow-purple-500/50 flex items-center gap-2"
        >
          <span>+ New Task</span>
        </motion.button>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(event) => setActiveId(event.active.id)}
        onDragEnd={handleDragEnd}
      >
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          layout
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
                duration: 0.5
              }
            }
          }}
        >
          {STATUSES.map((status) => (
            <motion.div
              key={status}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    damping: 20,
                    stiffness: 100,
                    duration: 0.6
                  }
                }
              }}
            >
              <Column
                status={status}
                tasks={tasks}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>

        <DragOverlay>
          {draggedTask ? <TaskCard task={draggedTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
