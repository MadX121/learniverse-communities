
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProjectMember {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  is_creator: boolean;
  profile: {
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
}

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
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
          profile:profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("project_id", id)
        .eq("status", "approved");

      if (membersError) throw membersError;

      setProject(projectData as Project);
      setMembers(membersData as ProjectMember[]);
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Progress</h2>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.status === "planned" ? "bg-blue-500/20 text-blue-500" :
                  project.status === "active" ? "bg-green-500/20 text-green-500" :
                  "bg-purple-500/20 text-purple-500"
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Team Members</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {member.profile?.avatar_url ? (
                            <AvatarImage src={member.profile.avatar_url} />
                          ) : (
                            <AvatarFallback>
                              {member.profile?.username?.[0] || member.profile?.full_name?.[0] || '?'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.profile?.username || member.profile?.full_name || 'Anonymous'}
                          </p>
                          {member.is_creator && (
                            <span className="text-xs text-muted-foreground">Creator</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;
