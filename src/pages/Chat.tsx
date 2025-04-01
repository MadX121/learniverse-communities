
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatInterface from "@/components/chat/ChatInterface";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { MessageSquareIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarSize, setSidebarSize] = useState(20);
  const [contentSize, setContentSize] = useState(80);

  if (!user) {
    return (
      <PageLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in to access chats</h2>
            <p className="mb-6 text-muted-foreground">
              You need to be signed in to view and participate in chats.
            </p>
            <Button onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquareIcon className="h-8 w-8" />
            Chat
          </h1>
        </div>
        
        <div className="bg-card rounded-lg border overflow-hidden h-[calc(100vh-240px)]">
          <ChatProvider>
            <ResizablePanelGroup
              direction="horizontal"
              onLayout={(sizes) => {
                setSidebarSize(sizes[0]);
                setContentSize(sizes[1]);
              }}
            >
              <ResizablePanel 
                defaultSize={sidebarSize} 
                minSize={15}
                maxSize={30}
                className="hidden sm:block"
              >
                <ChatSidebar />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={contentSize}>
                <ChatInterface />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ChatProvider>
        </div>
      </div>
    </PageLayout>
  );
}
