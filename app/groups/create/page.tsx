'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConfetti } from '@/contexts/ConfettiContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import AppIcon from '@/components/AppIcon'
import { ArrowLeft, Users, Info, Zap, Shield, CreditCard, Search, Star } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { groupAPI, appAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CreateGroupForm {
  name: string
  description: string
  app_id: string
  max_members: number
  is_public: string
}

interface App {
  id: string
  name: string
  description: string
  category: string
  icon_url: string
  website_url?: string
  total_members: number
  total_price: number
  price_per_user: number
  admin_fee_percentage: number
  is_popular: boolean
  is_active: boolean
}

export default function CreateGroupPage() {
  const router = useRouter()
  const { showConfetti } = useConfetti()
  const [loading, setLoading] = useState(false)
  const [apps, setApps] = useState<App[]>([])
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [loadingApps, setLoadingApps] = useState(true)

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CreateGroupForm>({
    defaultValues: {
      max_members: 4,
      is_public: 'true'
    }
  })

  // Add app_id validation
  const validateAppId = (value: string) => {
    if (!value) return 'Pilih aplikasi wajib diisi'
    return true
  }

  const maxMembers = watch('max_members')
  const appId = watch('app_id')

  useEffect(() => {
    fetchApps()
  }, [])

  useEffect(() => {
    if (appId && apps.length > 0) {
      const app = apps.find(a => a.id === appId)
      if (app) {
        setSelectedApp(app)
        // Set max_members to app's total_members (fixed, cannot be changed)
        setValue('max_members', app.total_members)
      }
    }
  }, [appId, apps, setValue])

  const fetchApps = async () => {
    try {
      setLoadingApps(true)
      const response = await appAPI.getApps({ page: 1, page_size: 100 })
      setApps(response.data.apps || [])
      
      // Extract categories
      const uniqueCategories = Array.from(new Set(
        response.data.apps?.map((app: App) => app.category) || []
      )) as string[]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching apps:', error)
      toast.error('Gagal memuat daftar aplikasi')
    } finally {
      setLoadingApps(false)
    }
  }

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const onSubmit = async (data: CreateGroupForm) => {
    setLoading(true)
    try {
      // Convert string values to boolean for is_public
      const formData = {
        ...data,
        is_public: data.is_public === 'true'
      }
      
      const response = await groupAPI.createGroup(formData)
      toast.success('Grup berhasil dibuat!')
      showConfetti()
      setTimeout(() => {
        router.push(`/groups/${response.data.group.id}`)
      }, 2000)
    } catch (error: any) {
      console.error('Error creating group:', error)
      if (error.response?.status === 401) {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
        router.push('/?redirect=' + encodeURIComponent(window.location.pathname))
      } else if (error.response?.data?.error === 'Authorization header required') {
        toast.error('Anda belum login. Silakan daftar atau login terlebih dahulu.')
        router.push('/?redirect=' + encodeURIComponent(window.location.pathname))
      } else {
        toast.error(error.response?.data?.error || 'Gagal membuat grup')
      }
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <Users className="h-6 w-6 text-primary-600" />,
      title: 'Kelola Anggota',
      description: 'Undang teman-teman dengan kode undangan unik. Kelola peran dan akses setiap anggota dengan mudah.'
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary-600" />,
      title: 'Patungan Otomatis',
      description: 'Sistem pembagian biaya otomatis berdasarkan persentase yang adil. Integrasi Midtrans untuk pembayaran yang aman.'
    },
    {
      icon: <Shield className="h-6 w-6 text-primary-600" />,
      title: 'Keamanan Data',
      description: 'Enkripsi data dan sistem keamanan terbaik untuk melindungi informasi grup dan transaksi Anda.'
    }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buat Grup Baru</h1>
            <p className="text-gray-600 mt-1">Buat grup untuk patungan subscription bersama teman-teman</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* App Selection */}
                <div>
                  <label className="label mb-2 block">Pilih Aplikasi *</label>
                  <div className="space-y-4">
                    {/* Search and Filter */}
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Cari aplikasi..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input w-32"
                      >
                        <option value="">All</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Apps Grid */}
                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                      {loadingApps ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {filteredApps.map((app) => (
                            <div
                              key={app.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                appId === app.id
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                              onClick={() => setValue('app_id', app.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <AppIcon 
                                  iconUrl={app.icon_url}
                                  name={app.name}
                                  size="md"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {app.name}
                                    </h4>
                                    {app.is_popular && (
                                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {app.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {app.category}
                                    </span>
                                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                                      {formatCurrency(app.price_per_user)}+3500 /user
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    type="hidden"
                    {...register('app_id', { validate: validateAppId })}
                  />
                  {errors.app_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.app_id.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Nama Grup *"
                    placeholder="Contoh: Grup Netflix Keluarga"
                    {...register('name', { required: 'Nama grup wajib diisi' })}
                    error={!!errors.name}
                    errorText={errors.name?.message}
                  />
                </div>

                <div>
                  <label className="label mb-2 block">Deskripsi</label>
                  <textarea
                    {...register('description')}
                    placeholder="Deskripsikan tujuan grup ini..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>

                <div>
                  <label className="label mb-2 block">Maksimal Anggota</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedApp ? `${selectedApp.total_members} anggota` : 'Pilih aplikasi terlebih dahulu'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedApp ? `Untuk ${selectedApp.name}` : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selectedApp ? 'Jumlah anggota sudah ditentukan oleh aplikasi yang dipilih' : 'Jumlah anggota akan ditentukan setelah memilih aplikasi'}
                    </p>
                  </div>
                  <input
                    type="hidden"
                    {...register('max_members', { 
                      required: 'Maksimal anggota wajib diisi',
                      value: selectedApp?.total_members || 4
                    })}
                  />
                </div>

                {/* Visibility Settings */}
                <div>
                  <label className="label mb-3 block">Visibilitas Grup</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="public"
                        value="true"
                        {...register('is_public')}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500"
                      />
                      <label htmlFor="public" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-white">Public</span>
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Direkomendasikan</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Grup akan muncul di halaman "Join Group" dan dapat ditemukan oleh pengguna lain
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="private"
                        value="false"
                        {...register('is_public')}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500"
                      />
                      <label htmlFor="private" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-white">Private</span>
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Eksklusif</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Grup hanya dapat diakses melalui kode undangan yang Anda bagikan
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Info about visibility */}
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">Tentang Visibilitas:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                          <li><strong>Public:</strong> Grup dapat ditemukan dan dijoin oleh siapa saja</li>
                          <li><strong>Private:</strong> Grup hanya dapat diakses melalui kode undangan</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Tips membuat grup yang baik:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Gunakan nama yang mudah diingat dan deskriptif</li>
                        <li>Atur jumlah anggota sesuai kebutuhan subscription</li>
                        <li>Bagikan kode undangan hanya kepada orang yang dipercaya</li>
                        <li>Diskusikan aturan pembayaran sebelum memulai</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    loading={loading}
                    className="flex-1"
                  >
                    {loading ? 'Membuat...' : 'Buat Grup'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview Grup</h3>
              <div className="space-y-3">
                {selectedApp && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Aplikasi</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <AppIcon 
                        iconUrl={selectedApp.icon_url}
                        name={selectedApp.name}
                        size="sm"
                      />
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedApp.name}
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Nama Grup</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {watch('name') || 'Nama grup Anda'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Maksimal Anggota</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedApp?.total_members || maxMembers} anggota
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Visibilitas</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      watch('is_public') === 'true'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {watch('is_public') === 'true' ? 'Public' : 'Private'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {watch('is_public') === 'true' 
                        ? 'Dapat ditemukan di Join Group' 
                        : 'Hanya melalui undangan'
                      }
                    </span>
                  </div>
                </div>
                {selectedApp && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Aplikasi</p>
                      <p className="font-medium text-primary-600 dark:text-primary-400">
                        {formatCurrency(selectedApp.total_price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Admin Fee</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(3500)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total per User</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(selectedApp.price_per_user + 3500)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start space-x-3">
                    {feature.icon}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <Card className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50">
              <div className="text-center">
                <Zap className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">
                  Mulai Hemat Sekarang
                </h3>
                <p className="text-sm text-gray-600">
                  Dengan {selectedApp?.total_members || maxMembers} anggota, Anda bisa berbagi biaya subscription dengan teman-teman.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
