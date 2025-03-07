
import { Sparkles, BarChart3, Award, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  iconBg: string;
}

const StatCard = ({ title, value, change, icon: Icon, iconBg }: StatCardProps) => {
  return (
    <div className="glass rounded-xl p-4 flex items-center">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mr-4", iconBg)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        <div className={cn(
          "text-xs flex items-center mt-1",
          change > 0 ? "text-green-500" : "text-red-500"
        )}>
          {change > 0 ? "+" : ""}{change}% from last week
        </div>
      </div>
    </div>
  );
};

const DashboardStats = () => {
  const stats = [
    { 
      title: "Active Projects", 
      value: 12, 
      change: 8, 
      icon: Sparkles, 
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500" 
    },
    { 
      title: "Community Activity", 
      value: 486, 
      change: 12, 
      icon: BarChart3, 
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500" 
    },
    { 
      title: "Interviews Completed", 
      value: 7, 
      change: 4, 
      icon: Award, 
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500" 
    },
    { 
      title: "Upcoming Deadlines", 
      value: 3, 
      change: -2, 
      icon: Calendar, 
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-500" 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
