'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  MessageCircle, 
  Send, 
  Settings, 
  Crown, 
  UserPlus, 
  Share2, 
  Copy,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react'
import { groupAPI, messageAPI, paymentAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'


interface GroupMessage {
  id: string
  group_id: string
  user_id: string
  message: string
  message_type: string
  created_at: string
  user: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface GroupMember {
  id: string
  group_id: string
  user_id: string
  status: string
  user_status: string
  payment_amount: number
  price_per_member: number
  joined_at: string
  user: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface Group {
  id: string
  name: string
  description?: string
  app_id: string
  max_members: number
  current_members: number
  member_count: number
  price_per_member: number
  admin_fee: number
  total_price: number
  status: string
  invite_code: string
  owner_id: string
  expires_at?: string
  created_at: string
  updated_at: string
  members: GroupMember[]
  app: {
    id: string
    name: string
    description: string
    category: string
    icon_url: string
    total_price: number
  }
  owner: {
    id: string
    email: string
    full_name: string
    avatar_url?: string
  }
}

export default function GroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'members' | 'settings'>('chat')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [processingPayment, setProcessingPayment] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails()
      fetchMessages()
      fetchMembers()
    }
  }, [groupId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto scroll to bottom when component mounts
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [])

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Scroll to bottom to show newest messages
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
      }, 100)
    }
  }

  const fetchGroupDetails = async () => {
    try {
      setLoading(true)
      console.log('Fetching group details for ID:', groupId)
      const response = await groupAPI.getGroupDetails(groupId)
      console.log('Group API response:', response)
      console.log('Group data:', response.data)
      console.log('Group data structure:', JSON.stringify(response.data, null, 2))
      
      // Backend returns data in format: {"group": groupResponse}
      const groupData = response.data.group
      console.log('Final group data:', groupData)
      setGroup(groupData)
    } catch (error: any) {
      console.error('Error fetching group details:', error)
      console.error('Error response:', error.response)
      if (error.response?.status === 404) {
        toast.error('Grup tidak ditemukan')
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke grup ini')
      } else if (error.response?.status === 401) {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
        router.push('/?redirect=' + encodeURIComponent(window.location.pathname))
      } else {
        toast.error('Gagal memuat detail grup')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true)
      const response = await messageAPI.getGroupMessages(groupId)
      const messages = response.data.messages || []
      // Sort messages by created_at ascending (oldest first, newest at bottom)
      const sortedMessages = messages.sort((a: GroupMessage, b: GroupMessage) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateA - dateB
      })
      setMessages(sortedMessages)
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke chat grup ini')
      } else {
        toast.error('Gagal memuat pesan grup')
      }
    } finally {
      setLoadingMessages(false)
    }
  }

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true)
      const response = await groupAPI.getGroupMembers(groupId)
      setMembers(response.data.members || [])
    } catch (error: any) {
      console.error('Error fetching members:', error)
      if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke daftar anggota grup ini')
      } else {
        toast.error('Gagal memuat daftar anggota grup')
      }
    } finally {
      setLoadingMembers(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sendingMessage) return

    setSendingMessage(true)
    try {
      await messageAPI.createGroupMessage(groupId, {
        message: newMessage.trim(),
        message_type: 'text'
      })
      setNewMessage('')
      fetchMessages() // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Gagal mengirim pesan')
    } finally {
      setSendingMessage(false)
    }
  }

  const copyInviteCode = async () => {
    if (group?.invite_code) {
      try {
        await navigator.clipboard.writeText(group.invite_code)
        setCopied(true)
        toast.success('Kode invite berhasil disalin!')
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('Gagal menyalin kode invite')
      }
    }
  }

  const copyInviteLink = async () => {
    if (group?.invite_code) {
      const inviteLink = `${window.location.origin}/join/${group.invite_code}`
      try {
        await navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        toast.success('Link invite berhasil disalin!')
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('Gagal menyalin link invite')
      }
    }
  }

  const copyInviteWithHost = async () => {
    if (group?.invite_code && group?.owner) {
      const inviteText = `Halo! Saya mengundang Anda untuk bergabung dengan grup "${group.name}" di SALOME.\n\n` +
        `Host: ${group.owner.full_name}\n` +
        `Aplikasi: ${group.app?.name}\n` +
        `Kode Invite: ${group.invite_code}\n` +
        `Link: ${window.location.origin}/join/${group.invite_code}\n\n` +
        `Gabung sekarang dan nikmati penghematan bersama!`
      
      try {
        await navigator.clipboard.writeText(inviteText)
        setCopied(true)
        toast.success('Undangan grup berhasil disalin!')
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('Gagal menyalin undangan grup')
      }
    }
  }

  const handlePayment = async () => {
    if (!group || !user) return

    setProcessingPayment(true)
    try {
      const amount = group.price_per_member + group.admin_fee
      const response = await paymentAPI.createGroupPaymentLink({
        group_id: group.id,
        amount: amount
      })

      if (response.data.success && response.data.payment_url) {
        // Open payment URL in new tab
        window.open(response.data.payment_url, '_blank')
        toast.success('Halaman pembayaran dibuka di tab baru')
      } else {
        toast.error('Gagal membuat link pembayaran')
      }
    } catch (error: any) {
      console.error('Error creating payment link:', error)
      toast.error(error.response?.data?.error || 'Gagal membuat link pembayaran')
    } finally {
      setProcessingPayment(false)
    }
  }

  const isOwner = user?.id === group?.owner_id
  const isMember = group?.members?.some(member => member.user_id === user?.id) || false
  
  // Check if group is expired
  const isExpired = group?.expires_at ? new Date(group.expires_at) < new Date() : false
  const isGroupFull = (group?.current_members || 0) >= (group?.max_members || 0)

  // Debug logging
  console.log('Current group state:', group)
  console.log('Group name:', group?.name)
  console.log('Group price_per_member:', group?.price_per_member)
  console.log('Group admin_fee:', group?.admin_fee)
  console.log('Group total_price:', group?.total_price)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Memuat detail grup...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!group) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-300">Grup tidak ditemukan</p>
          <Button onClick={() => router.push('/groups')} className="mt-4">
            Kembali ke Daftar Grup
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                {group.app?.icon_url ? (
                  <img src={group.app.icon_url} alt={group.app.name} className="w-10 h-10" />
                ) : (
                  <span className="text-primary-600 font-bold text-2xl">
                    {group.app?.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{group.app?.name}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge 
                    variant={
                      isExpired ? 'error' : 
                      group.status === 'open' ? 'success' : 
                      group.status === 'full' || isGroupFull ? 'warning' : 'primary'
                    }
                  >
                    {isExpired ? 'Kedaluwarsa' : 
                     group.status === 'open' ? 'Terbuka' : 
                     group.status === 'full' || isGroupFull ? 'Penuh' : 'Aktif'}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {group.current_members} / {group.max_members} anggota
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isOwner && (
                <Button
                  variant="outline"
                  onClick={() => setShowInviteModal(true)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Bagikan
                </Button>
              )}
              <Button variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Tabs */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 mb-6">
              <Button
                variant={activeTab === 'chat' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('chat')}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button
                variant={activeTab === 'members' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('members')}
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                Anggota
              </Button>
              {isOwner && (
                <Button
                  variant={activeTab === 'settings' ? 'primary' : 'ghost'}
                  onClick={() => setActiveTab('settings')}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Pengaturan
                </Button>
              )}
            </div>

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col h-80 sm:h-96"
              >
                <Card className="flex-1 flex flex-col p-0 dark:bg-gray-800">
                  {/* Messages */}
                  <div ref={messagesContainerRef} className="h-60 sm:h-72 overflow-y-auto p-4 space-y-4 scroll-smooth">
                    {loadingMessages ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300">Memuat pesan...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-300">Belum ada pesan</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Mulai percakapan dengan anggota grup lainnya
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.user_id === user?.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                                message.user_id === user?.id 
                                  ? 'bg-white bg-opacity-20 text-white' 
                                  : 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                              }`}>
                                {message.user.full_name.charAt(0).toUpperCase()}
                              </div>
                              <p className={`text-sm font-bold ${
                                message.user_id === user?.id 
                                  ? 'text-white' 
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}>
                                {message.user.full_name}
                              </p>
                            </div>
                            <p className={`text-sm font-normal ${
                              message.user_id === user?.id 
                                ? 'text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {message.message}
                            </p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tulis pesan..."
                        disabled={sendingMessage}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        loading={sendingMessage}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                {loadingMembers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Memuat daftar anggota...</p>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Belum ada anggota</p>
                  </div>
                ) : (
                  members.map((member) => (
                    <Card key={member.id} className="p-4 dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 dark:text-primary-400 font-semibold">
                              {member.user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {member.user.full_name}
                              </p>
                              {member.user_id === group?.owner_id && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Bergabung {member.joined_at ? new Date(member.joined_at).toLocaleDateString('id-ID') : '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(member.price_per_member)}
                            </p>
                            <Badge 
                              variant={member.user_status === 'paid' ? 'success' : 'warning'}
                            >
                              {member.user_status === 'paid' ? 'Lunas' : 'Pending'}
                            </Badge>
                          </div>
                          {isOwner && member.user_id !== group?.owner_id && (
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </motion.div>
            )}


            {/* Settings Tab */}
            {activeTab === 'settings' && isOwner && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <Card className="p-6 dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Pengaturan Grup
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nama Grup
                      </label>
                      <Input
                        value={group?.name || ''}
                        disabled
                        className="bg-gray-50 dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Deskripsi Grup
                      </label>
                      <textarea
                        value={group?.description || ''}
                        disabled
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Grup
                      </Button>
                      <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus Grup
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Group Info */}
            <Card className="p-6 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informasi Grup
              </h3>
              <div className="space-y-3">
                {/* Nama Grup */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Nama Grup</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right max-w-48">
                    {group?.name || '-'}
                  </span>
                </div>
                
                {/* Deskripsi Grup */}
                {group?.description && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Deskripsi</span>
                    <span className="font-medium text-gray-900 dark:text-white text-right max-w-48 text-sm">
                      {group.description}
                    </span>
                  </div>
                )}

                {/* Aplikasi */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Aplikasi</span>
                  <div className="flex items-center space-x-2">
                    {group?.app?.icon_url && (
                      <img 
                        src={group.app.icon_url} 
                        alt={group.app.name} 
                        className="w-5 h-5 rounded"
                      />
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {group?.app?.name || group?.app_id || '-'}
                    </span>
                  </div>
                </div>

                {/* Status Grup */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
                  <Badge 
                    variant={
                      isExpired ? 'error' : 
                      group?.status === 'open' ? 'success' : 
                      group?.status === 'full' || isGroupFull ? 'warning' : 'primary'
                    }
                  >
                    {isExpired ? 'Kedaluwarsa' : 
                     group?.status === 'open' ? 'Terbuka' : 
                     group?.status === 'full' || isGroupFull ? 'Penuh' : 'Aktif'}
                  </Badge>
                </div>

                {/* Jumlah Anggota */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Anggota</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {group?.current_members || 0} / {group?.max_members || 0}
                  </span>
                </div>

                {/* Member Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Anggota</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {group?.member_count || group?.current_members || 0}
                  </span>
                </div>

                {/* Harga per Anggota */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Harga per Anggota</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {formatCurrency((group?.price_per_member || 0) + (group?.admin_fee || 0))}
                  </span>
                </div>

                {/* Biaya Admin */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Biaya Admin</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(group?.admin_fee || 0)}
                  </span>
                </div>

                {/* Total Aplikasi */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Aplikasi</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(group?.total_price || 0)}
                  </span>
                </div>

                {/* Kode Invite */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Kode Invite</span>
                  <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {group?.invite_code || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Dibuat Oleh</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-semibold text-xs">
                        {group?.owner?.full_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {group?.owner?.full_name || '-'}
                    </span>
                  </div>
                </div>
                {group.expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Berlaku Sampai</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {group.expires_at ? new Date(group.expires_at).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Aksi
              </h3>
              <div className="space-y-3">
                {!isMember && group.status === 'open' && (
                  <Button className="w-full text-sm sm:text-base">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Gabung Grup
                  </Button>
                )}
                {isMember && (
                  <Button 
                    variant="outline" 
                    className="w-full text-sm sm:text-base"
                    onClick={handlePayment}
                    disabled={processingPayment}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {processingPayment ? 'Memproses...' : 'Bayar Sekarang'}
                  </Button>
                )}
                <Button variant="outline" className="w-full text-sm sm:text-base" onClick={() => setShowInviteModal(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Bagikan Grup
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-lg w-full mx-4 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Bagikan Grup
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Bagikan kode invite atau link ini kepada teman-teman untuk bergabung dengan grup:
              </p>
              
              {/* Invite Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kode Invite
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={group?.invite_code || ''}
                    readOnly
                    className="flex-1 font-mono"
                  />
                  <Button
                    onClick={copyInviteCode}
                    variant="outline"
                    size="sm"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Invite Link */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link Invite
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={group?.invite_code ? `${window.location.origin}/join/${group.invite_code}` : ''}
                    readOnly
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={copyInviteLink}
                    variant="outline"
                    size="sm"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    copyInviteWithHost()
                    setShowInviteModal(false)
                  }}
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Salin Undangan Lengkap
                </Button>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1"
                  >
                    Tutup
                  </Button>
                  <Button
                    onClick={() => {
                      copyInviteLink()
                      setShowInviteModal(false)
                    }}
                    className="flex-1"
                  >
                    Salin Link Saja
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
