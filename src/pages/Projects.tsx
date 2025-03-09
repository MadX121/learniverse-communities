
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Plus, Calendar, X, Clock, CheckCircle2, Search, Users, ArrowRightLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "in-progress" | "completed" | "planned" | "delayed";
  progress: number;
  deadline: string | null;
  collaborators: number;
  created_at: string;
  isCreator: boolean;
  memberStatus: "pending" | "accepted" | "rejected" | null;
}

interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  is_creator: boolean;
  status: "pending" | "accepted" | "rejected";
  joined_at: string;
}

// Type guard function to validate status values
const isValidStatus = (status: string): status is Project["status"] => {
  return ["in-progress", "completed", "planned", "delayed"].includes(status);
};

// Function to convert Supabase data to Project type
const convertToProject = (data: any, members: ProjectMember[]): Project => {
  let status = data.status;
  
  // Ensure the status is valid, otherwise default to "planned"
  if (!isValidStatus(status)) {
    status = "planned";
  }
  
  // Find if current user is a member and their status
  const userMember = members.find(member => member.project_id === data.id);
  
  return {
    id: data.id,
    title: data.title,
    description: data.description || "",
    status: status,
    progress: data.progress || 0,
    deadline: data.deadline,
    collaborators: data.collaborators || 1,
    created_at: data.created_at,
    isCreator: userMember?.is_creator || false,
    memberStatus: userMember?.status || null
  };
};

const Projects = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    status: "planned" as const,
    deadline: "",
    collaborators: 1
  });

  useEffect(() => {
    document.title = "Projects | Learniverse";
    if (!loading && !user) {
      navigate("/auth");
    }
    
    if (user) {
      fetchProjects();
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    filterProjects(currentFilter, searchTerm);
  }, [projects, currentFilter, searchTerm]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all project membership data for current user
      const { data: memberData, error: memberError } = await supabase
        .from("project_members")
        .select("*")
        .eq("user_id", user?.id);
      
      if (memberError) throw memberError;
      
      setProjectMembers(memberData || []);
      
      // Fetch all projects
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Convert the data to the Project type with proper status validation
      const typedProjects = (data || []).map(project => 
        convertToProject(project, memberData || [])
      );
      
      setProjects(typedProjects);
      setFilteredProjects(typedProjects);
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

  const createProject = async () => {
    try {
      if (!newProject.title.trim()) {
        toast({
          title: "Missing information",
          description: "Project title is required",
          variant: "destructive"
        });
        return;
      }

      // Start a transaction to create both the project and project membership
      const { data, error } = await supabase
        .from("projects")
        .insert({
          title: newProject.title,
          description: newProject.description,
          status: newProject.status,
          deadline: newProject.deadline || null,
          collaborators: newProject.collaborators,
          user_id: user?.id
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add creator as project member
        const { error: memberError } = await supabase
          .from("project_members")
          .insert({
            project_id: data[0].id,
            user_id: user?.id,
            is_creator: true,
            status: "accepted"
          });
        
        if (memberError) throw memberError;
      }
      
      toast({
        title: "Project created",
        description: "Your new project has been created successfully"
      });
      
      // Refresh project data
      fetchProjects();
      
      resetNewProjectForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error creating project",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      
      if (error) throw error;
      
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully"
      });
      
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error deleting project",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const updateProjectStatus = async (projectId: string, newStatus: Project["status"], progress: number) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ 
          status: newStatus,
          progress: progress,
          updated_at: new Date().toISOString()
        })
        .eq("id", projectId);
      
      if (error) throw error;
      
      setProjects(projects.map(project => 
        project.id === projectId 
          ? { ...project, status: newStatus, progress: progress } 
          : project
      ));
      
      toast({
        title: "Project updated",
        description: `Project status changed to ${newStatus}`
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error updating project",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const requestToJoinProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("project_members")
        .insert({
          project_id: projectId,
          user_id: user?.id,
          is_creator: false,
          status: "pending"
        });
      
      if (error) throw error;
      
      toast({
        title: "Request sent",
        description: "Your request to join this project has been sent"
      });
      
      // Update local state
      setProjects(projects.map(project => 
        project.id === projectId 
          ? { ...project, memberStatus: "pending" } 
          : project
      ));
    } catch (error) {
      console.error("Error requesting to join project:", error);
      toast({
        title: "Error sending request",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const filterProjects = (filter: string, search: string) => {
    let filtered = [...projects];
    
    if (filter !== "all") {
      filtered = filtered.filter(project => project.status === filter);
    }
    
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchLower) || 
        project.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredProjects(filtered);
  };

  const resetNewProjectForm = () => {
    setNewProject({
      title: "",
      description: "",
      status: "planned",
      deadline: "",
      collaborators: 1
    });
  };

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "in-progress":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">In Progress</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500">Completed</Badge>;
      case "planned":
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">Planned</Badge>;
      case "delayed":
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500">Delayed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMembershipBadge = (project: Project) => {
    if (project.isCreator) {
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Creator</Badge>;
    } else if (project.memberStatus === "accepted") {
      return <Badge variant="outline" className="bg-green-500/10 text-green-500">Member</Badge>;
    } else if (project.memberStatus === "pending") {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
    } else if (project.memberStatus === "rejected") {
      return <Badge variant="outline" className="bg-red-500/10 text-red-500">Rejected</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            
            <Tabs 
              defaultValue="all" 
              className="w-full sm:w-auto"
              onValueChange={setCurrentFilter}
            >
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="planned">Planned</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground">
                {searchTerm || currentFilter !== "all" 
                  ? "Try changing your search filters"
                  : "Create your first project to get started"}
              </p>
              {!searchTerm && currentFilter === "all" && projects.length === 0 && (
                <Button 
                  onClick={() => setIsDialogOpen(true)} 
                  variant="outline" 
                  className="mt-4"
                >
                  Create Project
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(project.status)}
                      {getMembershipBadge(project)}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    {project.deadline ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">No deadline</span>
                    )}
                    <span className="text-muted-foreground">
                      {project.collaborators} {project.collaborators === 1 ? 'collaborator' : 'collaborators'}
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                    <div className="flex gap-2">
                      {project.isCreator && project.status !== "completed" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateProjectStatus(project.id, "completed", 100)}
                        >
                          Complete
                        </Button>
                      )}
                      {project.isCreator && project.status === "planned" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateProjectStatus(project.id, "in-progress", 25)}
                        >
                          Start
                        </Button>
                      )}
                      {!project.memberStatus && !project.isCreator && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => requestToJoinProject(project.id)}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                    {project.isCreator && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
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
                placeholder="Enter project description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select
                id="status"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                value={newProject.status}
                onChange={(e) => setNewProject({
                  ...newProject, 
                  status: e.target.value as "planned" | "in-progress" | "completed" | "delayed"
                })}
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
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
            
            <div className="space-y-2">
              <label htmlFor="collaborators" className="text-sm font-medium">Collaborators</label>
              <Input
                id="collaborators"
                type="number"
                min="1"
                value={newProject.collaborators}
                onChange={(e) => setNewProject({...newProject, collaborators: parseInt(e.target.value) || 1})}
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
