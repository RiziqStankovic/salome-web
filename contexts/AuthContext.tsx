'use client'

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { api, otpAPI } from '@/lib/api'

interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  status: string
  balance?: number
  total_spent?: number
  created_at: string
  is_verified?: boolean
  is_admin?: boolean
  role?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  verifyOTP: (email: string, otp: string) => Promise<void>
  resendOTP: (email: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const router = useRouter()
  const hasFetched = useRef(false)

  useEffect(() => {
    const token = Cookies.get('token')
    if (token && !hasFetched.current) {
      console.log('AuthContext: Fetching user profile')
      hasFetched.current = true
      fetchUser()
    } else if (!token) {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    if (fetching) return
    
    try {
      setFetching(true)
      const response = await api.get('/auth/profile')
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      Cookies.remove('token')
      setUser(null)
    } finally {
      setLoading(false)
      setFetching(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      Cookies.set('token', token, { expires: 7 })
      setUser(user)
      router.push('/dashboard')
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Password dan username Anda salah')
      } else if (error.response?.status === 404) {
        throw new Error('Email tidak ditemukan')
      } else if (error.response?.status === 400) {
        throw new Error('Format email atau password tidak valid')
      } else {
        throw new Error(error.response?.data?.error || 'Terjadi kesalahan saat login')
      }
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        full_name: fullName 
      })
      const { token, user } = response.data
      
      // Save email for OTP verification
      localStorage.setItem('verification_email', email)
      
      Cookies.set('token', token, { expires: 7 })
      setUser(user)
      router.push('/verify-email')
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await otpAPI.verify(email, otp, 'email_verification')
      
      if (response.data.valid) {
        // Refresh user data after successful verification
        await fetchUser()
        router.push('/dashboard')
      } else {
        throw new Error(response.data.message || 'OTP verification failed')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'OTP verification failed')
    }
  }

  const resendOTP = async (email: string) => {
    try {
      await otpAPI.resend(email, 'email_verification')
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to resend OTP')
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put('/auth/profile', data)
      setUser(response.data.user)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update profile')
    }
  }

  const refreshUser = async () => {
    if (fetching || !Cookies.get('token')) return
    await fetchUser()
  }

  const logout = () => {
    Cookies.remove('token')
    setUser(null)
    hasFetched.current = false
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      verifyOTP, 
      resendOTP, 
      logout, 
      updateProfile,
      refreshUser: fetchUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
