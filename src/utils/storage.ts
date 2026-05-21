const STORAGE_KEY = 'finance_records'
const API_CONFIG_KEY = 'finance_api_config'
const CHAT_HISTORY_KEY = 'finance_chat_history'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  note: string
  reimbursement?: 'personal' | 'reimbursable' | 'reimbursed'
  paymentMethod?: string
}

export interface ApiConfig {
  apiKey: string
  model: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export function getTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTransactions(list: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function addTransaction(record: Omit<Transaction, 'id'>) {
  const list = getTransactions()
  const newRecord: Transaction = {
    ...record,
    id: generateUUID(),
  }
  list.unshift(newRecord)
  saveTransactions(list)
  return newRecord
}

export function updateTransaction(id: string, data: Partial<Omit<Transaction, 'id'>>) {
  const list = getTransactions()
  const idx = list.findIndex((t) => t.id === id)
  if (idx === -1) return false
  list[idx] = { ...list[idx], ...data }
  saveTransactions(list)
  return true
}

export function deleteTransaction(id: string) {
  const list = getTransactions().filter((t) => t.id !== id)
  saveTransactions(list)
}

const DEFAULT_API_KEY = 'sk-84e415c2c59d4c4dad50829a98d0945c'

export function getApiConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(API_CONFIG_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fall through
  }
  return { apiKey: DEFAULT_API_KEY, model: 'deepseek-chat' }
}

export function saveApiConfig(config: ApiConfig) {
  localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config))
}

export function getChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveChatHistory(messages: ChatMessage[]) {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-12)))
}

export function clearChatHistory() {
  localStorage.removeItem(CHAT_HISTORY_KEY)
}
