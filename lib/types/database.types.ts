export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
          wedding_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
          wedding_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "wedding_dashboard_stats"
            referencedColumns: ["wedding_id"]
          },
          {
            foreignKeyName: "activity_log_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      ceremonies: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          date: string | null
          description: string | null
          display_order: number | null
          dress_code: string | null
          end_time: string | null
          id: string
          map_url: string | null
          name: string
          start_time: string | null
          type: string | null
          updated_at: string | null
          venue: string | null
          wedding_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          display_order?: number | null
          dress_code?: string | null
          end_time?: string | null
          id?: string
          map_url?: string | null
          name: string
          start_time?: string | null
          type?: string | null
          updated_at?: string | null
          venue?: string | null
          wedding_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          display_order?: number | null
          dress_code?: string | null
          end_time?: string | null
          id?: string
          map_url?: string | null
          name?: string
          start_time?: string | null
          type?: string | null
          updated_at?: string | null
          venue?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ceremonies_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "wedding_dashboard_stats"
            referencedColumns: ["wedding_id"]
          },
          {
            foreignKeyName: "ceremonies_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          invite_method: string | null
          invite_sent_at: string | null
          invite_token: string | null
          name: string
          notes: string | null
          phone: string | null
          plus_one_allowed: boolean | null
          side: string | null
          tags: string[] | null
          updated_at: string | null
          wedding_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          invite_method?: string | null
          invite_sent_at?: string | null
          invite_token?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          plus_one_allowed?: boolean | null
          side?: string | null
          tags?: string[] | null
          updated_at?: string | null
          wedding_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          invite_method?: string | null
          invite_sent_at?: string | null
          invite_token?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          plus_one_allowed?: boolean | null
          side?: string | null
          tags?: string[] | null
          updated_at?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "wedding_dashboard_stats"
            referencedColumns: ["wedding_id"]
          },
          {
            foreignKeyName: "guests_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_templates: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          language: string | null
          message: string
          name: string
          subject: string | null
          variables: string[] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          language?: string | null
          message: string
          name: string
          subject?: string | null
          variables?: string[] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          language?: string | null
          message?: string
          name?: string
          subject?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      live_updates: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          published_at: string | null
          title: string
          type: string | null
          wedding_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          published_at?: string | null
          title: string
          type?: string | null
          wedding_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          published_at?: string | null
          title?: string
          type?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_updates_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "wedding_dashboard_stats"
            referencedColumns: ["wedding_id"]
          },
          {
            foreignKeyName: "live_updates_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
          wedding_id: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
          wedding_id?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "wedding_dashboard_stats"
            referencedColumns: ["wedding_id"]
          },
          {
            foreignKeyName: "notifications_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          payment_type: string
          receipt_url: string | null
          reminder_sent_at: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
          vendor_booking_id: string | null
          wedding_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_type: string
          receipt_url?: string | null
          reminder_sent_at?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          vendor_booking_id?: string | null
          wedding_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_type?: string
          receipt_url?: string | null
          reminder_sent_at?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          vendor_booking_id?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_vendor_booking_id_fkey"
            columns: ["vendor_booking_id"]
            isOneToOne: false
            referencedRelation: "vendor_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "wedding_dashboard_stats"
            referencedColumns: ["wedding_id"]
          },
          {
            foreignKeyName: "payments_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          permissions?: Json | null
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          ceremony_id: string | null
          dietary_restrictions: string | null
          guest_id: string
          guests_count: number | null
          id: string
          meal_preference: string | null
          message: string | null
          status: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          ceremony_id?: string | null
          dietary_restrictions?: string | null
          guest_id: string
          guests_count?: number | null
          id?: string
          meal_preference?: string | null
          message?: string | null
          status: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          ceremony_id?: string | null
          dietary_restrictions?: string | null
          guest_id?: string
          guests_count?: number | null
          id?: string
          meal_preference?: string | null
          message?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_ceremony_id_fkey"
            columns: ["ceremony_id"]
            isOneToOne: false
            referencedRelation: "ceremonies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          plan_type: string
          razorpay_payment_id: string | null
          razorpay_subscription_id: string | null
          started_at: string | null
          status: string | null
          user_id: string
          wedding_id: string
        }
        Insert: {
          amount?: number | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          plan_type: string
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id: string
          wedding_id: string
        }
        Update: {
          amount?: number | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          plan_type?: string
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "wedding_dashboard_stats"
            referencedColumns: ["wedding_id"]
          },
          {
            foreignKeyName: "subscriptions_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          id: string
          invited_at: string | null
          invited_by: string | null
          role_id: string
          status: string | null
          user_id: string | null
          wedding_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role_id: string
          status?: string | null
          user_id?: string | null
          wedding_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role_id?: string
          status?: string | null
          user_id?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "wedding_dashboard_stats"
            referencedColumns: ["wedding_id"]
          },
          {
            foreignKeyName: "team_members_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_bookings: {
        Row: {
          advance_paid: number | null
          balance_due: number | null
          booked_at: string | null
          booked_by: string | null
          contract_url: string | null
          created_at: string | null
          final_price: number | null
          id: string
          notes: string | null
          quoted_price: number | null
          status: string | null
          updated_at: string | null
          vendor_id: string
          wedding_id: string
        }
        Insert: {
          advance_paid?: number | null
          balance_due?: number | null
          booked_at?: string | null
          booked_by?: string | null
          contract_url?: string | null
          created_at?: string | null
          final_price?: number | null
          id?: string
          notes?: string | null
          quoted_price?: number | null
          status?: string | null
          updated_at?: string | null
          vendor_id: string
          wedding_id: string
        }
        Update: {
          advance_paid?: number | null
          balance_due?: number | null
          booked_at?: string | null
          booked_by?: string | null
          contract_url?: string | null
          created_at?: string | null
          final_price?: number | null
          id?: string
          notes?: string | null
          quoted_price?: number | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bookings_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "wedding_dashboard_stats"
            referencedColumns: ["wedding_id"]
          },
          {
            foreignKeyName: "vendor_bookings_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_categories: {
        Row: {
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          business_name: string | null
          category_id: string
          city: string | null
          created_at: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          id: string
          images: string[] | null
          instagram_url: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          name: string
          phone: string | null
          portfolio_urls: string[] | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          state: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          business_name?: string | null
          category_id: string
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          images?: string[] | null
          instagram_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          name: string
          phone?: string | null
          portfolio_urls?: string[] | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          state?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          business_name?: string | null
          category_id?: string
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          images?: string[] | null
          instagram_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          name?: string
          phone?: string | null
          portfolio_urls?: string[] | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          state?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vendor_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      website_content: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          custom_css: string | null
          custom_html: string | null
          gallery_images: string[] | null
          hashtag: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          og_image_url: string | null
          schedule_description: string | null
          seo_description: string | null
          seo_title: string | null
          story_content: string | null
          story_images: string[] | null
          story_title: string | null
          theme: string | null
          updated_at: string | null
          wedding_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_html?: string | null
          gallery_images?: string[] | null
          hashtag?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          og_image_url?: string | null
          schedule_description?: string | null
          seo_description?: string | null
          seo_title?: string | null
          story_content?: string | null
          story_images?: string[] | null
          story_title?: string | null
          theme?: string | null
          updated_at?: string | null
          wedding_id: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_html?: string | null
          gallery_images?: string[] | null
          hashtag?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          og_image_url?: string | null
          schedule_description?: string | null
          seo_description?: string | null
          seo_title?: string | null
          story_content?: string | null
          story_images?: string[] | null
          story_title?: string | null
          theme?: string | null
          updated_at?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_content_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "wedding_dashboard_stats"
            referencedColumns: ["wedding_id"]
          },
          {
            foreignKeyName: "website_content_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          bride_name: string
          city: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          groom_name: string
          id: string
          is_published: boolean | null
          owner_id: string
          plan_type: string | null
          slug: string | null
          status: string | null
          updated_at: string | null
          venue: string | null
          wedding_date: string | null
        }
        Insert: {
          bride_name: string
          city?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          groom_name: string
          id?: string
          is_published?: boolean | null
          owner_id: string
          plan_type?: string | null
          slug?: string | null
          status?: string | null
          updated_at?: string | null
          venue?: string | null
          wedding_date?: string | null
        }
        Update: {
          bride_name?: string
          city?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          groom_name?: string
          id?: string
          is_published?: boolean | null
          owner_id?: string
          plan_type?: string | null
          slug?: string | null
          status?: string | null
          updated_at?: string | null
          venue?: string | null
          wedding_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      wedding_dashboard_stats: {
        Row: {
          attending_count: number | null
          booked_vendors: number | null
          bride_name: string | null
          groom_name: string | null
          not_attending_count: number | null
          pending_count: number | null
          total_guests: number | null
          total_paid: number | null
          total_pending: number | null
          wedding_date: string | null
          wedding_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_invite_token: { Args: never; Returns: string }
      generate_wedding_slug: {
        Args: { p_bride_name: string; p_groom_name: string }
        Returns: string
      }
      has_permission: {
        Args: {
          p_action: string
          p_module: string
          p_user_id: string
          p_wedding_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
