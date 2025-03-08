
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  BarChart3, 
  BookOpen,
  Code,
  MessagesSquare,
  Briefcase,
  Loader2
} from "lucide-react";

// Types for our data
interface InterviewSession {
  id: string;
  category: string;
  completed: boolean;
  score: number | null;
  feedback: string | null;
  created_at: string;
  completed_at: string | null;
}

interface Skill {
  id: string;
  name: string;
  score: number;
  improvement: number;
}

interface InterviewStats {
  completed: number;
  streak: number;
  nextMilestone: number;
}

const InterviewPrep = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for our data
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState<InterviewStats>({
    completed: 0,
    streak: 0,
    nextMilestone: 10
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    document.title = "Interview Prep | Learniverse";
    // Redirect if not logged in
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Fetch data from Supabase when component mounts
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch interview sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("interview_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (sessionsError) throw sessionsError;
      
      // Fetch skills data
      const { data: skillsData, error: skillsError } = await supabase
        .from("skills")
        .select("*");
      
      if (skillsError) throw skillsError;
      
      // Update state with fetched data
      if (sessionsData) setSessions(sessionsData);
      if (skillsData) setSkills(skillsData);
      
      // Calculate stats
      const completedSessions = sessionsData?.filter(session => session.completed) || [];
      setStats({
        completed: completedSessions.length,
        streak: calculateStreak(completedSessions),
        nextMilestone: Math.ceil((completedSessions.length + 1) / 5) * 5
      });
      
    } catch (error) {
      console.error("Error fetching interview data:", error);
      toast({
        title: "Error",
        description: "Failed to load interview data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate streak based on completed sessions
  const calculateStreak = (completedSessions: InterviewSession[]) => {
    if (completedSessions.length === 0) return 0;
    
    // Sort by completion date
    const sortedSessions = [...completedSessions].sort((a, b) => {
      return new Date(b.completed_at || b.created_at).getTime() - 
             new Date(a.completed_at || a.created_at).getTime();
    });
    
    // Simple streak calculation based on consecutive days
    let streak = 1;
    const today = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Check if most recent session was today or yesterday
    const mostRecentDate = new Date(sortedSessions[0].completed_at || sortedSessions[0].created_at);
    const diffDays = Math.floor((today.getTime() - mostRecentDate.getTime()) / oneDayMs);
    
    if (diffDays > 1) return 0; // Streak broken
    
    return Math.min(sortedSessions.length, 3); // Cap at 3 for now as placeholder
  };
  
  // Start a new interview session
  const startNewSession = async (category: string) => {
    try {
      const { data, error } = await supabase
        .from("interview_sessions")
        .insert([
          { 
            user_id: user?.id,
            category,
            completed: false
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Session started",
        description: `Started a new ${category} interview session.`
      });
      
      // Navigate to the session
      if (data && data.id) {
        navigate(`/interview-prep/session/${data.id}`);
      }
    } catch (error) {
      console.error("Error starting session:", error);
      toast({
        title: "Error",
        description: "Failed to start interview session. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Interview Prep</h1>
            <p className="text-muted-foreground">Practice for your upcoming interviews and track your progress.</p>
          </div>
          <Button onClick={() => setActiveTab("practice")} className="gap-2">
            Start New Session <CheckCircle className="h-4 w-4" />
          </Button>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-secondary/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-secondary/30 rounded-xl p-6 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold mb-2">{stats.completed}</div>
                    <div className="text-muted-foreground">Interviews Completed</div>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-6 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold mb-2 flex items-center">
                      {stats.streak} <CheckCircle className="ml-2 w-6 h-6 text-green-500" />
                    </div>
                    <div className="text-muted-foreground">Day Streak</div>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-6 flex flex-col items-center justify-center">
                    <div className="w-full mb-2">
                      <Progress 
                        value={(stats.completed / stats.nextMilestone) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats.completed}/{stats.nextMilestone} to next milestone
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-secondary/30 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>
                    {sessions.length > 0 ? (
                      <div className="space-y-4">
                        {sessions.slice(0, 3).map((session) => (
                          <div 
                            key={session.id} 
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{session.category}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(session.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {session.completed ? (
                                <>
                                  <span className="text-green-500 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    {session.score || 0}%
                                  </span>
                                </>
                              ) : (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  In Progress
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        No sessions yet. Start your first interview practice!
                      </div>
                    )}
                    {sessions.length > 3 && (
                      <Button 
                        variant="ghost" 
                        className="w-full mt-4"
                        onClick={() => setActiveTab("history")}
                      >
                        View all sessions
                      </Button>
                    )}
                  </div>
                  
                  <div className="bg-secondary/30 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Skill Performance</h3>
                    {skills.length > 0 ? (
                      <div className="space-y-4">
                        {skills.map((skill) => (
                          <div key={skill.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span>{skill.name}</span>
                              <div className="flex items-center gap-1">
                                {skill.improvement > 0 && (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                )}
                                <span className={skill.improvement > 0 ? "text-green-500" : ""}>
                                  {skill.score}%
                                </span>
                              </div>
                            </div>
                            <Progress value={skill.score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        Complete interviews to see your skill performance.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="bg-secondary/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Interview History</h3>
              {loading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sessions.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {sessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="py-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{session.category}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {session.completed ? (
                          <>
                            <span className="text-green-500 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              {session.score || 0}%
                            </span>
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/interview-prep/session/${session.id}`)}
                            >
                              View
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              In Progress
                            </span>
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/interview-prep/session/${session.id}`)}
                            >
                              Continue
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 text-muted-foreground">
                  No interview history yet. Start your first practice session!
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="skills" className="space-y-4">
            <div className="bg-secondary/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Skills Assessment</h3>
              {loading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {skills.map((skill) => (
                    <div key={skill.id} className="bg-white/5 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{skill.name}</span>
                        <div className="flex items-center gap-1">
                          {skill.improvement > 0 && (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          )}
                          <span className={skill.improvement > 0 ? "text-green-500" : ""}>
                            {skill.score}%
                          </span>
                        </div>
                      </div>
                      <Progress value={skill.score} className="h-2 mb-2" />
                      <div className="text-sm text-muted-foreground">
                        {skill.improvement > 0 
                          ? `Improved by ${skill.improvement}% from last assessment` 
                          : "No recent improvement"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 text-muted-foreground">
                  Complete interview sessions to build your skills assessment.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="practice" className="space-y-4">
            <div className="bg-secondary/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-6">Start a New Practice Session</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex-col items-center justify-center gap-3 border-white/10"
                  onClick={() => startNewSession("Frontend Development")}
                >
                  <Code className="h-8 w-8 text-blue-500" />
                  <div className="text-center">
                    <div className="font-medium">Frontend</div>
                    <div className="text-xs text-muted-foreground">React, TypeScript, etc.</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex-col items-center justify-center gap-3 border-white/10"
                  onClick={() => startNewSession("Backend Development")}
                >
                  <BarChart3 className="h-8 w-8 text-green-500" />
                  <div className="text-center">
                    <div className="font-medium">Backend</div>
                    <div className="text-xs text-muted-foreground">Node.js, Databases, etc.</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex-col items-center justify-center gap-3 border-white/10"
                  onClick={() => startNewSession("System Design")}
                >
                  <BookOpen className="h-8 w-8 text-purple-500" />
                  <div className="text-center">
                    <div className="font-medium">System Design</div>
                    <div className="text-xs text-muted-foreground">Architecture, Scalability</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex-col items-center justify-center gap-3 border-white/10"
                  onClick={() => startNewSession("Behavioral")}
                >
                  <MessagesSquare className="h-8 w-8 text-amber-500" />
                  <div className="text-center">
                    <div className="font-medium">Behavioral</div>
                    <div className="text-xs text-muted-foreground">Soft skills, Scenarios</div>
                  </div>
                </Button>
              </div>
              
              <div className="mt-8">
                <h4 className="font-medium mb-4">Custom Interview</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="justify-start border-white/10"
                    onClick={() => startNewSession("Data Science")}
                  >
                    <div className="text-xs">Data Science</div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start border-white/10"
                    onClick={() => startNewSession("DevOps")}
                  >
                    <div className="text-xs">DevOps</div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start border-white/10"
                    onClick={() => startNewSession("Mobile Development")}
                  >
                    <div className="text-xs">Mobile Development</div>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default InterviewPrep;
