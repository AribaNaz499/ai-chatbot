const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 1. CORS Configuration (Sabhi origins aur preflight OPTIONS ko auto-allow karega)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Body Parser Middleware (JSON requests ke liye)
app.use(express.json({ limit: '10mb' }));

// 2. Health Check Route
app.get('/', (req, res) => {
    res.json({ status: 'online', message: '🚀 Backend Server is ready!' });
});

app.get('/api', (req, res) => {
    res.json({ status: 'online', message: '🚀 Backend Server is ready!' });
});

// 3. Main Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history, file } = req.body;

        if (!message && !file) {
            return res.status(400).json({ error: 'Message or File is required' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

        res.json({ reply: responseText });

    } catch (error) {
        console.error('SERVER ERROR:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Vercel Serverless Export
module.exports = app;

// Local Development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Live at http://localhost:${PORT}`));
}