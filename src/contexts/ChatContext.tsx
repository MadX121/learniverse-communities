
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useStorage } from "@/hooks/useStorage";
import { STORAGE_BUCKETS } from "@/lib/storage-utils";
import { ChatRoom, ChatMember, ChatMessage, UserPresence } from "@/lib/supabase-types";

interface ChatContextType {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  members: ChatMember[];
  presence: Record<string, UserPresence>;
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;
  setCurrentRoom: (room: ChatRoom | null) => void;
  sendMessage: (content: string, media?: File) => Promise<void>;
  createRoom: (name: string, type: "private" | "group" | "community", memberIds: string[], communityId?: string) => Promise<ChatRoom | null>;
  updateTypingStatus: (isTyping: boolean) => Promise<void>;
  markMessagesAsRead: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { uploadFile } = useStorage({ bucketName: STORAGE_BUCKETS.COMMUNITY });
  
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [presence, setPresence] = useState<Record<string, UserPresence>>({});
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch all chat rooms the user is a member of
  const fetchRooms = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoadingRooms(true);
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(`
          *,
          chat_room_members!inner(user_id)
        `)
        .eq("chat_room_members.user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching chat rooms:", error);
        toast.error("Failed to load chat rooms");
        return;
      }

      // Filter out the chat_room_members array from each room
      const formattedRooms = data.map(room => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { chat_room_members, ...roomData } = room;
        return roomData as unknown as ChatRoom;
      });

      setRooms(formattedRooms);
    } catch (error) {
      console.error("Error in fetchRooms:", error);
      toast.error("Failed to load chat rooms");
    } finally {
      setIsLoadingRooms(false);
    }
  }, [user]);

  // Fetch messages for the current room
  const fetchMessages = useCallback(async () => {
    if (!user || !currentRoom) return;

    try {
      setIsLoadingMessages(true);
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles(id, full_name, username, avatar_url)
        `)
        .eq("chat_room_id", currentRoom.id)
        .order("created_at");

      if (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
        return;
      }

      setMessages(data as unknown as ChatMessage[]);
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user, currentRoom]);

  // Fetch members for the current room
  const fetchMembers = useCallback(async () => {
    if (!user || !currentRoom) return;

    try {
      const { data, error } = await supabase
        .from("chat_room_members")
        .select(`
          *,
          profile:profiles(id, full_name, username, avatar_url)
        `)
        .eq("chat_room_id", currentRoom.id);

      if (error) {
        console.error("Error fetching members:", error);
        toast.error("Failed to load chat members");
        return;
      }

      setMembers(data as unknown as ChatMember[]);
    } catch (error) {
      console.error("Error in fetchMembers:", error);
      toast.error("Failed to load chat members");
    }
  }, [user, currentRoom]);

  // Update user presence
  const updatePresence = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_presence")
        .upsert({
          user_id: user.id,
          status: "online",
          last_active: new Date().toISOString(),
          is_typing: false,
          is_typing_in_room: null
        });

      if (error) {
        console.error("Error updating presence:", error);
      }
    } catch (error) {
      console.error("Error in updatePresence:", error);
    }
  }, [user]);

  // Update typing status
  const updateTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!user || !currentRoom) return;

    try {
      const { error } = await supabase
        .from("user_presence")
        .upsert({
          user_id: user.id,
          status: "online",
          last_active: new Date().toISOString(),
          is_typing: isTyping,
          is_typing_in_room: isTyping ? currentRoom.id : null
        });

      if (error) {
        console.error("Error updating typing status:", error);
      }
    } catch (error) {
      console.error("Error in updateTypingStatus:", error);
    }
  }, [user, currentRoom]);

  // Send a message
  const sendMessage = useCallback(async (content: string, media?: File) => {
    if (!user || !currentRoom) return;

    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload media if provided
      if (media) {
        mediaType = media.type.split('/')[0]; // 'image', 'video', etc.
        const filePath = `${user.id}/${Date.now()}_${media.name}`;
        
        // Upload file and get URL
        const uploadResult = await uploadFile(STORAGE_BUCKETS.COMMUNITY, filePath, media);
        
        if (uploadResult) {
          mediaUrl = `${STORAGE_BUCKETS.COMMUNITY}/${filePath}`;
        }
      }

      // Send message
      const { error } = await supabase
        .from("messages")
        .insert({
          chat_room_id: currentRoom.id,
          user_id: user.id,
          content,
          media_url: mediaUrl,
          media_type: mediaType,
          is_encrypted: currentRoom.is_encrypted,
          is_read: false,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
        return;
      }

      // Update room's updated_at timestamp
      await supabase
        .from("chat_rooms")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", currentRoom.id);

    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast.error("Failed to send message");
    }
  }, [user, currentRoom, uploadFile]);

  // Create a new chat room
  const createRoom = useCallback(async (
    name: string,
    type: "private" | "group" | "community",
    memberIds: string[],
    communityId?: string
  ): Promise<ChatRoom | null> => {
    if (!user) return null;

    try {
      // Create the room
      const { data: roomData, error: roomError } = await supabase
        .from("chat_rooms")
        .insert({
          name,
          type,
          community_id: communityId,
          is_encrypted: false, // Default to non-encrypted
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (roomError) {
        console.error("Error creating chat room:", roomError);
        toast.error("Failed to create chat room");
        return null;
      }

      // Add all members including the creator
      const allMemberIds = [...new Set([user.id, ...memberIds])];
      
      const membersToInsert = allMemberIds.map(memberId => ({
        chat_room_id: (roomData as unknown as ChatRoom).id,
        user_id: memberId,
        joined_at: new Date().toISOString(),
      }));

      const { error: membersError } = await supabase
        .from("chat_room_members")
        .insert(membersToInsert);

      if (membersError) {
        console.error("Error adding members to chat room:", membersError);
        toast.error("Failed to add members to chat room");
        
        // Clean up - delete the room if we couldn't add members
        await supabase
          .from("chat_rooms")
          .delete()
          .eq("id", (roomData as unknown as ChatRoom).id);
          
        return null;
      }

      toast.success("Chat room created successfully");
      fetchRooms(); // Refresh rooms list
      return roomData as unknown as ChatRoom;
    } catch (error) {
      console.error("Error in createRoom:", error);
      toast.error("Failed to create chat room");
      return null;
    }
  }, [user, fetchRooms]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!user || !currentRoom) return;

    try {
      // Update messages
      const { error: messagesError } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("chat_room_id", currentRoom.id)
        .neq("user_id", user.id)
        .eq("is_read", false);

      if (messagesError) {
        console.error("Error marking messages as read:", messagesError);
        return;
      }

      // Update last_read_at in chat_room_members
      const { error: memberError } = await supabase
        .from("chat_room_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("chat_room_id", currentRoom.id)
        .eq("user_id", user.id);

      if (memberError) {
        console.error("Error updating last_read_at:", memberError);
      }
    } catch (error) {
      console.error("Error in markMessagesAsRead:", error);
    }
  }, [user, currentRoom]);

  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      fetchRooms();
      updatePresence();
    } else {
      setRooms([]);
      setCurrentRoom(null);
      setMessages([]);
      setMembers([]);
      setPresence({});
    }
  }, [user, fetchRooms, updatePresence]);

  // Load room-specific data when current room changes
  useEffect(() => {
    if (currentRoom) {
      fetchMessages();
      fetchMembers();
      markMessagesAsRead();
    } else {
      setMessages([]);
      setMembers([]);
    }
  }, [currentRoom, fetchMessages, fetchMembers, markMessagesAsRead]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to presence changes
    const presenceChannel = supabase
      .channel("presence-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
        },
        (payload) => {
          const presenceData = payload.new as UserPresence;
          setPresence(prev => ({
            ...prev,
            [presenceData.user_id]: presenceData
          }));
        }
      )
      .subscribe();

    // Subscribe to messages in the current room
    let messagesChannel;
    if (currentRoom) {
      messagesChannel = supabase
        .channel(`room-${currentRoom.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_room_id=eq.${currentRoom.id}`,
          },
          async (payload) => {
            const newMessage = payload.new as unknown as ChatMessage;
            
            // Fetch sender details
            const { data: senderData } = await supabase
              .from("profiles")
              .select("id, full_name, username, avatar_url")
              .eq("id", newMessage.user_id)
              .single();
              
            newMessage.sender = senderData || undefined;
            
            // Add message to state
            setMessages(prev => [...prev, newMessage]);
            
            // Auto-mark as read if it's the current room and not from the current user
            if (newMessage.user_id !== user.id) {
              markMessagesAsRead();
            }
          }
        )
        .subscribe();
    }

    // Clean up
    return () => {
      supabase.removeChannel(presenceChannel);
      if (messagesChannel) {
        supabase.removeChannel(messagesChannel);
      }
    };
  }, [user, currentRoom, markMessagesAsRead]);

  return (
    <ChatContext.Provider
      value={{
        rooms,
        currentRoom,
        messages,
        members,
        presence,
        isLoadingRooms,
        isLoadingMessages,
        setCurrentRoom,
        sendMessage,
        createRoom,
        updateTypingStatus,
        markMessagesAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export type { ChatRoom, ChatMember, ChatMessage, UserPresence };
