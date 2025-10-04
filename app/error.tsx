'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Home, RefreshCw, AlertTriangle, Bug } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Error Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-8 text-center shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Terjadi Kesalahan
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan sedang bekerja untuk memperbaikinya.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center mb-2">
                <Bug className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error Details (Development)
                </span>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={reset}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Coba Lagi
            </Button>
            
            <Link href="/">
              <Button 
                variant="outline"
                className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <Home className="w-5 h-5 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Jika masalah berlanjut, silakan{' '}
              <a 
                href="mailto:support@salome.cloudfren.id" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                hubungi tim support
              </a>
              {' '}dengan Error ID: {error.digest || 'N/A'}
            </p>
          </div>
        </Card>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-200 dark:bg-red-800 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-200 dark:bg-orange-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-5 w-16 h-16 bg-yellow-200 dark:bg-yellow-800 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
    </div>
  )
}
