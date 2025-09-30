'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  DollarSign, 
  Star,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  ExternalLink,
  LogOut
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { groupAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/DashboardLayout'

interface Group {
  id: string
  name: string
  description?: string
  app_id?: string
  max_members: number
  current_members?: number
  price_per_member?: number
  admin_fee?: number
  total_price?: number
  group_status: string
  invite_code: string
  owner_id: string
  expires_at?: string
  created_at: string
  updated_at: string
  member_count?: number
  app?: {
    name: string
    description: string
    category: string
    icon_url: string
  }
}

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [leavingGroupId, setLeavingGroupId] = useState<string | null>(null)

  useEffect(() => {
    fetchGroups()
    fetchCategories()
  }, [searchTerm, selectedCategory])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await groupAPI.getUserGroups()
      console.log('User groups response:', response.data)
      setGroups(response.data.groups || [])
    } catch (error: any) {
      console.error('Error fetching user groups:', error)
      console.error('Error response:', error.response?.data)
      // Set empty groups on error
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      // Get categories from user's groups
      const response = await groupAPI.getUserGroups()
      const uniqueCategories = Array.from(new Set(
        response.data.groups?.map((group: Group) => group.app?.category).filter(Boolean) || []
      )) as string[]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (group.app?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || group.app?.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'full':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open'
      case 'full':
        return 'Full'
      case 'active':
        return 'Active'
      case 'expired':
        return 'Expired'
      default:
        return status
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm('Apakah Anda yakin ingin keluar dari grup ini?')) {
      return
    }

    try {
      setLeavingGroupId(groupId)
      await groupAPI.leaveGroup(groupId)
      
      // Remove group from local state
      setGroups(groups.filter(group => group.id !== groupId))
      
      // Show success message
      alert('Berhasil keluar dari grup')
    } catch (error: any) {
      console.error('Error leaving group:', error)
      alert(error.response?.data?.error || 'Gagal keluar dari grup')
    } finally {
      setLeavingGroupId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Grup Saya
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Kelola grup patungan yang sudah Anda ikuti
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => router.push('/browse')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Jelajahi Grup</span>
            </Button>
            <Button
              onClick={() => router.push('/groups/create')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Buat Grup</span>
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Cari grup yang sudah diikuti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === '' ? 'primary' : 'outline'}
              onClick={() => setSelectedCategory('')}
              size="sm"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Belum ada grup yang diikuti
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Mulai bergabung dengan grup patungan atau buat grup baru
            </p>
            <div className="flex justify-center space-x-2">
              <Button
                onClick={() => router.push('/browse')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Jelajahi Grup</span>
              </Button>
              <Button
                onClick={() => router.push('/groups/create')}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Grup</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow dark:bg-gray-800">
                  {/* App Info */}
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      {group.app?.icon_url ? (
                        <img 
                          src={group.app.icon_url} 
                          alt={group.app.name}
                          className="w-8 h-8"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 bg-primary-100 rounded flex items-center justify-center ${group.app?.icon_url ? 'hidden' : ''}`}>
                        <span className="text-primary-600 font-bold text-sm">
                          {(group.app?.name || group.name).charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {group.app?.name || 'Aplikasi tidak tersedia'}
                      </p>
                      {group.app?.category && (
                        <Badge variant="gray" className="text-xs mt-1">
                          {group.app.category}
                        </Badge>
                      )}
                    </div>
                    <Badge className={`text-xs ${getStatusColor(group.group_status)}`}>
                      {getStatusText(group.group_status)}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {group.description || 'Tidak ada deskripsi tersedia'}
                  </p>

                  {/* Group Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Users className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {group.current_members || group.member_count || 0}/{group.max_members}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Anggota</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <DollarSign className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {group.total_price ? formatCurrency(group.total_price) : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Aplikasi</p>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  {group.price_per_member && (
                    <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300">Per User:</span>
                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                          {formatCurrency(group.price_per_member)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Admin fee: {formatCurrency(3500)}</span>
                        <span>Total per user: {formatCurrency(group.price_per_member + 3500)}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => router.push(`/groups/${group.id}`)}
                      className="flex-1"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Detail Grup
                    </Button>
                    {group.app_id && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/app/${group.app_id}`)}
                        className="px-3"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleLeaveGroup(group.id)}
                      disabled={leavingGroupId === group.id}
                      className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                      {leavingGroupId === group.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Created Date */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Dibuat {new Date(group.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}