import fetch from 'node-fetch';

const testPollinations = async () => {
    console.log("Starting Pollinations API Stress Test...");

    const basePrompt = "Summarize this text: ";
    const sizes = [100, 1000, 5000, 10000, 20000, 50000];

    for (const size of sizes) {
        console.log(`\nTesting payload size: ${size} chars...`);
        const dummyContext = "A".repeat(size);
        const fullPrompt = basePrompt + dummyContext;

        try {
            const startTime = Date.now();
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: fullPrompt
            });

            const duration = Date.now() - startTime;

            if (response.ok) {
                const text = await response.text();
                console.log(`✅ Success! Status: ${response.status}, Time: ${duration}ms`);
                console.log(`   Response preview: ${text.substring(0, 50)}...`);
            } else {
                console.error(`❌ Failed! Status: ${response.status} ${response.statusText}`);
                const errorText = await response.text();
                console.error(`   Error details: ${errorText}`);
            }
        } catch (error) {
            console.error(`❌ Network/System Error: ${error.message}`);
        }
    }
};

testPollinations();
