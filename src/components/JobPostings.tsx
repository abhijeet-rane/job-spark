
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Calendar, Users, Filter, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FileUpload from "./FileUpload";
import { toast } from "sonner";

// Import Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type JobPosting = {
  id: string;
  title: string;
  company: string;
  description: string;
  skills_required: string[] | null;
  created_at: string;
};

const JobPostings = () => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  
  useEffect(() => {
    fetchJobPostings();
  }, []);
  
  const fetchJobPostings = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length === 0) {
        // Add dummy data if none exists
        setJobPostings([
          {
            id: "1",
            title: "Frontend Developer",
            company: "JobSpark Inc",
            description: "We are looking for an experienced frontend developer with expertise in React to join our team.",
            skills_required: ["React", "JavaScript", "CSS", "HTML"],
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Backend Engineer",
            company: "JobSpark Inc",
            description: "Working on our core backend systems and APIs using Node.js and PostgreSQL.",
            skills_required: ["Node.js", "Express", "PostgreSQL", "TypeScript"],
            created_at: new Date().toISOString(),
          },
          {
            id: "3",
            title: "DevOps Engineer",
            company: "JobSpark Inc",
            description: "Managing our cloud infrastructure and CI/CD pipelines.",
            skills_required: ["AWS", "Docker", "Kubernetes", "CI/CD"],
            created_at: new Date().toISOString(),
          },
          {
            id: "4",
            title: "UX Designer",
            company: "JobSpark Inc",
            description: "Design user experiences for our web applications.",
            skills_required: ["Figma", "User Research", "UI Design", "Prototyping"],
            created_at: new Date().toISOString(),
          },
          {
            id: "5",
            title: "Product Manager",
            company: "JobSpark Inc",
            description: "Lead product development from conception to launch.",
            skills_required: ["Product Strategy", "Agile", "User Stories", "Roadmapping"],
            created_at: new Date().toISOString(),
          },
        ]);
      } else {
        setJobPostings(data || []);
      }
    } catch (error) {
      console.error("Error fetching job postings:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileUpload = async (filePath: string, fileData: any) => {
    try {
      setShowNewJobDialog(false);
      
      // In a real implementation, you would parse the file content
      // For now, create a job posting with basic info
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user!.id,
          title: fileData.name.split('.')[0],
          company: "JobSpark Inc",
          description: "This is a job description uploaded from a file.",
          skills_required: ["Skill 1", "Skill 2", "Skill 3"]
        });
        
      if (error) throw error;
      
      toast.success("Job posting created successfully!");
      fetchJobPostings();
    } catch (error: any) {
      toast.error(`Failed to create job posting: ${error.message}`);
    }
  };
  
  const handleSubmitJob = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    try {
      const skillsText = formData.get('skills') as string;
      const skills = skillsText.split(',').map(skill => skill.trim()).filter(Boolean);
      
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user!.id,
          title: formData.get('title') as string,
          company: formData.get('company') as string,
          description: formData.get('description') as string,
          skills_required: skills
        });
        
      if (error) throw error;
      
      toast.success("Job posting created successfully!");
      setShowNewJobDialog(false);
      fetchJobPostings();
    } catch (error: any) {
      toast.error(`Failed to create job posting: ${error.message}`);
    }
  };
  
  const filteredJobs = jobPostings.filter(job => {
    if (!searchTerm) return true;
    
    const title = job.title?.toLowerCase() || "";
    const company = job.company?.toLowerCase() || "";
    const description = job.description?.toLowerCase() || "";
    
    return title.includes(searchTerm.toLowerCase()) || 
           company.includes(searchTerm.toLowerCase()) ||
           description.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Job Postings</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Job Posting</DialogTitle>
                <DialogDescription>
                  Fill in the details or upload a job description file
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="form" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="form">Manual Entry</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="form">
                  <form onSubmit={handleSubmitJob} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input id="title" name="title" placeholder="Frontend Developer" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" name="company" placeholder="JobSpark Inc" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        placeholder="Detailed job description..."
                        className="min-h-32"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                      <Input 
                        id="skills" 
                        name="skills" 
                        placeholder="React, JavaScript, CSS, TypeScript" 
                        required
                      />
                    </div>
                    <DialogFooter className="pt-4">
                      <Button onClick={() => setShowNewJobDialog(false)} variant="outline" type="button">
                        Cancel
                      </Button>
                      <Button type="submit">Create Job</Button>
                    </DialogFooter>
                  </form>
                </TabsContent>
                <TabsContent value="upload">
                  <div className="py-4">
                    <FileUpload
                      bucketName="job_descriptions"
                      onUploadComplete={handleFileUpload}
                      acceptedFileTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jobspark-primary"></div>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>{job.company}</CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(job.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {(job.skills_required || []).map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-muted-foreground text-sm">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{Math.floor(Math.random() * 20)} applicants</span>
                </div>
                <Button size="sm">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No job postings found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "Create your first job posting to get started"}
          </p>
        </div>
      )}
    </div>
  );
};

export default JobPostings;
