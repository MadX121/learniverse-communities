
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle,
  Clock,
  GitMerge
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

// Define types for the project and its members
type ProjectStatus = "planned" | "active" | "completed";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  is_creator: boolean;
  deadline: string | null;
  collaborators: number;
  created_at: string;
  user_id: string;
}

interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  is_creator: boolean;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Component for the Projects page
const Projects = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State variables
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [newProject, setNewProject] = useState<{
    title: string;
    description: string;
    status: ProjectStatus;
    deadline: string;
  }>({
    title: "",
    description: "",
    status: "planned",
    deadline: ""
  });

  useEffect(() => {
    document.title = "Projects | Learniverse";
    
    // Redirect if not logged in
    if (!authLoading && !user) {
      navigate("/auth");
    }
    
    if (user) {
      fetchProjects();
      fetchPendingRequests();
    }
  }, [authLoading, user, navigate]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      // Get all projects
      const { data: allProjects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (projectsError) throw projectsError;
      
      // Get projects the user has created
      const { data: ownProjects, error: ownProjectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (ownProjectsError) throw ownProjectsError;
      
      // Get projects the user has joined
      const { data: membershipData, error: membershipError } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", user?.id)
        .eq("status", "approved");
      
      if (membershipError) throw membershipError;
      
      // Extract project IDs from memberships
      const joinedProjectIds = membershipData?.map(item => item.project_id) || [];
      
      // Filter all projects to get the ones user has joined
      const userJoinedProjects = (allProjects || [])
        .filter(project => joinedProjectIds.includes(project.id));
      
      setProjects(allProjects || []);
      setUserProjects(ownProjects || []);
      setJoinedProjects(userJoinedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error fetching projects",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      // First get project IDs where the user is the creator
      const { data: userProjects, error: projectsError } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user?.id);

      if (projectsError) throw projectsError;

      if (userProjects && userProjects.length > 0) {
        const projectIds = userProjects.map(p => p.id);

        // Then fetch pending requests for those projects
        const { data: requests, error: requestsError } = await supabase
          .from("project_members")
          .select(`
            id,
            project_id,
            user_id,
            status,
            is_creator,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          `)
          .in("project_id", projectIds)
          .eq("status", "pending");

        if (requestsError) throw requestsError;

        setPendingRequests(requests || []);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const createProject = async () => {
    try {
      if (!newProject.title.trim()) {
        toast({
          title: "Title is required",
          description: "Please enter a title for your project",
          variant: "destructive"
        });
        return;
      }
      
      // Create the project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert([
          {
            title: newProject.title,
            description: newProject.description,
            status: newProject.status,
            deadline: newProject.deadline || null,
            user_id: user?.id,
            is_creator: true,
          }
        ])
        .select();
      
      if (projectError) {
        throw projectError;
      }
      
      if (projectData && projectData.length > 0) {
        // Add the creator as a project member
        const { error: memberError } = await supabase
          .from("project_members")
          .insert([
            {
              project_id: projectData[0].id,
              user_id: user?.id,
              status: "approved",
              is_creator: true,
            }
          ]);
        
        if (memberError) throw memberError;
        
        // Log activity
        await supabase
          .from("activities")
          .insert([
            {
              user_id: user?.id,
              type: "project",
              title: "Project Created",
              description: `You created a new project: ${newProject.title}`
            }
          ]);
        
        toast({
          title: "Project created",
          description: "Your new project has been created successfully"
        });
        
        // Refresh projects list
        fetchProjects();
        resetNewProjectForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error creating project",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const joinProject = async (projectId: string, projectTitle: string) => {
    try {
      // Check if user already has a pending request
      const { data: existingRequest, error: checkError } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", user?.id);
      
      if (checkError) throw checkError;
      
      if (existingRequest && existingRequest.length > 0) {
        toast({
          title: "Request already exists",
          description: "You have already requested to join this project",
          variant: "destructive"
        });
        return;
      }
      
      // Create the join request
      const { error } = await supabase
        .from("project_members")
        .insert([
          {
            project_id: projectId,
            user_id: user?.id,
            status: "pending",
            is_creator: false,
          }
        ]);
      
      if (error) throw error;
      
      // Log activity
      await supabase
        .from("activities")
        .insert([
          {
            user_id: user?.id,
            type: "project",
            title: "Join Request Sent",
            description: `You requested to join: ${projectTitle}`
          }
        ]);
      
      toast({
        title: "Request sent",
        description: "Your request to join the project has been sent"
      });
      
      // Refresh projects
      fetchProjects();
    } catch (error) {
      console.error("Error joining project:", error);
      toast({
        title: "Error sending request",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const respondToJoinRequest = async (requestId: string, projectId: string, userId: string, response: "approved" | "rejected") => {
    try {
      // Update the status of the join request
      const { error } = await supabase
        .from("project_members")
        .update({ status: response })
        .eq("id", requestId);
      
      if (error) throw error;
      
      // Get the project title for notifications
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("title")
        .eq("id", projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // Log activity for the user who requested to join
      await supabase
        .from("activities")
        .insert([
          {
            user_id: userId,
            type: "project",
            title: response === "approved" ? "Join Request Approved" : "Join Request Declined",
            description: `Your request to join "${projectData.title}" was ${response}`,
            read: false
          }
        ]);
      
      // Also log activity for the project owner
      await supabase
        .from("activities")
        .insert([
          {
            user_id: user?.id,
            type: "project",
            title: response === "approved" ? "New Team Member" : "Request Declined",
            description: response === "approved" 
              ? `You approved a new member for "${projectData.title}"` 
              : `You declined a join request for "${projectData.title}"`,
            read: true
          }
        ]);
      
      // If approved, update the project collaborators count
      if (response === "approved") {
        const { data: currentProject, error: countError } = await supabase
          .from("projects")
          .select("collaborators")
          .eq("id", projectId)
          .single();
        
        if (countError) throw countError;
        
        const { error: updateError } = await supabase
          .from("projects")
          .update({ collaborators: (currentProject.collaborators || 0) + 1 })
          .eq("id", projectId);
        
        if (updateError) throw updateError;
      }
      
      toast({
        title: response === "approved" ? "Request approved" : "Request declined",
        description: response === "approved" 
          ? "The user can now collaborate on this project" 
          : "The user's request has been declined",
      });
      
      // Refresh pending requests
      fetchPendingRequests();
      fetchProjects();
    } catch (error) {
      console.error("Error responding to join request:", error);
      toast({
        title: "Error processing request",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];
    
    // Apply tab filter
    if (activeTab === "my") {
      filtered = [...userProjects];
    } else if (activeTab === "joined") {
      filtered = [...joinedProjects];
    }
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const resetNewProjectForm = () => {
    setNewProject({
      title: "",
      description: "",
      status: "planned",
      deadline: ""
    });
  };

  const isUserMember = (project: Project) => {
    // Check if the user has created the project
    if (project.user_id === user?.id) return true;
    
    // Check if the project is in joined projects
    return joinedProjects.some(p => p.id === project.id);
  };

  const hasJoinRequest = (project: Project) => {
    return pendingRequests.some(req => 
      req.project_id === project.id && 
      req.user_id === user?.id
    );
  };

  // Calculate time ago from a timestamp
  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
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
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage your learning projects</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-4">
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              New Project
            </Button>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search projects..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                title="Filter projects"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="my">My Projects</TabsTrigger>
              <TabsTrigger value="joined">Joined Projects</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {pendingRequests.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Pending Join Requests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests.map((request) => {
                  // Find the project this request belongs to
                  const project = projects.find(p => p.id === request.project_id);
                  
                  if (!project) return null;
                  
                  return (
                    <div key={request.id} className="bg-yellow-500/10 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{project.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.profiles?.username || request.profiles?.full_name || "Anonymous user"} wants to join
                          </p>
                        </div>
                        <div className="bg-white/10 rounded-full p-1">
                          <Clock className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => respondToJoinRequest(request.id, request.project_id, request.user_id, "approved")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => respondToJoinRequest(request.id, request.project_id, request.user_id, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Decline
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5, 6].map((_, i) => (
                <div key={i} className="h-40 bg-white/5 rounded-lg"></div>
              ))}
            </div>
          ) : filterProjects().length === 0 ? (
            <div className="text-center py-16">
              <GitMerge className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                {activeTab === "all" 
                  ? "There are no projects yet." 
                  : activeTab === "my" 
                    ? "You haven't created any projects yet." 
                    : "You haven't joined any projects yet."}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>Create Project</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterProjects().map((project) => (
                <div key={project.id} className="bg-white/5 hover:bg-white/10 transition-colors rounded-lg overflow-hidden flex flex-col">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        project.status === "planned" ? "bg-blue-500/20 text-blue-500" :
                        project.status === "active" ? "bg-green-500/20 text-green-500" :
                        "bg-purple-500/20 text-purple-500"
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {project.description || "No description provided"}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{project.collaborators} members</span>
                      </div>
                      
                      {project.deadline && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Due {getTimeAgo(project.deadline)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 p-4 border-t border-white/10 flex justify-between">
                    {isUserMember(project) ? (
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        View Project
                      </Button>
                    ) : hasJoinRequest(project) ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled
                      >
                        Request Pending
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => joinProject(project.id, project.title)}
                      >
                        Request to Join
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Project Title</label>
              <Input
                id="title"
                placeholder="Enter project title"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input
                id="description"
                placeholder="What is this project about?"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select
                id="status"
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={newProject.status}
                onChange={(e) => setNewProject({...newProject, status: e.target.value as ProjectStatus})}
              >
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-medium">Deadline (Optional)</label>
              <Input
                id="deadline"
                type="date"
                value={newProject.deadline}
                onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetNewProjectForm();
              setIsDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={createProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
