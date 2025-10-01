import { Metadata } from 'next'
import { CheckCircle, AlertCircle, XCircle, Clock, Server, Database, Globe } from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'

export const metadata: Metadata = {
  title: 'Status Layanan - SALOME',
  description: 'Pantau status layanan SALOME secara real-time. Lihat status server, database, dan komponen sistem lainnya.',
}

const statusData = [
  {
    name: 'Website',
    status: 'operational',
    description: 'Situs web utama SALOME',
    uptime: '99.9%'
  },
  {
    name: 'API Server',
    status: 'operational',
    description: 'Server API untuk aplikasi dan integrasi',
    uptime: '99.8%'
  },
  {
    name: 'Database',
    status: 'operational',
    description: 'Database utama untuk menyimpan data pengguna',
    uptime: '99.9%'
  },
  {
    name: 'Payment Gateway',
    status: 'operational',
    description: 'Gateway pembayaran Midtrans',
    uptime: '99.7%'
  },
  {
    name: 'Email Service',
    status: 'operational',
    description: 'Layanan email untuk notifikasi dan verifikasi',
    uptime: '99.5%'
  },
  {
    name: 'File Storage',
    status: 'operational',
    description: 'Penyimpanan file dan gambar',
    uptime: '99.9%'
  }
]

const incidents = [
  {
    id: 1,
    title: 'Maintenance terjadwal - Database optimization',
    status: 'resolved',
    date: '2024-01-15',
    description: 'Maintenance terjadwal untuk optimasi database telah selesai. Semua layanan kembali normal.',
    duration: '2 jam'
  },
  {
    id: 2,
    title: 'Peningkatan performa API',
    status: 'resolved',
    date: '2024-01-10',
    description: 'Peningkatan performa API server telah selesai. Response time membaik hingga 40%.',
    duration: '1 jam'
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'degraded':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
    case 'outage':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'maintenance':
      return <Clock className="h-5 w-5 text-blue-500" />
    default:
      return <CheckCircle className="h-5 w-5 text-green-500" />
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'operational':
      return 'Beroperasi Normal'
    case 'degraded':
      return 'Penurunan Performa'
    case 'outage':
      return 'Gangguan'
    case 'maintenance':
      return 'Maintenance'
    default:
      return 'Beroperasi Normal'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
    case 'degraded':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
    case 'outage':
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
    case 'maintenance':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
    default:
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
  }
}

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Status Layanan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Pantau status layanan SALOME secara real-time. Semua sistem beroperasi normal.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
                Semua Sistem Beroperasi Normal
              </h2>
              <p className="text-green-600 dark:text-green-300">
                Semua layanan SALOME berfungsi dengan baik. Tidak ada gangguan yang dilaporkan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Status Komponen Layanan
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statusData.map((service, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {service.name === 'Website' && <Globe className="h-5 w-5 text-gray-500 mr-2" />}
                  {service.name === 'API Server' && <Server className="h-5 w-5 text-gray-500 mr-2" />}
                  {service.name === 'Database' && <Database className="h-5 w-5 text-gray-500 mr-2" />}
                  {service.name === 'Payment Gateway' && <CheckCircle className="h-5 w-5 text-gray-500 mr-2" />}
                  {service.name === 'Email Service' && <CheckCircle className="h-5 w-5 text-gray-500 mr-2" />}
                  {service.name === 'File Storage' && <CheckCircle className="h-5 w-5 text-gray-500 mr-2" />}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {service.name}
                  </h3>
                </div>
                {getStatusIcon(service.status)}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                {service.description}
              </p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {getStatusText(service.status)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Uptime: {service.uptime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Insiden Terbaru
        </h2>
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {getStatusIcon(incident.status)}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
                    {incident.title}
                  </h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                  {getStatusText(incident.status)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                {incident.description}
              </p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                <span className="mr-4">{incident.date}</span>
                <span>Durasi: {incident.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Metrik Performa
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                99.9%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Uptime Rata-rata
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                &lt;200ms
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Response Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                99.99%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Availability
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                24/7
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Monitoring
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Melaporkan Masalah?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Jika Anda mengalami masalah yang tidak tercantum di sini, hubungi tim support kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/support/kontak" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700">
              Hubungi Support
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
  