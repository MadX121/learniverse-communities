
import { useEffect, useState } from "react";
import { Users, Sparkles, MessageSquare, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  unreadMessages: number;
  avatarColor: string;
}

const CommunitiesOverview = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCommunities();
    }
  }, [user]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      
      // Get all community IDs the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user?.id);
      
      if (memberError) throw memberError;
      
      if (!memberData || memberData.length === 0) {
        setCommunities([]);
        setLoading(false);
        return;
      }
      
      const communityIds = memberData.map(item => item.community_id);
      
      // Get community details
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .in('id', communityIds)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Get member counts for each community
      const communitiesWithDetails = await Promise.all((data || []).map(async community => {
        // Count members
        const { count: memberCount, error: countError } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', community.id);
        
        if (countError) throw countError;
        
        // Count unread messages (placeholder for now)
        // In a real app, you would track read/unread status
        const unreadCount = 0;
        
        return {
          id: community.id,
          name: community.name,
          description: community.description || "",
          members: memberCount || 0,
          unreadMessages: unreadCount,
          avatarColor: community.avatar_color || "bg-blue-500"
        };
      }));
      
      setCommunities(communitiesWithDetails);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

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
        {loading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse flex items-center gap-3 p-2">
              <div className="bg-white/10 w-10 h-10 rounded-md"></div>
              <div className="flex-1">
                <div className="bg-white/10 h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-white/10 h-3 w-full rounded mb-1"></div>
                <div className="bg-white/10 h-3 w-1/4 rounded"></div>
              </div>
            </div>
          ))
        ) : communities.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">You haven't joined any communities yet</p>
            <Link 
              to="/communities" 
              className="text-primary hover:underline text-sm mt-2 inline-block"
            >
              Browse communities
            </Link>
          </div>
        ) : (
          communities.map((community) => (
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
          ))
        )}
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
