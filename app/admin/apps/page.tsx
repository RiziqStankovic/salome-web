'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Smartphone, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  DollarSign,
  Trash2,
  Save
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface App {
  id: string
  name: string
  description: string
  icon_url?: string
  category: string
  is_active: boolean
  how_it_works?: string
  total_price: number
  max_group_members: number
  admin_fee_percentage: number
  created_at: string
  updated_at: string
  groups_count: number
  total_revenue: number
  avg_price: number
}

interface AppStats {
  total: number
  active: number
  inactive: number
  total_revenue: number
  avg_price: number
}

export default function AdminAppsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [apps, setApps] = useState<App[]>([])
  const [stats, setStats] = useState<AppStats>({
    total: 0,
    active: 0,
    inactive: 0,
    total_revenue: 0,
    avg_price: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAppModal, setShowAppModal] = useState(false)
  const [editingApp, setEditingApp] = useState<App | null>(null)
  const [appForm, setAppForm] = useState({
    name: '',
    description: '',
    category: '',
    icon_url: '',
    how_it_works: '',
    total_price: '',
    max_group_members: '',
    admin_fee_percentage: '',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const appsFetched = useRef(false)

  // Redirect to homepage if not admin
  useEffect(() => {
    console.log('Admin Apps - Auth Check:', { 
      authLoading, 
      user: user ? { id: user.id, email: user.email, is_admin: user.is_admin, role: user.role } : null 
    })
    
    if (!authLoading && (!user || !user.is_admin)) {
      console.log('Admin Apps - Redirecting to homepage because:', { user: !!user, is_admin: user?.is_admin })
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch apps only once when user is loaded
  useEffect(() => {
    if (user?.is_admin && !appsFetched.current) {
      appsFetched.current = true
      fetchApps()
    }
  }, [user?.id]) // Use user.id instead of user object to prevent re-renders

  // Note: We don't refetch when filters change, we filter client-side

  const fetchApps = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getApps({
        page: 1,
        page_size: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined
      })
      
      setApps(response.data.data || [])
      setStats(response.data.stats || {
        total: 0,
        active: 0,
        inactive: 0,
        total_revenue: 0,
        avg_price: 0
      })
    } catch (error) {
      console.error('Error fetching apps:', error)
      toast.error('Gagal memuat data apps')
      setApps([])
      setStats({
        total: 0,
        active: 0,
        inactive: 0,
        total_revenue: 0,
        avg_price: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredApps = (apps || []).filter(app => {
    // Skip apps that don't have required fields
    if (!app || !app.name) {
      return false
    }
    
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && app.is_active) ||
      (statusFilter === 'inactive' && !app.is_active)
    
    const shouldInclude = matchesSearch && matchesStatus
    if (!shouldInclude) {
    }
    
    return shouldInclude
  })

  const handleStatusChange = async (appId: string, field: 'is_active', value: boolean) => {
    try {
      await adminAPI.updateAppStatus({
        app_id: appId,
        field: field,
        value: value
      })
      
      setApps(prev => prev.map(a => 
        a.id === appId 
          ? { ...a, [field]: value }
          : a
      ))
      
      // Update stats
      setStats(prev => {
        const updated = { ...prev }
        if (field === 'is_active') {
          if (value) {
            updated.active += 1
            updated.inactive -= 1
          } else {
            updated.active -= 1
            updated.inactive += 1
          }
        }
        return updated
      })
      
      toast.success(`App ${field} updated to ${value}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Gagal mengupdate status app')
    }
  }

  const handleAddApp = () => {
    setEditingApp(null)
    setAppForm({
      name: '',
      description: '',
      category: '',
      icon_url: '',
      how_it_works: '',
      total_price: '',
      max_group_members: '',
      admin_fee_percentage: '',
      is_active: true,
    })
    setShowAppModal(true)
  }

  const handleEditApp = (app: App) => {
    setEditingApp(app)
      setAppForm({
        name: app.name,
        description: app.description,
        category: app.category,
        icon_url: app.icon_url || '',
        how_it_works: app.how_it_works || '',
        total_price: app.total_price?.toString() || '',
        max_group_members: app.max_group_members?.toString() || '',
        admin_fee_percentage: app.admin_fee_percentage?.toString() || '',
        is_active: app.is_active
      })
    setShowAppModal(true)
  }

  const handleSaveApp = async () => {
    if (!appForm.name || !appForm.description || !appForm.category) {
      toast.error('Nama, deskripsi, dan kategori harus diisi')
      return
    }

    const totalPrice = parseInt(appForm.total_price) || 0
    const maxMembers = parseInt(appForm.max_group_members) || 0
    const adminFee = parseInt(appForm.admin_fee_percentage) || 0

    if (totalPrice <= 0) {
      toast.error('Total harga harus lebih dari 0')
      return
    }

    if (maxMembers <= 0) {
      toast.error('Max anggota grup harus lebih dari 0')
      return
    }

    if (adminFee < 0 || adminFee > 100) {
      toast.error('Persentase admin fee harus antara 0-100')
      return
    }

    try {
      setSaving(true)
      
      if (editingApp) {
        // Update existing app
        await adminAPI.updateApp({
          app_id: editingApp.id,
          name: appForm.name,
          description: appForm.description,
          category: appForm.category,
          icon_url: appForm.icon_url,
          how_it_works: appForm.how_it_works,
          total_price: totalPrice,
          max_group_members: maxMembers,
          admin_fee_percentage: adminFee,
          is_active: appForm.is_active
        })
        
        setApps(prev => prev.map(a => 
          a.id === editingApp.id 
            ? { 
                ...a, 
                name: appForm.name,
                description: appForm.description,
                category: appForm.category,
                icon_url: appForm.icon_url,
                how_it_works: appForm.how_it_works,
                total_price: totalPrice,
                max_group_members: maxMembers,
                admin_fee_percentage: adminFee,
                is_active: appForm.is_active
              }
            : a
        ))
        
        toast.success('App berhasil diupdate')
        
        // Refresh data from server to ensure consistency
        await fetchApps()
      } else {
        // Create new app
        const response = await adminAPI.createApp({
          name: appForm.name,
          description: appForm.description,
          category: appForm.category,
          icon_url: appForm.icon_url,
          how_it_works: appForm.how_it_works,
          total_price: totalPrice,
          max_group_members: maxMembers,
          admin_fee_percentage: adminFee,
          is_active: appForm.is_active
        })
        
        
        // Backend returns {data: app}, so we need response.data
        if (response.data) {
          setApps(prev => [response.data, ...prev])
        } else {
          console.error('No data in response:', response)
          toast.error('Gagal membuat app - data tidak valid')
          return
        }
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          active: prev.active + (appForm.is_active ? 1 : 0),
          inactive: prev.inactive + (appForm.is_active ? 0 : 1),
        }))
        
        toast.success('App berhasil dibuat')
        
        // Refresh data from server to ensure consistency
        await fetchApps()
      }
      
      setShowAppModal(false)
      setEditingApp(null)
    } catch (error) {
      console.error('Error saving app:', error)
      toast.error('Gagal menyimpan app')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteApp = async (appId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus app ini?')) {
      return
    }

    try {
      await adminAPI.deleteApp({ app_id: appId })
      
      const appToDelete = apps.find(a => a.id === appId)
      setApps(prev => prev.filter(a => a.id !== appId))
      
      if (appToDelete) {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          active: prev.active - (appToDelete.is_active ? 1 : 0),
          inactive: prev.inactive - (appToDelete.is_active ? 0 : 1),
        }))
      }
      
      toast.success('App berhasil dihapus')
      
      // Refresh data from server to ensure consistency
      await fetchApps()
    } catch (error) {
      console.error('Error deleting app:', error)
      toast.error('Gagal menghapus app')
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="success" className="flex items-center space-x-1">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="error" className="flex items-center space-x-1">
        <XCircle className="h-3 w-3" />
        Inactive
      </Badge>
    )
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
  if (!user || !user.is_admin) {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kelola Apps</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Kelola dan pantau semua aplikasi yang tersedia
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleAddApp}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah App</span>
            </Button>
            <Button
              onClick={() => {/* TODO: Implement export */}}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Apps</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800">
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

          <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.total_revenue)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama app, deskripsi, atau kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Apps List */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Memuat data...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tidak ada apps
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Belum ada apps yang terdaftar
                </p>
              </div>
            ) : (
              filteredApps.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {app.icon_url ? (
                          <img 
                            src={app.icon_url} 
                            alt={app.name}
                            className="w-10 h-10 rounded"
                          />
                        ) : (
                          <span className="text-lg font-bold text-primary-600">
                            {(app.name || 'A').charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {app.name}
                          </h3>
                          {getStatusBadge(app.is_active)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="font-medium">Category:</span> {app.category || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {app.description || 'No description'}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Groups:</span> {app.groups_count || 0} | <span className="font-medium">Revenue:</span> {formatCurrency(app.total_revenue || 0)}
                          </div>
                          <div>
                            <span className="font-medium">Total Price:</span> {formatCurrency(app.total_price || 0)} | <span className="font-medium">Max Members:</span> {app.max_group_members || 0}
                          </div>
                          <div>
                            <span className="font-medium">Admin Fee:</span> {app.admin_fee_percentage || 0}% | <span className="font-medium">Avg Price:</span> {formatCurrency(app.avg_price || 0)}
                          </div>
                          <div>
                            <span className="font-medium">Updated:</span> {formatDate(app.updated_at || new Date().toISOString())}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedApp(app)
                          setShowDetailModal(true)
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditApp(app)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(app.id, 'is_active', !app.is_active)}
                        className={`p-2 ${
                          app.is_active 
                            ? "hover:bg-red-100 dark:hover:bg-red-900 text-red-600 hover:text-red-700" 
                            : "hover:bg-green-100 dark:hover:bg-green-900 text-green-600 hover:text-green-700"
                        }`}
                      >
                        {app.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl w-full mx-4 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detail App
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
                    Nama App
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedApp.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedApp.category}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                {getStatusBadge(selectedApp.is_active)}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedApp.description}
                </p>
              </div>
              
              {selectedApp.how_it_works && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    How It Works
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedApp.how_it_works}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Price
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(selectedApp.total_price)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Group Members
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedApp.max_group_members}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Fee Percentage
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedApp.admin_fee_percentage}%
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Groups Count
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedApp.groups_count}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Revenue
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(selectedApp.total_revenue)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Average Price
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(selectedApp.avg_price)}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Updated At
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(selectedApp.updated_at)}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </Button>
              <Button
                onClick={() => {
                  handleStatusChange(selectedApp.id, 'is_active', !selectedApp.is_active)
                  setShowDetailModal(false)
                }}
                className={selectedApp.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {selectedApp.is_active ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* App Form Modal */}
      {showAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl w-full mx-4 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingApp ? 'Edit App' : 'Tambah App Baru'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAppModal(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama App *
                  </label>
                  <Input
                    value={appForm.name}
                    onChange={(e) => setAppForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama app"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori *
                  </label>
                  <Input
                    value={appForm.category}
                    onChange={(e) => setAppForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Masukkan kategori"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi *
                </label>
                <textarea
                  value={appForm.description}
                  onChange={(e) => setAppForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Masukkan deskripsi app"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL Icon
                </label>
                <Input
                  value={appForm.icon_url}
                  onChange={(e) => setAppForm(prev => ({ ...prev, icon_url: e.target.value }))}
                  placeholder="Masukkan URL icon (opsional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cara Kerja
                </label>
                <textarea
                  value={appForm.how_it_works}
                  onChange={(e) => setAppForm(prev => ({ ...prev, how_it_works: e.target.value }))}
                  placeholder="Masukkan cara kerja app (opsional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Price *
                  </label>
                  <Input
                    type="number"
                    value={appForm.total_price}
                    onChange={(e) => setAppForm(prev => ({ ...prev, total_price: e.target.value }))}
                    placeholder="Masukkan total harga"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Group Members *
                  </label>
                  <Input
                    type="number"
                    value={appForm.max_group_members}
                    onChange={(e) => setAppForm(prev => ({ ...prev, max_group_members: e.target.value }))}
                    placeholder="Masukkan max anggota"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Fee Percentage *
                  </label>
                  <Input
                    type="number"
                    value={appForm.admin_fee_percentage}
                    onChange={(e) => setAppForm(prev => ({ ...prev, admin_fee_percentage: e.target.value }))}
                    placeholder="Masukkan persentase admin fee"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={appForm.is_active}
                  onChange={(e) => setAppForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAppModal(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveApp}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? 'Menyimpan...' : (editingApp ? 'Update' : 'Simpan')}</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
