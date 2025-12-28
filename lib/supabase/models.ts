import { Database } from './types';

// Icon names as strings since we can't store React components in the database
export type IconName = 
  | 'Wallet'
  | 'Utensils'
  | 'Car'
  | 'ShoppingCart'
  | 'TrendingUp'
  | 'Gamepad2'
  | 'Heart'
  | 'Home'
  | 'CreditCard'
  | 'Briefcase'
  | 'Gift'
  | 'Music'
  | 'Book'
  | 'Plane'
  | 'Coffee'
  | 'Smartphone'
  | 'Shirt'
  | 'Dumbbell'
  | 'GraduationCap'
  | 'Baby'
  | 'Repeat'
  | 'Calendar';

export type CategoryColor = 'green' | 'blue' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow';
export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Database row types (from Supabase)
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type TransactionRow = Database['public']['Tables']['transactions']['Row'];
export type RecurringTransactionRow = Database['public']['Tables']['recurring_transactions']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type RecurringTransactionInsert = Database['public']['Tables']['recurring_transactions']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];
export type RecurringTransactionUpdate = Database['public']['Tables']['recurring_transactions']['Update'];

// Application types (with some transformations)
export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: IconName;
  color: CategoryColor;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'investment';
  date: string;
  category_id: string;
  category?: Category;
  user_id: string;
  recurring_transaction_id?: string | null;
  installment_number?: number | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'investment';
  category_id: string | null;
  category?: Category;
  user_id: string;
  frequency: FrequencyType;
  day_of_month: number | null;
  day_of_week: number | null;
  start_date: string;
  end_date: string | null;
  is_installment: boolean;
  total_installments: number | null;
  current_installment: number;
  is_active: boolean;
  last_generated_date: string | null;
  next_due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Helper function to transform database row to application type
export function transformCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon as IconName,
    color: row.color as CategoryColor,
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function transformTransaction(row: TransactionRow, category?: CategoryRow): Transaction {
  let type = row.type as 'income' | 'expense' | 'investment';
  
  // Auto-detect investment based on category if it's an expense
  // This is a workaround because DB might strict enum 'expense' | 'income'
  if (type === 'expense' && category) {
    if (category.name.toLowerCase().includes('investimento')) {
      type = 'investment';
    }
  }

  return {
    id: row.id,
    description: row.description,
    amount: row.amount,
    type,
    date: row.date,
    category_id: row.category_id,
    category: category ? transformCategory(category) : undefined,
    user_id: row.user_id,
    recurring_transaction_id: row.recurring_transaction_id,
    installment_number: row.installment_number,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function transformRecurringTransaction(row: RecurringTransactionRow, category?: CategoryRow): RecurringTransaction {
  let type = row.type as 'income' | 'expense' | 'investment';
  
  // Auto-detect investment based on category if it's an expense
  if (type === 'expense' && category) {
    if (category.name.toLowerCase().includes('investimento')) {
      type = 'investment';
    }
  }

  return {
    id: row.id,
    description: row.description,
    amount: row.amount,
    type,
    category_id: row.category_id,
    category: category ? transformCategory(category) : undefined,
    user_id: row.user_id,
    frequency: row.frequency as FrequencyType,
    day_of_month: row.day_of_month,
    day_of_week: row.day_of_week,
    start_date: row.start_date,
    end_date: row.end_date,
    is_installment: row.is_installment,
    total_installments: row.total_installments,
    current_installment: row.current_installment,
    is_active: row.is_active,
    last_generated_date: row.last_generated_date,
    next_due_date: row.next_due_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function transformProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Frequency labels for UI
export const frequencyLabels: Record<FrequencyType, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
};

// Day of week labels
export const dayOfWeekLabels: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};
