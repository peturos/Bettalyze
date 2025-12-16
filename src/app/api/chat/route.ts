import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const systemMessage = {
            role: 'system',
            content: `You are Wizardinho 🧙‍♂️, an expert AI sports betting assistant for the 'Bettalyze' platform.
      
      Your goal is to help users find value bets and answer questions about Premier League football.
      
      Tone: Professional, insightful, but friendly and slightly magical (you are a wizard after all).
      
      Context:
      - You have access to a database of Premier League stats (pretend to look them up if asked).
      - If asked about specific matches, give analysis based on form, injuries, and historical data.
      - If you detect an anomaly (like a key player missing), suggest relevant markets.
      
      Current Date: ${new Date().toISOString().split('T')[0]}
      `
        };

        const payload = {
            model: 'gpt-4o', // or gpt-3.5-turbo if 4o not available to key
            messages: [systemMessage, ...messages],
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

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`OpenAI API Error: ${errorText}`);
        }

        const data = await res.json();
        const reply = data.choices[0].message.content;

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
