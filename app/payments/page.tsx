'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { 
  CreditCard, 
  Search, 
  Filter,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { paymentAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Payment {
  id: string
  subscription_id: string
  user_id: string
  amount: number
  currency: string
  status: string
  midtrans_transaction_id?: string
  payment_method?: string
  created_at: string
  updated_at: string
  subscription: {
    service_name: string
    plan_name: string
  }
}

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getUserPayments()
      setPayments(response.data.payments || [])
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      toast.error('Gagal memuat daftar pembayaran')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-600" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-error-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Lunas</Badge>
      case 'pending':
        return <Badge variant="warning">Menunggu</Badge>
      case 'failed':
        return <Badge variant="error">Gagal</Badge>
      case 'cancelled':
        return <Badge variant="error">Dibatalkan</Badge>
      default:
        return <Badge variant="gray">{status}</Badge>
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.subscription.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.subscription.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pembayaran</h1>
            <p className="text-gray-600 mt-1">Kelola dan pantau pembayaran subscription Anda</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={fetchPayments}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pembayaran</p>
                <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sudah Dibayar</p>
                <p className="text-3xl font-bold text-success-600">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Menunggu Bayar</p>
                <p className="text-3xl font-bold text-warning-600">
                  {formatCurrency(totalPending)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Cari pembayaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">Semua Status</option>
              <option value="paid">Lunas</option>
              <option value="pending">Menunggu</option>
              <option value="failed">Gagal</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Payments Table */}
        {filteredPayments.length === 0 ? (
          <Card className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'Pembayaran tidak ditemukan' : 'Belum ada pembayaran'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Coba gunakan filter yang berbeda' 
                : 'Pembayaran akan muncul setelah Anda bergabung dengan grup subscription'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => router.push('/groups')}>
                Join Grup
              </Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.subscription.service_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.subscription.plan_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          {getStatusBadge(payment.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.payment_method || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment)
                            setShowPaymentModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Payment Detail Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Detail Pembayaran"
        >
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label mb-1">ID Pembayaran</label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedPayment.id}
                  </p>
                </div>
                <div>
                  <label className="label mb-1">Status</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedPayment.status)}
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                </div>
              </div>

              <div>
                <label className="label mb-1">Subscription</label>
                <p className="text-sm text-gray-900">
                  {selectedPayment.subscription.service_name} - {selectedPayment.subscription.plan_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label mb-1">Jumlah</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </p>
                </div>
                <div>
                  <label className="label mb-1">Metode Pembayaran</label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.payment_method || '-'}
                  </p>
                </div>
              </div>

              {selectedPayment.midtrans_transaction_id && (
                <div>
                  <label className="label mb-1">ID Transaksi Midtrans</label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedPayment.midtrans_transaction_id}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label mb-1">Dibuat</label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(selectedPayment.created_at)}
                  </p>
                </div>
                <div>
                  <label className="label mb-1">Diperbarui</label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(selectedPayment.updated_at)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
