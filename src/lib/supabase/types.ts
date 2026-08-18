/**
 * Supabase Database Types
 * Auto-generated types based on database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserTier = 'free' | 'premium'
export type SubscriptionStatus = 'active' | 'expired' | 'revoked' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          license_key: string | null
          email: string | null
          tier: UserTier
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          license_key?: string | null
          email?: string | null
          tier?: UserTier
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          license_key?: string | null
          email?: string | null
          tier?: UserTier
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          polar_subscription_id: string | null
          status: SubscriptionStatus
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          polar_subscription_id?: string | null
          status?: SubscriptionStatus
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          polar_subscription_id?: string | null
          status?: SubscriptionStatus
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          project_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          project_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          project_id?: string | null
          created_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          total_checks_run: number
          last_check_at: string | null
          free_check_used: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_checks_run?: number
          last_check_at?: string | null
          free_check_used?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_checks_run?: number
          last_check_at?: string | null
          free_check_used?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_tier: UserTier
      subscription_status: SubscriptionStatus
    }
  }
}

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type UserSession = Database['public']['Tables']['user_sessions']['Row']
export type UsageTracking = Database['public']['Tables']['usage_tracking']['Row']

export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertSubscription = Database['public']['Tables']['subscriptions']['Insert']
export type InsertUserSession = Database['public']['Tables']['user_sessions']['Insert']
export type InsertUsageTracking = Database['public']['Tables']['usage_tracking']['Insert']

export type UpdateUser = Database['public']['Tables']['users']['Update']
export type UpdateSubscription = Database['public']['Tables']['subscriptions']['Update']
export type UpdateUserSession = Database['public']['Tables']['user_sessions']['Update']
export type UpdateUsageTracking = Database['public']['Tables']['usage_tracking']['Update']
