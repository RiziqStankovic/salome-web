'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  ArrowLeft, 
  Star, 
  Users, 
  Clock, 
  Shield, 
  CheckCircle, 
  ExternalLink,
  Play,
  Pause,
  Download,
  Music,
  Video,
  Smartphone,
  Globe,
  CreditCard,
  Calendar,
  Info,
  AlertCircle,
  Zap,
  Heart,
  TrendingUp,
  DollarSign,
  Percent,
  Calculator,
  Search
} from 'lucide-react'
import { motion } from 'framer-motion'
import { appAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/currency'

interface AppDetail {
  app: {
    id: string
    name: string
    description: string
    category: string
    icon_url: string
    website_url: string
    total_members: number
    total_price: number
    is_popular: boolean
    is_active: boolean
    is_available: boolean
    max_group_members: number
    base_price: number
    admin_fee_percentage: number
    how_it_works?: string
  }
  price_per_user: number
}

export default function AppDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [appDetail, setAppDetail] = useState<AppDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchAppDetail()
    }
  }, [params.id])

  const fetchAppDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await appAPI.getAppById(params.id as string)
      setAppDetail(response.data)
    } catch (err: any) {
      console.error('Failed to fetch app detail:', err)
      setError(err.response?.data?.error || 'Failed to load app details')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'music':
        return <Music className="h-6 w-6" />
      case 'entertainment':
        return <Video className="h-6 w-6" />
      case 'productivity':
        return <Smartphone className="h-6 w-6" />
      case 'design':
        return <Zap className="h-6 w-6" />
      case 'communication':
        return <Users className="h-6 w-6" />
      case 'development':
        return <Globe className="h-6 w-6" />
      default:
        return <Globe className="h-6 w-6" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'music':
        return 'from-green-500 to-green-600'
      case 'entertainment':
        return 'from-red-500 to-red-600'
      case 'productivity':
        return 'from-blue-500 to-blue-600'
      case 'design':
        return 'from-purple-500 to-purple-600'
      case 'communication':
        return 'from-indigo-500 to-indigo-600'
      case 'development':
        return 'from-orange-500 to-orange-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const calculateSavings = () => {
    if (!appDetail) return 0
    const individualPrice = appDetail.app.base_price
    const groupPrice = appDetail.price_per_user
    const savings = individualPrice - groupPrice
    return Math.round(savings)
  }

  const calculateSavingsPercentage = () => {
    if (!appDetail) return 0
    const individualPrice = appDetail.app.base_price
    const groupPrice = appDetail.price_per_user
    const percentage = ((individualPrice - groupPrice) / individualPrice) * 100
    return Math.round(percentage)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading app details...</p>
        </div>
      </div>
    )
  }

  if (error || !appDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {error || 'App not found'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The app you're looking for doesn't exist or is no longer available.
          </p>
          <Button onClick={() => router.push('/')} className="bg-primary-600 hover:bg-primary-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const { app } = appDetail

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className={`w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r ${getCategoryColor(app.category)} rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                  {getCategoryIcon(app.category)}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">{app.name}</h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 capitalize truncate">{app.category}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {app.is_popular && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Popular</span>
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={() => window.open(app.website_url, '_blank')}
                className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm px-2 sm:px-3"
              >
                <ExternalLink className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Visit Website</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 border-0 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${getCategoryColor(app.category)} rounded-2xl sm:rounded-3xl flex items-center justify-center text-white shadow-2xl flex-shrink-0`}>
                    {getCategoryIcon(app.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{app.name}</h2>
                      {app.is_popular && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 self-start sm:self-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 leading-relaxed">
                      {app.description}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                      <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                        <span className="font-medium">{app.max_group_members} max members</span>
                      </div>
                      <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                        <span className="font-medium">Monthly billing</span>
                      </div>
                      <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                        <span className="font-medium">Secure payment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Pricing Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-4 sm:p-6 lg:p-8 border-0 shadow-xl">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-green-600" />
                  Pricing Comparison
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Individual Price */}
                  <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-700 rounded-xl sm:rounded-2xl">
                    <div className="text-center">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">Individual</h4>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-600 dark:text-slate-300 mb-2">
                        {formatCurrency(app.base_price)}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">per month</p>
                    </div>
                  </div>

                  {/* Group Price */}
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl sm:rounded-2xl border-2 border-green-200 dark:border-green-800">
                    <div className="text-center">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-center mb-2 space-y-1 sm:space-y-0 sm:space-x-2">
                        <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Group Sharing</h4>
                        <Badge className="bg-green-600 text-white border-0 text-xs self-center">
                          <Heart className="h-3 w-3 mr-1" />
                          Best Value
                        </Badge>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {formatCurrency(appDetail.price_per_user)}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2 sm:mb-3">per person per month</p>
                      <div className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">
                        Save {formatCurrency(calculateSavings())} ({calculateSavingsPercentage()}%)
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* <Card className="p-8 border-0 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <Zap className="h-6 w-6 mr-3 text-blue-600" />
                  Why Choose Group Sharing?
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <DollarSign className="h-6 w-6" />,
                      title: "Save Money",
                      description: `Save up to ${calculateSavingsPercentage()}% compared to individual subscriptions`
                    },
                    {
                      icon: <Users className="h-6 w-6" />,
                      title: "Share with Friends",
                      description: `Up to ${app.max_group_members} people can share one subscription`
                    },
                    {
                      icon: <Shield className="h-6 w-6" />,
                      title: "Secure & Safe",
                      description: "Protected payments and secure group management"
                    },
                    {
                      icon: <Clock className="h-6 w-6" />,
                      title: "Flexible Billing",
                      description: "Monthly billing with easy cancellation anytime"
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      className="flex items-start space-x-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{feature.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card> */}
            </motion.div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="p-8 border-0 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <Play className="h-6 w-6 mr-3 text-purple-600" />
                  How Group Sharing Works
                </h3>
                <div className="space-y-6">
                  {(() => {
                    // Parse how_it_works from app data or use default
                    let steps = [
                      "Create or join a group with friends",
                      "One person becomes the group host",
                      "Host subscribes to the service",
                      "Share login credentials securely",
                      "Split the cost equally among members",
                      "Enjoy premium features together!"
                    ]
                    
                    if (app?.how_it_works) {
                      try {
                        const parsedSteps = JSON.parse(app.how_it_works)
                        if (Array.isArray(parsedSteps) && parsedSteps.length > 0) {
                          steps = parsedSteps
                        }
                      } catch (error) {
                        console.error('Error parsing how_it_works:', error)
                      }
                    }
                    
                    return steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{step}</p>
                    </motion.div>
                    ))
                  })()}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 order-first lg:order-last">
            {/* Price Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-green-600" />
                  Cost Breakdown
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Base Price:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(app.base_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Group Members:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{app.max_group_members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Per Person:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(app.base_price / app.max_group_members)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Admin Fee:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency((3500))}</span>
                  </div>
                  <div className="border-t border-green-200 dark:border-green-700 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">Total per Person:</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">{formatCurrency(appDetail.price_per_user)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="p-4 sm:p-6 border-0 shadow-xl">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Ready to Start?</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg text-sm sm:text-base py-2 sm:py-3"
                      onClick={() => router.push('/groups/create')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm sm:text-base py-2 sm:py-3"
                      onClick={() => router.push(`/join?app=${app.id}`)}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Join Group
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm sm:text-base py-2 sm:py-3"
                      onClick={() => window.open(app.website_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Official Website
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="p-6 border-0 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Why Trust Us?
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-slate-600 dark:text-slate-300">Secure payment processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-slate-600 dark:text-slate-300">24/7 customer support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-slate-600 dark:text-slate-300">Money-back guarantee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-slate-600 dark:text-slate-300">Easy group management</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
