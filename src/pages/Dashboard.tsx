
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Users, 
  Laptop, 
  MessageSquare, 
  Bell, 
  Clock, 
  Calendar, 
  Star, 
  TrendingUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <section className="mb-10">
            <div className="glass p-8 rounded-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Welcome back, Alex</h1>
                  <p className="text-foreground/70">Here's what's happening in your student universe today</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" /> Notifications
                  </Button>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    New Project
                  </Button>
                </div>
              </div>
            </div>
          </section>
          
          {/* Stats Section */}
          <section className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, label: "Communities", value: "8", color: "bg-feature-gradient-1" },
                { icon: Laptop, label: "Projects", value: "12", color: "bg-feature-gradient-2" },
                { icon: MessageSquare, label: "Interviews", value: "24", color: "bg-feature-gradient-3" },
                { icon: TrendingUp, label: "Success Rate", value: "92%", color: "bg-hero-gradient" },
              ].map((stat, index) => (
                <div key={index} className="glass p-6 rounded-xl">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Feed */}
            <section className="lg:col-span-2">
              <div className="glass rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {[
                      {
                        icon: Users,
                        color: "bg-feature-gradient-1",
                        title: "Joined Web Development Community",
                        time: "2 hours ago",
                      },
                      {
                        icon: Laptop,
                        color: "bg-feature-gradient-2",
                        title: "Updated Portfolio Project",
                        time: "Yesterday",
                      },
                      {
                        icon: MessageSquare,
                        color: "bg-feature-gradient-3",
                        title: "Completed Frontend Developer Interview",
                        time: "2 days ago",
                        score: "90%",
                      },
                      {
                        icon: Star,
                        color: "bg-hero-gradient",
                        title: "Received feedback on AI Project",
                        time: "3 days ago",
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center mr-4 ${activity.color}`}>
                          <activity.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-foreground">{activity.title}</h3>
                            {activity.score && (
                              <span className="ml-2 px-2 py-1 text-sm rounded-full bg-green-500/20 text-green-400">
                                {activity.score}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground/60 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-6">
                    View All Activity
                  </Button>
                </div>
              </div>
              
              {/* Projects Section */}
              <div className="glass rounded-xl overflow-hidden mt-8">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h2 className="text-xl font-bold">Recent Projects</h2>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: "AI Chatbot Assistant",
                        description: "A personal assistant powered by GPT-4 API",
                        progress: 80,
                        tags: ["AI", "React", "API"],
                      },
                      {
                        title: "Portfolio Website",
                        description: "Personal portfolio built with React and Tailwind CSS",
                        progress: 100,
                        tags: ["Portfolio", "Frontend"],
                      },
                      {
                        title: "E-commerce Platform",
                        description: "Full-stack e-commerce site with user authentication",
                        progress: 60,
                        tags: ["E-commerce", "Full-stack"],
                      },
                      {
                        title: "Mobile Fitness App",
                        description: "React Native app for tracking workouts and nutrition",
                        progress: 40,
                        tags: ["Mobile", "React Native"],
                      },
                    ].map((project, index) => (
                      <div key={index} className="glass p-5 rounded-lg hover:glass-hover transition-all">
                        <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                        <p className="text-foreground/70 text-sm mb-4">{project.description}</p>
                        
                        <div className="w-full h-2 bg-secondary rounded-full mb-4 overflow-hidden">
                          <div 
                            className={`h-full ${project.progress === 100 ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-1 text-xs rounded-full bg-secondary/50 text-foreground/70"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            
            {/* Sidebar Content */}
            <div className="space-y-8">
              {/* Upcoming Interviews */}
              <section className="glass rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold">Upcoming Interviews</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        role: "Software Engineer",
                        company: "Tech Innovations Inc.",
                        date: "Today",
                        time: "3:00 PM",
                      },
                      {
                        role: "UX Designer",
                        company: "Creative Solutions",
                        date: "Tomorrow",
                        time: "10:00 AM",
                      },
                    ].map((interview, index) => (
                      <div key={index} className="glass p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold">{interview.role}</h3>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-foreground/60 mr-1" />
                            <span className="text-sm text-foreground/60">{interview.time}</span>
                          </div>
                        </div>
                        <p className="text-foreground/70 text-sm">{interview.company}</p>
                        <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
                          <span className="text-sm text-primary">{interview.date}</span>
                          <Button size="sm" variant="ghost">Prepare</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    Schedule Mock Interview
                  </Button>
                </div>
              </section>
              
              {/* Communities Section */}
              <section className="glass rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-bold">Your Communities</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        name: "Web Development",
                        members: 2453,
                        unread: 12,
                      },
                      {
                        name: "Data Science Network",
                        members: 1872,
                        unread: 5,
                      },
                      {
                        name: "UI/UX Designers",
                        members: 3241,
                        unread: 0,
                      },
                    ].map((community, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${index === 0 ? 'bg-feature-gradient-1' : index === 1 ? 'bg-feature-gradient-2' : 'bg-feature-gradient-3'}`}>
                            <span className="text-white font-bold">{community.name.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{community.name}</div>
                            <div className="text-xs text-foreground/60">{community.members.toLocaleString()} members</div>
                          </div>
                        </div>
                        {community.unread > 0 && (
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-primary/20 text-primary">
                            {community.unread}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    Explore Communities
                  </Button>
                </div>
              </section>
              
              {/* Calendar Section */}
              <section className="glass rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h2 className="text-xl font-bold">Upcoming Events</h2>
                  <Button variant="ghost" size="sm">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        name: "Tech Career Fair",
                        date: "May 15",
                        time: "10:00 AM - 4:00 PM",
                      },
                      {
                        name: "Web Development Workshop",
                        date: "May 18",
                        time: "2:00 PM - 5:00 PM",
                      },
                    ].map((event, index) => (
                      <div key={index} className="glass p-4 rounded-lg">
                        <h3 className="font-bold">{event.name}</h3>
                        <div className="mt-2 flex items-center text-foreground/70 text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{event.date}</span>
                        </div>
                        <div className="mt-1 flex items-center text-foreground/70 text-sm">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
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

export default Dashboard;
