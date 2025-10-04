'use client'

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useMemo, useCallback } from 'react'
import Cookies from 'js-cookie'
import { api, otpAPI } from '@/lib/api'
import { cache, CACHE_KEYS, invalidateUserCache } from '@/lib/cache'
import { debounce } from '@/lib/debounce'

interface User {
  id: string
  email: string
  full_name: string
  whatsapp_number?: string
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
  register: (email: string, password: string, fullName: string, whatsappNumber: string) => Promise<void>
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
  const hasFetched = useRef(false)
  const isInitialized = useRef(false)
  const isFetching = useRef(false)
  

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true
    
    const token = Cookies.get('token')
    
    if (token && !hasFetched.current && !isFetching.current) {
      hasFetched.current = true
      fetchUser()
    } else if (!token) {
      setLoading(false)
    }
  }, []) // Only run once on mount

  const fetchUser = useCallback(async () => {
    if (isFetching.current) return
    
    // Check cache first
    const cachedUser = cache.get<User>(CACHE_KEYS.USER_PROFILE)
    if (cachedUser) {
      setUser(cachedUser)
      setLoading(false)
      return
    }
    
    try {
      setFetching(true)
      isFetching.current = true
      const response = await api.get('/auth/profile')
      const userData = response.data.user
      
      // Cache user data for 5 minutes
      cache.set(CACHE_KEYS.USER_PROFILE, userData, 5 * 60 * 1000)
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      Cookies.remove('token')
      setUser(null)
      // Clear cache on error
      cache.delete(CACHE_KEYS.USER_PROFILE)
    } finally {
      setLoading(false)
      setFetching(false)
      isFetching.current = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      Cookies.set('token', token, { expires: 7 })
      
      // Cache user data
      cache.set(CACHE_KEYS.USER_PROFILE, user, 5 * 60 * 1000)
      setUser(user)
      
      // Remove router.push to prevent re-render
      window.location.href = '/dashboard'
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

  const register = async (email: string, password: string, fullName: string, whatsappNumber: string) => {
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        full_name: fullName,
        whatsapp_number: whatsappNumber
      })
      const { token, user } = response.data
      
      // Save email for OTP verification
      localStorage.setItem('verification_email', email)
      
      Cookies.set('token', token, { expires: 7 })
      
      // Cache user data
      cache.set(CACHE_KEYS.USER_PROFILE, user, 5 * 60 * 1000)
      setUser(user)
      
      // Don't redirect here - let the calling component handle the redirect
      // This prevents conflict with router.push in LandingPage
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await otpAPI.verify(email, otp, 'email_verification')
      
      if (response.data.valid) {
        // Invalidate user cache to force refresh
        invalidateUserCache()
        
        // Refresh user data after successful verification
        await fetchUser()
        window.location.href = '/dashboard'
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
      const updatedUser = response.data.user
      
      // Update cache with new user data
      cache.set(CACHE_KEYS.USER_PROFILE, updatedUser, 5 * 60 * 1000)
      setUser(updatedUser)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update profile')
    }
  }

    // Force refresh user data from server (bypass cache)
  const refreshUser = useCallback(async () => {
    if (isFetching.current || !Cookies.get('token')) return
    
    try {
      setFetching(true)
      isFetching.current = true
      
      // Always fetch from server, don't use cache
      const response = await api.get('/auth/profile')
      const userData = response.data.user
      
      // Update cache with fresh data
      cache.set(CACHE_KEYS.USER_PROFILE, userData, 5 * 60 * 1000)
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      // Don't clear token on refresh error, just log it
    } finally {
      setFetching(false)
      isFetching.current = false
    }
  }, [])

  const logout = () => {
    Cookies.remove('token')
    setUser(null)
    hasFetched.current = false
    isInitialized.current = false
    isFetching.current = false
    
    // Clear all caches
    cache.clear()
    
    // Remove router.push to prevent re-render
    window.location.href = '/'
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
