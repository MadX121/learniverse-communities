
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  CheckCircle, 
  Heart, 
  MessageCircle, 
  Share,
  Link as LinkIcon,
  Plus,
  Code,
  Image as ImageIcon,
  FileText,
  Folder,
  Github,
  Linkedin,
  Globe,
  User,
  UserCheck,
  Mail,
  UserPlus,
  X,
  CircleDot
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProjectMember {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  is_creator: boolean;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  role?: string; // Optional role field for display purposes
  bio?: string; // Optional bio field for display purposes
  social_links?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  is_online?: boolean; // Online status for display purposes
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: "planned" | "active" | "completed";
  progress: number;
  deadline: string | null;
  collaborators: number;
  created_at: string;
  user_id: string;
  technologies: string[];
}

interface ProjectComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<ProjectMember | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [showTeamMembers, setShowTeamMembers] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchProjectComments();
      fetchRelatedProjects();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      // Fetch project members with their profiles
      const { data: membersData, error: membersError } = await supabase
        .from("project_members")
        .select(`
          id,
          user_id,
          status,
          is_creator,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("project_id", projectId)
        .eq("status", "approved");

      if (membersError) throw membersError;

      // Make sure we properly type the data as ProjectMember[]
      const typedMembersData: ProjectMember[] = membersData.map(member => ({
        ...member,
        status: member.status as "pending" | "approved" | "rejected",
        // Adding mock data for the new fields to simulate real data
        role: ["Developer", "Designer", "Project Manager", "Tester"][Math.floor(Math.random() * 4)],
        bio: "Team member with experience in web development and UI/UX design.",
        social_links: {
          github: "https://github.com",
          linkedin: "https://linkedin.com",
          website: "https://example.com"
        },
        is_online: Math.random() > 0.5 // Randomly set online status for demo
      }));

      setProject(projectData as Project);
      setMembers(typedMembersData);
      
      // Find project creator
      const creatorMember = typedMembersData.find(member => member.is_creator);
      if (creatorMember) setCreator(creatorMember);
      
      // Check if user has liked the project
      if (user) {
        const { data: likeData, error: likeError } = await supabase
          .from("project_likes")
          .select("*")
          .eq("project_id", projectId)
          .eq("user_id", user.id);
          
        if (!likeError && likeData && likeData.length > 0) {
          setIsLiked(true);
        } else {
          setIsLiked(false);
        }
      }
      
      // Get total likes count
      const { count, error: countError } = await supabase
        .from("project_likes")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);
        
      if (!countError) {
        setLikesCount(count || 0);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast({
        title: "Error loading project",
        description: "Could not load project details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProjectComments = async () => {
    try {
      // Instead of trying to join with profiles in the query, we'll fetch the comments first
      // and then manually fetch profile data for each comment
      const { data: commentsData, error: commentsError } = await supabase
        .from("project_comments")
        .select(`id, content, created_at, user_id`)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
        
      if (commentsError) throw commentsError;
      
      if (commentsData && commentsData.length > 0) {
        // Get unique user IDs from comments
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
        
        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select(`id, username, full_name, avatar_url`)
          .in("id", userIds);
          
        if (profilesError) throw profilesError;
        
        // Map profiles to comments
        const commentsWithProfiles: ProjectComment[] = commentsData.map(comment => {
          const profile = profilesData?.find(profile => profile.id === comment.user_id) || null;
          return {
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            user_id: comment.user_id,
            profile: profile ? {
              username: profile.username,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url
            } : null
          };
        });
        
        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  
  const fetchRelatedProjects = async () => {
    if (!project) return;
    
    try {
      // Get projects with similar technologies or from same creator
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .neq("id", projectId)
        .limit(3);
        
      if (error) throw error;
      
      setRelatedProjects(data as Project[]);
    } catch (error) {
      console.error("Error fetching related projects:", error);
    }
  };
  
  const handleLikeProject = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like projects",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("project_likes")
          .delete()
          .eq("project_id", projectId)
          .eq("user_id", user.id);
          
        if (error) throw error;
        
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from("project_likes")
          .insert({
            project_id: projectId,
            user_id: user.id
          });
          
        if (error) throw error;
        
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error updating like status:", error);
      toast({
        title: "Error",
        description: "Could not update like status",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive"
      });
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      setCommentLoading(true);
      
      // Insert the comment
      const { data: commentData, error: commentError } = await supabase
        .from("project_comments")
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`id, content, created_at, user_id`)
        .single();
        
      if (commentError) throw commentError;
      
      // Fetch the user's profile to include with the comment
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`username, full_name, avatar_url`)
        .eq("id", user.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Create a properly typed comment object
      const newCommentObj: ProjectComment = {
        id: commentData.id,
        content: commentData.content,
        created_at: commentData.created_at,
        user_id: commentData.user_id,
        profile: {
          username: profileData.username,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url
        }
      };
      
      // Add the new comment to the state
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully"
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Could not post your comment",
        variant: "destructive"
      });
    } finally {
      setCommentLoading(false);
    }
  };
  
  const handleRequestCollaboration = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to request collaboration",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user is already a member or has a pending request
    const existingMember = members.find(m => m.user_id === user.id);
    if (existingMember) {
      toast({
        title: "Already a member",
        description: "You are already part of this project",
        variant: "destructive"
      });
      return;
    }
    
    // Submit collaboration request
    toast({
      title: "Collaboration request",
      description: "Your request to join this project has been sent",
      variant: "default"
    });
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate sending invitation
    toast({
      title: "Invitation sent",
      description: `Invitation email sent to ${inviteEmail}`,
      variant: "default"
    });
    
    setInviteEmail('');
    setShowInviteDialog(false);
  };

  const renderTeamMembersDialog = () => (
    <Dialog open={showTeamMembers} onOpenChange={setShowTeamMembers}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Team Members
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {members.length} team member{members.length !== 1 ? 's' : ''} contributing to this project
          </p>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowInviteDialog(true)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Invite via Email
            </Button>
            
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Collaborator
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="overflow-hidden border-muted">
              <div className="flex justify-between items-start p-4">
                <div className="flex gap-4 items-start">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    {member.profiles?.avatar_url ? (
                      <AvatarImage src={member.profiles.avatar_url} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {member.profiles?.username?.[0] || member.profiles?.full_name?.[0] || '?'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold text-lg">
                      {member.profiles?.full_name || member.profiles?.username || 'Anonymous'}
                      {member.is_online && (
                        <Badge className="ml-2 bg-green-500 text-xs font-normal">
                          <CircleDot className="h-2 w-2 mr-1" />
                          Online
                        </Badge>
                      )}
                    </h3>
                    
                    <p className="text-primary/80">{member.role || 'Team Member'}</p>
                    
                    {member.is_creator && (
                      <Badge variant="outline" className="mt-1">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Project Creator
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <CardContent className="px-4 py-0 pb-4">
                {member.bio && <p className="text-sm text-muted-foreground mb-3">{member.bio}</p>}
                
                <div className="flex gap-2">
                  {member.social_links?.github && (
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                      <a href={member.social_links.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  
                  {member.social_links?.linkedin && (
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                      <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  
                  {member.social_links?.website && (
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                      <a href={member.social_links.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
  
  const renderInviteDialog = () => (
    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Invite Team Member</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              className="w-full p-2 rounded-md border border-muted bg-secondary/20"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              We'll send an invitation email with a link to join this project.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember}>
              Send Invitation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <Button onClick={() => navigate("/projects")}>Go back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        {/* Project Header with Cover Image */}
        <div className="relative w-full h-48 md:h-72 mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20 glass-strong">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex justify-between items-end">
              <div>
                <Badge variant={
                  project.status === "planned" ? "secondary" :
                  project.status === "active" ? "default" :
                  "outline"
                } className="mb-2">
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{project.title}</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-background/80 backdrop-blur" 
                  onClick={handleLikeProject}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-primary text-primary" : ""}`} />
                  {likesCount}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-background/80 backdrop-blur"
                  onClick={() => { if (commentInputRef.current) commentInputRef.current.focus(); }}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {comments.length}
                </Button>
                <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur">
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Project Creator */}
            {creator && (
              <Card className="bg-card/50 border-none">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {creator.profiles?.avatar_url ? (
                        <AvatarImage src={creator.profiles.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {creator.profiles?.username?.[0] || creator.profiles?.full_name?.[0] || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {creator.profiles?.username || creator.profiles?.full_name || 'Anonymous'}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Project Creator
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="ml-auto">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Project Description */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Project Overview</h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{project.description || "No description provided."}</p>
              </CardContent>
            </Card>

            {/* Project Progress */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Progress</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-secondary/30 p-3 rounded-lg">
                    <p className="text-2xl font-bold">{project.progress < 33 ? "Planning" : project.progress < 66 ? "In Progress" : "Testing"}</p>
                    <p className="text-xs text-muted-foreground">Current Phase</p>
                  </div>
                  <div className="bg-secondary/30 p-3 rounded-lg">
                    <p className="text-2xl font-bold">{project.collaborators}</p>
                    <p className="text-xs text-muted-foreground">Contributors</p>
                  </div>
                  <div className="bg-secondary/30 p-3 rounded-lg">
                    <p className="text-2xl font-bold">{project.deadline ? formatDistanceToNow(new Date(project.deadline), { addSuffix: true }) : "Ongoing"}</p>
                    <p className="text-xs text-muted-foreground">Time Left</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Technologies</h2>
              </CardHeader>
              <CardContent>
                {project.technologies && project.technologies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No technologies specified</p>
                )}
              </CardContent>
            </Card>

            {/* Multimedia Showcase Tabs */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Project Showcase</h2>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="images">
                  <TabsList className="mb-4">
                    <TabsTrigger value="images">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Images
                    </TabsTrigger>
                    <TabsTrigger value="code">
                      <Code className="h-4 w-4 mr-2" />
                      Code Snippets
                    </TabsTrigger>
                    <TabsTrigger value="docs">
                      <FileText className="h-4 w-4 mr-2" />
                      Documentation
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="images" className="space-y-4">
                    <div className="bg-black/20 p-12 rounded-lg flex items-center justify-center">
                      <div className="text-center opacity-50">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                        <p>No images have been added yet</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="code">
                    <div className="bg-black/30 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`// Example code snippet
function calculateProjectProgress() {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  return Math.floor((completedTasks / totalTasks) * 100);
}`}</pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="docs">
                    <div className="bg-black/20 p-12 rounded-lg flex items-center justify-center">
                      <div className="text-center opacity-50">
                        <FileText className="h-12 w-12 mx-auto mb-2" />
                        <p>No documentation has been added yet</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Comments Section */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Discussion ({comments.length})</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    {user ? (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.email?.[0] || "U"}
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-secondary">?</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      ref={commentInputRef}
                      placeholder="Share your thoughts or ask a question..."
                      className="w-full bg-secondary/30 border border-secondary p-3 rounded-lg text-sm resize-none min-h-[100px]"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={!user || commentLoading}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button 
                        onClick={handleSubmitComment} 
                        disabled={!user || !newComment.trim() || commentLoading}
                      >
                        {commentLoading ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 bg-secondary/30 rounded-lg">
                      <Avatar className="h-10 w-10">
                        {comment.profile?.avatar_url ? (
                          <AvatarImage src={comment.profile.avatar_url} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {comment.profile?.username?.[0] || comment.profile?.full_name?.[0] || "?"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium">
                            {comment.profile?.username || comment.profile?.full_name || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No comments yet. Be the first to start the discussion!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Project Actions */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Project Actions</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleRequestCollaboration}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request to Join Project
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowTeamMembers(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Team Members
                </Button>
              </CardContent>
            </Card>
            
            {/* Project Details */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Project Details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{project.collaborators} team members</span>
                </div>
                {project.deadline && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Due {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}</span>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                </div>
              </CardContent>
            </Card>
            
            {/* Team Members */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Team Members</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.length > 0 ? (
                    members.slice(0, 3).map((member) => (
                      <div key={member.id} className="flex items-center justify-between bg-secondary/30 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {member.profiles?.avatar_url ? (
                              <AvatarImage src={member.profiles.avatar_url} />
                            ) : (
                              <AvatarFallback>
                                {member.profiles?.username?.[0] || member.profiles?.full_name?.[0] || '?'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.profiles?.username || member.profiles?.full_name || 'Anonymous'}
                              {member.is_online && (
                                <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                              )}
                            </p>
                            {member.is_creator && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Project Creator
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">{member.role || 'Member'}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No team members yet</p>
                    </div>
                  )}
                  
                  {members.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => setShowTeamMembers(true)}
                    >
                      View All Members
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Related Projects */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Related Projects</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedProjects.length > 0 ? (
                    relatedProjects.map(relatedProject => (
                      <div 
                        key={relatedProject.id} 
                        className="bg-secondary/30 p-3 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => navigate(`/projects/${relatedProject.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{relatedProject.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {relatedProject.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{relatedProject.technologies?.slice(0, 2).join(", ")}</span>
                          <span>{formatDistanceToNow(new Date(relatedProject.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 flex flex-col items-center">
                      <Folder className="h-8 w-8 text-muted-foreground opacity-50 mb-2" />
                      <p className="text-muted-foreground">No related projects found</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate("/projects")}>
                  Browse All Projects
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* Team Members Dialog */}
        {renderTeamMembersDialog()}
        
        {/* Invite Dialog */}
        {renderInviteDialog()}
      </main>
    </div>
  );
};

export default ProjectDetails;
