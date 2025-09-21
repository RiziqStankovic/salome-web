'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { 
  Plus, 
  Search, 
  CreditCard, 
  Users,
  DollarSign,
  Calendar,
  Settings,
  Trash2,
  Eye,
  Share2,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { subscriptionAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Subscription {
  id: string
  group_id: string
  service_name: string
  service_url?: string
  plan_name: string
  price_per_month: number
  currency: string
  status: string
  next_billing_date?: string
  created_at: string
  group: {
    name: string
    member_count: number
  }
  shares: Array<{
    user_id: string
    share_percentage: number
    amount: number
    user: {
      full_name: string
      email: string
    }
  }>
}

export default function SubscriptionsPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string>('')

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      // TODO: Implement getUserSubscriptions in API or fetch from all groups
      // For now, using empty array as placeholder
      setSubscriptions([])
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      toast.error('Gagal memuat daftar subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus subscription ini?')) return

    try {
      await subscriptionAPI.deleteSubscription(subscriptionId)
      toast.success('Subscription berhasil dihapus')
      fetchSubscriptions()
    } catch (error) {
      toast.error('Gagal menghapus subscription')
    }
  }

  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.group.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalMonthlyCost = subscriptions.reduce((sum, sub) => sum + sub.price_per_month, 0)
  const totalSavings = subscriptions.reduce((sum, sub) => {
    const individualCost = sub.price_per_month * sub.group.member_count
    return sum + (individualCost - sub.price_per_month)
  }, 0)

  if (loading) {
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
            <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
            <p className="text-gray-600 mt-1">Kelola subscription patungan Anda</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah Subscription
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subscription</p>
                <p className="text-3xl font-bold text-gray-900">{subscriptions.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Biaya Bulanan</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(totalMonthlyCost)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Penghematan</p>
                <p className="text-3xl font-bold text-success-600">
                  {formatCurrency(totalSavings)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Cari subscription..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Subscriptions Grid */}
        {filteredSubscriptions.length === 0 ? (
          <Card className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Subscription tidak ditemukan' : 'Belum ada subscription'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Coba gunakan kata kunci yang berbeda' 
                : 'Tambahkan subscription pertama Anda untuk mulai patungan'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Tambah Subscription Pertama
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((subscription) => (
              <Card key={subscription.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {subscription.service_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {subscription.plan_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Grup: {subscription.group.name}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/subscriptions/${subscription.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubscription(subscription.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Biaya Bulanan</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(subscription.price_per_month, subscription.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <Badge 
                      variant={subscription.status === 'active' ? 'success' : 'warning'}
                    >
                      {subscription.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pembagian</span>
                    <span className="text-gray-900">
                      {subscription.shares.length} anggota
                    </span>
                  </div>

                  {subscription.next_billing_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tagihan Berikutnya</span>
                      <span className="text-gray-900">
                        {formatDate(subscription.next_billing_date)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex space-x-3">
                  <Button
                    onClick={() => router.push(`/subscriptions/${subscription.id}`)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Detail
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Subscription Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Tambah Subscription"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="label mb-2 block">Pilih Grup</label>
              <select className="input">
                <option value="">Pilih grup untuk subscription ini</option>
                {/* This would be populated with user's groups */}
              </select>
            </div>

            <div>
              <Input
                label="Nama Layanan"
                placeholder="Contoh: Netflix, Spotify, Adobe Creative Cloud"
              />
            </div>

            <div>
              <Input
                label="URL Layanan"
                placeholder="https://netflix.com"
                type="url"
              />
            </div>

            <div>
              <Input
                label="Nama Paket"
                placeholder="Contoh: Premium, Family Plan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Harga per Bulan"
                  type="number"
                  placeholder="150000"
                />
              </div>
              <div>
                <label className="label mb-2 block">Mata Uang</label>
                <select className="input">
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={() => {
                  // Handle create subscription
                  setShowCreateModal(false)
                }}
                className="flex-1"
              >
                Tambah Subscription
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
