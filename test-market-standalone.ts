
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
// Using Service Role Key to bypass RLS
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function testMarketStandalone() {
    console.log('--- Testing Market Steam (Standalone) ---')

    const { data, error } = await supabase
        .from('v_market_steam')
        .select('*')
        .order('steam_percentage', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching market steam:', error);
        return;
    }

    // Mimic the logic in tools.ts
    const results = data.map(item => ({
        match: `${item.home_team} vs ${item.away_team}`,
        selection: item.selection,
        bookmaker: item.bookmaker,
        opened_at: item.open_price,
        current_price: item.close_price,
        drop: `${item.steam_percentage}%`,
        analysis: Number(item.steam_percentage) > 5
            ? '🔥 HUGE STEAM'
            : '📉 Noticeable Drop'
    }));

    console.log(JSON.stringify(results, null, 2));
}

testMarketStandalone();
