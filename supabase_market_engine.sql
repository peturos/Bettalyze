-- Market Engine View: v_market_steam
-- Identifies significant odds movements ("Steam") by comparing Opening vs Closing prices.
-- Fixed: Uses team names directly from 'matches' table (denormalized).

DROP VIEW IF EXISTS v_market_steam;

CREATE VIEW v_market_steam AS
WITH opening_odds AS (
    SELECT 
        fixture_id, bookmaker, market, outcome, odds as open_price, implied_prob as open_prob
    FROM odds_markets
    WHERE snapshot_type = 'opening' AND market = '1X2'
),
closing_odds AS (
    SELECT 
        fixture_id, bookmaker, market, outcome, odds as close_price, implied_prob as close_prob
    FROM odds_markets
    WHERE snapshot_type = 'closing' AND market = '1X2'
)
SELECT 
    m.fixture_id,
    m.season,
    m.home_team_name as home_team,
    m.away_team_name as away_team,
    m.kickoff,
    op.bookmaker,
    op.outcome as selection,
    op.open_price,
    cl.close_price,
    -- Calculate Drop %: (Open - Close) / Open
    -- Positive = Price Dropped (Steam/Value)
    -- Negative = Price Drifted
    ROUND(CAST((op.open_price - cl.close_price) * 100.0 / op.open_price AS numeric), 2) as steam_percentage,
    -- Implied Probability Shift
    ROUND(CAST((cl.close_prob - op.open_prob) * 100.0 AS numeric), 2) as prob_shift_percentage

FROM opening_odds op
JOIN closing_odds cl ON 
    op.fixture_id = cl.fixture_id AND 
    op.bookmaker = cl.bookmaker AND 
    op.outcome = cl.outcome
JOIN matches m ON op.fixture_id = m.fixture_id

WHERE m.status IN ('NS', 'TBD') -- Only look at upcoming/future games
  AND op.open_price > cl.close_price -- Only show Dropping Odds (Steam)
  
ORDER BY steam_percentage DESC;
