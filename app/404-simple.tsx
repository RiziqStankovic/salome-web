import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Home, Search, Users } from 'lucide-react'

export default function Simple404() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            404
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/" className="block">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg">
                <Home className="w-6 h-6 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Atau coba halaman ini:
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/browse" 
                className="flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse
              </Link>
              
              <Link 
                href="/groups" 
                className="flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Users className="w-4 h-4 mr-2" />
                Groups
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Butuh bantuan?{' '}
              <a 
                href="mailto:support@salome.cloudfren.id" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Hubungi Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
