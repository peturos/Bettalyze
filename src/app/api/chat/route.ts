
import { createVercelTools } from '@/lib/runtime_tools';
import { tavily } from '@tavily/core';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const tv = new tavily({ apiKey: process.env.TAVILY_API_KEY });

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // 1. Generate Schema-Driven Tools
        const dbTools = createVercelTools();

        // 2. Setup External Search Tool (since dbTools had a placeholder)
        const allTools = {
            ...dbTools,
            search_web: {
                description: 'Search the live web for real-time info not in the database.',
                parameters: z.object({
                    query: z.string().describe('The search query')
                }),
                execute: async ({ query }: { query: string }) => {
                    console.log(`[Search] ${query}`);
                    try {
                        const context = await tv.search(query, {
                            searchDepth: "basic",
                            maxResults: 5
                        });
                        return context.results.map((r: any) => `${r.title}: ${r.content} (${r.url})`).join('\n\n');
                    } catch (err: any) {
                        return "Use your internal knowledge. Search failed. Error: " + err.message;
                    }
                }
            }
        };

        const result = streamText({
            model: openai('gpt-4o'),
            messages,
            system: `You are Wizardinho 🧙‍♂️⚽, the ultimate Premier League betting assistant.

CONTEXT PACK (Source of Truth):
- You have access to a LIVE database of player stats, odds, and trends.
- Use 'get_player_briefing' for general player checks to see their recent form.
- Use 'get_player_vs_team' for historical matchups.
- Use 'get_league_leaders' to find top performers.
- Use 'calculate_kelly' for betting stakes.
- Use 'search_web' ONLY for news/injuries/weather not in DB.

RESPONSE RULES:
1. Always cite the view/tool you used.
2. Be concise but tactical.
3. If data is missing (e.g. empty array), say "I don't have data for that specific query."
`,
            tools: allTools,
            toolChoice: 'auto',
            async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
                console.log("[Turn Complete]", { usage, finishReason, toolsUsed: toolCalls?.map(TC => TC.toolName) });
            },
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error("Chat Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
