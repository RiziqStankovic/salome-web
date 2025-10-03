'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Users,
  MessageSquare,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { chatAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface ChatMessage {
  id: string
  chat_id: string
  sender_id?: string
  sender_type: 'user' | 'anonymous' | 'admin'
  content: string
  created_at: string
  sender_name?: string
}

interface Chat {
  id: string
  user_id?: string
  anonymous_name?: string
  status: string
  is_read: boolean
  message_count: number
  created_at: string
  updated_at: string
  last_message?: ChatMessage
  sender_name?: string
}

const AdminChatPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.is_admin) {
      fetchChats()
    }
  }, [user])

  // Listen for new messages from users (when they send messages)
  useEffect(() => {
    const handleNewMessage = async (event: CustomEvent) => {
      const { chatId, message } = event.detail
      
      try {
        // Mark chat as unread in backend
        await chatAPI.markChatAsUnread(chatId)
        
        // Update the specific chat's last message and mark as unread
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === chatId 
              ? { 
                  ...chat, 
                  is_read: false, 
                  last_message: message,
                  updated_at: message.created_at,
                  message_count: chat.message_count + 1
                } 
              : chat
          )
        )
        
        // Update unread count
        setUnreadCount(prev => prev + 1)
        
        // Update sidebar status
        const event2 = new CustomEvent('chatStatusUpdated', { 
          detail: { hasUnread: true } 
        })
        window.dispatchEvent(event2)
      } catch (error) {
        console.error('Failed to mark chat as unread:', error)
      }
    }

    window.addEventListener('newUserMessage', handleNewMessage as unknown as EventListener)
    return () => {
      window.removeEventListener('newUserMessage', handleNewMessage as unknown as EventListener)
    }
  }, [])

  // Update sidebar status when unread count changes
  useEffect(() => {
    // Dispatch custom event to update sidebar status
    const event = new CustomEvent('chatStatusUpdated', { 
      detail: { hasUnread: unreadCount > 0 } 
    })
    window.dispatchEvent(event)
  }, [unreadCount])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChats = async () => {
    try {
      setIsLoading(true)
      const response = await chatAPI.getAllChats()
      const chats = response.data.chats || []
      setChats(chats)
      
      // Count unread chats
      const unread = chats.filter((chat: Chat) => !chat.is_read).length
      setUnreadCount(unread)
      
      // Update sidebar status
      const event = new CustomEvent('chatStatusUpdated', { 
        detail: { hasUnread: unread > 0 } 
      })
      window.dispatchEvent(event)
    } catch (error: any) {
      console.error('Failed to fetch chats:', error)
      toast.error('Gagal memuat daftar chat')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (chatId: string) => {
    try {
      setIsLoadingMessages(true)
      const response = await chatAPI.getChatMessages(chatId)
      setMessages(response.data.messages)
    } catch (error: any) {
      console.error('Failed to fetch messages:', error)
      toast.error('Gagal memuat pesan')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat)
    fetchMessages(chat.id)
    
    // Mark chat as read if not already read
    if (!chat.is_read) {
      try {
        await chatAPI.markChatAsRead(chat.id)
        // Update local state
        setChats(prevChats => 
          prevChats.map(c => 
            c.id === chat.id ? { ...c, is_read: true } : c
          )
        )
        const newUnreadCount = Math.max(0, unreadCount - 1)
        setUnreadCount(newUnreadCount)
        
        // Update sidebar status
        const event = new CustomEvent('chatStatusUpdated', { 
          detail: { hasUnread: newUnreadCount > 0 } 
        })
        window.dispatchEvent(event)
      } catch (error) {
        console.error('Failed to mark chat as read:', error)
      }
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    setIsSending(true)
    try {
      const response = await chatAPI.sendMessageAsAdmin(selectedChat.id, newMessage)
      setMessages(prev => [...prev, response.data.message])
      setNewMessage('')
      toast.success('Pesan berhasil dikirim')
    } catch (error: any) {
      console.error('Failed to send message:', error)
      toast.error('Gagal mengirim pesan')
    } finally {
      setIsSending(false)
    }
  }

  const handleStatusChange = async (chatId: string, newStatus: string) => {
    try {
      await chatAPI.updateChatStatus(chatId, newStatus)
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, status: newStatus } : chat
      ))
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, status: newStatus } : null)
      }
      toast.success('Status chat berhasil diupdate')
    } catch (error: any) {
      console.error('Failed to update chat status:', error)
      toast.error('Gagal mengupdate status chat')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="success" className="text-xs">Open</Badge>
      case 'closed':
        return <Badge variant="error" className="text-xs">Closed</Badge>
      case 'pending':
        return <Badge variant="warning" className="text-xs">Pending</Badge>
      default:
        return <Badge variant="gray" className="text-xs">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredChats = chats
    .filter(chat => {
      const matchesSearch = 
        chat.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.anonymous_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || chat.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Sort by last_message.created_at if available, otherwise by chat.created_at
      const aTime = a.last_message?.created_at || a.created_at
      const bTime = b.last_message?.created_at || b.created_at
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Chat</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Kelola semua percakapan user dan anonim.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {/* Chat List */}
          <Card className="p-4 dark:bg-gray-800 flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Chat</h2>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchChats}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

            {/* Search and Filter */}
            <div className="space-y-3 mb-4 flex-shrink-0">
              <Input
                placeholder="Cari chat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Semua Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Chat Items */}
            <div className="space-y-2 flex-1 overflow-y-auto scrollbar-minimal scrollbar-hide-horizontal min-h-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada chat</p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat?.id === chat.id
                        ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    } ${!chat.is_read ? 'bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-l-yellow-400' : ''}`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(chat.status)}
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {chat.sender_name || chat.anonymous_name || `Chat ${chat.id.slice(0, 8)}`}
                        </span>
                        {!chat.is_read && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        {chat.message_count > 0 && (
                          <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {chat.message_count > 99 ? '99+' : chat.message_count}
                          </span>
                        )}
                      </div>
                      {getStatusBadge(chat.status)}
                    </div>
                    {chat.last_message && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {chat.last_message.content}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {format(new Date(chat.updated_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </Card>

          {/* Chat Messages */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col dark:bg-gray-800 min-h-0">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {selectedChat.sender_name || selectedChat.anonymous_name || `Chat ${selectedChat.id.slice(0, 8)}`}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedChat.user_id ? 'User Terdaftar' : 'Anonymous User'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(selectedChat.status)}
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(selectedChat.id, 'open')}
                            disabled={selectedChat.status === 'open'}
                          >
                            Open
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(selectedChat.id, 'closed')}
                            disabled={selectedChat.status === 'closed'}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scrollbar-minimal scrollbar-hide-horizontal min-h-0 max-h-[calc(100vh-300px)]">
                    {isLoadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Belum ada pesan</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                              message.sender_type === 'admin'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            <p className="text-xs font-semibold mb-1">
                              {message.sender_name || 'Admin'}
                            </p>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs text-right mt-1 opacity-75">
                              {format(new Date(message.created_at), 'HH:mm', { locale: id })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="flex-1"
                        disabled={isSending}
                      />
                      <Button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        loading={isSending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Pilih chat untuk memulai percakapan</p>
                    <p className="text-sm">Klik pada salah satu chat di daftar untuk melihat pesan</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminChatPage
