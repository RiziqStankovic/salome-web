'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Bell, 
  X, 
  Check,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  FileText,
  TrendingUp,
  Gift
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { notificationAPI } from '@/lib/api'

interface Notification {
  id: string
  type: 'welcome' | 'admin' | 'payment' | 'group' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  actionText?: string
}

interface NotificationDropdownProps {
  userId?: string
}

export default function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationsFetched = useRef(false)

  // Fetch notifications from API
  useEffect(() => {
    if (userId && !notificationsFetched.current) {
      notificationsFetched.current = true
      fetchNotifications()
    }
  }, [userId])

  const fetchNotifications = async () => {
    if (!userId) return
    
    try {
      const response = await notificationAPI.getUserNotifications(userId, {
        page: 1,
        page_size: 10
      })
      
      if (response.data?.data) {
        const allNotifications = response.data.data.notifications || []
        console.log('Received notifications:', allNotifications)
        
        // Debug each notification's created_at
        allNotifications.forEach((notif: any) => {
          console.log(`Notification ${notif.id} - created_at:`, notif.created_at, 'Type:', typeof notif.created_at)
        })
        
        // Filter out read notifications (only show unread)
        const unreadNotifications = allNotifications.filter((notif: any) => !notif.is_read)
        
        setNotifications(unreadNotifications)
        setUnreadCount(response.data.data.unread_count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // Fallback to empty state
      setNotifications([])
      setUnreadCount(0)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <Gift className="h-4 w-4 text-white" />
      case 'admin':
        return <TrendingUp className="h-4 w-4 text-white" />
      case 'payment':
        return <ShoppingBag className="h-4 w-4 text-white" />
      case 'group':
        return <TrendingUp className="h-4 w-4 text-white" />
      case 'system':
        return <FileText className="h-4 w-4 text-white" />
      default:
        return <Check className="h-4 w-4 text-white" />
    }
  }

  const getNotificationIconBg = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'bg-orange-500'
      case 'admin':
        return 'bg-green-500'
      case 'payment':
        return 'bg-red-500'
      case 'group':
        return 'bg-green-500'
      case 'system':
        return 'bg-red-500'
      default:
        return 'bg-green-500'
    }
  }

  const getNotificationCardBg = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'bg-green-900/20'
      case 'admin':
        return 'bg-gray-700/50'
      case 'payment':
        return 'bg-green-900/20'
      case 'group':
        return 'bg-gray-700/50'
      case 'system':
        return 'bg-green-900/20'
      default:
        return 'bg-gray-700/50'
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      
      // Remove notification from UI with animation
      setDeletingIds(prev => new Set(prev).add(notificationId))
      
      // Remove from notifications after animation
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        setDeletingIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(notificationId)
          return newSet
        })
      }, 300) // Animation duration
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return
    
    try {
      await notificationAPI.markAllAsRead(userId)
      
      // Add all notifications to deleting set for animation
      const allIds = notifications.map(n => n.id)
      setDeletingIds(new Set(allIds))
      
      // Remove all notifications after animation
      setTimeout(() => {
        setNotifications([])
        setDeletingIds(new Set())
      }, 300) // Animation duration
      
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }


  const formatTime = (dateString: string) => {
    try {
      // Validate date string
      if (!dateString || dateString === 'Invalid Date') {
        return 'Hari ini'
      }
      
      const date = new Date(dateString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString)
        return 'Hari ini'
      }
      
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      // Same day - show time
      if (diffInMinutes < 1440) { // Less than 24 hours
        if (diffInMinutes < 1) return 'Baru saja'
        if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`
        
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) {
          // Show time for today
          return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      }
      
      // Different day - show date with time
      const diffInDays = Math.floor(diffInMinutes / 1440)
      if (diffInDays < 7) {
        return date.toLocaleString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // Older than a week - show full date
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.warn('Error formatting date:', dateString, error)
      return 'Hari ini'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-gray-900 dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-white">
                Notifikasi
              </h3>
              <div className="flex items-center space-x-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Tandai semua dibaca
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Tidak ada notifikasi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: deletingIds.has(notification.id) ? 0 : 1, 
                          y: deletingIds.has(notification.id) ? -10 : 0,
                          scale: deletingIds.has(notification.id) ? 0.95 : 1
                        }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className={`rounded-lg p-3 transition-all duration-200 ${getNotificationCardBg(notification.type)} ${deletingIds.has(notification.id) ? 'pointer-events-none' : 'hover:opacity-80'}`}
                      >
                        <div 
                          className="flex items-start space-x-3 cursor-pointer"
                          onClick={() => {
                            markAsRead(notification.id)
                            if (notification.actionUrl) {
                              window.location.href = notification.actionUrl
                            }
                          }}
                        >
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            <div className={`w-6 h-6 ${getNotificationIconBg(notification.type)} rounded flex items-center justify-center`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-white truncate">
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-300">
                                  {formatTime(notification.createdAt)}
                                </p>
                                <ChevronDown className="h-3 w-3 text-gray-300" />
                              </div>
                            </div>
                            <p className="text-sm text-gray-300 overflow-hidden" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 bg-gray-800 dark:bg-gray-800 border-t border-gray-700">
                <button
                  className="w-full text-sm text-gray-300 hover:text-white transition-colors"
                  onClick={() => {
                    setIsOpen(false)
                    // Navigate to notifications page if exists
                  }}
                >
                  Lihat semua notifikasi
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
