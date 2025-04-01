
import { useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';

const Index = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* How It Works Section */}
        <section className="section-padding bg-card">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-sm uppercase tracking-wider text-primary mb-3">How It Works</h2>
              <h3 className="text-3xl md:text-4xl font-display font-bold">Simple, intuitive, and powerful</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="glass rounded-xl overflow-hidden h-[400px] flex items-center justify-center">
                <div className="text-2xl font-medium text-foreground/50">Interactive Demo</div>
              </div>
              
              <div className="space-y-8">
                {[
                  {
                    number: "01",
                    title: "Join communities",
                    description: "Connect with like-minded peers in focused interest groups and contribute to discussions."
                  },
                  {
                    number: "02",
                    title: "Create projects",
                    description: "Document your work, upload multimedia content, and get feedback from the community."
                  },
                  {
                    number: "03",
                    title: "Practice interviews",
                    description: "Engage with AI-driven mock interviews tailored to your field and experience level."
                  },
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mr-6">
                      <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-lg font-bold text-primary">
                        {step.number}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                      <p className="text-foreground/70">{step.description}</p>
                    </div>
                  </div>
                ))}
                
                <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="section-padding">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-sm uppercase tracking-wider text-primary mb-3">Testimonials</h2>
              <h3 className="text-3xl md:text-4xl font-display font-bold">What students are saying</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Learniverse helped me connect with peers in my field and showcase my projects in a professional way.",
                  author: "Alex Johnson",
                  title: "Computer Science Student"
                },
                {
                  quote: "The mock interview feature is incredible. I felt so much more confident in my actual interviews after practicing here.",
                  author: "Sarah Lee",
                  title: "Business Major"
                },
                {
                  quote: "I found team members for my startup through communities here. The collaborative tools are next level.",
                  author: "Miguel Hernandez",
                  title: "Engineering Student"
                }
              ].map((testimonial, index) => (
                <div key={index} className="glass p-8 flex flex-col h-full">
                  <div className="flex-grow">
                    <p className="text-foreground/80 italic mb-6">"{testimonial.quote}"</p>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-foreground/60 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section className="section-padding bg-card">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-sm uppercase tracking-wider text-primary mb-3">Pricing</h2>
              <h3 className="text-3xl md:text-4xl font-display font-bold">Simple, transparent pricing</h3>
              <p className="mt-4 text-foreground/70 max-w-2xl mx-auto">
                Choose the plan that best suits your needs. All plans include access to communities, projects, and basic interview tools.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Free",
                  price: "$0",
                  description: "Perfect for trying out the platform",
                  features: [
                    "Join up to 5 communities",
                    "Create 3 public projects",
                    "5 AI mock interviews per month",
                    "Basic analytics"
                  ],
                  cta: "Get Started",
                  featured: false,
                  link: "/dashboard"
                },
                {
                  name: "Pro",
                  price: "$12",
                  period: "/month",
                  description: "Everything you need to succeed",
                  features: [
                    "Join unlimited communities",
                    "Create unlimited projects",
                    "30 AI mock interviews per month",
                    "Advanced analytics",
                    "Priority support"
                  ],
                  cta: "Get Pro",
                  featured: true,
                  link: "https://razorpay.me/@madxmas"
                },
                {
                  name: "Teams",
                  price: "$49",
                  period: "/month",
                  description: "For student teams and organizations",
                  features: [
                    "All Pro features",
                    "Team collaboration tools",
                    "Team analytics dashboard",
                    "Admin controls",
                    "Custom branding",
                    "Dedicated support"
                  ],
                  cta: "Contact Sales",
                  featured: false,
                  link: "/subscription"
                }
              ].map((plan, index) => (
                <div 
                  key={index} 
                  className={`rounded-xl overflow-hidden ${
                    plan.featured 
                      ? "ring-2 ring-primary glass-strong scale-105 z-10" 
                      : "glass"
                  }`}
                >
                  <div className={`p-8 ${plan.featured ? "bg-feature-gradient-1" : "bg-card"}`}>
                    <h4 className="text-xl font-bold mb-4">{plan.name}</h4>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-foreground/70 ml-1">{plan.period}</span>}
                    </div>
                    <p className="mt-2 text-foreground/70">{plan.description}</p>
                  </div>
                  
                  <div className="p-8">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        plan.featured 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                      onClick={() => {
                        if (plan.link.startsWith('http')) {
                          window.open(plan.link, '_blank');
                        } else {
                          window.location.href = plan.link;
                        }
                      }}
                    >
                      {plan.cta}
                      {plan.featured && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="section-padding">
          <div className="container mx-auto max-w-6xl">
            <div className="glass-strong rounded-xl overflow-hidden">
              <div className="p-12 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Ready to elevate your student journey?</h2>
                <p className="text-foreground/70 text-lg max-w-2xl mx-auto mb-8">
                  Join thousands of students already using Learniverse to build communities, showcase projects, and ace interviews.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Book a Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
