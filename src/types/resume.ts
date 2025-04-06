
import { Json } from "@/integrations/supabase/types";

export type Education = {
  degree: string;
  field: string;
  institution: string;
  year: string;
};

export type Experience = {
  title: string;
  company: string;
  duration: string;
  description: string;
};

export type Resume = {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  skills: string[] | null;
  education: Education[] | null;
  experience: Experience[] | null;
  certifications: string[] | null;
  created_at: string;
  updated_at: string;
  parsed_data: Json | null;
};

export type ResumeWithProfiles = Resume & {
  profiles?: {
    full_name: string | null;
    id: string;
  } | null;
};
