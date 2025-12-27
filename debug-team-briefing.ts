
import { getTeamBriefing } from './src/lib/tools';
import { createClient } from '@supabase/supabase-js';

// Need to redefine supabase here if tools.ts uses the one from lib which lacks env vars in standalone mode
// actually tools.ts imports from ./supabase which might fail in standalone context if env vars aren't loaded.
// So I will just copy the logic effectively or try to run it if I can mock the env?
// Easier to just copy the body of getTeamBriefing for debugging purposes to see exactly where it fails.

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function debugBriefing(teamName: string) {
    console.log(`--- Debugging Briefing for: ${teamName} ---`);

    // 1. Get Standings Data
    const { data: standingsData, error } = await supabase
        .from('standings_raw')
        .select('json')
        .order('fetched_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching standings:', error);
        return;
    }

    if (!standingsData || standingsData.length === 0) {
        console.error('No standings data found.');
        return;
    }

    console.log('Standings Data Found.');
    // Inspect structure depth
    const root = standingsData[0].json;
    console.log('Root Type:', typeof root);
    console.log('Root Value:', JSON.stringify(root, null, 2).slice(0, 500)); // Print first 500 chars

    const response = root; // root IS the response array
    if (!response) { console.log('No response key'); return; }

    const league = response[0]?.league;
    if (!league) { console.log('No league key'); return; }

    const standings = league.standings;
    if (!standings) { console.log('No standings key'); return; }

    const table = standings[0];
    if (!table) { console.log('No table found index 0'); return; }

    console.log(`Table length: ${table.length}`);

    // Fuzzy find
    const teamStats = table.find((t: any) => {
        const name = t.team.name.toLowerCase();
        const query = teamName.toLowerCase();
        const match = name.includes(query);
        if (match) console.log(`Matched: ${t.team.name} with ${teamName}`);
        return match;
    });

    if (!teamStats) {
        console.log(`Team not found via fuzzy search for '${teamName}'`);
        // List names to see what's there
        console.log('Available teams:', table.map((t: any) => t.team.name).join(', '));
        return;
    }

    console.log('Team Stats found:', JSON.stringify(teamStats.team));
}

debugBriefing('West Ham');
