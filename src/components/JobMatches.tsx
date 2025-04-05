
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, CheckCircle, Clock, X, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const JobMatches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  
  useEffect(() => {
    fetchMatches();
  }, []);
  
  const fetchMatches = async () => {
    try {
      // In a real implementation, you would fetch from the database
      // For now, use dummy data
      const dummyMatches = [
        {
          id: "1",
          job: {
            id: "101",
            title: "Frontend Developer",
            company: "TechCorp",
            description: "Developing user interfaces for web applications",
            skills_required: ["React", "TypeScript", "CSS", "HTML"]
          },
          candidate: {
            id: "201",
            name: "John Smith",
            skills: ["React", "JavaScript", "CSS", "Redux"]
          },
          match_score: 85,
          status: "pending",
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          job: {
            id: "102",
            title: "Backend Engineer",
            company: "DataSys Inc",
            description: "Building APIs and database integrations",
            skills_required: ["Node.js", "Express", "MongoDB", "TypeScript"]
          },
          candidate: {
            id: "202",
            name: "Jane Doe",
            skills: ["Node.js", "Express", "PostgreSQL", "Python"]
          },
          match_score: 78,
          status: "interview_scheduled",
          created_at: new Date().toISOString()
        },
        {
          id: "3",
          job: {
            id: "103",
            title: "Full Stack Developer",
            company: "WebSolutions",
            description: "Developing both frontend and backend components",
            skills_required: ["React", "Node.js", "MongoDB", "Redux"]
          },
          candidate: {
            id: "203",
            name: "Alex Johnson",
            skills: ["React", "Node.js", "Express", "MongoDB"]
          },
          match_score: 92,
          status: "hired",
          created_at: new Date().toISOString()
        },
        {
          id: "4",
          job: {
            id: "104",
            title: "DevOps Engineer",
            company: "CloudTech",
            description: "Managing cloud infrastructure and CI/CD pipelines",
            skills_required: ["AWS", "Docker", "Kubernetes", "Terraform"]
          },
          candidate: {
            id: "204",
            name: "Michael Brown",
            skills: ["AWS", "Docker", "Jenkins", "Ansible"]
          },
          match_score: 70,
          status: "rejected",
          created_at: new Date().toISOString()
        },
        {
          id: "5",
          job: {
            id: "105",
            title: "UI/UX Designer",
            company: "DesignHub",
            description: "Creating user interfaces and experiences for web and mobile applications",
            skills_required: ["Figma", "User Research", "Wireframing", "Adobe XD"]
          },
          candidate: {
            id: "205",
            name: "Emily Wilson",
            skills: ["Figma", "Sketch", "Adobe XD", "Prototyping"]
          },
          match_score: 88,
          status: "pending",
          created_at: new Date().toISOString()
        }
      ];
      
      setMatches(dummyMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="flex gap-1 items-center"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "interview_scheduled":
        return <Badge variant="secondary" className="flex gap-1 items-center"><Calendar className="h-3 w-3" /> Interview Scheduled</Badge>;
      case "hired":
        return <Badge variant="default" className="bg-green-500 flex gap-1 items-center"><CheckCircle className="h-3 w-3" /> Hired</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex gap-1 items-center"><X className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const filteredMatches = matches.filter(match => {
    if (filter === "all") return true;
    return match.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Job Matches</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={filter === "pending" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
            <Button 
              variant={filter === "interview_scheduled" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("interview_scheduled")}
            >
              Interviews
            </Button>
            <Button 
              variant={filter === "hired" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("hired")}
            >
              Hired
            </Button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jobspark-primary"></div>
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <Card key={match.id} className="hover:bg-muted/10 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{match.job.title}</h3>
                          <p className="text-sm text-muted-foreground">{match.job.company}</p>
                        </div>
                      </div>
                      <div className="mt-3 ml-12">
                        <p className="text-sm line-clamp-2">{match.job.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {match.job.skills_required.map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Candidate Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-jobspark-accent/10 p-2">
                          <Filter className="h-5 w-5 text-jobspark-accent" />
                        </div>
                        <div>
                          <h3 className="font-medium">{match.candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{match.match_score}% match</p>
                        </div>
                      </div>
                      <div className="mt-3 ml-12">
                        <div className="flex flex-wrap gap-1">
                          {match.candidate.skills.map((skill: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-between gap-2">
                    {getStatusBadge(match.status)}
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No matches found</h3>
          <p className="mt-2 text-muted-foreground">
            {filter !== "all" ? "Try changing your filter" : "Upload more CVs or job descriptions to generate matches"}
          </p>
        </div>
      )}
    </div>
  );
};

export default JobMatches;
