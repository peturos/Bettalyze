
import { getMarketSteam } from './src/lib/tools';

async function testMarket() {
    console.log('--- Testing Market Steam Tool ---')
    const edges = await getMarketSteam(5);
    console.log(JSON.stringify(edges, null, 2));
}

testMarket();
