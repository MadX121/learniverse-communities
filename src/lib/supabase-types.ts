
// Type definitions for Supabase tables
export interface ChatRoom {
  id: string;
  name: string;
  type: "private" | "group" | "community";
  created_at: string;
  updated_at: string;
  community_id?: string;
  is_encrypted: boolean;
}

export interface ChatMember {
  id: string;
  chat_room_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string | null;
  profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    id: string;
  };
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  user_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  sender?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    id: string;
  };
}

export interface UserPresence {
  id: string;
  user_id: string;
  status: "online" | "offline" | "away";
  last_active: string;
  is_typing: boolean;
  is_typing_in_room: string | null;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: "free" | "pro";
  starts_at: string;
  expires_at: string | null;
  payment_id: string | null;
  payment_status: string | null;
  amount: number | null;
  currency: string | null;
}

export interface UserUsage {
  id: string;
  user_id: string;
  communities_joined: number;
  projects_created: number;
  interviews_used: number;
  last_reset_date: string;
}
