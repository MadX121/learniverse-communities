
import { useEffect, useState } from "react";
import { Bell, MessageSquare, GitCommit, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "community" | "project" | "interview" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching activities
    setTimeout(() => {
      setActivities([
        {
          id: "1",
          type: "community",
          title: "New Discussion",
          description: "Alex started a new discussion in Web Development community",
          time: "10 minutes ago",
          read: false
        },
        {
          id: "2",
          type: "project",
          title: "Project Update",
          description: "Sarah committed 3 changes to 'AI Research Project'",
          time: "1 hour ago",
          read: false
        },
        {
          id: "3",
          type: "interview",
          title: "Mock Interview Completed",
          description: "You completed a Frontend Developer mock interview",
          time: "3 hours ago",
          read: true
        },
        {
          id: "4",
          type: "system",
          title: "New Feature Available",
          description: "Check out our new AI-powered code review feature",
          time: "Yesterday",
          read: true
        },
        {
          id: "5",
          type: "community",
          title: "New Member",
          description: "Taylor joined ML Research community",
          time: "2 days ago",
          read: true
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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

  const markAsRead = (id: string) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, read: true } : activity
    ));
  };

  const markAllAsRead = () => {
    setActivities(activities.map(activity => ({ ...activity, read: true })));
  };

  return (
    <div className="bg-secondary/30 rounded-xl p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Activity Feed</h3>
        <button 
          onClick={markAllAsRead} 
          className="text-xs text-primary hover:underline"
        >
          Mark all as read
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-muted h-10 w-10"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-2 bg-muted rounded"></div>
              <div className="h-2 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto hide-scrollbar max-h-[400px]">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              onClick={() => markAsRead(activity.id)}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer",
                activity.read ? "bg-transparent" : "bg-accent/10"
              )}
            >
              <div className="mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  {activity.title}
                  {!activity.read && <span className="ml-2 h-2 w-2 rounded-full bg-primary inline-block"></span>}
                </p>
                <p className="text-muted-foreground text-xs">{activity.description}</p>
                <p className="text-xs text-foreground/60 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
