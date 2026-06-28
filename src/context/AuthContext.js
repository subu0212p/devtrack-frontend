'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('devtrack_user')
    const token = localStorage.getItem('devtrack_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
  localStorage.setItem('devtrack_token', token)
  localStorage.setItem('devtrack_user', JSON.stringify(userData))
  setUser(userData)
  const pendingInvite = localStorage.getItem('pending_invite')
  if (pendingInvite) {
    router.push(`/invite?token=${pendingInvite}`)
  } else {
    router.push('/dashboard')
  }
}

  const logout = () => {
    localStorage.removeItem('devtrack_token')
    localStorage.removeItem('devtrack_user')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}