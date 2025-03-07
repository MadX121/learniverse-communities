
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center">
        <div className="container max-w-4xl text-center px-4 py-16">
          <div className="relative mb-8">
            <h1 className="text-9xl font-display font-bold text-primary/50">404</h1>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-4 py-2 rounded-md">
              <span className="text-xl font-bold">Page Not Found</span>
            </div>
          </div>
          
          <p className="text-xl text-foreground/70 mb-8 max-w-xl mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/" className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Return Home
            </Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
