
import { supabaseAdmin as supabase } from './supabase';

// Cluster A: The Justice Engine (Performance vs Expected)
export async function getJusticeMetrics(
    metric: 'unlucky' | 'lucky' = 'unlucky',
    limit: number = 20
) {
    // 'unlucky' = High Total Luck Score (Positive)
    // 'lucky' = Low Total Luck Score (Negative)
    const isUnlucky = metric === 'unlucky';

    const { data, error } = await supabase
        .from('v_performance_metrics')
        .select('*')
        .order('total_luck_score', { ascending: !isUnlucky })
        .limit(limit);

    if (error) {
        console.error(`Error fetching justice metrics (${metric}):`, error);
        return [];
    }

    return data.map(team => ({
        team: team.team_name,
        matches: team.matches_played,
        // Offense
        xG_For: Number(team.xg_for).toFixed(2),
        Goals_For: team.goals_for,
        // Defense
        xG_Against: Number(team.xg_against).toFixed(2),
        Goals_Against: team.goals_against,
        // Verdict
        Luck_Score: Number(team.total_luck_score).toFixed(2),
        verdict: isUnlucky ? 'Unlucky (Underperforming)' : 'Lucky (Overperforming)'
    }));
}

// Cluster E: The Market Engine (Odds Movements & Steam)
export async function getMarketSteam(limit: number = 10) {
    const { data, error } = await supabase
        .from('v_market_steam')
        .select('*')
        .order('steam_percentage', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching market steam:', error);
        return [];
    }

    return data.map(item => {
        const steam = Number(item.steam_percentage);
        const isHigh = steam > 10;

        return {
            // UI Props
            homeTeam: item.home_team,
            awayTeam: item.away_team,
            market: "1X2 (Match Winner)",
            selection: item.selection,
            odds: item.close_price,
            edgeType: isHigh ? 'HIGH' : 'MEDIUM',
            confidence: Math.min(60 + steam, 95), // Heuristic: 60% base + steam%
            reasons: [
                `Sharp money alert: Odds dropped by ${steam}%`,
                `Opened at ${item.open_price}, now smashed to ${item.close_price}`,
                `Bookmaker: ${item.bookmaker} leading the move`
            ],

            // Text-based Analysis (for Chat)
            analysis: steam > 5
                ? '🔥 HUGE STEAM: Market is hammering this side.'
                : '📉 Noticeable Drop. Sharp money potentially involved.'
        };
    });
}

// Cluster D: The Roster Engine (Player Form & Stats)
export async function getPlayerBriefing(playerName: string, limit: number = 5) {
    // 1. Find the player (Fuzzy Search)
    const { data, error } = await supabase
        .from('v_player_stats_cleaned')
        .select('*')
        .ilike('player_name', `%${playerName}%`)
        .order('kickoff', { ascending: false })
        .limit(limit);

    if (error || !data || data.length === 0) {
        console.error(`Error fetching player briefing for ${playerName}:`, error);
        return null;
    }

    // 2. Aggregate Stats
    const stats = {
        name: data[0].player_name,
        team: data[0].team_name,
        matches_analyzed: data.length,
        total_goals: data.reduce((sum, row) => sum + row.goals, 0),
        total_assists: data.reduce((sum, row) => sum + row.assists, 0),
        // Calculate Avg Rating (ignoring 'N/A')
        avg_rating: (data.reduce((sum, row) => sum + (Number(row.rating) || 0), 0) / data.filter(r => r.rating !== 'N/A').length).toFixed(2),
        recent_form: data.map(row => `${new Date(row.kickoff).toLocaleDateString()} vs ${row.opponent} (${row.minutes}mins): ${row.goals}G, ${row.assists}A, ${row.rating} Rating`)
    };

    return stats;
}

// Cluster F: The Generalist (Briefing & Search)

