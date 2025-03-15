
import { useEffect, useState } from "react";
import { Bell, MessageSquare, GitCommit, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  id: string;
  type: "community" | "project" | "interview" | "system";
  title: string;
  description: string;
  created_at: string;
  read: boolean;
}

// Type guard function to validate activity types
const isValidActivityType = (type: string): type is Activity["type"] => {
  return ["community", "project", "interview", "system"].includes(type);
};

const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Convert type from string to our union type
      const typedActivities = (data || []).map(activity => {
        let type = activity.type;
        // Ensure the type is valid, otherwise default to "system"
        if (!isValidActivityType(type)) {
          type = "system";
        }
        
        return {
          id: activity.id,
          type: type,
          title: activity.title,
          description: activity.description || "",
          created_at: activity.created_at || new Date().toISOString(),
          read: activity.read || false, // Ensure read is always a boolean
        } as Activity;
      });
      
      setActivities(typedActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "community":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "project":
        return <GitCommit className="h-5 w-5 text-green-500" />;
      case "interview":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "system":
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("activities")
        .update({ read: true })
        .eq("id", id)
        .eq("user_id", user?.id);
      
      if (error) throw error;
      
      setActivities(activities.map(activity => 
        activity.id === id ? { ...activity, read: true } : activity
      ));
    } catch (error) {
      console.error("Error marking activity as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = activities
        .filter(activity => !activity.read)
        .map(activity => activity.id);
      
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from("activities")
        .update({ read: true })
        .in("id", unreadIds)
        .eq("user_id", user?.id);
      
      if (error) throw error;
      
      setActivities(activities.map(activity => ({ ...activity, read: true })));
    } catch (error) {
      console.error("Error marking all activities as read:", error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-secondary/30 rounded-xl p-5 h-full border border-white/5 backdrop-blur-lg shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Bell className="h-4 w-4 mr-2 text-primary" />
          Activity Feed
        </h3>
        <button 
          onClick={markAllAsRead} 
          className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors"
          disabled={activities.every(a => a.read)}
        >
          Mark all as read
        </button>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse flex items-start gap-3 p-3">
              <div className="bg-white/10 w-8 h-8 rounded-full mt-1"></div>
              <div className="flex-1">
                <div className="bg-white/10 h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-white/10 h-3 w-full rounded mb-1"></div>
                <div className="bg-white/10 h-3 w-1/4 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-muted-foreground">No activities yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Activities will appear here as you use the platform
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2 overflow-y-auto hide-scrollbar max-h-[400px] pr-1">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => !activity.read && markAsRead(activity.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-all",
                  activity.read ? "bg-transparent" : "bg-accent/10 cursor-pointer hover:bg-accent/15"
                )}
                whileHover={{ scale: 1.01 }}
              >
                <div className="mt-1 p-2 rounded-full bg-white/5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm flex items-center">
                    {activity.title}
                    {!activity.read && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2 h-2 w-2 rounded-full bg-primary inline-block"
                      />
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs">{activity.description}</p>
                  <p className="text-xs text-foreground/60 mt-1">{getTimeAgo(activity.created_at)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ActivityFeed;
