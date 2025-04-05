
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Resume } from "@/types/resume";
import { Database } from "@/integrations/supabase/types";

type ResumeWithProfiles = Resume & {
  profiles?: {
    full_name: string | null;
    id: string;
  } | null;
};

const CandidatesList = () => {
  const [candidates, setCandidates] = useState<ResumeWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    fetchCandidates();
  }, []);
  
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resumes')
        .select(`
          id, 
          skills, 
          education, 
          experience, 
          created_at,
          file_name,
          file_path,
          file_type,
          user_id,
          updated_at,
          parsed_data,
          certifications,
          profiles:user_id(full_name, id)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length === 0) {
        // Add dummy data if none exists
        const dummyData: ResumeWithProfiles[] = [
          {
            id: "1",
            skills: ["JavaScript", "React", "Node.js"],
            education: [{ degree: "Bachelor's", field: "Computer Science", institution: "MIT" }],
            experience: [{ title: "Software Engineer", company: "Google" }],
            created_at: new Date().toISOString(),
            file_name: "resume.pdf",
            file_path: "path/to/file",
            file_type: "application/pdf",
            user_id: "user1",
            updated_at: new Date().toISOString(),
            certifications: ["AWS Certified Developer"],
            parsed_data: null,
            profiles: { full_name: "John Doe", id: "user1" }
          },
          {
            id: "2",
            skills: ["Python", "Django", "SQL"],
            education: [{ degree: "Master's", field: "Data Science", institution: "Stanford" }],
            experience: [{ title: "Data Scientist", company: "Amazon" }],
            created_at: new Date().toISOString(),
            file_name: "resume2.pdf",
            file_path: "path/to/file2",
            file_type: "application/pdf",
            user_id: "user2",
            updated_at: new Date().toISOString(),
            certifications: ["Google Cloud Professional"],
            parsed_data: null,
            profiles: { full_name: "Jane Smith", id: "user2" }
          },
          {
            id: "3",
            skills: ["Swift", "iOS", "Objective-C"],
            education: [{ degree: "Bachelor's", field: "Mobile Development", institution: "Berkeley" }],
            experience: [{ title: "iOS Developer", company: "Apple" }],
            created_at: new Date().toISOString(),
            file_name: "resume3.pdf",
            file_path: "path/to/file3",
            file_type: "application/pdf",
            user_id: "user3",
            updated_at: new Date().toISOString(),
            certifications: ["Apple Certified Developer"],
            parsed_data: null,
            profiles: { full_name: "Mike Johnson", id: "user3" }
          },
        ];
        setCandidates(dummyData);
      } else {
        // Type assertion to handle the profiles join
        const typedData = data as unknown as ResumeWithProfiles[];
        setCandidates(typedData);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCandidates = candidates.filter(candidate => {
    if (!searchTerm) return true;
    
    const name = candidate.profiles?.full_name?.toLowerCase() || "";
    const skills = candidate.skills?.map((s: string) => s.toLowerCase()).join(" ") || "";
    
    return name.includes(searchTerm.toLowerCase()) || 
           skills.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search candidates..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jobspark-primary"></div>
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCandidates.map((candidate) => (
            <Link to={`/dashboard/candidates/${candidate.id}`} key={candidate.id}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{candidate.profiles?.full_name || "Anonymous Applicant"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(candidate.experience) && candidate.experience[0]?.title || "No experience listed"}
                          {Array.isArray(candidate.experience) && candidate.experience[0]?.company ? ` at ${candidate.experience[0].company}` : ""}
                        </p>
                      </div>
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(candidate.skills || []).slice(0, 3).map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                      {(candidate.skills || []).length > 3 && (
                        <Badge variant="outline">+{(candidate.skills || []).length - 3} more</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No candidates found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "No candidates have uploaded their CVs yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidatesList;