export async function getTeamBriefing(teamName: string) {
    // 1. Get Standings Data (Rank, Form, Points)
    // We have to query the raw JSON because we don't have a clean view for standings yet in this context
    const { data: standingsData, error } = await supabase
        .from('standings_raw')
        .select('json')
        .order('fetched_at', { ascending: false })
        .limit(1);

    if (error || !standingsData || standingsData.length === 0) {
        console.error('Error fetching standings for briefing:', error);
        return null;
    }

    // Parse the deep nested JSON from API-Football
    // structure: row.json[0].league.standings[0] (Direct array access, no 'response' key wrapper in DB)
    const leagueTable = standingsData[0].json?.[0]?.league?.standings?.[0];

    if (!leagueTable) return null;

    // Fuzzy find the team
    const teamStats = leagueTable.find((t: any) =>
        t.team.name.toLowerCase().includes(teamName.toLowerCase())
    );

    if (!teamStats) return null;

    // 2. Get Next Match (Simulated/Simple query)
    const { data: nextMatch } = await supabase
        .from('matches')
        .select('home_team_name, away_team_name, kickoff')
        .or(`home_team_name.ilike.%${teamName}%,away_team_name.ilike.%${teamName}%`)
        .in('status', ['NS', 'TBD'])
        .order('kickoff', { ascending: true })
        .limit(1)
        .single();

    return {
        team: teamStats.team.name,
        rank: teamStats.rank,
        points: teamStats.points,
        form: teamStats.form, // e.g. "WWLDW"
        league_position: `${teamStats.rank}th in Premier League`,
        next_match: nextMatch
            ? `vs ${nextMatch.home_team_name === teamStats.team.name ? nextMatch.away_team_name : nextMatch.home_team_name} (${new Date(nextMatch.kickoff).toLocaleDateString()})`
            : 'Season Completed'
    };
}

// "Safety Net" Tool
export async function searchWeb(query: string) {
    // In a real production app, this would call TAVILY_API_KEY
    // For this demo, we return a system message guiding the LLM
    console.log(`[Mock Search] Searching for: ${query}`);

    return {
        system_note: "Bettalyze_Search_Agent: Access to live web is currently restricted in this environment.",
        guidance: "Please answer based on your internal knowledge if possible, or explain that you focus on Stats/Odds/Rosters. Do NOT hallucinate specific weather or breaking news."
    };
}

// Cluster B: The Analyst (Head-to-Head & Form)
export async function getTeamForm(teamName: string, limit: number = 5) {
    // 1. Find the team ID (fuzzy search)
    const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('team_id, name')
        .ilike('name', `%${teamName}%`)
        .limit(1)
        .single();

    if (teamError || !teamData) {
        console.error(`Error finding team ${teamName}:`, teamError?.message);
        return null;
    }

    // 2. Get Last N Matches
    const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .or(`home_team_id.eq.${teamData.team_id},away_team_id.eq.${teamData.team_id}`)
        .in('status', ['FT', 'AET', 'PEN']) // Completed matches only
        .order('kickoff', { ascending: false })
        .limit(limit);

    if (matchError || !matches) {
        console.error(`Error fetching form for ${teamName}:`, matchError?.message);
        return null;
    }

    return {
        team: teamData.name,
        recent_matches: matches.map(m => {
            const isHome = m.home_team_id === teamData.team_id;
            const opponent = isHome ? m.away_team_name : m.home_team_name;
            const score = isHome ? `${m.home_score}-${m.away_score}` : `${m.away_score}-${m.home_score}`; // Team score first
            const result = isHome
                ? (m.home_score > m.away_score ? 'W' : (m.home_score < m.away_score ? 'L' : 'D'))
                : (m.away_score > m.home_score ? 'W' : (m.away_score < m.home_score ? 'L' : 'D'));

            return {
                date: new Date(m.kickoff).toLocaleDateString(),
                opponent: opponent,
                score: score,
                result: result,
                competition: "Premier League" // Assuming all matches in DB are PL for now
            };
        })
    };
}

// Cluster B: The Analyst (Head-to-Head)
export async function getHeadToHead(teamA: string, teamB: string, limit: number = 5) {
    // 1. Fetch matches where Team A played Team B
    // Using v_match_history makes this incredibly simple.
    const { data: matches, error } = await supabase
        .from('v_match_history')
        .select('*')
        .ilike('team_name', `%${teamA}%`)
        .ilike('opponent_name', `%${teamB}%`)
        .order('kickoff', { ascending: false })
        .limit(limit);

    if (error || !matches || matches.length === 0) {
        console.error(`Error fetching H2H for ${teamA} vs ${teamB}:`, error?.message);
        return null;
    }

    const teamAName = matches[0].team_name;
    const teamBName = matches[0].opponent_name;

    return {
        matchup: `${teamAName} vs ${teamBName}`,
        summary: `Last ${matches.length} meetings`,
        history: matches.map(m => ({
            date: new Date(m.kickoff).toLocaleDateString(),
            venue: m.venue,
            score: `${m.team_score}-${m.opponent_score}`,
            winner: m.result === 'W' ? teamAName : (m.result === 'L' ? teamBName : 'Draw')
        }))
    };
}
