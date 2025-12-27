-- Leaderboard Engine: v_season_leaderboard
DROP VIEW IF EXISTS v_season_leaderboard;

CREATE VIEW v_season_leaderboard AS
SELECT 
    player_name,
    team_name,
    count(*) as games_played,
    sum(goals) as goals,
    sum(assists) as assists,
    sum(shots) as shots,
    sum(key_passes) as key_passes,
    TRUNC(avg(NULLIF(rating, 'N/A')::numeric), 2) as rating
FROM v_player_stats_cleaned
GROUP BY player_name, team_name
ORDER BY goals DESC; -- Default order
