export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            matches: {
                Row: {
                    fixture_id: number
                    league_id: number
                    season: number
                    kickoff: string
                    status: string
                    home_team_id: number
                    away_team_id: number
                    home_team_name: string
                    away_team_name: string
                    venue_name: string | null
                    venue_city: string | null
                    referee: string | null
                    goals_home: number | null
                    goals_away: number | null
                    ht_goals_home: number | null
                    ht_goals_away: number | null
                    ft_goals_home: number | null
                    ft_goals_away: number | null
                    has_events: boolean | null
                    has_lineups: boolean | null
                    has_team_stats: boolean | null
                    has_player_stats: boolean | null
                    has_odds: boolean | null
                    last_ingested_at: string
                }
                Insert: {
                    fixture_id: number
                    league_id: number
                    season: number
                    kickoff: string
                    status: string
                    home_team_id: number
                    away_team_id: number
                    home_team_name: string
                    away_team_name: string
                    venue_name?: string | null
                    venue_city?: string | null
                    referee?: string | null
                    goals_home?: number | null
                    goals_away?: number | null
                    ht_goals_home?: number | null
                    ht_goals_away?: number | null
                    ft_goals_home?: number | null
                    ft_goals_away?: number | null
                    has_events?: boolean | null
                    has_lineups?: boolean | null
                    has_team_stats?: boolean | null
                    has_player_stats?: boolean | null
                    has_odds?: boolean | null
                    last_ingested_at: string
                }
                Update: Partial<Database['public']['Tables']['matches']['Insert']>
            }
            match_events: {
                Row: {
                    event_id: string
                    fixture_id: number
                    event_idx: number
                    team_id: number | null
                    team_name: string | null
                    player_id: number | null
                    player_name: string | null
                    assist_id: number | null
                    assist_name: string | null
                    type: string
                    detail: string | null
                    comments: string | null
                    minute: number
                    extra: number | null
                }
                Insert: {
                    event_id: string
                    fixture_id: number
                    event_idx: number
                    team_id?: number | null
                    team_name?: string | null
                    player_id?: number | null
                    player_name?: string | null
                    assist_id?: number | null
                    assist_name?: string | null
                    type: string
                    detail?: string | null
                    comments?: string | null
                    minute: number
                    extra?: number | null
                }
                Update: Partial<Database['public']['Tables']['match_events']['Insert']>
            }
            match_lineups: {
                Row: {
                    id: string
                    fixture_id: number
                    team_id: number
                    team_name: string
                    formation: string | null
                    coach_name: string | null
                    start_xi: Json
                    substitutes: Json
                }
                Insert: {
                    id?: string
                    fixture_id: number
                    team_id: number
                    team_name: string
                    formation?: string | null
                    coach_name?: string | null
                    start_xi: Json
                    substitutes: Json
                }
                Update: Partial<Database['public']['Tables']['match_lineups']['Insert']>
            }
            match_player_stats: {
                Row: {
                    id: string
                    fixture_id: number
                    team_id: number
                    team_name: string
                    player_id: number
                    player_name: string
                    stats: Json
                }
                Insert: {
                    id?: string
                    fixture_id: number
                    team_id: number
                    team_name: string
                    player_id: number
                    player_name: string
                    stats: Json
                }
                Update: Partial<Database['public']['Tables']['match_player_stats']['Insert']>
            }
            match_players: {
                Row: {
                    id: string
                    fixture_id: number
                    team_id: number
                    player_id: number
                    player_name: string
                    started: boolean
                    position: string | null
                    minutes_played: number | null
                    entered_minute: number | null
                    left_minute: number | null
                }
                Insert: {
                    id?: string
                    fixture_id: number
                    team_id: number
                    player_id: number
                    player_name: string
                    started: boolean
                    position?: string | null
                    minutes_played?: number | null
                    entered_minute?: number | null
                    left_minute?: number | null
                }
                Update: Partial<Database['public']['Tables']['match_players']['Insert']>
            }
            match_team_stats: {
                Row: {
                    id: string
                    fixture_id: number
                    team_id: number
                    team_name: string
                    stats: Json
                }
                Insert: {
                    id?: string
                    fixture_id: number
                    team_id: number
                    team_name: string
                    stats: Json
                }
                Update: Partial<Database['public']['Tables']['match_team_stats']['Insert']>
            }
            odds_markets: {
                Row: {
                    id: string
                    fixture_id: number
                    bookmaker: string
                    market: string
                    line: string
                    outcome: string
                    odds: number
                    implied_prob: number | null
                    snapshot_type: string
                    recorded_at: string
                }
                Insert: {
                    id?: string
                    fixture_id: number
                    bookmaker: string
                    market: string
                    line: string
                    outcome: string
                    odds: number
                    implied_prob?: number | null
                    snapshot_type: string
                    recorded_at: string
                }
                Update: Partial<Database['public']['Tables']['odds_markets']['Insert']>
            }
            standings_raw: {
                Row: {
                    id: string
                    league_id: number
                    season: number
                    json: Json
                    fetched_at: string
                }
                Insert: {
                    id?: string
                    league_id: number
                    season: number
                    json: Json
                    fetched_at: string
                }
                Update: Partial<Database['public']['Tables']['standings_raw']['Insert']>
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
