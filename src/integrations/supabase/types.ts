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
      passenger_analytics_events: {
        Row: {
          duration_ms: number | null;
          element: string;
          event_name: string;
          id: string;
          metadata: Json;
          occurred_at: string;
          received_at: string;
          screen: string;
          session_id: string;
          tenant_id: string;
        };
        Insert: {
          duration_ms?: number | null;
          element: string;
          event_name: string;
          id: string;
          metadata?: Json;
          occurred_at: string;
          received_at?: string;
          screen: string;
          session_id: string;
          tenant_id: string;
        };
        Update: {
          duration_ms?: number | null;
          element?: string;
          event_name?: string;
          id?: string;
          metadata?: Json;
          occurred_at?: string;
          received_at?: string;
          screen?: string;
          session_id?: string;
          tenant_id?: string;
        };
        Relationships: [];
      };
      passenger_analytics_sessions: {
        Row: {
          active_duration_ms: number;
          created_at: string;
          device_installation_id: string;
          id: string;
          interaction_count: number;
          last_active_at: string;
          lifecycle: string;
          started_at: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          active_duration_ms?: number;
          created_at?: string;
          device_installation_id: string;
          id: string;
          interaction_count?: number;
          last_active_at: string;
          lifecycle?: string;
          started_at: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          active_duration_ms?: number;
          created_at?: string;
          device_installation_id?: string;
          id?: string;
          interaction_count?: number;
          last_active_at?: string;
          lifecycle?: string;
          started_at?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pricing_profiles: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          is_default: boolean;
          name: string;
          settings: Json;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          name: string;
          settings?: Json;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          name?: string;
          settings?: Json;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pricing_zones: {
        Row: {
          address: string;
          adjustment_cents: number;
          created_at: string;
          id: string;
          is_active: boolean;
          kind: string;
          latitude: number;
          longitude: number;
          name: string;
          place_id: string | null;
          radius_meters: number;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          address: string;
          adjustment_cents?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          kind?: string;
          latitude: number;
          longitude: number;
          name: string;
          place_id?: string | null;
          radius_meters: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          adjustment_cents?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          kind?: string;
          latitude?: number;
          longitude?: number;
          name?: string;
          place_id?: string | null;
          radius_meters?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pricing_flat_rates: {
        Row: {
          created_at: string;
          destination_zone_id: string;
          ends_at: string | null;
          id: string;
          included_stops: number;
          is_active: boolean;
          is_bidirectional: boolean;
          origin_zone_id: string;
          price_cents: number;
          pricing_profile_id: string;
          starts_at: string | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          destination_zone_id: string;
          ends_at?: string | null;
          id?: string;
          included_stops?: number;
          is_active?: boolean;
          is_bidirectional?: boolean;
          origin_zone_id: string;
          price_cents: number;
          pricing_profile_id: string;
          starts_at?: string | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          destination_zone_id?: string;
          ends_at?: string | null;
          id?: string;
          included_stops?: number;
          is_active?: boolean;
          is_bidirectional?: boolean;
          origin_zone_id?: string;
          price_cents?: number;
          pricing_profile_id?: string;
          starts_at?: string | null;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pricing_promotions: {
        Row: {
          code: string;
          created_at: string;
          discount_type: string;
          discount_value: number;
          ends_at: string | null;
          id: string;
          is_active: boolean;
          name: string;
          restrictions: Json;
          starts_at: string | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          discount_type: string;
          discount_value: number;
          ends_at?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          restrictions?: Json;
          starts_at?: string | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          discount_type?: string;
          discount_value?: number;
          ends_at?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          restrictions?: Json;
          starts_at?: string | null;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      referral_partners: {
        Row: {
          commission_type: string;
          commission_value: number;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          passenger_discount_type: string | null;
          passenger_discount_value: number | null;
          referral_type: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          commission_type: string;
          commission_value: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          passenger_discount_type?: string | null;
          passenger_discount_value?: number | null;
          referral_type?: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          commission_type?: string;
          commission_value?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          passenger_discount_type?: string | null;
          passenger_discount_value?: number | null;
          referral_type?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pricing_quotes: {
        Row: {
          booking_id: string | null;
          calculation_snapshot: Json;
          commission_status: string;
          completed_at: string | null;
          created_at: string;
          created_by_user_id: string | null;
          customer_email: string | null;
          customer_name: string | null;
          destination: string;
          discount_cents: number;
          final_cents: number | null;
          id: string;
          pickup: string;
          pricing_mode: string;
          pricing_profile_id: string | null;
          promotion_id: string | null;
          recommended_cents: number;
          referral_commission_cents: number;
          referral_partner_id: string | null;
          route_snapshot: Json;
          sent_at: string | null;
          service_at: string;
          service_type: string;
          status: string;
          stops: Json;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          booking_id?: string | null;
          calculation_snapshot: Json;
          commission_status?: string;
          completed_at?: string | null;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_email?: string | null;
          customer_name?: string | null;
          destination: string;
          discount_cents?: number;
          final_cents?: number | null;
          id?: string;
          pickup: string;
          pricing_mode: string;
          pricing_profile_id?: string | null;
          promotion_id?: string | null;
          recommended_cents: number;
          referral_commission_cents?: number;
          referral_partner_id?: string | null;
          route_snapshot: Json;
          sent_at?: string | null;
          service_at: string;
          service_type: string;
          status?: string;
          stops?: Json;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          booking_id?: string | null;
          calculation_snapshot?: Json;
          commission_status?: string;
          completed_at?: string | null;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_email?: string | null;
          customer_name?: string | null;
          destination?: string;
          discount_cents?: number;
          final_cents?: number | null;
          id?: string;
          pickup?: string;
          pricing_mode?: string;
          pricing_profile_id?: string | null;
          promotion_id?: string | null;
          recommended_cents?: number;
          referral_commission_cents?: number;
          referral_partner_id?: string | null;
          route_snapshot?: Json;
          sent_at?: string | null;
          service_at?: string;
          service_type?: string;
          status?: string;
          stops?: Json;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pricing_promo_redemptions: {
        Row: {
          customer_email: string | null;
          id: string;
          pricing_quote_id: string;
          promotion_id: string;
          redeemed_at: string;
          tenant_id: string;
        };
        Insert: {
          customer_email?: string | null;
          id?: string;
          pricing_quote_id: string;
          promotion_id: string;
          redeemed_at?: string;
          tenant_id: string;
        };
        Update: {
          customer_email?: string | null;
          id?: string;
          pricing_quote_id?: string;
          promotion_id?: string;
          redeemed_at?: string;
          tenant_id?: string;
        };
        Relationships: [];
      };
      spotify_connections: {
        Row: {
          connected_at: string;
          encrypted_refresh_token: string;
          id: string;
          last_error: string | null;
          scopes: string[];
          updated_at: string;
        };
        Insert: {
          connected_at?: string;
          encrypted_refresh_token: string;
          id: string;
          last_error?: string | null;
          scopes?: string[];
          updated_at?: string;
        };
        Update: {
          connected_at?: string;
          encrypted_refresh_token?: string;
          id?: string;
          last_error?: string | null;
          scopes?: string[];
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
