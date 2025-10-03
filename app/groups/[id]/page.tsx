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
  Edit,
  UserCheck,
  AlertTriangle,
  XCircle,
  X,
  LogOut,
  ArrowLeft,
  Shield,
  RefreshCw
} from 'lucide-react'
import { groupAPI, messageAPI, paymentAPI, accountCredentialsAPI, emailSubmissionsAPI, broadcastAPI } from '@/lib/api'
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
  user_status: string
  payment_amount: number
  price_per_member: number
  joined_at: string
  user: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

interface AccountCredentials {
  id: string
  user_id: string
  app_id: string
  username?: string
  email?: string
  created_at: string
  updated_at: string
  app?: {
    name: string
    icon_url?: string
    description?: string
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
  group_status: string
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

interface Broadcast {
  id: string
  title: string
  message: string
  priority: number
  start_date: string
  end_date?: string
  created_at: string
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
  const [refreshingMessages, setRefreshingMessages] = useState(false)
  const [pullToRefresh, setPullToRefresh] = useState(false)
  const [pullStartY, setPullStartY] = useState(0)
  const [pullCurrentY, setPullCurrentY] = useState(0)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'members' | 'settings'>('chat')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [processingPayment, setProcessingPayment] = useState(false)
  const [accountCredentials, setAccountCredentials] = useState<AccountCredentials | null>(null)
  const [loadingCredentials, setLoadingCredentials] = useState(false)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [loadingBroadcast, setLoadingBroadcast] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<string>('')
  const [showEmailSelector, setShowEmailSelector] = useState(false)
  const [allAccountCredentials, setAllAccountCredentials] = useState<AccountCredentials[]>([])
  const [submittingEmail, setSubmittingEmail] = useState(false)
  const [emailSubmissionStatus, setEmailSubmissionStatus] = useState<string | null>(null)
  const [approvedEmail, setApprovedEmail] = useState<string | null>(null)
  const [rejectedEmail, setRejectedEmail] = useState<string | null>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [selectedNewOwner, setSelectedNewOwner] = useState<string>('')
  const [transferring, setTransferring] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  })
  const [paidMembersCount, setPaidMembersCount] = useState(0)
  const groupDetailsFetched = useRef(false)
  const credentialsFetched = useRef(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (groupId && !groupDetailsFetched.current) {
      groupDetailsFetched.current = true
      fetchGroupDetails()
      fetchMessages()
      fetchMembers()
    }
  }, [groupId])

  // Fetch account credentials and check email status when group data is loaded
  useEffect(() => {
    if (group?.app?.id && user && !credentialsFetched.current) {
      credentialsFetched.current = true
      fetchAccountCredentials()
      fetchAllAccountCredentials()
      // Check email submission status independently
      checkEmailSubmissionStatus()
    }
  }, [group?.app?.id, user])

  // Fetch broadcast when group is loaded
  useEffect(() => {
    if (groupId) {
      fetchBroadcast()
    }
  }, [groupId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Calculate paid members count when members change
  useEffect(() => {
    const paidCount = members.filter(member => 
      member.user_status === 'paid'
    ).length
    setPaidMembersCount(paidCount)
  }, [members])

  // Auto scroll to bottom when component mounts
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [])

  // Auto refresh messages every 30 seconds when chat tab is active
  useEffect(() => {
    if (activeTab === 'chat' && autoRefreshEnabled && !refreshingMessages) {
      const interval = setInterval(() => {
        refreshMessages()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [activeTab, autoRefreshEnabled, refreshingMessages])

  // Close email selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmailSelector) {
        const target = event.target as HTMLElement
        if (!target.closest('.email-selector')) {
          setShowEmailSelector(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmailSelector])

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
      const response = await groupAPI.getGroupDetails(groupId)
      
      // Backend returns data in format: {"group": groupResponse}
      const groupData = response.data.group
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
      } else if (error.response?.status === 500) {
        toast.error('Terjadi kesalahan server. Silakan coba lagi.')
        console.error('Server error details:', error.response?.data)
      } else {
        toast.error('Gagal memuat detail grup')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchBroadcast = async () => {
    try {
      setLoadingBroadcast(true)
      const response = await broadcastAPI.getGroupBroadcast(groupId)
      
      if (response.data?.data) {
        // Handle both single broadcast and array of broadcasts
        if (Array.isArray(response.data.data)) {
          setBroadcasts(response.data.data)
        } else {
          setBroadcasts([response.data.data])
        }
      } else {
        setBroadcasts([])
      }
    } catch (error: any) {
      console.error('Error fetching broadcasts:', error)
      setBroadcasts([])
    } finally {
      setLoadingBroadcast(false)
    }
  }

  const fetchAccountCredentials = async () => {
    if (!group?.app?.id) return
    
    try {
      setLoadingCredentials(true)
      const response = await accountCredentialsAPI.getAccountCredentialsByApp(group.app.id)
      setAccountCredentials(response.data.data)
      // Set selected email to the found credentials
      if (response.data.data?.email) {
        setSelectedEmail(response.data.data.email)
      }
      
      // Email submission status will be checked independently
    } catch (error: any) {
      console.error('Error fetching account credentials:', error)
      // If no credentials found, set to null (will use user data as fallback)
      setAccountCredentials(null)
      setSelectedEmail('')
    } finally {
      setLoadingCredentials(false)
    }
  }

  const checkEmailSubmissionStatus = async () => {
    if (!group?.id) {
      return
    }
    
    try {
      const response = await emailSubmissionsAPI.getEmailSubmissions(group.id)
      
      // Extract submissions from response.data.data (API returns {data: [...], success: true})
      const submissions = response.data.data || []
      
      // Check if there's an approved submission for this group
      const approvedSubmission = submissions.find((sub: any) => 
        sub.group_id === group.id && 
        sub.status === 'approved'
      )
      
      if (approvedSubmission) {
        setEmailSubmissionStatus('approved')
        setApprovedEmail(approvedSubmission.email)
        setRejectedEmail(null)
      } else {
        // Check if there's a rejected submission
        const rejectedSubmission = submissions.find((sub: any) => 
          sub.group_id === group.id && 
          sub.status === 'rejected'
        )
        
        if (rejectedSubmission) {
          setEmailSubmissionStatus('rejected')
          setRejectedEmail(rejectedSubmission.email)
          setApprovedEmail(null)
        } else {
          // Check if there's a pending submission
          const pendingSubmission = submissions.find((sub: any) => 
            sub.group_id === group.id && 
            sub.status === 'pending'
          )
          
          if (pendingSubmission) {
            setEmailSubmissionStatus('submitted')
            setApprovedEmail(null)
            setRejectedEmail(null)
          } else {
            setEmailSubmissionStatus(null)
            setApprovedEmail(null)
            setRejectedEmail(null)
          }
        }
      }
    } catch (error: any) {
      console.error('Error checking email submission status:', error)
    }
  }

  const fetchAllAccountCredentials = async () => {
    try {
      const response = await accountCredentialsAPI.getUserAccountCredentials()
      setAllAccountCredentials(response.data.data || [])
    } catch (error: any) {
      console.error('Error fetching all account credentials:', error)
      setAllAccountCredentials([])
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

  const refreshMessages = async () => {
    try {
      setRefreshingMessages(true)
      const response = await messageAPI.getGroupMessages(groupId)
      const messages = response.data.messages || []
      // Sort messages by created_at ascending (oldest first, newest at bottom)
      const sortedMessages = messages.sort((a: GroupMessage, b: GroupMessage) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateA - dateB
      })
      setMessages(sortedMessages)
      toast.success('Chat berhasil diperbarui')
    } catch (error: any) {
      console.error('Error refreshing messages:', error)
      if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke chat grup ini')
      } else {
        toast.error('Gagal memperbarui chat')
      }
    } finally {
      setRefreshingMessages(false)
    }
  }

  // Pull to refresh handlers
  const handlePullStart = (e: React.TouchEvent) => {
    if (messagesContainerRef.current?.scrollTop === 0) {
      setPullStartY(e.touches[0].clientY)
      setPullCurrentY(e.touches[0].clientY)
    }
  }

  const handlePullMove = (e: React.TouchEvent) => {
    if (pullStartY > 0 && messagesContainerRef.current?.scrollTop === 0) {
      const currentY = e.touches[0].clientY
      const diff = currentY - pullStartY
      
      if (diff > 0) {
        setPullCurrentY(currentY)
        setPullToRefresh(diff > 50)
      }
    }
  }

  const handlePullEnd = () => {
    if (pullToRefresh) {
      refreshMessages()
    }
    setPullStartY(0)
    setPullCurrentY(0)
    setPullToRefresh(false)
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

  const copyEmail = async () => {
    const email = getCurrentEmail()
    if (email) {
      try {
        await navigator.clipboard.writeText(email)
        toast.success('Email Anda disalin!')
      } catch (error) {
        console.error('Failed to copy email:', error)
        toast.error('Gagal menyalin email')
      }
    }
  }

  const copyFullName = async () => {
    const fullName = getCurrentName()
    if (fullName) {
      try {
        await navigator.clipboard.writeText(fullName)
        toast.success('Nama lengkap Anda disalin!')
      } catch (error) {
        console.error('Failed to copy full name:', error)
        toast.error('Gagal menyalin nama lengkap')
      }
    }
  }

  const handleEmailSelection = (email: string) => {
    setSelectedEmail(email)
    setShowEmailSelector(false)
    
    // Find the corresponding account credentials
    const selectedCred = allAccountCredentials.find(cred => cred.email === email)
    if (selectedCred) {
      setAccountCredentials(selectedCred)
    } else if (email === user?.email) {
      setAccountCredentials(null) // Use user data
    }
  }

  const getCurrentEmail = () => {
    if (selectedEmail) return selectedEmail
    return accountCredentials?.email || user?.email || ''
  }

  const getCurrentName = () => {
    if (accountCredentials?.username) return accountCredentials.username
    return user?.full_name || ''
  }

  const submitEmailForGroup = async () => {
    if (!group || !user) return

    try {
      setSubmittingEmail(true)
      await emailSubmissionsAPI.createEmailSubmission({
        group_id: group.id,
        app_id: group.app.id,
        email: getCurrentEmail(),
        username: getCurrentName(),
        full_name: user.full_name
      })
      
      setEmailSubmissionStatus('submitted')
      toast.success('Email berhasil diajukan untuk grup patungan!')
      
      // Re-check email submission status to ensure consistency
      setTimeout(() => {
        checkEmailSubmissionStatus()
      }, 2000)
    } catch (error: any) {
      console.error('Error submitting email:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Gagal mengajukan email')
      }
    } finally {
      setSubmittingEmail(false)
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

  const handleTransferOwnership = async () => {
    if (!selectedNewOwner || !group) return

    setTransferring(true)
    try {
      await groupAPI.transferOwnership(group.id, {
        new_owner_id: selectedNewOwner
      })
      
      toast.success('Kepemilikan grup berhasil ditransfer!')
      setShowTransferModal(false)
      setSelectedNewOwner('')
      
      // Refresh group data
      fetchGroupDetails()
      fetchMembers()
    } catch (error: any) {
      console.error('Error transferring ownership:', error)
      toast.error(error.response?.data?.error || 'Gagal transfer kepemilikan')
    } finally {
      setTransferring(false)
    }
  }

  const handleDeleteGroup = async () => {
    if (!group) return

    setDeleting(true)
    try {
      await groupAPI.deleteGroup(group.id)
      
      toast.success('Grup berhasil dihapus!')
      setShowDeleteModal(false)
      
      // Redirect to groups page
      router.push('/groups')
    } catch (error: any) {
      console.error('Error deleting group:', error)
      toast.error(error.response?.data?.error || 'Gagal menghapus grup')
    } finally {
      setDeleting(false)
    }
  }

  const handleEditGroup = () => {
    if (!group) return
    
    setEditForm({
      name: group.name || '',
      description: group.description || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateGroup = async () => {
    if (!group) return

    setEditing(true)
    try {
      await groupAPI.updateGroup(group.id, editForm)
      
      toast.success('Grup berhasil diperbarui!')
      setShowEditModal(false)
      
      // Refresh group data
      fetchGroupDetails()
    } catch (error: any) {
      console.error('Error updating group:', error)
      toast.error(error.response?.data?.error || 'Gagal memperbarui grup')
    } finally {
      setEditing(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (!group) return

    setLeaving(true)
    try {
      await groupAPI.leaveGroup(group.id)
      
      toast.success('Berhasil keluar dari grup!')
      setShowLeaveModal(false)
      
      // Redirect to groups page
      router.push('/groups')
    } catch (error: any) {
      console.error('Error leaving group:', error)
      toast.error(error.response?.data?.error || 'Gagal keluar dari grup')
    } finally {
      setLeaving(false)
    }
  }

  const isOwner = user?.id === group?.owner_id
  const isMember = group?.members?.some(member => member.user_id === user?.id) || false
  
  // Check if group is expired
  const isExpired = group?.expires_at ? new Date(group.expires_at) < new Date() : false
  const isGroupFull = (group?.current_members || 0) >= (group?.max_members || 0)


  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => {
                if (user?.is_admin) {
                  // Admin view - kembali ke admin groups page
                  router.push('/admin/groups')
                } else {
                  // User biasa - kembali ke halaman sebelumnya
                  router.back()
                }
              }}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{user?.is_admin ? 'Kembali ke Admin' : 'Kembali'}</span>
            </Button>
          </div>
          
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => {
                if (user?.is_admin) {
                  // Admin view - kembali ke admin groups page
                  router.push('/admin/groups')
                } else {
                  // User biasa - kembali ke halaman sebelumnya
                  router.back()
                }
              }}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{user?.is_admin ? 'Kembali ke Admin' : 'Kembali'}</span>
            </Button>
          </div>
          
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300">Grup tidak ditemukan</p>
            <Button onClick={() => router.push('/groups')} className="mt-4">
              Kembali ke Daftar Grup
            </Button>
          </div>
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
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => {
                if (user?.is_admin) {
                  // Admin view - kembali ke admin groups page
                  router.push('/admin/groups')
                } else {
                  // User biasa - kembali ke halaman sebelumnya
                  router.back()
                }
              }}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{user?.is_admin ? 'Kembali ke Admin' : 'Kembali'}</span>
            </Button>
          </div>
          
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
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
                  {user?.is_admin && (
                    <Badge variant="primary" className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Admin View</span>
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{group.app?.name}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge 
                    variant={
                      isExpired ? 'error' : 
                      group.group_status === 'open' ? 'primary' : 
                      group.group_status === 'paid_group' ? 'success' :
                      group.group_status === 'full' || isGroupFull ? 'warning' : 'primary'
                    }
                  >
                    {isExpired ? 'Kedaluwarsa' : 
                     group.group_status === 'open' ? 'Terbuka' : 
                     group.group_status === 'paid_group' ? 'Lunas' :
                     group.group_status === 'full' || isGroupFull ? 'Penuh' : 'Aktif'}
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
              <div className="relative">
                <Button 
                  variant="outline"
                  onClick={() => setShowLeaveModal(true)}
                  title="Keluar dari Grup"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Broadcast Display */}
        {broadcasts.length > 0 && (
          <div className="mb-6 space-y-4">
            {broadcasts.map((broadcast, index) => (
              <motion.div
                key={broadcast.id}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-xl shadow-xl border border-orange-200 dark:border-orange-800">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400 dark:from-orange-500 dark:via-orange-600 dark:to-yellow-500"></div>
                  
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative p-6">
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/30">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-bold text-xl leading-tight">
                            {broadcast.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {/* Priority Badge */}
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                              broadcast.priority === 3 
                                ? 'bg-red-500/20 text-red-100 border border-red-400/30' 
                                : broadcast.priority === 2 
                                ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
                                : 'bg-green-500/20 text-green-100 border border-green-400/30'
                            }`}>
                              {broadcast.priority === 3 ? '🔴 URGENT' : 
                               broadcast.priority === 2 ? '🟡 HIGH' : '🟢 NORMAL'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Message */}
                        <p className="text-white/95 text-base leading-relaxed mb-4 font-medium">
                          {broadcast.message}
                        </p>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2 text-white/80">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">
                              {new Date(broadcast.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-white/70">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs">Made by Admin</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Border Accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-300 to-yellow-300 dark:from-orange-400 dark:to-yellow-400"></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

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
                {user?.role === 'admin' && (
                  <Badge variant="primary" className="ml-2 text-xs">
                    Admin
                  </Badge>
                )}
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
                className="flex flex-col h-96 sm:h-[500px]"
              >
                <Card className="flex-1 flex flex-col p-0 dark:bg-gray-800">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Chat Grup</h3>
                      {messages.length > 0 && (
                        <Badge variant="gray" className="text-xs">
                          {messages.length} pesan
                        </Badge>
                      )}
                      {autoRefreshEnabled && (
                        <Badge variant="success" className="text-xs">
                          Auto-refresh
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                        className="h-8 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                        title={autoRefreshEnabled ? "Disable auto-refresh" : "Enable auto-refresh"}
                      >
                        {autoRefreshEnabled ? "Auto ON" : "Auto OFF"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshMessages}
                        disabled={refreshingMessages}
                        className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="Refresh chat"
                      >
                        <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-gray-300 ${refreshingMessages ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef} 
                    className="h-72 sm:h-[380px] overflow-y-auto p-4 space-y-1 scroll-smooth relative bg-gray-50 dark:bg-gray-900"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundRepeat: 'repeat'
                    }}
                    onTouchStart={handlePullStart}
                    onTouchMove={handlePullMove}
                    onTouchEnd={handlePullEnd}
                  >
                    {/* Pull to refresh indicator */}
                    {pullStartY > 0 && (
                      <div 
                        className="absolute top-0 left-0 right-0 flex items-center justify-center py-2 bg-primary-50 dark:bg-primary-900/20 transition-all duration-200"
                        style={{
                          transform: `translateY(${Math.min(pullCurrentY - pullStartY, 60)}px)`,
                          opacity: pullToRefresh ? 1 : 0.5
                        }}
                      >
                        <RefreshCw className={`h-5 w-5 text-primary-600 ${pullToRefresh ? 'animate-spin' : ''}`} />
                        <span className="ml-2 text-sm text-primary-600 font-medium">
                          {pullToRefresh ? 'Lepas untuk refresh' : 'Tarik untuk refresh'}
                        </span>
                      </div>
                    )}
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
                      messages.map((message, index) => {
                        const messageDate = new Date(message.created_at)
                        const prevMessageDate = index > 0 ? new Date(messages[index - 1].created_at) : null
                        const showDateSeparator = !prevMessageDate || 
                          messageDate.toDateString() !== prevMessageDate.toDateString()
                        
                        return (
                          <div key={message.id}>
                            {/* Date Separator */}
                            {showDateSeparator && (
                              <div className="flex justify-center my-4">
                                <div className="bg-gray-500 dark:bg-gray-600 text-white text-xs px-3 py-1 rounded-full">
                                  {messageDate.toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* Message */}
                            <div className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'} mb-2`}>
                              <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl ${
                                message.user_id === user?.id
                                  ? 'bg-primary-600 text-white rounded-br-md'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                              }`}>
                                {/* Sender name for incoming messages */}
                                {message.user_id !== user?.id && (
                                  <div className="flex items-center space-x-2 mb-1">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
                                      {message.user.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                      {message.user.full_name}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Message content */}
                                <p className={`text-base leading-relaxed ${
                                  message.user_id === user?.id 
                                    ? 'text-white' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {message.message}
                                </p>
                                
                                {/* Timestamp */}
                                <div className={`flex items-center justify-end mt-1 ${
                                  message.user_id === user?.id ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  <span className="text-[10px] leading-none">
                                    {messageDate.toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Tulis pesan..."
                          disabled={sendingMessage}
                          className="w-full px-4 py-3 rounded-full border-2 border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                          style={{ minHeight: '44px' }}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        loading={sendingMessage}
                        className="w-11 h-11 rounded-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 p-0 flex items-center justify-center"
                      >
                        <Send className="h-5 w-5 text-white" />
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
                className="space-y-6"
              >
                {/* Deskripsi Grup */}
                {group?.description && (
                  <Card className="p-6 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-primary-600" />
                      Deskripsi Grup
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {group.description}
                    </p>
                  </Card>
                )}
                {/* Informasi User untuk Grup Patungan */}
                <Card className="p-6 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary-600" />
                      Informasi Akun Anda untuk Grup Patungan
                    </h3>
                    {/* Debug Button - Temporary */}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        checkEmailSubmissionStatus()
                      }}
                      className="text-xs"
                    >
                      🔧 Check Status ({emailSubmissionStatus || 'none'})
                    </Button>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Akun Anda yang akan didaftarkan
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Pastikan Anda sudah memiliki akun {group?.app?.name}.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sesuaikan Email anda untuk Grup Patungan akun {group?.app?.name}.
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <Input
                            value={getCurrentEmail()}
                            disabled
                            className="bg-gray-50 dark:bg-gray-700 font-mono text-sm pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowEmailSelector(!showEmailSelector)}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={copyEmail}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Email Selector Dropdown */}
                      {showEmailSelector && (
                        <div className="email-selector mt-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-lg z-10">
                          <div className="p-2">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                              Pilih email yang akan digunakan:
                            </div>
                            
                            {/* User Profile Email */}
                            <div
                              onClick={() => handleEmailSelection(user?.email || '')}
                              className={`p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                selectedEmail === user?.email ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user?.email}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Profil Anda
                                  </div>
                                </div>
                                {selectedEmail === user?.email && (
                                  <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />
                                )}
                              </div>
                            </div>

                            {/* Account Credentials Emails */}
                            {allAccountCredentials
                              .filter(cred => cred.email && cred.email !== user?.email)
                              .map((cred) => (
                                <div
                                  key={cred.id}
                                  onClick={() => handleEmailSelection(cred.email!)}
                                  className={`p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                    selectedEmail === cred.email ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {cred.email}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {cred.app?.name || 'Account Aplikasi'}
                                      </div>
                                    </div>
                                    {selectedEmail === cred.email && (
                                      <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />
                                    )}
                                  </div>
                                </div>
                              ))}

                            {/* Add New Email Option */}
                            <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                              <button
                                onClick={() => {
                                  setShowEmailSelector(false)
                                  router.push('/settings?tab=account-apps')
                                }}
                                className="w-full p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      + Tambah Email Baru
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Kelola Account Aplikasi
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Email Anda yang akan didaftarkan ke grup {group?.app?.name}
                        {accountCredentials?.email && (
                          <span className="text-blue-600 dark:text-blue-400 ml-1">
                            (dari Account Aplikasi)
                          </span>
                        )}
                        {!accountCredentials?.email && selectedEmail === user?.email && (
                          <span className="text-orange-600 dark:text-orange-400 ml-1">
                            (dari profil Anda)
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nama Lengkap Anda
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={getCurrentName()}
                          disabled
                          className="bg-gray-50 dark:bg-gray-700"
                        />
                        <Button variant="outline" size="sm" onClick={copyFullName}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Nama Anda yang akan ditampilkan di grup {group?.app?.name}
                        {accountCredentials?.username && (
                          <span className="text-blue-600 dark:text-blue-400 ml-1">
                            (dari Account Aplikasi)
                          </span>
                        )}
                        {!accountCredentials?.username && (
                          <span className="text-orange-600 dark:text-orange-400 ml-1">
                            (dari profil Anda)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Account Verification Status */}
                    <div className={`${
                      emailSubmissionStatus === 'approved' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                      emailSubmissionStatus === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      emailSubmissionStatus === 'submitted' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    } border rounded-lg p-4`}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 ${
                            emailSubmissionStatus === 'approved' ? 'bg-green-100 dark:bg-green-900' :
                            emailSubmissionStatus === 'rejected' ? 'bg-red-100 dark:bg-red-900' :
                            emailSubmissionStatus === 'submitted' ? 'bg-yellow-100 dark:bg-yellow-900' :
                            'bg-green-100 dark:bg-green-900'
                          } rounded-full flex items-center justify-center`}>
                            {emailSubmissionStatus === 'approved' ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : emailSubmissionStatus === 'rejected' ? (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            ) : emailSubmissionStatus === 'submitted' ? (
                              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium ${
                              emailSubmissionStatus === 'approved' ? 'text-green-900 dark:text-green-100' :
                              emailSubmissionStatus === 'rejected' ? 'text-red-900 dark:text-red-100' :
                              emailSubmissionStatus === 'submitted' ? 'text-yellow-900 dark:text-yellow-100' :
                              'text-green-900 dark:text-green-100'
                            }`}>
                              Status Akun Anda
                            </h4>
                            {emailSubmissionStatus && (
                              <Badge 
                                variant={
                                  emailSubmissionStatus === 'approved' ? 'success' : 
                                  emailSubmissionStatus === 'rejected' ? 'error' : 
                                  'warning'
                                }
                                className="text-xs"
                              >
                                {emailSubmissionStatus === 'approved' ? '✓ Disetujui' : 
                                 emailSubmissionStatus === 'rejected' ? '✗ Ditolak' : 
                                 emailSubmissionStatus === 'submitted' ? '⏳ Menunggu Review' : 
                                 'Status Tidak Diketahui'}
                              </Badge>
                            )}
                          </div>
                          <p className={`text-xs mb-2 ${
                            emailSubmissionStatus === 'approved' ? 'text-green-700 dark:text-green-300' :
                            emailSubmissionStatus === 'rejected' ? 'text-red-700 dark:text-red-300' :
                            emailSubmissionStatus === 'submitted' ? 'text-yellow-700 dark:text-yellow-300' :
                            'text-green-700 dark:text-green-300'
                          }`}>
                            Pastikan Anda sudah memiliki akun {group?.app?.name} dan terdaftar jika belum silahkan daftar terlebih dahulu.
                          </p>
                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span className="text-green-700 dark:text-green-300">
                                Email: {getCurrentEmail()}
                                {accountCredentials?.email && (
                                  <span className="text-blue-600 dark:text-blue-400 ml-1">(Account App)</span>
                                )}
                                {!accountCredentials?.email && selectedEmail === user?.email && (
                                  <span className="text-orange-600 dark:text-orange-400 ml-1">(Profil)</span>
                                )}
                                {emailSubmissionStatus === 'approved' && approvedEmail === getCurrentEmail() && (
                                  <span className="text-green-600 dark:text-green-400 ml-1 font-semibold"></span>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span className="text-green-700 dark:text-green-300">
                                Nama: {getCurrentName()}
                                {accountCredentials?.username && (
                                  <span className="text-blue-600 dark:text-blue-400 ml-1">(Account App)</span>
                                )}
                                {!accountCredentials?.username && (
                                  <span className="text-orange-600 dark:text-orange-400 ml-1">(Profil)</span>
                                )}
                              </span>
                            </div>
                          </div>
                          {/* Status Information */}
                          {emailSubmissionStatus === 'approved' && approvedEmail && (
                            <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded text-xs text-green-800 dark:text-green-200">
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="font-medium">Email yang disetujui: {approvedEmail}</span>
                              </div>
                              <div className="mt-1 text-green-700 dark:text-green-300">
                                💡 Ingin mengganti email? Klik "Ajukan Email Baru" di atas untuk mengajukan email yang berbeda.
                              </div>
                            </div>
                          )}
                          {emailSubmissionStatus === 'submitted' && approvedEmail && (
                            <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded text-xs text-blue-800 dark:text-blue-200">
                              <div className="flex items-center space-x-1 mb-1">
                                <Clock className="h-3 w-3 text-blue-600" />
                                <span className="font-medium">Email baru sedang diajukan: {getCurrentEmail()}</span>
                              </div>
                              <div className="text-blue-700 dark:text-blue-300">
                                Email sebelumnya yang disetujui: <span className="font-medium">{approvedEmail}</span>
                              </div>
                            </div>
                          )}
                          {emailSubmissionStatus === 'rejected' && rejectedEmail && (
                            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-xs text-red-800 dark:text-red-200">
                              <div className="flex items-center space-x-1">
                                <XCircle className="h-3 w-3 text-red-600" />
                                <span className="font-medium">Email yang ditolak: {rejectedEmail}</span>
                              </div>
                            </div>
                          )}
                          {emailSubmissionStatus === 'submitted' && (
                            <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-xs text-yellow-800 dark:text-yellow-200">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3 text-yellow-600" />
                                <span className="font-medium">Email sedang menunggu review admin</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">!</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                            Penting untuk Grup Patungan
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                            Jika Akun berbeda dengan akun SALOME, silahkan kelola akun anda di akun SALOME lalu ajukan email kembali.
                            {accountCredentials ? '' : ''}
                          </p>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push('/settings?tab=account-apps')}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                            >
                              Kelola Account Aplikasi →
                            </button>
                            {!emailSubmissionStatus && (
                              <Button
                                size="sm"
                                onClick={submitEmailForGroup}
                                disabled={submittingEmail}
                                className="text-xs px-2 py-1 h-6"
                              >
                                {submittingEmail ? 'Mengajukan...' : 'Ajukan Email'}
                              </Button>
                            )}
                            {emailSubmissionStatus === 'rejected' && (
                              <Button
                                size="sm"
                                onClick={submitEmailForGroup}
                                disabled={submittingEmail}
                                className="text-xs px-2 py-1 h-6 bg-red-600 hover:bg-red-700 text-white"
                              >
                                {submittingEmail ? 'Mengajukan...' : 'Ajukan Email Baru'}
                              </Button>
                            )}
                            {emailSubmissionStatus === 'approved' && (
                              <Button
                                size="sm"
                                onClick={submitEmailForGroup}
                                disabled={submittingEmail}
                                className="text-xs px-2 py-1 h-6 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {submittingEmail ? 'Mengajukan...' : 'Ajukan Email Baru'}
                              </Button>
                            )}
                          </div>
                          
                          {/* Status Email Submission - Tampilan Utama */}
                          {emailSubmissionStatus && (
                            <div className={`mt-3 p-3 rounded-lg border-2 ${
                              emailSubmissionStatus === 'submitted' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' :
                              emailSubmissionStatus === 'approved' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' :
                              emailSubmissionStatus === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' :
                              'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
                            }`}>
                              <div className="flex items-center space-x-2">
                                {emailSubmissionStatus === 'submitted' && (
                                  <>
                                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                      ⏳ Status: Menunggu Review Admin
                                    </span>
                                  </>
                                )}
                                {emailSubmissionStatus === 'approved' && (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                      ✅ Status: Email Disetujui
                                    </span>
                                  </>
                                )}
                                {emailSubmissionStatus === 'rejected' && (
                                  <>
                                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                                      ❌ Status: Email Ditolak
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                {emailSubmissionStatus === 'submitted' && (
                                  <>
                                    Email <strong className="text-yellow-700 dark:text-yellow-300">{getCurrentEmail()}</strong> berhasil diajukan! Admin akan meninjau pengajuan Anda.
                                    {approvedEmail && (
                                      <div className="mt-1 text-gray-500 dark:text-gray-400">
                                        Email sebelumnya yang disetujui: <strong>{approvedEmail}</strong>
                                      </div>
                                    )}
                                  </>
                                )}
                                {emailSubmissionStatus === 'approved' && approvedEmail && (
                                  <>Email <strong className="text-green-700 dark:text-green-300">{approvedEmail}</strong> telah disetujui! Anda dapat bergabung ke grup patungan.</>
                                )}
                                {emailSubmissionStatus === 'rejected' && rejectedEmail && (
                                  <>Email <strong className="text-red-700 dark:text-red-300">{rejectedEmail}</strong> ditolak. Silakan ajukan email lain atau kelola akun aplikasi Anda.</>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Daftar Anggota */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Daftar Anggota ({members.length}/{group?.max_members})
                  </h3>
                  
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
                              {formatCurrency(member.price_per_member + 3500)}
                            </p>
                            <Badge 
                              variant={
                                member.user_status === 'paid' ? 'success' : 
                                member.user_status === 'active' ? 'warning' : 
                                'warning'
                              }
                            >
                              {member.user_status === 'paid' ? 'Lunas' : 
                               member.user_status === 'active' ? 'Menunggu Pembayaran' : 
                               'Pending'}
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
                </div>
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
                {/* Informasi User untuk Grup Patungan */}
                {/* <Card className="p-6 dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-primary-600" />
                    Informasi User untuk Grup Patungan
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Email yang akan didaftarkan
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Email dan nama ini akan digunakan untuk mendaftarkan akun grup patungan ke aplikasi {group?.app?.name}.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email untuk Pendaftaran
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={group?.owner?.email || user?.email || ''}
                          disabled
                          className="bg-gray-50 dark:bg-gray-700 font-mono text-sm"
                        />
                        <Button variant="outline" size="sm" onClick={copyEmail}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Email ini akan digunakan untuk membuat akun {group?.app?.name}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nama Lengkap
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={group?.owner?.full_name || user?.full_name || ''}
                          disabled
                          className="bg-gray-50 dark:bg-gray-700"
                        />
                        <Button variant="outline" size="sm" onClick={copyFullName}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Nama yang akan ditampilkan di akun {group?.app?.name}
                      </p>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">!</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                            Penting untuk Grup Patungan
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            Pastikan email dan nama di atas valid dan dapat diakses. Informasi ini akan digunakan untuk mendaftarkan akun grup ke {group?.app?.name}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card> */}

                {/* Pengaturan Grup */}
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
                    <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleEditGroup}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Grup
                      </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 text-orange-600 hover:text-orange-700"
                          onClick={() => setShowTransferModal(true)}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Transfer Kepemilikan
                        </Button>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                                Zona Bahaya
                              </h4>
                              <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                                Menghapus grup akan menghentikan semua aktivitas dan mengeluarkan semua anggota. 
                                Tindakan ini tidak dapat dibatalkan.
                              </p>
                              <Button 
                                variant="outline" 
                                className="w-full text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                onClick={() => setShowDeleteModal(true)}
                              >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus Grup
                      </Button>
                            </div>
                          </div>
                        </div>
                      </div>
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
                      group?.group_status === 'open' ? 'primary' : 
                      group?.group_status === 'paid_group' ? 'success' :
                      group?.group_status === 'full' || isGroupFull ? 'warning' : 'primary'
                    }
                  >
                    {isExpired ? 'Kedaluwarsa' : 
                     group?.group_status === 'open' ? 'Terbuka' : 
                     group?.group_status === 'paid_group' ? 'Lunas' :
                     group?.group_status === 'full' || isGroupFull ? 'Penuh' : 'Aktif'}
                  </Badge>
                </div>

                {/* Jumlah Anggota */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Anggota</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {group?.current_members || 0} / {group?.max_members || 0}
                  </span>
                </div>

                {/* Paid Members Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total yang Sudah Bayar</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {paidMembersCount} / {group?.max_members || 0}
                  </span>
                </div>

                {/* Total Aplikasi */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Aplikasi</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(group?.total_price || 0)}
                  </span>
                </div>

                {/* Biaya Admin */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Biaya Admin</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(group?.admin_fee || 0)}
                  </span>
                </div>

                {/* Harga per Anggota */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Harga per Anggota</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {formatCurrency((group?.price_per_member || 0) + (group?.admin_fee || 0))}
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
                {!isMember && group.group_status === 'open' && (
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

        {/* Transfer Ownership Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Transfer Kepemilikan Grup
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTransferModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                        Peringatan
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        Setelah transfer kepemilikan, Anda akan menjadi admin dan tidak dapat mengembalikan status owner.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pilih Member Baru sebagai Owner
                  </label>
                  <select
                    value={selectedNewOwner}
                    onChange={(e) => setSelectedNewOwner(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Pilih member...</option>
                    {members
                      .filter(member => member.user_id !== user?.id && member.user_status === 'active')
                      .map(member => (
                        <option key={member.id} value={member.user_id}>
                          {member.user?.full_name} ({member.user?.email})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTransferModal(false)}
                  disabled={transferring}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleTransferOwnership}
                  disabled={!selectedNewOwner || transferring}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {transferring ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <UserCheck className="h-4 w-4 mr-2" />
                  )}
                  {transferring ? 'Transfer...' : 'Transfer Kepemilikan'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Delete Group Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Hapus Grup
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                        Apakah Anda yakin ingin menghapus grup ini?
                      </h4>
                      <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                        <li>• Semua anggota akan dikeluarkan dari grup</li>
                        <li>• Semua pesan dan data grup akan dihapus</li>
                        <li>• Tindakan ini tidak dapat dibatalkan</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Nama Grup:</strong> {group?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Jumlah Member:</strong> {group?.current_members || 0} orang
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDeleteGroup}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {deleting ? 'Menghapus...' : 'Ya, Hapus Grup'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Edit Group Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Grup
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Grup
                  </label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Masukkan nama grup"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deskripsi Grup
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Masukkan deskripsi grup"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleUpdateGroup}
                  disabled={editing || !editForm.name.trim()}
                  className="flex-1"
                >
                  {editing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Edit className="h-4 w-4 mr-2" />
                  )}
                  {editing ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Leave Group Modal */}
        {showLeaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Keluar dari Grup
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLeaveModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                        Peringatan
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        {isOwner 
                          ? "Sebagai owner, Anda tidak bisa keluar dari grup. Transfer kepemilikan terlebih dahulu atau hapus grup."
                          : "Setelah keluar dari grup, Anda tidak akan bisa mengakses grup ini lagi dan harus bergabung ulang jika ingin kembali."
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Apakah Anda yakin ingin keluar dari grup <strong>{group?.name}</strong>?
                </p>
              </div>

              <div className="flex space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleLeaveGroup}
                  disabled={leaving || isOwner}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {leaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  {leaving ? 'Keluar...' : 'Ya, Keluar'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
