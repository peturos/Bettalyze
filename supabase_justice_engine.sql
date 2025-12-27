-- Justice Engine View v2: v_performance_metrics
-- Now includes xGA (Expected Goals Against) and a holistic 'Total Luck Score'.

-- DROP first to avoid "cannot change name of view column" errors
DROP VIEW IF EXISTS v_performance_metrics;

CREATE VIEW v_performance_metrics AS
WITH team_stats AS (
    SELECT
        t.fixture_id,
        t.team_id,
        t.team_name,
        (t.stats->>'expected_goals')::numeric as xg,
        CASE 
            WHEN m.home_team_id = t.team_id THEN m.goals_home 
            ELSE m.goals_away 
        END as goals
    FROM match_team_stats t
    JOIN matches m ON t.fixture_id = m.fixture_id
    WHERE m.season = 2025
)
SELECT
    t1.team_id,
    t1.team_name,
    count(t1.fixture_id) as matches_played,
    
    -- OFFENSE
    sum(t1.xg) as xg_for,
    sum(t1.goals) as goals_for,
    (sum(t1.xg) - sum(t1.goals)) as offensive_luck, -- Positive = Unlucky (Should have scored more)

    -- DEFENSE (Opponent's xG)
    sum(t2.xg) as xg_against,
    sum(t2.goals) as goals_against,
    (sum(t2.goals) - sum(t2.xg)) as defensive_luck, -- Positive = Unlucky (Conceded more than expected)

    -- TOTAL LUCK (High Positive = Very Unlucky, High Negative = Very Lucky)
    ( (sum(t1.xg) - sum(t1.goals)) + (sum(t2.goals) - sum(t2.xg)) ) as total_luck_score

FROM team_stats t1
JOIN team_stats t2 ON t1.fixture_id = t2.fixture_id AND t1.team_id != t2.team_id
GROUP BY t1.team_id, t1.team_name
ORDER BY total_luck_score DESC;
