
-- TABLE: public.entities
CREATE TABLE entities (
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  canonical_name text NOT NULL,
  meta jsonb NOT NULL
);

-- TABLE: public.entity_aliases
CREATE TABLE entity_aliases (
  entity_type text NOT NULL,
  alias text NOT NULL,
  entity_id text NOT NULL,
  confidence numeric NOT NULL,
  source text NOT NULL
);

-- TABLE: public.entity_types
CREATE TABLE entity_types (
  entity_type text NOT NULL
);

-- TABLE: public.ingestion_jobs
CREATE TABLE ingestion_jobs (
  id uuid NOT NULL,
  job_key text NOT NULL,
  job_type text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL,
  attempts integer NOT NULL,
  last_error text,
  run_after timestamp with time zone NOT NULL,
  locked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL
);

-- TABLE: public.match_events
CREATE TABLE match_events (
  event_id text NOT NULL,
  fixture_id bigint NOT NULL,
  event_idx integer NOT NULL,
  team_id bigint,
  team_name text,
  player_id bigint,
  player_name text,
  assist_id bigint,
  assist_name text,
  type text NOT NULL,
  detail text,
  comments text,
  minute integer NOT NULL,
  extra integer
);

-- TABLE: public.match_lineups
CREATE TABLE match_lineups (
  id uuid NOT NULL,
  fixture_id bigint NOT NULL,
  team_id bigint NOT NULL,
  team_name text NOT NULL,
  formation text,
  coach_name text,
  start_xi jsonb NOT NULL,
  substitutes jsonb NOT NULL
);

-- TABLE: public.match_player_stats
CREATE TABLE match_player_stats (
  id uuid NOT NULL,
  fixture_id bigint NOT NULL,
  team_id bigint NOT NULL,
  team_name text NOT NULL,
  player_id bigint NOT NULL,
  player_name text NOT NULL,
  stats jsonb NOT NULL
);

-- TABLE: public.match_players
CREATE TABLE match_players (
  id uuid NOT NULL,
  fixture_id bigint NOT NULL,
  team_id bigint NOT NULL,
  player_id bigint NOT NULL,
  player_name text NOT NULL,
  started boolean NOT NULL,
  position text,
  minutes_played integer,
  entered_minute integer,
  left_minute integer
);

-- TABLE: public.match_team_stats
CREATE TABLE match_team_stats (
  id uuid NOT NULL,
  fixture_id bigint NOT NULL,
  team_id bigint NOT NULL,
  team_name text NOT NULL,
  stats jsonb NOT NULL
);

-- TABLE: public.matches
CREATE TABLE matches (
  fixture_id bigint NOT NULL,
  league_id integer NOT NULL,
  season integer NOT NULL,
  kickoff timestamp with time zone NOT NULL,
  status text NOT NULL,
  home_team_id bigint NOT NULL,
  away_team_id bigint NOT NULL,
  home_team_name text NOT NULL,
  away_team_name text NOT NULL,
  venue_name text,
  venue_city text,
  referee text,
  goals_home integer,
  goals_away integer,
  ht_goals_home integer,
  ht_goals_away integer,
  ft_goals_home integer,
  ft_goals_away integer,
  has_events boolean,
  has_lineups boolean,
  has_team_stats boolean,
  has_player_stats boolean,
  has_odds boolean,
  last_ingested_at timestamp with time zone NOT NULL
);

-- TABLE: public.odds_markets
CREATE TABLE odds_markets (
  id uuid NOT NULL,
  fixture_id bigint NOT NULL,
  bookmaker text NOT NULL,
  market text NOT NULL,
  line text NOT NULL,
  outcome text NOT NULL,
  odds numeric NOT NULL,
  implied_prob numeric,
  snapshot_type text NOT NULL,
  recorded_at timestamp with time zone NOT NULL
);

-- TABLE: public.odds_snapshots_raw
CREATE TABLE odds_snapshots_raw (
  fixture_id bigint NOT NULL,
  snapshot_type text NOT NULL,
  json jsonb NOT NULL,
  fetched_at timestamp with time zone NOT NULL
);

-- TABLE: public.raw_api_football
CREATE TABLE raw_api_football (
  id bigint NOT NULL,
  job_key text NOT NULL,
  endpoint text NOT NULL,
  league_id integer,
  season integer,
  fixture_id bigint,
  json jsonb NOT NULL,
  fetched_at timestamp with time zone NOT NULL,
  expires_at timestamp with time zone NOT NULL
);

