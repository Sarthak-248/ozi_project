import React, { createContext, useContext, useEffect, useState } from 'react'
import api, { setAccessToken } from '../api/axios'

const AuthContext = createContext(null)

export function useAuth(){
  return useContext(AuthContext)
}

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to load user and token from localStorage
    const token = localStorage.getItem('accessToken')
    const persistedUser = localStorage.getItem('user')
    if (token) {
      setAccessToken(token)
    }
    if (persistedUser) {
      try {
        setUser(JSON.parse(persistedUser))
      } catch (e) {
        localStorage.removeItem('user')
      }
    }

    // Validate token by fetching user profile (will refresh token via interceptor if needed)
    if (!token) {
      setLoading(false)
      return
    }

    api.get('/auth/me').then(res => {
      const fetchedUser = res.data.user || res.data.data?.user
      if (fetchedUser) {
        setUser(fetchedUser)
        localStorage.setItem('user', JSON.stringify(fetchedUser))
      }
    }).catch(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      setAccessToken(null)
      setUser(null)
    }).finally(() => setLoading(false))
  }, [])

  const login = async (credentials) => {
    const payload = typeof credentials === 'object' ? credentials : { email: credentials, password: arguments[1] }
    try {
      const res = await api.post('/auth/login', payload)
      const token = res.data?.token || res.data?.data?.access || res.data?.data?.token
      const userData = res.data?.user || res.data?.data?.user
      if (!token) {
        throw new Error('No access token returned from server')
      }
      setAccessToken(token)
      localStorage.setItem('accessToken', token)
      if (userData) {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }
      return res
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Auth login error:', err.response?.data || err.message || err)
      const message = err.response?.data?.message || err.message || 'Login failed'
      throw new Error(message)
    }
  }

  const register = async (payload) => {
    try {
      const res = await api.post('/auth/register', payload)
      const token = res.data?.token || res.data?.data?.access || res.data?.data?.token
      const userData = res.data?.user || res.data?.data?.user
      if (token) {
        setAccessToken(token)
        localStorage.setItem('accessToken', token)
        if (userData) {
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        }
      }
      return res
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Auth register error:', err.response?.data || err.message || err)
      const message = err.response?.data?.message || err.message || 'Register failed'
      throw new Error(message)
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setAccessToken(null)
    setUser(null)
  }

  const value = { user, setUser, loading, login, register, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
