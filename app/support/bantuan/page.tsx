import { Metadata } from 'next'
import { HelpCircle, Search, MessageCircle, Mail, Phone, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import PublicNavbar from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Bantuan - SALOME',
  description: 'Pusat bantuan SALOME dengan panduan lengkap, FAQ, dan dukungan teknis untuk pengguna platform patungan SaaS.',
}

export default function BantuanPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pusat Bantuan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Temukan jawaban untuk pertanyaan Anda atau hubungi tim support kami untuk bantuan lebih lanjut.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Cari bantuan atau pertanyaan Anda..."
          />
        </div>
      </div>

      {/* Quick Help */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Bantuan Cepat
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Pilih kategori yang sesuai dengan masalah Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/support/faq#getting-started" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Memulai
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Panduan lengkap untuk memulai menggunakan SALOME
            </p>
          </Link>

          <Link href="/support/faq#account" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Akun & Profil
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Kelola akun, profil, dan pengaturan keamanan
            </p>
          </Link>

          <Link href="/support/faq#payment" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Pembayaran
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Masalah pembayaran, refund, dan transaksi
            </p>
          </Link>

          <Link href="/support/faq#groups" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Grup & Patungan
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Membuat, mengelola, dan bergabung dengan grup
            </p>
          </Link>

          <Link href="/support/faq#technical" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Masalah Teknis
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Error, bug, dan masalah teknis lainnya
            </p>
          </Link>

          <Link href="/support/faq#security" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Keamanan
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Keamanan akun, privasi, dan perlindungan data
            </p>
          </Link>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Hubungi Tim Support
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Tim support kami siap membantu Anda 24/7
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Live Chat
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Chat langsung dengan tim support kami
              </p>
              <Button className="w-full">
                Mulai Chat
              </Button>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Email Support
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Kirim email ke support@salome.cloudfren.id
              </p>
              <Link href="/support/kontak">
                <Button variant="outline" className="w-full">
                  Kirim Email
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Telepon
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Hubungi +62 21 1234 5678
              </p>
              <Button variant="outline" className="w-full">
                Hubungi Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Temukan jawaban cepat untuk pertanyaan umum
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Bagaimana cara membuat grup patungan?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pilih aplikasi yang ingin dipatung, buat grup baru, dan undang teman-teman untuk bergabung.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Apakah aman untuk berbagi akun?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ya, kami menggunakan enkripsi end-to-end dan sistem keamanan berlapis untuk melindungi data Anda.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Bagaimana cara pembayaran?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pembayaran dilakukan melalui Midtrans dengan berbagai metode seperti kartu kredit, e-wallet, dan transfer bank.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Bisakah saya keluar dari grup?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ya, Anda bisa keluar dari grup kapan saja. Admin akan mengatur penggantian atau pengembalian dana.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Bagaimana jika ada masalah teknis?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Hubungi tim support kami melalui live chat, email, atau telepon. Kami akan membantu menyelesaikan masalah Anda.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Apakah ada biaya tersembunyi?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tidak ada biaya tersembunyi. Semua biaya ditampilkan dengan jelas sebelum Anda melakukan pembayaran.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/support/faq">
            <Button variant="outline" size="lg">
              Lihat Semua FAQ
            </Button>
          </Link>
        </div>
      </div>

      {/* Support Hours */}
      <div className="bg-gray-50 dark:bg-gray-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Jam Operasional Support
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Live Chat
                </h3>
                <p className="text-gray-600 dark:text-gray-300">24/7</p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Email Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300">24/7 (Response dalam 2 jam)</p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Telepon
                </h3>
                <p className="text-gray-600 dark:text-gray-300">Senin - Jumat, 09:00 - 18:00 WIB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
