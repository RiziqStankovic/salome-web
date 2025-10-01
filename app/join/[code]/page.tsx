'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  UserPlus, 
  Shield, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { groupAPI } from '@/lib/api'
import toast from 'react-hot-toast'

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
  group_status: string
  invite_code: string
  owner_id: string
  expires_at?: string
  created_at: string
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

export default function JoinGroupPage({ params }: { params: { code: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [availableGroups, setAvailableGroups] = useState<Group[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    if (user) {
      fetchGroupDetails()
    }
  }, [user, authLoading, router])

  const fetchGroupDetails = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await groupAPI.getGroupByInviteCode(params.code)
      if (response.data?.group) {
        setGroup(response.data.group)
      } else {
        setError('Data grup tidak valid')
      }
    } catch (error: any) {
      console.error('Error fetching group:', error)
      if (error.response?.status === 404) {
        setError('Grup tidak ditemukan atau kode undangan tidak valid')
        // Fetch available groups when specific group not found
        fetchAvailableGroups()
      } else if (error.response?.status === 500) {
        setError('Terjadi kesalahan server. Silakan coba lagi nanti.')
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
      } else {
        setError(error.response?.data?.error || 'Terjadi kesalahan saat memuat grup')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableGroups = async () => {
    try {
      setLoadingGroups(true)
      // Only fetch groups with the same app_id as the current group
      const appId = group?.app_id
      const response = await groupAPI.getPublicGroups({ 
        page: 1, 
        page_size: 10,
        app_id: appId 
      })
      // Filter out closed groups
      const filteredGroups = (response.data.groups || []).filter((group: Group) => group.group_status !== 'closed')
      setAvailableGroups(filteredGroups)
    } catch (error) {
      console.error('Error fetching available groups:', error)
      setAvailableGroups([])
    } finally {
      setLoadingGroups(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!user) {
      router.push('/?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    setJoining(true)
    try {
      await groupAPI.joinGroup(params.code)
      toast.success('Berhasil bergabung ke grup!')
      
      // Redirect to groups page to see the joined group
      router.push('/groups')
    } catch (error: any) {
      console.error('Error joining group:', error)
      if (error.response?.status === 404) {
        toast.error('Grup tidak ditemukan')
      } else if (error.response?.status === 409) {
        toast.error('Anda sudah menjadi anggota grup ini')
      } else if (error.response?.status === 400) {
        toast.error('Grup sudah penuh atau tidak dapat diakses')
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
      } else {
        toast.error(error.response?.data?.error || 'Gagal bergabung ke grup')
      }
    } finally {
      setJoining(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Memuat informasi grup...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center mb-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error.includes('tidak ditemukan') ? 'Grup Tidak Ditemukan' : 'Terjadi Kesalahan'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button
                onClick={fetchGroupDetails}
                disabled={loading}
                loading={loading}
                className="w-full"
              >
                {loading ? 'Memuat...' : 'Coba Lagi'}
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Kembali ke Beranda
              </Button>
            </div>
          </Card>

          {/* Available Groups */}
          {availableGroups.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Grup {group?.app?.name} Lainnya yang Tersedia
              </h2>
              {loadingGroups ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Memuat grup...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableGroups.map((availableGroup) => (
                    <Card key={availableGroup.id} className="p-4 hover:shadow-lg transition-shadow dark:bg-gray-700">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          {availableGroup.app?.icon_url ? (
                            <img 
                              src={availableGroup.app.icon_url} 
                              alt={availableGroup.app.name}
                              className="w-6 h-6"
                            />
                          ) : (
                            <span className="text-primary-600 font-bold text-sm">
                              {availableGroup.app?.name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {availableGroup.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {availableGroup.app?.name}
                          </p>
                        </div>
                        <Badge 
                          variant={availableGroup.group_status === 'open' ? 'success' : 'error'}
                          className="text-xs"
                        >
                          {availableGroup.group_status === 'open' ? 'Open' : 'Full'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Anggota:</span>
                          <span className="text-gray-900 dark:text-white">
                            {availableGroup.current_members}/{availableGroup.max_members}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Harga per user:</span>
                          <span className="font-semibold text-primary-600 dark:text-primary-400">
                            {formatCurrency(availableGroup.price_per_member)}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => router.push(`/join/${availableGroup.invite_code}`)}
                        disabled={availableGroup.group_status !== 'open' || availableGroup.current_members >= availableGroup.max_members}
                        size="sm"
                        className="w-full"
                      >
                        {availableGroup.group_status !== 'open' 
                          ? 'Grup Penuh' 
                          : availableGroup.current_members >= availableGroup.max_members 
                            ? 'Grup Penuh' 
                            : 'Join Grup'
                        }
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}

          {availableGroups.length === 0 && !loadingGroups && (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Tidak ada grup {group?.app?.name} yang tersedia
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Saat ini tidak ada grup {group?.app?.name} yang bisa diikuti. Coba buat grup baru untuk {group?.app?.name} atau kembali nanti.
              </p>
              <Button
                onClick={() => router.push('/groups/create')}
                className="mr-2"
              >
                Buat Grup {group?.app?.name} Baru
              </Button>
              <Button
                onClick={() => router.push('/groups')}
                variant="outline"
              >
                Lihat Semua Grup
              </Button>
            </Card>
          )}
        </div>
      </div>
    )
  }

  if (!group || !group.app) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Memuat informasi grup...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8 dark:bg-gray-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Undangan Bergabung Grup
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Anda diundang untuk bergabung dengan grup patungan subscription
            </p>
          </div>

          {/* Group Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  {group.app.icon_url ? (
                    <img src={group.app.icon_url} alt={group.app.name} className="w-8 h-8" />
                  ) : (
                    <span className="text-primary-600 font-bold text-lg">
                      {group.app.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {group.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {group.app.name} - {group.app.category}
                  </p>
                </div>
              </div>
              {group.description && (
                <p className="text-gray-600 dark:text-gray-300">
                  {group.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {group.current_members}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Anggota Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {group.max_members}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Maksimal Anggota</div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Informasi Harga</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Harga per Anggota</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {formatCurrency(group.price_per_member + group.admin_fee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Harga</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(group.total_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Biaya Admin</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(group.admin_fee)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 mb-4">
              <Badge 
                variant={group.group_status === 'open' ? 'success' : group.group_status === 'full' ? 'error' : 'primary'}
              >
                {group.group_status === 'open' ? 'Terbuka' : group.group_status === 'full' ? 'Penuh' : 'Aktif'}
              </Badge>
              <Badge variant="primary">
                Kode: {group.invite_code}
              </Badge>
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Dibuat oleh <span className="font-medium text-gray-900 dark:text-white">{group.owner?.full_name || 'Unknown'}</span> pada{' '}
              {formatDate(group.created_at)}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Keuntungan Bergabung
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <CreditCard className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Hemat Biaya</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Bayar hanya {formatCurrency(group.price_per_member + group.admin_fee)} per bulan
                </p>
              </div>
              <div className="text-center p-4">
                <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Aman & Terpercaya</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sistem keamanan terbaik untuk melindungi data Anda
                </p>
              </div>
              <div className="text-center p-4">
                <Users className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Komunitas</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Bergabung dengan komunitas yang memiliki minat sama
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {!user ? (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Anda perlu login untuk bergabung dengan grup ini
                </p>
                <Button
                  onClick={() => router.push('/?redirect=' + encodeURIComponent(window.location.pathname))}
                  className="w-full"
                >
                  Login untuk Bergabung
                </Button>
              </div>
            ) : group.group_status !== 'open' ? (
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {group.group_status === 'full' ? 'Maaf, grup ini sudah penuh' : 'Grup ini tidak dapat diakses'}
                </p>
                <Button
                  onClick={() => router.push('/groups')}
                  variant="outline"
                  className="w-full"
                >
                  Lihat Grup Lainnya
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleJoinGroup}
                  disabled={joining}
                  loading={joining}
                  className="w-full"
                  size="lg"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  {joining ? 'Bergabung...' : 'Bergabung ke Grup'}
                </Button>
                <Button
                  onClick={() => router.push('/groups')}
                  variant="outline"
                  className="w-full"
                >
                  Lihat Grup Saya
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dengan bergabung, Anda menyetujui{' '}
            <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:text-primary-700">
              Syarat & Ketentuan
            </a>{' '}
            dan{' '}
            <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:text-primary-700">
              Kebijakan Privasi
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
