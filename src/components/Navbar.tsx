
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isLandingPage = location.pathname === "/";
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);
  
  const navigationItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Communities", path: "/communities" },
    { name: "Projects", path: "/projects" },
    { name: "Interview Prep", path: "/interview-prep" },
  ];
  
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isLandingPage 
          ? "bg-background/80 backdrop-blur border-b border-border" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink 
              to="/" 
              className="text-xl font-display font-bold text-gradient"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              learniverse
            </NavLink>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? "text-primary bg-secondary" 
                        : "text-foreground/80 hover:text-primary hover:bg-secondary/50"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" className="text-sm">
              Log in
            </Button>
            <Button className="text-sm bg-primary text-primary-foreground hover:bg-primary/90">
              Sign up <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 -translate-x-full pointer-events-none"
        } fixed inset-0 z-40 flex`}
      >
        <div 
          className="fixed inset-0 bg-background/90 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="relative w-full max-w-xs bg-card p-4 overflow-y-auto h-full flex flex-col">
          <div className="h-16 flex items-center">
            <NavLink 
              to="/" 
              className="text-xl font-display font-bold text-gradient"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              learniverse
            </NavLink>
          </div>
          <div className="mt-8 flex-1">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive 
                        ? "text-primary bg-secondary" 
                        : "text-foreground/80 hover:text-primary hover:bg-secondary/50"
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="p-2 mt-auto space-y-2">
            <Button variant="outline" className="w-full justify-center">
              Log in
            </Button>
            <Button className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90">
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
