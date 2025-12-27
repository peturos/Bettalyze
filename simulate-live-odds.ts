
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function simulateSteam() {
    console.log('--- Simulating Live Market Steam (Robust) ---')

    // Find ANY opening odd for Liverpool (1379144)
    const { data: openOdds } = await supabase
        .from('odds_markets')
        .select('*')
        .eq('fixture_id', 1379144)
        .eq('snapshot_type', 'opening')
        .limit(1)
        .single()

    if (!openOdds) {
        console.log('Could not find ANY opening odd for Liverpool.');
        return;
    }

    console.log(`Found Opening: ${openOdds.bookmaker} -> ${openOdds.outcome} @ ${openOdds.odds}`);

    // Simulate a 20% drop (massive steam)
    const newOdds = Number((openOdds.odds * 0.8).toFixed(2));
    console.log(`Simulating Drop to: ${newOdds}`);

    const { error } = await supabase
        .from('odds_markets')
        .insert({
            fixture_id: openOdds.fixture_id,
            bookmaker: openOdds.bookmaker,
            market: openOdds.market,
            outcome: openOdds.outcome,
            odds: newOdds,
            implied_prob: 1 / newOdds,
            snapshot_type: 'closing', // Treating as "Current"
            recorded_at: new Date().toISOString()
        })

    if (error) console.error('Error inserting steam:', error);
    else console.log('Successfully injected steam! 🚂');
}

simulateSteam()
