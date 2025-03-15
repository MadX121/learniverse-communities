
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
import { Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-background via-background/80 to-black/30">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back{user?.user_metadata?.username ? `, ${user.user_metadata.username}` : ''}! Here's what's happening today.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-sm text-primary bg-primary/10 py-1 px-3 rounded-full border border-primary/20 shadow-[0_0_15px_rgba(107,187,255,0.15)]"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Your learning streak: 7 days</span>
            </motion.div>
            
            <FileUpload 
              bucketName={STORAGE_BUCKETS.DASHBOARD}
              allowedFileTypes={[".pdf", ".doc", ".docx", ".jpg", ".png"]}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <DashboardStats />
          </motion.div>
          
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <ProjectsOverview />
            </div>
            <div>
              <QuickActions />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <ActivityFeed />
            </div>
            <div>
              <CommunitiesOverview />
            </div>
            <div>
              <InterviewPrep />
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
