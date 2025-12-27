
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
        // Return raw object array for the LLM to analyze
        recent_form: data.map(row => ({
            date: new Date(row.kickoff).toLocaleDateString(),
            opponent: row.opponent,
            minutes: row.minutes,
            goals: row.goals,
            assists: row.assists,
            rating: row.rating,
            shots: row.shots,
            key_passes: row.key_passes
        }))
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
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        console.log(`[Mock Search] Searching for: ${query} (No API Key)`);
        return {
            system_note: "Bettalyze_Search_Agent: Service Not Configured.",
            guidance: "The user is asking for live web information, but no search provider (e.g. Tavily) is currently connected to the API Key. Please Explain to the user that Wizardinho currently runs on the OpenAI API alone, which does not have built-in browsing capabilities like ChatGPT. You can only answer questions based on the static database (Stats, Odds, Rosters)."
        };
    }

    try {
        console.log(`[Tavily Search] Searching for: ${query}`);
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: "basic",
                include_answer: true,
                max_results: 5
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return {
            results: data.results.map((r: any) => ({
                title: r.title,
                url: r.url,
                content: r.content
            })),
            answer: data.answer
        };

    } catch (error: any) {
        console.error("Search Error:", error);
        return {
            system_note: "Search Provider Error",
            error: error.message
        };
    }
}

