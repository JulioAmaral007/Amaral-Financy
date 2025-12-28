export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string
          color: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon: string
          color: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string
          color?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          description: string
          amount: number
          type: string
          date: string
          category_id: string
          user_id: string
          recurring_transaction_id: string | null
          installment_number: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          type: string
          date: string
          category_id: string
          user_id: string
          recurring_transaction_id?: string | null
          installment_number?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          type?: string
          date?: string
          category_id?: string
          user_id?: string
          recurring_transaction_id?: string | null
          installment_number?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recurring_transaction_id_fkey"
            columns: ["recurring_transaction_id"]
            isOneToOne: false
            referencedRelation: "recurring_transactions"
            referencedColumns: ["id"]
          }
        ]
      }
      recurring_transactions: {
        Row: {
          id: string
          description: string
          amount: number
          type: string
          category_id: string | null
          user_id: string
          frequency: string
          day_of_month: number | null
          day_of_week: number | null
          start_date: string
          end_date: string | null
          is_installment: boolean
          total_installments: number | null
          current_installment: number
          is_active: boolean
          last_generated_date: string | null
          next_due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          type: string
          category_id?: string | null
          user_id: string
          frequency: string
          day_of_month?: number | null
          day_of_week?: number | null
          start_date: string
          end_date?: string | null
          is_installment?: boolean
          total_installments?: number | null
          current_installment?: number
          is_active?: boolean
          last_generated_date?: string | null
          next_due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          type?: string
          category_id?: string | null
          user_id?: string
          frequency?: string
          day_of_month?: number | null
          day_of_week?: number | null
          start_date?: string
          end_date?: string | null
          is_installment?: boolean
          total_installments?: number | null
          current_installment?: number
          is_active?: boolean
          last_generated_date?: string | null
          next_due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_recurring_transactions: {
        Args: Record<string, never>
        Returns: number
      }
      generate_user_recurring_transactions: {
        Args: { p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      transaction_type: "income" | "expense"
      category_color: "green" | "blue" | "purple" | "pink" | "red" | "orange" | "yellow"
      frequency_type: "daily" | "weekly" | "monthly" | "yearly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
