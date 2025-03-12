
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, GitMerge, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

type ProjectStatus = "planned" | "active" | "completed";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  collaborators: number;
}

interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

const ProjectsOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchPendingRequests();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      // First get project IDs where the user is the creator
      const { data: userProjects, error: projectsError } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user?.id)
        .eq("is_creator", true);

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
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          `)
          .in("project_id", projectIds)
          .eq("status", "pending");

        if (requestsError) throw requestsError;

        // Transform the results to flatten the structure
        const transformedRequests = (requests || []).map(req => ({
          id: req.id,
          project_id: req.project_id,
          user_id: req.user_id,
          status: req.status,
          username: req.profiles?.username,
          full_name: req.profiles?.full_name,
          avatar_url: req.profiles?.avatar_url
        }));

        setPendingRequests(transformedRequests);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter(project => project.status === status);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "planned":
        return "text-blue-500";
      case "active":
        return "text-green-500";
      case "completed":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="bg-secondary/30 rounded-xl p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Projects Overview</h3>
        <Link
          to="/projects"
          className="text-primary hover:underline text-sm flex items-center gap-1"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <GitMerge className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h4 className="text-sm font-medium mb-1">No projects yet</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Create your first project to see it here
          </p>
          <Button size="sm" onClick={() => navigate("/projects")}>
            Create Project
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.length > 0 && (
            <div className="rounded-lg bg-yellow-500/10 p-3 mb-4">
              <div className="flex items-center gap-2 text-yellow-500 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Pending Join Requests</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You have {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''} to review
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2" 
                onClick={() => navigate("/projects")}
              >
                Review Requests
              </Button>
            </div>
          )}

          {["active", "planned", "completed"].map((status) => {
            const statusProjects = getProjectsByStatus(status as ProjectStatus);
            if (statusProjects.length === 0) return null;

            return (
              <div key={status}>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className={getStatusColor(status as ProjectStatus)}>●</span>
                  {status.charAt(0).toUpperCase() + status.slice(1)} Projects
                </h4>
                <div className="space-y-2">
                  {statusProjects.slice(0, 2).map((project) => (
                    <div
                      key={project.id}
                      className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-sm font-medium">{project.title}</h5>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {project.collaborators}
                        </div>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsOverview;
