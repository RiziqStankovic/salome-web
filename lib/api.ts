import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - removed to prevent automatic reloads

// API endpoints
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, fullName: string, whatsappNumber: string) => 
    api.post('/auth/register', { email, password, full_name: fullName, whatsapp_number: whatsappNumber }),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (data: any) => 
    api.put('/auth/profile', data),
  
  changePassword: (newPassword: string, otpCode: string) => 
    api.put('/auth/change-password', { new_password: newPassword, otp_code: otpCode }),
  
  resetPassword: (email: string, newPassword: string, otpCode: string) => 
    api.put('/auth/reset-password', { email, new_password: newPassword, otp_code: otpCode }),
  
  getStats: () => 
    api.get('/auth/stats'),
  
  changeEmail: (newEmail: string) => 
    api.post('/auth/change-email', { new_email: newEmail }),
  
  verifyEmailChange: (otpCode: string) => 
    api.post('/auth/verify-email-change', { otp_code: otpCode }),
  
  recalculateTotalSpent: () => 
    api.post('/auth/recalculate-total-spent'),
  
  recalculateUserTotalSpent: () => 
    api.post('/auth/recalculate-user-total-spent'),
}

export const chatAPI = {
  createChat: (content: string, anonymousName?: string) =>
    api.post('/chats', { content, anonymous_name: anonymousName }),
  getUserChats: () =>
    api.get('/user-chats'),
  getChatMessages: (id: string) =>
    api.get(`/chats/${id}/messages`),
  sendMessage: (id: string, content: string) =>
    api.post(`/chats/${id}/messages`, { content }),
  
  // Admin APIs
  getAllChats: () =>
    api.get('/admin/chats'),
  sendMessageAsAdmin: (id: string, content: string) =>
    api.post(`/admin/chats/${id}/messages`, { content }),
  updateChatStatus: (id: string, status: string) =>
    api.put(`/admin/chats/${id}/status`, { status }),
  markChatAsRead: (id: string) =>
    api.put(`/admin/chats/${id}/read`),
  markChatAsUnread: (id: string) =>
    api.put(`/admin/chats/${id}/unread`),
  sendBroadcast: (content: string, userIDs?: string[]) =>
    api.post('/admin/chats/broadcast', { content, user_ids: userIDs }),
}

export const userBroadcastAPI = {
  // Get all user broadcasts with pagination and filters
  getUserBroadcasts: (params?: {
    page?: number
    page_size?: number
    status?: string
    search?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params?.status) searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)
    
    const queryString = searchParams.toString()
    return api.get(`/admin/user-broadcasts${queryString ? `?${queryString}` : ''}`)
  },
  
  // Create new user broadcast
  createUserBroadcast: (data: {
    title: string
    message: string
    target_type: 'all' | 'selected'
    priority: 'low' | 'normal' | 'high'
    scheduled_at?: string
    end_date?: string
    user_ids?: string[]
  }) =>
    api.post('/admin/user-broadcasts', data),
  
  // Get single user broadcast
  getUserBroadcast: (id: string) =>
    api.get(`/admin/user-broadcasts/${id}`),
  
  // Update user broadcast
  updateUserBroadcast: (id: string, data: {
    title?: string
    message?: string
    target_type?: 'all' | 'selected'
    priority?: 'low' | 'normal' | 'high'
    scheduled_at?: string
    end_date?: string
    status?: 'draft' | 'scheduled' | 'sent' | 'cancelled'
    user_ids?: string[]
  }) =>
    api.put(`/admin/user-broadcasts/${id}`, data),
  
  // Delete user broadcast
  deleteUserBroadcast: (id: string) =>
    api.delete(`/admin/user-broadcasts/${id}`),
  
  // Send user broadcast
  sendUserBroadcast: (id: string) =>
    api.post(`/admin/user-broadcasts/${id}/send`),
}

export const userBroadcastUserAPI = {
  // Get broadcasts for user dashboard
  getUserBroadcasts: () =>
    api.get('/user-broadcasts'),
}

