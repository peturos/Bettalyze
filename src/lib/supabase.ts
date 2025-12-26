import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for client-side operations (requires Anon Key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey || 'missing-anon-key')

// Client for server-side operations (can use Service Role Key)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey)
