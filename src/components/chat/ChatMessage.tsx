
import { useState } from "react";
import { format } from "date-fns";
import { ChatMessage as ChatMessageType } from "@/contexts/ChatContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/string-utils";
import { File, Image, Video, AudioLines, AlertCircle } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const [imageError, setImageError] = useState(false);
  
  const sender = message.sender;
  const initials = getInitials(sender?.full_name || sender?.username || "User");
  const formattedTime = format(new Date(message.created_at), "h:mm a");
  
  // Media type icons
  const mediaIcons = {
    image: <Image className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
    audio: <AudioLines className="h-4 w-4" />,
    file: <File className="h-4 w-4" />,
    unknown: <AlertCircle className="h-4 w-4" />
  };
  
  // Function to get media icon based on media type
  const getMediaIcon = () => {
    if (!message.media_type) return null;
    
    switch (message.media_type) {
      case 'image': return mediaIcons.image;
      case 'video': return mediaIcons.video;
      case 'audio': return mediaIcons.audio;
      default: return mediaIcons.file;
    }
  };
  
  // Function to render media content
  const renderMedia = () => {
    if (!message.media_url || !message.media_type) return null;
    
    switch (message.media_type) {
      case 'image':
        return imageError ? (
          <div className="border rounded p-2 flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Image failed to load
          </div>
        ) : (
          <img 
            src={message.media_url} 
            alt="Attached image" 
            className="rounded-md max-w-full max-h-60 object-contain"
            onError={() => setImageError(true)}
          />
        );
      case 'video':
        return (
          <video 
            src={message.media_url} 
            controls 
            className="rounded-md max-w-full max-h-60"
          />
        );
      case 'audio':
        return (
          <audio 
            src={message.media_url} 
            controls 
            className="w-full"
          />
        );
      default:
        return (
          <a 
            href={message.media_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="border rounded p-2 flex items-center gap-2 hover:bg-muted"
          >
            {getMediaIcon()}
            <span className="text-sm">Download attachment</span>
          </a>
        );
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isOwnMessage && "flex-row-reverse"
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={sender?.avatar_url || undefined} alt={sender?.full_name || "User"} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "max-w-[80%]",
      )}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className={cn(
            "text-sm font-medium",
            isOwnMessage && "text-primary"
          )}>
            {isOwnMessage ? "You" : (sender?.full_name || sender?.username || "User")}
          </span>
          <span className="text-xs text-muted-foreground">
            {formattedTime}
          </span>
        </div>
        
        <div className={cn(
          "bg-muted rounded-lg p-3",
          isOwnMessage && "bg-primary/10"
        )}>
          {message.content && <div className="whitespace-pre-wrap mb-2">{message.content}</div>}
          {renderMedia()}
        </div>
      </div>
    </div>
  );
}
