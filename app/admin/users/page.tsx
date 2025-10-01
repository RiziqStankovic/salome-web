'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle,
  UserPlus,
  UserMinus,
  Mail,
  Calendar,
  Shield,
  Ban,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  status: string
  balance?: number
  total_spent?: number
  created_at: string
  is_verified?: boolean
  is_admin?: boolean
  role?: string
  last_login?: string
  groups_count?: number
  submissions_count?: number
}

interface UserStats {
  total: number
  active: number
  pending_verification: number
  suspended: number
  deleted: number
  admins: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    pending_verification: 0,
    suspended: 0,
    deleted: 0,
    admins: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Redirect to homepage if not admin
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && !user.is_admin))) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch users
  useEffect(() => {
    if (user?.role === 'admin' || user?.is_admin) {
      fetchUsers()
    }
  }, [user])

  // Refetch when filters change
  useEffect(() => {
    if (user?.role === 'admin' || user?.is_admin) {
      fetchUsers()
    }
  }, [statusFilter, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getUsers({
        page: 1,
        page_size: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined
      })
      
      setUsers(response.data.data || [])
      setStats(response.data.stats || {
        total: 0,
        active: 0,
        pending_verification: 0,
        suspended: 0,
        deleted: 0,
        admins: 0
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Gagal memuat data users')
      setUsers([])
      setStats({
        total: 0,
        active: 0,
        pending_verification: 0,
        suspended: 0,
        deleted: 0,
        admins: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await adminAPI.updateUserStatus({
        user_id: userId,
        new_status: newStatus
      })
      
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, status: newStatus }
          : u
      ))
      
      // Update stats
      setStats(prev => {
        const updated = { ...prev }
        if (newStatus === 'active') {
          updated.active += 1
          updated.pending_verification -= 1
        } else if (newStatus === 'pending_verification') {
          updated.pending_verification += 1
          updated.active -= 1
        } else if (newStatus === 'suspended') {
          updated.suspended += 1
          updated.active -= 1
        } else if (newStatus === 'deleted') {
          updated.deleted += 1
          updated.active -= 1
        }
        return updated
      })
      
      toast.success(`User status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Gagal mengupdate status user')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="flex items-center space-x-1"><CheckCircle className="h-3 w-3" />Active</Badge>
      case 'pending_verification':
        return <Badge variant="warning" className="flex items-center space-x-1"><Clock className="h-3 w-3" />Pending Verification</Badge>
      case 'suspended':
        return <Badge variant="error" className="flex items-center space-x-1"><Ban className="h-3 w-3" />Suspended</Badge>
      case 'deleted':
        return <Badge variant="error" className="flex items-center space-x-1"><XCircle className="h-3 w-3" />Deleted</Badge>
      default:
        return <Badge variant="gray">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
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

  // Show message if not admin
  if (!user || (user.role !== 'admin' && !user.is_admin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Mengarahkan ke halaman utama...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kelola Users</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Kelola dan pantau semua pengguna platform
            </p>
          </div>
          <Button
            onClick={() => {/* TODO: Implement export */}}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending_verification}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Ban className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Suspended</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.suspended}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.admins}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari email atau nama..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Semua Status</option>
                <option value="active">Active</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="suspended">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <Card className="p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Memuat data...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tidak ada users
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Belum ada users yang terdaftar
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.full_name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <span className="text-lg font-bold text-primary-600">
                            {user.full_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {user.full_name}
                          </h3>
                          {getStatusBadge(user.status)}
                          {user.is_admin && (
                            <Badge variant="primary" className="flex items-center space-x-1">
                              <Shield className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                          <p>Email: {user.email}</p>
                          <p>Bergabung: {formatDate(user.created_at)}</p>
                          {user.last_login && <p>Last Login: {formatDate(user.last_login)}</p>}
                          <p>Groups: {user.groups_count || 0} | Submissions: {user.submissions_count || 0}</p>
                          <p>Balance: {formatCurrency(user.balance || 0)} | Spent: {formatCurrency(user.total_spent || 0)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowDetailModal(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(user.id, 'active')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {user.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(user.id, 'suspended')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl w-full mx-4 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detail User
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Lengkap
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedUser.full_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  {getStatusBadge(selectedUser.status)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedUser.is_admin ? 'Admin' : 'User'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Balance
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(selectedUser.balance || 0)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Spent
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(selectedUser.total_spent || 0)}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tanggal Bergabung
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(selectedUser.created_at)}
                </p>
              </div>
              
              {selectedUser.last_login && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Login
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedUser.last_login)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </Button>
              {selectedUser.status === 'pending' && (
                <Button
                  onClick={() => {
                    handleStatusChange(selectedUser.id, 'active')
                    setShowDetailModal(false)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aktifkan
                </Button>
              )}
              {selectedUser.status === 'active' && (
                <Button
                  onClick={() => {
                    handleStatusChange(selectedUser.id, 'suspended')
                    setShowDetailModal(false)
                  }}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
