import { supabase } from './supabase';
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
    // We don't have a dedicated players table, so we get them from match_players or top scorers
    // For now, let's fetch from match_players but limit significantly as it's a huge table
    const { data, error } = await supabase
        .from('match_players')
        .select('player_id, player_name, team_name, minutes_played, started')
        .limit(100); // Just a sample for the first version

    if (error) {
        console.error('Error fetching players:', error);
        return [];
    }

    // In a real scenario, we'd want a 'players' table or a view for 'player_stats_season'
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
