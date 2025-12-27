-- Trend Engine: Spotting emerging patterns
-- 1. Team Trends: Comparing Last 5 Games xG vs Season Average
DROP VIEW IF EXISTS v_team_trends;

CREATE VIEW v_team_trends AS
WITH last_5_matches AS (
    SELECT
        team_id,
        team_name,
        avg((stats->>'expected_goals')::numeric) as recent_xg_for,
        avg((stats->>'goals')::numeric) as recent_goals_for
    FROM (
        SELECT 
            t.team_id, 
            t.team_name, 
            t.stats,
            ROW_NUMBER() OVER (PARTITION BY t.team_id ORDER BY m.kickoff DESC) as rn
        FROM match_team_stats t
        JOIN matches m ON t.fixture_id = m.fixture_id
        WHERE m.status IN ('FT', 'AET', 'PEN')
    ) recent
    WHERE rn <= 5
    GROUP BY team_id, team_name
),
season_stats AS (
   SELECT
        team_id,
        avg((stats->>'expected_goals')::numeric) as season_xg_for
   FROM match_team_stats t
   JOIN matches m ON t.fixture_id = m.fixture_id
   WHERE m.status IN ('FT', 'AET', 'PEN')
   GROUP BY team_id
)
SELECT 
    l5.team_name,
    TRUNC(l5.recent_xg_for, 2) as recent_xg,
    TRUNC(s.season_xg_for, 2) as season_xg,
    TRUNC(l5.recent_xg_for - s.season_xg_for, 2) as trend_diff,
    CASE 
        WHEN (l5.recent_xg_for - s.season_xg_for) > 0.4 THEN 'Surging'
        WHEN (l5.recent_xg_for - s.season_xg_for) < -0.4 THEN 'Declining'
        ELSE 'Stable'
    END as trend_verdict
FROM last_5_matches l5
JOIN season_stats s ON l5.team_id = s.team_id
ORDER BY trend_diff DESC;

-- 2. Player Hot List: Top Performers in Last 3 Games
DROP VIEW IF EXISTS v_player_recent_form;

CREATE VIEW v_player_recent_form AS
SELECT 
    player_name,
    team_name,
    count(*) as games_played,
    sum(goals) as goals,
    sum(assists) as assists,
    TRUNC(avg(NULLIF(rating, 'N/A')::numeric), 2) as avg_rating
FROM (
    SELECT 
        *,
        ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY kickoff DESC) as rn
    FROM v_player_stats_cleaned
) sub
WHERE rn <= 3
GROUP BY player_name, team_name
HAVING count(*) >= 2 -- Must have played at least 2 of the last 3 games
ORDER BY avg(NULLIF(rating, 'N/A')::numeric) DESC;
