import React, { useState, forwardRef } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { getCountdownMessage, getOverdueBadgeClasses, getOverdueCardBorderClasses, getCountdownEmoji } from '../utils/dateHelper'
import TaskHistoryModal from './TaskHistoryModal'

const TaskCard = forwardRef(function TaskCard({ task, onDelete, onUpdate, dragHandleProps, ...props }, ref) {
  const [deleting, setDeleting] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  async function handleDelete(){
    setDeleting(true)
    try{
      await api.delete(`/tasks/${task._id}`)
      if (onDelete) onDelete(task._id)
    }catch(e){
      // eslint-disable-next-line no-console
      console.error('Delete failed:', e)
    }finally{
      setDeleting(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'from-yellow-500/20 border-yellow-500/30'
      case 'in-progress': return 'from-blue-500/20 border-blue-500/30'
      case 'completed': return 'from-emerald-500/20 border-emerald-500/30'
      default: return 'from-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
      case 'completed': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    }
  }

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-gradient-to-br ${getStatusColor(task.status)} backdrop-blur-sm border ${getOverdueCardBorderClasses(task.isOverdue, task.status)} p-4 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-grab active:cursor-grabbing`}
      {...props}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <motion.h4 
              {...(dragHandleProps || {})}
              className="font-bold text-white text-sm leading-tight break-words flex-1 cursor-grab active:cursor-grabbing"
            >
              {task.title}
            </motion.h4>
            {task.status && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-semibold ${getStatusBadgeColor(task.status)}`}
              >
                {task.status.replace('-', ' ')}
              </motion.span>
            )}
          </div>
          
          {task.description && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-300 text-sm mt-2 line-clamp-3"
            >
              {task.description}
            </motion.p>
          )}

          <div className="flex flex-col gap-2 mt-4 text-xs">
            {task.daysRemaining !== null && task.daysRemaining !== undefined && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`px-3 py-2 rounded-lg ${getOverdueBadgeClasses(task.isOverdue, task.status)} font-semibold flex items-center gap-2`}
              >
                <span className="text-sm">{getCountdownEmoji(task.daysRemaining)}</span>
                <span>{getCountdownMessage(task.daysRemaining, task.status)}</span>
              </motion.div>
            )}
            {task.createdAt && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ x: 2 }}
                className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10"
              >
                <span className="text-sm">📅</span>
                <div className="flex flex-col">
                  <span className="text-gray-400">Created</span>
                  <span className="text-gray-200 font-medium">
                    {new Date(task.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: new Date(task.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                  </span>
                </div>
              </motion.div>
            )}
            {task.dueDate && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ x: 2 }}
                className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10"
              >
                <span className="text-sm">⏰</span>
                <div className="flex flex-col">
                  <span className="text-gray-400">Due</span>
                  <span className="text-gray-200 font-medium">
                    {new Date(task.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: new Date(task.dueDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
          
          {task.dueDate && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-gray-400 text-xs mt-3 flex items-center gap-1"
            >
              📅 <span className="text-xs">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </motion.p>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              console.log('TaskCard: history button clicked', task?._id)
              setShowHistory(true)
            }}
            className="flex-shrink-0 text-xs px-2 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/40 font-semibold transition whitespace-nowrap cursor-pointer"
            title="View task history"
          >
            📜
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={deleting} 
            className="flex-shrink-0 text-xs px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition whitespace-nowrap cursor-pointer"
            title="Delete task"
          >
            {deleting ? (
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>⟳</motion.span>
            ) : (
              '✕'
            )}
          </motion.button>
        </div>
      </div>

      <TaskHistoryModal task={task} isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </motion.div>
  )
})

export default TaskCard
