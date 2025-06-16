const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
let gemini = null;
if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    gemini = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 150,
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_ONLY_HIGH",
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_ONLY_HIGH",
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_ONLY_HIGH",
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_ONLY_HIGH",
            },
        ],
    });
    console.log('✅ Gemini AI initialized for chat routes');
} else {
    console.log('⚠️ GEMINI_API_KEY not found - Chat AI disabled');
}

const SYSTEM_PROMPT = `ROLE: You are a casual, friendly car salesman named Moamen at Prestigio Motors in Egypt.

COMMUNICATION STYLE:
- Talk like a regular person, not a business robot
- Use casual English only
- Keep responses super short (1-2 sentences)
- Be enthusiastic about cars but relaxed

BUSINESS INFO:
- Prestigio Motors, Sheikh Zayed, Al Obour City, Egypt
- Phone: +2 01098613073
- Cars: Bugatti, Ferrari, Lamborghini, McLaren, Porsche, Mercedes AMG, BMW M

EXAMPLE CONVERSATIONS:
Q: "hello"
A: "Hey! What's up?"

Q: "tell me about Ferrari"  
A: "Which Ferrari? The SF90 is mental - 986hp hybrid!"

Q: "can I test drive"
A: "For sure! Call me at +2 01098613073 and I'll set it up"

Q: "pricing"
A: "Call +2 01098613073 and I'll get you numbers!"

Always respond as Moamen would - casual, short, enthusiastic about cars.`;

// Fallback responses - Natural and conversational
const fallbackResponses = {
    greeting: [
        'Hey there! Welcome to Prestigio Motors. I\'m Moamen, how can I help you today?',
        'Hi! Thanks for stopping by Prestigio Motors. What brings you here today?',
        'Hello! Good to see you. What can I help you with?'
    ],
    vehicles: [
        'We\'ve got some amazing cars here! What kind of vehicle are you looking for?',
        'Oh man, we have some incredible cars. Are you thinking luxury sports car, sedan, or SUV?',
        'What type of car gets your heart racing? We\'ve got Ferraris, Lambos, you name it!'
    ],
    pricing: [
        'Let me get you exact numbers - give me a call at +2 01098613073 and I\'ll sort you out.',
        'Pricing depends on what you\'re looking at. Call me at +2 01098613073 and I\'ll give you all the details.',
        'I\'ll get you the best price. Just call +2 01098613073 and we\'ll talk numbers.'
    ],
    testdrive: [
        'Absolutely! I love setting up test drives. Call me at +2 01098613073 and we\'ll get you behind the wheel.',
        'For sure! Which car caught your eye? Call +2 01098613073 and I\'ll arrange it.',
        'Definitely! Nothing beats feeling that power yourself. Call +2 01098613073 to book it.'
    ],
    contact: [
        'You can reach me at +2 01098613073 or email prestegioautomobiles@gmail.com. We\'re in Sheikh Zayed, Al Obour City.',
        'Give me a call at +2 01098613073 or drop by our Sheikh Zayed showroom in Al Obour City!',
        'My number is +2 01098613073. We\'re open Mon-Sat 9-8, Sun 11-6.'
    ],
    hours: [
        'We\'re open Mon-Sat 9AM-8PM, and Sundays 11AM-6PM. Come by anytime!',
        'Monday through Saturday 9 to 8, Sundays 11 to 6. I\'m usually here!',
        'Mon-Sat 9AM-8PM, Sun 11AM-6PM. But call me if you need to come outside those hours.'
    ],
    default: [
        'I\'m here to help! Give me a call at +2 01098613073 and we\'ll sort everything out.',
        'Let me help you with that. Call +2 01098613073 and I\'ll get you all the info you need.',
        'No problem! Just call me at +2 01098613073 and I\'ll take care of you.'
    ]
};

// Get random fallback response
function getFallbackResponse(type = 'default') {
    const responses = fallbackResponses[type] || fallbackResponses.default;
    return responses[Math.floor(Math.random() * responses.length)];
}

// Analyze message to determine context for better fallback responses
function analyzeMessageContext(message) {
    const lowerMsg = message.toLowerCase();
    
    if (/\b(hi|hello|hey|good\s+(morning|afternoon|evening)|welcome|greet)/i.test(lowerMsg)) {
        return 'greeting';
    }
    if (/\b(car|vehicle|auto|model|brand|inventory|collection|available|showroom|bugatti|ferrari|lamborghini|rolls|mclaren|porsche|bentley|aston|maserati|mercedes|bmw)/i.test(lowerMsg)) {
        return 'vehicles';
    }
    if (/\b(price|cost|expensive|cheap|money|budget|afford|payment|finance|lease|loan)/i.test(lowerMsg)) {
        return 'pricing';
    }
    if (/\b(test\s*drive|try|experience|demo|drive)/i.test(lowerMsg)) {
        return 'testdrive';
    }
    if (/\b(contact|phone|call|email|reach|address|location|where)/i.test(lowerMsg)) {
        return 'contact';
    }
    if (/\b(hour|time|open|close|when|schedule|available)/i.test(lowerMsg)) {
        return 'hours';
    }
    
    return 'default';
}

// Main chat endpoint
router.post('/message', async (req, res) => {
    try {
        const { message, pageUrl } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Message is required and must be a string'
            });
        }

        // Trim and validate message
        const userMessage = message.trim();
        if (userMessage.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message cannot be empty'
            });
        }

        // If message is too long, limit it
        const limitedMessage = userMessage.length > 500 ? userMessage.substring(0, 500) + '...' : userMessage;

        let reply;
        let aiProvider = 'gemini';

        try {
            if (!gemini) {
                throw new Error('Gemini AI not initialized');
            }

            // Create a more effective casual prompt
            const conversationPrompt = `You're Moamen, a friendly car guy at Prestigio Motors in Egypt. 

IMPORTANT: Respond like you're texting a friend - casual, short, enthusiastic about cars.

Customer says: "${limitedMessage}"

How you should respond (examples):
- "hey" → "Hey! What's up?"  
- "what cars do you have" → "We've got some sick rides! Ferraris, Lambos, McLarens. What gets you excited?"
- "price" → "Call me at +2 01098613073 and I'll hook you up with numbers!"
- "test drive" → "Absolutely! Call +2 01098613073 and let's get you behind the wheel"

Your response (casual, 1-2 sentences max):`;

            console.log('🤖 Sending request to Gemini...');
            const result = await gemini.generateContent(conversationPrompt);
            const response = await result.response;
            reply = response.text().trim();
            
            // If Gemini is being too formal, reject it
            if (reply.includes('Welcome to Prestigio') || reply.includes('How may I assist') || reply.includes('أهلا') || reply.length > 100) {
                throw new Error('Gemini response too formal');
            }

            console.log('✅ Gemini casual response:', reply);
            aiProvider = 'gemini';

        } catch (aiError) {
            console.error('❌ Gemini AI error:', aiError.message);
            
            // Use contextual fallback
            const context = analyzeMessageContext(limitedMessage);
            reply = getFallbackResponse(context);
            aiProvider = 'fallback';
        }

        // Return response
        res.json({
            success: true,
            reply: reply,
            provider: aiProvider,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Chat endpoint error:', error);
        
        // Emergency fallback
        const context = analyzeMessageContext(req.body.message || '');
        const fallbackReply = getFallbackResponse(context);
        
        res.json({
            success: true,
            reply: fallbackReply,
            provider: 'emergency_fallback',
            timestamp: new Date().toISOString()
        });
    }
});

// Health check for chat service
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        gemini_available: !!gemini,
        timestamp: new Date().toISOString()
    });
});

module.exports = router; 