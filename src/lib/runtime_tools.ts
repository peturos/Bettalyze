
import { z } from 'zod';
import { tool, jsonSchema } from 'ai';
import { Pool } from 'pg';
import toolRegistry from '../../docs/TOOL_REGISTRY.json';

// Initialize PG Pool (handling Shared Pooler constraints)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10, // Keep connection count low for Transaction mode
    idleTimeoutMillis: 30000
});

// Utility implementations (Code-based tools)
const utilityHandlers: Record<string, Function> = {
    calculate_kelly: (args: any) => {
        const { winProbabilityPercentage, decimalOdds, bankroll = 1000 } = args;
        const p = winProbabilityPercentage / 100;
        const b = decimalOdds - 1;
        const q = 1 - p;
        const f = (p * b - q) / b;
        const stakePercentage = (f * 100).toFixed(2);
        const stakeAmount = (f * bankroll).toFixed(2);

        return {
            kelly_fraction: f > 0 ? f.toFixed(4) : 0,
            recommendation: f > 0 ? `Bet ${stakePercentage}% ($${stakeAmount})` : "No Bet (Negative Edge)",
            inputs: args
        };
    },
    search_web: async (args: any) => {
        // This will be handled by Tavily in the route, or we can move logic here.
        // For now, let's keep Tavily separate or inject it?
        // Actually, let's return a special marker or implement it here if keys available.
        // We'll throw an error "External Tool" to handle in route? 
        // Or just implement it.
        return { error: "Search should be handled by external provider" };
    }
};

export function createVercelTools() {
    const tools: Record<string, any> = {};

    for (const item of toolRegistry) {
        // 1. Build Zod Schema for Parameters
        let shape: Record<string, any> = {};
        if (item.parameters) {
            for (const param of item.parameters) {
                let zSchema;
                if (param.type === 'number') zSchema = z.number();
                else zSchema = z.string();

                if (param.enum) {
                    zSchema = z.enum(param.enum as [string, ...string[]]);
                }

                if (param.description) {
                    zSchema = zSchema.describe(param.description);
                }

                if (!param.required) {
                    zSchema = zSchema.optional();
                }

                shape[param.name] = zSchema;
            }
        }

        // 2. Define Execute Function
        const execute = async (args: any) => {
            console.log(`[Runtime] Executing ${item.id}`, args);

            if (item.type === 'utility') {
                if (utilityHandlers[item.id]) {
                    return utilityHandlers[item.id](args);
                }
                return { error: `Utility ${item.id} not implemented` };
            }

            if (item.type === 'external') {
                return { error: "External tool execution deferred" };
            }

            if (!item.query_template) {
                return { error: "No SQL template defined" };
            }

            let sql = item.query_template;

            for (const [key, val] of Object.entries(args)) {
                const safeVal = String(val).replace(/'/g, "''");
                const paramDef = item.parameters?.find(p => p.name === key);
                const isNumber = paramDef?.type === 'number';

                const replacement = isNumber ? safeVal : `'${safeVal}'`;
                sql = sql.replace(new RegExp(`:${key}`, 'g'), replacement);
            }

            try {
                const client = await pool.connect();
                try {
                    const res = await client.query(sql);
                    return res.rows;
                } finally {
                    client.release();
                }
            } catch (err: any) {
                console.error("[SQL Error]", err);
                return { error: "Database error", details: err.message };
            }
        };

        tools[item.id] = tool({
            description: item.description,
            parameters: z.object(shape),
            execute: execute
        });
    }

    return tools;
}

export const runtime_tools = createVercelTools();
