import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ResumeWithProfiles } from "@/types/resume";
import { toast } from "sonner";

type JobMatch = {
  id: string;
  job_id: string;
  resume_id: string;
  match_score: number;
  status: string;
  created_at: string;
  job: {
    title: string;
    company: string;
    description: string;
    skills_required: string[];
  };
  resume?: ResumeWithProfiles;
};

const JobMatches = () => {
  const { user, isAdmin } = useAuth();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      let query;
      
      if (isAdmin) {
        // Admin sees all matches
        query = supabase
          .from('matches')
          .select(`
            *,
            job:job_id(title, company, description, skills_required),
            resume:resume_id(
              id,
              user_id,
              skills,
              profiles:user_id(full_name)
            )
          `)
          .order('match_score', { ascending: false });
      } else {
        // Regular users see only their matches
        const { data: userResumes, error: resumeError } = await supabase
          .from('resumes')
          .select('id')
          .eq('user_id', user.id);
          
        if (resumeError) throw resumeError;
        
        if (!userResumes || userResumes.length === 0) {
          setMatches([]);
          setLoading(false);
          return;
        }
        
        const resumeIds = userResumes.map(resume => resume.id);
        
        query = supabase
          .from('matches')
          .select(`
            *,
            job:job_id(title, company, description, skills_required)
          `)
          .in('resume_id', resumeIds)
          .order('match_score', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log("Matches fetched:", data);
        setMatches(data as JobMatch[]);
      } else {
        // Generate dummy data if no matches found
        const dummyMatches: JobMatch[] = [
          {
            id: "1",
            job_id: "1",
            resume_id: "1",
            match_score: 85,
            status: "pending",
            created_at: new Date().toISOString(),
            job: {
              title: "Frontend Developer",
              company: "TechCorp",
              description: "We're looking for a skilled frontend developer...",
              skills_required: ["React", "TypeScript", "CSS"]
            },
            resume: {
              id: "1",
              user_id: "user-1",
              skills: ["React", "JavaScript", "HTML", "CSS"],
              profiles: { full_name: "John Doe", id: "user-1" }
            } as ResumeWithProfiles
          },
          {
            id: "2",
            job_id: "2",
            resume_id: "1",
            match_score: 72,
            status: "pending",
            created_at: new Date().toISOString(),
            job: {
              title: "Full Stack Developer",
              company: "Innovative Solutions",
              description: "Looking for a versatile developer...",
              skills_required: ["React", "Node.js", "MongoDB"]
            },
            resume: {
              id: "1",
              user_id: "user-1",
              skills: ["React", "JavaScript", "HTML", "CSS"],
              profiles: { full_name: "John Doe", id: "user-1" }
            } as ResumeWithProfiles
          }
        ];
        
        setMatches(dummyMatches);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load job matches");
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (matchId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: newStatus })
        .eq('id', matchId);
        
      if (error) throw error;
      
      // Update local state
      setMatches(prevMatches => 
        prevMatches.map(match => 
          match.id === matchId ? { ...match, status: newStatus } : match
        )
      );
      
      toast.success(`Match ${newStatus === 'accepted' ? 'accepted' : 'rejected'}`);
    } catch (error) {
      console.error("Error updating match status:", error);
      toast.error("Failed to update match status");
    }
  };

  const filteredMatches = matches.filter(match => {
    if (activeTab === 'all') return true;
    if (activeTab === 'accepted') return match.status === 'accepted';
    if (activeTab === 'rejected') return match.status === 'rejected';
    return match.status === 'pending';
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Matches</h1>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Matches</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jobspark-primary"></div>
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  updateStatus={updateMatchStatus}
                  isAdmin={isAdmin} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No matches found</h3>
              <p className="mt-2 text-muted-foreground">
                No job matches currently available
              </p>
            </div>
          )}
        </TabsContent>

        
        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jobspark-primary"></div>
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  updateStatus={updateMatchStatus}
                  isAdmin={isAdmin} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No pending matches</h3>
              <p className="mt-2 text-muted-foreground">
                There are currently no pending job matches
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jobspark-primary"></div>
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  updateStatus={updateMatchStatus}
                  isAdmin={isAdmin} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No accepted matches</h3>
              <p className="mt-2 text-muted-foreground">
                You haven't accepted any job matches yet
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jobspark-primary"></div>
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  updateStatus={updateMatchStatus}
                  isAdmin={isAdmin} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No rejected matches</h3>
              <p className="mt-2 text-muted-foreground">
                You haven't rejected any job matches
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface MatchCardProps {
  match: JobMatch;
  updateStatus: (matchId: string, status: string) => Promise<void>;
  isAdmin: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, updateStatus, isAdmin }) => {
  const getStatusBadge = () => {
    switch (match.status) {
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{match.job.title}</CardTitle>
            <CardDescription>{match.job.company}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-jobspark-primary">{match.match_score}% Match</Badge>
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Job Description</h4>
            <p className="text-sm text-muted-foreground">{match.job.description.substring(0, 150)}...</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {match.job.skills_required.map((skill, i) => (
                <Badge key={i} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
          
          {isAdmin && match.resume && (
            <div>
              <h4 className="text-sm font-medium mb-1">Candidate</h4>
              <p className="text-sm">{match.resume.profiles?.full_name || "Anonymous"}</p>
              
              <h4 className="text-sm font-medium mt-2 mb-1">Candidate Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(match.resume.skills || []).map((skill, i) => (
                  <Badge key={i} variant={
                    match.job.skills_required.includes(skill) ? "default" : "outline"
                  }>{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {match.status === 'pending' && (
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline"
                onClick={() => updateStatus(match.id, 'rejected')}
              >
                Reject
              </Button>
              <Button 
                className="bg-jobspark-primary hover:bg-opacity-90"
                onClick={() => updateStatus(match.id, 'accepted')}
              >
                Accept
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobMatches;
