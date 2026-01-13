import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import KanbanBoard from './pages/KanbanBoard'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function Navigation() {
  const { user } = useAuth()
  const location = useLocation()
  const isAuth = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register'

  if (!isAuth) return null

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-lg border-b border-purple-500/20 sticky top-0 z-50 backdrop-blur-md bg-opacity-95"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/board" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300">📋 TaskBoard</Link>
            </motion.div>
            <div className="hidden sm:flex gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/board" className={`px-3 py-2 rounded-lg font-medium transition ${
                  location.pathname === '/board' 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'text-gray-300 hover:text-blue-300'
                }`}>
                  Board
                </Link>
              </motion.div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {user?.profilePicture ? (
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/50 shadow-lg shadow-purple-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-blue-700 flex items-center justify-center text-white text-xl font-bold border-2 border-purple-500/50 shadow-lg shadow-purple-500/30">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span className="text-base font-semibold text-blue-300">{user?.name}</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/profile" className={`px-4 py-2 rounded-lg font-medium transition ${
                location.pathname === '/profile'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
              }`}>
                Profile
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default function App(){
  const location = useLocation();
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
        <Navigation />
        <main className="container mx-auto p-4">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Routes location={location}>
              <Route path="/" element={<Login/>} />
              <Route path="/login" element={<Login/>} />
              <Route path="/register" element={<Register/>} />
              <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
              <Route path="/board" element={<ProtectedRoute><KanbanBoard/></ProtectedRoute>} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </AuthProvider>
  )
}