-- TABLE: public.standings_raw
CREATE TABLE standings_raw (
  id uuid NOT NULL,
  league_id integer NOT NULL,
  season integer NOT NULL,
  json jsonb NOT NULL,
  fetched_at timestamp with time zone NOT NULL
);

-- VIEW: public.v_00_ht_chaos
CREATE VIEW v_00_ht_chaos AS
  -- Columns:
  --   fixture_id bigint
  --   kickoff timestamp with time zone
  --   home_team_name text
  --   away_team_name text
  --   ht_goals_home integer
  --   ht_goals_away integer
  --   total_goals integer

-- VIEW: public.v_bad_beats
CREATE VIEW v_bad_beats AS
  -- Columns:
  --   fixture_id bigint
  --   kickoff timestamp with time zone
  --   season integer
  --   team_id bigint
  --   team_name text
  --   ha text
  --   goals_for integer
  --   goals_against integer
  --   points integer
  --   xg_for numeric
  --   xg_against numeric
  --   xg_diff numeric

-- VIEW: public.v_best_odds
CREATE VIEW v_best_odds AS
  -- Columns:
  --   fixture_id bigint
  --   snapshot_type text
  --   market text
  --   line text
  --   outcome text
  --   best_odds numeric
  --   best_bookmaker text
  --   recorded_at timestamp with time zone

-- VIEW: public.v_big_implied_shifts
CREATE VIEW v_big_implied_shifts AS
  -- Columns:
  --   fixture_id bigint
  --   market text
  --   line text
  --   outcome text
  --   opening_best numeric
  --   closing_best numeric
  --   delta_odds numeric
  --   open_implied numeric
  --   close_implied numeric
  --   delta_implied numeric
  --   bet_won boolean

-- VIEW: public.v_btts_profile
CREATE VIEW v_btts_profile AS
  -- Columns:
  --   team_id bigint
  --   team_name text
  --   matches bigint
  --   btts_yes_rate numeric
  --   avg_xg_for numeric
  --   avg_xg_against numeric

-- VIEW: public.v_card_events
CREATE VIEW v_card_events AS
  -- Columns:
  --   fixture_id bigint
  --   team_id bigint
  --   team_name text
  --   player_id bigint
  --   player_name text
  --   detail text
  --   minute integer
  --   extra integer
  --   minute_abs integer
  --   card_color text

-- VIEW: public.v_fixture_heat_index
CREATE VIEW v_fixture_heat_index AS
  -- Columns:
  --   team_a_id bigint
  --   team_a_name text
  --   team_b_id bigint
  --   team_b_name text
  --   meetings bigint
  --   avg_cards numeric
  --   avg_fouls numeric

-- VIEW: public.v_fixture_market_prices
CREATE VIEW v_fixture_market_prices AS
  -- Columns:
  --   fixture_id bigint
  --   snapshot_type text
  --   market text
  --   line text
  --   outcome text
  --   best_odds numeric
  --   avg_odds numeric
  --   best_implied numeric

-- VIEW: public.v_fixture_odds_coverage
CREATE VIEW v_fixture_odds_coverage AS
  -- Columns:
  --   fixture_id bigint
  --   season integer
  --   kickoff timestamp with time zone
  --   home_team_name text
  --   away_team_name text
  --   has_any_odds boolean
  --   rows_1x2 bigint
  --   rows_ou bigint
  --   rows_btts bigint

-- VIEW: public.v_fixture_result
CREATE VIEW v_fixture_result AS
  -- Columns:
  --   fixture_id bigint
  --   league_id integer
  --   season integer
  --   kickoff timestamp with time zone
  --   status text
  --   home_team_id bigint
  --   away_team_id bigint
  --   home_team_name text
  --   away_team_name text
  --   referee text
  --   goals_home integer
  --   goals_away integer
  --   ht_goals_home integer
  --   ht_goals_away integer
  --   total_goals integer
  --   result_1x2 text
  --   btts_yes boolean

-- VIEW: public.v_fmd_games
CREATE VIEW v_fmd_games AS
  -- Columns:
  --   fixture_id bigint
  --   kickoff timestamp with time zone
  --   team_id bigint
  --   team_name text
  --   possession_pct numeric
  --   points integer
  --   xg_diff numeric
  --   goals_for integer
  --   goals_against integer

