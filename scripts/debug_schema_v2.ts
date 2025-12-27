
import { z } from 'zod';
import { tool, generateText } from 'ai';

// Minimal implementation of LanguageModelV1 for debugging
const mockModel = {
    specificationVersion: 'v2',
    defaultObjectGenerationMode: 'json',
    provider: 'mock',
    modelId: 'mock-model',
    doGenerate: async (options: any) => {
        console.log("OptionsKeys:", Object.keys(options));
        if (options.tools) {
            console.log("TOOLS FOUND:", JSON.stringify(options.tools, null, 2));
        } else if (options.mode && options.mode.tools) {
            console.log("TOOLS IN MODE:", JSON.stringify(options.mode.tools, null, 2));
        }

        return {
            text: "Mock response",
            finishReason: "stop",
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            rawCall: { rawPrompt: null, rawSettings: {} }
        };
    },
    // Implement other required methods with no-ops
    doStream: async () => ({ stream: null, rawCall: {} })
};

// Test Case 1: Simple Zod Object
const schema1 = z.object({
    playerName: z.string().describe("Name")
});

// Test Case 2: Empty Zod Object (Our failure case)
const schema2 = z.object({});

import { zodToJsonSchema } from 'zod-to-json-schema';

// MOCK ZOD OBJECT
const mockZod = {
    _type: 'mock', // Duck typing often checks unknown props
    safeParseAsync: async (args: any) => ({ success: true, data: args }),
    // Properties that might trigger JSON schema pass-through?
    type: 'object',
    properties: {
        mockField: { type: 'string' }
    }
};

const tools = {
    test_tool_mock: tool({
        description: "Test Tool Mock",
        parameters: mockZod as any,
        execute: async () => "ok"
    })
};

console.log("=== Running GenerateText with Mock Model ===");

(async () => {
    try {
        await generateText({
            model: mockModel as any, // Cast to avoid strict type checking in script
            messages: [{ role: 'user', content: 'test' }],
            tools: tools,
            toolChoice: 'auto'
        });
    } catch (err) {
        console.error("GenerateText Error:", err);
    }
})();
