const http = require('http');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const PORT = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://chatbot-frontend-eight-flame.vercel.app'
];

const handler = async (req, res) => {
    const origin = req.headers.origin;

    // Direct CORS Headers Config
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle OPTIONS Preflight IMMEDIATELY
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    const reqUrl = req.url || '';

    // Status check routes
    if (reqUrl === '/' || reqUrl === '/api' || reqUrl.endsWith('/api')) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'online', message: '🚀 Backend Server is ready!' }));
        return;
    }

    // Main Chat Route Detection (Robust URL Parsing)
    if (reqUrl.includes('/api/chat') && req.method === 'POST') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { message, history, file } = JSON.parse(body || '{}');

                if (!message && !file) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Message or File is required' }));
                    return;
                }

                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                const formattedHistory = (history || []).map((msg) => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }));

                const promptParts = [];

                if (file && file.base64 && file.mimeType) {
                    promptParts.push({
                        inlineData: {
                            data: file.base64.replace(/^data:.*?;base64,/, ''),
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

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ reply: responseText }));
            } catch (error) {
                console.error('SERVER ERROR:', error.message);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Route ${reqUrl} not found` }));
    }
};

module.exports = handler;

if (process.env.NODE_ENV !== 'production') {
    const server = http.createServer(handler);
    server.listen(PORT, () => console.log(`Live at http://localhost:${PORT}`));
}