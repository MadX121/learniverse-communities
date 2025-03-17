import { NavLink } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <NavLink to="/" className="text-xl font-display font-bold text-gradient">
              MadXMas
            </NavLink>
            <p className="mt-4 text-foreground/70 max-w-md">
              A comprehensive platform for students to build communities, develop projects, and prepare for interviews, all powered by AI.
            </p>
            <div className="mt-6 flex space-x-4">
              <a 
                href="#" 
                className="text-foreground/70 hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="text-foreground/70 hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="#" 
                className="text-foreground/70 hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Platform</h3>
            <ul className="mt-4 space-y-3">
              {[
                { name: "Communities", path: "/communities" },
                { name: "Projects", path: "/projects" },
                { name: "Interview Prep", path: "/interview-prep" },
                { name: "Resources", path: "#" },
              ].map((item) => (
                <li key={item.name}>
                  <NavLink 
                    to={item.path}
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-3">
              {[
                { name: "About", path: "#" },
                { name: "Blog", path: "#" },
                { name: "Careers", path: "#" },
                { name: "Contact", path: "#" },
              ].map((item) => (
                <li key={item.name}>
                  <NavLink 
                    to={item.path}
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-foreground/60 text-sm">
            &copy; {currentYear} MadXMas. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-foreground/60 hover:text-primary text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-foreground/60 hover:text-primary text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
