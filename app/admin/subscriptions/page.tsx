'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  Mail, 
  UserPlus, 
  Search, 
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-react'
import { adminAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface GroupMember {
  id: string
  user_id: string
  user_status: string
  joined_at: string
  user: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

interface AccountCredential {
  id: string
  group_id: string
  user_id: string
  username: string
  email: string
  description: string
  created_at: string
  user: {
    id: string
    full_name: string
    email: string
  }
}

interface PaidGroup {
  id: string
  name: string
  description: string
  app_id: string
  max_members: number
  member_count: number
  price_per_member: number
  total_price: number
  group_status: string
  all_paid_at: string
  created_at: string
  app: {
    id: string
    name: string
    icon_url: string
  }
  members: GroupMember[]
  account_credentials: AccountCredential[]
}

export default function AdminSubscriptionsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [groups, setGroups] = useState<PaidGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<PaidGroup | null>(null)
  const [showGroupDetail, setShowGroupDetail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push('/dashboard')
      return
    }

    if (user?.is_admin) {
      fetchPaidGroups()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.is_admin) {
      fetchPaidGroups()
    }
  }, [searchTerm])

  const fetchPaidGroups = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getSubscriptions({
        page: 1,
        page_size: 100,
        search: searchTerm
      })
      
      if (response.data?.data?.groups) {
        setGroups(response.data.data.groups)
      }
    } catch (error: any) {
      console.error('Error fetching paid groups:', error)
      toast.error('Gagal memuat data group')
    } finally {
      setLoading(false)
    }
  }

  const handleViewGroup = (group: PaidGroup) => {
    setSelectedGroup(group)
    setShowGroupDetail(true)
  }

  const handleAddCredential = async () => {
    if (!selectedGroup || !newEmail || !newPassword) {
      toast.error('Email dan password harus diisi')
      return
    }

    try {
      setSubmitting(true)
      // TODO: Implement add credential API
      toast.success('Kredensial berhasil ditambahkan')
      setNewEmail('')
      setNewPassword('')
      // Refresh group data
      fetchPaidGroups()
    } catch (error: any) {
      console.error('Error adding credential:', error)
      toast.error('Gagal menambahkan kredensial')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.app.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid_group':
        return <Badge variant="success">Lunas</Badge>
      case 'active':
        return <Badge variant="primary">Aktif</Badge>
      default:
        return <Badge variant="gray">{status}</Badge>
    }
  }


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

  if (!user?.is_admin) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Akses Ditolak
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Anda tidak memiliki akses ke halaman ini.
            </p>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Group Subscriptions
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Kelola subscription dan kredensial group yang sudah lunas
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={fetchPaidGroups}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Groups
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groups.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Members
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groups.reduce((sum, group) => sum + group.member_count, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Credentials
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groups.reduce((sum, group) => sum + group.account_credentials.length, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Avg. Members
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groups.length > 0 ? Math.round(groups.reduce((sum, group) => sum + group.member_count, 0) / groups.length) : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari group atau aplikasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Groups List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Memuat data...</p>
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Tidak ada group
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm ? 'Tidak ada group yang sesuai dengan pencarian' : 'Belum ada group yang sudah lunas'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={group.app.icon_url}
                        alt={group.app.name}
                        className="w-10 h-10 rounded-lg"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {group.app.name}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(group.group_status)}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Members:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {group.member_count}/{group.max_members}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Credentials:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {group.account_credentials.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Lunas:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {group.all_paid_at ? new Date(group.all_paid_at).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Jakarta'
                        }) : 'Tidak tersedia'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleViewGroup(group)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Group Detail Modal */}
        {showGroupDetail && selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedGroup.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedGroup.app.name} • {selectedGroup.member_count} members
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGroupDetail(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Members List */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Members ({selectedGroup.members.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedGroup.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                {member.user.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {member.user.full_name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {member.user.email}
                              </p>
                            </div>
                          </div>
                          <Badge variant={member.user_status === 'paid' ? 'success' : 'warning'}>
                            {member.user_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Credentials List */}
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Credentials ({selectedGroup.account_credentials.length})
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {selectedGroup.account_credentials.map((credential) => (
                        <div
                          key={credential.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {credential.email}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Username: {credential.username}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {credential.description}
                              </p>
                            </div>
                            <Badge variant="gray" className="text-xs">
                              Account
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            By: {credential.user.full_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(credential.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      ))}

                      {selectedGroup.account_credentials.length === 0 && (
                        <div className="text-center py-8">
                          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 dark:text-gray-300">
                            Belum ada kredensial
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
