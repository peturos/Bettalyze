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
      teams: {
        Row: {
          id: number
          name: string
          logo: string | null
          founded: number | null
          venue_name: string | null
          venue_city: string | null
        }
        Insert: {
          id: number
          name: string
          logo?: string | null
          founded?: number | null
          venue_name?: string | null
          venue_city?: string | null
        }
        Update: {
          id?: number
          name?: string
          logo?: string | null
          founded?: number | null
          venue_name?: string | null
          venue_city?: string | null
        }
      }
      fixtures: {
        Row: {
          id: number
          date: string
          status: string
          home_team_id: number | null
          away_team_id: number | null
          home_goals: number | null
          away_goals: number | null
          venue_name: string | null
          referee: string | null
        }
        Insert: {
          id: number
          date: string
          status: string
          home_team_id?: number | null
          away_team_id?: number | null
          home_goals?: number | null
          away_goals?: number | null
          venue_name?: string | null
          referee?: string | null
        }
        Update: {
          id?: number
          date?: string
          status?: string
          home_team_id?: number | null
          away_team_id?: number | null
          home_goals?: number | null
          away_goals?: number | null
          venue_name?: string | null
          referee?: string | null
        }
      }
      odds: {
        Row: {
          id: string
          fixture_id: number | null
          bookmaker_id: number | null
          bookmaker_name: string | null
          market_id: number | null
          market_name: string | null
          value: string | null
          odd: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          fixture_id?: number | null
          bookmaker_id?: number | null
          bookmaker_name?: string | null
          market_id?: number | null
          market_name?: string | null
          value?: string | null
          odd?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          fixture_id?: number | null
          bookmaker_id?: number | null
          bookmaker_name?: string | null
          market_id?: number | null
          market_name?: string | null
          value?: string | null
          odd?: number | null
          updated_at?: string | null
        }
      }
    }
  }
}
