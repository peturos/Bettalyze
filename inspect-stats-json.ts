
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function inspectPlayerStats() {
    console.log('--- Inspecting Player Stats JSON ---')

    const { data } = await supabase
        .from('match_player_stats')
        .select('player_name, stats')
        .limit(1)

    if (data && data.length > 0) {
        console.log(`Player: ${data[0].player_name}`);
        console.log(JSON.stringify(data[0].stats, null, 2));
    }
}

inspectPlayerStats()
