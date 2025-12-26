
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAnon() {
    console.log('Testing Anon Key Access...')
    const { data, error } = await supabase.from('matches').select('*').limit(5)

    if (error) {
        console.error('Anon Access Failed:', error.message)
    } else {
        console.log('Anon Access Success. Rows:', data.length)
    }
}

testAnon()
