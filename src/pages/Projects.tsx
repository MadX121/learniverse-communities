
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Search, 
  Plus, 
  Filter, 
  Laptop, 
  Code, 
  FileCode, 
  Image, 
  GitBranch,
  Eye,
  Star,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Projects = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const featuredProjects = [
    {
      title: "AI Chatbot Assistant",
      author: "Alex Johnson",
      thumbnail: "https://via.placeholder.com/300x200",
      description: "A personal assistant powered by OpenAI's GPT-4 API, built with React and Node.js.",
      tags: ["AI", "React", "Node.js", "API"],
      stars: 142,
      views: 1245,
    },
    {
      title: "Student Learning Analytics Dashboard",
      author: "Sarah Lee",
      thumbnail: "https://via.placeholder.com/300x200",
      description: "A dashboard to visualize student learning patterns and provide personalized insights.",
      tags: ["Data Visualization", "Python", "Machine Learning"],
      stars: 98,
      views: 876,
    },
    {
      title: "Collaborative Code Editor",
      author: "Miguel Hernandez",
      thumbnail: "https://via.placeholder.com/300x200",
      description: "Real-time collaborative code editor with syntax highlighting and video chat.",
      tags: ["WebSockets", "TypeScript", "WebRTC"],
      stars: 215,
      views: 1876,
    },
  ];
  
  const trendingProjects = [
    {
      title: "AR Campus Tour",
      author: "Emily Chang",
      tags: ["AR", "Unity", "Mobile"],
      stars: 87,
    },
    {
      title: "Blockchain Certificate Verification",
      author: "David Wong",
      tags: ["Blockchain", "Ethereum", "Solidity"],
      stars: 112,
    },
    {
      title: "Sustainable Energy Tracker",
      author: "Priya Patel",
      tags: ["IoT", "Data Science", "Visualization"],
      stars: 76,
    },
    {
      title: "Gesture-Based Presentation Control",
      author: "Jason Kim",
      tags: ["Computer Vision", "TensorFlow", "UX"],
      stars: 93,
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
                  <h1 className="text-2xl font-bold mb-2">Projects</h1>
                  <p className="text-foreground/70">Discover, develop, and showcase innovative student projects</p>
                </div>
                <Button className="mt-4 md:mt-0 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Create Project
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
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </section>
          
          {/* Featured Projects */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-6">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, index) => (
                <div key={index} className="glass rounded-xl overflow-hidden hover:glass-hover transition-all duration-300 h-full flex flex-col">
                  <div className="h-48 bg-secondary overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center text-foreground/50">
                      <Image className="h-12 w-12" />
                    </div>
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                    <p className="text-sm text-foreground/60 mb-2">by {project.author}</p>
                    <p className="text-foreground/70 text-sm mb-4">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-1 text-xs rounded-full bg-secondary/50 text-foreground/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-foreground/50 mr-1" />
                          <span className="text-sm">{project.stars}</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 text-foreground/50 mr-1" />
                          <span className="text-sm">{project.views}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-primary">
                        View Project <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Tools and Resources */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-6">Tools & Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Code Repository",
                  icon: Code,
                  description: "Store, version, and share your code in private or public repositories",
                  color: "bg-feature-gradient-1",
                },
                {
                  title: "Documentation Builder",
                  icon: FileCode,
                  description: "Create beautiful documentation for your projects with live previews",
                  color: "bg-feature-gradient-2",
                },
                {
                  title: "Project Templates",
                  icon: Laptop,
                  description: "Start with pre-configured templates for various project types",
                  color: "bg-feature-gradient-3",
                },
                {
                  title: "Version Control",
                  icon: GitBranch,
                  description: "Track changes, collaborate with team members, and manage branches",
                  color: "bg-hero-gradient",
                },
              ].map((tool, index) => (
                <div key={index} className="glass rounded-xl p-6 hover:glass-hover transition-all duration-300">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${tool.color}`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{tool.title}</h3>
                  <p className="text-foreground/70 text-sm">{tool.description}</p>
                </div>
              ))}
            </div>
          </section>
          
          {/* Trending Projects */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Trending Projects</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>
            
            <div className="glass rounded-xl overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold">Project</th>
                    <th className="text-left py-4 px-6 font-semibold">Author</th>
                    <th className="text-left py-4 px-6 font-semibold">Tags</th>
                    <th className="text-left py-4 px-6 font-semibold">Stars</th>
                    <th className="text-left py-4 px-6 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trendingProjects.map((project, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium">{project.title}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div>{project.author}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {project.tags.map((tag, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 text-xs rounded-full bg-secondary/50 text-foreground/70"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-foreground/50 mr-2" />
                          <span>{project.stars}</span>
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
          </section>
          
          {/* CTA Section */}
          <section>
            <div className="glass-strong rounded-xl overflow-hidden bg-hero-gradient bg-opacity-10">
              <div className="p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Ready to showcase your innovation?</h2>
                <p className="text-foreground/70 text-lg max-w-2xl mx-auto mb-6">
                  Create your project, share it with the community, and get valuable feedback from peers and mentors.
                </p>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Your Project <Plus className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Projects;
