export interface Transaction {
  id: string
  user_id: string
  group_id?: string
  type: 'top_up' | 'group_payment' | 'withdrawal' | 'refund'
  amount: number
  balance_before: number
  balance_after: number
  description: string
  payment_method?: string
  payment_reference?: string
  payment_link_id?: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface TransactionResponse {
  saldo: number
  transactions: Transaction[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface TransactionCreateRequest {
  group_id?: string
  type: string
  amount: number
  description: string
  payment_method?: string
}
