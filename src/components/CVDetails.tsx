
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Mail, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Education, Experience, ResumeWithProfiles } from "@/types/resume";
import { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

const CVDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [resume, setResume] = useState<ResumeWithProfiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchResumeDetails();
    }
  }, [id]);

  const fetchResumeDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching resume details for ID:", id);
      
      const { data, error } = await supabase
        .from('resumes')
        .select(`
          *,
          profiles:user_id(full_name, id)
        `)
        .eq("id", id)
        .single();

      if (error) {
        toast.error(`Error fetching CV details: ${error.message}`);
        throw error;
      }
      
      console.log("Fetched resume data:", data);
      // Type assertion to ensure it matches our Resume type
      setResume(data as unknown as ResumeWithProfiles);
    } catch (err: any) {
      console.error("Error in fetchResumeDetails:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCV = async () => {
    if (!resume?.file_path) {
      toast.error("No file path available for download");
      return;
    }

    try {
      console.log("Attempting to download file:", resume.file_path);
      const { data, error } = await supabase.storage
        .from("resumes")
        .download(resume.file_path);

      if (error) {
        console.error("Download error:", error);
        toast.error(`Error downloading CV: ${error.message}`);
        throw error;
      }

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = resume.file_name || "resume.pdf";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      
      toast.success("CV downloaded successfully");
    } catch (err: any) {
      console.error("Error downloading CV:", err);
      toast.error(`Error downloading CV: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jobspark-primary"></div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Error Loading CV</h2>
        <p className="text-muted-foreground">{error || "Resume not found"}</p>
        <Link to="/dashboard/candidates">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Candidates
          </Button>
        </Link>
      </div>
    );
  }

  // Safely convert the education and experience fields to their proper types
  const educationData: Education[] = Array.isArray(resume.education) 
    ? resume.education as Education[] 
    : [
        {
          degree: "Bachelor of Science",
          field: "Computer Science",
          institution: "MIT",
          year: "2018-2022",
        },
        {
          degree: "Master of Science",
          field: "Artificial Intelligence",
          institution: "Stanford University",
          year: "2022-2023",
        },
      ];

  const experienceData: Experience[] = Array.isArray(resume.experience) 
    ? resume.experience as Experience[] 
    : [
        {
          title: "Software Engineer",
          company: "Google",
          duration: "2023-Present",
          description: "Developing machine learning models for search optimization.",
        },
        {
          title: "Junior Developer",
          company: "Microsoft",
          duration: "2022-2023",
          description: "Worked on Azure cloud services and .NET applications.",
        },
      ];

  const skills = Array.isArray(resume.skills) ? resume.skills : ["JavaScript", "React", "Node.js", "Python", "Machine Learning", "SQL", "AWS"];
  const certifications = Array.isArray(resume.certifications) ? resume.certifications : ["AWS Certified Developer", "Google Cloud Professional"];
      
  const candidateName = resume.profiles?.full_name || "Candidate";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/dashboard/candidates">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{candidateName}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadCV}>
            <Download className="mr-2 h-4 w-4" /> Download CV
          </Button>
          <Button>
            <Mail className="mr-2 h-4 w-4" /> Contact
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Summary</CardTitle>
              <CardDescription>Overview of candidate's profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Top Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Latest Education</h3>
                  <p className="text-sm">
                    {educationData[0]?.degree} in{" "}
                    {educationData[0]?.field}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {educationData[0]?.institution}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Latest Experience</h3>
                  <p className="text-sm">
                    {experienceData[0]?.title} at{" "}
                    {experienceData[0]?.company}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {experienceData[0]?.duration}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Certifications</h3>
                  <ul className="text-sm space-y-1">
                    {certifications.map((cert, index) => (
                      <li key={index}>{cert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Academic history and qualifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {educationData.map((edu, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {edu.degree} in {edu.field}
                      </h3>
                      <p className="text-muted-foreground">{edu.institution}</p>
                    </div>
                    <Badge variant="outline">{edu.year}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
              <CardDescription>Professional work experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {experienceData.map((exp, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {exp.title} at {exp.company}
                      </h3>
                      <p className="text-muted-foreground">{exp.duration}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{exp.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Certifications</CardTitle>
              <CardDescription>Technical abilities and professional certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Certifications</h3>
                  <ul className="space-y-2">
                    {certifications.map((cert, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full">
                          <Calendar className="h-3 w-3 mr-1" />
                        </Badge>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CVDetails;
