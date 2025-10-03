'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  Plus,
  Wallet,
  History,
  Calendar,
  CreditCard,
  ExternalLink
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { transactionAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'

interface Transaction {
  id: string
  user_id: string
  group_id?: string
  type: string
  amount: number
  balance_before: number
  balance_after: number
  description: string
  payment_method?: string
  payment_reference?: string
  payment_link_id?: string
  status: string
  created_at: string
  updated_at: string
}

export default function TransactionsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    topUpAmount: 0,
    spentAmount: 0
  })
  const transactionsFetched = useRef(false)

  const transactionTypes = [
    { value: '', label: 'All' },
    { value: 'top-up', label: 'Top Up' },
    { value: 'group_payment', label: 'Pembayaran Grup' },
    { value: 'withdrawal', label: 'Penarikan' },
    { value: 'refund', label: 'Refund' }
  ]

  const transactionStatuses = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  // Redirect to homepage if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch transactions when user is loaded or filters change
  useEffect(() => {
    if (user) {
      if (!transactionsFetched.current) {
        // Initial load
        transactionsFetched.current = true
        fetchTransactions()
      } else {
        // Filter change - use debounce
        const timeoutId = setTimeout(() => {
          fetchTransactions()
        }, 500) // Debounce search
        return () => clearTimeout(timeoutId)
      }
    }
  }, [user?.id, page, searchTerm, selectedType, selectedStatus])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await transactionAPI.getUserTransactions({
        page,
        page_size: 20
      })
      const transactionsData = response.data.transactions || []
      
      
      setTransactions(transactionsData)
      setTotalPages(response.data.total_pages || 1)
      
      // Calculate stats
      const totalAmount = transactionsData.reduce((sum: number, t: Transaction) => sum + t.amount, 0)
      const topUpAmount = transactionsData
        .filter((t: Transaction) => t.type === 'top-up')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
      const spentAmount = transactionsData
        .filter((t: Transaction) => ['group_payment', 'withdrawal'].includes(t.type))
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
      
      setStats({
        totalTransactions: response.data.total || 0,
        totalAmount,
        topUpAmount,
        spentAmount
      })
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || transaction.type === selectedType
    const matchesStatus = !selectedStatus || transaction.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'top-up':
        return <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'group_payment':
      case 'withdrawal':
        return <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'refund':
        return <ArrowUpRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      default:
        return <History className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'top-up':
        return 'bg-green-100 dark:bg-green-900'
      case 'group_payment':
      case 'withdrawal':
        return 'bg-red-100 dark:bg-red-900'
      case 'refund':
        return 'bg-blue-100 dark:bg-blue-900'
      default:
        return 'bg-gray-100 dark:bg-gray-900'
    }
  }

  const getTransactionTextColor = (type: string) => {
    switch (type) {
      case 'top-up':
        return 'text-green-600 dark:text-green-400'
      case 'group_payment':
      case 'withdrawal':
        return 'text-red-600 dark:text-red-400'
      case 'refund':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'top-up':
        return 'Top Up'
      case 'group_payment':
        return 'Pembayaran Grup'
      case 'withdrawal':
        return 'Penarikan'
      case 'refund':
        return 'Refund'
      default:
        return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="warning" className="text-xs">
            Pending
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="success" className="text-xs">
            Completed
          </Badge>
        )
      case 'success':
        return (
          <Badge variant="success" className="text-xs">
            Success
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="error" className="text-xs">
            Failed
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="error" className="text-xs">
            Expired
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="gray" className="text-xs">
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="gray" className="text-xs">
            {status}
          </Badge>
        )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-l-yellow-500'
      case 'completed':
        return 'border-l-green-500'
      case 'success':
        return 'border-l-green-500'
      case 'failed':
        return 'border-l-red-500'
      case 'expired':
        return 'border-l-red-500'
      case 'cancelled':
        return 'border-l-gray-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const getPaymentLinkURL = (paymentLinkId: string) => {
    if (!paymentLinkId) return null
    return `https://app.sandbox.midtrans.com/payment-links/${paymentLinkId}`
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Memuat...</p>
        </div>
      </div>
    )
  }

  // Show message if not logged in (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Mengarahkan ke halaman login...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              History Transaksi
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Lihat semua transaksi dan riwayat pembayaran Anda
            </p>
          </div>
          <Button
            onClick={() => router.push('/top-up')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Top Up Saldo</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <History className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTransactions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Top Up</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.topUpAmount)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <ArrowDownRight className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.spentAmount)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Net Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.topUpAmount - stats.spentAmount)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Tipe:</span>
            {transactionTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? 'primary' : 'outline'}
                onClick={() => setSelectedType(type.value)}
                size="sm"
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Status:</span>
            {transactionStatuses.map((status) => (
              <Button
                key={status.value}
                variant={selectedStatus === status.value ? 'primary' : 'outline'}
                onClick={() => setSelectedStatus(status.value)}
                size="sm"
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Tidak ada transaksi
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Belum ada transaksi yang ditemukan
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`p-6 hover:shadow-lg transition-shadow dark:bg-gray-800 border-l-4 ${getStatusColor(transaction.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {transaction.description}
                          </h3>
                          <Badge variant="gray" className="text-xs">
                            {getTypeLabel(transaction.type)}
                          </Badge>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {transaction.payment_method && (
                            <div className="flex items-center space-x-1">
                              <CreditCard className="h-4 w-4" />
                              <span>{transaction.payment_method}</span>
                            </div>
                          )}
                        </div>
                        {transaction.payment_reference && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Ref: {transaction.payment_reference}
                          </p>
                        )}
                        {transaction.status === 'pending' && transaction.payment_link_id && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const paymentURL = getPaymentLinkURL(transaction.payment_link_id!)
                                if (paymentURL) {
                                  window.open(paymentURL, '_blank')
                                }
                              }}
                              className="text-xs px-2 py-1 h-6 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Bayar Sekarang
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getTransactionTextColor(transaction.type)}`}>
                        {transaction.type === 'top-up' || transaction.type === 'refund' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      {transaction.status === 'pending' && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          Menunggu Pembayaran
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Halaman {page} dari {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
