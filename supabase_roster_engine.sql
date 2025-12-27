-- Roster Engine View: v_player_stats_cleaned
-- Flattens the usage of JSON in match_player_stats for easier querying.

DROP VIEW IF EXISTS v_player_stats_cleaned;

CREATE VIEW v_player_stats_cleaned AS
SELECT
    mps.player_id,
    mps.player_name,
    mps.team_name,
    m.fixture_id,
    m.kickoff,
    m.home_team_name,
    m.away_team_name,
    -- Match Context (Who was the opponent?)
    CASE 
        WHEN m.home_team_name = mps.team_name THEN m.away_team_name
        ELSE m.home_team_name
    END as opponent,
    
    -- Flattened Stats
    COALESCE((mps.stats->'games'->>'minutes')::integer, 0) as minutes,
    COALESCE((mps.stats->'games'->>'rating')::text, 'N/A') as rating,
    COALESCE((mps.stats->'goals'->>'total')::integer, 0) as goals,
    COALESCE((mps.stats->'goals'->>'assists')::integer, 0) as assists,
    COALESCE((mps.stats->'shots'->>'total')::integer, 0) as shots,
    COALESCE((mps.stats->'passes'->>'key')::integer, 0) as key_passes

FROM match_player_stats mps
JOIN matches m ON mps.fixture_id = m.fixture_id
WHERE m.season = 2025 
  AND m.status IN ('FT', 'AET', 'PEN'); -- Completed matches only