// Cluster B: The Analyst (Head-to-Head & Form)
// Cluster B: The Analyst (Head-to-Head & Form)
export async function getTeamForm(teamName: string, limit: number = 5) {
    // Use v_match_history (Normalized View) to find matches directly
    const { data: matches, error } = await supabase
        .from('v_match_history')
        .select('*')
        .ilike('team_name', `%${teamName}%`)
        .order('kickoff', { ascending: false })
        .limit(limit);

    if (error || !matches || matches.length === 0) {
        console.error(`Error fetching form for ${teamName}:`, error?.message);
        return null;
    }

    const matchedTeamName = matches[0].team_name;

    return {
        team: matchedTeamName,
        recent_matches: matches.map(m => ({
            date: new Date(m.kickoff).toLocaleDateString(),
            opponent: m.opponent_name,
            score: `${m.team_score}-${m.opponent_score}`,
            result: m.result,
            competition: "Premier League"
        }))
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
// Cluster G: The Intelligence Engine (Deep Analysis tools)

export async function comparePlayers(playerA: string, playerB: string) {
    // Helper to fetch and normalize
    const getStats = async (name: string) => {
        const briefed = await getPlayerBriefing(name, 100); // Get last 100 games (basically season)
        if (!briefed) return null;

        const minutes = briefed.recent_form.reduce((sum, r) => sum + r.minutes, 0);
        const p90_factor = minutes / 90;

        return {
            name: briefed.name,
            team: briefed.team,
            minutes,
            goals: briefed.total_goals,
            assists: briefed.total_assists,
            goals_p90: (briefed.total_goals / p90_factor).toFixed(2),
            assists_p90: (briefed.total_assists / p90_factor).toFixed(2),
            shots_p90: (briefed.recent_form.reduce((s, r) => s + r.shots, 0) / p90_factor).toFixed(2),
            key_passes_p90: (briefed.recent_form.reduce((s, r) => s + r.key_passes, 0) / p90_factor).toFixed(2),
            avg_rating: briefed.avg_rating
        };
    };

    const [statsA, statsB] = await Promise.all([getStats(playerA), getStats(playerB)]);

    if (!statsA || !statsB) return null;

    return {
        comparison_title: `${statsA.name} vs ${statsB.name}`,
        player_a: statsA,
        player_b: statsB,
        verdict: Number(statsA.avg_rating) > Number(statsB.avg_rating) ? `${statsA.name} has the higher average rating.` : `${statsB.name} has the higher average rating.`
    };
}

export async function getTrendSpotter(type: 'teams' | 'players') {
    if (type === 'teams') {
        const { data, error } = await supabase
            .from('v_team_trends')
            .select('*')
            .limit(10);

        if (error) {
            console.error("Trend Error:", error);
            return [];
        }
        return data;
    } else {
        const { data, error } = await supabase
            .from('v_player_recent_form')
            .select('*')
            .limit(10);

        if (error) {
            console.error("Trend Error:", error);
            return [];
        }
        return data;
    }
}

export async function analyzeMatchup(homeTeam: string, awayTeam: string) {
    // 1. Parallel Fetch of all data points
    const [h2h, homeForm, awayForm, justice] = await Promise.all([
        getHeadToHead(homeTeam, awayTeam),
        getTeamForm(homeTeam),
        getTeamForm(awayTeam),
        getJusticeMetrics('unlucky', 20) // Get everyone to check status
    ]);

    // 2. Extract Luck Status
    const findLuck = (team: string) => {
        const t = justice.find((j: any) => j.team.includes(team));
        return t ? `${t.verdict} (Luck Score: ${t.Luck_Score})` : "performance matches expected metrics";
    };

    return {
        matchup: `${homeTeam} vs ${awayTeam}`,
        analysis_components: {
            head_to_head_summary: h2h?.summary || "No recent history",
            home_team: {
                name: homeTeam,
                recent_form: homeForm?.recent_matches?.map(m => m.result).join('-') || 'N/A',
                justice_status: findLuck(homeTeam)
            },
            away_team: {
                name: awayTeam,
                recent_form: awayForm?.recent_matches?.map(m => m.result).join('-') || 'N/A',
                justice_status: findLuck(awayTeam)
            }
        },
        ai_guidance: "Synthesize this into a preview. Weigh current form vs historical H2H. Note if any team is 'Unlucky' as they might be due a positive regression."
    };
}

// Cluster H: The Strategist (Tactics & Betting)

export async function getPlayerVsTeam(playerName: string, opponentTeam: string) {
    // 1. Fetch matches where player faced this opponent
    const { data, error } = await supabase
        .from('v_player_stats_cleaned')
        .select('*')
        .ilike('player_name', `%${playerName}%`)
        .ilike('opponent', `%${opponentTeam}%`)
        .order('kickoff', { ascending: false });

    if (error || !data || data.length === 0) {
        console.log(`No history found for ${playerName} vs ${opponentTeam}`);
        return null;
    }

    // 2. Aggregate Stats
    const totalGoals = data.reduce((sum, row) => sum + row.goals, 0);
    const totalAssists = data.reduce((sum, row) => sum + row.assists, 0);
    const ratings = data.filter(r => r.rating !== 'N/A').map(r => Number(r.rating));
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : 'N/A';

    return {
        summary: `History: ${playerName} vs ${opponentTeam}`,
        matches_played: data.length,
        total_goals: totalGoals,
        total_assists: totalAssists,
        avg_rating: avgRating,
        history: data.map(m => ({
            date: new Date(m.kickoff).toLocaleDateString(),
            result: `${m.home_team_name === m.team_name ? 'Home' : 'Away'} vs ${m.opponent}`,
            stats: `${m.goals}G, ${m.assists}A, Rating: ${m.rating}`
        }))
    };
}

export async function getLeagueLeaders(stat: 'goals' | 'assists' | 'rating' | 'shots' | 'key_passes', limit: number = 10) {
    const { data, error } = await supabase
        .from('v_season_leaderboard')
        .select('*')
        .order(stat, { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Leaderboard Error:", error);
        return [];
    }

    return data;
}

export async function calculateKelly(winProbabilityPercentage: number, decimalOdds: number, bankroll: number = 1000) {
    const p = winProbabilityPercentage / 100;
    const b = decimalOdds - 1;
    const q = 1 - p;

    const f = (p * b - q) / b;
    const stakePercentage = (f * 100).toFixed(2);
    const stakeAmount = (f * bankroll).toFixed(2);

    return {
        inputs: {
            win_prob: `${winProbabilityPercentage}%`,
            odds: decimalOdds,
            bankroll: `$${bankroll}`
        },
        kelly_fraction: f > 0 ? f.toFixed(4) : 0,
        recommendation: f > 0
            ? `Bet ${stakePercentage}% of bankroll ($${stakeAmount})`
            : "Do not bet (Negative Edge)",
        explanation: "The Kelly Criterion calculates the optimal bet size to maximize long-term growth while avoiding ruin."
    };
}
