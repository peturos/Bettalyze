import { NextResponse } from 'next/server';
import { getFixtures, getOdds } from '@/lib/api-football';
import { supabase } from '@/lib/supabase';

// Helper to sleep/delay to avoid rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
    try {
        // 1. Fetch upcoming Premier League fixtures
        const data = await getFixtures(39, 2024); // Assuming 2024-2025 season start, currently '2024' in API usually covers 24/25.
        const fixtures = data.response;

        const upsertedFixtures = [];

        // 2. Upsert Fixtures into Supabase
        for (const item of fixtures) {
            const { fixture, teams, goals, league } = item;

            // Upsert Teams first (Home)
            if (teams.home.id) {
                await supabase.from('teams').upsert({
                    id: teams.home.id,
                    name: teams.home.name,
                    logo: teams.home.logo,
                    // winner: teams.home.winner
                } as any);
            }
            // Upsert Teams (Away)
            if (teams.away.id) {
                await supabase.from('teams').upsert({
                    id: teams.away.id,
                    name: teams.away.name,
                    logo: teams.away.logo
                } as any);
            }

            // Upsert Fixture
            const { error } = await supabase.from('fixtures').upsert({
                id: fixture.id,
                date: fixture.date,
                status: fixture.status.short, // NS, FT, LIVE
                home_team_id: teams.home.id,
                away_team_id: teams.away.id,
                home_goals: goals.home,
                away_goals: goals.away,
                venue_name: fixture.venue.name,
                referee: fixture.referee
            } as any);

            if (error) console.error('Error upserting fixture:', error);
            else upsertedFixtures.push(fixture.id);
        }

        // 3. Rate Limit aware Odds Fetching (simplified)
        // We only fetch odds for the first 3 fixtures to save calls in this demo
        for (const fid of upsertedFixtures.slice(0, 3)) {
            await delay(500); // polite delay
            const oddsData = await getOdds(fid);
            if (oddsData.response && oddsData.response.length > 0) {
                const bookmakers = oddsData.response[0].bookmakers;
                const b365 = bookmakers.find((b: { id: number; }) => b.id === 1); // Bet365

                if (b365) {
                    for (const market of b365.markets) {
                        // We care about Match Winner (1), Goals Over/Under (5), BTTS (13)
                        if ([1, 5, 13].includes(market.id)) {
                            for (const bet of market.values) {
                                await supabase.from('odds').insert({
                                    fixture_id: fid,
                                    bookmaker_id: b365.id,
                                    bookmaker_name: b365.name,
                                    market_id: market.id,
                                    market_name: market.name,
                                    value: bet.value,
                                    odd: parseFloat(bet.odd)
                                } as any);
                            }
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true, count: upsertedFixtures.length });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
