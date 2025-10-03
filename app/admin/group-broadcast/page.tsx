'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react'
import { broadcastAPI, adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface Broadcast {
  id: string
  title: string
  message: string
  target_type: 'all_groups' | 'selected_groups'
  target_group_ids?: string[]
  is_active: boolean
  priority: number
  start_date: string
  end_date?: string
  created_at: string
}

export default function AdminBroadcastsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_type: 'all_groups' as 'all_groups' | 'selected_groups',
    target_group_ids: [] as string[],
    priority: 1,
    end_date: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [initialLoad, setInitialLoad] = useState(false)
  const [groups, setGroups] = useState<any[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // Fetch broadcasts when user is loaded or filter changes
  useEffect(() => {
    if (user?.is_admin) {
      if (!initialLoad) {
        // Initial load
        setInitialLoad(true)
        fetchBroadcasts()
      } else {
        // Filter change - use debounce
        const timeoutId = setTimeout(() => {
          fetchBroadcasts()
        }, 300)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [user?.is_admin, filter])

  // Fetch groups when component mounts
  useEffect(() => {
    if (user?.is_admin) {
      fetchGroups()
    }
  }, [user?.is_admin])

  const fetchBroadcasts = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filter === 'active') {
        params.active = true
      } else if (filter === 'inactive') {
        params.active = false
      }

      const response = await broadcastAPI.getBroadcasts(params)
      setBroadcasts(response.data.data.broadcasts || [])
    } catch (error: any) {
      console.error('Error fetching broadcasts:', error)
      toast.error('Gagal memuat daftar broadcast')
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true)
      console.log('Fetching groups...')
      const response = await adminAPI.getGroups({ page: 1, page_size: 100 })
      console.log('Groups response:', response)
      console.log('Groups data:', response.data)
      console.log('Groups array:', response.data.data)
      
      if (response.data && response.data.data) {
        setGroups(response.data.data)
        console.log('Groups set:', response.data.data.length, 'groups')
      } else {
        console.log('No groups data found in response')
        setGroups([])
      }
    } catch (error: any) {
      console.error('Error fetching groups:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      toast.error('Gagal memuat daftar grup: ' + (error.response?.data?.error || error.message))
      setGroups([])
    } finally {
      setLoadingGroups(false)
    }
  }

  const handleCreateBroadcast = async () => {
    try {
      setSubmitting(true)
      
      // Validate selected groups
      if (formData.target_type === 'selected_groups' && formData.target_group_ids.length === 0) {
        toast.error('Pilih minimal satu grup untuk broadcast')
        return
      }
      
      // Convert end_date to RFC3339 format if provided
      let endDate = undefined
      if (formData.end_date) {
        const date = new Date(formData.end_date)
        if (!isNaN(date.getTime())) {
          endDate = date.toISOString()
        }
      }
      
      const data = {
        ...formData,
        target_group_ids: formData.target_type === 'selected_groups' ? formData.target_group_ids : undefined,
        end_date: endDate
      }

      console.log('Creating broadcast with data:', data)
      await broadcastAPI.createBroadcast(data)
      toast.success('Broadcast berhasil dibuat!')
      setShowCreateModal(false)
      resetForm()
      fetchBroadcasts()
    } catch (error: any) {
      console.error('Error creating broadcast:', error)
      toast.error(error.response?.data?.error || 'Gagal membuat broadcast')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateBroadcast = async () => {
    if (!editingBroadcast) return

    try {
      setSubmitting(true)
      
      // Convert end_date to RFC3339 format if provided
      let endDate = undefined
      if (formData.end_date) {
        const date = new Date(formData.end_date)
        if (!isNaN(date.getTime())) {
          endDate = date.toISOString()
        }
      }
      
      const data = {
        ...formData,
        target_group_ids: formData.target_type === 'selected_groups' ? formData.target_group_ids : undefined,
        end_date: endDate
      }

      console.log('Updating broadcast with data:', data)
      await broadcastAPI.updateBroadcast(editingBroadcast.id, data)
      toast.success('Broadcast berhasil diperbarui!')
      setShowEditModal(false)
      setEditingBroadcast(null)
      resetForm()
      fetchBroadcasts()
    } catch (error: any) {
      console.error('Error updating broadcast:', error)
      toast.error(error.response?.data?.error || 'Gagal memperbarui broadcast')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBroadcast = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus broadcast ini?')) return

    try {
      await broadcastAPI.deleteBroadcast(id)
      toast.success('Broadcast berhasil dihapus!')
      fetchBroadcasts()
    } catch (error: any) {
      console.error('Error deleting broadcast:', error)
      toast.error(error.response?.data?.error || 'Gagal menghapus broadcast')
    }
  }

  const handleToggleActive = async (broadcast: Broadcast) => {
    try {
      await broadcastAPI.updateBroadcast(broadcast.id, {
        is_active: !broadcast.is_active
      })
      toast.success(`Broadcast berhasil ${!broadcast.is_active ? 'diaktifkan' : 'dinonaktifkan'}!`)
      fetchBroadcasts()
    } catch (error: any) {
      console.error('Error toggling broadcast:', error)
      toast.error(error.response?.data?.error || 'Gagal mengubah status broadcast')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      target_type: 'all_groups',
      target_group_ids: [],
      priority: 1,
      end_date: ''
    })
  }

  const openEditModal = (broadcast: Broadcast) => {
    setEditingBroadcast(broadcast)
    setFormData({
      title: broadcast.title,
      message: broadcast.message,
      target_type: broadcast.target_type,
      target_group_ids: broadcast.target_group_ids || [],
      priority: broadcast.priority,
      end_date: broadcast.end_date ? new Date(broadcast.end_date).toISOString().slice(0, 16) : ''
    })
    setShowEditModal(true)
  }

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 3:
        return <Badge variant="error" className="flex items-center space-x-1"><AlertCircle className="h-3 w-3" />URGENT</Badge>
      case 2:
        return <Badge variant="warning" className="flex items-center space-x-1"><Clock className="h-3 w-3" />HIGH</Badge>
      default:
        return <Badge variant="success" className="flex items-center space-x-1"><CheckCircle className="h-3 w-3" />NORMAL</Badge>
    }
  }

  const getTargetTypeText = (targetType: string, targetGroupIds?: string[]) => {
    if (targetType === 'all_groups') {
      return 'Semua Grup'
    }
    
    if (targetGroupIds && targetGroupIds.length > 0) {
      // Get group names for selected groups
      const selectedGroups = groups.filter(group => targetGroupIds.includes(group.id))
      if (selectedGroups.length > 0) {
        const groupNames = selectedGroups.map(group => group.name).join(', ')
        return `Grup Terpilih: ${groupNames}`
      }
    }
    
    return `Grup Terpilih (${targetGroupIds?.length || 0})`
  }

  const filteredBroadcasts = broadcasts.filter(broadcast => {
    if (filter === 'active') return broadcast.is_active
    if (filter === 'inactive') return !broadcast.is_active
    return true
  })

  // Show loading while checking auth
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Memuat...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show message if not admin
  if (!user || !user.is_admin) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300">Akses Ditolak</p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Broadcast Management</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Kelola pesan broadcast untuk semua grup atau grup terpilih</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Buat Broadcast</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Broadcast</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{broadcasts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Aktif</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {broadcasts.filter(b => b.is_active).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <EyeOff className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tidak Aktif</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {broadcasts.filter(b => !b.is_active).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              onClick={() => setFilter('all')}
            >
              Semua
            </Button>
            <Button
              variant={filter === 'active' ? 'primary' : 'ghost'}
              onClick={() => setFilter('active')}
            >
              Aktif
            </Button>
            <Button
              variant={filter === 'inactive' ? 'primary' : 'ghost'}
              onClick={() => setFilter('inactive')}
            >
              Tidak Aktif
            </Button>
          </div>
        </div>

        {/* Broadcast List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Memuat broadcast...</p>
              </div>
            </div>
          ) : filteredBroadcasts.length === 0 ? (
            <Card className="p-8 text-center">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada broadcast</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {filter === 'all' ? 'Belum ada broadcast yang dibuat' : 
                 filter === 'active' ? 'Tidak ada broadcast yang aktif' : 'Tidak ada broadcast yang tidak aktif'}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Broadcast Pertama
              </Button>
            </Card>
          ) : (
            filteredBroadcasts.map((broadcast) => (
              <motion.div
                key={broadcast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {broadcast.title}
                        </h3>
                        {getPriorityBadge(broadcast.priority)}
                        <Badge variant={broadcast.is_active ? 'success' : 'gray'}>
                          {broadcast.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {broadcast.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span className="max-w-xs truncate" title={getTargetTypeText(broadcast.target_type, broadcast.target_group_ids)}>
                            {getTargetTypeText(broadcast.target_type, broadcast.target_group_ids)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(broadcast.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {broadcast.end_date && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Berakhir: {new Date(broadcast.end_date).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {broadcast.target_type === 'selected_groups' && broadcast.target_group_ids && broadcast.target_group_ids.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <Users className="h-3 w-3" />
                            <span>Grup yang terdampak:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {broadcast.target_group_ids.map(groupId => {
                              const group = groups.find(g => g.id === groupId)
                              return group ? (
                                <span
                                  key={groupId}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                >
                                  {group.name}
                                </span>
                              ) : (
                                <span
                                  key={groupId}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                >
                                  {groupId.slice(0, 8)}...
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(broadcast)}
                        className={broadcast.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {broadcast.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(broadcast)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBroadcast(broadcast.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Buat Broadcast Baru
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Judul Broadcast
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Masukkan judul broadcast"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pesan
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Masukkan pesan broadcast"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target
                    </label>
                    <select
                      value={formData.target_type}
                      onChange={(e) => setFormData({ ...formData, target_type: e.target.value as 'all_groups' | 'selected_groups' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all_groups">Semua Grup</option>
                      <option value="selected_groups">Grup Terpilih</option>
                    </select>
                  </div>

                  {/* Group Selection - Only show when selected_groups is chosen */}
                  {formData.target_type === 'selected_groups' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pilih Grup
                      </label>
                      {loadingGroups ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Memuat daftar grup...</p>
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md">
                          {groups.map((group) => (
                            <label key={group.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.target_group_ids.includes(group.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      target_group_ids: [...formData.target_group_ids, group.id]
                                    })
                                  } else {
                                    setFormData({
                                      ...formData,
                                      target_group_ids: formData.target_group_ids.filter(id => id !== group.id)
                                    })
                                  }
                                }}
                                className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{group.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {group.current_members}/{group.max_members} anggota • {group.is_public ? 'Publik' : 'Privat'}
                                </p>
                              </div>
                            </label>
                          ))}
                          {groups.length === 0 && (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              Tidak ada grup tersedia
                            </div>
                          )}
                        </div>
                      )}
                      {formData.target_group_ids.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {formData.target_group_ids.length} grup terpilih
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prioritas
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={1}>Normal</option>
                      <option value={2}>High</option>
                      <option value={3}>Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Berakhir (Opsional)
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleCreateBroadcast}
                    disabled={submitting || !formData.title || !formData.message}
                  >
                    {submitting ? 'Menyimpan...' : 'Buat Broadcast'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingBroadcast && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Edit Broadcast
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Judul Broadcast
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Masukkan judul broadcast"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pesan
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Masukkan pesan broadcast"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target
                    </label>
                    <select
                      value={formData.target_type}
                      onChange={(e) => setFormData({ ...formData, target_type: e.target.value as 'all_groups' | 'selected_groups' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all_groups">Semua Grup</option>
                      <option value="selected_groups">Grup Terpilih</option>
                    </select>
                  </div>
                  
                  {formData.target_type === 'selected_groups' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pilih Grup
                      </label>
                      <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3 space-y-2">
                        {loadingGroups ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">Memuat grup...</p>
                          </div>
                        ) : groups.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">Tidak ada grup tersedia</p>
                        ) : (
                          groups.map((group) => (
                            <label key={group.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.target_group_ids.includes(group.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      target_group_ids: [...formData.target_group_ids, group.id]
                                    })
                                  } else {
                                    setFormData({
                                      ...formData,
                                      target_group_ids: formData.target_group_ids.filter(id => id !== group.id)
                                    })
                                  }
                                }}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {group.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {group.member_count}/{group.max_members} anggota
                                </p>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                      {formData.target_group_ids.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.target_group_ids.length} grup dipilih
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prioritas
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={1}>Normal</option>
                      <option value={2}>High</option>
                      <option value={3}>Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Berakhir (Opsional)
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingBroadcast(null)
                      resetForm()
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleUpdateBroadcast}
                    disabled={submitting || !formData.title || !formData.message}
                  >
                    {submitting ? 'Menyimpan...' : 'Update Broadcast'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
