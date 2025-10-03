'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Mail, 
  Users, 
  BarChart3, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  MessageCircle,
  MessageSquare
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { adminAPI, chatAPI, broadcastAPI, userBroadcastAPI } from '@/lib/api'

interface AdminStats {
  totalUsers: number
  totalGroups: number
  totalSubmissions: number
  pendingSubmissions: number
  approvedSubmissions: number
  rejectedSubmissions: number
  totalRevenue: number
  totalChats: number
  unreadChats: number
  totalBroadcasts: number
  activeBroadcasts: number
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGroups: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    totalRevenue: 0,
    totalChats: 0,
    unreadChats: 0,
    totalBroadcasts: 0,
    activeBroadcasts: 0
  })
  const [loading, setLoading] = useState(true)

  // Redirect to homepage if not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // Fetch admin stats
  useEffect(() => {
    if (user?.is_admin) {
      fetchAdminStats()
    }
  }, [user?.id]) // Use user.id instead of user object to prevent re-renders

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [usersResponse, groupsResponse, submissionsResponse, chatsResponse, broadcastsResponse, userBroadcastsResponse] = await Promise.all([
        adminAPI.getUsers({ page: 1, page_size: 1 }), // Just get count
        adminAPI.getGroups({ page: 1, page_size: 1 }), // Just get count
        adminAPI.getEmailSubmissions({ page: 1, page_size: 1 }), // Just get count
        chatAPI.getAllChats(),
        broadcastAPI.getBroadcasts({ page: 1, page_size: 1 }), // Just get count
        userBroadcastAPI.getUserBroadcasts({ page: 1, page_size: 1 }) // Just get count
      ])
      
      const users = usersResponse.data.users || []
      const groups = groupsResponse.data.groups || []
      const submissions = submissionsResponse.data.submissions || []
      const chats = chatsResponse.data.chats || []
      const broadcasts = broadcastsResponse.data.data?.broadcasts || []
      const userBroadcasts = userBroadcastsResponse.data.data?.broadcasts || []
      
      // Count submissions by status
      const pendingSubmissions = submissions.filter((sub: any) => sub.status === 'pending').length
      const approvedSubmissions = submissions.filter((sub: any) => sub.status === 'approved').length
      const rejectedSubmissions = submissions.filter((sub: any) => sub.status === 'rejected').length
      
      // Count unread chats
      const unreadChats = chats.filter((chat: any) => !chat.is_read).length
      
      // Count broadcasts
      const totalBroadcasts = broadcasts.length + userBroadcasts.length
      const activeBroadcasts = broadcasts.filter((broadcast: any) => broadcast.is_active).length + 
                              userBroadcasts.filter((broadcast: any) => broadcast.status === 'sent').length
      
      setStats({
        totalUsers: users.length,
        totalGroups: groups.length,
        totalSubmissions: submissions.length,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        totalRevenue: 0, // No revenue system yet
        totalChats: chats.length,
        unreadChats,
        totalBroadcasts,
        activeBroadcasts
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalGroups: 0,
        totalSubmissions: 0,
        pendingSubmissions: 0,
        approvedSubmissions: 0,
        rejectedSubmissions: 0,
        totalRevenue: 0,
        totalChats: 0,
        unreadChats: 0,
        totalBroadcasts: 0,
        activeBroadcasts: 0
      })
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Kelola dan pantau aktivitas platform SALOME
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">System Online</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/email-submissions')}>
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Email Submissions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.pendingSubmissions}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pending Review</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Registered</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Groups</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalGroups}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active Groups</p>
                </div>
              </div>
            </Card>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/group-broadcast')}>
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Mail className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Broadcast</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.activeBroadcasts}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/chat')}>
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Chat</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalChats}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {loading ? '...' : (stats.unreadChats > 0 ? `${stats.unreadChats} unread` : 'All read')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/user-broadcast')}>
              <div className="flex items-center">
                <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">User Broadcast</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalBroadcasts}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Submissions Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Submissions</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/email-submissions')}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>View All</span>
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Pending</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.pendingSubmissions}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Approved</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.approvedSubmissions}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Rejected</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.rejectedSubmissions}
                </span>
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {loading ? '...' : stats.totalSubmissions}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Chat Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Overview</h3>
              <MessageCircle className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Chats</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.totalChats}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Unread Chats</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {loading ? '...' : stats.unreadChats}
                </span>
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Read Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {loading ? '...' : (stats.totalChats > 0 ? `${Math.round(((stats.totalChats - stats.unreadChats) / stats.totalChats) * 100)}%` : '0%')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  )
}