export const otpAPI = {
  generate: (email: string, purpose: 'email_verification' | 'password_reset' | 'login_verification') =>
    api.post('/otp/generate', { email, purpose }),
  
  verify: (email: string, otp_code: string, purpose: 'email_verification' | 'password_reset' | 'login_verification') =>
    api.post('/otp/verify', { email, otp_code, purpose }),
  
  resend: (email: string, purpose: 'email_verification' | 'password_reset' | 'login_verification') =>
    api.post('/otp/resend', { email, purpose }),
}

export const groupAPI = {
  createGroup: (data: any) => 
    api.post('/groups', data),
  
  joinGroup: (inviteCode: string) => 
    api.post('/groups/join', { invite_code: inviteCode }),
  
  getUserGroups: () => 
    api.get('/groups'),
  
  getGroupDetails: (groupId: string) => 
    api.get(`/groups/${groupId}`),
  
  getPublicGroups: (params?: {
    page?: number
    page_size?: number
    app_id?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params?.app_id) searchParams.append('app_id', params.app_id)
    
    const queryString = searchParams.toString()
    return api.get(`/public-groups${queryString ? `?${queryString}` : ''}`)
  },
  
  getGroupByInviteCode: (inviteCode: string) => 
    api.get(`/public-groups/invite/${inviteCode}`),
  
  updateGroup: (groupId: string, data: any) => 
    api.put(`/groups/${groupId}`, data),
  
  deleteGroup: (groupId: string) => 
    api.delete(`/groups/${groupId}`),
  
  removeMember: (groupId: string, userId: string) => 
    api.delete(`/groups/${groupId}/members/${userId}`),
  
  leaveGroup: (groupId: string) => 
    api.delete(`/groups/${groupId}/leave`),
  
  getGroupMembers: (groupId: string) => 
    api.get(`/groups/${groupId}/members`),
  
  transferOwnership: (groupId: string, data: {
    new_owner_id: string
  }) => 
    api.put(`/groups/${groupId}/transfer-ownership`, data),
  
  getGroupCreationLimit: () => 
    api.get('/groups/creation-limit'),
}

export const subscriptionAPI = {
  createSubscription: (groupId: string, data: any) => 
    api.post(`/subscriptions/groups/${groupId}`, data),
  
  getGroupSubscriptions: (groupId: string) => 
    api.get(`/subscriptions/groups/${groupId}`),
  
  addSubscriptionShare: (subscriptionId: string, data: any) => 
    api.post(`/subscriptions/${subscriptionId}/shares`, data),
  
  getSubscriptionShares: (subscriptionId: string) => 
    api.get(`/subscriptions/${subscriptionId}/shares`),
  
  updateSubscription: (subscriptionId: string, data: any) => 
    api.put(`/subscriptions/${subscriptionId}`, data),
  
  deleteSubscription: (subscriptionId: string) => 
    api.delete(`/subscriptions/${subscriptionId}`),
}

export const paymentAPI = {
  createPayment: (data: any) => 
    api.post('/payments', data),
  
  createGroupPaymentLink: (data: {
    group_id: string
    amount: number
  }) => 
    api.post('/payments/group-payment-link', data),
  
  getUserPayments: () => 
    api.get('/payments'),
  
  getPaymentDetails: (paymentId: string) => 
    api.get(`/payments/${paymentId}`),
}

export const appAPI = {
  getApps: (params?: {
    page?: number
    page_size?: number
    category?: string
    q?: string
    popular?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params?.category) searchParams.append('category', params.category)
    if (params?.q) searchParams.append('q', params.q)
    if (params?.popular) searchParams.append('popular', params.popular.toString())
    
    const queryString = searchParams.toString()
    return api.get(`/apps${queryString ? `?${queryString}` : ''}`)
  },
  
  getAppById: (appId: string) => 
    api.get(`/apps/${appId}`),
  
  getAppCategories: () => 
    api.get('/apps/categories'),
  
  getPopularApps: (limit?: number) => {
    const params = limit ? `?limit=${limit}` : ''
    return api.get(`/apps/popular${params}`)
  },
  
  seedApps: () => 
    api.post('/apps/seed'),
}

