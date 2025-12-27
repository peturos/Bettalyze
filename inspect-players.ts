
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function inspectPlayers() {
    console.log('--- Inspecting Match Players Table ---')

    const { data, error } = await supabase
        .from('match_players')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error:', error.message)
        return
    }

    if (data && data.length > 0) {
        console.log('Sample Row Keys:', Object.keys(data[0]))
        console.log('Sample Row:', JSON.stringify(data[0], null, 2))

        // Check the 'statistics' JSON column structure if it exists
        if (data[0].statistics) {
            console.log('Statistics JSON Structure:', JSON.stringify(data[0].statistics, null, 2))
        }
    } else {
        console.log('No data found in match_players')
    }
}

inspectPlayers()
