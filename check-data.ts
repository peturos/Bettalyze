
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkData() {
    console.log('--- Checking Database Content ---')
    console.log('URL:', supabaseUrl)

    // 1. Check Matches
    const { count: matchesCount, error: matchesError } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })

    if (matchesError) console.error('Matches Error:', matchesError.message)
    else console.log('Matches Count:', matchesCount)

    // Sample a match to see season
    const { data: matchSample } = await supabase.from('matches').select('*').limit(1)
    if (matchSample && matchSample.length > 0) {
        console.log('Sample Match:', JSON.stringify(matchSample[0], null, 2))
    } else {
        console.log('No matches found in table.')
    }

    // 2. Check Standings
    const { count: standingsCount, error: standingsError } = await supabase
        .from('standings_raw')
        .select('*', { count: 'exact', head: true })

    if (standingsError) console.error('Standings Error:', standingsError.message)
    else console.log('Standings Count:', standingsCount)

    // 3. Check Events
    const { count: eventsCount, error: eventsError } = await supabase
        .from('match_events')
        .select('*', { count: 'exact', head: true })

    if (eventsError) console.error('Events Error:', eventsError.message)
    else console.log('Events Count:', eventsCount)
}

checkData()
