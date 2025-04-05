
import { Json } from "@/integrations/supabase/types";

export interface Education {
  degree: string;
  field: string;
  institution: string;
  year?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration?: string;
  description?: string;
}

export interface Resume {
  id: string;
  skills: string[] | null;
  education: Education[] | null;
  experience: Experience[] | null;
  created_at: string;
  file_name: string;
  file_path: string;
  file_type: string;
  user_id: string;
  updated_at: string;
  parsed_data?: Json | null;
  certifications: string[] | null;
  profiles?: {
    full_name: string | null;
    id: string;
  } | null;
}
