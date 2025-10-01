'use client'

import { ChevronDown, Search, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import PublicNavbar from '@/components/PublicNavbar'

const faqData = [
  {
    category: 'Memulai',
    id: 'getting-started',
    questions: [
      {
        question: 'Bagaimana cara mendaftar di SALOME?',
        answer: 'Anda bisa mendaftar dengan mudah melalui halaman utama. Klik tombol "Daftar" dan isi informasi yang diperlukan seperti nama, email, dan password. Setelah itu, verifikasi email Anda untuk mengaktifkan akun.'
      },
      {
        question: 'Apakah SALOME gratis?',
        answer: 'SALOME gratis untuk digunakan. Kami hanya mengambil biaya admin kecil dari setiap transaksi patungan untuk operasional platform. Tidak ada biaya tersembunyi atau biaya bulanan.'
      },
      {
        question: 'Aplikasi apa saja yang bisa dipatung?',
        answer: 'Kami mendukung berbagai aplikasi populer seperti Netflix, Spotify, YouTube Premium, Disney+, Canva, Adobe Creative Suite, Microsoft Office 365, dan masih banyak lagi. Daftar lengkap bisa dilihat di halaman Browse Apps.'
      }
    ]
  },
  {
    category: 'Akun & Profil',
    id: 'account',
    questions: [
      {
        question: 'Bagaimana cara mengubah password?',
        answer: 'Masuk ke halaman Pengaturan > Keamanan, lalu klik "Ubah Password". Masukkan password lama dan password baru, kemudian konfirmasi perubahan.'
      },
      {
        question: 'Bisakah saya mengubah email?',
        answer: 'Ya, Anda bisa mengubah email di halaman Pengaturan > Profil. Namun, Anda perlu memverifikasi email baru sebelum perubahan diterapkan.'
      },
      {
        question: 'Bagaimana cara menghapus akun?',
        answer: 'Untuk menghapus akun, hubungi tim support kami. Pastikan Anda sudah menyelesaikan semua transaksi dan keluar dari semua grup sebelum menghapus akun.'
      }
    ]
  },
  {
    category: 'Pembayaran',
    id: 'payment',
    questions: [
      {
        question: 'Metode pembayaran apa saja yang tersedia?',
        answer: 'Kami mendukung berbagai metode pembayaran seperti kartu kredit/debit (Visa, Mastercard, JCB), e-wallet (OVO, DANA, GoPay, LinkAja), transfer bank (BCA, Mandiri, BNI, BRI), dan virtual account.'
      },
      {
        question: 'Bagaimana cara refund jika transaksi gagal?',
        answer: 'Jika transaksi gagal, dana akan otomatis dikembalikan ke rekening Anda dalam 1-3 hari kerja. Jika tidak, hubungi tim support kami untuk bantuan lebih lanjut.'
      },
      {
        question: 'Apakah ada biaya transaksi?',
        answer: 'Ada biaya admin kecil untuk setiap transaksi patungan. Biaya ini ditampilkan dengan jelas sebelum Anda melakukan pembayaran. Tidak ada biaya tersembunyi.'
      }
    ]
  },
  {
    category: 'Grup & Patungan',
    id: 'groups',
    questions: [
      {
        question: 'Bagaimana cara membuat grup patungan?',
        answer: 'Pilih aplikasi yang ingin dipatung di halaman Browse Apps, klik "Buat Grup", isi detail grup (nama, deskripsi, jumlah anggota), lalu undang teman-teman untuk bergabung.'
      },
      {
        question: 'Bisakah saya keluar dari grup?',
        answer: 'Ya, Anda bisa keluar dari grup kapan saja. Admin grup akan mengatur penggantian anggota atau pengembalian dana sesuai kebijakan grup.'
      },
      {
        question: 'Bagaimana cara bergabung dengan grup?',
        answer: 'Anda bisa bergabung dengan grup melalui kode undangan yang dibagikan admin, atau mencari grup publik yang tersedia di halaman Join Groups.'
      },
      {
        question: 'Apa peran admin grup?',
        answer: 'Admin grup bertanggung jawab untuk mengelola pembayaran, membagikan akses akun, mengatur jadwal penggunaan, dan memastikan semua anggota mendapat akses yang adil.'
      }
    ]
  },
  {
    category: 'Masalah Teknis',
    id: 'technical',
    questions: [
      {
        question: 'Website tidak bisa diakses, apa yang harus dilakukan?',
        answer: 'Coba refresh halaman atau clear cache browser. Jika masih bermasalah, cek koneksi internet Anda atau hubungi tim support kami.'
      },
      {
        question: 'Aplikasi mobile tidak tersedia?',
        answer: 'Saat ini SALOME hanya tersedia dalam versi web. Aplikasi mobile sedang dalam pengembangan dan akan segera hadir.'
      },
      {
        question: 'Bagaimana cara melaporkan bug?',
        answer: 'Anda bisa melaporkan bug melalui halaman Kontak atau live chat. Sertakan detail seperti browser yang digunakan, langkah-langkah yang menyebabkan bug, dan screenshot jika memungkinkan.'
      }
    ]
  },
  {
    category: 'Keamanan',
    id: 'security',
    questions: [
      {
        question: 'Apakah data saya aman?',
        answer: 'Ya, kami menggunakan enkripsi end-to-end dan standar keamanan internasional untuk melindungi data pribadi Anda. Semua transaksi dilakukan melalui gateway pembayaran yang terpercaya.'
      },
      {
        question: 'Bagaimana cara melindungi akun saya?',
        answer: 'Gunakan password yang kuat, jangan bagikan kredensial login, dan selalu logout setelah menggunakan perangkat bersama. Aktifkan 2FA jika tersedia.'
      },
      {
        question: 'Apa yang harus dilakukan jika akun diretas?',
        answer: 'Segera hubungi tim support kami dan ubah password. Kami akan membantu mengamankan akun Anda dan memulihkan akses jika memungkinkan.'
      }
    ]
  }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({})

  const toggleItem = (categoryId: string, questionIndex: number) => {
    const key = `${categoryId}-${questionIndex}`
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const filteredData = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              FAQ - Pertanyaan yang Sering Diajukan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Temukan jawaban untuk pertanyaan umum tentang SALOME dan cara menggunakannya.
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Cari pertanyaan atau jawaban..."
          />
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredData.map((category) => (
          <div key={category.id} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {category.category}
            </h2>
            <div className="space-y-4">
              {category.questions.map((item, index) => {
                const key = `${category.id}-${index}`
                const isOpen = openItems[key]
                
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <button
                      onClick={() => toggleItem(category.id, index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.question}
                      </span>
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Tidak ada hasil ditemukan
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Coba gunakan kata kunci yang berbeda atau hubungi tim support kami.
            </p>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Masih Ada Pertanyaan?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Tim support kami siap membantu Anda 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/support/kontak" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-100">
              Hubungi Support
            </a>
            <a href="/support/bantuan" className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-primary-600">
              Pusat Bantuan
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
