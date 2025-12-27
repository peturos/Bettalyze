import { NextResponse } from 'next/server';
import { getHeadToHead, getJusticeMetrics, getMarketSteam, getPlayerBriefing, getTeamBriefing, getTeamForm, searchWeb } from '@/lib/tools';

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
      
      FORMATTING RULES:
      - Use **Markdown Tables** for any lists of 3+ items (e.g. Standings, Odds, Top Scorers). 
      - Use Emojis ⚽️💰📊 lightly to break up text.
      - Use **Bold** for Team Names and Key Metrics.
      - Keep paragraphs short (max 2-3 sentences).
      
      Current Date: ${new Date().toISOString().split('T')[0]}
      `
        };

        const tools = [
            {
                type: "function",
                function: {
                    name: "get_justice_metrics",
                    description: "Get a list of lucky or unlucky teams based on xG performance.",
                    parameters: {
                        type: "object",
                        properties: {
                            metric: { type: "string", enum: ["lucky", "unlucky"] },
                            limit: { type: "number", default: 5 }
                        },
                        required: ["metric"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "get_player_briefing",
                    description: "Get a general overview of a player (Goals, Assists, xG, xA, Shots, Key Passes). Use this for 'How is Palmer doing?' queries.",
                    parameters: {
                        type: "object",
                        properties: {
                            playerName: { type: "string", description: "Name of the player, e.g. 'Palmer', 'Salah'" }
                        },
                        required: ["playerName"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "get_team_briefing",
                    description: "Get a general overview of a team (Rank, Recent Form, Next Match). Use this for 'How is Chelsea doing?' queries.",
                    parameters: {
                        type: "object",
                        properties: {
                            teamName: { type: "string" }
                        },
                        required: ["teamName"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "search_web",
                    description: "Search the web for general info (Injuries, News, Weather) that isn't in the database.",
                    parameters: {
                        type: "object",
                        properties: {
                            query: { type: "string" }
                        },
                        required: ["query"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "get_market_steam",
                    description: "Get a list of matches where odds have dropped significantly (Steam/Value Bets).",
                    parameters: {
                        type: "object",
                        properties: {
                            limit: { type: "number", default: 5 }
                        }
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "get_team_form",
                    description: "Get the recent match results for a team (Last 5 games). Use this for 'Who did they last play?' or 'Current form' queries.",
                    parameters: {
                        type: "object",
                        properties: {
                            teamName: { type: "string" },
                            limit: { type: "number", default: 5 }
                        },
                        required: ["teamName"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "get_head_to_head",
                    description: "Get historical results between two specific teams (e.g. 'Liverpool vs Everton history').",
                    parameters: {
                        type: "object",
                        properties: {
                            teamA: { type: "string" },
                            teamB: { type: "string" }
                        },
                        required: ["teamA", "teamB"]
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

        // 2. Check if Tool Calls are required
        if (responseMessage.tool_calls) {
            console.log(`🧙‍♂️ Wizardinho requested ${responseMessage.tool_calls.length} tool calls.`);

            // Add the assistant's request to history
            messages.push(responseMessage);

            // Execute ALL requested tools in parallel
            const toolResponses = await Promise.all(
                responseMessage.tool_calls.map(async (toolCall: any) => {
                    const functionName = toolCall.function.name;
                    const functionArgs = JSON.parse(toolCall.function.arguments);
                    let toolResult = null;

                    if (functionName === "get_justice_metrics") {
                        console.log(`   Executing: ${functionName}`, functionArgs);
                        toolResult = await getJusticeMetrics(functionArgs.metric, functionArgs.limit);
                    } else if (functionName === "get_market_steam") {
                        console.log(`   Executing: ${functionName}`, functionArgs);
                        toolResult = await getMarketSteam(functionArgs.limit);
                    } else if (functionName === "get_player_briefing") {
                        console.log(`   Executing: ${functionName}`, functionArgs);
                        toolResult = await getPlayerBriefing(functionArgs.playerName);
                    } else if (functionName === "get_team_briefing") {
                        console.log(`   Executing: ${functionName}`, functionArgs);
                        toolResult = await getTeamBriefing(functionArgs.teamName);
                    } else if (functionName === "search_web") {
                        console.log(`   Executing: ${functionName}`, functionArgs);
                        toolResult = await searchWeb(functionArgs.query);
                    } else if (functionName === "get_team_form") {
                        console.log(`   Executing: ${functionName}`, functionArgs);
                        toolResult = await getTeamForm(functionArgs.teamName, functionArgs.limit);
                    } else if (functionName === "get_head_to_head") {
                        console.log(`   Executing: ${functionName}`, functionArgs);
                        toolResult = await getHeadToHead(functionArgs.teamA, functionArgs.teamB);
                    }

                    return {
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: functionName,
                        content: JSON.stringify(toolResult)
                    };
                })
            );

            // Add all tool results to history
            messages.push(...toolResponses);

            // 3. Second Call: Feed Tool Results back to LLM
            console.log("sending tool results back to LLM...", JSON.stringify(toolResponses));
            const followUpPayload = {
                model: 'gpt-4o',
                messages: [
                    systemMessage,
                    ...messages
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

            if (!res2.ok) {
                const errorText = await res2.text();
                console.error("OpenAI Second Call Failed:", errorText);
                throw new Error(errorText);
            }
            const data2 = await res2.json();
            console.log("Received second response from LLM:", JSON.stringify(data2.choices[0].message));
            return NextResponse.json({ reply: data2.choices[0].message.content });
        }

        // No tool needed, just return reply
        return NextResponse.json({ reply: responseMessage.content });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
