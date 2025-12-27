
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxsqljtpvufiqlztwysa.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3FsanRwdnVmaXFsenR3eXNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NDkwMiwiZXhwIjoyMDgyMTcwOTAyfQ.aO_pNFQRxXvG1Zpry2OZ-kjYCwfSCVK6vd07Z1wGyM0'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function inspectSchema() {
    console.log('--- Inspecting Columns for standings_raw ---')

    // Note: we can't always access information_schema via the JS client easily due to RLS/permissions sometimes.
    // But let's try.
    // Alternative: select * limit 1 and print keys again. safely.

    const { data, error } = await supabase
        .from('standings_raw')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Select * Error:', error);
    } else if (data && data.length > 0) {
        console.log('DATA KEYS:', Object.keys(data[0]));
    } else {
        console.log('No data found.');
    }
}

inspectSchema()
