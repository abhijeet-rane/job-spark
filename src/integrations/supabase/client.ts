// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ejdpgzqdmfurgithyqbo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZHBnenFkbWZ1cmdpdGh5cWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NTUwMjcsImV4cCI6MjA1OTQzMTAyN30.gEuSOnUzkybdibrU-oqCsDaiPwYaYIA08yn-5mP5WjM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);