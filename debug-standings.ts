
import { createClient } from '@supabase/supabase-js'

// Hardcoded for immediate debugging (Service Role)
const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function debugStandings() {
    console.log('--- Debugging Standings Raw ---')

    // Get all rows (there were only 2 count previously)
    const { data, error } = await supabase
        .from('standings_raw')
        .select('id, league_id, season, fetched_at, json')

    if (error) {
        console.error('Error:', error.message)
        return
    }

    console.log(`Found ${data.length} rows.`)

    data.forEach((row, i) => {
        console.log(`\nRow ${i + 1}:`)
        console.log(`- ID: ${row.id}`)
        console.log(`- League: ${row.league_id}`)
        console.log(`- Season: ${row.season}`)
        console.log(`- Fetched At: ${row.fetched_at}`)

        // Inspect JSON structure deeply
        const json = row.json
        if (json && json.response && Array.isArray(json.response)) {
            console.log(`- Response Length: ${json.response.length}`)
            if (json.response.length > 0) {
                const league = json.response[0].league
                if (league) {
                    console.log(`  - League Name: ${league.name}`)
                    console.log(`  - League Season: ${league.season}`)
                    if (league.standings && Array.isArray(league.standings)) {
                        console.log(`  - Standings Groups: ${league.standings.length}`)
                        if (league.standings.length > 0) {
                            console.log(`    - Group 0 Teams: ${league.standings[0].length}`)
                        }
                    } else {
                        console.log('  - No standings array found inside league object')
                    }
                } else {
                    console.log('  - No league object found in response[0]')
                }
            }
        } else {
            console.log('- Invalid JSON structure (no response array)')
            console.log(JSON.stringify(json, null, 2).slice(0, 200))
        }
    })
}

debugStandings()
