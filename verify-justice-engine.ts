
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function verifyJusticeEngine() {
    console.log('--- Verifying Justice Engine (v_performance_metrics) ---')

    // Fetch top 5 "Unlucky" teams (Highest xG Diff)
    const { data: unlucky, error: err1 } = await supabase
        .from('v_performance_metrics')
        .select('*')
        .order('xg_diff', { ascending: false })
        .limit(5)

    if (err1) {
        console.error('Error fetching unlucky teams:', err1.message)
    } else {
        console.log('\nTop 5 Unlucky Teams (Underperforming xG):')
        unlucky?.forEach(t => {
            console.log(`- ${t.team_name}: xG ${Number(t.total_xg).toFixed(2)} vs Goals ${t.total_goals} (Diff: ${Number(t.xg_diff).toFixed(2)})`)
        })
    }

    // Fetch top 5 "Lucky" teams (Lowest xG Diff)
    const { data: lucky, error: err2 } = await supabase
        .from('v_performance_metrics')
        .select('*')
        .order('xg_diff', { ascending: true })
        .limit(5)

    if (err2) {
        console.error('Error fetching lucky teams:', err2.message)
    } else {
        console.log('\nTop 5 Lucky Teams (Overperforming xG):')
        lucky?.forEach(t => {
            console.log(`- ${t.team_name}: xG ${Number(t.total_xg).toFixed(2)} vs Goals ${t.total_goals} (Diff: ${Number(t.xg_diff).toFixed(2)})`)
        })
    }
}

verifyJusticeEngine()
