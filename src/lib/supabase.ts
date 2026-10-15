import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hooerzrqymxvvowsnlrd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvb2VyenJxeW14dnZvd3NubHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTQ0MTksImV4cCI6MjA5Nzg5MDQxOX0.YXEuwluhvFqmRb-3Ux0p2mBojHyc45IRmKYirU8LACE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
