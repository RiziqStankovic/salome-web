'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Send, 
  Users, 
  UserCheck, 
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Megaphone,
  Plus,
  Search,
  Clock,
  Eye,
  Edit,
  Trash2,
  X
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { userBroadcastAPI, adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  full_name: string
  created_at: string
}

interface UserBroadcast {
  id: string
  title: string
  message: string
  target_type: 'all' | 'selected'
  priority: 'low' | 'normal' | 'high'
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
  created_by: string
  scheduled_at?: string
  sent_at?: string
  end_date?: string
  success_count: number
  error_count: number
  total_targets: number
  created_at: string
  updated_at: string
  creator_name?: string
  targets?: UserBroadcastTarget[]
}

interface UserBroadcastTarget {
  id: string
  broadcast_id: string
  user_id: string
  status: 'pending' | 'sent' | 'failed'
  sent_at?: string
  error_message?: string
  created_at: string
  user_name?: string
  user_email?: string
}

interface UserBroadcastStats {
  total: number
  draft: number
  scheduled: number
  sent: number
  cancelled: number
}

interface BroadcastForm {
  title: string
  message: string
  target: 'all' | 'selected'
  priority: 'low' | 'normal' | 'high'
  scheduledAt?: string
  endDate?: string
  status?: 'draft' | 'scheduled' | 'sent' | 'cancelled'
}

const AdminUserBroadcastPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [broadcasts, setBroadcasts] = useState<UserBroadcast[]>([])
  const [stats, setStats] = useState<UserBroadcastStats>({
    total: 0,
    draft: 0,
    scheduled: 0,
    sent: 0,
    cancelled: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingBroadcast, setEditingBroadcast] = useState<UserBroadcast | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedBroadcast, setSelectedBroadcast] = useState<UserBroadcast | null>(null)
  const [broadcastForm, setBroadcastForm] = useState<BroadcastForm>({
    title: '',
    message: '',
    target: 'all',
    priority: 'normal',
    scheduledAt: '',
    endDate: '',
    status: 'draft'
  })

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.is_admin) {
      fetchBroadcasts()
      fetchUsers()
    }
  }, [user])

  useEffect(() => {
    if (user?.is_admin) {
      const timeoutId = setTimeout(() => {
        fetchBroadcasts()
      }, 500) // Debounce search
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, statusFilter])

  useEffect(() => {
    if (user?.is_admin) {
      const timeoutId = setTimeout(() => {
        fetchUsers()
      }, 500) // Debounce user search
      return () => clearTimeout(timeoutId)
    }
  }, [userSearchTerm])

  const fetchBroadcasts = async () => {
    try {
      setIsLoading(true)
      const response = await userBroadcastAPI.getUserBroadcasts({
        page: 1,
        page_size: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined
      })
      setBroadcasts(response.data.broadcasts || [])
      setStats(response.data.stats || {
        total: 0,
        draft: 0,
        scheduled: 0,
        sent: 0,
        cancelled: 0
      })
    } catch (error: any) {
      console.error('Failed to fetch broadcasts:', error)
      toast.error('Gagal memuat daftar broadcast')
      setBroadcasts([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers({
        page: 1,
        page_size: 100,
        search: userSearchTerm || undefined
      })
      setUsers(response.data.data || [])
    } catch (error: any) {
      console.error('Failed to fetch users:', error)
      toast.error('Gagal memuat daftar user')
      setUsers([])
    }
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastForm.title.trim()) {
      toast.error('Judul broadcast tidak boleh kosong')
      return
    }
    if (!broadcastForm.message.trim()) {
      toast.error('Pesan broadcast tidak boleh kosong')
      return
    }

    if (broadcastForm.target === 'selected' && selectedUsers.length === 0) {
      toast.error('Pilih minimal satu user untuk broadcast')
      return
    }

    setIsSending(true)
    try {
      const userIDs = broadcastForm.target === 'selected' ? selectedUsers : undefined
      const response = await userBroadcastAPI.createUserBroadcast({
        title: broadcastForm.title,
        message: broadcastForm.message,
        target_type: broadcastForm.target,
        priority: broadcastForm.priority,
        scheduled_at: broadcastForm.scheduledAt || undefined,
        end_date: broadcastForm.endDate || undefined,
        user_ids: userIDs
      })
      
      setBroadcastForm({
        title: '',
        message: '',
        target: 'all',
        priority: 'normal',
        scheduledAt: '',
        endDate: '',
        status: 'draft'
      })
      setSelectedUsers([])
      setUserSearchTerm('')
      setShowForm(false)
      fetchBroadcasts() // Refresh the list
      toast.success('Broadcast berhasil dibuat')
    } catch (error: any) {
      console.error('Failed to create broadcast:', error)
      toast.error('Gagal membuat broadcast')
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteBroadcast = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus broadcast ini?')) return
    
    try {
      await userBroadcastAPI.deleteUserBroadcast(id)
      toast.success('Broadcast berhasil dihapus')
      fetchBroadcasts()
    } catch (error: any) {
      console.error('Failed to delete broadcast:', error)
      toast.error('Gagal menghapus broadcast')
    }
  }

  const handleCancelBroadcast = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan broadcast ini?')) return
    
    try {
      await userBroadcastAPI.updateUserBroadcast(id, { status: 'cancelled' })
      fetchBroadcasts()
      toast.success('Broadcast berhasil dibatalkan')
    } catch (error: any) {
      console.error('Failed to cancel broadcast:', error)
      toast.error('Gagal membatalkan broadcast')
    }
  }

  const handleSendBroadcast = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin mengirim broadcast ini?')) return
    
    try {
      const response = await userBroadcastAPI.sendUserBroadcast(id)
      toast.success(`Broadcast berhasil dikirim ke ${response.data.success_count} user`)
      fetchBroadcasts()
    } catch (error: any) {
      console.error('Failed to send broadcast:', error)
      toast.error('Gagal mengirim broadcast')
    }
  }

  const handleEditBroadcast = async (broadcast: UserBroadcast) => {
    try {
      // Fetch full broadcast details including targets
      const response = await userBroadcastAPI.getUserBroadcast(broadcast.id)
      const fullBroadcast = response.data.broadcast
      
      setEditingBroadcast(fullBroadcast)
      setBroadcastForm({
        title: fullBroadcast.title,
        message: fullBroadcast.message,
        target: fullBroadcast.target_type,
        priority: fullBroadcast.priority,
        scheduledAt: fullBroadcast.scheduled_at ? new Date(fullBroadcast.scheduled_at).toISOString().slice(0, 16) : '',
        endDate: fullBroadcast.end_date ? new Date(fullBroadcast.end_date).toISOString().slice(0, 16) : '',
        status: fullBroadcast.status
      })
      setSelectedUsers(fullBroadcast.targets?.map((t: UserBroadcastTarget) => t.user_id) || [])
      setShowForm(true)
    } catch (error) {
      console.error('Failed to fetch broadcast details:', error)
      toast.error('Gagal memuat detail broadcast')
    }
  }

  const handleViewDetail = async (broadcast: UserBroadcast) => {
    try {
      const response = await userBroadcastAPI.getUserBroadcast(broadcast.id)
      setSelectedBroadcast(response.data.broadcast)
      setShowDetail(true)
    } catch (error: any) {
      console.error('Failed to fetch broadcast detail:', error)
      toast.error('Gagal memuat detail broadcast')
    }
  }

  const handleUpdateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBroadcast) return

    if (!broadcastForm.title.trim()) {
      toast.error('Judul broadcast tidak boleh kosong')
      return
    }
    if (!broadcastForm.message.trim()) {
      toast.error('Pesan broadcast tidak boleh kosong')
      return
    }

    if (broadcastForm.target === 'selected' && selectedUsers.length === 0) {
      toast.error('Pilih minimal satu user untuk broadcast')
      return
    }

    setIsSending(true)
    try {
      const updateData: any = {
        title: broadcastForm.title,
        message: broadcastForm.message,
        target_type: broadcastForm.target,  // Always send target_type
        priority: broadcastForm.priority,
        scheduled_at: broadcastForm.scheduledAt || undefined,
        end_date: broadcastForm.endDate || undefined,
        status: broadcastForm.status
      }

      // Always send user_ids if target is 'selected'
      if (broadcastForm.target === 'selected') {
        updateData.user_ids = selectedUsers
      }

      console.log('DEBUG: Update data being sent:', updateData)
      await userBroadcastAPI.updateUserBroadcast(editingBroadcast.id, updateData)
      
      setBroadcastForm({
        title: '',
        message: '',
        target: 'all',
        priority: 'normal',
        scheduledAt: '',
        endDate: '',
        status: 'draft'
      })
      setSelectedUsers([])
      setUserSearchTerm('')
      setEditingBroadcast(null)
      setShowForm(false)
      fetchBroadcasts()
      toast.success('Broadcast berhasil diperbarui')
    } catch (error: any) {
      console.error('Failed to update broadcast:', error)
      toast.error('Gagal memperbarui broadcast')
    } finally {
      setIsSending(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingBroadcast(null)
    setBroadcastForm({
      title: '',
      message: '',
      target: 'all',
      priority: 'normal',
      scheduledAt: '',
      endDate: '',
      status: 'draft'
    })
    setSelectedUsers([])
    setUserSearchTerm('')
    setShowForm(false)
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  )

  const isAllSelected = selectedUsers.length === filteredUsers.length && filteredUsers.length > 0
  const isPartiallySelected = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Broadcast Management</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Kelola pesan broadcast untuk semua user atau user terpilih.</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Megaphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Broadcast</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Aktif</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sent}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Terjadwal</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduled}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tidak Aktif</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cancelled}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'draft', label: 'Draft' },
            { key: 'scheduled', label: 'Terjadwal' },
            { key: 'sent', label: 'Terkirim' },
            { key: 'cancelled', label: 'Dibatalkan' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === tab.key
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari broadcast..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <Button onClick={() => setShowForm(prev => !prev)}>
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Tutup Form' : 'Buat Broadcast'}
          </Button>
        </div>

        {/* Broadcast Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Broadcast Form */}
            <Card className="p-6 dark:bg-gray-800">
              <div className="flex items-center space-x-2 mb-4">
                <Megaphone className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingBroadcast ? 'Edit Broadcast' : 'Buat Broadcast Baru'}
                </h2>
              </div>

              <form onSubmit={editingBroadcast ? handleUpdateBroadcast : handleCreateBroadcast} className="space-y-4">
                {/* Judul Broadcast */}
                <div>
                  <label htmlFor="broadcastTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Judul Broadcast
                  </label>
                  <Input
                    id="broadcastTitle"
                    type="text"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Masukkan judul broadcast"
                    className="w-full"
                    required
                  />
                </div>

                {/* Pesan */}
                <div>
                  <label htmlFor="broadcastMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pesan
                  </label>
                  <textarea
                    id="broadcastMessage"
                    rows={5}
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Masukkan pesan broadcast"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  ></textarea>
                </div>

                {/* Target */}
                <div>
                  <label htmlFor="broadcastTarget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target
                  </label>
                  <select
                    id="broadcastTarget"
                    value={broadcastForm.target}
                    onChange={(e) => setBroadcastForm(prev => ({ ...prev, target: e.target.value as 'all' | 'selected' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Semua User</option>
                    <option value="selected">User Terpilih</option>
                  </select>
                </div>

                {/* Prioritas */}
                <div>
                  <label htmlFor="broadcastPriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioritas
                  </label>
                  <select
                    id="broadcastPriority"
                    value={broadcastForm.priority}
                    onChange={(e) => setBroadcastForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'normal' | 'high' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Rendah</option>
                    <option value="normal">Normal</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>

                {/* Status (hanya untuk edit) */}
                {editingBroadcast && (
                  <div>
                    <label htmlFor="broadcastStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      id="broadcastStatus"
                      value={broadcastForm.status || 'draft'}
                      onChange={(e) => setBroadcastForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'scheduled' | 'sent' | 'cancelled' }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Terjadwal</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>
                )}

                {/* Tanggal Terjadwal */}
                <div>
                  <label htmlFor="broadcastScheduledAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Terjadwal (Opsional)
                  </label>
                  <div className="relative">
                    <Input
                      id="broadcastScheduledAt"
                      type="datetime-local"
                      value={broadcastForm.scheduledAt}
                      onChange={(e) => setBroadcastForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                      className="w-full pr-10"
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Kosongkan untuk mengirim langsung
                  </p>
                </div>

                {/* Tanggal Berakhir (Opsional) */}
                <div>
                  <label htmlFor="broadcastEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Berakhir (Opsional)
                  </label>
                  <div className="relative">
                    <Input
                      id="broadcastEndDate"
                      type="datetime-local"
                      value={broadcastForm.endDate}
                      onChange={(e) => setBroadcastForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={editingBroadcast ? handleCancelEdit : () => setShowForm(false)}
                    disabled={isSending}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSending || !broadcastForm.title.trim() || !broadcastForm.message.trim() || (broadcastForm.target === 'selected' && selectedUsers.length === 0)}>
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : editingBroadcast ? <Edit className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    {editingBroadcast ? 'Update Broadcast' : 'Buat Broadcast'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* User Selection (if target is 'selected') */}
            {broadcastForm.target === 'selected' && (
              <Card className="p-6 flex flex-col dark:bg-gray-800">
                <div className="flex items-center space-x-2 mb-6">
                  <Users className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pilih Pengguna</h2>
                </div>
                <Input
                  placeholder="Cari pengguna..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="mb-6"
                />
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUsers.length} dari {filteredUsers.length} pengguna terpilih
                  </p>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {isAllSelected ? 'Batalkan Semua' : 'Pilih Semua'}
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[600px] scrollbar-hide">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                      <Users className="h-12 w-12 mx-auto mb-4" />
                      <p>Tidak ada pengguna ditemukan.</p>
                    </div>
                  ) : (
                    filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${selectedUsers.includes(u.id) ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        onClick={() => handleUserSelect(u.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{u.full_name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                          </div>
                        </div>
                        {selectedUsers.includes(u.id) ? (
                          <CheckCircle className="h-5 w-5 text-primary-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* Broadcast List */}
        <Card className="p-0 dark:bg-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Broadcast</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada broadcast</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Belum ada broadcast yang dibuat</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Broadcast Pertama
                </Button>
              </div>
            ) : (
              broadcasts.map((broadcast) => (
                <motion.div
                  key={broadcast.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {broadcast.title}
                        </h3>
                        <Badge 
                          variant={
                            broadcast.status === 'sent' ? 'success' :
                            broadcast.status === 'scheduled' ? 'warning' :
                            broadcast.status === 'cancelled' ? 'gray' : 'primary'
                          }
                        >
                          {broadcast.status === 'sent' ? 'Terkirim' :
                           broadcast.status === 'scheduled' ? 'Terjadwal' :
                           broadcast.status === 'cancelled' ? 'Dibatalkan' : 'Draft'}
                        </Badge>
                        <Badge 
                          variant={
                            broadcast.priority === 'high' ? 'error' :
                            broadcast.priority === 'normal' ? 'primary' : 'gray'
                          }
                        >
                          {broadcast.priority === 'high' ? 'Tinggi' :
                           broadcast.priority === 'normal' ? 'Normal' : 'Rendah'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {broadcast.message}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{broadcast.total_targets} target</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>{broadcast.success_count} berhasil</span>
                        </div>
                        {broadcast.error_count > 0 && (
                          <div className="flex items-center space-x-1">
                            <XCircle className="h-4 w-4" />
                            <span>{broadcast.error_count} gagal</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(broadcast.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}</span>
                        </div>
                      </div>
                      
                      {/* Show selected users if target_type is 'selected' */}
                      {broadcast.target_type === 'selected' && broadcast.targets && broadcast.targets.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">User Terpilih:</p>
                          <div className="flex flex-wrap gap-1">
                            {broadcast.targets.slice(0, 3).map((target) => (
                              <span key={target.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                {target.user_name || 'Unknown User'}
                              </span>
                            ))}
                            {broadcast.targets.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                +{broadcast.targets.length - 3} lainnya
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Lihat Detail"
                        onClick={() => handleViewDetail(broadcast)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {/* Send Button - Available for all status */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSendBroadcast(broadcast.id)}
                        title="Kirim Broadcast"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        disabled={isSending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      
                      {/* Edit Button - Available for all status */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditBroadcast(broadcast)}
                        title="Edit Broadcast"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        disabled={isSending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {/* Delete Button - Available for all status */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteBroadcast(broadcast.id)}
                        title="Hapus Broadcast"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isSending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      {/* Cancel Button - Available for all status */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCancelBroadcast(broadcast.id)}
                        title="Batalkan Broadcast"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        disabled={isSending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* Detail Modal */}
        {showDetail && selectedBroadcast && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Detail Broadcast
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetail(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Judul
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedBroadcast.title}
                    </p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pesan
                    </label>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedBroadcast.message}
                    </p>
                  </div>

                  {/* Status & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <Badge 
                        variant={
                          selectedBroadcast.status === 'sent' ? 'success' :
                          selectedBroadcast.status === 'scheduled' ? 'warning' :
                          selectedBroadcast.status === 'cancelled' ? 'gray' : 'primary'
                        }
                      >
                        {selectedBroadcast.status === 'sent' ? 'Terkirim' :
                         selectedBroadcast.status === 'scheduled' ? 'Terjadwal' :
                         selectedBroadcast.status === 'cancelled' ? 'Dibatalkan' : 'Draft'}
                      </Badge>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prioritas
                      </label>
                      <Badge 
                        variant={
                          selectedBroadcast.priority === 'high' ? 'error' :
                          selectedBroadcast.priority === 'normal' ? 'primary' : 'gray'
                        }
                      >
                        {selectedBroadcast.priority === 'high' ? 'Tinggi' :
                         selectedBroadcast.priority === 'normal' ? 'Normal' : 'Rendah'}
                      </Badge>
                    </div>
                  </div>

                  {/* Target Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedBroadcast.target_type === 'all' ? 'Semua User' : 'User Terpilih'}
                      {selectedBroadcast.total_targets > 0 && ` (${selectedBroadcast.total_targets} user)`}
                    </p>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {selectedBroadcast.success_count}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Berhasil</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {selectedBroadcast.error_count}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gagal</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedBroadcast.total_targets}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dibuat
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {format(new Date(selectedBroadcast.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </p>
                    </div>
                    {selectedBroadcast.sent_at && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Dikirim
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {format(new Date(selectedBroadcast.sent_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Scheduled & End Date */}
                  {(selectedBroadcast.scheduled_at || selectedBroadcast.end_date) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedBroadcast.scheduled_at && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Terjadwal
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {format(new Date(selectedBroadcast.scheduled_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                          </p>
                        </div>
                      )}
                      {selectedBroadcast.end_date && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Berakhir
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {format(new Date(selectedBroadcast.end_date), 'dd MMM yyyy, HH:mm', { locale: id })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Creator */}
                  {selectedBroadcast.creator_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dibuat Oleh
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedBroadcast.creator_name}
                      </p>
                    </div>
                  )}

                  {/* Selected Users (if any) */}
                  {selectedBroadcast.target_type === 'selected' && selectedBroadcast.targets && selectedBroadcast.targets.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        User Terpilih
                      </label>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {selectedBroadcast.targets.map((target) => (
                          <div key={target.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {target.user_name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {target.user_email}
                              </p>
                            </div>
                            <Badge 
                              variant={
                                target.status === 'sent' ? 'success' :
                                target.status === 'failed' ? 'error' : 'warning'
                              }
                              className="text-xs"
                            >
                              {target.status === 'sent' ? 'Terkirim' :
                               target.status === 'failed' ? 'Gagal' : 'Pending'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={() => setShowDetail(false)}>
                    Tutup
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AdminUserBroadcastPage