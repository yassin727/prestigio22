const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const logger = require('../utils/logger');

// Initialize OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Chat endpoint
router.post('/concierge', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Create a system message to set the context for the AI
        const systemMessage = {
            role: "system",
            content: `You are a luxury car concierge assistant for Prestigio Motors. 
            Your role is to provide exceptional service and information about our luxury vehicles.
            Be professional, knowledgeable, and helpful. Focus on:
            - Luxury car specifications and features
            - Test drive arrangements
            - Financing options
            - Maintenance services
            - Delivery coordination
            Keep responses concise and engaging.`
        };

        // Create the chat completion
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                systemMessage,
                { role: "user", content: message }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;

        res.json({ response: aiResponse });
    } catch (error) {
        logger.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

module.exports = router; 