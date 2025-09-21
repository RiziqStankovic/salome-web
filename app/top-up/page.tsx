'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { transactionAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/DashboardLayout'
import toast from 'react-hot-toast'

const paymentMethods = [
  {
    id: 'credit_card',
    name: 'Credit Card',
    icon: <CreditCard className="h-6 w-6" />,
    description: 'Visa, Mastercard, JCB'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: <Banknote className="h-6 w-6" />,
    description: 'BCA, Mandiri, BNI, BRI'
  },
  {
    id: 'e_wallet',
    name: 'E-Wallet',
    icon: <Smartphone className="h-6 w-6" />,
    description: 'GoPay, OVO, DANA, LinkAja'
  }
]

const topUpAmounts = [
  { amount: 50000, label: 'Rp 50.000' },
  { amount: 100000, label: 'Rp 100.000' },
  { amount: 250000, label: 'Rp 250.000' },
  { amount: 500000, label: 'Rp 500.000' },
  { amount: 1000000, label: 'Rp 1.000.000' }
]

export default function TopUpPage() {
  const router = useRouter()
  const [amount, setAmount] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: amount, 2: method, 3: confirmation

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount)
    setCustomAmount('')
  }

  const handleCustomAmount = (value: string) => {
    const numValue = parseInt(value.replace(/\D/g, ''))
    if (!isNaN(numValue)) {
      setAmount(numValue)
      setCustomAmount(value)
    } else {
      setAmount(0)
      setCustomAmount('')
    }
  }

  const handleNext = () => {
    if (step === 1 && amount >= 10000) {
      setStep(2)
    } else if (step === 2 && selectedMethod) {
      setStep(3)
    }
  }

  const handleTopUp = async () => {
    if (amount < 10000) {
      toast.error('Minimum top up adalah Rp 10.000')
      return
    }

    if (!selectedMethod) {
      toast.error('Pilih metode pembayaran')
      return
    }

    try {
      setLoading(true)
      const response = await transactionAPI.topUpBalance({
        amount,
        method: selectedMethod,
        reference: `TOPUP_${Date.now()}`
      })
      
      toast.success('Top up berhasil!')
      router.push('/transactions')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal melakukan top up')
    } finally {
      setLoading(false)
    }
  }

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod)

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Top Up Saldo</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Tambahkan saldo untuk bergabung dengan grup patungan</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Amount Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Pilih Jumlah Top Up
              </h2>
              
              {/* Quick Amount Selection */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {topUpAmounts.map((item) => (
                  <Button
                    key={item.amount}
                    variant={amount === item.amount ? 'primary' : 'outline'}
                    onClick={() => handleAmountSelect(item.amount)}
                    className="h-16"
                  >
                    {item.label}
                  </Button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Atau masukkan jumlah custom
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    Rp
                  </span>
                  <Input
                    type="text"
                    placeholder="Masukkan jumlah"
                    value={customAmount}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Minimum top up: Rp 10.000
                </p>
              </div>

              {amount > 0 && (
                <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Jumlah yang akan di-top up:</span>
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleNext}
                  disabled={amount < 10000}
                >
                  Lanjutkan
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Pilih Metode Pembayaran
              </h2>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-600 dark:text-gray-400">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {method.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {method.description}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedMethod === method.id
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedMethod === method.id && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!selectedMethod}
                >
                  Lanjutkan
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Konfirmasi Top Up
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Jumlah Top Up:</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(amount)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Metode Pembayaran:</span>
                  <div className="flex items-center space-x-2">
                    {selectedMethodData?.icon}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedMethodData?.name}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-medium mb-1">Perhatian:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Pastikan Anda memiliki saldo yang cukup di metode pembayaran yang dipilih</li>
                        <li>Transaksi akan diproses secara real-time</li>
                        <li>Saldo akan langsung ditambahkan ke akun Anda setelah pembayaran berhasil</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleTopUp}
                  disabled={loading}
                  loading={loading}
                >
                  {loading ? 'Memproses...' : 'Konfirmasi Top Up'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
