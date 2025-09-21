'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import OTPInput, { OTPInputRef } from '@/components/ui/OTPInput'
import { otpAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const email = searchParams.get('email')
  const purpose = searchParams.get('purpose') || 'email_verification'

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [verified, setVerified] = useState(false)
  const otpInputRef = useRef<OTPInputRef>(null)

  useEffect(() => {
    if (!email) {
      router.push('/')
      return
    }

    // Start countdown for resend
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, router])

  const handleOTPComplete = async (otpCode: string) => {
    setOtp(otpCode)
    // Auto-submit when OTP is complete
    if (otpCode.length === 6) {
      await handleVerify()
    }
  }

  const handleOTPChange = (otpCode: string) => {
    setOtp(otpCode)
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Masukkan kode OTP 6 digit')
      return
    }

    setLoading(true)
    try {
      const response = await otpAPI.verify(email!, otp, purpose as any)
      
      if (response.data.valid) {
        setVerified(true)
        toast.success('Email berhasil diverifikasi!')
        
        // Refresh user data to update status
        await refreshUser()
        
        // Redirect immediately to dashboard
        router.push('/dashboard')
      } else {
        toast.error(response.data.message || 'Kode OTP tidak valid')
        // Clear OTP input on error
        otpInputRef.current?.clearOTP()
        setOtp('')
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      toast.error(error.response?.data?.error || 'Gagal memverifikasi OTP')
      // Clear OTP input on error
      otpInputRef.current?.clearOTP()
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) {
      toast.error(`Tunggu ${countdown} detik sebelum mengirim ulang`)
      return
    }

    setResendLoading(true)
    try {
      await otpAPI.resend(email!, purpose as any)
      toast.success('Kode OTP baru telah dikirim!')
      setCountdown(60)
      
      // Start countdown again
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      console.error('Error resending OTP:', error)
      toast.error(error.response?.data?.error || 'Gagal mengirim ulang OTP')
    } finally {
      setResendLoading(false)
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center max-w-md w-full dark:bg-gray-800">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Terverifikasi!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Email Anda telah berhasil diverifikasi. Mengalihkan ke dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 dark:bg-gray-800">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifikasi Email
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Kami telah mengirim kode verifikasi 6 digit ke
            </p>
            <p className="font-semibold text-primary-600 dark:text-primary-400">
              {email}
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
              Masukkan Kode OTP
            </label>
            <OTPInput
              ref={otpInputRef}
              length={6}
              onComplete={handleOTPComplete}
              onChange={handleOTPChange}
              disabled={loading}
              className="mb-4"
            />
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || loading}
            loading={loading}
            className="w-full mb-4"
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi Email'}
          </Button>

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Tidak menerima kode?
            </p>
            <Button
              onClick={handleResend}
              disabled={countdown > 0 || resendLoading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : countdown > 0 ? (
                `Kirim Ulang (${countdown}s)`
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Kirim Ulang
                </>
              )}
            </Button>
          </div>

          {/* Back Button */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Periksa folder spam jika tidak menemukan email</li>
                  <li>• Kode OTP berlaku selama 5 menit</li>
                  <li>• Maksimal 3 kali percobaan verifikasi</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}