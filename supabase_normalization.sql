
-- Normalization Views for Bettalyze
-- These views abstract the underlying table structure to make application code cleaner and less fragile.

-- 1. v_teams_normalized
-- Since the 'teams' table is missing, we derive the master list from the matches table.
-- We combine Home and Away teams and deduplicate.
DROP VIEW IF EXISTS v_teams_normalized;
CREATE VIEW v_teams_normalized AS
WITH distinct_teams AS (
    SELECT home_team_id as team_id, home_team_name as name FROM matches
    UNION
    SELECT away_team_id as team_id, away_team_name as name FROM matches
)
SELECT DISTINCT ON (team_id)
    team_id,
    name,
    NULL as code,  -- Not available in matches
    NULL as logo,  -- Not available in matches
    NULL as venue_name -- Not available in matches
FROM distinct_teams
ORDER BY team_id;

-- 2. v_match_history
-- Normalizes match results so we don't have to code 'goals_home > goals_away' logic in TypeScript every time.
-- Returns TWO rows per match (one for home, one for away) so simple queries work: WHERE team_name = 'Liverpool'
DROP VIEW IF EXISTS v_match_history;
CREATE VIEW v_match_history AS
SELECT 
    m.fixture_id,
    m.kickoff,
    m.season,
    m.status,
    -- Team Context
    m.home_team_id as team_id,
    m.home_team_name as team_name,
    -- Opponent Context
    m.away_team_id as opponent_id,
    m.away_team_name as opponent_name,
    'Home' as venue,
    -- Score
    m.goals_home as team_score,
    m.goals_away as opponent_score,
    -- Result
    CASE 
        WHEN m.goals_home > m.goals_away THEN 'W'
        WHEN m.goals_home < m.goals_away THEN 'L'
        ELSE 'D'
    END as result
FROM matches m
WHERE m.status IN ('FT', 'AET', 'PEN')

UNION ALL

SELECT 
    m.fixture_id,
    m.kickoff,
    m.season,
    m.status,
    -- Team Context
    m.away_team_id as team_id,
    m.away_team_name as team_name,
    -- Opponent Context
    m.home_team_id as opponent_id,
    m.home_team_name as opponent_name,
    'Away' as venue,
    -- Score
    m.goals_away as team_score,
    m.goals_home as opponent_score,
    -- Result
    CASE 
        WHEN m.goals_away > m.goals_home THEN 'W'
        WHEN m.goals_away < m.goals_home THEN 'L'
        ELSE 'D'
    END as result
FROM matches m
WHERE m.status IN ('FT', 'AET', 'PEN');
