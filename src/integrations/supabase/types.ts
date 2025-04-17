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
      activities: {
        Row: {
          action: string
          case_id: string
          details: string | null
          id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          case_id: string
          details?: string | null
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          case_id?: string
          details?: string | null
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_parties: {
        Row: {
          case_id: string
          created_at: string
          id: string
          party_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          party_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          party_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_parties_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_parties_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          court_file_number: string | null
          court_registry: string | null
          created_at: string
          file_number: string
          hearing_date: string | null
          id: string
          judge_name: string | null
          law_firm_id: string | null
          mortgage_id: string
          notes: string | null
          property_id: string
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
        }
        Insert: {
          court_file_number?: string | null
          court_registry?: string | null
          created_at?: string
          file_number: string
          hearing_date?: string | null
          id?: string
          judge_name?: string | null
          law_firm_id?: string | null
          mortgage_id: string
          notes?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Update: {
          court_file_number?: string | null
          court_registry?: string | null
          created_at?: string
          file_number?: string
          hearing_date?: string | null
          id?: string
          judge_name?: string | null
          law_firm_id?: string | null
          mortgage_id?: string
          notes?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_mortgage_id_fkey"
            columns: ["mortgage_id"]
            isOneToOne: false
            referencedRelation: "mortgages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      deadlines: {
        Row: {
          case_id: string
          complete: boolean
          created_at: string
          date: string
          description: string | null
          id: string
          title: string
          type: Database["public"]["Enums"]["deadline_type"]
          updated_at: string
        }
        Insert: {
          case_id: string
          complete?: boolean
          created_at?: string
          date: string
          description?: string | null
          id?: string
          title: string
          type: Database["public"]["Enums"]["deadline_type"]
          updated_at?: string
        }
        Update: {
          case_id?: string
          complete?: boolean
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["deadline_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string
          content: string | null
          created_at: string
          id: string
          law_firm_id: string | null
          status: Database["public"]["Enums"]["document_status"]
          title: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
          url: string | null
        }
        Insert: {
          case_id: string
          content?: string | null
          created_at?: string
          id?: string
          law_firm_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          title: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          url?: string | null
        }
        Update: {
          case_id?: string
          content?: string | null
          created_at?: string
          id?: string
          law_firm_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          title?: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          basic_enabled: boolean
          created_at: string
          description: string | null
          enterprise_enabled: boolean
          id: string
          name: string
          premium_enabled: boolean
          standard_enabled: boolean
          updated_at: string
        }
        Insert: {
          basic_enabled?: boolean
          created_at?: string
          description?: string | null
          enterprise_enabled?: boolean
          id?: string
          name: string
          premium_enabled?: boolean
          standard_enabled?: boolean
          updated_at?: string
        }
        Update: {
          basic_enabled?: boolean
          created_at?: string
          description?: string | null
          enterprise_enabled?: boolean
          id?: string
          name?: string
          premium_enabled?: boolean
          standard_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      law_firms: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          enabled: boolean
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          subscription_end_date: string | null
          subscription_start_date: string
          subscription_status: string
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          subscription_end_date?: string | null
          subscription_start_date?: string
          subscription_status?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          subscription_end_date?: string | null
          subscription_start_date?: string
          subscription_status?: string
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      mortgages: {
        Row: {
          arrears: number | null
          created_at: string
          current_balance: number
          id: string
          interest_rate: number
          law_firm_id: string | null
          payment_amount: number | null
          payment_frequency:
            | Database["public"]["Enums"]["payment_frequency"]
            | null
          per_diem_interest: number
          principal: number
          registration_number: string
          start_date: string
          updated_at: string
        }
        Insert: {
          arrears?: number | null
          created_at?: string
          current_balance: number
          id?: string
          interest_rate: number
          law_firm_id?: string | null
          payment_amount?: number | null
          payment_frequency?:
            | Database["public"]["Enums"]["payment_frequency"]
            | null
          per_diem_interest: number
          principal: number
          registration_number: string
          start_date: string
          updated_at?: string
        }
        Update: {
          arrears?: number | null
          created_at?: string
          current_balance?: number
          id?: string
          interest_rate?: number
          law_firm_id?: string | null
          payment_amount?: number | null
          payment_frequency?:
            | Database["public"]["Enums"]["payment_frequency"]
            | null
          per_diem_interest?: number
          principal?: number
          registration_number?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mortgages_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          law_firm_id: string | null
          name: string
          phone: string | null
          type: Database["public"]["Enums"]["party_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          law_firm_id?: string | null
          name: string
          phone?: string | null
          type: Database["public"]["Enums"]["party_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          law_firm_id?: string | null
          name?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["party_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parties_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          law_firm_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          law_firm_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          law_firm_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          city: string
          created_at: string
          estimated_value: number | null
          id: string
          law_firm_id: string | null
          legal_description: string | null
          pid: string | null
          postal_code: string | null
          property_type: Database["public"]["Enums"]["property_type"]
          province: string
          street: string
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          estimated_value?: number | null
          id?: string
          law_firm_id?: string | null
          legal_description?: string | null
          pid?: string | null
          postal_code?: string | null
          property_type?: Database["public"]["Enums"]["property_type"]
          province?: string
          street: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          estimated_value?: number | null
          id?: string
          law_firm_id?: string | null
          legal_description?: string | null
          pid?: string | null
          postal_code?: string | null
          property_type?: Database["public"]["Enums"]["property_type"]
          province?: string
          street?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_law_firm_id_fkey"
            columns: ["law_firm_id"]
            isOneToOne: false
            referencedRelation: "law_firms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_feature: {
        Args: { user_id: string; feature_name: string }
        Returns: boolean
      }
      get_user_law_firm_id: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      case_status:
        | "New"
        | "Demand Letter Sent"
        | "Petition Filed"
        | "Order Nisi Granted"
        | "Redemption Period"
        | "Sale Process"
        | "Closed"
      deadline_type: "Statutory" | "Court" | "Internal" | "Client"
      document_status: "Draft" | "Finalized" | "Filed" | "Served"
      document_type:
        | "Demand Letter"
        | "Petition"
        | "Affidavit"
        | "Order Nisi"
        | "Conduct of Sale"
        | "Final Order"
        | "Other"
      party_type: "Borrower" | "Lender" | "ThirdParty" | "Lawyer" | "Client"
      payment_frequency: "Monthly" | "Bi-weekly" | "Weekly"
      property_type: "Residential" | "Commercial" | "Land" | "Other"
      subscription_tier: "basic" | "standard" | "premium" | "enterprise"
      user_role: "admin" | "manager" | "staff" | "client" | "system_admin"
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
      case_status: [
        "New",
        "Demand Letter Sent",
        "Petition Filed",
        "Order Nisi Granted",
        "Redemption Period",
        "Sale Process",
        "Closed",
      ],
      deadline_type: ["Statutory", "Court", "Internal", "Client"],
      document_status: ["Draft", "Finalized", "Filed", "Served"],
      document_type: [
        "Demand Letter",
        "Petition",
        "Affidavit",
        "Order Nisi",
        "Conduct of Sale",
        "Final Order",
        "Other",
      ],
      party_type: ["Borrower", "Lender", "ThirdParty", "Lawyer", "Client"],
      payment_frequency: ["Monthly", "Bi-weekly", "Weekly"],
      property_type: ["Residential", "Commercial", "Land", "Other"],
      subscription_tier: ["basic", "standard", "premium", "enterprise"],
      user_role: ["admin", "manager", "staff", "client", "system_admin"],
    },
  },
} as const
