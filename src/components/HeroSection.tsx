
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <section className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full opacity-10 bg-primary blur-[100px]"
          style={{ animation: "pulse 8s infinite alternate" }}
        />
        <div 
          className="absolute top-[60%] -left-[20%] w-[70%] h-[70%] rounded-full opacity-10 bg-accent blur-[100px]"
          style={{ animation: "pulse 6s 1s infinite alternate-reverse" }}
        />
      </div>
      
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Pill badge */}
          <div 
            className={`glass px-4 py-1.5 rounded-full flex items-center text-sm font-medium text-foreground/90 mb-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
            <span>Launching soon — Join the waitlist</span>
          </div>
          
          {/* Main heading */}
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-tight tracking-tight text-balance transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="block text-foreground">Elevate your student journey</span>
            <span className="text-gradient">powered by AI</span>
          </h1>
          
          {/* Subheading */}
          <p 
            className={`text-xl md:text-2xl text-foreground/80 max-w-3xl text-balance transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Build communities, showcase projects, and ace interviews—all in one integrated platform designed for modern students.
          </p>
          
          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 pt-4 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 button-gradient"
            >
              Get Started <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-border hover:bg-background/80"
            >
              Learn more
            </Button>
          </div>
          
          {/* Stats */}
          <div 
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {[
              { number: "10k+", label: "Active Students" },
              { number: "500+", label: "Communities" },
              { number: "98%", label: "Interview Success Rate" }
            ].map((stat, index) => (
              <div
                key={index}
                className="glass p-6 flex flex-col items-center justify-center transition-all duration-300 hover:glass-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.number}</div>
                <div className="text-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