export const messageAPI = {
  getGroupMessages: (groupId: string, params?: {
    page?: number
    page_size?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    
    const queryString = searchParams.toString()
    return api.get(`/messages/groups/${groupId}${queryString ? `?${queryString}` : ''}`)
  },
  
  createGroupMessage: (groupId: string, data: {
    message: string
    message_type?: string
  }) => 
    api.post(`/messages/groups/${groupId}`, data),
}

export const transactionAPI = {
  getUserTransactions: (params?: {
    page?: number
    page_size?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    
    const queryString = searchParams.toString()
    return api.get(`/transactions${queryString ? `?${queryString}` : ''}`)
  },
  
  createTransaction: (data: {
    group_id?: string
    type: string
    amount: number
    description: string
    payment_method?: string
    payment_reference?: string
  }) => 
    api.post('/transactions', data),
  
  topUpBalance: (data: {
    amount: number
    method: string
    reference?: string
  }) => 
    api.post('/transactions/top-up', data),
}

// Account Credentials API endpoints
export const accountCredentialsAPI = {
  getUserAccountCredentials: () => 
    api.get('/account-credentials'),
  
  createOrUpdateAccountCredentials: (data: {
    app_id: string
    username?: string
    email?: string
  }) => 
    api.post('/account-credentials', data),
  
  getAccountCredentialsByApp: (appId: string) => 
    api.get(`/account-credentials/app/${appId}`),
}

// Email Submissions API endpoints
export const emailSubmissionsAPI = {
  createEmailSubmission: (data: {
    group_id: string
    app_id: string
    email: string
    username?: string
    full_name: string
  }) => 
    api.post('/email-submissions', data),
  
  getEmailSubmission: (id: string) => 
    api.get(`/email-submissions/${id}`),
  
  getEmailSubmissions: (group_id: string) => 
    api.get(`/email-submissions?group_id=${group_id}`),
}

// Admin API endpoints
export const adminAPI = {
  // Email submissions
  getEmailSubmissions: (params?: {
    page?: number
    page_size?: number
    status?: string
    search?: string
  }) => 
    api.get('/admin/email-submissions', { params }),
  
  updateEmailSubmissionStatus: (id: string, data: {
    status: 'approved' | 'rejected'
    notes?: string
  }) => 
    api.put(`/admin/email-submissions/${id}/status`, data),
  
  // Users management
  getUsers: (params?: {
    page?: number
    page_size?: number
    status?: string
    search?: string
  }) => 
    api.get('/admin/users', { params }),
  
  updateUserStatus: (data: {
    user_id: string
    new_status: string
    removed_reason?: string
  }) => 
    api.put('/admin/users/status', data),
  
  // Groups management
  getGroups: (params?: {
    page?: number
    page_size?: number
    status?: string
    search?: string
  }) => 
    api.get('/admin/groups', { params }),
  
  // Subscriptions management
  getSubscriptions: (params?: {
    page?: number
    page_size?: number
    search?: string
  }) => 
    api.get('/admin/subscriptions', { params }),
  
  updateGroupStatus: (data: {
    group_id: string
    new_status: string
    removed_reason?: string
  }) => 
    api.put('/admin/groups/status', data),
  
  // CRUD operations for groups
  createGroup: (data: {
    name: string
    description?: string
    app_id: string
    max_members: number
    is_public?: boolean
    owner_id: string
  }) => 
    api.post('/admin/groups', data),
  
  updateGroup: (data: {
    group_id: string
    name: string
    description?: string
    app_id: string
    max_members: number
    is_public?: boolean
    status?: string
    group_status?: string
  }) => 
    api.put('/admin/groups', data),
  
  deleteGroup: (data: {
    group_id: string
  }) => 
    api.delete('/admin/groups', { data }),
  
  // Helper APIs for dropdowns
  getUsersForDropdown: () => 
    api.get('/admin/users?page=1&page_size=1000'),
  
  getAppsForDropdown: () => 
    api.get('/admin/apps?page=1&page_size=1000'),
  
  // Group members management
  getGroupMembers: (groupId: string) => 
    api.get(`/admin/groups/${groupId}/members`),
  
  changeGroupOwner: (data: {
    group_id: string
    new_owner_id: string
  }) => 
    api.put('/admin/groups/change-owner', data),
  
  // Member management
  removeGroupMember: (data: {
    group_id: string
    user_id: string
    reason?: string
  }) => 
    api.delete('/admin/groups/members', { data }),
  
  addGroupMember: (data: {
    group_id: string
    user_id: string
    role?: string
  }) => 
    api.post('/admin/groups/members', data),
  
  // Apps management
  getApps: (params?: {
    page?: number
    page_size?: number
    status?: string
    search?: string
  }) => 
    api.get('/admin/apps', { params }),
  
  updateAppStatus: (data: {
    app_id: string
    field: 'is_active' | 'is_available'
    value: boolean
  }) => 
    api.put('/admin/apps/status', data),
  
  // CRUD operations for apps
  createApp: (data: {
    name: string
    description: string
    category: string
    icon_url?: string
    how_it_works?: string
    total_price: number
    max_group_members: number
    admin_fee_percentage: number
    is_active?: boolean
    is_available?: boolean
  }) => 
    api.post('/admin/apps', data),
  
  updateApp: (data: {
    app_id: string
    name: string
    description: string
    category: string
    icon_url?: string
    how_it_works?: string
    total_price: number
    max_group_members: number
    admin_fee_percentage: number
    is_active?: boolean
    is_available?: boolean
  }) => 
    api.put('/admin/apps', data),
  
  deleteApp: (data: {
    app_id: string
  }) => 
    api.delete('/admin/apps', { data }),
}

// Notification API endpoints
export const notificationAPI = {
  getUserNotifications: (userId: string, params?: {
    page?: number
    page_size?: number
    unread_only?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params?.unread_only) searchParams.append('unread_only', params.unread_only.toString())
    
    const queryString = searchParams.toString()
    return api.get(`/notifications/${userId}${queryString ? `?${queryString}` : ''}`)
  },
  
  markAsRead: (notificationId: string) => 
    api.put('/notifications/mark-read', { notification_id: notificationId }),
  
  markAllAsRead: (userId: string) => 
    api.put(`/notifications/${userId}/mark-all-read`),
  
  createNotification: (data: {
    user_id: string
    type: string
    title: string
    message: string
    action_url?: string
    action_text?: string
  }) => 
    api.post('/notifications/create', data),
}

// Broadcast API endpoints
export const broadcastAPI = {
  getGroupBroadcast: (groupId: string) => 
    api.get(`/broadcasts/groups/${groupId}`),
  
  createBroadcast: (data: {
    title: string
    message: string
    target_type: 'all_groups' | 'selected_groups'
    target_group_ids?: string[]
    priority?: number
    end_date?: string
  }) => 
    api.post('/broadcasts', data),
  
  getBroadcasts: (params?: {
    page?: number
    page_size?: number
    active?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
    if (params?.active !== undefined) searchParams.append('active', params.active.toString())
    
    const queryString = searchParams.toString()
    return api.get(`/broadcasts${queryString ? `?${queryString}` : ''}`)
  },
  
  updateBroadcast: (id: string, data: {
    title?: string
    message?: string
    target_type?: 'all_groups' | 'selected_groups'
    target_group_ids?: string[]
    is_active?: boolean
    priority?: number
    end_date?: string
  }) => 
    api.put(`/broadcasts/${id}`, data),
  
  deleteBroadcast: (id: string) => 
    api.delete(`/broadcasts/${id}`),
}
