
import fetch from 'node-fetch';

async function verifyStream() {
    console.log("Testing Streaming Endpoint...");
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Hello Wizardinho' }]
            })
        });

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        console.log("Headers:", response.headers.get('content-type'));

        // In node-fetch, body is a stream
        if (response.body) {
            console.log("Stream started...");
            for await (const chunk of response.body) {
                console.log(`Received chunk: ${chunk.toString().substring(0, 50)}...`);
                // Just read a few chunks and exit
                break;
            }
            console.log("Stream Verified ✅");
        }
    } catch (e) {
        console.error("Verification Failed:", e);
    }
}

verifyStream();
