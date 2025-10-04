import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ExternalLink, X, Globe, Calendar, User } from 'lucide-react'
import Image from 'next/image'

interface LinkPreviewProps {
  url: string
  onClose?: () => void
  className?: string
}

interface LinkData {
  title: string
  description: string
  image: string
  favicon: string
  domain: string
  publishedTime?: string
  author?: string
}

export default function LinkPreview({ url, onClose, className = '' }: LinkPreviewProps) {
  const [linkData, setLinkData] = useState<LinkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Simulate API call to get link metadata
        // In real implementation, you would call your backend API
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch link data')
        }
        
        const data = await response.json()
        setLinkData(data)
      } catch (err) {
        console.error('Error fetching link data:', err)
        setError('Gagal memuat preview link')
        
        // Fallback data
        setLinkData({
          title: 'SALOME - Patungan Akun SaaS Bersama',
           description: 'Solusi Patungan Satu Software Rame - Rame. Tanpa Ribet pembayaran Tanpa susah cari teman patungan. Amanah, mudah, dan terpercaya.',
          image: '/og-image.jpg',
          favicon: '/favicon.ico',
          domain: 'salome.cloudfren.id',
          publishedTime: new Date().toISOString(),
          author: 'SALOME Team'
        })
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      fetchLinkData()
    }
  }, [url])

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4" />
          </div>
        </div>
      </Card>
    )
  }

  if (error || !linkData) {
    return (
      <Card className={`p-4 border-red-200 bg-red-50 dark:bg-red-900/20 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <div className="flex-1">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Favicon */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
            {linkData.favicon ? (
              <Image
                src={linkData.favicon}
                alt={`${linkData.domain} favicon`}
                width={16}
                height={16}
                className="w-4 h-4"
                onError={(e) => {
                  // Fallback to default icon if favicon fails to load
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <Globe className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                {linkData.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {linkData.description}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {linkData.domain}
                </span>
                {linkData.publishedTime && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(linkData.publishedTime).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                )}
                {linkData.author && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <User className="w-3 h-3" />
                    <span>{linkData.author}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(url, '_blank')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
