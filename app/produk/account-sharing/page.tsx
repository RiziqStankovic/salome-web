import { Metadata } from 'next'
import { Users, Shield, Key, CheckCircle, ArrowRight, Lock, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import PublicNavbar from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Account Sharing - SALOME',
  description: 'Sistem berbagi akun yang aman dan terorganisir untuk berbagai aplikasi SaaS dengan kontrol akses yang ketat.',
}

export default function AccountSharingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Account Sharing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Sistem berbagi akun yang aman dan terorganisir untuk berbagai aplikasi SaaS dengan kontrol akses yang ketat.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Manajemen Akses
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Kontrol siapa yang bisa mengakses akun dan kapan mereka bisa menggunakannya.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Keamanan Tinggi
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enkripsi end-to-end dan sistem autentikasi multi-faktor untuk keamanan maksimal.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
              <Key className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Password Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sistem manajemen password yang aman dengan rotasi otomatis dan backup.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Cara Kerja Account Sharing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Proses yang aman dan terorganisir untuk berbagi akses akun
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Setup Akun
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Admin grup membuat akun aplikasi dan mengatur akses
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Verifikasi Member
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Semua member diverifikasi dan mendapat akses sesuai jadwal
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Monitoring Usage
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sistem memantau penggunaan dan mencegah konflik akses
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Rotasi Password
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Password dirotasi secara berkala untuk keamanan optimal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Fitur Keamanan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Perlindungan maksimal untuk data dan akses akun Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Enkripsi End-to-End
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Semua data akun dienkripsi dengan standar militer AES-256.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Activity Monitoring
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Pantau aktivitas penggunaan akun secara real-time dan deteksi anomali.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Password Rotation
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Rotasi password otomatis untuk menjaga keamanan akun.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Access Control
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Kontrol akses granular berdasarkan waktu, lokasi, dan perangkat.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Conflict Prevention
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sistem mencegah konflik akses simultan dan mengatur jadwal penggunaan.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              User Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Kelola pengguna dengan role-based access dan audit trail lengkap.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gray-50 dark:bg-gray-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Keuntungan Account Sharing
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Keamanan Maksimal
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Sistem keamanan berlapis dengan enkripsi dan monitoring 24/7.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Kontrol Penuh
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Admin memiliki kontrol penuh atas akses dan penggunaan akun.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Transparansi
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Semua aktivitas tercatat dan dapat diaudit oleh admin.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Mudah Digunakan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Interface yang intuitif untuk semua level pengguna.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Skalabilitas
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Dapat menangani ratusan akun dan ribuan pengguna.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Backup & Recovery
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Sistem backup otomatis dan recovery yang cepat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Mulai Account Sharing yang Aman
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Bergabunglah dengan platform account sharing terpercaya di Indonesia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                Mulai Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/bantuan">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
