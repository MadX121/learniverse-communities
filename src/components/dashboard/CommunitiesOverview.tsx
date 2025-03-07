
import { Users, Sparkles, MessageSquare, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  unreadMessages: number;
  avatarColor: string;
}

const CommunitiesOverview = () => {
  const communities: Community[] = [
    {
      id: "1",
      name: "Web Development",
      description: "Frontend and backend discussions",
      members: 1243,
      unreadMessages: 5,
      avatarColor: "bg-blue-500"
    },
    {
      id: "2",
      name: "Machine Learning",
      description: "AI, ML, and data science",
      members: 876,
      unreadMessages: 0,
      avatarColor: "bg-purple-500"
    },
    {
      id: "3",
      name: "UI/UX Design",
      description: "Design principles and tools",
      members: 542,
      unreadMessages: 2,
      avatarColor: "bg-pink-500"
    },
    {
      id: "4",
      name: "Career Development",
      description: "Professional growth and networking",
      members: 1021,
      unreadMessages: 0,
      avatarColor: "bg-green-500"
    }
  ];

  return (
    <div className="bg-secondary/30 rounded-xl p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Your Communities</h3>
        <Link 
          to="/communities" 
          className="text-primary hover:underline text-sm flex items-center gap-1"
        >
          Explore <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      
      <div className="space-y-3">
        {communities.map((community) => (
          <Link 
            to={`/communities/${community.id}`} 
            key={community.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className={cn("w-10 h-10 rounded-md flex items-center justify-center", community.avatarColor)}>
              <Users className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm line-clamp-1">{community.name}</h4>
                {community.unreadMessages > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary">{community.unreadMessages}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{community.description}</p>
              <div className="text-xs text-foreground/60 mt-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> 
                {community.members.toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-4">
        <Link 
          to="/communities/new" 
          className="flex items-center justify-center gap-2 w-full p-2 rounded-lg border border-dashed border-white/20 hover:bg-white/5 transition-colors text-sm"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          Create New Community
        </Link>
      </div>
    </div>
  );
};

export default CommunitiesOverview;
