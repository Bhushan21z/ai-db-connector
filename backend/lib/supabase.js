import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
// Use Service Role Key for backend to bypass RLS
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
    console.error("❌ Missing SUPABASE_SERVICE_KEY or SUPABASE_KEY in .env");
    process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
