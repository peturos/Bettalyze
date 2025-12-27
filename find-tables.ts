
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function listTables() {
    console.log('--- Listing All Tables ---')

    // Query information_schema
    const { data, error } = await supabase
        .rpc('get_tables_info') // If RPC exists... likely not by default

    // Fallback: Just try to select from likely candidates
    const candidates = ['player_stats', 'match_player_stats', 'stats_players', 'match_events'];

    for (const table of candidates) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
            console.log(`✅ Table Found: ${table}`);
            if (data && data.length > 0) {
                console.log(`   Keys: ${Object.keys(data[0]).join(', ')}`);
            }
        } else {
            console.log(`❌ Table Not Found: ${table} (${error.code})`);
        }
    }
}

listTables()
