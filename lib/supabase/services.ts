import { createClient as createBrowserClient } from './client'
import { 
  Category, 
  Transaction, 
  Profile,
  RecurringTransaction,
  CategoryInsert,
  CategoryUpdate,
  TransactionInsert,
  TransactionUpdate,
  ProfileUpdate,
  RecurringTransactionInsert,
  RecurringTransactionUpdate,
  transformCategory,
  transformTransaction,
  transformProfile,
  transformRecurringTransaction,
} from './models'

// ============================================
// AUTH SERVICES
// ============================================

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createBrowserClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) throw error
}

export async function getCurrentUser() {
  const supabase = createBrowserClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) throw error
  return user
}

export async function getSession() {
  const supabase = createBrowserClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) throw error
  return session
}

// ============================================
// PROFILE SERVICES
// ============================================

export async function getProfile(): Promise<Profile | null> {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) return null
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) throw error
  return data ? transformProfile(data) : null
}

export async function updateProfile(updates: ProfileUpdate): Promise<Profile> {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()
  
  if (error) throw error
  return transformProfile(data)
}

// ============================================
// CATEGORY SERVICES
// ============================================

export async function getCategories(): Promise<Category[]> {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data.map(transformCategory)
}

export async function getCategory(id: string): Promise<Category | null> {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return transformCategory(data)
}

export async function createCategory(category: Omit<CategoryInsert, 'user_id'>): Promise<Category> {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from('categories')
    .insert({ ...category, user_id: user.id } as CategoryInsert)
    .select()
    .single()
  
  if (error) throw error
  return transformCategory(data)
}

export async function updateCategory(id: string, updates: CategoryUpdate): Promise<Category> {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return transformCategory(data)
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = createBrowserClient()
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============================================
// TRANSACTION SERVICES
// ============================================

export async function getTransactions(options?: {
  limit?: number
  offset?: number
  type?: 'income' | 'expense'
  categoryId?: string
  startDate?: string
  endDate?: string
}): Promise<Transaction[]> {
  const supabase = createBrowserClient()
  
  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories (*)
    `)
    .order('date', { ascending: false })
  
  if (options?.type) {
    query = query.eq('type', options.type)
  }
  
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }
  
  if (options?.startDate) {
    query = query.gte('date', options.startDate)
  }
  
  if (options?.endDate) {
    query = query.lte('date', options.endDate)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  
  return data.map((row) => {
    const { categories, ...transaction } = row
    return transformTransaction(transaction, categories || undefined)
  })
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  const { categories, ...transaction } = data
  return transformTransaction(transaction, categories || undefined)
}

export async function createTransaction(transaction: Omit<TransactionInsert, 'user_id'>): Promise<Transaction> {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...transaction, user_id: user.id } as TransactionInsert)
    .select(`
      *,
      categories (*)
    `)
    .single()
  
  if (error) throw error
  
  const { categories, ...transactionData } = data
  return transformTransaction(transactionData, categories || undefined)
}

export async function updateTransaction(id: string, updates: TransactionUpdate): Promise<Transaction> {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      categories (*)
    `)
    .single()
  
  if (error) throw error
  
  const { categories, ...transaction } = data
  return transformTransaction(transaction, categories || undefined)
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = createBrowserClient()
  
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============================================
// STATISTICS SERVICES
// ============================================

export async function getMonthlyStats(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  
  const transactions = await getTransactions({ startDate, endDate })
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  return {
    income,
    expense,
    balance: income - expense,
    transactions,
  }
}

export async function getCategoryTotals(options?: {
  startDate?: string
  endDate?: string
  type?: 'income' | 'expense'
}) {
  const transactions = await getTransactions(options)
  
  const totals = new Map<string, { category: Category; total: number }>()
  
  for (const transaction of transactions) {
    if (!transaction.category) continue
    
    const existing = totals.get(transaction.category.id)
    if (existing) {
      existing.total += transaction.amount
    } else {
      totals.set(transaction.category.id, {
        category: transaction.category,
        total: transaction.amount,
      })
    }
  }
  
  return Array.from(totals.values()).sort((a, b) => b.total - a.total)
}

export async function getTotalBalance(): Promise<number> {
  const transactions = await getTransactions()
  
  return transactions.reduce((balance, t) => {
    return t.type === 'income' ? balance + t.amount : balance - t.amount
  }, 0)
}

// ============================================
// RECURRING TRANSACTION SERVICES
// ============================================

export async function getRecurringTransactions(options?: {
  isActive?: boolean
  type?: 'income' | 'expense'
}): Promise<RecurringTransaction[]> {
  const supabase = createBrowserClient()
  
  let query = supabase
    .from('recurring_transactions')
    .select(`
      *,
      categories (*)
    `)
    .order('next_due_date', { ascending: true })
  
  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive)
  }
  
  if (options?.type) {
    query = query.eq('type', options.type)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  
  return data.map((row) => {
    const { categories, ...recurring } = row
    return transformRecurringTransaction(recurring, categories || undefined)
  })
}