-- VIEW: public.v_goal_events
CREATE VIEW v_goal_events AS
  -- Columns:
  --   fixture_id bigint
  --   team_id bigint
  --   team_name text
  --   player_id bigint
  --   player_name text
  --   detail text
  --   minute integer
  --   extra integer
  --   minute_abs integer

-- VIEW: public.v_goal_minute_bands
CREATE VIEW v_goal_minute_bands AS
  -- Columns:
  --   minute_band text
  --   goals bigint

-- VIEW: public.v_goals_after_red_15m
CREATE VIEW v_goals_after_red_15m AS
  -- Columns:
  --   fixture_id bigint
  --   carded_team_id bigint
  --   carded_team_name text
  --   first_red_minute integer
  --   goals_next_15_total bigint

-- VIEW: public.v_market_steam
CREATE VIEW v_market_steam AS
  -- Columns:
  --   fixture_id bigint
  --   season integer
  --   home_team text
  --   away_team text
  --   kickoff timestamp with time zone
  --   bookmaker text
  --   selection text
  --   open_price numeric
  --   close_price numeric
  --   steam_percentage numeric
  --   prob_shift_percentage numeric

-- VIEW: public.v_match_has_odds_truth
CREATE VIEW v_match_has_odds_truth AS
  -- Columns:
  --   fixture_id bigint
  --   has_odds_truth boolean

-- VIEW: public.v_match_history
CREATE VIEW v_match_history AS
  -- Columns:
  --   fixture_id bigint
  --   kickoff timestamp with time zone
  --   season integer
  --   status text
  --   team_id bigint
  --   team_name text
  --   opponent_id bigint
  --   opponent_name text
  --   venue text
  --   team_score integer
  --   opponent_score integer
  --   result text

-- VIEW: public.v_match_totals_xg
CREATE VIEW v_match_totals_xg AS
  -- Columns:
  --   fixture_id bigint
  --   kickoff timestamp with time zone
  --   season integer
  --   home_team_name text
  --   away_team_name text
  --   total_goals integer
  --   combined_xg numeric

-- VIEW: public.v_odds_movement
CREATE VIEW v_odds_movement AS
  -- Columns:
  --   fixture_id bigint
  --   market text
  --   line text
  --   outcome text
  --   opening_best numeric
  --   closing_best numeric
  --   delta_odds numeric
  --   open_implied numeric
  --   close_implied numeric
  --   delta_implied numeric

-- VIEW: public.v_odds_movement_with_result
CREATE VIEW v_odds_movement_with_result AS
  -- Columns:
  --   fixture_id bigint
  --   market text
  --   line text
  --   outcome text
  --   opening_best numeric
  --   closing_best numeric
  --   delta_odds numeric
  --   open_implied numeric
  --   close_implied numeric
  --   delta_implied numeric
  --   bet_won boolean

-- VIEW: public.v_ou_reality_check
CREATE VIEW v_ou_reality_check AS
  -- Columns:
  --   fixture_id bigint
  --   kickoff timestamp with time zone
  --   season integer
  --   home_team_name text
  --   away_team_name text
  --   total_goals integer
  --   combined_xg numeric
  --   note text

-- VIEW: public.v_overround_1x2
CREATE VIEW v_overround_1x2 AS
  -- Columns:
  --   fixture_id bigint
  --   snapshot_type text
  --   sum_implied_best numeric
  --   overround_best numeric

-- VIEW: public.v_performance_metrics
CREATE VIEW v_performance_metrics AS
  -- Columns:
  --   team_id bigint
  --   team_name text
  --   matches_played bigint
  --   xg_for numeric
  --   goals_for bigint
  --   offensive_luck numeric
  --   xg_against numeric
  --   goals_against bigint
  --   defensive_luck numeric
  --   total_luck_score numeric

-- VIEW: public.v_player_start_impact
CREATE VIEW v_player_start_impact AS
  -- Columns:
  --   player_id bigint
  --   player_name text
  --   team_id bigint
  --   team_name text
  --   started boolean
  --   matches bigint
  --   avg_points numeric
  --   avg_goals_for numeric
  --   avg_goals_against numeric
  --   avg_xg_for numeric
  --   avg_xg_against numeric

