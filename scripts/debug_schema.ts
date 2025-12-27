
import { z } from 'zod';
import { tool } from 'ai';

// Mock the Tool Registry Item
const registryItem = {
    id: "get_player_briefing",
    description: "Get a general overview of a player.",
    parameters: z.object({
        playerName: z.string().describe("Name of the player")
    })
};

console.log("=== Debugging Zod Schema Generation ===");
console.log("Zod Version:", require('zod/package.json').version);
// console.log("AI SDK Version:", require('ai/package.json').version);

try {
    const aiTool = tool({
        description: registryItem.description,
        parameters: registryItem.parameters,
        execute: async () => "Mock Result"
    });

    console.log("\n--- Generated Tool Object ---");
    // Inspect specific properties known to exist in Vercel AI SDK tools
    // 'parameters' is the Zod schema
    // 'jsonSchema' might be present in newer versions?
    console.log("Keys:", Object.keys(aiTool));

    // Check for schema property
    if ('parameters' in aiTool) {
        console.log("Parameters (Zod):", aiTool.parameters);
    }

    // In SDK v3+, the JSON schema is often generated lazily or internally.
    // However, let's see if we can trigger the conversion or find the property.
    // Some versions expose .jsonSchema or .parameters.jsonSchema

    // @ts-ignore
    const jsonSchema = aiTool.parameters?._defCode ? "ZodDefinition" : "Unknown";
    console.log("Param Type:", jsonSchema);

} catch (error) {
    console.error("\nCRITICAL ERROR:", error);
}
