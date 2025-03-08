
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Plus, Users, Search, MessageSquare, LogOut, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface Community {
  id: string;
  name: string;
  description: string;
  avatar_color: string;
  created_at: string;
  members_count: number;
  is_member: boolean;
  is_creator: boolean;
}

const Communities = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyJoined, setShowOnlyJoined] = useState(false);
  
  // New community form state
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    avatarColor: ""
  });

  // Avatar colors options
  const avatarColors = [
    "bg-blue-500", "bg-green-500", "bg-red-500", "bg-yellow-500", 
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
  ];

  useEffect(() => {
    document.title = "Communities | Learniverse";
    // Redirect if not logged in
    if (!loading && !user) {
      navigate("/auth");
    }
    
    if (user) {
      fetchCommunities();
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    filterCommunities(searchTerm, showOnlyJoined);
  }, [communities, searchTerm, showOnlyJoined]);

  const fetchCommunities = async () => {
    try {
      setIsLoading(true);
      
      // Get all community IDs the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user?.id);
      
      if (memberError) throw memberError;
      
      const userCommunityIds = new Set((memberData || []).map(item => item.community_id));
      
      // Get all communities with membership info
      const { data, error } = await supabase
        .from('communities')
        .select('*');
      
      if (error) throw error;
      
      // Count members for each community
      const communitiesWithCounts = await Promise.all((data || []).map(async community => {
        const { count, error: countError } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', community.id);
        
        if (countError) throw countError;
        
        // Check if this user created the community (first member)
        const { data: creatorData, error: creatorError } = await supabase
          .from('community_members')
          .select('*')
          .eq('community_id', community.id)
          .order('joined_at', { ascending: true })
          .limit(1);
        
        if (creatorError) throw creatorError;
        
        const isCreator = creatorData && creatorData.length > 0 && creatorData[0].user_id === user?.id;
        
        return {
          ...community,
          members_count: count || 0,
          is_member: userCommunityIds.has(community.id),
          is_creator: isCreator
        };
      }));
      
      setCommunities(communitiesWithCounts);
      setFilteredCommunities(communitiesWithCounts);
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast({
        title: "Error fetching communities",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCommunity = async () => {
    try {
      if (!newCommunity.name.trim()) {
        toast({
          title: "Missing information",
          description: "Community name is required",
          variant: "destructive"
        });
        return;
      }

      if (!newCommunity.avatarColor) {
        setNewCommunity({
          ...newCommunity,
          avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)]
        });
      }

      // First create the community
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .insert({
          name: newCommunity.name,
          description: newCommunity.description,
          avatar_color: newCommunity.avatarColor || avatarColors[Math.floor(Math.random() * avatarColors.length)]
        })
        .select();
      
      if (communityError) throw communityError;
      
      if (communityData && communityData.length > 0) {
        // Then add the creator as a member
        const { error: memberError } = await supabase
          .from('community_members')
          .insert({
            community_id: communityData[0].id,
            user_id: user?.id
          });
        
        if (memberError) throw memberError;
        
        // Log activity
        await supabase
          .from('activities')
          .insert({
            user_id: user?.id,
            type: 'community',
            title: 'Community Created',
            description: `You created the community "${newCommunity.name}"`
          });
        
        toast({
          title: "Community created",
          description: "Your new community has been created successfully"
        });
        
        // Refresh communities list
        fetchCommunities();
        resetNewCommunityForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating community:", error);
      toast({
        title: "Error creating community",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const joinCommunity = async (communityId: string, communityName: string) => {
    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user?.id
        });
      
      if (error) throw error;
      
      // Log activity
      await supabase
        .from('activities')
        .insert({
          user_id: user?.id,
          type: 'community',
          title: 'Community Joined',
          description: `You joined the community "${communityName}"`
        });
      
      toast({
        title: "Community joined",
        description: `You have successfully joined "${communityName}"`
      });
      
      // Update local state
      setCommunities(communities.map(community => 
        community.id === communityId 
          ? { ...community, is_member: true, members_count: community.members_count + 1 } 
          : community
      ));
    } catch (error) {
      console.error("Error joining community:", error);
      toast({
        title: "Error joining community",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const leaveCommunity = async (communityId: string, communityName: string) => {
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      // Log activity
      await supabase
        .from('activities')
        .insert({
          user_id: user?.id,
          type: 'community',
          title: 'Community Left',
          description: `You left the community "${communityName}"`
        });
      
      toast({
        title: "Community left",
        description: `You have left "${communityName}"`
      });
      
      // Update local state
      setCommunities(communities.map(community => 
        community.id === communityId 
          ? { ...community, is_member: false, members_count: Math.max(0, community.members_count - 1) } 
          : community
      ));
    } catch (error) {
      console.error("Error leaving community:", error);
      toast({
        title: "Error leaving community",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const deleteCommunity = async (communityId: string, communityName: string) => {
    try {
      // First delete all members (cascade will handle this, but doing it explicitly)
      const { error: memberError } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId);
      
      if (memberError) throw memberError;
      
      // Then delete all messages
      const { error: messageError } = await supabase
        .from('community_messages')
        .delete()
        .eq('community_id', communityId);
      
      if (messageError) throw messageError;
      
      // Finally delete the community
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);
      
      if (error) throw error;
      
      // Log activity
      await supabase
        .from('activities')
        .insert({
          user_id: user?.id,
          type: 'community',
          title: 'Community Deleted',
          description: `You deleted the community "${communityName}"`
        });
      
      toast({
        title: "Community deleted",
        description: `The community "${communityName}" has been deleted`
      });
      
      // Update local state
      setCommunities(communities.filter(community => community.id !== communityId));
    } catch (error) {
      console.error("Error deleting community:", error);
      toast({
        title: "Error deleting community",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const filterCommunities = (search: string, onlyJoined: boolean) => {
    let filtered = [...communities];
    
    // Apply joined filter
    if (onlyJoined) {
      filtered = filtered.filter(community => community.is_member);
    }
    
    // Apply search filter
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(community => 
        community.name.toLowerCase().includes(searchLower) || 
        community.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredCommunities(filtered);
  };

  const resetNewCommunityForm = () => {
    setNewCommunity({
      name: "",
      description: "",
      avatarColor: ""
    });
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Communities</h1>
            <p className="text-muted-foreground">Connect with learners in your field</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-4">
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              New Community
            </Button>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search communities..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button
              variant={showOnlyJoined ? "default" : "outline"}
              onClick={() => setShowOnlyJoined(!showOnlyJoined)}
            >
              {showOnlyJoined ? "Showing My Communities" : "Show All Communities"}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium">No communities found</h3>
              <p className="text-muted-foreground">
                {searchTerm || showOnlyJoined 
                  ? "Try changing your search filters"
                  : "Create your first community to get started"}
              </p>
              {!searchTerm && !showOnlyJoined && communities.length === 0 && (
                <Button 
                  onClick={() => setIsDialogOpen(true)} 
                  variant="outline" 
                  className="mt-4"
                >
                  Create Community
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <div key={community.id} className="bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-md flex items-center justify-center", community.avatar_color)}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{community.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{community.description}</p>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{community.members_count} members</span>
                        
                        <MessageSquare className="w-4 h-4 ml-4 mr-1" />
                        <span>Active discussions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                    {community.is_member ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mr-2"
                          onClick={() => navigate(`/communities/${community.id}`)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" /> Chat
                        </Button>
                        
                        {community.is_creator ? (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteCommunity(community.id, community.name)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => leaveCommunity(community.id, community.name)}
                          >
                            <LogOut className="w-4 h-4 mr-1" /> Leave
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => joinCommunity(community.id, community.name)}
                      >
                        Join Community
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Community Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Community</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Community Name</label>
              <Input
                id="name"
                placeholder="Enter community name"
                value={newCommunity.name}
                onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input
                id="description"
                placeholder="What is this community about?"
                value={newCommunity.description}
                onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Community Color</label>
              <div className="flex flex-wrap gap-2">
                {avatarColors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={cn(
                      color, 
                      "w-8 h-8 rounded-full transition-all",
                      newCommunity.avatarColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""
                    )}
                    onClick={() => setNewCommunity({...newCommunity, avatarColor: color})}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetNewCommunityForm();
              setIsDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={createCommunity}>Create Community</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Communities;
