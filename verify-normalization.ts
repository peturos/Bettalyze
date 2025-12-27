
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function verifyNormalization() {
    console.log('--- Verifying Normalization Views ---');

    // 1. Check v_teams_normalized
    console.log('\n1. Testing v_teams_normalized...');
    const { data: teams, error: teamError } = await supabase
        .from('v_teams_normalized')
        .select('*')
        .limit(5);

    if (teamError) {
        console.error('❌ Error fetching teams:', teamError.message);
    } else {
        console.log(`✅ Success. Found ${teams?.length} teams. Sample:`, teams?.[0]);
    }

    // 2. Check v_match_history (Simulate "Get Recent Form")
    console.log('\n2. Testing v_match_history (Liverpool Form)...');
    const { data: form, error: formError } = await supabase
        .from('v_match_history')
        .select('*')
        .eq('team_name', 'Liverpool') // Simple filter! No home/away OR logic needed.
        .order('kickoff', { ascending: false })
        .limit(5);

    if (formError) {
        console.error('❌ Error fetching match history:', formError.message);
    } else {
        console.log(`✅ Success. Found ${form?.length} matches for Liverpool.`);
        form?.forEach(m => {
            console.log(`   - ${new Date(m.kickoff).toLocaleDateString()} vs ${m.opponent_name}: ${m.result} (${m.team_score}-${m.opponent_score})`);
        });
    }
}

verifyNormalization();
