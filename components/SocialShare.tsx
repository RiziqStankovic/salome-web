import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { 
  Share2, 
  MessageCircle, 
  Send, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Copy, 
  Check,
  X
} from 'lucide-react'
import { 
  shareToWhatsApp, 
  shareToTelegram, 
  shareToFacebook, 
  shareToTwitter, 
  shareToLinkedIn, 
  shareToEmail, 
  shareToCopy, 
  shareToNative,
  generateShareText,
  getShareableUrl,
  trackSharing
} from '@/lib/social-sharing'

interface SocialShareProps {
  url: string
  title: string
  description: string
  className?: string
  showTitle?: boolean
  showDescription?: boolean
}

export default function SocialShare({ 
  url, 
  title, 
  description, 
  className = '',
  showTitle = true,
  showDescription = true
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState<string | null>(null)

  const shareableUrl = getShareableUrl(url, 'web')

  const handleShare = async (platform: string, shareFunction: () => void | Promise<any>) => {
    setSharing(platform)
    
    try {
      const result = await shareFunction()
      
      if (result?.success) {
        // Track sharing event
        trackSharing(platform, shareableUrl)
        
        // Show success message
        if (platform === 'copy') {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error)
    } finally {
      setSharing(null)
    }
  }

  const shareButtons = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => handleShare('whatsapp', () => 
        shareToWhatsApp(shareableUrl, generateShareText('whatsapp', title, description))
      )
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => handleShare('telegram', () => 
        shareToTelegram(shareableUrl, generateShareText('telegram', title, description))
      )
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => handleShare('facebook', () => 
        shareToFacebook(shareableUrl, generateShareText('facebook', title, description))
      )
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => handleShare('twitter', () => 
        shareToTwitter(shareableUrl, generateShareText('twitter', title, description))
      )
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => handleShare('linkedin', () => 
        shareToLinkedIn(shareableUrl, generateShareText('linkedin', title, description))
      )
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => handleShare('email', () => 
        shareToEmail(shareableUrl, generateShareText('email', title, description), title)
      )
    },
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      color: copied ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600',
      action: () => handleShare('copy', () => 
        shareToCopy(shareableUrl, generateShareText('copy', title, description))
      )
    }
  ]

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
        variant="outline"
      >
        <Share2 className="w-4 h-4" />
        <span>Bagikan</span>
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 p-4 w-80 z-50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Bagikan ke</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {showTitle && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                {title}
              </h4>
            </div>
          )}

          {showDescription && (
            <div className="mb-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {shareButtons.map((button) => {
              const Icon = button.icon
              const isLoading = sharing === button.name.toLowerCase().replace(' ', '')
              
              return (
                <Button
                  key={button.name}
                  onClick={button.action}
                  disabled={isLoading}
                  className={`${button.color} text-white text-sm py-2 px-3 flex items-center justify-center space-x-2`}
                  variant="ghost"
                >
                  <Icon className="w-4 h-4" />
                  <span>{isLoading ? '...' : button.name}</span>
                </Button>
              )
            })}
          </div>

          {/* Native sharing fallback */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => handleShare('native', () => 
                shareToNative(shareableUrl, generateShareText('native', title, description))
              )}
              className="w-full"
              variant="outline"
              disabled={sharing === 'native'}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {sharing === 'native' ? 'Membagikan...' : 'Bagikan dengan Aplikasi Lain'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
