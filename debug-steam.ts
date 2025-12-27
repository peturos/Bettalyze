
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function debugSteam() {
    console.log('--- Debugging Market Steam Data ---')

    // 1. Check for upcoming matches
    const { data: matches, count: matchCount } = await supabase
        .from('matches')
        .select('fixture_id, home_team_name, status', { count: 'exact' })
        .in('status', ['NS', 'TBD'])
        .limit(5);

    console.log(`Found ${matchCount} matches with status NS/TBD.`);
    matches?.forEach(m => console.log(` - ${m.home_team_name} (${m.fixture_id})`));

    if (!matches || matches.length === 0) return;

    const fid = matches[0].fixture_id;

    // 2. Check odds for one fixture
    console.log(`\nChecking odds for Fixture ${fid}:`);
    const { data: odds } = await supabase
        .from('odds_markets')
        .select('*')
        .eq('fixture_id', fid)
        .eq('market', '1X2');

    const opening = odds?.filter(o => o.snapshot_type === 'opening');
    const closing = odds?.filter(o => o.snapshot_type === 'closing');

    console.log(` - Opening Snapshots: ${opening?.length}`);
    console.log(` - Closing Snapshots: ${closing?.length}`);

    if (opening && opening.length > 0 && closing && closing.length > 0) {
        const o1 = opening[0];
        const match = closing.find(c => c.bookmaker === o1.bookmaker && c.outcome === o1.outcome);
        console.log(`\nSample Comparison (${o1.bookmaker} - ${o1.outcome}):`);
        console.log(` - Open: ${o1.odds}`);
        console.log(` - Close: ${match?.odds}`);
        console.log(` - Steam Condition (Open > Close): ${o1.odds > (match?.odds || 999)}`);
    }
}

debugSteam()
