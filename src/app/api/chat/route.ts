import { NextResponse } from 'next/server';
import { getJusticeMetrics } from '@/lib/tools';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const systemMessage = {
            role: 'system',
            content: `You are Wizardinho 🧙‍♂️, an expert AI sports betting assistant for the 'Bettalyze' platform.
      
      Your goal is to help users find value bets and answer questions about Premier League football.
      
      You have access to "Bionic Tools" (functions) that query the live database.
      - ALWAYS use tools when asked factual questions (e.g. "Who is unlucky?", "What is the xG?").
      - Do NOT hallucinate stats. If the tool returns data, trust it.
      
      Tone: Professional, insightful, but friendly and slightly magical.
      
      Current Date: ${new Date().toISOString().split('T')[0]}
      `
        };

        const tools = [
            {
                type: "function",
                function: {
                    name: "get_justice_metrics",
                    description: "Get teams that are 'Unlucky' (Underperforming xG) or 'Lucky' (Overperforming xG). Useful for finding 'Bad Beats' or 'Regression' candidates.",
                    parameters: {
                        type: "object",
                        properties: {
                            metric: {
                                type: "string",
                                enum: ["unlucky", "lucky"],
                                description: "Choice of metric. 'unlucky' finds teams with High xG but Low Goals. 'lucky' does the opposite."
                            },
                            limit: {
                                type: "integer",
                                description: "Number of teams to return (default 5)"
                            }
                        },
                        required: ["metric"]
                    }
                }
            }
        ];

        // 1. First Call: Ask LLM (with Tools)
        const payload = {
            model: 'gpt-4o',
            messages: [systemMessage, ...messages],
            tools: tools,
            tool_choice: "auto",
            temperature: 0.7,
        };

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const responseMessage = data.choices[0].message;

        // 2. Check if Tool Call is required
        if (responseMessage.tool_calls) {
            const toolCall = responseMessage.tool_calls[0];
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);

            let toolResult = null;

            // Execute the Tool
            if (functionName === "get_justice_metrics") {
                console.log(`🧙‍♂️ Wizardinho calling tool: ${functionName}`, functionArgs);
                toolResult = await getJusticeMetrics(functionArgs.metric, functionArgs.limit);
            }

            // 3. Second Call: Feed Tool Result back to LLM
            const followUpPayload = {
                model: 'gpt-4o',
                messages: [
                    systemMessage,
                    ...messages,
                    responseMessage, // The assistant's "I want to call a tool" message
                    {
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: functionName,
                        content: JSON.stringify(toolResult)
                    }
                ],
                temperature: 0.7,
            };

            const res2 = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify(followUpPayload)
            });

            if (!res2.ok) throw new Error(await res2.text());
            const data2 = await res2.json();
            return NextResponse.json({ reply: data2.choices[0].message.content });
        }

        // No tool needed, just return reply
        return NextResponse.json({ reply: responseMessage.content });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
