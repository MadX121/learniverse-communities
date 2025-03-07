
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  MessageSquare, 
  BookOpen, 
  Clock, 
  BarChart, 
  Play, 
  CheckCircle,
  Send,
  ArrowRight,
  Calendar,
  User,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

const InterviewPrep = () => {
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const interviewCategories = [
    {
      name: "Technical Interviews",
      description: "Practice coding challenges and system design questions",
      icon: BookOpen,
    },
    {
      name: "Behavioral Interviews",
      description: "Prepare for questions about your experience and soft skills",
      icon: User,
    },
    {
      name: "Case Interviews",
      description: "Solve business problems and showcase analytical thinking",
      icon: BarChart,
    },
  ];
  
  const recentInterviews = [
    {
      role: "Frontend Developer",
      company: "Tech Innovations Inc.",
      date: "May 10, 2023",
      score: 85,
      status: "Completed",
    },
    {
      role: "Data Scientist",
      company: "Analytics Co.",
      date: "May 5, 2023",
      score: 92,
      status: "Completed",
    },
    {
      role: "UX Designer",
      company: "Creative Solutions",
      date: "April 28, 2023",
      score: 78,
      status: "Completed",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <section className="mb-10">
            <div className="glass p-8 rounded-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Interview Preparation</h1>
                  <p className="text-foreground/70">Practice with AI-powered mock interviews and get personalized feedback</p>
                </div>
                <Button className="mt-4 md:mt-0 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
                </Button>
              </div>
            </div>
          </section>
          
          {/* Categories */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-6">Interview Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {interviewCategories.map((category, index) => (
                <div 
                  key={index} 
                  className="glass rounded-xl p-6 hover:glass-hover transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    index === 0 
                      ? 'bg-feature-gradient-1' 
                      : index === 1 
                        ? 'bg-feature-gradient-2' 
                        : 'bg-feature-gradient-3'
                  }`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{category.name}</h3>
                  <p className="text-foreground/70 text-sm mb-4">{category.description}</p>
                  <Button className="w-full bg-secondary hover:bg-secondary/80">
                    Start Practice <Play className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ChatGPT Integration */}
            <section className="lg:col-span-2">
              <div className="glass rounded-xl overflow-hidden h-full flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 text-primary mr-2" />
                    <h2 className="text-xl font-bold">AI Interview Assistant</h2>
                  </div>
                  <Button variant="outline" size="sm">
                    New Chat
                  </Button>
                </div>
                <div className="flex-grow p-6 overflow-y-auto h-[400px] flex flex-col space-y-4">
                  {/* AI Message */}
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-4 flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="glass p-4 rounded-xl rounded-tl-none max-w-3xl">
                      <p className="text-foreground/90">
                        Hello! I'm your AI interview assistant. How can I help you prepare for your interviews today? I can:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-foreground/80">
                        <li>Conduct mock interviews for different roles</li>
                        <li>Provide feedback on your responses</li>
                        <li>Help you prepare answers to common questions</li>
                        <li>Share industry-specific interview strategies</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* User Message */}
                  <div className="flex items-start justify-end">
                    <div className="bg-primary/10 p-4 rounded-xl rounded-tr-none max-w-3xl">
                      <p className="text-foreground/90">
                        I have an interview for a frontend developer position next week. Can you help me prepare?
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center ml-4 flex-shrink-0">
                      <User className="h-4 w-4 text-foreground/80" />
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-4 flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="glass p-4 rounded-xl rounded-tl-none max-w-3xl">
                      <p className="text-foreground/90">
                        Great! I'll help you prepare for your frontend developer interview. Let's start with some common technical questions:
                      </p>
                      <ol className="list-decimal list-inside mt-2 space-y-2 text-foreground/80">
                        <li>Can you explain the difference between flex and grid in CSS?</li>
                        <li>How would you optimize a website's performance?</li>
                        <li>What's your experience with modern JavaScript frameworks?</li>
                      </ol>
                      <p className="mt-2 text-foreground/90">
                        Would you like to start with one of these questions, or would you prefer to focus on a specific area of frontend development?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border">
                  <div className="flex items-center">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-grow bg-card border border-border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none h-12 py-3"
                    />
                    <Button className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12 p-0 flex items-center justify-center">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Sidebar Content */}
            <div className="space-y-8">
              {/* Your Stats */}
              <section className="glass rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold">Your Stats</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Interviews Completed", value: 12, icon: CheckCircle },
                      { label: "Hours Practiced", value: 8, icon: Clock },
                      { label: "Avg. Score", value: "85%", icon: BarChart },
                      { label: "Improvement", value: "+12%", icon: TrendingUp },
                    ].map((stat, index) => (
                      <div key={index} className="glass p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <stat.icon className="h-4 w-4 text-primary mr-2" />
                          <span className="text-xs text-foreground/70">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              
              {/* Recent Interviews */}
              <section className="glass rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold">Recent Interviews</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentInterviews.map((interview, index) => (
                      <div key={index} className="glass p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold">{interview.role}</h3>
                          <div className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                            {interview.score}%
                          </div>
                        </div>
                        <p className="text-foreground/70 text-sm">{interview.company}</p>
                        <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
                          <span className="text-sm text-foreground/60">{interview.date}</span>
                          <Button size="sm" variant="ghost">Review</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              
              {/* Interview Tips */}
              <section className="glass rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold">Pro Tips</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      "Research the company thoroughly before your interview",
                      "Prepare stories using the STAR method for behavioral questions",
                      "Practice your technical skills with real-world scenarios",
                      "Have questions ready to ask your interviewer",
                    ].map((tip, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <p className="text-sm text-foreground/90">{tip}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    View All Tips <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InterviewPrep;
