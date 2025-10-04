import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Home, Search, Users } from 'lucide-react'

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            404
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold shadow-lg">
                <Home className="w-5 h-5 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
            
            <Link href="javascript:history.back()" className="block">
              <Button 
                variant="outline"
                className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold"
              >
                <Home className="w-5 h-5 mr-2" />
                Kembali Sebelumnya
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Atau coba halaman ini:
            </p>
            
            <div className="flex justify-center space-x-4">
              <Link 
                href="/browse" 
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Search className="w-4 h-4 mr-1" />
                Browse
              </Link>
              
              <Link 
                href="/groups" 
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Users className="w-4 h-4 mr-1" />
                Groups
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
