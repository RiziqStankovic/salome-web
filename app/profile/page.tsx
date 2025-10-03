'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit3,
  Save,
  X,
  Camera,
  Bell,
  Key,
  CreditCard,
  Users,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { formatDate, generateAvatarUrl } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authAPI } from '@/lib/api'

interface ProfileForm {
  full_name: string
  email: string
  whatsapp_number?: string
  avatar_url?: string
}

interface UserStats {
  active_groups: number
  subscriptions: number
  total_savings: number
  balance: number
}

export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [emailEditMode, setEmailEditMode] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileForm>()

  // Redirect to homepage if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        email: user.email,
        whatsapp_number: user.whatsapp_number || '',
        avatar_url: user.avatar_url || ''
      })
    }
  }, [user, reset])

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true)
        const response = await authAPI.getStats()
        setStats(response.data.stats)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true)
    try {
      await updateProfile(data)
      toast.success('Profil berhasil diperbarui!')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui profil')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset({
      full_name: user?.full_name || '',
      email: user?.email || '',
      whatsapp_number: user?.whatsapp_number || '',
      avatar_url: user?.avatar_url || ''
    })
    setIsEditing(false)
  }

  const handleEmailChange = async () => {
    if (!newEmail) {
      toast.error('Masukkan email baru')
      return
    }

    setEmailLoading(true)
    try {
      await authAPI.changeEmail(newEmail)
      setOtpSent(true)
      toast.success('OTP telah dikirim ke email lama Anda')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mengirim OTP')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleVerifyEmailChange = async () => {
    if (!otpCode) {
      toast.error('Masukkan kode OTP')
      return
    }

    setEmailLoading(true)
    try {
      await authAPI.verifyEmailChange(otpCode)
      toast.success('Email berhasil diubah!')
      setEmailEditMode(false)
      setOtpSent(false)
      setNewEmail('')
      setOtpCode('')
      // Refresh user data
      window.location.reload()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal memverifikasi email')
    } finally {
      setEmailLoading(false)
    }
  }

  const cancelEmailEdit = () => {
    setEmailEditMode(false)
    setOtpSent(false)
    setNewEmail('')
    setOtpCode('')
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola informasi profil dan pengaturan akun</p>
          </div>
          <Button
            variant={isEditing ? 'outline' : 'primary'}
            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Batal
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profil
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary-600">
                        {user.full_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user.full_name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  <Badge variant="success" className="mt-1">
                    <Shield className="h-3 w-3 mr-1" />
                    Terverifikasi
                  </Badge>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap"
                    {...register('full_name', { required: 'Nama lengkap wajib diisi' })}
                    disabled={!isEditing}
                    error={!!errors.full_name}
                    errorText={errors.full_name?.message}
                  />
                  <Input
                    label="Email"
                    type="email"
                    {...register('email', { required: 'Email wajib diisi' })}
                    disabled={!isEditing}
                    error={!!errors.email}
                    errorText={errors.email?.message}
                  />
                </div>

                <Input
                  label="Nomor WhatsApp"
                  type="tel"
                  {...register('whatsapp_number')}
                  disabled={!isEditing}
                  placeholder="Contoh: 081234567890"
                />

                <Input
                  label="URL Avatar"
                  {...register('avatar_url')}
                  disabled={!isEditing}
                  placeholder="https://example.com/avatar.jpg"
                />

                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
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
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Perubahan
                    </Button>
                  </div>
                )}
              </form>
            </Card>

            {/* Account Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Akun</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Bergabung</span>
                  </div>
                  <span className="text-gray-900 dark:text-white">{formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Email</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900 dark:text-white">{user.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEmailEditMode(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Status Verifikasi</span>
                  </div>
                  <Badge variant="success">Terverifikasi</Badge>
                </div>
              </div>
            </Card>

            {/* Email Edit Modal */}
            {emailEditMode && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ubah Email</h3>
                <div className="space-y-4">
                  {!otpSent ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Baru
                        </label>
                        <Input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Masukkan email baru"
                          className="w-full"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleEmailChange}
                          disabled={emailLoading || !newEmail}
                          loading={emailLoading}
                          className="flex-1"
                        >
                          Kirim OTP
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEmailEdit}
                          disabled={emailLoading}
                        >
                          Batal
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                          <span className="text-sm text-blue-800 dark:text-blue-200">
                            OTP telah dikirim ke email lama Anda: {user.email}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Kode OTP
                        </label>
                        <Input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Masukkan kode OTP"
                          className="w-full"
                          maxLength={6}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleVerifyEmailChange}
                          disabled={emailLoading || !otpCode}
                          loading={emailLoading}
                          className="flex-1"
                        >
                          Verifikasi & Ubah Email
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEmailEdit}
                          disabled={emailLoading}
                        >
                          Batal
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistik</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-600 dark:text-gray-400">Grup Aktif</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {statsLoading ? '...' : stats?.active_groups || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-600 dark:text-gray-400">Subscription</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {statsLoading ? '...' : stats?.subscriptions || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-600 dark:text-gray-400">Total Hemat</span>
                  </div>
                  <span className="font-semibold text-success-600">
                    {statsLoading ? '...' : `Rp ${(stats?.total_savings || 0).toLocaleString('id-ID')}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-600 dark:text-gray-400">Saldo</span>
                  </div>
                  <span className="font-semibold text-primary-600">
                    {statsLoading ? '...' : `Rp ${(stats?.balance || 0).toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aksi Cepat</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/settings')}
                >
                  <Bell className="h-4 w-4 mr-3" />
                  Pengaturan Notifikasi
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/settings')}
                >
                  <Key className="h-4 w-4 mr-3" />
                  Keamanan Akun
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/settings')}
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Riwayat Pembayaran
                </Button>
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Akun</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-warning-600 hover:text-warning-700 hover:bg-warning-50"
                  onClick={() => router.push('/settings')}
                >
                  <Key className="h-4 w-4 mr-3" />
                  Ubah Password
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
