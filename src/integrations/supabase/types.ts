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
          created_at: string | null
          description: string | null
          id: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_room_members: {
        Row: {
          chat_room_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          chat_room_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          chat_room_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          community_id: string | null
          created_at: string
          id: string
          is_encrypted: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          id?: string
          is_encrypted?: boolean
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          community_id?: string | null
          created_at?: string
          id?: string
          is_encrypted?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          avatar_color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          community_id: string
          content: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          community_id: string
          content: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          community_id?: string
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          category: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          feedback: string | null
          id: string
          score: number | null
          user_id: string
        }
        Insert: {
          category: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_room_id: string
          content: string | null
          created_at: string
          id: string
          is_encrypted: boolean
          is_read: boolean
          media_type: string | null
          media_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_room_id: string
          content?: string | null
          created_at?: string
          id?: string
          is_encrypted?: boolean
          is_read?: boolean
          media_type?: string | null
          media_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_room_id?: string
          content?: string | null
          created_at?: string
          id?: string
          is_encrypted?: boolean
          is_read?: boolean
          media_type?: string | null
          media_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_likes: {
        Row: {
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          id: string
          is_creator: boolean | null
          joined_at: string | null
          project_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_creator?: boolean | null
          joined_at?: string | null
          project_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_creator?: boolean | null
          joined_at?: string | null
          project_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_members_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_members_projects"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          collaborators: number
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          is_creator: boolean | null
          progress: number
          status: string
          technologies: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          collaborators?: number
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_creator?: boolean | null
          progress?: number
          status?: string
          technologies?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          collaborators?: number
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_creator?: boolean | null
          progress?: number
          status?: string
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          id: string
          improvement: number | null
          last_updated: string | null
          name: string
          score: number
          user_id: string
        }
        Insert: {
          id?: string
          improvement?: number | null
          last_updated?: string | null
          name: string
          score?: number
          user_id: string
        }
        Update: {
          id?: string
          improvement?: number | null
          last_updated?: string | null
          name?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          id: string
          is_typing: boolean
          is_typing_in_room: string | null
          last_active: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          is_typing?: boolean
          is_typing_in_room?: string | null
          last_active?: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          is_typing?: boolean
          is_typing_in_room?: string | null
          last_active?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_is_typing_in_room_fkey"
            columns: ["is_typing_in_room"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount: number | null
          currency: string | null
          expires_at: string | null
          id: string
          payment_id: string | null
          payment_status: string | null
          plan_type: string
          starts_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          plan_type?: string
          starts_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          plan_type?: string
          starts_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          communities_joined: number
          id: string
          interviews_used: number
          last_reset_date: string
          projects_created: number
          user_id: string
        }
        Insert: {
          communities_joined?: number
          id?: string
          interviews_used?: number
          last_reset_date?: string
          projects_created?: number
          user_id: string
        }
        Update: {
          communities_joined?: number
          id?: string
          interviews_used?: number
          last_reset_date?: string
          projects_created?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_reached_free_tier_limit: {
        Args: {
          user_uuid: string
          limit_type: string
        }
        Returns: boolean
      }
      is_pro_user: {
        Args: {
          user_uuid: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
