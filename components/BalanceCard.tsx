'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, History } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import TopUpModal from '@/components/TopUpModal'

interface BalanceCardProps {
  className?: string
}

export default function BalanceCard({ className = "" }: BalanceCardProps) {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [showTopUpModal, setShowTopUpModal] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleTopUp = () => {
    setShowTopUpModal(true)
  }


  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Saldo Anda
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleTopUp}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Top Up Saldo"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => router.push('/transactions')}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            title="Riwayat Transaksi"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {formatCurrency(user?.balance || 0)}
        </div>
      </div>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSuccess={() => {
          setShowTopUpModal(false)
          // Refresh balance after successful top-up
          refreshUser()
        }}
      />
    </Card>
  )
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            