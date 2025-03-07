
import { Plus, Rocket, UserPlus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const QuickActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const actions = [
    {
      title: "New Project",
      description: "Create a new project from scratch",
      icon: Plus,
      action: () => navigate("/projects/new"),
      variant: "default" as const,
      className: "bg-feature-gradient-1 hover:bg-feature-gradient-1/90"
    },
    {
      title: "Mock Interview",
      description: "Practice with our AI interviewer",
      icon: BookOpen,
      action: () => navigate("/interview-prep"),
      variant: "default" as const,
      className: "bg-feature-gradient-2 hover:bg-feature-gradient-2/90"
    },
    {
      title: "Join Community",
      description: "Discover new communities",
      icon: UserPlus,
      action: () => navigate("/communities"),
      variant: "default" as const,
      className: "bg-feature-gradient-3 hover:bg-feature-gradient-3/90"
    },
    {
      title: "Quick Start",
      description: "Follow our guided tutorial",
      icon: Rocket,
      action: () => {
        toast({
          title: "Tutorial Started",
          description: "Follow the highlighted elements to learn the platform",
        });
      },
      variant: "outline" as const,
      className: "border-white/10 hover:bg-white/5"
    }
  ];

  return (
    <div className="rounded-xl p-4 bg-secondary/30 h-full">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className={`h-auto py-4 flex flex-col items-center justify-center gap-2 ${action.className}`}
            onClick={action.action}
          >
            <action.icon className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium text-sm">{action.title}</div>
              <div className="text-xs opacity-80">{action.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
