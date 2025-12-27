
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function inspectSchema() {
    console.log('--- Inspecting Public Schema Tables & Views ---');

    // This query fetches table/view names from postgres metadata (via a slightly hacked RPC or just inspecting known tables if RPC unavailable)
    // Since we don't have direct SQL access, we'll try to list rows from likely tables to confirm existence.

    const potentialTables = ['teams', 'matches', 'standings_raw', 'players', 'match_stats', 'match_events'];

    for (const t of potentialTables) {
        const { data, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ Table '${t}': NOT FOUND or Error (${error.message})`);
        } else {
            console.log(`✅ Table '${t}': EXISTS`);
        }
    }

    console.log('\n--- Checking for Views ---');
    const potentialViews = ['v_performance_metrics', 'v_market_steam', 'v_player_stats_cleaned'];
    for (const v of potentialViews) {
        const { data, error } = await supabase.from(v).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ View '${v}': NOT FOUND or Error (${error.message})`);
        } else {
            console.log(`✅ View '${v}': EXISTS`);
        }
    }
}

inspectSchema();
