'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, Loader2, User, MessageSquare, ChevronDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { chatAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

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
  created_at: string
  updated_at: string
}

const ChatWidget: React.FC = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [anonymousName, setAnonymousName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const chatWidgetRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollButton(false)
  }

  // Play notification sound
  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      // Fallback: just log to console
      console.log('🔔 New message notification')
    }
  }

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50
      setShowScrollButton(!isNearBottom)
    }
  }

  // Count unread messages (admin messages that user hasn't seen)
  const countUnreadMessages = (messages: ChatMessage[]) => {
    const lastSeenTime = localStorage.getItem('last_seen_message_time') || '0'
    return messages.filter(msg => 
      msg.sender_type === 'admin' && 
      msg.created_at > lastSeenTime
    ).length
  }

  // Load existing chat or create new one
  useEffect(() => {
    const loadOrCreateChat = async () => {
      setIsLoading(true)
      try {
        if (user) {
          // Try to find an existing open chat for the user
          const userChatsResponse = await chatAPI.getUserChats()
          const chats = userChatsResponse.data.chats || []
          const openChat = chats.find((chat: Chat) => chat.status === 'open')
          if (openChat) {
            setCurrentChat(openChat)
            const messagesResponse = await chatAPI.getChatMessages(openChat.id)
            const messages = messagesResponse.data.messages || []
            setMessages(messages)
            const unread = countUnreadMessages(messages)
            setUnreadCount(unread)
            if (unread > 0) {
              setHasNewMessage(true)
            }
          }
        } else {
          // For anonymous users, try to retrieve chat_id from local storage
          const storedChatId = localStorage.getItem('anonymous_chat_id')
          if (storedChatId) {
            try {
              const messagesResponse = await chatAPI.getChatMessages(storedChatId)
              const messages = messagesResponse.data.messages || []
              setCurrentChat({ id: storedChatId, status: 'open', created_at: '', updated_at: '' })
              setMessages(messages)
              const unread = countUnreadMessages(messages)
              setUnreadCount(unread)
              if (unread > 0) {
                setHasNewMessage(true)
              }
            } catch (error) {
              console.error('Stored anonymous chat ID invalid or expired:', error)
              localStorage.removeItem('anonymous_chat_id')
            }
          }
        }
      } catch (error) {
        console.error('Failed to load or create chat:', error)
        toast.error('Gagal memuat chat.')
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      loadOrCreateChat()
    }
  }, [isOpen, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Poll for new messages when chat is not open
  useEffect(() => {
    if (!currentChat || isOpen) return

    const pollForNewMessages = async () => {
      try {
        const messagesResponse = await chatAPI.getChatMessages(currentChat.id)
        const newMessages = messagesResponse.data.messages || []
        
        // Check if there are new messages
        if (newMessages.length > messages.length) {
          const latestMessage = newMessages[newMessages.length - 1]
          
          // If latest message is from admin, show notification
          if (latestMessage.sender_type === 'admin') {
            setHasNewMessage(true)
            playNotificationSound()
          }
          
          setMessages(newMessages)
          setUnreadCount(countUnreadMessages(newMessages))
        }
      } catch (error) {
        console.error('Error polling for new messages:', error)
      }
    }

    // Poll for new messages using configurable interval
    const pollingInterval = parseInt(process.env.NEXT_PUBLIC_CHAT_POLLING_INTERVAL || '10000')
    console.log(`Starting polling every ${pollingInterval}ms for chat:`, currentChat.id)
    const interval = setInterval(pollForNewMessages, pollingInterval)
    
    return () => clearInterval(interval)
  }, [currentChat, isOpen, messages])

  // Update unread count when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setUnreadCount(countUnreadMessages(messages))
    }
  }, [messages])

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      if (latestMessage) {
        localStorage.setItem('last_seen_message_time', latestMessage.created_at)
        setUnreadCount(0)
        setHasNewMessage(false)
      }
    }
  }, [isOpen, messages])

  // Handle click outside to close chat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatWidgetRef.current && !chatWidgetRef.current.contains(event.target as Node)) {
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

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      let chatToUse = currentChat

      if (!chatToUse) {
        // Create new chat if none exists
        if (!user && !anonymousName.trim()) {
          toast.error('Nama anonim diperlukan untuk memulai chat.')
          setIsSending(false)
          return
        }
        const createChatResponse = await chatAPI.createChat(newMessage, user ? undefined : anonymousName)
        chatToUse = createChatResponse.data.chat
        setCurrentChat(chatToUse)
        if (!user && chatToUse) {
          localStorage.setItem('anonymous_chat_id', chatToUse.id)
        }
        if (createChatResponse.data.chat.last_message && chatToUse) {
          setMessages([createChatResponse.data.chat.last_message])
          
          // Notify admin about new chat and message
          const event = new CustomEvent('newUserMessage', {
            detail: {
              chatId: chatToUse.id,
              message: createChatResponse.data.chat.last_message
            }
          })
          window.dispatchEvent(event)
        }
      } else {
        // Send message to existing chat
        const sendMessageResponse = await chatAPI.sendMessage(chatToUse.id, newMessage)
        setMessages((prevMessages) => [...prevMessages, sendMessageResponse.data.message])
        
        // Notify admin about new message
        const event = new CustomEvent('newUserMessage', {
          detail: {
            chatId: chatToUse.id,
            message: sendMessageResponse.data.message
          }
        })
        window.dispatchEvent(event)
      }

      setNewMessage('')
    } catch (error: any) {
      console.error('Failed to send message:', error)
      toast.error(error.response?.data?.error || 'Gagal mengirim pesan.')
    } finally {
      setIsSending(false)
    }
  }

  const refreshMessages = async () => {
    if (!currentChat) return
    
    try {
      setIsRefreshing(true)
      const response = await chatAPI.getChatMessages(currentChat.id)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Failed to refresh messages:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const getSenderName = (message: ChatMessage) => {
    if (message.sender_type === 'admin') return 'Admin'
    if (message.sender_type === 'user' && user) return user.full_name || user.email
    if (message.sender_type === 'anonymous' && currentChat?.anonymous_name) return currentChat.anonymous_name
    return 'Pengguna'
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWidgetRef}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-20 right-4 w-80 md:w-96 bg-gray-800 dark:bg-gray-800 rounded-lg shadow-lg flex flex-col h-[600px] max-h-[600px] z-40"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-1">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">SALOME</h3>
                  <p className="text-xs text-blue-100">• Beberapa menit</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshMessages}
                  disabled={isRefreshing || !currentChat}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh pesan"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

             {/* Messages Area */}
             <div 
               ref={messagesContainerRef}
               onScroll={handleScroll}
               className="flex-1 overflow-y-auto bg-gray-800 dark:bg-gray-900 relative scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" 
               style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                 backgroundSize: '20px 20px',
                 maxHeight: '450px',
                 minHeight: '450px'
               }}
             >
               <div className="p-4 space-y-4">
                 {isLoading ? (
                   <div className="flex justify-center items-center h-full min-h-[250px]">
                     <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                   </div>
                 ) : (
                   <>
                     {/* Welcome Message */}
                     <div className="text-left">
                       <div className="bg-gray-700 rounded-lg p-3 max-w-xs shadow-sm">
                         <div className="flex items-center mb-2">
                           <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                             <span className="text-xs font-bold text-white">S</span>
                           </div>
                           <p className="text-xs font-semibold text-white opacity-90">SALOME</p>
                         </div>
                         <p className="text-sm text-white">
                           Selamat Datang di SALOME. Kami siap membantu semua kebutuhan bisnis anda.
                         </p>
                         <p className="text-xs text-gray-300 mt-2">10.27</p>
                       </div>
                     </div>

                     {/* User Messages */}
                     {messages.map((message) => (
                       <div
                         key={message.id}
                         className={`flex ${message.sender_type === 'admin' ? 'justify-start' : 'justify-end'} mb-4`}
                       >
                         <div
                           className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                             message.sender_type === 'admin'
                               ? 'bg-gray-700 text-white'
                               : 'bg-blue-500 text-white'
                           }`}
                         >
                           <div className="flex items-center mb-2">
                             <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center mr-2">
                               <span className="text-xs font-bold text-white">T</span>
                             </div>
                             <p className="text-xs font-semibold opacity-90">
                               {getSenderName(message)}
                             </p>
                           </div>
                           <p className="text-sm leading-relaxed mb-2">{message.content}</p>
                           <p className="text-xs text-right opacity-70">
                             {format(new Date(message.created_at), 'HH.mm', { locale: id })}
                           </p>
                         </div>
                       </div>
                     ))}
                     <div ref={messagesEndRef} />
                   </>
                 )}
               </div>
               
               {/* Scroll to Bottom Button */}
               {showScrollButton && (
                 <motion.button
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   onClick={scrollToBottom}
                   className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 z-10"
                   title="Scroll ke bawah"
                 >
                   <ChevronDown className="h-4 w-4" />
                 </motion.button>
               )}
             </div>

            {/* Message Input Area */}
            <div className="p-4 border-t border-gray-600 bg-gray-800 dark:bg-gray-800 flex-shrink-0">
              {!user && !currentChat && (
                <div className="mb-4">
                  <Input
                    type="text"
                    placeholder="Nama Anda (Anonim)"
                    value={anonymousName}
                    onChange={(e) => setAnonymousName(e.target.value)}
                    className="w-full text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tulis pesan..."
                    className="w-full text-sm bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-full px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    disabled={isSending || isLoading || (currentChat === null && !user && !anonymousName.trim())}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || isLoading || (currentChat === null && !user && !anonymousName.trim())}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          whileHover={{ 
            scale: 1.2, 
            rotate: [0, 10, -10, 5, -5, 0],
            y: [0, -5, 5, -2, 2, 0],
            x: [0, 3, -3, 1, -1, 0]
          }}
          whileTap={{ 
            scale: 0.9, 
            rotate: -15,
            y: 2
          }}
          animate={hasNewMessage ? {
            scale: [1, 1.15, 1.05, 1.2, 1.1, 1.15, 1],
            rotate: [0, 15, -15, 10, -10, 5, -5, 0],
            y: [0, -8, 8, -5, 5, -3, 3, 0],
            x: [0, 5, -5, 3, -3, 2, -2, 0],
            boxShadow: [
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              "0 30px 60px -12px rgba(59, 130, 246, 0.6), 0 0 0 2px rgba(59, 130, 246, 0.3)",
              "0 25px 50px -12px rgba(255, 193, 7, 0.5), 0 0 0 1px rgba(255, 193, 7, 0.2)",
              "0 35px 70px -12px rgba(255, 87, 34, 0.4), 0 0 0 1px rgba(255, 87, 34, 0.1)",
              "0 30px 60px -12px rgba(59, 130, 246, 0.6), 0 0 0 2px rgba(59, 130, 246, 0.3)",
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            ]
          } : {}}
          transition={hasNewMessage ? {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
          onClick={toggleChat}
          className="relative bg-blue-600 text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:focus:ring-blue-600"
        >
          {isOpen ? (
            <motion.div
              animate={{ 
                rotate: [0, 180, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 0.5,
                ease: "easeInOut"
              }}
            >
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              animate={hasNewMessage ? {
                scale: [1, 1.3, 1.1, 1.4, 1.2, 1.3, 1],
                rotate: [0, 15, -15, 20, -20, 10, -10, 5, -5, 0],
                y: [0, -4, 4, -6, 6, -3, 3, -2, 2, 0],
                x: [0, 3, -3, 5, -5, 2, -2, 1, -1, 0]
              } : {}}
              transition={hasNewMessage ? {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              } : {}}
            >
              <motion.div
                animate={hasNewMessage ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
            </motion.div>
          )}
          {!isOpen && (unreadCount > 0 || hasNewMessage) && (
            <motion.div
              initial={{ scale: 0, rotate: -180, y: -30, x: 20 }}
              animate={{ 
                scale: [0, 1.5, 1.2, 1.4, 1.1, 1.3, 1.2, 1],
                rotate: [-180, 0, 15, -15, 10, -10, 5, -5, 0],
                y: [-30, 0, -5, 5, -8, 8, -3, 3, -1, 1, 0],
                x: [20, 0, 4, -4, 6, -6, 2, -2, 1, -1, 0]
              }}
              transition={{ 
                type: "spring",
                stiffness: 800,
                damping: 10,
                scale: {
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                },
                y: {
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                },
                x: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center z-10 border-3 border-white ring-2 ring-red-300"
            >
              <motion.span 
                animate={hasNewMessage ? {
                  scale: [1, 1.3, 1.1, 1.4, 1.2, 1.3, 1],
                  color: ["#ffffff", "#ffeb3b", "#ff9800", "#ff5722", "#ffeb3b", "#ffffff"],
                  textShadow: [
                    "0 0 0px rgba(255,255,255,0)",
                    "0 0 10px rgba(255,235,59,0.8)",
                    "0 0 20px rgba(255,152,0,0.6)",
                    "0 0 15px rgba(255,87,34,0.8)",
                    "0 0 10px rgba(255,235,59,0.8)",
                    "0 0 0px rgba(255,255,255,0)"
                  ]
                } : {}}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-lg font-black text-white drop-shadow-lg"
              >
                {unreadCount > 0 ? unreadCount : '!'}
              </motion.span>
            </motion.div>
          )}
          {!isOpen && hasNewMessage && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 2, 1.5, 1.8, 1.2, 1.6, 1],
                opacity: [0, 1, 0.9, 0.8, 0.9, 0.7, 1],
                rotate: [0, 180, 360, 540, 720],
                y: [0, -10, 10, -5, 5, 0],
                x: [0, 5, -5, 3, -3, 0]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.2,
                ease: "easeInOut"
              }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-2xl z-0"
            />
          )}
          {!isOpen && hasNewMessage && (
            <motion.div
              animate={{ 
                scale: [1, 2.5, 2, 2.2, 1.8, 2, 1],
                opacity: [0.9, 0, 0.7, 0, 0.5, 0, 0.9],
                rotate: [0, 90, 180, 270, 360, 450, 540],
                y: [0, -15, 15, -8, 8, -3, 3, 0],
                x: [0, 8, -8, 5, -5, 2, -2, 0]
              }}
              transition={{ 
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full shadow-2xl z-0"
            />
          )}
          {!isOpen && hasNewMessage && (
            <motion.div
              animate={{ 
                scale: [1, 3, 2.5, 2.8, 2.2, 2.5, 1],
                opacity: [0.7, 0, 0.5, 0, 0.3, 0, 0.7],
                rotate: [0, -90, -180, -270, -360, -450, -540],
                y: [0, -20, 20, -12, 12, -6, 6, 0],
                x: [0, 12, -12, 8, -8, 4, -4, 0]
              }}
              transition={{ 
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full shadow-2xl z-0"
            />
          )}
          {!isOpen && hasNewMessage && (
            <motion.div
              animate={{ 
                scale: [1, 3.5, 3, 3.2, 2.8, 3, 1],
                opacity: [0.5, 0, 0.3, 0, 0.2, 0, 0.5],
                rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360, 405, 450],
                y: [0, -25, 25, -15, 15, -8, 8, -4, 4, 0],
                x: [0, 15, -15, 10, -10, 6, -6, 3, -3, 0]
              }}
              transition={{ 
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7
              }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full shadow-2xl z-0"
            />
          )}
          {!isOpen && hasNewMessage && (
            <motion.div
              animate={{ 
                scale: [1, 4, 3.5, 3.8, 3.2, 3.5, 1],
                opacity: [0.3, 0, 0.2, 0, 0.1, 0, 0.3],
                rotate: [0, -45, -90, -135, -180, -225, -270, -315, -360, -405, -450],
                y: [0, -30, 30, -20, 20, -12, 12, -6, 6, -3, 3, 0],
                x: [0, 18, -18, 12, -12, 8, -8, 4, -4, 2, -2, 0]
              }}
              transition={{ 
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.9
              }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full shadow-2xl z-0"
            />
          )}
          {!isOpen && hasNewMessage && (
            <motion.div
              animate={{ 
                scale: [1, 5, 4, 4.5, 3.8, 4, 1],
                opacity: [0.2, 0, 0.1, 0, 0.05, 0, 0.2],
                rotate: [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600],
                y: [0, -35, 35, -25, 25, -15, 15, -8, 8, -4, 4, 0],
                x: [0, 22, -22, 15, -15, 10, -10, 6, -6, 3, -3, 0]
              }}
              transition={{ 
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.1
              }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-red-300 to-red-400 rounded-full shadow-2xl z-0"
            />
          )}
          {!isOpen && hasNewMessage && (
            <motion.div
              animate={{ 
                scale: [1, 6, 5, 5.5, 4.8, 5, 1],
                opacity: [0.1, 0, 0.05, 0, 0.02, 0, 0.1],
                rotate: [0, -60, -120, -180, -240, -300, -360, -420, -480, -540, -600],
                y: [0, -40, 40, -30, 30, -20, 20, -12, 12, -6, 6, 0],
                x: [0, 25, -25, 18, -18, 12, -12, 8, -8, 4, -4, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.3
              }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full shadow-2xl z-0"
            />
          )}
        </motion.button>
      </div>
    </>
  )
}

export default ChatWidget
