import { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import PublicNavbar from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Kontak - SALOME',
  description: 'Hubungi tim SALOME untuk pertanyaan, bantuan, atau kerjasama. Kami siap membantu Anda 24/7.',
}

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Hubungi Kami
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Tim SALOME siap membantu Anda. Hubungi kami melalui berbagai saluran komunikasi yang tersedia.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Email
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              support@salome.cloudfren.id
            </p>
            <Button variant="outline" className="w-full">
              Kirim Email
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Telepon
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              +62 21 1234 5678
            </p>
            <Button variant="outline" className="w-full">
              Hubungi
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Live Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Chat langsung 24/7
            </p>
            <Button className="w-full">
              Mulai Chat
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Alamat
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Jakarta, Indonesia
            </p>
            <Button variant="outline" className="w-full">
              Lihat Peta
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Kirim Pesan
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Isi form di bawah ini dan tim kami akan menghubungi Anda segera
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Masukkan email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subjek
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Masukkan subjek pesan"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Pilih kategori</option>
                <option value="general">Pertanyaan Umum</option>
                <option value="technical">Masalah Teknis</option>
                <option value="billing">Pembayaran & Billing</option>
                <option value="account">Akun & Profil</option>
                <option value="groups">Grup & Patungan</option>
                <option value="security">Keamanan</option>
                <option value="partnership">Kerjasama</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pesan
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tuliskan pesan Anda di sini..."
              ></textarea>
            </div>

            <div className="text-center">
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                <Send className="mr-2 h-5 w-5" />
                Kirim Pesan
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Office Hours */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Jam Operasional
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Tim kami siap melayani Anda pada jam-jam berikut
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Live Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              24 jam sehari, 7 hari seminggu
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Email Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              24/7 (Response dalam 2 jam)
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Telepon
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Senin - Jumat<br />
              09:00 - 18:00 WIB
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Link */}
      <div className="bg-gray-50 dark:bg-gray-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tidak Menemukan yang Anda Cari?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Cek FAQ kami untuk jawaban cepat atau hubungi tim support untuk bantuan lebih lanjut.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/support/faq" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700">
              Lihat FAQ
            </a>
            <a href="/support/bantuan" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              Pusat Bantuan
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
