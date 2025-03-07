
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import CommunitiesOverview from "@/components/dashboard/CommunitiesOverview";
import InterviewPrep from "@/components/dashboard/InterviewPrep";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Sparkles } from "lucide-react";

const Dashboard = () => {
  useEffect(() => {
    document.title = "Dashboard | Learniverse";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 py-1 px-3 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span>Your learning streak: 7 days</span>
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
