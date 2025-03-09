
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Users,
  UserPlus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "in-progress" | "completed" | "planned" | "delayed";
  progress: number;
  deadline: string | null;
  collaborators: number;
  isCreator: boolean;
  memberStatus: "pending" | "accepted" | "rejected" | null;
  pendingRequestsCount?: number;
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

// Type guard function to validate member status values
const isValidMemberStatus = (status: string): status is ProjectMember["status"] => {
  return ["pending", "accepted", "rejected"].includes(status);
};

const ProjectsOverview = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch user's project memberships
      const { data: memberData, error: memberError } = await supabase
        .from("project_members")
        .select("*")
        .eq("user_id", user?.id)
        .in("status", ["accepted", "pending"]);
      
      if (memberError) throw memberError;
      
      if (!memberData || memberData.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }
      
      // Get project IDs where user is a member
      const projectIds = memberData.map(member => member.project_id);
      
      // Fetch projects where user is a member
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .order("updated_at", { ascending: false })
        .limit(4);
      
      if (error) throw error;
      
      // Convert status from string to our union type and add membership info
      const typedProjects: Project[] = (data || []).map(project => {
        // Ensure the status is valid, otherwise default to "planned"
        const status = isValidStatus(project.status) ? project.status : "planned";
        
        // Find user's membership for this project
        const membership = memberData.find(m => m.project_id === project.id);
        
        // Validate member status
        let memberStatus: Project["memberStatus"] = null;
        if (membership?.status) {
          memberStatus = isValidMemberStatus(membership.status) 
            ? membership.status 
            : "pending";
        }
        
        return {
          id: project.id,
          title: project.title,
          description: project.description || "",
          status: status,
          progress: project.progress || 0,
          deadline: project.deadline,
          collaborators: project.collaborators || 1,
          isCreator: membership?.is_creator || false,
          memberStatus: memberStatus,
          pendingRequestsCount: 0
        };
      });
      
      // For creator projects, fetch pending request counts
      const creatorProjects = typedProjects.filter(project => project.isCreator);
      
      if (creatorProjects.length > 0) {
        const creatorProjectIds = creatorProjects.map(project => project.id);
        
        // Get pending request counts for each project
        const { data: pendingRequests, error: pendingError } = await supabase
          .from("project_members")
          .select("project_id, count")
          .in("project_id", creatorProjectIds)
          .eq("status", "pending")
          .neq("user_id", user?.id)
          .order("project_id")
          .order("count")
          .group("project_id");
        
        if (!pendingError && pendingRequests) {
          // Update projects with pending request counts
          const updatedProjects = typedProjects.map(project => {
            const pendingCount = pendingRequests.find(p => p.project_id === project.id);
            return {
              ...project,
              pendingRequestsCount: pendingCount ? parseInt(pendingCount.count) : 0
            };
          });
          
          setProjects(updatedProjects);
        } else {
          setProjects(typedProjects);
        }
      } else {
        setProjects(typedProjects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "planned":
        return <Circle className="h-4 w-4 text-gray-500" />;
      case "delayed":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "planned":
        return "Planned";
      case "delayed":
        return "Delayed";
      default:
        return status;
    }
  };

  const getMembershipBadge = (project: Project) => {
    if (project.isCreator) {
      return <Badge variant="outline" className="text-xs font-normal bg-purple-500/10 text-purple-500">Creator</Badge>;
    } else if (project.memberStatus === "accepted") {
      return <Badge variant="outline" className="text-xs font-normal bg-green-500/10 text-green-500">Member</Badge>;
    } else if (project.memberStatus === "pending") {
      return <Badge variant="outline" className="text-xs font-normal bg-yellow-500/10 text-yellow-500">Pending</Badge>;
    }
    return null;
  };

  return (
    <div className="bg-secondary/30 rounded-xl p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Projects</h3>
        <Link 
          to="/projects" 
          className="text-primary hover:underline text-sm flex items-center gap-1"
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      
      <div className="space-y-3 overflow-y-auto hide-scrollbar max-h-[350px]">
        {loading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="bg-white/10 h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-white/10 h-3 w-full rounded mb-3"></div>
                <div className="bg-white/10 h-2 w-full rounded mb-2"></div>
                <div className="flex justify-between mt-2">
                  <div className="bg-white/10 h-3 w-1/4 rounded"></div>
                  <div className="bg-white/10 h-3 w-1/4 rounded"></div>
                </div>
              </div>
            </div>
          ))
        ) : projects.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">No projects yet</p>
            <Link 
              to="/projects" 
              className="text-primary hover:underline text-sm mt-2 inline-block"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          projects.map((project) => (
            <Link to={`/projects`} key={project.id}>
              <div className="bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-lg">
                <div className="flex justify-between mb-2">
                  <h4 className="font-semibold text-sm line-clamp-1">{project.title}</h4>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(project.status)}
                    <span className="text-xs">{getStatusText(project.status)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{project.description}</p>
                
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress 
                    value={project.progress} 
                    className="h-1.5" 
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs font-normal bg-black/20">
                      Due {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}
                    </Badge>
                    {getMembershipBadge(project)}
                  </div>
                  <div className="flex items-center gap-2">
                    {project.pendingRequestsCount && project.pendingRequestsCount > 0 && (
                      <Badge variant="outline" className="text-xs font-normal bg-yellow-500/10 text-yellow-500 flex items-center gap-1">
                        <UserPlus className="h-3 w-3" />
                        {project.pendingRequestsCount}
                      </Badge>
                    )}
                    <span className="text-muted-foreground flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {project.collaborators}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsOverview;
