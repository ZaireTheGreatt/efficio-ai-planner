import { createClient } from "@supabase/supabase-js";

// Use Lovable Cloud-provided environment variables
const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey: string | undefined = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Avoid crashing the whole app; logs help diagnose missing config in non-Cloud envs
  // In Lovable Cloud these are auto-injected.
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
