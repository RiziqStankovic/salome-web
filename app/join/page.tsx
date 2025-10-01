'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { 
  ArrowLeft, 
  Search, 
  Users, 
  Clock, 
  Shield, 
  CheckCircle, 
  ExternalLink,
  Play,
  Music,
  Video,
  Smartphone,
  Globe,
  CreditCard,
  Calendar,
  Info,
  AlertCircle,
  Zap,
  Heart,
  TrendingUp,
  DollarSign,
  Percent,
  Calculator,
  Filter,
  MapPin,
  Star,
  Lock,
  Unlock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { groupAPI, appAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/currency'

interface Group {
  id: string
  name?: string
  description?: string
  app_id: string
  app_name?: string
  app_category?: string
  app_icon_url?: string
  max_members: number
  current_members: number
  price_per_member: number
  total_price: number
  invite_code: string
  is_public: boolean
  created_at: string
  host_name?: string
  group_status: string
  host_rating?: number
  all_paid_at?: string
  app: {
    icon_url: string
    name: string
    category: string
  }
  owner?: {
    id: string
    full_name: string
  }
}

interface App {
  id: string
  name: string
  description: string
  category: string
  icon_url: string
  website_url: string
  total_members: number
  total_price: number
  is_popular: boolean
}

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [groups, setGroups] = useState<Group[]>([])
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_low' | 'price_high' | 'members'>('newest')
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([])

  const appId = searchParams.get('app')
  const filterAll = searchParams.get('filter') === 'all'

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (appId) {
      setSelectedApp(appId)
      fetchGroups(appId)
    } else {
      fetchGroups()
    }
  }, [appId])

  useEffect(() => {
    if (filterAll) {
      setSelectedApp('')
      setSearchQuery('')
      setShowFilters(true)
    }
  }, [filterAll])

  // Search and filter effect
  useEffect(() => {
    let filtered = groups

    // Filter out closed groups
    filtered = filtered.filter(group => group.group_status !== 'closed')

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(group => {
        const query = searchQuery.toLowerCase()
        return (group.name && group.name.toLowerCase().includes(query)) ||
               (group.description && group.description.toLowerCase().includes(query)) ||
               (group.app_name && group.app_name.toLowerCase().includes(query)) ||
               (group.app_category && group.app_category.toLowerCase().includes(query))
      })
    }

    // Apply app filter
    if (selectedApp) {
      filtered = filtered.filter(group => group.app_id === selectedApp)
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'price_low':
          return a.price_per_member - b.price_per_member
        case 'price_high':
          return b.price_per_member - a.price_per_member
        case 'members':
          return b.current_members - a.current_members
        default:
          return 0
      }
    })

    setFilteredGroups(filtered)
  }, [groups, searchQuery, selectedApp, sortBy])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [groupsResponse, appsResponse] = await Promise.all([
        groupAPI.getPublicGroups(),
        appAPI.getApps({ popular: true, page_size: 50 })
      ])
      
      setGroups(groupsResponse.data.groups || [])
      setApps(appsResponse.data.apps || [])
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
      setError(err.response?.data?.error || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async (appId?: string) => {
    try {
      setLoading(true)
      const response = await groupAPI.getPublicGroups({ app_id: appId })
      setGroups(response.data.groups || [])
    } catch (err: any) {
      console.error('Failed to fetch groups:', err)
      setError(err.response?.data?.error || 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleAppChange = (appId: string) => {
    setSelectedApp(appId)
    fetchGroups(appId)
  }

  const getCategoryIcon = (category: string) => {
    if (!category) return <Globe className="h-5 w-5" />
    
    switch (category.toLowerCase()) {
      case 'music':
        return <Music className="h-5 w-5" />
      case 'entertainment':
        return <Video className="h-5 w-5" />
      case 'productivity':
        return <Smartphone className="h-5 w-5" />
      case 'design':
        return <Zap className="h-5 w-5" />
      case 'communication':
        return <Users className="h-5 w-5" />
      case 'development':
        return <Globe className="h-5 w-5" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    if (!category) return 'from-gray-500 to-gray-600'
    
    switch (category.toLowerCase()) {
      case 'music':
        return 'from-green-500 to-green-600'
      case 'entertainment':
        return 'from-red-500 to-red-600'
      case 'productivity':
        return 'from-blue-500 to-blue-600'
      case 'design':
        return 'from-purple-500 to-purple-600'
      case 'communication':
        return 'from-indigo-500 to-indigo-600'
      case 'development':
        return 'from-orange-500 to-orange-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getGroupStatusInfo = (groupStatus: string) => {
    switch (groupStatus) {
      case 'open':
        return { text: 'Open', variant: 'success' as const, color: 'text-green-600' }
      case 'private':
        return { text: 'Private', variant: 'gray' as const, color: 'text-gray-600' }
      case 'full':
        return { text: 'Full', variant: 'warning' as const, color: 'text-yellow-600' }
      case 'paid_group':
        return { text: 'Active', variant: 'success' as const, color: 'text-green-600' }
      case 'closed':
        return { text: 'Closed', variant: 'gray' as const, color: 'text-gray-600' }
      default:
        return { text: 'Unknown', variant: 'gray' as const, color: 'text-gray-600' }
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Join Group</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Find and join groups to share subscriptions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6 border-0 shadow-xl">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search groups by name, description, or app..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* App Filter */}
              <div>
                <select
                  value={selectedApp}
                  onChange={(e) => handleAppChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Apps</option>
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="members">Most Members</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => setShowFilters(false)}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Results */}
        <div className="space-y-6">
          {error && (
            <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </Card>
          )}

          {filteredGroups.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No groups found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchQuery || selectedApp 
                  ? 'Try adjusting your search criteria or create a new group.'
                  : 'No public groups are available at the moment.'
                }
              </p>
              <Button
                onClick={() => router.push('/groups/create')}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          {group.app?.icon_url ? (
                            <img 
                              src={group.app.icon_url} 
                              alt={group.app.name || 'App'}
                              className="w-8 h-8 rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-8 h-8 bg-gradient-to-r ${getCategoryColor(group.app?.category || group.app_category || '')} rounded-lg flex items-center justify-center text-white ${group.app?.icon_url ? 'hidden' : ''}`}>
                            {getCategoryIcon(group.app?.category || group.app_category || '')}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {group.name || 'Unnamed Group'}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{group.app?.name || group.app_name || 'Unknown App'}</p>
                        </div>
                      </div>
                      <Badge
                        variant={getGroupStatusInfo(group.group_status).variant}
                        className="flex items-center"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {getGroupStatusInfo(group.group_status).text}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                      {group.description || 'No description available'}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          {group.current_members}/{group.max_members}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Members</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(group.price_per_member)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Per Month</div>
                      </div>
                    </div>

                    {/* Subscription Status */}
                    {group.group_status === 'paid_group' && group.all_paid_at && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            Subscription Active
                          </span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                          Started on {new Date(group.all_paid_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Host Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {group.owner?.full_name || group.host_name || 'Unknown Host'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Host
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(group.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => router.push(`/join/${group.invite_code}`)}
                        disabled={group.current_members >= group.max_members}
                        className={`w-full ${
                          group.current_members >= group.max_members 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-primary-600 hover:bg-primary-700'
                        } text-white`}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {group.current_members >= group.max_members ? 'Group Full' : 'Join Group'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/app/${group.app_id}`)}
                        className="w-full border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Detail
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredGroups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <Card className="p-4 border-0 shadow-xl">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-primary-600 text-white border-primary-600">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}