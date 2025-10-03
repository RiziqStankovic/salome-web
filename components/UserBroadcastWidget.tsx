'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Megaphone, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { userBroadcastUserAPI } from '@/lib/api'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface UserBroadcast {
  id: string
  title: string
  message: string
  priority: 'low' | 'normal' | 'high'
  sent_at?: string
  end_date?: string
  created_at: string
  creator_name?: string
}

const UserBroadcastWidget: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<UserBroadcast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const broadcastsFetched = useRef(false)

  useEffect(() => {
    if (!broadcastsFetched.current) {
      broadcastsFetched.current = true
      fetchBroadcasts()
    }
  }, [])

  const fetchBroadcasts = async () => {
    try {
      setIsLoading(true)
      const response = await userBroadcastUserAPI.getUserBroadcasts()
      setBroadcasts(response.data.broadcasts || [])
      
      // Count unread broadcasts (for now, all are considered unread)
      setUnreadCount(response.data.broadcasts?.length || 0)
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error)
      // Don't show error toast for user dashboard
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error'
      case 'normal':
        return 'primary'
      case 'low':
        return 'gray'
      default:
        return 'gray'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Tinggi'
      case 'normal':
        return 'Normal'
      case 'low':
        return 'Rendah'
      default:
        return 'Normal'
    }
  }

  const isExpired = (endDate?: string) => {
    if (!endDate) return false
    return new Date(endDate) < new Date()
  }

  if (isLoading) {
    return (
      <Card className="p-4 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded-lg w-10 h-10"></div>
          <div className="flex-1">
            <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded h-4 w-3/4 mb-2"></div>
            <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded h-3 w-1/2"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (broadcasts.length === 0) {
    return null // Don't show widget if no broadcasts
  }

  return (
    <Card className="p-4 dark:bg-gray-800">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Megaphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Pengumuman Terbaru
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {broadcasts.length} pengumuman tersedia
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Badge variant="error" className="text-xs">
              {unreadCount} baru
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-3"
        >
          {broadcasts.map((broadcast, index) => (
            <motion.div
              key={broadcast.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${
                isExpired(broadcast.end_date)
                  ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {broadcast.title}
                  </h4>
                  {broadcast.creator_name && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Oleh: {broadcast.creator_name}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <Badge variant={getPriorityColor(broadcast.priority)} className="text-xs">
                    {getPriorityLabel(broadcast.priority)}
                  </Badge>
                  {isExpired(broadcast.end_date) && (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                {broadcast.message}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {broadcast.sent_at 
                        ? format(new Date(broadcast.sent_at), 'dd MMM yyyy, HH:mm', { locale: id })
                        : format(new Date(broadcast.created_at), 'dd MMM yyyy, HH:mm', { locale: id })
                      }
                    </span>
                  </div>
                  {broadcast.end_date && (
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>
                        Berakhir: {format(new Date(broadcast.end_date), 'dd MMM yyyy', { locale: id })}
                      </span>
                    </div>
                  )}
                </div>
                
                {isExpired(broadcast.end_date) ? (
                  <Badge variant="gray" className="text-xs">
                    Kedaluwarsa
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Card>
  )
}

export default UserBroadcastWidget
