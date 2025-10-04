'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { 
  Plus,
  Users,
  CreditCard,
  BarChart3,
  Search,
  Star,
  ExternalLink,
  Wallet,
  History,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { appAPI, transactionAPI, groupAPI } from '@/lib/api'
import UserBroadcastWidget from '@/components/UserBroadcastWidget'
import BalanceCard from '@/components/BalanceCard'
import { formatCurrency } from '@/lib/utils'

interface RecentActivity {
  id: string
  type: 'transaction' | 'group'
  title: string
  description: string
  timestamp: string
  status: string
  icon: 'success' | 'warning' | 'error' | 'primary'
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    balance: 0, // Saldo user dari API transactions
    totalTransactions: 0, // Jumlah transaksi
    totalExpenses: 0, // Total pengeluaran
    pendingPayments: 0 // Pembayaran pending
  })
  const [popularApps, setPopularApps] = useState([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [userGroups, setUserGroups] = useState([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const dataFetched = useRef(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !dataFetched.current) {
      dataFetched.current = true
      fetchPopularApps()
      fetchTransactions()
      fetchUserGroups()
    }
  }, [user?.id]) // Use user.id instead of user object to prevent re-renders

  // Calculate stats when transactions data changes
  useEffect(() => {
    const updateStats = async () => {
      if (transactions.length > 0) {
        await calculateStats()
      }
    }
    updateStats()
  }, [transactions])

  const fetchPopularApps = async () => {
    try {
      setLoadingApps(true)
      const response = await appAPI.getPopularApps(6)
      setPopularApps(response.data.apps)
    } catch (error) {
      console.error('Failed to fetch popular apps:', error)
    } finally {
      setLoadingApps(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true)
      const response = await transactionAPI.getUserTransactions({ page: 1, page_size: 5 })
      setTransactions(response.data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const fetchUserGroups = async () => {
    try {
      setLoadingGroups(true)
      const response = await groupAPI.getUserGroups()
      setUserGroups(response.data.groups || [])
    } catch (error) {
      console.error('Error fetching user groups:', error)
    } finally {
      setLoadingGroups(false)
    }
  }

  const calculateStats = async () => {
    try {
      // Get saldo from transactions API
      const response = await transactionAPI.getUserTransactions({
        page: 1,
        page_size: 1
      })
      const saldo = response.data.saldo || 0
      
      if (!Array.isArray(transactions) || transactions.length === 0) {
        setStats({
          balance: saldo,
          totalTransactions: 0,
          totalExpenses: 0,
          pendingPayments: 0
        })
        return
      }

      const totalTransactions = transactions.length
      const totalExpenses = (transactions as any[]).reduce((sum, transaction) => {
        return sum + (transaction.amount || 0)
      }, 0)
      
      const pendingPayments = (transactions as any[]).filter((transaction: any) => 
        transaction.status === 'pending'
      ).length

      setStats({
        balance: saldo,
        totalTransactions,
        totalExpenses,
        pendingPayments
      })
    } catch (error) {
      console.error('Error calculating stats:', error)
      // Fallback to current stats without saldo update
      if (!Array.isArray(transactions) || transactions.length === 0) {
        setStats(prev => ({
          ...prev,
          balance: 0
        }))
        return
      }

      const totalTransactions = transactions.length
      const totalExpenses = (transactions as any[]).reduce((sum, transaction) => {
        return sum + (transaction.amount || 0)
      }, 0)
      
      const pendingPayments = (transactions as any[]).filter((transaction: any) => 
        transaction.status === 'pending'
      ).length

      setStats({
        balance: 0,
        totalTransactions,
        totalExpenses,
        pendingPayments
      })
    }
  }

  const generateRecentActivities = (): RecentActivity[] => {
    const activities: RecentActivity[] = []
    
    // Add recent transactions (up to 2)
    if (Array.isArray(transactions) && transactions.length > 0) {
      (transactions as any[]).slice(0, 2).forEach((transaction: any) => {
        const statusText = transaction.status === 'success' || transaction.status === 'completed' ? 'berhasil' : 
                          transaction.status === 'pending' ? 'pending' : 
                          transaction.status === 'failed' ? 'gagal' : transaction.status
        
        const transactionType = transaction.type === 'top-up' ? 'Top Up' : 
                               transaction.type === 'group_payment' ? 'Pembayaran Grup' : 
                               'Transaksi'
        
        activities.push({
          id: `txn-${transaction.id}`,
          type: 'transaction' as const,
          title: `${transactionType} ${statusText}`,
          description: `${formatCurrency(transaction.amount)}${transaction.description ? ` - ${transaction.description}` : ''}`,
          timestamp: transaction.created_at,
          status: transaction.status,
          icon: transaction.status === 'success' || transaction.status === 'completed' ? 'success' as const : 
                transaction.status === 'pending' ? 'warning' as const : 'error' as const
        })
      })
    }
    
    // Add recent groups (up to 1)
    if (Array.isArray(userGroups) && userGroups.length > 0) {
      (userGroups as any[]).slice(0, 1).forEach((group: any) => {
        const groupStatus = group.group_status === 'paid_group' ? 'lunas' : 
                           group.group_status === 'active' ? 'aktif' : 
                           group.group_status === 'pending' ? 'menunggu' : 'dibuat'
        
        activities.push({
          id: `group-${group.id}`,
          type: 'group' as const,
          title: `Grup "${group.name}" ${groupStatus}`,
          description: `${group.app_name || 'Aplikasi'} - ${group.current_members}/${group.max_members} anggota`,
          timestamp: group.created_at,
          status: group.group_status,
          icon: group.group_status === 'paid_group' ? 'success' as const : 
                group.group_status === 'active' ? 'primary' as const : 'warning' as const
        })
      })
    }
    
    // Sort by timestamp (newest first) and take first 2
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 2)
  }


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
        {/* Welcome Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Selamat datang, {user.full_name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Kelola grup patungan dan subscription Anda di sini
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <BalanceCard />

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Jumlah Transaksi
                  </h3>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.totalTransactions}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total Pengeluaran
                  </h3>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {formatCurrency(stats.totalExpenses)}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-error-100 dark:bg-error-900/30 rounded-lg flex items-center justify-center mr-4">
                  <History className="w-6 h-6 text-error-600 dark:text-error-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pembayaran Pending
                  </h3>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.pendingPayments}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Broadcast Widget */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8"
        >
          <UserBroadcastWidget />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => router.push('/groups/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Grup Baru
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/join')}
              >
                <Users className="h-4 w-4 mr-2" />
                Bergabung ke Grup
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/browse')}
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Apps
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/transactions')}
              >
                Lihat Semua
              </Button>
            </div>
            <div className="space-y-3">
              {loadingTransactions || loadingGroups ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : !loadingTransactions && !loadingGroups && generateRecentActivities().length > 0 ? (
                generateRecentActivities().map((activity) => {
                  const timeAgo = new Date(activity.timestamp)
                  const now = new Date()
                  const diffInHours = Math.floor((now.getTime() - timeAgo.getTime()) / (1000 * 60 * 60))
                  const diffInDays = Math.floor(diffInHours / 24)
                  
                  let timeText = ''
                  if (diffInHours < 1) {
                    timeText = 'Baru saja'
                  } else if (diffInHours < 24) {
                    timeText = `${diffInHours} jam yang lalu`
                  } else if (diffInDays < 7) {
                    timeText = `${diffInDays} hari yang lalu`
                  } else {
                    timeText = timeAgo.toLocaleDateString('id-ID')
                  }

                  const getIconColor = () => {
                    switch (activity.icon) {
                      case 'success': return 'bg-emerald-500'
                      case 'warning': return 'bg-yellow-500'
                      case 'error': return 'bg-red-500'
                      case 'primary': return 'bg-blue-500'
                      default: return 'bg-gray-500'
                    }
                  }

                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className={`w-3 h-3 ${getIconColor()} rounded-full mt-1 flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.title}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                            {timeText}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                        {activity.type === 'transaction' && (
                          <div className="flex items-center mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.status === 'success' || activity.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : activity.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {activity.status === 'success' || activity.status === 'completed' ? 'Berhasil' :
                               activity.status === 'pending' ? 'Pending' : 'Gagal'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada aktivitas terbaru</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Popular Apps */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Aplikasi Populer
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/browse')}
              >
                Lihat Semua
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {loadingApps ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {popularApps.map((app: any) => (
                  <div 
                    key={app.id}
                    className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => router.push(`/browse?app=${app.id}`)}
                  >
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-2">
                      {app.icon_url ? (
                        <img 
                          src={app.icon_url} 
                          alt={app.name}
                          className="w-8 h-8"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded flex items-center justify-center ${app.icon_url ? 'hidden' : ''}`}>
                        <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                          {app.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate w-full">
                        {app.name}
                      </h4>
                      <div className="flex items-center justify-center mt-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                          {formatCurrency(app.price_per_user)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          per user
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaksi Terbaru</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/transactions')}
              >
                Lihat Semua
              </Button>
            </div>
            
            {loadingTransactions ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'top-up' 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {transaction.type === 'top-up' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'top-up'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'top-up' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Saldo: {formatCurrency(transaction.balance_after)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Lengkap
                </label>
                <p className="text-gray-900 dark:text-white">{user.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === 'active' 
                    ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                    : user.status === 'pending_verification'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {user.status === 'active' 
                    ? 'Aktif' 
                    : user.status === 'pending_verification'
                    ? 'Menunggu Verifikasi'
                    : user.status === 'suspended'
                    ? 'Ditangguhkan'
                    : 'Tidak Diketahui'
                  }
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Member Since
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(user.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
    </DashboardLayout>
  )
}