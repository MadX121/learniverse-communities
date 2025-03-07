
import { useState } from "react";
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

interface Project {
  id: string;
  title: string;
  description: string;
  status: "in-progress" | "completed" | "planned" | "delayed";
  progress: number;
  deadline: string;
  collaborators: number;
}

const ProjectsOverview = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "AI Research Paper",
      description: "Analyzing the impact of GPT models on education",
      status: "in-progress",
      progress: 65,
      deadline: "May 15",
      collaborators: 3
    },
    {
      id: "2",
      title: "Personal Portfolio",
      description: "Showcasing my web development skills",
      status: "delayed",
      progress: 40,
      deadline: "Apr 30",
      collaborators: 1
    },
    {
      id: "3",
      title: "Mobile App Wireframes",
      description: "Design concepts for the new health tracking app",
      status: "completed",
      progress: 100,
      deadline: "Apr 10",
      collaborators: 2
    },
    {
      id: "4",
      title: "Database Schema",
      description: "Planning the structure for our new product",
      status: "planned",
      progress: 0,
      deadline: "May 24",
      collaborators: 4
    }
  ]);

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
        {projects.map((project) => (
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
                  Due {project.deadline}
                </Badge>
                <span className="text-muted-foreground">
                  {project.collaborators} collaborator{project.collaborators !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectsOverview;
