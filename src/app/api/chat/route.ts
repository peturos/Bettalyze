import { streamText, createTextStreamResponse, tool } from 'ai';
import { createVercelTools } from '@/lib/runtime_tools';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const { z } = await import('zod');
        console.log("RUNTIME ZOD VERSION:", (z as any).version);

        // 2. LOAD YOUR TOOLS (Internal Marker Hack)
        const dbTools = {
            ping: {
                description: "Simple ping tool",
                parameters: {
                    _type: 'zod-schema',
                    schema: z.object({
                        message: z.string()
                    })
                } as any,
                execute: async ({ message }: { message: string }) => `Pong: ${message}`
            }
        };

        const { generateText } = await import('ai');

        // 3. RUN THE CHAT
        const result = await generateText({
            model: openai('gpt-4o'),
            messages,
            system: `You are a test assistant. Use the 'ping' tool for any greeting.`,
            tools: dbTools,
            maxSteps: 5,
        } as any);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Chat Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}