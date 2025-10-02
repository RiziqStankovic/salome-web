'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Bell, 
  Shield, 
  CreditCard, 
  User,
  Key,
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  Save,
  Eye,
  EyeOff,
  Settings,
  Plus,
  Edit,
  CheckCircle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { accountCredentialsAPI, appAPI, authAPI, otpAPI } from '@/lib/api'
import AppIcon from '@/components/AppIcon'

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  payment_reminders: boolean
  group_updates: boolean
  marketing_emails: boolean
}

interface SecuritySettings {
  two_factor_auth: boolean
  login_alerts: boolean
  session_timeout: number
}

interface PrivacySettings {
  profile_visibility: string
  data_sharing: boolean
  analytics: boolean
}

interface AccountCredentials {
  id: string
  user_id: string
  app_id: string
  username?: string
  email?: string
  created_at: string
  updated_at: string
  app?: {
    name: string
    icon_url?: string
    description?: string
  }
}

interface App {
  id: string
  name: string
  icon_url?: string
  description?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('notifications')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Account credentials state
  const [accountCredentials, setAccountCredentials] = useState<AccountCredentials[]>([])
  const [apps, setApps] = useState<App[]>([])
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AccountCredentials | null>(null)
  
  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
    otpCode: ''
  })
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const { register: registerNotifications, handleSubmit: handleSubmitNotifications } = useForm<NotificationSettings>({
    defaultValues: {
      email_notifications: true,
      push_notifications: true,
      payment_reminders: true,
      group_updates: true,
      marketing_emails: false
    }
  })

  const { register: registerSecurity, handleSubmit: handleSubmitSecurity } = useForm<SecuritySettings>({
    defaultValues: {
      two_factor_auth: false,
      login_alerts: true,
      session_timeout: 24
    }
  })

  const { register: registerPrivacy, handleSubmit: handleSubmitPrivacy } = useForm<PrivacySettings>({
    defaultValues: {
      profile_visibility: 'private',
      data_sharing: false,
      analytics: true
    }
  })

  // Redirect to homepage if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Handle tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['notifications', 'security', 'privacy', 'account-apps'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Fetch account credentials and apps
  useEffect(() => {
    if (user) {
      fetchAccountCredentials()
      fetchApps()
    }
  }, [user?.id]) // Use user.id instead of user object to prevent re-renders

  const fetchAccountCredentials = async () => {
    try {
      const response = await accountCredentialsAPI.getUserAccountCredentials()
      setAccountCredentials(response.data.data || [])
    } catch (error) {
      console.error('Error fetching account credentials:', error)
    }
  }

  const fetchApps = async () => {
    try {
      const response = await appAPI.getApps({ page: 1, page_size: 100 })
      setApps(response.data.apps || [])
    } catch (error) {
      console.error('Error fetching apps:', error)
    }
  }

  const handleEditAccount = (account: AccountCredentials) => {
    setEditingAccount(account)
    setShowAddAccountModal(true)
  }


  const handleSaveAccount = async (data: {
    app_id: string
    username?: string
    email?: string
  }) => {
    setLoading(true)
    try {
      await accountCredentialsAPI.createOrUpdateAccountCredentials(data)
      toast.success(editingAccount ? 'Account berhasil diupdate' : 'Account berhasil ditambahkan')
      setShowAddAccountModal(false)
      setEditingAccount(null)
      fetchAccountCredentials()
    } catch (error) {
      toast.error('Gagal menyimpan account')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'notifications', name: 'Notifikasi', icon: Bell },
    { id: 'security', name: 'Keamanan', icon: Shield },
    { id: 'privacy', name: 'Privasi', icon: User },
    { id: 'account-apps', name: 'Account Aplikasi', icon: Settings },
  ]

  const handleSaveNotifications = async (data: NotificationSettings) => {
    setLoading(true)
    try {
      // Save notification settings
      console.log('Saving notifications:', data)
      toast.success('Pengaturan notifikasi berhasil disimpan!')
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan notifikasi')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSecurity = async (data: SecuritySettings) => {
    setLoading(true)
    try {
      // Save security settings
      console.log('Saving security:', data)
      toast.success('Pengaturan keamanan berhasil disimpan!')
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan keamanan')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrivacy = async (data: PrivacySettings) => {
    setLoading(true)
    try {
      // Save privacy settings
      console.log('Saving privacy:', data)
      toast.success('Pengaturan privasi berhasil disimpan!')
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan privasi')
    } finally {
      setLoading(false)
    }
  }

  // Send OTP for password change
  const sendOTPForPasswordChange = async () => {
    if (!user?.email) {
      toast.error('Email tidak ditemukan')
      return
    }

    setOtpLoading(true)
    try {
      await otpAPI.generate(user.email, 'password_reset')
      setOtpSent(true)
      toast.success('OTP berhasil dikirim ke email Anda!')
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error('Anda hanya bisa mengubah password maksimal 2 kali dalam sebulan')
      } else {
        toast.error(error.response?.data?.message || 'Gagal mengirim OTP')
      }
    } finally {
      setOtpLoading(false)
    }
  }

  // Change password with OTP
  const handleChangePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword || !passwordForm.otpCode) {
      toast.error('Semua field harus diisi')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak sama')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    setPasswordLoading(true)
    try {
      await authAPI.changePassword(passwordForm.newPassword, passwordForm.otpCode)
      toast.success('Password berhasil diubah!')
      
      // Reset form
      setPasswordForm({
        newPassword: '',
        confirmPassword: '',
        otpCode: ''
      })
      setOtpSent(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password')
    } finally {
      setPasswordLoading(false)
    }
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

  // Show message if not logged in (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Mengarahkan ke halaman login...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Kelola preferensi dan pengaturan akun Anda</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Pengaturan Notifikasi</h2>
                <form onSubmit={handleSubmitNotifications(handleSaveNotifications)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Terima notifikasi melalui email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...registerNotifications('email_notifications')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Terima notifikasi push di browser</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...registerNotifications('push_notifications')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Payment Reminders</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pengingat pembayaran subscription</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...registerNotifications('payment_reminders')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Group Updates</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Update aktivitas grup</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...registerNotifications('group_updates')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Marketing Emails</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email promosi dan tips</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...registerNotifications('marketing_emails')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      loading={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Pengaturan
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Keamanan Akun</h2>
                <form onSubmit={handleSubmitSecurity(handleSaveSecurity)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tambahkan lapisan keamanan ekstra</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="warning">Belum Aktif</Badge>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerSecurity('two_factor_auth')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Login Alerts</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat ada login baru</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...registerSecurity('login_alerts')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="label mb-2 block">Session Timeout (jam)</label>
                      <Input
                        type="number"
                        min="1"
                        max="168"
                        {...registerSecurity('session_timeout')}
                        className="w-32"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ubah Password</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Verifikasi dengan OTP
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                          Untuk keamanan, ubah password memerlukan verifikasi OTP yang dikirim ke email Anda.
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2 mb-3">
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            ⚠️ <strong>Batasan:</strong> Anda hanya bisa mengubah password maksimal 2 kali dalam sebulan
                          </p>
                        </div>
                        {!otpSent ? (
                          <Button
                            type="button"
                            onClick={sendOTPForPasswordChange}
                            disabled={otpLoading}
                            loading={otpLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Kirim OTP ke Email
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">OTP telah dikirim ke {user?.email}</span>
                            </div>
                            <Input
                              label="Kode OTP"
                              value={passwordForm.otpCode}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, otpCode: e.target.value }))}
                              placeholder="Masukkan 6 digit kode OTP"
                              maxLength={6}
                            />
                          </div>
                        )}
                      </div>

                      {otpSent && (
                        <>
                          <Input
                            label="Password Baru"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="Masukkan password baru"
                          />
                          <Input
                            label="Konfirmasi Password Baru"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Konfirmasi password baru"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showPassword ? 'Sembunyikan' : 'Tampilkan'} Password
                          </Button>
                          
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              onClick={handleChangePassword}
                              disabled={passwordLoading}
                              loading={passwordLoading}
                              className="flex-1"
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Ubah Password
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setOtpSent(false)
                                setPasswordForm({
                                  newPassword: '',
                                  confirmPassword: '',
                                  otpCode: ''
                                })
                              }}
                            >
                              Batal
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      loading={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Pengaturan
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Pengaturan Privasi</h2>
                <form onSubmit={handleSubmitPrivacy(handleSavePrivacy)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="label mb-2 block">Visibilitas Profil</label>
                      <select {...registerPrivacy('profile_visibility')} className="input">
                        <option value="public">Publik</option>
                        <option value="private">Privat</option>
                        <option value="friends">Teman Saja</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Data Sharing</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Izinkan berbagi data untuk peningkatan layanan</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...registerPrivacy('data_sharing')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Analytics</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Izinkan pengumpulan data analitik</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...registerPrivacy('analytics')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      loading={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Pengaturan
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Account Apps Tab */}
            {activeTab === 'account-apps' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Aplikasi</h2>
                  <Button
                    onClick={() => setShowAddAccountModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Account</span>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {accountCredentials.length === 0 ? (
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Belum ada account aplikasi
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Tambahkan account aplikasi untuk grup patungan Anda
                      </p>
                       <Button
                         onClick={() => setShowAddAccountModal(true)}
                         className="flex items-center space-x-2"
                       >
                         <Plus className="h-4 w-4" />
                         <span>Tambah Account Pertama</span>
                       </Button>
                    </div>
                  ) : (
                     accountCredentials.map((cred) => (
                       <div key={cred.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                         <div className="flex items-center space-x-3">
                           <AppIcon 
                             iconUrl={cred.app?.icon_url}
                             name={cred.app?.name || 'Unknown App'}
                             size="lg"
                             className="w-12 h-12 rounded-lg"
                           />
                           <div>
                             <p className="font-medium text-gray-900 dark:text-white">{cred.app?.name || 'Unknown App'}</p>
                             <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                               {cred.email && <p>Email: {cred.email}</p>}
                               {cred.username && <p>Username: {cred.username}</p>}
                             </div>
                           </div>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleEditAccount(cred)}
                             className="flex items-center space-x-1"
                           >
                             <Edit className="h-4 w-4" />
                             <span>Edit</span>
                           </Button>
                         </div>
                       </div>
                     ))
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-lg w-full mx-4 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingAccount ? 'Edit Account' : 'Tambah Account Aplikasi'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const appId = formData.get('app_id') as string
              const username = formData.get('username') as string
              const email = formData.get('email') as string
              
              handleSaveAccount({
                app_id: appId,
                username: username || undefined,
                email: email || undefined
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pilih Aplikasi
                  </label>
                   <select
                     name="app_id"
                     required
                     defaultValue={editingAccount?.app_id || ''}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                   >
                     <option value="">Pilih aplikasi...</option>
                     {apps.map((app) => (
                       <option key={app.id} value={app.id}>
                         {app.name}
                       </option>
                     ))}
                   </select>
                   {editingAccount?.app && (
                     <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                       <div className="flex items-center space-x-2">
                         <AppIcon 
                           iconUrl={editingAccount.app.icon_url}
                           name={editingAccount.app.name}
                           size="sm"
                         />
                         <span className="text-sm text-gray-600 dark:text-gray-300">
                           Aplikasi yang dipilih: {editingAccount.app.name}
                         </span>
                       </div>
                     </div>
                   )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username (Opsional)
                  </label>
                  <Input
                    name="username"
                    type="text"
                    defaultValue={editingAccount?.username || ''}
                    placeholder="Masukkan username untuk aplikasi"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email (Opsional)
                  </label>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={editingAccount?.email || ''}
                    placeholder="Masukkan email untuk aplikasi"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddAccountModal(false)
                    setEditingAccount(null)
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : (editingAccount ? 'Update' : 'Simpan')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}

