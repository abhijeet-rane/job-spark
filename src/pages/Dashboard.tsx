import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Users, FileText, Calendar, BarChart3, Briefcase, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import FileUpload from "@/components/FileUpload";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CVDetails from "@/components/CVDetails";
import CandidatesList from "@/components/CandidatesList";
import Analytics from "@/components/Analytics";
import JobPostings from "@/components/JobPostings";
import JobMatches from "@/components/JobMatches";
import { Resume } from "@/types/resume";

type Match = {
  id: string;
  job: {
    title: string;
    company: string;
  };
  match_score: number;
  status: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, signOut, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jobspark-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {profile?.full_name || user?.email?.split('@')[0]}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Admin Dashboard" : "Applicant Dashboard"}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={isAdmin ? <AdminDashboard /> : <ApplicantDashboard />} />
          <Route path="/candidates/:id" element={<CVDetails />} />
          <Route path="/candidates" element={<CandidatesList />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/job-postings" element={<JobPostings />} />
          <Route path="/job-matches" element={<JobMatches />} />
        </Routes>
      </main>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    applicants: 12,
    jobPostings: 5,
    scheduledInterviews: 3
  });
  const [resumeList, setResumeList] = useState<Resume[]>([]);
  
  useEffect(() => {
    fetchResumes();
  }, []);
  
  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select(`
          id, 
          file_name, 
          created_at, 
          education, 
          experience, 
          skills, 
          certifications,
          file_path,
          file_type,
          parsed_data,
          updated_at,
          user_id,
          profiles:user_id(full_name)
        `);
        
      if (error) throw error;
      
      const typedData = data as unknown as Resume[];
      setResumeList(typedData || []);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };
  
  const handleFileUpload = async (filePath: string, fileData: any) => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user!.id,
          title: fileData.name.split('.')[0],
          company: "JobSpark Inc",
          description: "This is a sample job description from an uploaded file.",
          skills_required: ["JavaScript", "React", "SQL"]
        });
        
      if (error) throw error;
      toast.success("Job description processed and added!");
    } catch (error: any) {
      toast.error(`Failed to process job description: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applicants}</div>
            <p className="text-xs text-muted-foreground">+2 since last week</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jobPostings}</div>
            <p className="text-xs text-muted-foreground">+1 since last month</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledInterviews}</div>
            <p className="text-xs text-muted-foreground">Next one tomorrow</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8">
          <TabsTrigger value="upload">Upload JD</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Job Description</CardTitle>
              <CardDescription>Upload a job description to start matching candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                bucketName="job_descriptions" 
                onUploadComplete={handleFileUpload}
                acceptedFileTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="candidates">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Candidates</CardTitle>
                <CardDescription>View and manage your candidates</CardDescription>
              </div>
              <Link to="/dashboard/candidates">
                <Button variant="outline">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {resumeList.length > 0 ? (
                <div className="space-y-4">
                  {resumeList.slice(0, 3).map((resume) => (
                    <Link to={`/dashboard/candidates/${resume.id}`} key={resume.id}>
                      <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">
                                {resume.profiles?.full_name || "Unnamed Candidate"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {resume.skills && resume.skills.slice(0, 3).join(", ")}
                                {resume.skills && resume.skills.length > 3 ? "..." : ""}
                              </p>
                            </div>
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-medium">No candidates yet</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Wait for applicants to upload their CVs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View hiring metrics and performance</CardDescription>
              </div>
              <Link to="/dashboard/analytics">
                <Button variant="outline">View Details</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Hiring Conversion Rate</h3>
                      <p className="font-bold text-jobspark-primary">42%</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Average Time to Hire</h3>
                      <p className="font-bold text-jobspark-primary">14 days</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Most Common Skills</h3>
                      <p className="text-sm">React, JavaScript, Node.js</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ApplicantDashboard = () => {
  const [hasCV, setHasCV] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  
  useEffect(() => {
    checkExistingCV();
    fetchMatches();
  }, []);
  
  const checkExistingCV = async () => {
    try {
      const { data: resumes, error } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user!.id)
        .limit(1);
        
      setHasCV(resumes && resumes.length > 0);
    } catch (error) {
      console.error("Error checking CV:", error);
    }
  };
  
  const fetchMatches = async () => {
    try {
      setMatches([
        {
          id: '1',
          job: { title: "Frontend Developer", company: "TechCorp" },
          match_score: 85,
          status: "pending"
        },
        {
          id: '2',
          job: { title: "React Developer", company: "WebSolutions" },
          match_score: 72,
          status: "pending"
        },
      ]);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };
  
  const handleFileUpload = async (filePath: string, fileData: any) => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user!.id,
          file_path: filePath,
          file_name: fileData.name,
          file_type: fileData.type,
          education: [
            { degree: "Bachelor of Science", field: "Computer Science", institution: "MIT", year: "2018-2022" }
          ],
          experience: [
            { title: "Software Engineer", company: "Google", duration: "2022-Present", description: "Worked on various projects" },
            { title: "Intern", company: "Facebook", duration: "2021", description: "Developed web applications" }
          ],
          skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
          certifications: ["AWS Certified Developer", "Google Cloud Professional"]
        });
        
      if (error) throw error;
      setHasCV(true);
      toast.success("CV processed and analyzed!");
    } catch (error: any) {
      toast.error(`Failed to process CV: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={hasCV ? "matches" : "upload"}>
        <TabsList className="grid grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="upload">Upload CV</TabsTrigger>
          <TabsTrigger value="matches">My Matches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your CV</CardTitle>
              <CardDescription>Upload your resume to find matching jobs</CardDescription>
            </CardHeader>
            <CardContent>
              {hasCV ? (
                <div className="text-center p-6">
                  <FileText className="mx-auto h-12 w-12 text-jobspark-primary" />
                  <h3 className="mt-4 text-lg font-medium">CV Uploaded</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your CV has been processed and is being matched with job opportunities
                  </p>
                  <Button 
                    className="mt-4 bg-jobspark-primary hover:bg-opacity-90"
                    onClick={() => setHasCV(false)}
                  >
                    Upload a New CV
                  </Button>
                </div>
              ) : (
                <FileUpload 
                  bucketName="resumes" 
                  onUploadComplete={handleFileUpload}
                  acceptedFileTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>Job Matches</CardTitle>
              <CardDescription>See jobs that match your profile</CardDescription>
            </CardHeader>
            <CardContent>
              {hasCV ? (
                matches.length > 0 ? (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <Card key={match.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <h3 className="font-medium">{match.job.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {match.job.company}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {match.match_score}% Match
                              </span>
                              <Button size="sm">Apply</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-sm font-medium">No matches yet</h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      We're still looking for jobs that match your profile
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-medium">Upload your CV first</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    You need to upload your CV to get matched with jobs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
