
import { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, PaperclipIcon, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import ChatMessage from "./ChatMessage";
import { useAuth } from "@/hooks/useAuth";

export default function ChatInterface() {
  const { currentRoom, messages, sendMessage, updateTypingStatus, isLoadingMessages } = useChat();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing status
  useEffect(() => {
    const isTyping = messageText.length > 0;
    const typingTimeout = setTimeout(() => {
      updateTypingStatus(isTyping);
    }, 500);
    
    return () => {
      clearTimeout(typingTimeout);
      updateTypingStatus(false);
    };
  }, [messageText, updateTypingStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !selectedFile) return;
    
    try {
      setIsSubmitting(true);
      await sendMessage(messageText, selectedFile || undefined);
      setMessageText("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
        <div>
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p>Choose a chat room from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-3 flex items-center">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{currentRoom.name}</h2>
          <p className="text-xs text-muted-foreground">
            {currentRoom.type === "private" ? "Private conversation" : 
             currentRoom.type === "group" ? "Group conversation" : 
             "Community channel"}
          </p>
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoadingMessages ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-20 w-[300px]" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <p>No messages yet</p>
              <p className="text-sm">Be the first to send a message!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isOwnMessage={message.user_id === user?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Selected file preview */}
      {selectedFile && (
        <div className="p-2 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PaperclipIcon className="h-4 w-4" />
            <span className="text-sm truncate max-w-[180px]">
              {selectedFile.name}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearSelectedFile}
            className="h-6 px-2"
          >
            Remove
          </Button>
        </div>
      )}
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-3 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleFileSelect}
          disabled={isSubmitting}
        >
          <PaperclipIcon className="h-5 w-5" />
        </Button>
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={(!messageText.trim() && !selectedFile) || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
}
