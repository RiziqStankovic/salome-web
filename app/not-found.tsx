import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Home, Search, RefreshCw } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* 404 Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              404
            </h1>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-8 text-center shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Halaman Tidak Ditemukan
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Sepertinya halaman yang Anda cari tidak ada atau telah dipindahkan. 
            Jangan khawatir, mari kita bantu Anda menemukan apa yang Anda butuhkan.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                <Home className="w-5 h-5 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
            
            <Link href="javascript:history.back()">
              <Button 
                variant="outline"
                className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <Home className="w-5 h-5 mr-2" />
                Kembali Sebelumnya
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Atau coba halaman populer ini:
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link 
                href="/browse" 
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <div className="flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  <span className="font-medium">Jelajahi Aplikasi</span>
                </div>
              </Link>
              
              <Link 
                href="/groups" 
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span className="font-medium">Grup Patungan</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>
              Jika Anda yakin ini adalah kesalahan, silakan{' '}
              <a 
                href="mailto:support@salome.cloudfren.id" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                hubungi tim support
              </a>
              {' '}kami.
            </p>
          </div>
        </Card>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-5 w-16 h-16 bg-yellow-200 dark:bg-yellow-800 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
    </div>
  )
}
