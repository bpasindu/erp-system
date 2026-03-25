const test = async () => {
    try {
        const res = await fetch('http://localhost:8080/api/ai/request', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ businessId: 1, userId: 1, prompt: 'hello', requestType: 'CHAT' })
        });
        const data = await res.json();
        console.log("JSON PARSED:", data.data.response);
    } catch(e) {
        console.error("ERROR IN PARSING:", e);
    }
};
test();
