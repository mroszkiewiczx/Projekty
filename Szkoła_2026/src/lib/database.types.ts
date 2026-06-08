// ============================================================
// src/lib/database.types.ts
// Typy DB dla projektu Szkoła_2026
// Zastąp wygenerowanymi przez: npx supabase gen types typescript --project-id <ID> > src/lib/database.types.ts
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
          type: string | null;
          owner_id: string | null;
          is_school: boolean;
          status: 'active' | 'suspended' | 'trial' | 'cancelled';
          trial_ends_at: string | null;
          paid_until: string | null;
          settings: Json;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
          plan?: 'BASIC' | 'PRO' | 'ENTERPRISE';
          type?: string | null;
          owner_id?: string | null;
          is_school?: boolean;
          status?: 'active' | 'suspended' | 'trial' | 'cancelled';
          trial_ends_at?: string | null;
          paid_until?: string | null;
          settings?: Json;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workspaces']['Insert']>;
        Relationships: [];
      };
      school_profiles: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          address: string | null;
          contact_email: string | null;
          phone: string | null;
          logo_url: string | null;
          language: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          address?: string | null;
          contact_email?: string | null;
          phone?: string | null;
          logo_url?: string | null;
          language?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['school_profiles']['Insert']>;
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          name: string;
          role: 'school_admin' | 'teacher' | 'super_admin';
          status: 'active' | 'inactive' | 'pending';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          name: string;
          role: 'school_admin' | 'teacher' | 'super_admin';
          status?: 'active' | 'inactive' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: [];
      };
      teacher_invites: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          invited_by: string | null;
          created_by: string | null;
          status: 'pending' | 'accepted' | 'expired';
          token: string | null;
          invite_code: string | null;
          expires_at: string;
          accepted_at: string | null;
          users: { name: string } | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          invited_by?: string | null;
          created_by?: string | null;
          status?: 'pending' | 'accepted' | 'expired';
          token?: string | null;
          invite_code?: string | null;
          expires_at: string;
          accepted_at?: string | null;
          users?: { name: string } | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['teacher_invites']['Insert']>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          workspace_id: string;
          plan_tier: 'basic' | 'pro' | 'enterprise';
          status: 'active' | 'paused' | 'cancelled' | 'trial';
          monthly_limit_materials: number;
          renewal_date: string | null;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          plan_tier: 'basic' | 'pro' | 'enterprise';
          status?: 'active' | 'paused' | 'cancelled' | 'trial';
          monthly_limit_materials?: number;
          renewal_date?: string | null;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          workspace_id: string;
          teacher_id: string | null;
          title: string;
          topic: string;
          subject: string;
          grade: number;
          content: Json;
          metadata: Json | null;
          status: 'draft' | 'published' | 'archived';
          quality_score: number | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          teacher_id?: string | null;
          title: string;
          topic: string;
          subject: string;
          grade: number;
          content?: Json;
          metadata?: Json | null;
          status?: 'draft' | 'published' | 'archived';
          deleted_at?: string | null;
          quality_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
        Relationships: [];
      };
      materials_view: {
        Row: {
          id: string;
          workspace_id: string;
          teacher_id: string | null;
          type: string;
          title: string;
          topic: string;
          subject: string;
          grade: number;
          status: string;
          quality_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      material_history: {
        Row: {
          id: string;
          material_id: string;
          workspace_id: string;
          version: number;
          title: string;
          content: Json;
          is_current: boolean;
          changed_by: string | null;
          change_description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          material_id: string;
          workspace_id: string;
          version: number;
          title: string;
          content?: Json;
          is_current?: boolean;
          changed_by?: string | null;
          change_description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['material_history']['Insert']>;
        Relationships: [];
      };
      material_quality_scores: {
        Row: {
          id: string;
          material_id: string;
          workspace_id: string;
          score: number;
          overall_score: number | null;
          topical_alignment: number | null;
          grade_appropriateness: number | null;
          lesson_time_realism: number | null;
          objectives_quality: number | null;
          exercises_quality: number | null;
          language_clarity: number | null;
          structure_flow: number | null;
          engagement_potential: number | null;
          feedback: string | null;
          criteria: Json;
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          material_id: string;
          workspace_id: string;
          score: number;
          criteria?: Json;
          reviewed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['material_quality_scores']['Insert']>;
        Relationships: [];
      };
      billing_invoices: {
        Row: {
          id: string;
          workspace_id: string;
          amount_cents: number;
          currency: string;
          status: 'paid' | 'pending' | 'failed';
          stripe_invoice_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          amount_cents: number;
          currency?: string;
          status?: 'paid' | 'pending' | 'failed';
          stripe_invoice_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['billing_invoices']['Insert']>;
        Relationships: [];
      };
      system_logs: {
        Row: {
          id: string;
          workspace_id: string | null;
          user_id: string | null;
          action: string;
          message: string | null;
          metadata: Json;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id?: string | null;
          user_id?: string | null;
          action: string;
          message?: string | null;
          metadata?: Json;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['system_logs']['Insert']>;
        Relationships: [];
      };
      ai_usage_logs: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          module: string;
          provider: string;
          tokens_used: number;
          cost_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          module: string;
          provider: string;
          tokens_used?: number;
          cost_cents?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ai_usage_logs']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
