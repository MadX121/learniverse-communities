
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

const Projects = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Projects | Learniverse";
    // Redirect if not logged in
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

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
        <h1 className="text-3xl font-bold mb-8">Projects</h1>
        <p className="text-muted-foreground">Manage your learning projects here.</p>

        {/* Projects content will go here */}
        <div className="mt-8 p-6 bg-secondary/30 rounded-xl">
          <p>Projects feature is coming soon!</p>
        </div>
      </main>
    </div>
  );
};

export default Projects;
