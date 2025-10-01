import { Metadata } from 'next'
import { Users, Shield, CreditCard, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import PublicNavbar from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Patungan Grup - SALOME',
  description: 'Sistem patungan grup yang aman dan terpercaya untuk berbagi subscription aplikasi SaaS bersama teman-teman.',
}

export default function PatunganGrupPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Patungan Grup
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Sistem patungan grup yang aman dan terpercaya untuk berbagi subscription aplikasi SaaS bersama teman-teman.
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
              Grup Terorganisir
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Buat dan kelola grup patungan dengan mudah. Setiap grup memiliki admin yang bertanggung jawab.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Keamanan Terjamin
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sistem verifikasi email dan pembayaran yang aman. Data pribadi terlindungi dengan enkripsi.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Pembayaran Mudah
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Integrasi dengan Midtrans untuk pembayaran yang aman dan mudah. Dukungan berbagai metode pembayaran.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Cara Kerja Patungan Grup
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Langkah-langkah sederhana untuk memulai patungan grup
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Buat Grup
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pilih aplikasi yang ingin dipatung dan buat grup baru
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Undang Teman
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Bagikan kode undangan atau link grup kepada teman-teman
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Bayar Bersama
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Lakukan pembayaran sesuai bagian masing-masing
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nikmati Bersama
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Dapatkan akses dan nikmati aplikasi bersama-sama
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Keuntungan Patungan Grup
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Hemat Hingga 90%
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Bagikan biaya subscription dengan teman-teman dan hemat hingga 90% dari harga normal.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Akses Premium
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Nikmati fitur premium dari aplikasi favorit dengan harga yang lebih terjangkau.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Fleksibel
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Keluar dari grup kapan saja atau bergabung dengan grup lain sesuai kebutuhan.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Transparan
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Semua transaksi dan pembagian biaya tercatat dengan jelas dan transparan.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aman & Terpercaya
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sistem keamanan yang ketat dan verifikasi identitas untuk melindungi semua pihak.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Mudah Digunakan
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Interface yang intuitif dan proses yang sederhana untuk semua pengguna.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Memulai Patungan Grup?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Bergabunglah dengan ribuan pengguna yang sudah menghemat biaya subscription
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                Daftar Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                Lihat Aplikasi Tersedia
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
