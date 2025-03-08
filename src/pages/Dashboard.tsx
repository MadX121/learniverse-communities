
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import CommunitiesOverview from "@/components/dashboard/CommunitiesOverview";
import InterviewPrep from "@/components/dashboard/InterviewPrep";
import DashboardStats from "@/components/dashboard/DashboardStats";
import FileUpload from "@/components/FileUpload";
import { STORAGE_BUCKETS } from "@/lib/storage-utils";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Dashboard | Learniverse";
    // Redirect to auth page if not logged in
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  const handleUploadComplete = (filePath: string, url: string) => {
    toast({
      title: "File uploaded to Dashboard",
      description: `File path: ${filePath}`,
    });
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back{user?.user_metadata?.username ? `, ${user.user_metadata.username}` : ''}! Here's what's happening today.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 py-1 px-3 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span>Your learning streak: 7 days</span>
            </div>
            
            <FileUpload 
              bucketName={STORAGE_BUCKETS.DASHBOARD}
              allowedFileTypes={[".pdf", ".doc", ".docx", ".jpg", ".png"]}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        </div>
        
        <div className="mb-8">
          <DashboardStats />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ProjectsOverview />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <ActivityFeed />
          </div>
          <div>
            <CommunitiesOverview />
          </div>
          <div>
            <InterviewPrep />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
