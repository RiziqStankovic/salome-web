import { Metadata } from 'next'
import { CreditCard, Shield, Smartphone, CheckCircle, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import PublicNavbar from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Payment Gateway - SALOME',
  description: 'Sistem pembayaran yang aman dan terpercaya dengan dukungan berbagai metode pembayaran populer di Indonesia.',
}

export default function PaymentGatewayPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Gateway
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Sistem pembayaran yang aman dan terpercaya dengan dukungan berbagai metode pembayaran populer di Indonesia.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Metode Pembayaran yang Didukung
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Pilih metode pembayaran yang paling nyaman untuk Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Kartu Kredit/Debit
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Visa, Mastercard, JCB
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              E-Wallet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              OVO, DANA, GoPay, LinkAja
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Bank Transfer
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              BCA, Mandiri, BNI, BRI
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Virtual Account
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              BCA VA, Mandiri VA, BNI VA
            </p>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Keamanan Terjamin
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Data dan transaksi Anda dilindungi dengan standar keamanan tertinggi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                SSL Encryption
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Semua data transaksi dienkripsi dengan SSL 256-bit untuk keamanan maksimal.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                PCI DSS Compliant
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Memenuhi standar keamanan internasional PCI DSS untuk perlindungan data kartu.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Fraud Detection
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sistem deteksi fraud canggih untuk mencegah transaksi mencurigakan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Keuntungan Payment Gateway SALOME
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Transaksi Cepat
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Proses pembayaran yang cepat dan real-time dengan konfirmasi instan.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Biaya Kompetitif
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Biaya transaksi yang kompetitif dan transparan tanpa hidden fees.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Dukungan 24/7
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Tim support siap membantu Anda 24 jam sehari, 7 hari seminggu.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Multi-Currency
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Dukungan berbagai mata uang termasuk Rupiah, Dollar, dan Euro.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Refund Otomatis
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sistem refund otomatis untuk transaksi yang dibatalkan atau gagal.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Laporan Lengkap
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Laporan transaksi lengkap dan detail untuk keperluan accounting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration */}
      <div className="bg-gray-50 dark:bg-gray-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Integrasi Mudah
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              API yang mudah digunakan untuk integrasi dengan sistem Anda
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Fitur API
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">RESTful API yang mudah digunakan</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Webhook untuk notifikasi real-time</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">SDK untuk berbagai bahasa pemrograman</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Dokumentasi lengkap dan contoh kode</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Dukungan Teknis
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Tim developer berpengalaman</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Testing environment untuk development</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Monitoring dan alerting 24/7</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">SLA 99.9% uptime guarantee</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Mulai Gunakan Payment Gateway
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Bergabunglah dengan ribuan merchant yang sudah mempercayai sistem pembayaran kami
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                Daftar Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/kontak">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                Hubungi Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
