import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ProtectedRoute({ children }){
  const auth = useAuth()
  
  // Show loading while checking session
  if(auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
        />
      </div>
    )
  }
  
  if(!auth.user) return <Navigate to="/login" replace />
  return children
}
