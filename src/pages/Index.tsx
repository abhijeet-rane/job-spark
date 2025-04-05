
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { 
  FileText, 
  User, 
  Zap, 
  Calendar, 
  BarChart3, 
  Shield, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

const Index = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-background border-b border-border py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-jobspark-primary">Job</span>
            <span className="text-jobspark-accent">Spark</span>
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link to="/auth?register=true">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-jobspark-primary to-jobspark-accent">
            AI-Powered Job Matching Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            JobSpark uses AI to match candidates with job descriptions, automating and enhancing the screening process. Find the perfect fit faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?register=true">
              <Button size="lg" className="bg-jobspark-primary hover:bg-opacity-90">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Log In
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="mt-12 max-w-5xl mx-auto bg-card p-4 rounded-lg shadow-lg border border-border">
          <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
            <div className="text-center p-8">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-jobspark-primary" />
              <h3 className="text-xl font-semibold">JobSpark Dashboard Preview</h3>
              <p className="text-muted-foreground">AI-powered candidate matching and analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform simplifies and enhances the recruitment process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileText className="h-10 w-10 text-jobspark-primary" />}
              title="CV & JD Processing"
              description="Extract structured data from CVs and summarize job descriptions automatically."
            />
            <FeatureCard 
              icon={<Zap className="h-10 w-10 text-jobspark-primary" />}
              title="Intelligent Matching"
              description="Match candidates to jobs using AI algorithms and sentence similarity."
            />
            <FeatureCard 
              icon={<User className="h-10 w-10 text-jobspark-primary" />}
              title="Candidate Shortlisting"
              description="Automatically shortlist top candidates based on match scores."
            />
            <FeatureCard 
              icon={<Calendar className="h-10 w-10 text-jobspark-primary" />}
              title="Interview Scheduling"
              description="Schedule interviews and send personalized invitation emails."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-10 w-10 text-jobspark-primary" />}
              title="Analytics Dashboard"
              description="View comprehensive analytics on your recruitment process."
            />
            <FeatureCard 
              icon={<Shield className="h-10 w-10 text-jobspark-primary" />}
              title="Secure Authentication"
              description="Role-based access control for applicants and admins."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process makes hiring easier and more efficient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard 
              number={1}
              title="Upload"
              description="Upload job descriptions and candidate resumes."
            />
            <StepCard 
              number={2}
              title="Match"
              description="AI matches candidates to job requirements."
            />
            <StepCard 
              number={3}
              title="Shortlist"
              description="Review and shortlist top candidates."
            />
            <StepCard 
              number={4}
              title="Schedule"
              description="Schedule interviews and send invitations."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from recruiters and job seekers who've experienced JobSpark.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="JobSpark has revolutionized our hiring process. We've reduced our time-to-hire by 40%."
              author="Sarah Johnson"
              title="HR Director"
            />
            <TestimonialCard 
              quote="As a job seeker, JobSpark helped me find opportunities that truly match my skills and experience."
              author="Michael Chen"
              title="Software Engineer"
            />
            <TestimonialCard 
              quote="The AI-powered matching has significantly improved the quality of candidates we interview."
              author="Alex Rodriguez"
              title="Recruitment Manager"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-jobspark-primary to-jobspark-secondary py-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Hiring Process?</h2>
          <p className="mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of companies that use JobSpark to find the perfect candidates faster and more efficiently.
          </p>
          <Link to="/auth?register=true">
            <Button size="lg" variant="secondary" className="bg-white text-jobspark-primary hover:bg-white/90">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-jobspark-primary">Job</span>
              <span className="text-2xl font-bold text-jobspark-accent">Spark</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              AI-powered job matching platform that transforms the hiring process.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
              <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm text-muted-foreground hover:text-foreground">Documentation</Link></li>
              <li><Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQs</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-border">
          <p className="text-sm text-center text-muted-foreground">
            © {new Date().getFullYear()} JobSpark. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <Card className="h-full card-hover">
      <CardContent className="pt-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const StepCard = ({ number, title, description }: { number: number, title: string, description: string }) => {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-jobspark-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const TestimonialCard = ({ quote, author, title }: { quote: string, author: string, title: string }) => {
  return (
    <Card className="h-full card-hover">
      <CardContent className="pt-6">
        <CheckCircle2 className="h-6 w-6 text-jobspark-primary mb-4" />
        <p className="italic mb-4">{quote}</p>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Index;
