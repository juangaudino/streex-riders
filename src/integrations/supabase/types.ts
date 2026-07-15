export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string;
          tenant_id: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          key: string;
          tenant_id?: string;
          updated_at?: string;
          value: string;
        };
        Update: {
          key?: string;
          tenant_id?: string;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
      blocked_slots: {
        Row: {
          created_at: string;
          end_at: string;
          id: string;
          reason: string | null;
          start_at: string;
          tenant_id: string;
        };
        Insert: {
          created_at?: string;
          end_at: string;
          id?: string;
          reason?: string | null;
          start_at: string;
          tenant_id?: string;
        };
        Update: {
          created_at?: string;
          end_at?: string;
          id?: string;
          reason?: string | null;
          start_at?: string;
          tenant_id?: string;
        };
        Relationships: [];
      };
      calendar_connections: {
        Row: {
          account_email: string | null;
          busy_calendar_ids: Json;
          connected_at: string;
          encrypted_refresh_token: string;
          id: string;
          last_error: string | null;
          last_synced_at: string | null;
          provider: string;
          scopes: string[];
          tenant_id: string;
          updated_at: string;
          write_calendar_id: string | null;
        };
        Insert: {
          account_email?: string | null;
          busy_calendar_ids?: Json;
          connected_at?: string;
          encrypted_refresh_token: string;
          id: string;
          last_error?: string | null;
          last_synced_at?: string | null;
          provider?: string;
          scopes?: string[];
          tenant_id?: string;
          updated_at?: string;
          write_calendar_id?: string | null;
        };
        Update: {
          account_email?: string | null;
          busy_calendar_ids?: Json;
          connected_at?: string;
          encrypted_refresh_token?: string;
          id?: string;
          last_error?: string | null;
          last_synced_at?: string | null;
          provider?: string;
          scopes?: string[];
          tenant_id?: string;
          updated_at?: string;
          write_calendar_id?: string | null;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          created_at: string;
          date: string;
          destination: string;
          email: string;
          end_at: string | null;
          estimated_duration_minutes: number;
          google_calendar_id: string | null;
          google_event_id: string | null;
          google_sync_error: string | null;
          google_sync_status: string;
          google_synced_at: string | null;
          id: string;
          name: string;
          notes: string | null;
          passengers: number;
          phone: string;
          pickup: string;
          price: number | null;
          service_type: string;
          start_at: string | null;
          status: string;
          tenant_id: string;
          time: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          destination: string;
          email: string;
          end_at?: string | null;
          estimated_duration_minutes?: number;
          google_calendar_id?: string | null;
          google_event_id?: string | null;
          google_sync_error?: string | null;
          google_sync_status?: string;
          google_synced_at?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          passengers: number;
          phone: string;
          pickup: string;
          price?: number | null;
          service_type?: string;
          start_at?: string | null;
          status?: string;
          tenant_id?: string;
          time: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          destination?: string;
          email?: string;
          end_at?: string | null;
          estimated_duration_minutes?: number;
          google_calendar_id?: string | null;
          google_event_id?: string | null;
          google_sync_error?: string | null;
          google_sync_status?: string;
          google_synced_at?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          passengers?: number;
          phone?: string;
          pickup?: string;
          price?: number | null;
          service_type?: string;
          start_at?: string | null;
          status?: string;
          tenant_id?: string;
          time?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          created_at: string;
          id: string;
          location: string | null;
          message: string;
          name: string | null;
          rating: number;
          status: Database["public"]["Enums"]["review_status"];
          tenant_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          location?: string | null;
          message: string;
          name?: string | null;
          rating: number;
          status?: Database["public"]["Enums"]["review_status"];
          tenant_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          location?: string | null;
          message?: string;
          name?: string | null;
          rating?: number;
          status?: Database["public"]["Enums"]["review_status"];
          tenant_id?: string;
        };
        Relationships: [];
      };
      tenants: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
          owner_email: string;
          owner_name: string;
          owner_phone: string | null;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          id?: string;
          owner_email: string;
          owner_name: string;
          owner_phone?: string | null;
          slug: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          id?: string;
          owner_email?: string;
          owner_name?: string;
          owner_phone?: string | null;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          created_at: string;
          full_name: string;
          phone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          full_name: string;
          phone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          phone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tenant_memberships: {
        Row: {
          created_at: string;
          role: string;
          status: string;
          tenant_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          role?: string;
          status?: string;
          tenant_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          role?: string;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      platform_admins: {
        Row: { created_at: string; user_id: string };
        Insert: { created_at?: string; user_id: string };
        Update: { created_at?: string; user_id?: string };
        Relationships: [];
      };
      audit_log: {
        Row: {
          action: string;
          actor_user_id: string | null;
          created_at: string;
          id: string;
          metadata: Json;
          tenant_id: string | null;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          tenant_id?: string | null;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          tenant_id?: string | null;
        };
        Relationships: [];
      };
      calendar_oauth_states: {
        Row: {
          consumed_at: string | null;
          created_at: string;
          expires_at: string;
          nonce: string;
          tenant_id: string;
          user_id: string | null;
        };
        Insert: {
          consumed_at?: string | null;
          created_at?: string;
          expires_at: string;
          nonce: string;
          tenant_id: string;
          user_id?: string | null;
        };
        Update: {
          consumed_at?: string | null;
          created_at?: string;
          expires_at?: string;
          nonce?: string;
          tenant_id?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      runner_scores: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          score: number;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          score: number;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          score?: number;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tenant_availability: {
        Row: {
          days_active: number[];
          default_ride_duration_minutes: number;
          end_time: string;
          min_notice_hours: number;
          slot_duration_minutes: number;
          start_time: string;
          tenant_id: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          days_active?: number[];
          default_ride_duration_minutes?: number;
          end_time?: string;
          min_notice_hours?: number;
          slot_duration_minutes?: number;
          start_time?: string;
          tenant_id: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          days_active?: number[];
          default_ride_duration_minutes?: number;
          end_time?: string;
          min_notice_hours?: number;
          slot_duration_minutes?: number;
          start_time?: string;
          tenant_id?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      review_status: "pending" | "approved" | "rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      review_status: ["pending", "approved", "rejected"],
    },
  },
} as const;
