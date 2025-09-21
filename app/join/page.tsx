'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Navbar from '@/components/Navbar'
import { 
  Users, 
  UserPlus, 
  Shield, 
  CreditCard,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { groupAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface Group {
  id: string
  name: string
  description?: string
  app_id: string
  max_members: number
  current_members: number
  price_per_member: number
  admin_fee: number
  total_price: number
  status: string
  invite_code: string
  owner_id: string
  expires_at?: string
  created_at: string
  is_popular?: boolean
  app: {
    id: string
    name: string
    description: string
    category: string
    icon_url: string
  }
  owner: {
    full_name: string
    email: string
  }
}

export default function JoinGroupPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appId, setAppId] = useState<string | null>(null)
  const [appName, setAppName] = useState<string>('')
  const [joiningGroup, setJoiningGroup] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    const app = searchParams.get('app')
    if (app) {
      setAppId(app)
      fetchGroupsByApp(app)
    } else {
      setError('Parameter app tidak ditemukan')
      setLoading(false)
    }
  }, [authLoading, searchParams, router])

  const fetchGroupsByApp = async (appId: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await groupAPI.getPublicGroups({ 
        page: 1, 
        page_size: 1000,
        app_id: appId 
      })
      
      if (response.data.groups) {
        setGroups(response.data.groups)
        // Set app name from first group if available
        if (response.data.groups.length > 0 && response.data.groups[0].app) {
          setAppName(response.data.groups[0].app.name)
        }
      } else {
        setGroups([])
      }
    } catch (error: any) {
      console.error('Error fetching groups:', error)
      setError('Gagal memuat grup. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (inviteCode: string) => {
    // Check if user is logged in
    if (!user) {
      toast.error('Silakan daftar atau login terlebih dahulu untuk bergabung dengan grup')
      router.push('/?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    try {
      setJoiningGroup(inviteCode)
      await groupAPI.joinGroup(inviteCode)
      toast.success('Berhasil bergabung dengan grup!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error joining group:', error)
      if (error.response?.status === 401) {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
        router.push('/?redirect=' + encodeURIComponent(window.location.pathname))
      } else if (error.response?.status === 404) {
        toast.error('Grup tidak ditemukan atau sudah penuh')
      } else if (error.response?.status === 400) {
        toast.error('Anda sudah bergabung dengan grup ini')
      } else {
        toast.error(error.response?.data?.error || 'Gagal bergabung dengan grup')
      }
    } finally {
      setJoiningGroup(null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Memuat...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <Navbar showAuth={false} showUserMenu={true} />

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Bergabung dengan Grup
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
            {appName ? `Pilih grup ${appName} yang ingin Anda ikuti` : 'Pilih grup yang ingin Anda ikuti dan mulai berhemat bersama teman-teman'}
          </p>
          {!user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                Silakan daftar atau login untuk bergabung dengan grup
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                    Terjadi Kesalahan
                  </h3>
                  <p className="text-red-600 dark:text-red-300">{error}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Memuat grup...</p>
          </motion.div>
        )}

        {/* Groups List */}
        {!loading && !error && (
          <div className="space-y-6">
            {groups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Tidak Ada Grup Tersedia
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  Belum ada grup yang tersedia untuk aplikasi ini. Coba buat grup baru dan ajak teman-teman bergabung!
                </p>
                <Button 
                  onClick={() => router.push('/groups/create')}
                  size="lg"
                  className="px-8"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Buat Grup Baru
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {groups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.08,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.03,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    className="group"
                  >
                    <Card className="p-6 hover:shadow-xl transition-all duration-300 dark:bg-gray-800 border-0 shadow-lg group-hover:shadow-2xl">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <motion.div 
                            whileHover={{ 
                              rotate: 8,
                              scale: 1.1,
                              transition: { duration: 0.3, ease: "easeOut" }
                            }}
                            className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-md"
                          >
                            {group.app.icon_url ? (
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
                            <div className={`w-8 h-8 bg-primary-100 rounded flex items-center justify-center ${group.app.icon_url ? 'hidden' : ''}`}>
                              <span className="text-primary-600 font-bold text-lg">
                                {group.app.name.charAt(0)}
                              </span>
                            </div>
                          </motion.div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                              {group.name}
                              {group.is_popular && (
                                <Star className="h-4 w-4 text-yellow-500 ml-2 fill-current" />
                              )}
                            </h3>
                            <Badge variant="gray" className="text-xs">
                              {group.app.name}
                            </Badge>
                          </div>
                        </div>
                        <Badge 
                          variant={group.status === 'open' ? 'success' : 'warning'}
                          className="text-xs"
                        >
                          {group.status === 'open' ? 'Terbuka' : 'Penuh'}
                        </Badge>
                      </div>

                      {group.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {group.description}
                        </p>
                      )}

                      {/* Group Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Users className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {group.current_members}/{group.max_members}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Anggota</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <CreditCard className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(group.total_price)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total Aplikasi</p>
                        </div>
                      </div>

                      {/* Price Breakdown */}
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

                      {/* Owner Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>Dibuat oleh: {group.owner?.full_name || 'Please login to see'}</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(group.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>

                      {/* Join Button */}
                      <Button
                        onClick={() => handleJoinGroup(group.invite_code)}
                        disabled={group.status !== 'open' || joiningGroup === group.invite_code}
                        loading={joiningGroup === group.invite_code}
                        className="w-full group-hover:shadow-lg transition-all duration-300"
                        size="lg"
                      >
                        {joiningGroup === group.invite_code ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Bergabung...
                          </>
                        ) : !user ? (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Daftar untuk Bergabung
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Bergabung dengan Grup
                          </>
                        )}
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}