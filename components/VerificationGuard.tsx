'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface VerificationGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function VerificationGuard({ children, fallback }: VerificationGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Check if user is verified
      if (user.status === 'active') {
        // User is verified, redirect to dashboard if on verify-email page
        const currentPath = window.location.pathname
        if (currentPath === '/verify-email') {
          router.push('/dashboard')
        }
      } else {
        // User is not verified, redirect to verification page
        const currentPath = window.location.pathname
        if (currentPath !== '/verify-email') {
          router.push(`/verify-email?email=${encodeURIComponent(user.email)}&purpose=email_verification`)
        }
      }
    }
  }, [user?.status, loading, router]) // Only depend on user.status, not entire user object

  // Show loading while checking user status
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Memuat...</p>
        </div>
      </div>
    )
  }

  // Show fallback if user is not verified
  if (user && user.status !== 'active') {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center dark:bg-gray-800">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifikasi Email Diperlukan
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Untuk mengakses fitur ini, Anda perlu memverifikasi email terlebih dahulu.
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => router.push(`/verify-email?email=${encodeURIComponent(user.email)}&purpose=email_verification`)}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Verifikasi Email Sekarang
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Kembali ke Beranda
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300 text-left">
                  <p className="font-medium mb-1">Langkah verifikasi:</p>
                  <ol className="space-y-1 text-xs">
                    <li>1. Buka email yang terdaftar</li>
                    <li>2. Cari email dari SALOME</li>
                    <li>3. Masukkan kode OTP 6 digit</li>
                    <li>4. Akun Anda akan aktif</li>
                  </ol>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  // User is verified, show children
  return <>{children}</>
}
