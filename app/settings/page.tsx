'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  EyeOff
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

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

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('notifications')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const tabs = [
    { id: 'notifications', name: 'Notifikasi', icon: Bell },
    { id: 'security', name: 'Keamanan', icon: Shield },
    { id: 'privacy', name: 'Privasi', icon: User },
    { id: 'billing', name: 'Pembayaran', icon: CreditCard },
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600 mt-1">Kelola preferensi dan pengaturan akun Anda</p>
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
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pengaturan Notifikasi</h2>
                <form onSubmit={handleSubmitNotifications(handleSaveNotifications)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Terima notifikasi melalui email</p>
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
                        <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                        <p className="text-sm text-gray-500">Terima notifikasi push di browser</p>
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
                        <h3 className="text-sm font-medium text-gray-900">Payment Reminders</h3>
                        <p className="text-sm text-gray-500">Pengingat pembayaran subscription</p>
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
                        <h3 className="text-sm font-medium text-gray-900">Group Updates</h3>
                        <p className="text-sm text-gray-500">Update aktivitas grup</p>
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
                        <h3 className="text-sm font-medium text-gray-900">Marketing Emails</h3>
                        <p className="text-sm text-gray-500">Email promosi dan tips</p>
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
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Keamanan Akun</h2>
                <form onSubmit={handleSubmitSecurity(handleSaveSecurity)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">Tambahkan lapisan keamanan ekstra</p>
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
                        <h3 className="text-sm font-medium text-gray-900">Login Alerts</h3>
                        <p className="text-sm text-gray-500">Notifikasi saat ada login baru</p>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Ubah Password</h3>
                    <div className="space-y-4">
                      <Input
                        label="Password Lama"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password lama"
                      />
                      <Input
                        label="Password Baru"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password baru"
                      />
                      <Input
                        label="Konfirmasi Password Baru"
                        type={showPassword ? 'text' : 'password'}
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
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pengaturan Privasi</h2>
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
                        <h3 className="text-sm font-medium text-gray-900">Data Sharing</h3>
                        <p className="text-sm text-gray-500">Izinkan berbagi data untuk peningkatan layanan</p>
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
                        <h3 className="text-sm font-medium text-gray-900">Analytics</h3>
                        <p className="text-sm text-gray-500">Izinkan pengumpulan data analitik</p>
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

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pengaturan Pembayaran</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Metode Pembayaran</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">Bank Transfer</p>
                            <p className="text-sm text-gray-500">BCA, Mandiri, BNI</p>
                          </div>
                        </div>
                        <Badge variant="success">Aktif</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">E-Wallet</p>
                            <p className="text-sm text-gray-500">GoPay, OVO, DANA</p>
                          </div>
                        </div>
                        <Badge variant="success">Aktif</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Riwayat Pembayaran</h3>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/payments')}
                    >
                      Lihat Semua Pembayaran
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

