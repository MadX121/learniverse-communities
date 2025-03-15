
import { useEffect, useState } from "react";
import { Sparkles, BarChart3, Award, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  iconBg: string;
  delay: number;
}

interface DashboardStats {
  activeProjects: number;
  communityActivity: number;
  interviewsCompleted: number;
  upcomingDeadlines: number;
}

const StatCard = ({ title, value, change, icon: Icon, iconBg, delay }: StatCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 }
      }}
      className="glass rounded-xl p-5 flex items-center relative overflow-hidden border border-white/5 backdrop-blur-lg"
    >
      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mr-4", iconBg)}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="z-10">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        <div className={cn(
          "text-xs flex items-center mt-1",
          change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
        )}>
          {change > 0 ? "+" : ""}{change}% from last week
        </div>
      </div>
      <div className="absolute -right-8 -bottom-8 w-24 h-24 opacity-5">
        <Icon className="w-full h-full" />
      </div>
    </motion.div>
  );
};

const DashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    communityActivity: 0,
    interviewsCompleted: 0,
    upcomingDeadlines: 0
  });
  const [loading, setLoading] = useState(true);
  const [growth, setGrowth] = useState({
    activeProjects: 0,
    communityActivity: 0,
    interviewsCompleted: 0,
    upcomingDeadlines: 0
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Count active projects
      const { count: activeProjectsCount, error: projectsError } = await supabase
        .from("projects")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user?.id)
        .in("status", ["in-progress", "planned"]);
      
      if (projectsError) throw projectsError;
      
      // Count community memberships
      const { count: communitiesCount, error: communitiesError } = await supabase
        .from("community_members")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user?.id);
      
      if (communitiesError) throw communitiesError;
      
      // Count completed interviews
      const { count: interviewsCount, error: interviewsError } = await supabase
        .from("interview_sessions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user?.id)
        .eq("completed", true);
      
      if (interviewsError) throw interviewsError;
      
      // Count upcoming deadlines
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      
      const { count: deadlinesCount, error: deadlinesError } = await supabase
        .from("projects")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user?.id)
        .lt("deadline", oneWeekFromNow.toISOString())
        .gt("deadline", new Date().toISOString());
      
      if (deadlinesError) throw deadlinesError;
      
      // Calculate random growth percentages for demonstration
      // In a real app, you would compare to historical data
      const randomGrowth = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
      
      setStats({
        activeProjects: activeProjectsCount || 0,
        communityActivity: communitiesCount || 0,
        interviewsCompleted: interviewsCount || 0,
        upcomingDeadlines: deadlinesCount || 0
      });
      
      setGrowth({
        activeProjects: randomGrowth(0, 15),
        communityActivity: randomGrowth(5, 20),
        interviewsCompleted: randomGrowth(-5, 10),
        upcomingDeadlines: randomGrowth(-10, 5)
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsArray = [
    { 
      title: "Active Projects", 
      value: stats.activeProjects, 
      change: growth.activeProjects, 
      icon: Sparkles, 
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500" 
    },
    { 
      title: "Community Activity", 
      value: stats.communityActivity, 
      change: growth.communityActivity, 
      icon: BarChart3, 
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500" 
    },
    { 
      title: "Interviews Completed", 
      value: stats.interviewsCompleted, 
      change: growth.interviewsCompleted, 
      icon: Award, 
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500" 
    },
    { 
      title: "Upcoming Deadlines", 
      value: stats.upcomingDeadlines, 
      change: growth.upcomingDeadlines, 
      icon: Calendar, 
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-500" 
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="glass rounded-xl p-4 animate-pulse">
            <div className="flex items-center">
              <div className="bg-white/10 w-12 h-12 rounded-xl mr-4"></div>
              <div className="space-y-2 flex-1">
                <div className="bg-white/10 h-4 w-20 rounded"></div>
                <div className="bg-white/10 h-6 w-16 rounded"></div>
                <div className="bg-white/10 h-3 w-24 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsArray.map((stat, index) => (
        <StatCard key={index} {...stat} delay={index} />
      ))}
    </div>
  );
};

export default DashboardStats;
