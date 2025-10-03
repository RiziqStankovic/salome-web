'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Mail, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle,
  Users,
  Calendar,
  FileText
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface EmailSubmission {
  id: string
  user_id: string
  group_id: string
  app_id: string
  email: string
  username?: string
  full_name: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  notes?: string
  user: {
    id: string
    full_name: string
    email: string
  }
  group: {
    id: string
    name: string
    app_id: string
  }
  app: {
    id: string
    name: string
    icon_url?: string
  }
}

interface EmailSubmissionStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function AdminEmailSubmissionsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [submissions, setSubmissions] = useState<EmailSubmission[]>([])
  const [stats, setStats] = useState<EmailSubmissionStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<EmailSubmission | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Redirect to homepage if not admin
  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // Fetch email submissions when user is loaded or filters change
  useEffect(() => {
    if (user?.is_admin) {
      // Use debounce for filter changes
      const timeoutId = setTimeout(() => {
        fetchEmailSubmissions()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [user?.id, statusFilter, searchTerm])

  const fetchEmailSubmissions = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getEmailSubmissions({
        page: 1,
        page_size: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined
      })
      
      setSubmissions(response.data.data.submissions)
      setStats(response.data.data.stats)
    } catch (error) {
      console.error('Error fetching email submissions:', error)
      toast.error('Gagal memuat data pengajuan email')
      
      // Fallback to empty data
      setSubmissions([])
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = (submissions || []).filter(submission => {
    const matchesSearch = 
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.app.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (submissionId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await adminAPI.updateEmailSubmissionStatus(submissionId, { status: newStatus })
      
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? { 
              ...sub, 
              status: newStatus, 
              reviewed_at: new Date().toISOString(),
              reviewed_by: user?.id || 'admin'
            }
          : sub
      ))
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        [newStatus === 'approved' ? 'approved' : 'rejected']: prev[newStatus === 'approved' ? 'approved' : 'rejected'] + 1
      }))
      
      toast.success(`Pengajuan ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Gagal mengupdate status')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" className="flex items-center space-x-1"><Clock className="h-3 w-3" />Pending</Badge>
      case 'approved':
        return <Badge variant="success" className="flex items-center space-x-1"><CheckCircle className="h-3 w-3" />Approved</Badge>
      case 'rejected':
        return <Badge variant="error" className="flex items-center space-x-1"><XCircle className="h-3 w-3" />Rejected</Badge>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Submissions</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Kelola pengajuan email untuk patungan aplikasi
            </p>
          </div>
          <Button
            onClick={() => {/* TODO: Implement export */}}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>
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
                  placeholder="Cari email, nama, grup, atau aplikasi..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Submissions List */}
        <Card className="p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Memuat data...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Tidak ada pengajuan email
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Belum ada pengajuan email untuk ditinjau
                </p>
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        {submission.app.icon_url ? (
                          <img 
                            src={submission.app.icon_url} 
                            alt={submission.app.name}
                            className="w-8 h-8 rounded"
                          />
                        ) : (
                          <span className="text-lg font-bold text-primary-600">
                            {submission.app.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {submission.email}
                          </h3>
                          {getStatusBadge(submission.status)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                          <p>User: {submission.full_name} ({submission.user.email})</p>
                          <p>Grup: {submission.group.name}</p>
                          <p>Aplikasi: {submission.app.name}</p>
                          {submission.username && <p>Username: {submission.username}</p>}
                          <p>Diajukan: {formatDate(submission.submitted_at)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setShowDetailModal(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {submission.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(submission.id, 'approved')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(submission.id, 'rejected')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
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
      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl w-full mx-4 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detail Pengajuan Email
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
                    Email yang Diajukan
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">
                    {selectedSubmission.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Lengkap
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSubmission.full_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSubmission.username || '-'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Grup
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSubmission.group.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Aplikasi
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSubmission.app.name}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tanggal Pengajuan
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(selectedSubmission.submitted_at)}
                </p>
              </div>
              
              {selectedSubmission.reviewed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal Review
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedSubmission.reviewed_at)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </Button>
              {selectedSubmission.status === 'pending' && (
                <>
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedSubmission.id, 'approved')
                      setShowDetailModal(false)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Setujui
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedSubmission.id, 'rejected')
                      setShowDetailModal(false)
                    }}
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Tolak
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
