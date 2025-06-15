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
      dog_images: {
        Row: {
          created_at: string
          dog_id: string
          file_size: number | null
          id: string
          image_name: string | null
          image_url: string
          is_thumbnail: boolean
          original_name: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          dog_id: string
          file_size?: number | null
          id?: string
          image_name?: string | null
          image_url: string
          is_thumbnail?: boolean
          original_name?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          dog_id?: string
          file_size?: number | null
          id?: string
          image_name?: string | null
          image_url?: string
          is_thumbnail?: boolean
          original_name?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dog_images_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      dogs: {
        Row: {
          age: Database["public"]["Enums"]["dog_age"]
          birthday: string | null
          breed: Database["public"]["Enums"]["dog_breed"]
          created_at: string
          gender: Database["public"]["Enums"]["dog_gender"]
          id: string
          is_active: boolean
          long_description: string | null
          name: string
          short_description: string | null
          thumbnail_url: string | null
          type: Database["public"]["Enums"]["dog_type"]
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age: Database["public"]["Enums"]["dog_age"]
          birthday?: string | null
          breed: Database["public"]["Enums"]["dog_breed"]
          created_at?: string
          gender: Database["public"]["Enums"]["dog_gender"]
          id?: string
          is_active?: boolean
          long_description?: string | null
          name: string
          short_description?: string | null
          thumbnail_url?: string | null
          type: Database["public"]["Enums"]["dog_type"]
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: Database["public"]["Enums"]["dog_age"]
          birthday?: string | null
          breed?: Database["public"]["Enums"]["dog_breed"]
          created_at?: string
          gender?: Database["public"]["Enums"]["dog_gender"]
          id?: string
          is_active?: boolean
          long_description?: string | null
          name?: string
          short_description?: string | null
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["dog_type"]
          updated_at?: string
          weight_kg?: number | null
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
      dog_age: "puppy" | "adult"
      dog_breed: "yorkshire_terrier" | "pomeranian"
      dog_gender: "male" | "female"
      dog_type: "puppy" | "adult_male" | "adult_female"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dog_age: ["puppy", "adult"],
      dog_breed: ["yorkshire_terrier", "pomeranian"],
      dog_gender: ["male", "female"],
      dog_type: ["puppy", "adult_male", "adult_female"],
    },
  },
} as const
