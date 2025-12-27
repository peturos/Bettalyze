-- Justice Engine View: v_performance_metrics
-- Calculates xG vs Actual Goals performance for the current season (2025).
-- High 'xg_diff' (positive) means the team is "Unlucky" (Underperforming).
-- Low 'xg_diff' (negative) means the team is "Lucky" (Overperforming).

CREATE OR REPLACE VIEW v_performance_metrics AS
SELECT 
    t.team_id,
    t.team_name,
    count(m.fixture_id) as matches_played,
    -- Summing up the stats
    sum((t.stats->>'expected_goals')::numeric) as total_xg,
    sum(CASE 
        WHEN m.home_team_id = t.team_id THEN m.goals_home 
        ELSE m.goals_away 
    END) as total_goals,
    -- Points calculation
    sum(CASE 
        WHEN m.home_team_id = t.team_id AND m.goals_home > m.goals_away THEN 3
        WHEN m.away_team_id = t.team_id AND m.goals_away > m.goals_home THEN 3
        WHEN m.goals_home = m.goals_away THEN 1
        ELSE 0
    END) as actual_points,
    -- The Main Anomaly Metric
    (sum((t.stats->>'expected_goals')::numeric) - sum(CASE 
        WHEN m.home_team_id = t.team_id THEN m.goals_home 
        ELSE m.goals_away 
    END)) as xg_diff
FROM match_team_stats t
JOIN matches m ON t.fixture_id = m.fixture_id
WHERE m.season = 2025 -- Hardcoded to current season context
GROUP BY t.team_id, t.team_name
ORDER BY xg_diff DESC;
