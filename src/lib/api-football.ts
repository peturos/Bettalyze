const API_KEY = process.env.API_FOOTBALL_KEY!;
const BASE_URL = 'https://v3.football.api-sports.io';

const HEADERS = {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': API_KEY
};

export async function getFixtures(leagueId: number = 39, season: number = 2025) {
    const res = await fetch(`${BASE_URL}/fixtures?league=${leagueId}&season=${season}&next=10`, {
        headers: HEADERS,
        next: { revalidate: 3600 }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch fixtures');
    }

    return res.json();
}

export async function getOdds(fixtureId: number) {
    // Bet365 is usually bookmaker 1. 1 = Match Winner, 5 = Goals Over/Under, 13 = BTTS
    const res = await fetch(`${BASE_URL}/odds?fixture=${fixtureId}&bookmaker=1`, {
        headers: HEADERS,
        next: { revalidate: 3600 }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch odds');
    }

    return res.json();
}
