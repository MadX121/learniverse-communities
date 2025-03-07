
import { useState } from "react";
import { TrendingUp, CheckCircle, Clock, Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface InterviewStats {
  completed: number;
  streak: number;
  nextMilestone: number;
  skills: {
    name: string;
    score: number;
    improvement: number;
  }[];
}

const InterviewPrep = () => {
  const [stats, setStats] = useState<InterviewStats>({
    completed: 7,
    streak: 3,
    nextMilestone: 10,
    skills: [
      { name: "Problem Solving", score: 72, improvement: 8 },
      { name: "Technical Knowledge", score: 65, improvement: 12 },
      { name: "Communication", score: 84, improvement: 5 },
      { name: "Behavioral", score: 78, improvement: 3 }
    ]
  });

  return (
    <div className="bg-secondary/30 rounded-xl p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Interview Prep</h3>
        <Link 
          to="/interview-prep" 
          className="text-primary hover:underline text-sm flex items-center gap-1"
        >
          Start session <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="glass rounded-lg p-2 flex flex-col items-center justify-center">
          <div className="text-xl font-bold">{stats.completed}</div>
          <div className="text-xs text-muted-foreground">Interviews</div>
        </div>
        <div className="glass rounded-lg p-2 flex flex-col items-center justify-center">
          <div className="text-xl font-bold flex items-center">
            {stats.streak} <CheckCircle className="ml-1 w-4 h-4 text-green-500" />
          </div>
          <div className="text-xs text-muted-foreground">Day streak</div>
        </div>
        <div className="glass rounded-lg p-2 flex flex-col items-center justify-center">
          <div className="relative w-full pt-2">
            <Progress value={(stats.completed / stats.nextMilestone) * 100} className="h-1.5" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.completed}/{stats.nextMilestone} to milestone
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Skill Performance</h4>
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
        
        <div className="space-y-3">
          {stats.skills.map((skill) => (
            <div key={skill.name} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span>{skill.name}</span>
                <div className="flex items-center gap-1">
                  {skill.improvement > 0 && (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  )}
                  <span className={skill.improvement > 0 ? "text-green-500" : ""}>
                    {skill.score}%
                  </span>
                </div>
              </div>
              <Progress value={skill.score} className="h-1.5" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Recommended Practice</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="h-auto py-2 justify-start flex-col items-start border-white/10">
            <div className="text-xs font-medium">Frontend Dev</div>
            <div className="text-xs text-muted-foreground">React, TypeScript</div>
          </Button>
          <Button size="sm" variant="outline" className="h-auto py-2 justify-start flex-col items-start border-white/10">
            <div className="text-xs font-medium">System Design</div>
            <div className="text-xs text-muted-foreground">Architecture</div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
