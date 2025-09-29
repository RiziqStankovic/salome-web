'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Search, 
  Filter, 
  Star, 
  ExternalLink,
  Users,
  Eye,
  TrendingUp
} from 'lucide-react'
import { appAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface App {
  id: string
  name: string
  description: string
  category: string
  icon_url: string
  website_url: string
  total_members: number
  total_price: number
  price_per_user: number
  is_popular: boolean
}

interface AppListResponse {
  apps: App[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export default function BrowsePage() {
  const router = useRouter()
  const [apps, setApps] = useState<App[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showPopularOnly, setShowPopularOnly] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchApps()
    fetchCategories()
  }, [pagination.page, selectedCategory, searchTerm, showPopularOnly])

  const fetchApps = async () => {
    try {
      setLoading(true)
      const response = await appAPI.getApps({
        page: pagination.page,
        page_size: pagination.pageSize,
        category: selectedCategory || undefined,
        q: searchTerm || undefined,
        popular: showPopularOnly || undefined
      })
      
      const data: AppListResponse = response.data
      setApps(data.apps)
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.total_pages
      }))
    } catch (error) {
      console.error('Failed to fetch apps:', error)
      toast.error('Gagal memuat daftar aplikasi')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await appAPI.getAppCategories()
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchApps()
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePopularToggle = () => {
    setShowPopularOnly(!showPopularOnly)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleViewDetail = (app: App) => {
    // Navigate to app detail page
    router.push(`/app/${app.id}`)
  }

  const handleJoinGroup = (app: App) => {
    // Navigate to join group page with app context
    router.push(`/join?app=${app.id}`)
  }

  if (loading && apps.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Apps</h1>
            <p className="text-gray-600 mt-1">Temukan aplikasi untuk patungan bersama</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Cari aplikasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="sm:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Kategori:</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === '' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange('')}
                  >
                    Semua
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Popular Filter */}
              <Button
                variant={showPopularOnly ? 'primary' : 'outline'}
                size="sm"
                onClick={handlePopularToggle}
                className="flex items-center"
              >
                <Star className="h-4 w-4 mr-2" />
                Populer
              </Button>
            </div>
          </form>
        </Card>

        {/* Apps Grid */}
        {apps.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aplikasi tidak ditemukan
            </h3>
            <p className="text-gray-600 mb-6">
              Coba gunakan kata kunci atau filter yang berbeda
            </p>
            <Button onClick={() => {
              setSearchTerm('')
              setSelectedCategory('')
              setShowPopularOnly(false)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}>
              Reset Filter
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {apps.map((app) => (
                <Card key={app.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
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
                        <div className={`w-8 h-8 bg-primary-100 rounded flex items-center justify-center ${app.icon_url ? 'hidden' : ''}`}>
                          <span className="text-primary-600 font-bold text-sm">
                            {app.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          {app.name}
                          {app.is_popular && (
                            <Star className="h-4 w-4 text-yellow-500 ml-2 fill-current" />
                          )}
                        </h3>
                        <Badge variant="gray" className="text-xs">
                          {app.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {app.description}
                  </p>

                  {/* Price Information */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Harga per user:</span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {formatCurrency(app.price_per_user)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{app.total_members} anggota</span>
                      <span>Total: {formatCurrency(app.total_price)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleViewDetail(app)}
                      className="flex-1"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Detail
                    </Button>
                    <Button
                      onClick={() => handleJoinGroup(app)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Join Grup
                    </Button>
                  </div>

                  {app.website_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => window.open(app.website_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Kunjungi Website
                    </Button>
                  )}
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
