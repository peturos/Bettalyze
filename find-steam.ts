
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function findSteamData() {
    console.log('--- Searching for Steam Data ---')

    // Get all odds
    const { data } = await supabase
        .from('odds_markets')
        .select('fixture_id, snapshot_type')
        .limit(2000);

    if (!data) return;

    const fixtureTypes = {};
    data.forEach(d => {
        if (!fixtureTypes[d.fixture_id]) fixtureTypes[d.fixture_id] = new Set();
        fixtureTypes[d.fixture_id].add(d.snapshot_type);
    });

    // Find fixtures with both types
    const validFixtures = Object.entries(fixtureTypes)
        .filter(([fid, types]: [string, Set<string>]) => types.has('opening') && types.has('closing'))
        .map(([fid]) => fid);

    console.log(`Found ${validFixtures.length} fixtures with Opening + Closing odds.`);
    if (validFixtures.length > 0) {
        console.log('Sample Fixtures:', validFixtures.slice(0, 5));

        // Check status of one
        const { data: match } = await supabase
            .from('matches')
            .select('status, home_team_name')
            .eq('fixture_id', validFixtures[0])
            .single();
        console.log(`Sample Match Status: ${match?.status} (${match?.home_team_name})`);
    }
}

findSteamData()
