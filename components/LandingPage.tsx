'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  Users, 
  CreditCard, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  TrendingUp,
  Smartphone,
  Globe,
  Lock,
  Sparkles,
  Crown,
  Target,
  Rocket,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  Plus,
  ExternalLink,
  X,
  Mail,
  Key
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { appAPI, otpAPI, authAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    whatsappNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otpCode: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [otpResendCooldown, setOtpResendCooldown] = useState(0) // in seconds
  
  const [otpAttempts, setOtpAttempts] = useState(0) // track OTP attempts
  const [apps, setApps] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const { user, login, register, logout } = useAuth()
  const router = useRouter()
  const appsFetched = useRef(false)
  const categoriesFetched = useRef(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent any default form behavior
    e.nativeEvent.stopImmediatePropagation() // Prevent event bubbling
    
    setLoading(true)
    setError('') // Clear previous error

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
        toast.success('Berhasil login!')
      } else {
        await register(formData.email, formData.password, formData.fullName, formData.whatsappNumber)
        toast.success('Berhasil mendaftar! Silakan verifikasi email Anda.')
        // Redirect to email verification page
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&purpose=email_verification`)
      }
    } catch (error: any) {
      setError(error.message)
      // Don't show toast for credential errors, show in form instead
      if (!error.message.includes('Password dan username Anda salah') && 
          !error.message.includes('Email tidak ditemukan') &&
          !error.message.includes('Format email atau password tidak valid')) {
      toast.error(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (error) {
      setError('') // Clear error when user starts typing
    }
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setError('') // Clear error when switching between login/register
    setFormData({ email: '', password: '', fullName: '', whatsappNumber: '' }) // Clear form data
    setShowPassword(false) // Reset password visibility
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Forgot password functions
  const handleForgotPasswordEmail = async () => {
    if (!forgotPasswordData.email) {
      toast.error('Email harus diisi')
      return
    }

    setForgotPasswordLoading(true)
    try {
      await otpAPI.generate(forgotPasswordData.email, 'password_reset')
      setForgotPasswordStep(2)
      setOtpResendCooldown(60) // 60 seconds cooldown
      setOtpAttempts(0) // reset attempts
      toast.success('OTP berhasil dikirim ke email Anda!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim OTP')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (otpResendCooldown > 0) {
      toast.error(`Tunggu ${otpResendCooldown} detik sebelum mengirim ulang`)
      return
    }

    setForgotPasswordLoading(true)
    try {
      await otpAPI.resend(forgotPasswordData.email, 'password_reset')
      setOtpResendCooldown(60) // 60 seconds cooldown
      toast.success('OTP berhasil dikirim ulang!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim ulang OTP')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const handleForgotPasswordOTP = async () => {
    if (!forgotPasswordData.otpCode) {
      toast.error('Kode OTP harus diisi')
      return
    }

    // Check rate limiting (6 attempts max)
    if (otpAttempts >= 6) {
      toast.error('Terlalu banyak percobaan. Tunggu 2 jam sebelum mencoba lagi.')
      return
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(forgotPasswordData.otpCode)) {
      toast.error('Kode OTP harus 6 digit angka')
      return
    }

    // Skip OTP verification step, go directly to password reset
    setForgotPasswordStep(3)
  }

  const handleForgotPasswordReset = async () => {
    if (!forgotPasswordData.newPassword || !forgotPasswordData.confirmPassword) {
      toast.error('Password dan konfirmasi password harus diisi')
      return
    }

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak sama')
      return
    }

    if (forgotPasswordData.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    setForgotPasswordLoading(true)
    try {
      const response = await authAPI.resetPassword(forgotPasswordData.email, forgotPasswordData.newPassword, forgotPasswordData.otpCode)
      
      toast.success('Password berhasil diubah! Silakan login dengan password baru.')
      setShowForgotPassword(false)
      setForgotPasswordStep(1)
      setForgotPasswordData({
        email: '',
        otpCode: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Gagal mengubah password'
      
      // Handle OTP errors specifically
      if (errorMessage.includes('Invalid OTP code') || errorMessage.includes('OTP code has already been used') || errorMessage.includes('OTP code has expired')) {
        const newAttempts = otpAttempts + 1
        setOtpAttempts(newAttempts)
        
        if (newAttempts >= 6) {
          toast.error('Terlalu banyak percobaan. Tunggu 2 jam sebelum mencoba lagi.')
          // Set a 2-hour cooldown
          setOtpResendCooldown(7200) // 2 hours in seconds
          setForgotPasswordStep(2) // Go back to OTP step
        } else {
          toast.error(`Kode OTP salah. Sisa percobaan: ${6 - newAttempts}`)
          setForgotPasswordStep(2) // Go back to OTP step
        }
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const resetForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotPasswordStep(1)
    setForgotPasswordData({
      email: '',
      otpCode: '',
      newPassword: '',
      confirmPassword: ''
    })
    setOtpResendCooldown(0)
    setOtpAttempts(0)
  }

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpResendCooldown > 0) {
      const timer = setTimeout(() => {
        setOtpResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [otpResendCooldown])

  // Fetch apps and categories only once on mount
  useEffect(() => {
    if (!appsFetched.current) {
      appsFetched.current = true
      fetchApps()
    }
    if (!categoriesFetched.current) {
      categoriesFetched.current = true
      fetchCategories()
    }
  }, [])

  // Refetch apps when search or category changes (with debounce)
  useEffect(() => {
    if (appsFetched.current && (searchTerm || selectedCategory)) {
      const timeoutId = setTimeout(() => {
        fetchApps()
      }, 500) // Debounce search

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, selectedCategory])


  const fetchApps = async () => {
    try {
      setLoadingApps(true)
      const response = await appAPI.getApps({
        page: 1,
        page_size: 12,
        popular: true,
        q: searchTerm || undefined,
        category: selectedCategory || undefined
      })
      setApps(response.data.apps)
    } catch (error) {
      console.error('Failed to fetch apps:', error)
    } finally {
      setLoadingApps(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await appAPI.getAppCategories()
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search will be handled by useEffect with debounce
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category)
    // Category change will be handled by useEffect with debounce
  }

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: 'Platform Patungan Bersama',
      description: 'Buat grup dengan teman-teman untuk patungan subscription aplikasi SaaS favorit'
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary-600" />,
      title: 'Pembayaran Mudah',
      description: 'Integrasi Midtrans untuk pembayaran yang aman dan terpercaya'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'Aman & Terpercaya',
      description: 'Sistem keamanan terbaik untuk melindungi data dan transaksi Anda'
    },
    {
      icon: <Zap className="h-8 w-8 text-primary-600" />,
      title: 'Berbagi Akses',
      description: 'Berbagi akses aplikasi dengan anggota grup secara mudah dan aman'
    }
  ]

  const stats = [
    { label: 'Pengguna Aktif', value: '100+' },
    { label: 'Grup Dibuat', value: '20+' },
    { label: 'Penghematan', value: '90%' },
    { label: 'Aplikasi Didukung', value: '10+' }
  ]

  const testimonials = [
    {
      name: 'Ahmad Rizki',
      role: 'Mahasiswa',
      content: 'SALOME membantu saya menghemat biaya Netflix dan Spotify. Sekarang bisa nonton dan dengar musik tanpa khawatir budget!',
      rating: 5
    },
    {
      name: 'Sarah Putri',
      role: 'Freelancer',
      content: 'Platform yang sangat user-friendly. Mudah buat grup dan patungan dengan teman-teman. Recommended banget!',
      rating: 5
    },
    {
      name: 'Budi Santoso',
      role: 'Karyawan',
      content: 'Sistem pembayaran yang aman dan transparan. Tidak ada hidden cost dan semua transaksi tercatat dengan jelas.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* User Already Logged In */}
      {user && (
        <div className="bg-primary-600 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.full_name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">Halo, {user.full_name}!</p>
                <p className="text-xs text-primary-100">Anda sudah login</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Ke Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout()
                  toast.success('Berhasil logout!')
                }}
                className="text-white hover:bg-white/10"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                SALOME
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={toggleAuthMode}
                className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              >
                {isLogin ? 'Daftar' : 'Login'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="space-y-4 sm:space-y-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4"
                >
                  <div className="flex items-center space-x-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    <span>Platform Patungan SaaS Terbaik di Indonesia</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-success-100 text-success-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Crown className="h-4 w-4" />
                    <span>100% Cepat dan Mudah</span>
                  </div>
                </motion.div>

                <motion.h1 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight"
                >
                  Solusi Patungan Satu{' '}
                  <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    Software
                  </span>{' '}
                  Rame - Rame
                </motion.h1>

                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl"
                >
                  Tanpa Ribet pembayaran Tanpa susah cari teman patungan
                  {/* Hemat hingga <span className="font-bold text-primary-600">90%</span> dengan patungan subscription aplikasi favorit bersama teman-teman.  */}
                  <span className="block mt-2 text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300">Amanah, mudah, dan terpercaya.</span>
                </motion.p>
              </div>

              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/join')}
                  className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg hover:scale-105 transition-all duration-200 border-2"
                >
                  <Target className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Join Grup
                </Button>
              </motion.div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-6 sm:pt-8"
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Auth Form */}
            <div id="auth-form" className="lg:pl-12 mt-8 lg:mt-0">
              <Card className="p-6 sm:p-8 max-w-md mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {isLogin ? 'Masuk ke SALOME' : 'Daftar ke SALOME'}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
                    {isLogin ? 'Selamat datang kembali!' : 'Bergabunglah dengan komunitas kami'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  {!isLogin && (
                    <Input
                      label="Nama Lengkap"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required={!isLogin}
                    />
                  )}

                  {!isLogin && (
                    <Input
                      label="Nomor WhatsApp"
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      value={formData.whatsappNumber}
                      onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                      required={!isLogin}
                    />
                  )}

                  <Input
                    label="Email"
                    type="email"
                    placeholder="Masukkan email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />

                  <div className="space-y-2">
                    <label className="label">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                        className="input w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                    loading={loading}
                  >
                    {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
                  </Button>
                </form>

                <div className="mt-6 text-center space-y-2">
                  {isLogin && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                      >
                        Lupa password?
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {isLogin ? 'Belum punya akun? Daftar sekarang' : 'Sudah punya akun? Masuk di sini'}
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Apps Section - MVP */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pilih Aplikasi Favorit Anda
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Lebih dari 50+ aplikasi SaaS populer siap untuk dipatungan. Hemat hingga 90% dengan bergabung bersama teman-teman.
            </p>

            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto mb-12">
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Cari aplikasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </form>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant={selectedCategory === '' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange('')}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Apps Grid */}
          {loadingApps ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {apps.map((app: any, index: number) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.08,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.03,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  className="group"
                >
                  <Card className="p-6 hover:shadow-xl transition-all duration-300 dark:bg-gray-800 border-0 shadow-lg group-hover:shadow-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        whileHover={{ 
                          rotate: 8,
                          scale: 1.1,
                          transition: { duration: 0.3, ease: "easeOut" }
                        }}
                        className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-md"
                      >
                        {app.icon_url ? (
                          <img 
                            src={app.icon_url} 
                            alt={app.name}
                            className="w-8 h-8"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`w-8 h-8 bg-primary-100 rounded flex items-center justify-center ${app.icon_url ? 'hidden' : ''}`}>
                          <span className="text-primary-600 font-bold text-sm">
                            {app.name.charAt(0)}
                          </span>
                        </div>
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                          {app.name}
                          {app.is_popular && (
                            <Star className="h-4 w-4 text-yellow-500 ml-2 fill-current" />
                          )}
                        </h3>
                        <Badge variant="gray" className="text-xs">
                          {app.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {app.description}
                  </p>

                  {/* Price Information */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Harga per user:</span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {formatCurrency(app.price_per_user)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{app.total_members} anggota</span>
                      <span>Total: {formatCurrency(app.total_price)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <motion.div
                      whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      whileTap={{ 
                        scale: 0.95,
                        transition: { duration: 0.1, ease: "easeIn" }
                      }}
                      className="flex-1"
                    >
                      <Button
                        onClick={() => router.push(`/app/${app.id}`)}
                        className="w-full group-hover:shadow-lg transition-all duration-300"
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Detail
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      whileTap={{ 
                        scale: 0.95,
                        transition: { duration: 0.1, ease: "easeIn" }
                      }}
                      className="flex-1"
                    >
                      <Button
                        onClick={() => router.push(`/join?app=${app.id}`)}
                        variant="outline"
                        className="w-full group-hover:shadow-lg transition-all duration-300"
                        size="sm"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Join Grup
                      </Button>
                    </motion.div>
                  </div>

                  {app.website_url && (
                    <motion.div
                      whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      whileTap={{ 
                        scale: 0.95,
                        transition: { duration: 0.1, ease: "easeIn" }
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 group-hover:shadow-lg transition-all duration-300"
                        onClick={() => window.open(app.website_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Kunjungi Website
                      </Button>
                    </motion.div>
                  )}
                </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* View All Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => router.push('/browse')}
              size="lg"
              className="px-8"
            >
              Lihat Semua Aplikasi
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Mengapa Pilih{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                SALOME?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Platform terbaik untuk patungan subscription aplikasi SaaS dengan fitur-fitur unggulan
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 h-full border-2 hover:border-primary-200 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600">
                  <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Cara Kerja SALOME
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Hanya 3 langkah mudah untuk mulai patungan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Join atau Buat Grup</h3>
              <p className="text-gray-600 dark:text-gray-300">Join atau Buat grup kamu sendiri dan undang teman-teman dengan kode undangan</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tambah Subscription</h3>
              <p className="text-gray-600 dark:text-gray-300">Tambahkan aplikasi yang ingin dipatungan dan atur pembagian biaya</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Bayar & Nikmati</h3>
              <p className="text-gray-600 dark:text-gray-300">Bayar bagian Anda dan nikmati akses aplikasi bersama</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Kata Pengguna SALOME
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Ribuan pengguna sudah merasakan manfaatnya
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 dark:bg-gray-800">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-700 dark:to-secondary-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Siap Hemat Bersama?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Bergabunglah dengan ribuan pengguna yang sudah menghemat jutaan rupiah
          </p>
          <Button
            size="lg"
            onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg"
          >
            Mulai Sekarang
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lupa Password
              </h3>
              <button
                onClick={resetForgotPassword}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {forgotPasswordStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Masukkan email Anda untuk menerima kode OTP
                </p>
                <Input
                  label="Email"
                  type="email"
                  placeholder="Masukkan email"
                  value={forgotPasswordData.email}
                  onChange={(e) => setForgotPasswordData(prev => ({ ...prev, email: e.target.value }))}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleForgotPasswordEmail}
                    disabled={forgotPasswordLoading}
                    loading={forgotPasswordLoading}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Kirim OTP
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForgotPassword}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            )}

            {forgotPasswordStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Masukkan kode OTP yang dikirim ke {forgotPasswordData.email}
                </p>
                
                {/* Rate limiting warning */}
                {otpAttempts > 0 && (
                  <div className={`p-3 rounded-lg text-sm ${
                    otpAttempts >= 6 
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {otpAttempts >= 6 ? (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Terlalu banyak percobaan. Tunggu 2 jam sebelum mencoba lagi.</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Sisa percobaan: {6 - otpAttempts}</span>
                      </div>
                    )}
                  </div>
                )}

                <Input
                  label="Kode OTP"
                  placeholder="Masukkan 6 digit kode OTP"
                  value={forgotPasswordData.otpCode}
                  onChange={(e) => setForgotPasswordData(prev => ({ ...prev, otpCode: e.target.value }))}
                  maxLength={6}
                  disabled={otpAttempts >= 6}
                />
                
                {/* Resend OTP button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={otpResendCooldown > 0 || forgotPasswordLoading || otpAttempts >= 6}
                    className={`text-sm ${
                      otpResendCooldown > 0 || otpAttempts >= 6
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
                    }`}
                  >
                    {otpResendCooldown > 0 
                      ? `Kirim ulang dalam ${otpResendCooldown}s`
                      : 'Kirim ulang OTP'
                    }
                  </button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleForgotPasswordOTP}
                    disabled={forgotPasswordLoading || otpAttempts >= 6}
                    loading={forgotPasswordLoading}
                    className="flex-1"
                  >
                    Lanjutkan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setForgotPasswordStep(1)}
                  >
                    Kembali
                  </Button>
                </div>
              </div>
            )}

            {forgotPasswordStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Masukkan password baru Anda
                </p>
                <Input
                  label="Password Baru"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password baru"
                  value={forgotPasswordData.newPassword}
                  onChange={(e) => setForgotPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
                <Input
                  label="Konfirmasi Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Konfirmasi password baru"
                  value={forgotPasswordData.confirmPassword}
                  onChange={(e) => setForgotPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePasswordVisibility}
                  className="w-full"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'} Password
                </Button>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleForgotPasswordReset}
                    disabled={forgotPasswordLoading}
                    loading={forgotPasswordLoading}
                    className="flex-1"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Ubah Password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setForgotPasswordStep(2)}
                  >
                    Kembali
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-2xl font-bold">SALOME</span>
              </div>
              <p className="text-gray-400 mb-4">
                Platform patungan SaaS terpercaya di Indonesia. Hemat hingga 90% dengan sistem pembagian biaya yang adil.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Sosial Media</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://discord.gg/j46nFfdY" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Discord
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/produk/patungan-grup" className="hover:text-white transition-colors">
                    Patungan Grup
                  </a>
                </li>
                <li>
                  <a href="/produk/account-sharing" className="hover:text-white transition-colors">
                    Account Sharing
                  </a>
                </li>
                <li>
                  <a href="/support/bantuan" className="hover:text-white transition-colors">
                    Bantuan
                  </a>
                </li>
                <li>
                  <a href="/support/kontak" className="hover:text-white transition-colors">
                    Kontak
                  </a>
                </li>
                <li>
                  <a href="/support/faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 SALOME. Platform patungan SaaS terpercaya.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
