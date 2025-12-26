import { supabaseAdmin as supabase } from './supabase';
import { Database } from '@/types/database';

export type Match = Database['public']['Tables']['matches']['Row'];

export async function getTeams() {
    // Fetch distinct home teams from matches to build our teams list
    const { data: homeTeams, error } = await supabase
        .from('matches')
        .select('home_team_id, home_team_name, season')
        .order('home_team_name');

    if (error) {
        console.error('Error fetching teams:', error);
        return [];
    }

    // Deduplicate by ID
    const uniqueTeams = new Map();
    homeTeams?.forEach(match => {
        if (!uniqueTeams.has(match.home_team_id)) {
            uniqueTeams.set(match.home_team_id, {
                id: match.home_team_id,
                name: match.home_team_name,
                season: match.season
            });
        }
    });

    return Array.from(uniqueTeams.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPlayers() {
    const { data, error } = await supabase
        .from('match_players')
        .select('player_id, player_name, team_name, minutes_played, started')
        .limit(100);

    if (error) {
        console.error('Error fetching players:', error);
        return [];
    }
    return data;
}

export async function getUpcomingFixtures() {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'NS') // Not Started
        .order('kickoff', { ascending: true })
        .limit(20);

    if (error) {
        console.error('Error fetching fixtures:', error);
        return [];
    }

    return data;
}

export async function getStandings(leagueId: number = 39, season: number = 2025) {
    // Fetch from our local standings_raw table
    const { data, error } = await supabase
        .from('standings_raw')
        .select('json')
        .eq('league_id', leagueId)
        .eq('season', season)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching standings from DB:', error);
        return null;
    }

    // The 'json' column stores the array directly: [ { league: ... } ]
    // So we just return the first item's league data
    if (Array.isArray(data?.json) && data.json.length > 0) {
        return {
            response: [
                data.json[0]
            ]
        };
    }

    return { response: [] };
}

export async function getTopScorers() {
    // Count goals from match_events
    const { data, error } = await supabase
        .from('match_events')
        .select('player_id, player_name, team_name, type, detail')
        .eq('type', 'Goal');

    if (error) {
        console.error('Error fetching scorers:', error);
        return [];
    }

    const scorers = new Map<number, { id: number; name: string; team: string; goals: number }>();

    data?.forEach((event: any) => {
        if (event.detail === 'Own Goal') return;
        if (!event.player_id || !event.player_name) return;

        const current = scorers.get(event.player_id) || {
            id: event.player_id,
            name: event.player_name,
            team: event.team_name || 'Unknown',
            goals: 0
        };
        current.goals++;
        scorers.set(event.player_id, current);
    });

    return Array.from(scorers.values())
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 20); // Top 20
}
