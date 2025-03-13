
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
  Folder
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
  const { id: projectId } = useParams();
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

      setProject(projectData as Project);
      setMembers(membersData as ProjectMember[]);
      
      // Find project creator
      const creator = membersData.find(member => member.is_creator);
      if (creator) setCreator(creator);
      
      // Check if user has liked the project
      if (user) {
        const { data: likeData } = await supabase
          .from("project_likes")
          .select("*")
          .eq("project_id", projectId)
          .eq("user_id", user.id)
          .single();
          
        setIsLiked(!!likeData);
      }
      
      // Get total likes count
      const { count } = await supabase
        .from("project_likes")
        .select("*", { count: "exact" })
        .eq("project_id", projectId);
        
      setLikesCount(count || 0);
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
      const { data, error } = await supabase
        .from("project_comments")
        .select(`
          id, 
          content, 
          created_at, 
          user_id,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      const formattedComments = data.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        profile: comment.profiles
      }));
      
      setComments(formattedComments);
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
        await supabase
          .from("project_likes")
          .delete()
          .eq("project_id", projectId)
          .eq("user_id", user.id);
          
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        await supabase
          .from("project_likes")
          .insert({
            project_id: projectId,
            user_id: user.id
          });
          
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
      
      const { data, error } = await supabase
        .from("project_comments")
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`
          id, 
          content, 
          created_at, 
          user_id,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .single();
        
      if (error) throw error;
      
      const formattedComment = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        user_id: data.user_id,
        profile: data.profiles
      };
      
      setComments(prev => [formattedComment, ...prev]);
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
                <Button variant="outline" className="w-full">
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
                    members.map((member) => (
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
                            </p>
                            {member.is_creator && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Project Creator
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No team members yet</p>
                    </div>
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
      </main>
    </div>
  );
};

export default ProjectDetails;
