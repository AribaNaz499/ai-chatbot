const http = require('http');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const PORT = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const server = http.createServer(async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
            JSON.stringify({
                status: 'online',
                message: '🚀 Backend Server is ready!',
                endpoint: 'POST /api/chat'
            })
        );
        return;
    }

    if (req.url.startsWith('/api/chat') && req.method === 'POST') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { message, history, file } = JSON.parse(body);

                if (!message && !file) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Message or File is required' }));
                    return;
                }

                // Fixed: gemini-1.5-flash model name
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                const formattedHistory = (history || []).map((msg) => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }));

                const promptParts = [];

                if (file && file.base64 && file.mimeType) {
                    promptParts.push({
                        inlineData: {
                            data: file.base64,
                            mimeType: file.mimeType
                        }
                    });
                }

                if (message) {
                    promptParts.push({ text: message });
                }

                let responseText = '';

                if (formattedHistory.length > 0) {
                    const chat = model.startChat({ history: formattedHistory });
                    const result = await chat.sendMessage(promptParts);
                    responseText = result.response.text();
                } else {
                    const result = await model.generateContent(promptParts);
                    responseText = result.response.text();
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ reply: responseText }));
            } catch (error) {
                console.error('SERVER ERROR DETAILS:', error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
});

// Vercel Serverless Function export & local dev fallback
if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => {
        console.log(`Server live at http://localhost:${PORT}`);
    });
}

module.exports = server;