export async function getRecurringTransaction(id: string): Promise<RecurringTransaction | null> {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select(`
      *,
      categories (*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  const { categories, ...recurring } = data
  return transformRecurringTransaction(recurring, categories || undefined)
}

export async function createRecurringTransaction(
  recurring: Omit<RecurringTransactionInsert, 'user_id'>
): Promise<RecurringTransaction> {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) throw new Error('User not authenticated')
  
  // Calculate the next due date based on start_date
  const nextDueDate = recurring.start_date
  
  const { data, error } = await supabase
    .from('recurring_transactions')
    .insert({ 
      ...recurring, 
      user_id: user.id,
      next_due_date: nextDueDate,
    } as RecurringTransactionInsert)
    .select(`
      *,
      categories (*)
    `)
    .single()
  
  if (error) throw error
  
  const { categories, ...recurringData } = data
  return transformRecurringTransaction(recurringData, categories || undefined)
}

export async function updateRecurringTransaction(
  id: string, 
  updates: RecurringTransactionUpdate
): Promise<RecurringTransaction> {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('recurring_transactions')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      categories (*)
    `)
    .single()
  
  if (error) throw error
  
  const { categories, ...recurring } = data
  return transformRecurringTransaction(recurring, categories || undefined)
}

export async function deleteRecurringTransaction(id: string): Promise<void> {
  const supabase = createBrowserClient()
  
  const { error } = await supabase
    .from('recurring_transactions')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function toggleRecurringTransaction(id: string, isActive: boolean): Promise<RecurringTransaction> {
  return updateRecurringTransaction(id, { is_active: isActive })
}

// ============================================
// RECURRING TRANSACTION GENERATION
// ============================================

/**
 * Generates pending recurring transactions for the current user.
 * This should be called when the user logs in or accesses the dashboard.
 */
export async function generatePendingRecurringTransactions(): Promise<number> {
  const supabase = createBrowserClient()
  const user = await getCurrentUser()
  
  if (!user) throw new Error('User not authenticated')
  
  // Call the Supabase function to generate transactions
  const { data, error } = await supabase
    .rpc('generate_user_recurring_transactions', { p_user_id: user.id })
  
  if (error) throw error
  
  return data || 0
}

/**
 * Get transactions generated from a recurring transaction
 */
export async function getTransactionsFromRecurring(recurringId: string): Promise<Transaction[]> {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (*)
    `)
    .eq('recurring_transaction_id', recurringId)
    .order('date', { ascending: false })
  
  if (error) throw error
  
  return data.map((row) => {
    const { categories, ...transaction } = row
    return transformTransaction(transaction, categories || undefined)
  })
}

/**
 * Get recurring transaction statistics
 */
export async function getRecurringStats() {
  const recurring = await getRecurringTransactions({ isActive: true })
  
  const monthlyExpenses = recurring
    .filter(r => r.type === 'expense' && r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.amount, 0)
  
  const monthlyIncome = recurring
    .filter(r => r.type === 'income' && r.frequency === 'monthly')
    .reduce((sum, r) => sum + r.amount, 0)
  
  const activeInstallments = recurring.filter(r => r.is_installment && r.is_active)
  
  const upcomingPayments = recurring
    .filter(r => {
      if (!r.next_due_date) return false
      const nextDate = new Date(r.next_due_date)
      const today = new Date()
      const weekFromNow = new Date()
      weekFromNow.setDate(today.getDate() + 7)
      return nextDate >= today && nextDate <= weekFromNow
    })
  
  return {
    monthlyExpenses,
    monthlyIncome,
    activeInstallments,
    upcomingPayments,
    totalActive: recurring.length,
  }
}
