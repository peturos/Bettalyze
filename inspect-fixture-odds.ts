
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function inspectFixtureOdds() {
    console.log('--- Inspecting Odds for 1379144 (Liverpool) ---')

    const { data } = await supabase
        .from('odds_markets')
        .select('*')
        .eq('fixture_id', 1379144) // Liverpool vs Southampton
        .eq('market', '1X2');

    if (!data || data.length === 0) {
        console.log('No odds found for fixture.');
        return;
    }

    // Group by snapshot type
    const types = {};
    data.forEach(d => {
        types[d.snapshot_type] = (types[d.snapshot_type] || 0) + 1;
    });
    console.log('Snapshot Counts:', JSON.stringify(types, null, 2));

    // Print first 5 rows
    console.log('First 5 rows:');
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
}

inspectFixtureOdds()
