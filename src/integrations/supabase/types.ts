export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      executive_applications: {
        Row: {
          admin_notes: string | null
          consent: boolean
          course: string
          created_at: string
          email: string
          faculty: string | null
          full_name: string
          id: string
          motivation: string | null
          notified_at: string | null
          phone: string
          position_id: string
          status: string
          updated_at: string
          year_of_study: number
        }
        Insert: {
          admin_notes?: string | null
          consent: boolean
          course: string
          created_at?: string
          email: string
          faculty?: string | null
          full_name: string
          id?: string
          motivation?: string | null
          notified_at?: string | null
          phone: string
          position_id: string
          status?: string
          updated_at?: string
          year_of_study: number
        }
        Update: {
          admin_notes?: string | null
          consent?: boolean
          course?: string
          created_at?: string
          email?: string
          faculty?: string | null
          full_name?: string
          id?: string
          motivation?: string | null
          notified_at?: string | null
          phone?: string
          position_id?: string
          status?: string
          updated_at?: string
          year_of_study?: number
        }
        Relationships: [
          {
            foreignKeyName: "executive_applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "executive_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_positions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_open: boolean
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_open?: boolean
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_open?: boolean
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          body: string
          category: string
          cover_image: string | null
          created_at: string
          cta_label: string | null
          cta_url: string | null
          event_date: string | null
          gallery: string[]
          id: string
          impact: Json
          is_featured: boolean
          is_published: boolean
          location: string | null
          partners: string | null
          sdgs: number[]
          slug: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          category?: string
          cover_image?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          event_date?: string | null
          gallery?: string[]
          id?: string
          impact?: Json
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          partners?: string | null
          sdgs?: number[]
          slug: string
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          cover_image?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          event_date?: string | null
          gallery?: string[]
          id?: string
          impact?: Json
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          partners?: string | null
          sdgs?: number[]
          slug?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          applications_deadline: string | null
          applications_message: string
          applications_open: boolean
          applications_title: string
          contact_email: string
          contact_phone: string
          id: number
          instagram_handle: string
          membership_fee: string
          notification_email: string | null
          sdg_focus: number
          updated_at: string
          x_handle: string
        }
        Insert: {
          applications_deadline?: string | null
          applications_message?: string
          applications_open?: boolean
          applications_title?: string
          contact_email?: string
          contact_phone?: string
          id?: number
          instagram_handle?: string
          membership_fee?: string
          notification_email?: string | null
          sdg_focus?: number
          updated_at?: string
          x_handle?: string
        }
        Update: {
          applications_deadline?: string | null
          applications_message?: string
          applications_open?: boolean
          applications_title?: string
          contact_email?: string
          contact_phone?: string
          id?: number
          instagram_handle?: string
          membership_fee?: string
          notification_email?: string | null
          sdg_focus?: number
          updated_at?: string
          x_handle?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          photo_url: string | null
          role: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          role: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tree_care_advice: {
        Row: {
          advice: Json
          created_at: string | null
          id: string
          tree_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          advice: Json
          created_at?: string | null
          id?: string
          tree_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          advice?: Json
          created_at?: string | null
          id?: string
          tree_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tree_care_advice_tree_id_fkey"
            columns: ["tree_id"]
            isOneToOne: false
            referencedRelation: "trees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tree_care_advice_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trees: {
        Row: {
          created_at: string | null
          id: string
          image_1: string | null
          image_2: string | null
          image_3: string | null
          latitude: number
          longitude: number
          notes: string | null
          planted_date: string | null
          species: string | null
          tree_count: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_1?: string | null
          image_2?: string | null
          image_3?: string | null
          latitude: number
          longitude: number
          notes?: string | null
          planted_date?: string | null
          species?: string | null
          tree_count?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_1?: string | null
          image_2?: string | null
          image_3?: string | null
          latitude?: number
          longitude?: number
          notes?: string | null
          planted_date?: string | null
          species?: string | null
          tree_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_public: {
        Row: {
          full_name: string | null
          total_trees: number | null
          user_id: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          full_name: string | null
          id: string | null
        }
        Relationships: []
      }
      trees_public: {
        Row: {
          created_at: string | null
          id: string | null
          image_1: string | null
          image_2: string | null
          image_3: string | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          planted_date: string | null
          species: string | null
          tree_count: number | null
        }
        Relationships: []
      }
      user_trees_public: {
        Row: {
          id: string | null
          image_1: string | null
          image_2: string | null
          image_3: string | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          planted_date: string | null
          species: string | null
          tree_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      applications_are_open: { Args: never; Returns: boolean }
      get_leaderboard: {
        Args: never
        Returns: {
          full_name: string
          total_trees: number
          user_id: string
        }[]
      }
      get_profiles_public: {
        Args: never
        Returns: {
          full_name: string
          id: string
        }[]
      }
      get_trees_public: {
        Args: never
        Returns: {
          created_at: string
          id: string
          image_1: string
          image_2: string
          image_3: string
          latitude: number
          longitude: number
          notes: string
          planted_date: string
          species: string
          tree_count: number
        }[]
      }
      get_user_trees_public: {
        Args: never
        Returns: {
          id: string
          image_1: string
          image_2: string
          image_3: string
          latitude: number
          longitude: number
          notes: string
          planted_date: string
          species: string
          tree_count: number
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const

