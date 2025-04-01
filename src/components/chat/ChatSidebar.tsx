
import { useState } from "react";
import { useChat, ChatRoom } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Users, 
  Plus, 
  Search, 
  X, 
  User, 
  UserPlus, 
  Loader2 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/string-utils";
import { format } from "date-fns";

export default function ChatSidebar() {
  const { 
    rooms, 
    currentRoom, 
    setCurrentRoom, 
    isLoadingRooms,
    createRoom
  } = useChat();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState<"private" | "group">("private");
  const [isCreating, setIsCreating] = useState(false);
  
  // Filter rooms based on search term
  const filteredRooms = searchTerm
    ? rooms.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : rooms;
    
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    try {
      setIsCreating(true);
      const newRoom = await createRoom(newRoomName, newRoomType, []);
      if (newRoom) {
        setCurrentRoom(newRoom);
        setIsCreateDialogOpen(false);
        setNewRoomName("");
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <>
      <div className="w-full h-full flex flex-col border-r">
        <div className="p-3 border-b flex items-center justify-between">
          <h2 className="font-semibold">Messages</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {isLoadingRooms ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchTerm ? "No conversations match your search" : "No conversations yet"}
            </div>
          ) : (
            <div className="p-2">
              {filteredRooms.map((room) => (
                <ChatRoomItem
                  key={room.id}
                  room={room}
                  isActive={currentRoom?.id === room.id}
                  onClick={() => setCurrentRoom(room)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      
      {/* Create Room Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new conversation</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Conversation name</label>
              <Input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter a name..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newRoomType === "private" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setNewRoomType("private")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Private
                </Button>
                <Button
                  type="button"
                  variant={newRoomType === "group" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setNewRoomType("group")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Group
                </Button>
              </div>
            </div>
            
            {newRoomType === "group" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Add members</label>
                  <Button variant="ghost" size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="border rounded-md p-2 min-h-[100px] text-center flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">No members added yet</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can add members after creating the conversation.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRoom}
              disabled={!newRoomName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ChatRoomItemProps {
  room: ChatRoom;
  isActive: boolean;
  onClick: () => void;
}

function ChatRoomItem({ room, isActive, onClick }: ChatRoomItemProps) {
  // In a real app, we'd get the latest message, unread count, etc.
  // For now, using dummy data for illustration
  const lastMessageTime = room.updated_at ? format(new Date(room.updated_at), "h:mm a") : "";
  
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors",
        isActive && "bg-muted"
      )}
      onClick={onClick}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={undefined} alt={room.name} />
        <AvatarFallback>{getInitials(room.name)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate">{room.name}</h3>
          <span className="text-xs text-muted-foreground">{lastMessageTime}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground truncate">
            {/* Placeholder for last message */}
            {room.type === "private" ? "Private conversation" : "Group conversation"}
          </span>
          
          {room.type !== "private" && (
            <Badge variant="outline" className="ml-1 h-5 text-xs">
              {room.type === "group" ? (
                <Users className="h-3 w-3 mr-1" />
              ) : (
                <MessageSquare className="h-3 w-3 mr-1" />
              )}
              {room.type}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