-- VIEW: public.v_player_stats_cleaned
CREATE VIEW v_player_stats_cleaned AS
  -- Columns:
  --   player_id bigint
  --   player_name text
  --   team_name text
  --   fixture_id bigint
  --   kickoff timestamp with time zone
  --   home_team_name text
  --   away_team_name text
  --   opponent text
  --   minutes integer
  --   rating text
  --   goals integer
  --   assists integer
  --   shots integer
  --   key_passes integer

-- VIEW: public.v_red_card_outcomes
CREATE VIEW v_red_card_outcomes AS
  -- Columns:
  --   fixture_id bigint
  --   team_id bigint
  --   team_name text
  --   first_red_minute integer
  --   final_points integer

-- VIEW: public.v_red_cards
CREATE VIEW v_red_cards AS
  -- Columns:
  --   fixture_id bigint
  --   team_id bigint
  --   team_name text
  --   first_red_minute integer

-- VIEW: public.v_referee_chaos
CREATE VIEW v_referee_chaos AS
  -- Columns:
  --   referee text
  --   matches bigint
  --   avg_cards numeric
  --   avg_yellows numeric
  --   avg_reds numeric
  --   avg_penalty_goals numeric

-- VIEW: public.v_second_half_fc
CREATE VIEW v_second_half_fc AS
  -- Columns:
  --   team_id bigint
  --   team_name text
  --   matches bigint
  --   goals_scored_60_plus numeric
  --   goals_conceded_60_plus numeric
  --   goals_scored_75_plus numeric
  --   goals_conceded_75_plus numeric

-- VIEW: public.v_settlement_any_market
CREATE VIEW v_settlement_any_market AS
  -- Columns:
  --   fixture_id bigint
  --   result_1x2 text
  --   btts_yes boolean
  --   total_goals integer

-- VIEW: public.v_team_formation_performance
CREATE VIEW v_team_formation_performance AS
  -- Columns:
  --   team_id bigint
  --   team_name text
  --   formation text
  --   matches bigint
  --   avg_points numeric
  --   avg_goals_for numeric
  --   avg_goals_against numeric
  --   avg_xg_for numeric
  --   matches_vs_back3 bigint
  --   avg_points_vs_back3 numeric
  --   avg_xg_for_vs_back3 numeric

-- VIEW: public.v_team_goal_windows
CREATE VIEW v_team_goal_windows AS
  -- Columns:
  --   team_id bigint
  --   team_name text
  --   matches bigint
  --   goals_81_99 bigint
  --   goals_81_99_per_match numeric

-- VIEW: public.v_team_match
CREATE VIEW v_team_match AS
  -- Columns:
  --   fixture_id bigint
  --   league_id integer
  --   season integer
  --   kickoff timestamp with time zone
  --   status text
  --   team_id bigint
  --   team_name text
  --   ha text
  --   goals_for integer
  --   goals_against integer
  --   points integer
  --   xg_for numeric
  --   xg_against numeric
  --   xg_diff numeric
  --   possession_pct numeric
  --   fouls numeric
  --   yellow_cards numeric
  --   red_cards numeric
  --   shots_total numeric
  --   shots_on_goal numeric

-- VIEW: public.v_team_score_first_profile
CREATE VIEW v_team_score_first_profile AS
  -- Columns:
  --   team_id bigint
  --   team_name text
  --   matches_total bigint
  --   matches_scored_first bigint
  --   matches_conceded_first bigint
  --   matches_0_0_or_no_goal bigint
  --   avg_points_when_score_first numeric
  --   avg_points_when_concede_first numeric
  --   scored_first_rate_pct numeric

-- VIEW: public.v_team_style_profile
CREATE VIEW v_team_style_profile AS
  -- Columns:
  --   team_id bigint
  --   team_name text
  --   matches bigint
  --   avg_possession numeric
  --   avg_xg_for numeric
  --   avg_goals_for numeric
  --   style_tag text

-- VIEW: public.v_teams_normalized
CREATE VIEW v_teams_normalized AS
  -- Columns:
  --   team_id bigint
  --   name text
  --   code text
  --   logo text
  --   venue_name text

-- TABLE: public.view_column_registry
CREATE TABLE view_column_registry (
  view_name text NOT NULL,
  column_name text NOT NULL,
  data_type text NOT NULL,
  meaning text NOT NULL,
  synonyms ARRAY NOT NULL
);

-- TABLE: public.view_registry
CREATE TABLE view_registry (
  view_name text NOT NULL,
  purpose text NOT NULL,
  primary_entities ARRAY NOT NULL,
  example_questions ARRAY NOT NULL
);
