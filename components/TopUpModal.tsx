'use client'

import { useState } from 'react'
import { X, CreditCard, CheckCircle, AlertCircle, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import { paymentAPI } from '@/lib/api'

interface TopUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const TopUpModal = ({ isOpen, onClose, onSuccess }: TopUpModalProps) => {
  const [amount, setAmount] = useState<number>(0)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [paymentLink, setPaymentLink] = useState<string>('')
  const [step, setStep] = useState<'amount' | 'confirmation' | 'success'>('amount')

  const predefinedAmounts = [50000, 100000, 250000, 500000, 1000000]

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount)
    setCustomAmount('')
    setStep('confirmation')
  }

  const handleCustomAmount = () => {
    const custom = parseInt(customAmount)
    if (custom >= 10000) {
      setAmount(custom)
      setStep('confirmation')
    } else {
      toast.error('Minimum top-up adalah Rp 10.000')
    }
  }

  const handleCreateTopUp = async () => {
    setLoading(true)
    try {
      console.log('Creating top-up with amount:', amount)
      const response = await paymentAPI.createGroupPaymentLink({
        amount: amount,
        group_id: undefined, // Untuk top-up, group_id undefined
        description: `Top Up Saldo SALOME - Rp ${amount.toLocaleString('id-ID')}`
      })

      console.log('API Response:', response.data)

      if (response.data.success) {
        console.log('Payment link created:', response.data.payment_url)
        setPaymentLink(response.data.payment_url)
        
        // Langsung buka tab baru ke payment link
        try {
          const newWindow = window.open(response.data.payment_url, '_blank')
          if (!newWindow) {
            // Fallback if popup is blocked
            window.location.href = response.data.payment_url
          }
        } catch (error) {
          console.error('Error opening payment link:', error)
          // Fallback to direct navigation
          window.location.href = response.data.payment_url
        }
        
        setStep('success')
        toast.success('Payment link berhasil dibuat dan dibuka!')
        onSuccess?.()
      } else {
        console.error('API returned success: false', response.data)
        throw new Error(response.data.error || 'Gagal membuat payment link')
      }
    } catch (error: any) {
      console.error('Error creating top-up:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Gagal membuat payment link. Silakan coba lagi.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('amount')
    setAmount(0)
    setCustomAmount('')
    setPaymentLink('')
    onClose()
  }

  const handlePaymentClick = () => {
    if (paymentLink) {
      console.log('Opening payment link:', paymentLink)
      try {
        const newWindow = window.open(paymentLink, '_blank')
        if (!newWindow) {
          // Fallback if popup is blocked
          window.location.href = paymentLink
        }
      } catch (error) {
        console.error('Error opening payment link:', error)
        // Fallback to direct navigation
        window.location.href = paymentLink
      }
    } else {
      console.error('No payment link available')
      toast.error('Payment link tidak tersedia')
    }
  }

  const handleCopyLink = async () => {
    if (paymentLink) {
      try {
        await navigator.clipboard.writeText(paymentLink)
        toast.success('Link berhasil disalin!')
      } catch (error) {
        console.error('Error copying link:', error)
        toast.error('Gagal menyalin link')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Top Up Saldo
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Step 1: Amount Selection */}
          {step === 'amount' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Pilih Jumlah Top Up
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {predefinedAmounts.map((predefinedAmount) => (
                    <button
                      key={predefinedAmount}
                      onClick={() => handleAmountSelect(predefinedAmount)}
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Rp {predefinedAmount.toLocaleString('id-ID')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Atau masukkan jumlah custom
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Min. Rp 10.000"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <Button
                    onClick={handleCustomAmount}
                    disabled={!customAmount || parseInt(customAmount) < 10000}
                    className="px-4"
                  >
                    Pilih
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 'confirmation' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setStep('amount')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  ← Kembali
                </button>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Konfirmasi Top Up
                </h3>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Jumlah:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Rp {amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deskripsi:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Top Up Saldo SALOME
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateTopUp}
                loading={loading}
                className="w-full"
              >
                {loading ? 'Membuat Payment Link...' : 'Buat Payment Link'}
              </Button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Payment Link Berhasil Dibuat!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Halaman pembayaran sudah dibuka di tab baru. Jika tidak terbuka, klik tombol di bawah.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handlePaymentClick}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buka Pembayaran
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Salin Link
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="w-full"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopUpModal
