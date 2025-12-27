console.log("🚀 Script started...");
// scripts/debug_schema.ts
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema'; // You might need to install this: npm i zod-to-json-schema
import fs from 'fs';
import path from 'path';

// 1. Import your actual tools (adjust path if needed)
// We import directly to bypass the Next.js server context
console.log("📦 Imports complete. Loading runtime_tools...");
import { runtime_tools } from '../src/lib/runtime_tools';

console.log("🔍 DIAGNOSING ZOD SCHEMA GENERATION...");

// CONTROL TEST: z.any()
const anySchema = z.any();
const anyJson = zodToJsonSchema(anySchema);
console.log("Control Test (z.any):", JSON.stringify(anyJson).substring(0, 100));

// CONTROL TEST: z.object
const controlSchema = z.object({ control: z.string() });
const controlJson = zodToJsonSchema(controlSchema);
console.log("Control Test (Simple Object):", JSON.stringify(controlJson).substring(0, 100));
if ((controlJson as any).type !== 'object') {
    console.error("🚨 CONTROL TEST FAILED: zod-to-json-schema cannot handle simple z.object with installed Zod.");
} else {
    console.log("✅ CONTROL TEST PASSED.");
}

// 2. The Fix Logic: Manually convert Zod to JSON Schema
// This proves if the Zod definition itself is valid
try {
    const toolName = 'get_player_briefing'; // Pick one tool that was failing
    const tool = runtime_tools[toolName];

    if (!tool) {
        console.error(`❌ Tool '${toolName}' not found in registry.`);
        process.exit(1);
    }

    console.log(`✅ Found tool: ${toolName}`);

    // TEST 1: Direct Zod Parsing
    console.log("Testing raw Zod schema...");
    const schema = tool.parameters;
    // If your tool uses 'parameters' as the Zod object

    // TEST 2: Convert to JSON Schema (mimicking Vercel AI SDK)
    // The SDK expects { type: "object", properties: {...} }
    const jsonSchema = zodToJsonSchema(schema);

    console.log("---------------------------------------------------");
    console.log("GENERATED JSON SCHEMA:");
    console.log(JSON.stringify(jsonSchema, null, 2));
    console.log("---------------------------------------------------");

    if (jsonSchema.type !== 'object') {
        console.error(`🚨 CRITICAL ERROR: Generated type is '${jsonSchema.type}'. Expected 'object'.`);
        console.log("HINT: Ensure your Zod schema is wrapped in z.object({...}) at the top level.");
    } else {
        console.log("✅ SUCCESS: Schema is valid JSON Schema Object.");
    }

} catch (error) {
    console.error("❌ CRASHED:", error);
}