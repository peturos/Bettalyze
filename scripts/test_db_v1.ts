console.log("🚀 DB Script Starting...");
// scripts/test_db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

console.log("📦 Imports done. Loading .env...");
// 1. Load Environment Variables explicitly from .env.local
// (The 'pg' client needs this to see DATABASE_URL)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ CRITICAL ERROR: DATABASE_URL is missing from .env.local");
    process.exit(1);
}

// Security Check: mask password for logging
const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':****@');
console.log(`🔌 Attempting connection to: ${maskedUrl}`);

// 2. Validate IPv4 / Pooler Usage (Heuristic Check)
// Supabase Poolers often use 'aws-0-...' domains or port 6543/5432
if (connectionString.includes("supabase.co") && !connectionString.includes("pooler")) {
    console.warn("⚠️  WARNING: You appear to be using the Direct IPv6 URL.");
    console.warn("    If you are on an IPv4-only network (Vercel/Local), this WILL time out.");
    console.warn("    Ensure you are using the 'supavisor' pooler URL (port 6543 or 5432).");
}

// 3. Configure Client with SSL for Supabase Transaction Mode
const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false // Required for many Supabase Pooler connections
    },
    connectionTimeoutMillis: 5000, // Fail fast (5 seconds)
});

async function runDiagnostics() {
    try {
        console.log("⏳ Connecting...");

        // TEST 1: Basic Ping
        const client = await pool.connect();
        console.log("✅ CHECK 1: Database Connection Established (Ping Successful)");

        // TEST 2: Justice Engine View Check
        // We try to select 1 row from your core view to ensure permissions/existence
        console.log("🔎 CHECK 2: Verifying 'Justice Engine' Views...");
        try {
            const res = await client.query('SELECT count(*) FROM v_player_stats_cleaned');
            console.log(`✅ SUCCESS: Accessed 'v_player_stats_cleaned'. Row count: ${res.rows[0].count}`);
        } catch (viewError: any) {
            console.error("❌ ERROR: Connected to DB, but failed to query the View.");
            console.error("   Details:", viewError.message);
            console.error("   HINT: Does the view exist? Did you apply the migration?");
        } finally {
            client.release();
        }

    } catch (err: any) {
        console.error("❌ FATAL CONNECTION ERROR:");
        console.error(`   Code: ${err.code}`);
        console.error(`   Message: ${err.message}`);

        if (err.message.includes("ETIMEDOUT")) {
            console.error("\n👉 DIAGNOSIS: IPv6 Blockage.");
            console.error("   You are likely trying to connect to a Direct Supabase URL from an IPv4 network.");
            console.error("   ACTION: Update .env.local to use the Session Pooler URL.");
        }
    } finally {
        await pool.end();
    }
}

runDiagnostics();