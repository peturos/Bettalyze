
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkSnapshots() {
    console.log('--- Checking Snapshot Types ---')

    // Note: Supabase doesn't support .distinct() easily without rpc or simple select
    // So we just fetch a bunch and aggregate manually
    const { data } = await supabase
        .from('odds_markets')
        .select('snapshot_type')
        .limit(100);

    const types = new Set(data?.map(d => d.snapshot_type));
    console.log('Distinct Snapshot Types found:', Array.from(types));
}

checkSnapshots()
