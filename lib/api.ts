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
  
  register: (email: string, password: string, fullName: string) => 
    api.post('/auth/register', { email, password, full_name: fullName }),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (data: any) => 
    api.put('/auth/profile', data),
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

// Admin API endpoints
export const adminAPI = {
  updateUserStatus: (data: {
    user_id: string
    group_id: string
    new_status: string
    removed_reason?: string
  }) => 
    api.put('/admin/users/status', data),
  
  updateGroupStatus: (data: {
    group_id: string
    new_status: string
  }) => 
    api.put('/admin/groups/status', data),
}
