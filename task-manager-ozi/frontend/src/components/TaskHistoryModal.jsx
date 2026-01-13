import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TaskHistoryModal({ task, isOpen, onClose }) {
  const getActionLabel = (action) => {
    switch(action) {
      case 'created': return 'Task Created'
      case 'status_changed': return 'Status Changed'
      case 'due_date_updated': return 'Due Date Updated'
      case 'title_updated': return 'Title Updated'
      case 'description_updated': return 'Description Updated'
      default: return 'Updated'
    }
  }

  const getActionIcon = (action) => {
    switch(action) {
      case 'created': return '✨'
      case 'status_changed': return '🔄'
      case 'due_date_updated': return '📅'
      case 'title_updated': return '✏️'
      case 'description_updated': return '📝'
      default: return '📝'
    }
  }

  const getActionColor = (action) => {
    switch(action) {
      case 'created': return 'from-purple-500/20 border-purple-500/30 text-purple-300'
      case 'status_changed': return 'from-blue-500/20 border-blue-500/30 text-blue-300'
      case 'due_date_updated': return 'from-yellow-500/20 border-yellow-500/30 text-yellow-300'
      case 'title_updated': return 'from-green-500/20 border-green-500/30 text-green-300'
      case 'description_updated': return 'from-indigo-500/20 border-indigo-500/30 text-indigo-300'
      default: return 'from-gray-500/20 border-gray-500/30 text-gray-300'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatValue = (value, field) => {
    if (!value) return 'None'
    if (field === 'dueDate') return formatDate(value)
    return value
  }

  const history = task?.history || []

  useEffect(() => {
    if (isOpen) {
      console.log('TaskHistoryModal opened for task:', task?._id, 'history length:', history.length)
    } else {
      console.log('TaskHistoryModal closed')
    }
  }, [isOpen, task])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 w-80 max-h-64 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-white/5 p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📜</span>
                <div>
                  <h2 className="text-xl font-bold text-white">Task History</h2>
                  <p className="text-sm text-gray-400 mt-1">{task?.title}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </motion.button>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg">No history available</p>
                </div>
              ) : (
                history.map((entry, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-gradient-to-br ${getActionColor(entry.action)} border rounded-lg p-4 relative pl-10`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-slate-800 shadow-lg" />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getActionIcon(entry.action)}</span>
                          <h3 className="font-semibold text-white">{getActionLabel(entry.action)}</h3>
                        </div>

                        {entry.action === 'created' ? (
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>📝 Title: <span className="text-white font-medium">{entry.details.newValue.title}</span></p>
                            {entry.details.newValue.description && (
                              <p>📋 Description: <span className="text-white font-medium">{entry.details.newValue.description}</span></p>
                            )}
                            <p>🏷️ Status: <span className="text-white font-medium capitalize">{entry.details.newValue.status}</span></p>
                            {entry.details.newValue.dueDate && (
                              <p>⏰ Due: <span className="text-white font-medium">{formatDate(entry.details.newValue.dueDate)}</span></p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-300 space-y-1">
                            {entry.action === 'status_changed' && (
                              <p>
                                <span className="text-white font-medium capitalize">{entry.details.oldValue}</span>
                                <span className="text-gray-400 mx-2">→</span>
                                <span className="text-white font-medium capitalize">{entry.details.newValue}</span>
                              </p>
                            )}
                            {entry.action === 'due_date_updated' && (
                              <p>
                                <span className="text-white font-medium">{formatValue(entry.details.oldValue, entry.details.field)}</span>
                                <span className="text-gray-400 mx-2">→</span>
                                <span className="text-white font-medium">{formatValue(entry.details.newValue, entry.details.field)}</span>
                              </p>
                            )}
                            {entry.action === 'title_updated' && (
                              <p>
                                <span className="text-white font-medium">"{entry.details.oldValue}"</span>
                                <span className="text-gray-400 mx-2">→</span>
                                <span className="text-white font-medium">"{entry.details.newValue}"</span>
                              </p>
                            )}
                            {entry.action === 'description_updated' && (
                              <p>
                                <span className="text-white font-medium">{entry.details.oldValue || 'Empty'}</span>
                                <span className="text-gray-400 mx-2">→</span>
                                <span className="text-white font-medium">{entry.details.newValue || 'Empty'}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-xs text-gray-400 whitespace-nowrap">
                        <div>{formatDate(entry.timestamp)}</div>
                        <div className="text-gray-500">{formatTime(entry.timestamp)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
