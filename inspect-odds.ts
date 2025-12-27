
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function inspectOdds() {
    console.log('--- Inspecting Odds Markets ---')

    // Get a few rows to see the structure
    const { data, error } = await supabase
        .from('odds_markets')
        .select('*')
        .limit(5)

    if (error) {
        console.error('Error:', error.message)
        return
    }

    if (data && data.length > 0) {
        console.log('Sample Row Keys:', Object.keys(data[0]))
        console.log('Sample Row 1:', JSON.stringify(data[0], null, 2))
        if (data[1]) console.log('Sample Row 2:', JSON.stringify(data[1], null, 2))
    } else {
        console.log('No data found in odds_markets')
    }
}

inspectOdds()
