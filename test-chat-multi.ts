
async function testMultiChat() {
    console.log('--- Testing /api/chat (Multi-Tool) ---')
    try {
        // asking for "best and worst" should trigger parallel tool calls
        const res = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Compare the luckiest and unluckiest teams.' }]
            })
        })

        if (!res.ok) {
            console.error('API Error:', res.status, await res.text())
            return
        }

        const data = await res.json()
        console.log('Response:', JSON.stringify(data, null, 2))
    } catch (err) {
        console.error('Fetch Error:', err)
    }
}

testMultiChat()
