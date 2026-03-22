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
      aliyah_relocation: {
        Row: {
          anglo_real_estate_agents: string | null
          banks_with_english_service: Json | null
          bituach_leumi_office: Json | null
          city_name: string
          climate: Json | null
          confidence: string | null
          coworking_spaces: Json | null
          english_friendly_businesses: string | null
          english_speaking_accountants: string | null
          english_speaking_lawyers: string | null
          id: number
          locality_id: number | null
          misrad_hapnim_office: Json | null
          nefesh_bnefesh_regional_office: string | null
          post_office: Json | null
          quality_of_life_notes: string | null
        }
        Insert: {
          anglo_real_estate_agents?: string | null
          banks_with_english_service?: Json | null
          bituach_leumi_office?: Json | null
          city_name: string
          climate?: Json | null
          confidence?: string | null
          coworking_spaces?: Json | null
          english_friendly_businesses?: string | null
          english_speaking_accountants?: string | null
          english_speaking_lawyers?: string | null
          id?: never
          locality_id?: number | null
          misrad_hapnim_office?: Json | null
          nefesh_bnefesh_regional_office?: string | null
          post_office?: Json | null
          quality_of_life_notes?: string | null
        }
        Update: {
          anglo_real_estate_agents?: string | null
          banks_with_english_service?: Json | null
          bituach_leumi_office?: Json | null
          city_name?: string
          climate?: Json | null
          confidence?: string | null
          coworking_spaces?: Json | null
          english_friendly_businesses?: string | null
          english_speaking_accountants?: string | null
          english_speaking_lawyers?: string | null
          id?: never
          locality_id?: number | null
          misrad_hapnim_office?: Json | null
          nefesh_bnefesh_regional_office?: string | null
          post_office?: Json | null
          quality_of_life_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aliyah_relocation_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
      anglo_community_density: {
        Row: {
          anglo_institutions: Json | null
          anglo_neighborhood: string | null
          anglo_trend: string | null
          approx_english_speaking_families: string | null
          city_name: string
          facebook_groups: Json | null
          id: number
          key_organizations: Json | null
          locality_id: number | null
          main_source_countries: Json | null
        }
        Insert: {
          anglo_institutions?: Json | null
          anglo_neighborhood?: string | null
          anglo_trend?: string | null
          approx_english_speaking_families?: string | null
          city_name: string
          facebook_groups?: Json | null
          id?: never
          key_organizations?: Json | null
          locality_id?: number | null
          main_source_countries?: Json | null
        }
        Update: {
          anglo_institutions?: Json | null
          anglo_neighborhood?: string | null
          anglo_trend?: string | null
          approx_english_speaking_families?: string | null
          city_name?: string
          facebook_groups?: Json | null
          id?: never
          key_organizations?: Json | null
          locality_id?: number | null
          main_source_countries?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "anglo_community_density_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
      arnona_rates: {
        Row: {
          annual_arnona_100sqm_nis: number | null
          city_name: string
          comparison_to_national_average: string | null
          confidence: string | null
          id: number
          large_family_discount: string | null
          locality_id: number | null
          notes: string | null
          olim_discount: string | null
          other_discounts: string | null
          rate_per_sqm_nis: number | null
          source_url: string | null
        }
        Insert: {
          annual_arnona_100sqm_nis?: number | null
          city_name: string
          comparison_to_national_average?: string | null
          confidence?: string | null
          id?: never
          large_family_discount?: string | null
          locality_id?: number | null
          notes?: string | null
          olim_discount?: string | null
          other_discounts?: string | null
          rate_per_sqm_nis?: number | null
          source_url?: string | null
        }
        Update: {
          annual_arnona_100sqm_nis?: number | null
          city_name?: string
          comparison_to_national_average?: string | null
          confidence?: string | null
          id?: never
          large_family_discount?: string | null
          locality_id?: number | null
          notes?: string | null
          olim_discount?: string | null
          other_discounts?: string | null
          rate_per_sqm_nis?: number | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arnona_rates_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
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
          tagline: string | null
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
          tagline?: string | null
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
          tagline?: string | null
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
      cost_of_living: {
        Row: {
          childcare_monthly_nis: Json | null
          city_name: string
          confidence: string | null
          cost_index_vs_national: string | null
          grocery_basket_family_of_4_monthly_nis: number | null
          gym_membership_monthly_nis: number | null
          id: number
          locality_id: number | null
          notes: string | null
          private_health_supplement_monthly_nis: number | null
          public_transit_monthly_pass_nis: number | null
          restaurant_meal_midrange_2_people_nis: number | null
          utilities_100sqm_monthly_nis: Json | null
        }
        Insert: {
          childcare_monthly_nis?: Json | null
          city_name: string
          confidence?: string | null
          cost_index_vs_national?: string | null
          grocery_basket_family_of_4_monthly_nis?: number | null
          gym_membership_monthly_nis?: number | null
          id?: never
          locality_id?: number | null
          notes?: string | null
          private_health_supplement_monthly_nis?: number | null
          public_transit_monthly_pass_nis?: number | null
          restaurant_meal_midrange_2_people_nis?: number | null
          utilities_100sqm_monthly_nis?: Json | null
        }
        Update: {
          childcare_monthly_nis?: Json | null
          city_name?: string
          confidence?: string | null
          cost_index_vs_national?: string | null
          grocery_basket_family_of_4_monthly_nis?: number | null
          gym_membership_monthly_nis?: number | null
          id?: never
          locality_id?: number | null
          notes?: string | null
          private_health_supplement_monthly_nis?: number | null
          public_transit_monthly_pass_nis?: number | null
          restaurant_meal_midrange_2_people_nis?: number | null
          utilities_100sqm_monthly_nis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_of_living_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
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
      healthcare_access: {
        Row: {
          ambulance_response_estimate: string | null
          city_name: string
          confidence: string | null
          english_speaking_doctors: string | null
          english_speaking_therapists_mental_health: string | null
          id: number
          kupat_cholim_presence: Json | null
          locality_id: number | null
          nearest_major_hospital: Json | null
          notes: string | null
          pharmacies_with_english_service: string | null
          specialty_medical_centers: Json | null
          telemedicine_english: string | null
        }
        Insert: {
          ambulance_response_estimate?: string | null
          city_name: string
          confidence?: string | null
          english_speaking_doctors?: string | null
          english_speaking_therapists_mental_health?: string | null
          id?: never
          kupat_cholim_presence?: Json | null
          locality_id?: number | null
          nearest_major_hospital?: Json | null
          notes?: string | null
          pharmacies_with_english_service?: string | null
          specialty_medical_centers?: Json | null
          telemedicine_english?: string | null
        }
        Update: {
          ambulance_response_estimate?: string | null
          city_name?: string
          confidence?: string | null
          english_speaking_doctors?: string | null
          english_speaking_therapists_mental_health?: string | null
          id?: never
          kupat_cholim_presence?: Json | null
          locality_id?: number | null
          nearest_major_hospital?: Json | null
          notes?: string | null
          pharmacies_with_english_service?: string | null
          specialty_medical_centers?: Json | null
          telemedicine_english?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "healthcare_access_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
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
      neighborhoods: {
        Row: {
          anglo_presence: string | null
          best_for: Json | null
          city_name: string
          commute_to_city_center: string | null
          commute_to_employment_hubs: string | null
          confidence: string | null
          id: number
          key_amenities: Json | null
          locality_id: number | null
          name: string
          new_construction: string | null
          price_range_max: number | null
          price_range_min: number | null
          religious_character: string | null
          vibe: string | null
          walkability: string | null
        }
        Insert: {
          anglo_presence?: string | null
          best_for?: Json | null
          city_name: string
          commute_to_city_center?: string | null
          commute_to_employment_hubs?: string | null
          confidence?: string | null
          id?: never
          key_amenities?: Json | null
          locality_id?: number | null
          name: string
          new_construction?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          religious_character?: string | null
          vibe?: string | null
          walkability?: string | null
        }
        Update: {
          anglo_presence?: string | null
          best_for?: Json | null
          city_name?: string
          commute_to_city_center?: string | null
          commute_to_employment_hubs?: string | null
          confidence?: string | null
          id?: never
          key_amenities?: Json | null
          locality_id?: number | null
          name?: string
          new_construction?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          religious_character?: string | null
          vibe?: string | null
          walkability?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neighborhoods_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          source: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      site_parameters: {
        Row: {
          key: string
          value: string
          display_label: string
          data_type: string
          last_verified: string
          check_month: number | null
          source: string | null
          notes: string | null
          used_in: string[] | null
        }
        Insert: {
          key: string
          value: string
          display_label: string
          data_type?: string
          last_verified?: string
          check_month?: number | null
          source?: string | null
          notes?: string | null
          used_in?: string[] | null
        }
        Update: {
          key?: string
          value?: string
          display_label?: string
          data_type?: string
          last_verified?: string
          check_month?: number | null
          source?: string | null
          notes?: string | null
          used_in?: string[] | null
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
      safety_security: {
        Row: {
          border_proximity_concern: string | null
          city_name: string
          confidence: string | null
          crime_level: string | null
          current_security_considerations: string | null
          distance_to_nearest_border: Json | null
          general_security_assessment: string | null
          id: number
          locality_id: number | null
          mamad_prevalence: Json | null
          notes: string | null
          rocket_threat_level: string | null
          security_infrastructure: string | null
          security_notes_for_anglos: string | null
        }
        Insert: {
          border_proximity_concern?: string | null
          city_name: string
          confidence?: string | null
          crime_level?: string | null
          current_security_considerations?: string | null
          distance_to_nearest_border?: Json | null
          general_security_assessment?: string | null
          id?: never
          locality_id?: number | null
          mamad_prevalence?: Json | null
          notes?: string | null
          rocket_threat_level?: string | null
          security_infrastructure?: string | null
          security_notes_for_anglos?: string | null
        }
        Update: {
          border_proximity_concern?: string | null
          city_name?: string
          confidence?: string | null
          crime_level?: string | null
          current_security_considerations?: string | null
          distance_to_nearest_border?: Json | null
          general_security_assessment?: string | null
          id?: never
          locality_id?: number | null
          mamad_prevalence?: Json | null
          notes?: string | null
          rocket_threat_level?: string | null
          security_infrastructure?: string | null
          security_notes_for_anglos?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_security_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
      school_data: {
        Row: {
          after_school_english_programs: Json | null
          anglo_popular_state_religious_schools: Json | null
          city_name: string
          confidence: string | null
          english_speaking_ganim: Json | null
          id: number
          international_schools: Json | null
          locality_id: number | null
          notes: string | null
          special_education_english: string | null
          ulpan_options: Json | null
        }
        Insert: {
          after_school_english_programs?: Json | null
          anglo_popular_state_religious_schools?: Json | null
          city_name: string
          confidence?: string | null
          english_speaking_ganim?: Json | null
          id?: never
          international_schools?: Json | null
          locality_id?: number | null
          notes?: string | null
          special_education_english?: string | null
          ulpan_options?: Json | null
        }
        Update: {
          after_school_english_programs?: Json | null
          anglo_popular_state_religious_schools?: Json | null
          city_name?: string
          confidence?: string | null
          english_speaking_ganim?: Json | null
          id?: never
          international_schools?: Json | null
          locality_id?: number | null
          notes?: string | null
          special_education_english?: string | null
          ulpan_options?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "school_data_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
      synagogues: {
        Row: {
          anglo_programming: string | null
          city_name: string
          confidence: string | null
          denomination: string | null
          id: number
          language_of_services: string | null
          locality_id: number | null
          name: string
          neighborhood: string | null
          notes: string | null
          partnership_minyan: boolean | null
          website: string | null
          womens_tefillah: boolean | null
        }
        Insert: {
          anglo_programming?: string | null
          city_name: string
          confidence?: string | null
          denomination?: string | null
          id?: never
          language_of_services?: string | null
          locality_id?: number | null
          name: string
          neighborhood?: string | null
          notes?: string | null
          partnership_minyan?: boolean | null
          website?: string | null
          womens_tefillah?: boolean | null
        }
        Update: {
          anglo_programming?: string | null
          city_name?: string
          confidence?: string | null
          denomination?: string | null
          id?: never
          language_of_services?: string | null
          locality_id?: number | null
          name?: string
          neighborhood?: string | null
          notes?: string | null
          partnership_minyan?: boolean | null
          website?: string | null
          womens_tefillah?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "synagogues_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
      }
      transportation_commute: {
        Row: {
          ben_gurion_airport: Json | null
          city_name: string
          commute_to_jerusalem: Json | null
          commute_to_tel_aviv: Json | null
          cycling_infrastructure: string | null
          id: number
          light_rail: Json | null
          locality_id: number | null
          major_bus_routes: Json | null
          train_station: Json | null
        }
        Insert: {
          ben_gurion_airport?: Json | null
          city_name: string
          commute_to_jerusalem?: Json | null
          commute_to_tel_aviv?: Json | null
          cycling_infrastructure?: string | null
          id?: never
          light_rail?: Json | null
          locality_id?: number | null
          major_bus_routes?: Json | null
          train_station?: Json | null
        }
        Update: {
          ben_gurion_airport?: Json | null
          city_name?: string
          commute_to_jerusalem?: Json | null
          commute_to_tel_aviv?: Json | null
          cycling_infrastructure?: string | null
          id?: never
          light_rail?: Json | null
          locality_id?: number | null
          major_bus_routes?: Json | null
          train_station?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "transportation_commute_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
        ]
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
