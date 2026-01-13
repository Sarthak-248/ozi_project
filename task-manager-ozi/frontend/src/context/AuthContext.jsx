import React, { createContext, useContext, useState, useEffect } from 'react'
import api, { setAccessToken } from '../api/axios'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check for existing session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Try to get user profile - this will fail with 401 if token is invalid
        // But the axios interceptor will try to refresh the token
        const r = await api.get('/users/me')
        if (r.data.data) {
          setUser(r.data.data)
        }
      } catch (err) {
        // Session is not valid, user needs to login
        setUser(null)
        setAccessToken(null)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  async function login(credentials){
    const r = await api.post('/auth/login', credentials)
    const { user: u, access } = r.data.data
    setUser(u)
    setAccessToken(access)
    return u
  }

  async function register(payload){
    const r = await api.post('/auth/register', payload)
    const { user: u, tokens } = r.data.data
    setUser(u)
    setAccessToken(tokens.access)
    return u
  }

  async function logout(){
    await api.post('/auth/logout')
    setUser(null)
    setAccessToken(null)
    navigate('/login')
  }

  const value = { user, login, register, logout, setUser, loading }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){ return useContext(AuthContext) }

export default AuthContext
