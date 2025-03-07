
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Search, 
  Plus, 
  Filter, 
  Users, 
  MessageSquare, 
  Star, 
  ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Communities = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const featuredCommunities = [
    {
      name: "Web Development",
      members: 2453,
      topics: ["JavaScript", "React", "CSS", "Node.js"],
      description: "Connect with web developers, share your projects, and learn together.",
      activity: "High",
    },
    {
      name: "Data Science",
      members: 1872,
      topics: ["Python", "Machine Learning", "AI", "Data Analysis"],
      description: "Discuss data science techniques, share insights, and collaborate on projects.",
      activity: "Medium",
    },
    {
      name: "UI/UX Design",
      members: 3241,
      topics: ["User Research", "Figma", "Prototyping", "Design Systems"],
      description: "A community for designers to share work, get feedback, and discuss trends.",
      activity: "Very High",
    },
  ];
  
  const allCommunities = [
    {
      name: "Mobile Development",
      members: 1823,
      topics: ["React Native", "Flutter", "iOS", "Android"],
      activity: "Medium",
    },
    {
      name: "Cybersecurity",
      members: 1245,
      topics: ["Network Security", "Ethical Hacking", "Cryptography"],
      activity: "Medium",
    },
    {
      name: "Cloud Computing",
      members: 1658,
      topics: ["AWS", "Azure", "DevOps", "Kubernetes"],
      activity: "High",
    },
    {
      name: "Game Development",
      members: 2142,
      topics: ["Unity", "Unreal Engine", "3D Modeling", "Game Design"],
      activity: "High",
    },
    {
      name: "Blockchain",
      members: 987,
      topics: ["Cryptocurrency", "Smart Contracts", "Web3"],
      activity: "Low",
    },
    {
      name: "Artificial Intelligence",
      members: 1543,
      topics: ["Machine Learning", "Neural Networks", "Computer Vision"],
      activity: "High",
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
                  <h1 className="text-2xl font-bold mb-2">Communities</h1>
                  <p className="text-foreground/70">Connect with peers, share knowledge, and grow together</p>
                </div>
                <Button className="mt-4 md:mt-0 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Create Community
                </Button>
              </div>
            </div>
          </section>
          
          {/* Search and Filter */}
          <section className="mb-10">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/50" />
                <input
                  type="text"
                  placeholder="Search communities..."
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </section>
          
          {/* Featured Communities */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-6">Featured Communities</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredCommunities.map((community, index) => (
                <div key={index} className="glass rounded-xl overflow-hidden hover:glass-hover transition-all duration-300">
                  <div className={`h-2 ${
                    index === 0 
                      ? 'bg-feature-gradient-1' 
                      : index === 1 
                        ? 'bg-feature-gradient-2' 
                        : 'bg-feature-gradient-3'
                  }`} />
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2">{community.name}</h3>
                    <p className="text-foreground/70 text-sm mb-4">{community.description}</p>
                    
                    <div className="flex items-center mb-4">
                      <Users className="h-4 w-4 text-foreground/50 mr-2" />
                      <span className="text-sm text-foreground/70">{community.members.toLocaleString()} members</span>
                      <span className="mx-2 text-foreground/30">•</span>
                      <div className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
                        <span className="text-sm text-foreground/70">{community.activity} activity</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {community.topics.map((topic, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-1 text-xs rounded-full bg-secondary/50 text-foreground/70"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    <Button className="w-full mt-2 bg-secondary hover:bg-secondary/80">
                      Join Community <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* All Communities */}
          <section>
            <h2 className="text-xl font-bold mb-6">Browse All Communities</h2>
            <div className="glass rounded-xl overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold">Community</th>
                    <th className="text-left py-4 px-6 font-semibold">Topics</th>
                    <th className="text-left py-4 px-6 font-semibold">Members</th>
                    <th className="text-left py-4 px-6 font-semibold">Activity</th>
                    <th className="text-left py-4 px-6 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allCommunities.map((community, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium">{community.name}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {community.topics.slice(0, 2).map((topic, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 text-xs rounded-full bg-secondary/50 text-foreground/70"
                            >
                              {topic}
                            </span>
                          ))}
                          {community.topics.length > 2 && (
                            <span className="text-xs text-foreground/50">+{community.topics.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-foreground/50 mr-2" />
                          <span>{community.members.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <span 
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              community.activity === 'High' || community.activity === 'Very High'
                                ? 'bg-green-400'
                                : community.activity === 'Medium'
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                            }`}
                          />
                          <span>{community.activity}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button variant="outline">
                Load More Communities
              </Button>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Communities;
