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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      city_prices: {
        Row: {
          avg_price_1_2_rooms: number | null
          avg_price_3_rooms: number | null
          avg_price_4_rooms: number | null
          avg_price_5_rooms: number | null
          avg_price_6_rooms: number | null
          avg_price_total: number | null
          cbs_code: number
          city_name: string
          district: string
          fetched_at: string | null
          id: number
          period: string
          transactions_total: number | null
        }
        Insert: {
          avg_price_1_2_rooms?: number | null
          avg_price_3_rooms?: number | null
          avg_price_4_rooms?: number | null
          avg_price_5_rooms?: number | null
          avg_price_6_rooms?: number | null
          avg_price_total?: number | null
          cbs_code: number
          city_name: string
          district: string
          fetched_at?: string | null
          id?: number
          period: string
          transactions_total?: number | null
        }
        Update: {
          avg_price_1_2_rooms?: number | null
          avg_price_3_rooms?: number | null
          avg_price_4_rooms?: number | null
          avg_price_5_rooms?: number | null
          avg_price_6_rooms?: number | null
          avg_price_total?: number | null
          cbs_code?: number
          city_name?: string
          district?: string
          fetched_at?: string | null
          id?: number
          period?: string
          transactions_total?: number | null
        }
        Relationships: []
      }
      city_profiles: {
        Row: {
          anglo_community: string | null
          city_name: string
          costs_of_living: string | null
          education: string | null
          id: number
          lifestyle: string | null
          overview: string | null
          real_estate_character: string | null
          religious_infrastructure: string | null
          tier: number | null
          transportation: string | null
          updated_at: string | null
          what_to_know: string | null
          who_best_for: string | null
        }
        Insert: {
          anglo_community?: string | null
          city_name: string
          costs_of_living?: string | null
          education?: string | null
          id?: number
          lifestyle?: string | null
          overview?: string | null
          real_estate_character?: string | null
          religious_infrastructure?: string | null
          tier?: number | null
          transportation?: string | null
          updated_at?: string | null
          what_to_know?: string | null
          who_best_for?: string | null
        }
        Update: {
          anglo_community?: string | null
          city_name?: string
          costs_of_living?: string | null
          education?: string | null
          id?: number
          lifestyle?: string | null
          overview?: string | null
          real_estate_character?: string | null
          religious_infrastructure?: string | null
          tier?: number | null
          transportation?: string | null
          updated_at?: string | null
          what_to_know?: string | null
          who_best_for?: string | null
        }
        Relationships: []
      }
      city_rentals: {
        Row: {
          avg_rent_1_2_rooms: number | null
          avg_rent_2_5_3_rooms: number | null
          avg_rent_3_5_4_rooms: number | null
          avg_rent_4_5_6_rooms: number | null
          avg_rent_total: number | null
          cbs_code: number
          city_name: string
          district: string | null
          fetched_at: string | null
          id: number
          period: string
        }
        Insert: {
          avg_rent_1_2_rooms?: number | null
          avg_rent_2_5_3_rooms?: number | null
          avg_rent_3_5_4_rooms?: number | null
          avg_rent_4_5_6_rooms?: number | null
          avg_rent_total?: number | null
          cbs_code: number
          city_name: string
          district?: string | null
          fetched_at?: string | null
          id?: number
          period: string
        }
        Update: {
          avg_rent_1_2_rooms?: number | null
          avg_rent_2_5_3_rooms?: number | null
          avg_rent_3_5_4_rooms?: number | null
          avg_rent_4_5_6_rooms?: number | null
          avg_rent_total?: number | null
          cbs_code?: number
          city_name?: string
          district?: string | null
          fetched_at?: string | null
          id?: number
          period?: string
        }
        Relationships: []
      }
      construction_costs: {
        Row: {
          fetched_at: string | null
          id: number
          index_code: number
          index_name: string
          month: number
          percent_mom: number | null
          percent_yoy: number | null
          value: number | null
          year: number
        }
        Insert: {
          fetched_at?: string | null
          id?: number
          index_code: number
          index_name: string
          month: number
          percent_mom?: number | null
          percent_yoy?: number | null
          value?: number | null
          year: number
        }
        Update: {
          fetched_at?: string | null
          id?: number
          index_code?: number
          index_name?: string
          month?: number
          percent_mom?: number | null
          percent_yoy?: number | null
          value?: number | null
          year?: number
        }
        Relationships: []
      }
      construction_stats: {
        Row: {
          data_type: string | null
          district: string | null
          fetched_at: string | null
          id: number
          metric: string
          month: number | null
          quarter: number | null
          series_id: number
          value: number | null
          year: number
        }
        Insert: {
          data_type?: string | null
          district?: string | null
          fetched_at?: string | null
          id?: number
          metric: string
          month?: number | null
          quarter?: number | null
          series_id: number
          value?: number | null
          year: number
        }
        Update: {
          data_type?: string | null
          district?: string | null
          fetched_at?: string | null
          id?: number
          metric?: string
          month?: number | null
          quarter?: number | null
          series_id?: number
          value?: number | null
          year?: number
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          currency: string
          fetched_at: string | null
          id: number
          rate: number | null
          rate_date: string
        }
        Insert: {
          currency: string
          fetched_at?: string | null
          id?: number
          rate?: number | null
          rate_date: string
        }
        Update: {
          currency?: string
          fetched_at?: string | null
          id?: number
          rate?: number | null
          rate_date?: string
        }
        Relationships: []
      }
      localities: {
        Row: {
          cbs_code: number | null
          district: string
          english_alt_spellings: string | null
          english_name: string
          entity_type: string | null
          hebrew_name: string | null
          id: number
          is_anglo_city: boolean | null
          parent_city: string | null
          population: number | null
        }
        Insert: {
          cbs_code?: number | null
          district: string
          english_alt_spellings?: string | null
          english_name: string
          entity_type?: string | null
          hebrew_name?: string | null
          id?: number
          is_anglo_city?: boolean | null
          parent_city?: string | null
          population?: number | null
        }
        Update: {
          cbs_code?: number | null
          district?: string
          english_alt_spellings?: string | null
          english_name?: string
          entity_type?: string | null
          hebrew_name?: string | null
          id?: number
          is_anglo_city?: boolean | null
          parent_city?: string | null
          population?: number | null
        }
        Relationships: []
      }
      mortgage_rates: {
        Row: {
          fetched_at: string | null
          id: number
          period: string
          rate_type: string
          series_key: string
          track_label: string
          track_type: string
          value: number | null
        }
        Insert: {
          fetched_at?: string | null
          id?: number
          period: string
          rate_type: string
          series_key: string
          track_label: string
          track_type: string
          value?: number | null
        }
        Update: {
          fetched_at?: string | null
          id?: number
          period?: string
          rate_type?: string
          series_key?: string
          track_label?: string
          track_type?: string
          value?: number | null
        }
        Relationships: []
      }
      price_indices: {
        Row: {
          base_desc: string | null
          fetched_at: string | null
          id: number
          index_code: number
          index_name: string
          month: number
          percent_mom: number | null
          percent_yoy: number | null
          value: number | null
          year: number
        }
        Insert: {
          base_desc?: string | null
          fetched_at?: string | null
          id?: number
          index_code: number
          index_name: string
          month: number
          percent_mom?: number | null
          percent_yoy?: number | null
          value?: number | null
          year: number
        }
        Update: {
          base_desc?: string | null
          fetched_at?: string | null
          id?: number
          index_code?: number
          index_name?: string
          month?: number
          percent_mom?: number | null
          percent_yoy?: number | null
          value?: number | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
