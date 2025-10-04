export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        {/* Loading Animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          </div>
          
          {/* Floating dots */}
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-pulse"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Memuat...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Sedang menyiapkan halaman untuk Anda
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
