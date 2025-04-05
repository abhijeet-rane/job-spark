
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Briefcase, Search, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

type JobPosting = Database['public']['Tables']['job_postings']['Row'];

const JobPostings = () => {
  const { user, isAdmin } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    description: '',
    skills: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Add dummy data
        const dummyJobs = [
          {
            id: "1",
            title: "Frontend Developer",
            company: "TechCorp",
            description: "We are looking for an experienced frontend developer with React skills to join our team.",
            skills_required: ["JavaScript", "React", "HTML", "CSS"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: "dummy-user-1"
          },
          {
            id: "2",
            title: "Backend Engineer",
            company: "DataSystems Inc.",
            description: "Join our backend team to build scalable APIs and microservices for our enterprise clients.",
            skills_required: ["Python", "Django", "PostgreSQL", "Docker"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: "dummy-user-2"
          },
          {
            id: "3",
            title: "Full Stack Developer",
            company: "StartupX",
            description: "Early-stage startup seeking versatile developers comfortable with both frontend and backend.",
            skills_required: ["JavaScript", "React", "Node.js", "MongoDB"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: "dummy-user-3"
          }
        ];
        setJobs(dummyJobs);
      } else {
        setJobs(data);
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error.message);
      toast.error("Failed to load job postings");
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async () => {
    if (!user) {
      toast.error("You must be logged in to post a job");
      return;
    }

    if (!newJob.title || !newJob.company || !newJob.description || !newJob.skills) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          user_id: user.id,
          title: newJob.title,
          company: newJob.company,
          description: newJob.description,
          skills_required: newJob.skills.split(',').map(skill => skill.trim())
        });

      if (error) throw error;

      toast.success("Job posting added successfully!");
      setNewJob({ title: '', company: '', description: '', skills: '' });
      fetchJobs(); // Refresh the job list
    } catch (error: any) {
      console.error("Error adding job:", error.message);
      toast.error("Failed to add job posting");
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Job posting deleted");
      setJobs(jobs.filter(job => job.id !== id));
    } catch (error: any) {
      console.error("Error deleting job:", error.message);
      toast.error("Failed to delete job posting");
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.description.toLowerCase().includes(searchLower) ||
      (job.skills_required && job.skills_required.some(skill => 
        skill.toLowerCase().includes(searchLower)
      ))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Job Postings</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-jobspark-primary hover:bg-opacity-90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Job
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Job Posting</DialogTitle>
                  <DialogDescription>
                    Create a new job posting to find matching candidates
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title" className="text-sm font-medium">Job Title</label>
                    <Input
                      id="title"
                      placeholder="e.g., Frontend Developer"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="company" className="text-sm font-medium">Company</label>
                    <Input
                      id="company"
                      placeholder="e.g., Tech Solutions Inc."
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="skills" className="text-sm font-medium">Required Skills</label>
                    <Input
                      id="skills"
                      placeholder="e.g., JavaScript, React, Node.js"
                      value={newJob.skills}
                      onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Separate skills with commas</p>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Textarea
                      id="description"
                      placeholder="Job description and requirements..."
                      className="min-h-[120px]"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button className="bg-jobspark-primary hover:bg-opacity-90" onClick={handleAddJob}>
                      Add Job Posting
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jobspark-primary"></div>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm line-clamp-3">{job.description}</p>
                <div className="flex flex-wrap gap-2 pt-3">
                  {(job.skills_required || []).map((skill: string, i: number) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Posted: {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No job postings found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "Add your first job posting to get started"}
          </p>
        </div>
      )}
    </div>
  );
};

export default JobPostings;
