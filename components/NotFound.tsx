'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Home, Search, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'

interface NotFoundProps {
  title?: string
  description?: string
  showBackButton?: boolean
  showHomeButton?: boolean
  className?: string
}

export default function NotFound({
  title = "Halaman Tidak Ditemukan",
  description = "Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.",
  showBackButton = true,
  showHomeButton = true,
  className = ""
}: NotFoundProps) {
  return (
    <div className={`min-h-[400px] flex items-center justify-center p-6 ${className}`}>
      <Card className="max-w-md w-full p-8 text-center shadow-lg">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {showHomeButton && (
              <Link href="/" className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Beranda
                </Button>
              </Link>
            )}
            
            {showBackButton && (
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            )}
          </div>

          {/* Quick Links */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Coba halaman populer:
            </p>
            
            <div className="flex justify-center space-x-3">
              <Link 
                href="/browse" 
                className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Search className="w-4 h-4 mr-1" />
                Browse
              </Link>
              
              <Link 
                href="/groups" 
                className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Groups
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
