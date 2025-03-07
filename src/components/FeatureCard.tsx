
import { useEffect, useRef } from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradientClass: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, gradientClass, index }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slideUp");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      ref={cardRef}
      className="glass rounded-xl overflow-hidden opacity-0"
      style={{ "--index": index } as React.CSSProperties}
    >
      <div 
        className={`h-2 ${gradientClass}`}
      />
      <div className="p-8">
        <div className={`w-12 h-12 rounded-lg mb-6 flex items-center justify-center ${gradientClass}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-foreground/70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
