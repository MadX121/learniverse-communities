
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle 
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
}

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
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user?.id)
        .order("updated_at", { ascending: false })
        .limit(4);
      
      if (error) throw error;
      
      // Convert status from string to our union type
      const typedProjects = (data || []).map(project => ({
        ...project,
        status: project.status as "in-progress" | "completed" | "planned" | "delayed"
      }));
      
      setProjects(typedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
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
            <Link to={`/projects/${project.id}`} key={project.id}>
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
                  <Badge variant="outline" className="text-xs font-normal bg-black/20">
                    Due {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}
                  </Badge>
                  <span className="text-muted-foreground">
                    {project.collaborators} collaborator{project.collaborators !== 1 ? 's' : ''}
                  </span>
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
