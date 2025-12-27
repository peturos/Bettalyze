
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) {
            process.env[key.trim()] = val.trim();
        }
    });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is missing in .env.local');
    process.exit(1);
}

async function fetchSchema() {
    console.log('Connecting to Live Database...');
    // Use connection string. Transaction pooler requires no prepared statements.
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();

        // Fetch Tables and Views
        const res = await client.query(`
      SELECT 
        table_name, 
        table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        let schemaSql = '';

        for (const row of res.rows) {
            const isView = row.table_type === 'VIEW';
            const name = row.table_name;

            schemaSql += `\n-- ${isView ? 'VIEW' : 'TABLE'}: public.${name}\n`;
            schemaSql += isView ? `CREATE VIEW ${name} AS\n` : `CREATE TABLE ${name} (\n`;

            // Transaction Pooler does not support prepared statements (Extended Protocol).
            // We must use Simple Query Protocol (interpolated string).
            const cols = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${name}'
        ORDER BY ordinal_position
      `);

            const colDefs = cols.rows.map(c =>
                `  ${c.column_name} ${c.data_type}${c.is_nullable === 'NO' ? ' NOT NULL' : ''}`
            );

            if (!isView) {
                schemaSql += colDefs.join(',\n');
                schemaSql += `\n);\n`;
            } else {
                schemaSql += `  -- Columns:\n`;
                schemaSql += colDefs.map(c => `  -- ${c}`).join('\n');
                schemaSql += `\n`;
            }
        }

        return schemaSql;

    } catch (err) {
        console.error('Database Error:', err);
        throw err;
    } finally {
        await client.end();
    }
}

async function generateDocs() {
    const schemaSql = await fetchSchema();

    // Write SCHEMA.sql
    fs.writeFileSync(path.join(process.cwd(), 'docs', 'SCHEMA.sql'), schemaSql);
    console.log('Generated docs/SCHEMA.sql');

    // Write CONTEXT_PACK.md
    const contextPack = `# 🧙‍♂️ Wizardinho Context Pack
> **Generated on:** ${new Date().toISOString()}
> **Do Not Edit Manually** - Update Database and regenerate.

## 1. Database Schema
The database contains the following tables and views. 
**When querying, ALWAYS use the view names if available.**

\`\`\`sql
${schemaSql}
\`\`\`

## 2. Domain Knowledge
- **xG (Expected Goals)**: Measure of chance quality.
- **Luck Score**: Difference between actual goals and xG. (+ = Lucky, - = Unlucky).
- **Steam**: When odds drop significantly, indicating heavy betting volume.

## 3. Operational Rules
- **Live Browsing**: You CANNOT browse the live web unless using the \`search_web\` tool.
- **Current Data**: The DB contains "live" data. Trust it over your internal cutoff.
`;

    fs.writeFileSync(path.join(process.cwd(), 'docs', 'CONTEXT_PACK.md'), contextPack);
    console.log('Generated docs/CONTEXT_PACK.md');
}

generateDocs().catch(console.error);
