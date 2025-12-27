
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co';
// Using the known working service role key
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function debugTeamForm(teamName: string) {
    console.log(`--- Debugging Team Form for: ${teamName} ---`);

    // 1. Get Matches directly by name (Search both home and away)
    const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .or(`home_team_name.ilike.%${teamName}%,away_team_name.ilike.%${teamName}%`)
        .in('status', ['FT', 'AET', 'PEN']) // Completed matches only
        .order('kickoff', { ascending: false })
        .limit(5);

    if (matchError) {
        console.error(`Error fetching matches:`, matchError.message);
        return;
    }

    if (!matches || matches.length === 0) {
        console.log('No recent matches found.');
        return;
    }

    // Determine the "canonical" team name from the first match to show cleanly
    const match1 = matches[0];
    console.log('Match Keys:', Object.keys(match1));
    console.log('Match 1 Raw:', match1);

    const foundTeamName = match1.home_team_name.toLowerCase().includes(teamName.toLowerCase())
        ? match1.home_team_name
        : match1.away_team_name;

    console.log(`Found ${matches.length} matches for ${foundTeamName}.`);

    matches.forEach(m => {
        const isHome = m.home_team_name === foundTeamName;
        const opponent = isHome ? m.away_team_name : m.home_team_name;
        // Fix string concatenation if numeric
        const result = isHome
            ? (m.home_score > m.away_score ? 'W' : (m.home_score < m.away_score ? 'L' : 'D'))
            : (m.away_score > m.home_score ? 'W' : (m.away_score < m.home_score ? 'L' : 'D'));

        console.log(`- vs ${opponent} (${new Date(m.kickoff).toLocaleDateString()}): ${result} (${m.home_score}-${m.away_score})`);
    });
}

// Run Test
debugTeamForm('Liverpool');
