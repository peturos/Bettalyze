
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars from .env.local explicitly since we are running a standalone script
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function testConnection() {
    console.log('Testing connection to:', supabaseUrl)
    // Try to fetch one row from matches to see if we have access
    const { data, error } = await supabase.from('matches').select('fixture_id').limit(1)

    if (error) {
        console.error('Connection failed:', error.message)
        process.exit(1)
    }

    console.log('Connection successful! Found', data?.length, 'rows.')
}

testConnection()
