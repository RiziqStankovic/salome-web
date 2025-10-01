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
  Lock,
  Globe,
  Calendar,
  DollarSign,
  UserPlus,
  Clock,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Group {
  id: string
  name: string
  description?: string
  app_id: string
  app_name: string
  app_icon?: string
  owner_id: string
  owner_name: string
  owner_email: string
  group_status: string
  is_public: boolean
  max_members: number
  current_members: number
  price_per_member: number
  created_at: string
  updated_at: string
  members_count: number
  total_revenue: number
}

interface GroupStats {
  total: number
  active: number
  pending: number
  closed: number
  full: number
  paid: number
  public: number
  private: number
  total_revenue: number
}

export default function AdminGroupsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [stats, setStats] = useState<GroupStats>({
    total: 0,
    active: 0,
    pending: 0,
    closed: 0,
    full: 0,
    paid: 0,
    public: 0,
    private: 0,
    total_revenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    app_id: '',
    max_members: 10,
    is_public: false,
    owner_id: '',
    group_status: 'open'
  })
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [apps, setApps] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingApps, setLoadingApps] = useState(false)
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [showChangeOwnerModal, setShowChangeOwnerModal] = useState(false)
  const [selectedNewOwner, setSelectedNewOwner] = useState('')
  const [changingOwner, setChangingOwner] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'members'>('details')
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [removingMember, setRemovingMember] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<any>(null)
  const [addMemberForm, setAddMemberForm] = useState({
    user_id: '',
    role: 'member'
  })

  // Redirect to homepage if not admin
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && !user.is_admin))) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch groups
  useEffect(() => {
    if (user?.role === 'admin' || user?.is_admin) {
      fetchGroups()
    }
  }, [user])

  // Refetch when filters change
  useEffect(() => {
    if (user?.role === 'admin' || user?.is_admin) {
      fetchGroups()
    }
  }, [statusFilter, searchTerm])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getGroups({
        page: 1,
        page_size: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined
      })
      
      setGroups(response.data.data || [])
      setStats(response.data.stats || {
        total: 0,
        active: 0,
        pending: 0,
        closed: 0,
        full: 0,
        paid: 0,
        public: 0,
        private: 0,
        total_revenue: 0
      })
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('Gagal memuat data groups')
      setGroups([])
      setStats({
        total: 0,
        active: 0,
        pending: 0,
        closed: 0,
        full: 0,
        paid: 0,
        public: 0,
        private: 0,
        total_revenue: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredGroups = (groups || []).filter(group => {
    const matchesSearch = 
      (group.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.app_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.owner_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || group.group_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (groupId: string, newStatus: string) => {
    try {
      // Map frontend status to backend status
      const statusMapping: { [key: string]: string } = {
        'active': 'open',
        'closed': 'closed',
        'private': 'private',
        'full': 'full',
        'paid': 'paid_group'
      }
      
      const backendStatus = statusMapping[newStatus] || newStatus
      
      await adminAPI.updateGroupStatus({
        group_id: groupId,
        new_status: backendStatus
      })
      
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, group_status: newStatus }
          : g
      ))
      
      // Update stats
      setStats(prev => {
        const updated = { ...prev }
        if (newStatus === 'active') {
          updated.active += 1
          updated.pending -= 1
        } else if (newStatus === 'private') {
          updated.pending += 1
          updated.active -= 1
        } else if (newStatus === 'closed') {
          updated.closed += 1
          updated.active -= 1
        } else if (newStatus === 'full') {
          updated.full += 1
          updated.active -= 1
        } else if (newStatus === 'paid') {
          updated.paid += 1
          updated.active -= 1
        }
        return updated
      })
      
      toast.success(`Group status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Gagal mengupdate status group')
    }
  }

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await adminAPI.getUsersForDropdown()
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Gagal memuat daftar users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchApps = async () => {
    try {
      setLoadingApps(true)
      const response = await adminAPI.getAppsForDropdown()
      setApps(response.data.data || [])
    } catch (error) {
      console.error('Error fetching apps:', error)
      toast.error('Gagal memuat daftar apps')
    } finally {
      setLoadingApps(false)
    }
  }

  const handleAddGroup = () => {
    setEditingGroup(null)
    setGroupForm({
      name: '',
      description: '',
      app_id: '',
      max_members: 10,
      is_public: false,
      owner_id: '',
      group_status: 'open'
    })
    setShowGroupModal(true)
    fetchUsers()
    fetchApps()
  }

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group)
    setGroupForm({
      name: group.name,
      description: group.description || '',
      app_id: group.app_id,
      max_members: group.max_members,
      is_public: group.is_public,
      owner_id: group.owner_id,
      group_status: group.group_status
    })
    setShowGroupModal(true)
    fetchUsers()
    fetchApps()
  }

  const handleSaveGroup = async () => {
    if (!groupForm.name || !groupForm.app_id || !groupForm.owner_id) {
      toast.error('Nama grup, aplikasi, dan owner harus diisi')
      return
    }

    try {
      setSaving(true)
      
      if (editingGroup) {
        // Update existing group
        await adminAPI.updateGroup({
          group_id: editingGroup.id,
          name: groupForm.name,
          description: groupForm.description,
          app_id: groupForm.app_id,
          max_members: groupForm.max_members,
          is_public: groupForm.is_public,
          group_status: groupForm.group_status
        })
        
        setGroups(prev => prev.map(g => 
          g.id === editingGroup.id 
            ? { ...g, ...groupForm }
            : g
        ))
        
        toast.success('Grup berhasil diupdate')
      } else {
        // Create new group
        const response = await adminAPI.createGroup({
          name: groupForm.name,
          description: groupForm.description,
          app_id: groupForm.app_id,
          max_members: groupForm.max_members,
          is_public: groupForm.is_public,
          owner_id: groupForm.owner_id
        })
        
        setGroups(prev => [response.data, ...prev])
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          public: prev.public + (groupForm.is_public ? 1 : 0),
          private: prev.private + (groupForm.is_public ? 0 : 1)
        }))
        
        toast.success('Grup berhasil dibuat')
      }
      
      setShowGroupModal(false)
      setEditingGroup(null)
    } catch (error: any) {
      console.error('Error saving group:', error)
      toast.error(error.response?.data?.error || 'Gagal menyimpan grup')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus grup ini?')) {
      return
    }

    try {
      await adminAPI.deleteGroup({ group_id: groupId })
      
      const groupToDelete = groups.find(g => g.id === groupId)
      setGroups(prev => prev.filter(g => g.id !== groupId))
      
      if (groupToDelete) {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          public: prev.public - (groupToDelete.is_public ? 1 : 0),
          private: prev.private - (groupToDelete.is_public ? 0 : 1)
        }))
      }
      
      toast.success('Grup berhasil dihapus')
    } catch (error: any) {
      console.error('Error deleting group:', error)
      toast.error(error.response?.data?.error || 'Gagal menghapus grup')
    }
  }

  const fetchGroupMembers = async (groupId: string) => {
    try {
      setLoadingMembers(true)
      const response = await adminAPI.getGroupMembers(groupId)
      setGroupMembers(response.data.members || [])
    } catch (error) {
      console.error('Error fetching group members:', error)
      toast.error('Gagal memuat daftar members')
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleChangeOwner = (group: Group) => {
    setSelectedGroup(group)
    setSelectedNewOwner('')
    setShowChangeOwnerModal(true)
    // Members sudah di-load saat buka detail group, tidak perlu fetch lagi
  }

  const handleConfirmChangeOwner = async () => {
    if (!selectedNewOwner || !selectedGroup) {
      toast.error('Pilih owner baru terlebih dahulu')
      return
    }

    try {
      setChangingOwner(true)
      await adminAPI.changeGroupOwner({
        group_id: selectedGroup.id,
        new_owner_id: selectedNewOwner
      })
      
      // Update group data
      setGroups(prev => prev.map(g => 
        g.id === selectedGroup.id 
          ? { ...g, owner_id: selectedNewOwner }
          : g
      ))
      
      // Update members data
      setGroupMembers(prev => prev.map(member => ({
        ...member,
        role: member.user_id === selectedNewOwner ? 'owner' : 
              member.role === 'owner' ? 'member' : member.role
      })))
      
      toast.success('Owner grup berhasil diubah')
      setShowChangeOwnerModal(false)
      setSelectedGroup(null)
      setSelectedNewOwner('')
    } catch (error: any) {
      console.error('Error changing owner:', error)
      toast.error(error.response?.data?.error || 'Gagal mengubah owner grup')
    } finally {
      setChangingOwner(false)
    }
  }

  const handleRemoveMember = (member: any) => {
    setMemberToRemove(member)
  }

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove || !selectedGroup) {
      return
    }

    try {
      setRemovingMember(true)
      await adminAPI.removeGroupMember({
        group_id: selectedGroup.id,
        user_id: memberToRemove.user_id,
        reason: 'Removed by admin'
      })
      
      // Update members list
      setGroupMembers(prev => prev.filter(m => m.user_id !== memberToRemove.user_id))
      
      // Update group member count
      setGroups(prev => prev.map(g => 
        g.id === selectedGroup.id 
          ? { ...g, current_members: g.current_members - 1, members_count: g.members_count - 1 }
          : g
      ))
      
      toast.success('Member berhasil dikeluarkan dari grup')
      setMemberToRemove(null)
    } catch (error: any) {
      console.error('Error removing member:', error)
      toast.error(error.response?.data?.error || 'Gagal mengeluarkan member')
    } finally {
      setRemovingMember(false)
    }
  }

  const handleAddMember = () => {
    setAddMemberForm({
      user_id: '',
      role: 'member'
    })
    setShowAddMemberModal(true)
    // Fetch users saat buka modal
    fetchUsers()
  }

  const handleConfirmAddMember = async () => {
    if (!addMemberForm.user_id || !selectedGroup) {
      toast.error('Pilih user terlebih dahulu')
      return
    }

    try {
      setAddingMember(true)
      await adminAPI.addGroupMember({
        group_id: selectedGroup.id,
        user_id: addMemberForm.user_id,
        role: addMemberForm.role
      })
      
      // Refresh members list
      await fetchGroupMembers(selectedGroup.id)
      
      // Update group member count
      setGroups(prev => prev.map(g => 
        g.id === selectedGroup.id 
          ? { ...g, current_members: g.current_members + 1, members_count: g.members_count + 1 }
          : g
      ))
      
      toast.success('Member berhasil ditambahkan ke grup')
      setShowAddMemberModal(false)
      setAddMemberForm({
        user_id: '',
        role: 'member'
      })
    } catch (error: any) {
      console.error('Error adding member:', error)
      toast.error(error.response?.data?.error || 'Gagal menambahkan member')
    } finally {
      setAddingMember(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'open':
        return <Badge variant="error" className="flex items-center space-x-1"><XCircle className="h-3 w-3" />Inactive</Badge>
      case 'pending':
      case 'private':
        return <Badge variant="warning" className="flex items-center space-x-1"><Clock className="h-3 w-3" />Private</Badge>
      case 'closed':
        return <Badge variant="error" className="flex items-center space-x-1"><XCircle className="h-3 w-3" />Closed</Badge>
      case 'full':
        return <Badge variant="warning" className="flex items-center space-x-1"><Users className="h-3 w-3" />Full</Badge>
      case 'paid':
      case 'paid_group':
        return <Badge variant="success" className="flex items-center space-x-1"><DollarSign className="h-3 w-3" />Paid</Badge>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kelola Groups</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Kelola dan pantau semua grup patungan
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleAddGroup}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Grup</span>
            </Button>
            <Button
              onClick={() => {/* TODO: Implement export */}}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Inactive</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Full</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.full}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Paid Groups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.paid}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Closed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.closed}</p>
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
                  placeholder="Cari nama grup, aplikasi, atau owner..."
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
                <option value="active">Inactive</option>
                <option value="private">Private</option>
                <option value="closed">Closed</option>
                <option value="full">Full</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Groups List */}
        <Card className="p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Memuat data...</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tidak ada groups
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Belum ada groups yang dibuat
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        {group.app_icon ? (
                          <img 
                            src={group.app_icon} 
                            alt={group.app_name}
                            className="w-10 h-10 rounded"
                          />
                        ) : (
                          <span className="text-lg font-bold text-primary-600">
                            {group.app_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {group.name}
                          </h3>
                          {getStatusBadge(group.group_status)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                          <p>App: {group.app_name}</p>
                          <p>Owner: {group.owner_name} ({group.owner_email})</p>
                          <p>Members: {group.members_count}/{group.max_members}</p>
                          <p>Price: {formatCurrency(group.price_per_member)}/month</p>
                          <p>Revenue: {formatCurrency(group.total_revenue)}</p>
                          <p>Created: {formatDate(group.created_at)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedGroup(group)
                          setShowDetailModal(true)
                          setActiveTab('details')
                          setGroupMembers([]) // Reset members first
                          // Load members saat buka detail group
                          fetchGroupMembers(group.id)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGroup(group)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeOwner(group)}
                        className="text-purple-600 hover:text-purple-700"
                        title="Change Owner"
                      >
                        <Users className="h-4 w-4" />
                      </Button> */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {group.group_status === 'private' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(group.id, 'active')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {group.group_status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(group.id, 'closed')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
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
      {showDetailModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl w-full mx-4 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detail Group
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDetailModal(false)
                  setActiveTab('details')
                }}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => {
                  setActiveTab('details')
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'details'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => {
                  setActiveTab('members')
                  // Always fetch members when switching to members tab
                  fetchGroupMembers(selectedGroup.id)
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'members'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Members ({groupMembers.length})
              </button>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'details' ? (
              <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Group
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedGroup.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Aplikasi
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedGroup.app_name}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  {getStatusBadge(selectedGroup.group_status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Owner
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedGroup.owner_name} ({selectedGroup.owner_email})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Members
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedGroup.members_count}/{selectedGroup.max_members}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subscription Price
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(selectedGroup.price_per_member)}/month
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Revenue
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(selectedGroup.total_revenue)}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedGroup.description || 'No description'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(selectedGroup.created_at)}
                </p>
              </div>
            </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Daftar Members
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddMember}
                      className="text-green-600 hover:text-green-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChangeOwner(selectedGroup)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Change Owner
                    </Button>
                  </div>
                </div>

                {loadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">Memuat members...</span>
                  </div>
                ) : groupMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Belum ada members</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {groupMembers.map((member) => (
                      <div
                        key={member.user_id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          member.user_id === selectedGroup.owner_id
                            ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                              {member.user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.user.full_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={member.role === 'owner' ? 'success' : member.role === 'admin' ? 'warning' : 'gray'}
                            className="text-xs"
                          >
                            {member.role}
                          </Badge>
                          <Badge 
                            variant={member.user_status === 'active' ? 'success' : 'error'}
                            className="text-xs"
                          >
                            {member.user_status}
                          </Badge>
                          {member.user_id === selectedGroup.owner_id && (
                            <Badge variant="primary" className="text-xs">
                              Current Owner
                            </Badge>
                          )}
                          {member.user_id !== selectedGroup.owner_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMember(member)}
                              className="text-red-600 hover:text-red-700 ml-2"
                              title="Remove Member"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </Button>
              {selectedGroup.group_status === 'private' && (
                <Button
                  onClick={() => {
                    handleStatusChange(selectedGroup.id, 'active')
                    setShowDetailModal(false)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aktifkan
                </Button>
              )}
              {selectedGroup.group_status === 'open' && (
                <Button
                  onClick={() => {
                    handleStatusChange(selectedGroup.id, 'closed')
                    setShowDetailModal(false)
                  }}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Close
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Group Form Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl w-full mx-4 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingGroup ? 'Edit Grup' : 'Tambah Grup Baru'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGroupModal(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Grup *
                </label>
                <Input
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Masukkan nama grup"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Masukkan deskripsi grup"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Aplikasi *
                </label>
                <select
                  value={groupForm.app_id}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, app_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  disabled={loadingApps}
                >
                  <option value="">Pilih aplikasi</option>
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
                {loadingApps && <p className="text-sm text-gray-500 mt-1">Memuat aplikasi...</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Owner *
                </label>
                <select
                  value={groupForm.owner_id}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, owner_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  disabled={loadingUsers || !!editingGroup}
                >
                  <option value="">Pilih owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
                {loadingUsers && <p className="text-sm text-gray-500 mt-1">Memuat users...</p>}
                {editingGroup && <p className="text-sm text-gray-500 mt-1">Owner tidak dapat diubah</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maksimal Anggota
                </label>
                <Input
                  type="number"
                  min="2"
                  max="50"
                  value={groupForm.max_members}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, max_members: parseInt(e.target.value) || 10 }))}
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={groupForm.is_public}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Grup Publik</span>
                </label>
              </div>

              {editingGroup && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={groupForm.group_status}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, group_status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="open">Open</option>
                      <option value="private">Private</option>
                      <option value="full">Full</option>
                      <option value="paid_group">Paid Group</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Group Status
                    </label>
                    <select
                      value={groupForm.group_status}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, group_status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="open">Open</option>
                      <option value="private">Private</option>
                      <option value="full">Full</option>
                      <option value="paid_group">Paid Group</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowGroupModal(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveGroup}
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingGroup ? 'Update' : 'Simpan'}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Change Owner Modal */}
      {showChangeOwnerModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl w-full mx-4 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ubah Owner Grup
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChangeOwnerModal(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Grup: <span className="font-medium">{selectedGroup.name}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Owner saat ini: <span className="font-medium">{selectedGroup.owner_name}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Pilih Member sebagai Owner Baru:
                </h4>
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Memuat members...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {groupMembers
                      .filter(member => member.user_id !== selectedGroup.owner_id && member.user_status === 'active')
                      .map((member) => (
                        <div
                          key={member.user_id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedNewOwner === member.user_id
                              ? 'bg-primary-50 dark:bg-primary-900 border-primary-300 dark:border-primary-700'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => setSelectedNewOwner(member.user_id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                                {member.user.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {member.user.full_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {member.user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={member.role === 'admin' ? 'warning' : 'gray'}
                              className="text-xs"
                            >
                              {member.role}
                            </Badge>
                            {selectedNewOwner === member.user_id && (
                              <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    
                    {groupMembers.filter(member => member.user_id !== selectedGroup.owner_id && member.user_status === 'active').length === 0 && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Tidak ada member yang bisa dijadikan owner</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Perhatian:</strong> Mengubah owner akan mengubah role owner lama menjadi member. 
                  Pastikan owner baru adalah member aktif dari grup ini.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowChangeOwnerModal(false)}
                disabled={changingOwner}
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmChangeOwner}
                disabled={changingOwner || !selectedNewOwner}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {changingOwner ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengubah...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Ubah Owner
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tambah Member ke Grup
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddMemberModal(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Grup: <span className="font-medium">{selectedGroup.name}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Slot tersedia: {selectedGroup.max_members - selectedGroup.current_members} dari {selectedGroup.max_members}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Pilih User untuk Ditambahkan:
                </h4>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Memuat users...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {users
                      .filter(user => !groupMembers.some(member => member.user_id === user.id))
                      .map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            addMemberForm.user_id === user.id
                              ? 'bg-primary-50 dark:bg-primary-900 border-primary-300 dark:border-primary-700'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => setAddMemberForm(prev => ({ ...prev, user_id: user.id }))}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                                {user.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.full_name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          {addMemberForm.user_id === user.id && (
                            <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    
                    {users.filter(user => !groupMembers.some(member => member.user_id === user.id)).length === 0 && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Semua user sudah menjadi member grup ini</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {addMemberForm.user_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role untuk User Ini
                  </label>
                  <select
                    value={addMemberForm.role}
                    onChange={(e) => setAddMemberForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddMemberModal(false)}
                disabled={addingMember}
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmAddMember}
                disabled={addingMember || !addMemberForm.user_id}
                className="bg-green-600 hover:bg-green-700"
              >
                {addingMember ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menambahkan...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Tambah Member
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Konfirmasi Hapus Member
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMemberToRemove(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Grup: <span className="font-medium">{selectedGroup.name}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Apakah Anda yakin ingin mengeluarkan <span className="font-medium">{memberToRemove.user.full_name}</span> dari grup ini?
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Perhatian:</strong> Tindakan ini tidak dapat dibatalkan. Member akan dikeluarkan dari grup dan tidak dapat bergabung kembali kecuali diundang ulang.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setMemberToRemove(null)}
                disabled={removingMember}
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmRemoveMember}
                disabled={removingMember}
                className="bg-red-600 hover:bg-red-700"
              >
                {removingMember ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengeluarkan...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Keluarkan Member
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
