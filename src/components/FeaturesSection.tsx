
import { Users, Laptop, MessageSquare } from "lucide-react";
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: "Community Building",
      description: "Create and join communities focused on your interests. Engage in real-time discussions, collaborate on projects, and expand your network.",
      gradientClass: "bg-feature-gradient-1",
    },
    {
      icon: Laptop,
      title: "Innovative Projects",
      description: "Develop, showcase, and share your projects with powerful integrated tools. Upload multimedia content and get feedback from peers.",
      gradientClass: "bg-feature-gradient-2",
    },
    {
      icon: MessageSquare,
      title: "Interview Preparation",
      description: "Practice with realistic AI-powered mock interviews. Receive personalized feedback, track your progress, and boost your confidence.",
      gradientClass: "bg-feature-gradient-3",
    },
  ];
  
  return (
    <section className="section-padding" id="features">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-wider text-primary mb-3">Features</h2>
          <h3 className="text-3xl md:text-4xl font-display font-bold">Everything you need to succeed</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradientClass={feature.gradientClass}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
