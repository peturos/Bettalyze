
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function testRosterView() {
    console.log('--- Testing Roster View (v_player_stats_cleaned) ---')

    // Try to find Cole Palmer stats
    const { data, error } = await supabase
        .from('v_player_stats_cleaned')
        .select('*')
        .ilike('player_name', '%Palmer%')
        .order('kickoff', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching stats:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log(`Found ${data.length} records for Palmer:`);
        data.forEach(row => {
            console.log(`[${new Date(row.kickoff).toLocaleDateString()}] vs ${row.opponent}: ${row.minutes} min, ${row.goals}G, ${row.assists}A, Rating: ${row.rating}`);
        });
    } else {
        console.log('No stats found for Palmer. Trying generalized search...');
        // Fallback: just get any 5 rows
        const { data: anyData } = await supabase.from('v_player_stats_cleaned').select('*').limit(3);
        console.log(JSON.stringify(anyData, null, 2));
    }
}

testRosterView()
