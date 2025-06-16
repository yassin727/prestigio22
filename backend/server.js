require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const User = require('./models/User');
const Car = require('./models/Car');
const Order = require('./models/Order');

// Ensure logs directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Create a write stream for logging
const logStream = fs.createWriteStream(path.join(logDir, `server-${new Date().toISOString().replace(/[:.]/g, '-')}.log`), { flags: 'a' });

// Helper function to log to both console and file
const log = (...args) => {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    
    const logMessage = `[${timestamp}] ${message}\n`;
    process.stdout.write(logMessage);
    logStream.write(logMessage);
};

const app = express();
const port = process.env.PORT || 5000;

// Middleware - ORDER IS IMPORTANT
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'prestigio_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req, res, next) => {
    const requestStart = Date.now();
    
    // Log request start
    log(`\n=== Incoming ${req.method} ${req.path} ===`);
    log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        log('Body:', req.body);
    }
    
    // Log response finish
    res.on('finish', () => {
        const duration = Date.now() - requestStart;
        log(`=== Completed ${res.statusCode} in ${duration}ms ===\n`);
    });
    
    next();
});

// Initialize OpenAI with the API key from environment variables
log('Initializing OpenAI with API key:', 
    process.env.OPENAI_API_KEY ? 
    `${process.env.OPENAI_API_KEY.substring(0, 5)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}` : 
    'MISSING API KEY'
);

// Initialize AI APIs conditionally
let openai = null;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    log('✅ OpenAI initialized');
} else {
    log('⚠️ OPENAI_API_KEY not found - OpenAI disabled');
}

// Initialize Google Gemini (free alternative)
let gemini = null;
if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    log('✅ Google Gemini initialized');
} else {
    log('⚠️ GEMINI_API_KEY not found - Gemini disabled');
}

// Test AI API connections on startup
async function testAIConnections() {
    // Test OpenAI if available
    if (openai) {
        try {
            log('🧪 Testing OpenAI API connection...');
            const models = await openai.models.list();
            log('✅ OpenAI connection successful. Available models:', 
                models.data.map(m => m.id).filter(id => id.includes('gpt'))
            );
        } catch (error) {
            log('❌ OpenAI connection failed:', error.message);
            if (error.response) {
                log('OpenAI API Response:', error.response.status, error.response.statusText);
                log('Error details:', error.response.data);
            }
        }
    }
    
    // Test Gemini if available
    if (gemini) {
        try {
            log('🧪 Testing Google Gemini API connection...');
            const result = await gemini.generateContent("Hello");
            const response = await result.response;
            log('✅ Google Gemini connection successful');
        } catch (error) {
            log('❌ Google Gemini connection failed:', error.message);
        }
    }
    
    // Warn if no AI providers are available
    if (!openai && !gemini) {
        log('⚠️ No AI providers configured - chat will use fallback responses only');
    }
}

// Initialize MongoDB connection (optional)
async function connectDB() {
    if (!process.env.MONGODB_URI) {
        log('⚠️ MongoDB URI not configured. Database functionality will be disabled.');
        return null;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        log(`❌ MongoDB Connection Error: ${error.message}`);
        log('⚠️ Database functionality will be disabled.');
        return null;
    }
}

// Initialize Email Service (optional)
function setupEmailService() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        log('⚠️ Email Service: Credentials not configured. Email functionality will be disabled.');
        return null;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Test email connection
    transporter.verify(function(error, success) {
        if (error) {
            log(`❌ Email Service Error: ${error.message}`);
            log('⚠️ Email functionality will be disabled.');
        } else {
            log('✅ Email Service Connected');
        }
    });

    return transporter;
}

// Enhanced fallback responses
const FALLBACK_RESPONSES = {
    greeting: [
        "Welcome to Prestigio Motors! I'm your virtual assistant. How can I help you today?",
        "Hello! Thank you for contacting Prestigio Motors. What can I assist you with?"
    ],
    vehicles: [
        "We have a wide selection of luxury vehicles including sedans, SUVs, and sports cars. Would you like to know about a specific model?",
        "Our current inventory includes the latest models from top luxury brands. What type of vehicle are you interested in?"
    ],
    pricing: [
        "Our prices vary based on the model and specifications. Could you let me know which vehicle you're interested in?",
        "We offer competitive pricing on all our luxury vehicles. For specific pricing, please let me know the model you're interested in."
    ],
    contact: [
        "You can reach our sales team at +2 01098613073 or email us at prestegioautomobiles@gmail.com",
        "For immediate assistance, please call our customer service at +2 01098613073 or email prestegioautomobiles@gmail.com"
    ],
    default: [
        "I'm sorry, I'm currently experiencing high demand. Could you please rephrase your question?",
        "I'm having trouble accessing that information right now. Could you try asking in a different way?"
    ]
};

// Helper function to get a random fallback response
function getFallbackResponse(type = 'default') {
    const responses = FALLBACK_RESPONSES[type] || FALLBACK_RESPONSES.default;
    return responses[Math.floor(Math.random() * responses.length)];
}

// Database helper functions
async function generateUniqueUsername() {
    let username;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
        username = 'user_' + Math.random().toString(36).substr(2, 6) + Date.now().toString().slice(-4);
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            return username;
        }
        attempts++;
    } while (attempts < maxAttempts);
    
    throw new Error('Unable to generate unique username');
}

// AI helper function - tries Google Gemini if OpenAI fails
async function getChatResponse(messages) {
    // First try OpenAI (if available)
    if (openai) {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 300,
                temperature: 0.7,
            });
            
            return {
                content: response.choices[0].message.content,
                provider: 'openai',
                model: 'gpt-3.5-turbo'
            };
        } catch (error) {
            log('❌ OpenAI failed:', error.message);
            
            // If quota exceeded and we have Gemini, try it
            if (error.status === 429 && gemini) {
                log('🔄 Trying Google Gemini as fallback...');
                try {
                    // Convert messages to Gemini format
                    const prompt = messages
                        .filter(msg => msg.role !== 'system')
                        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
                        .join('\n\n');
                    
                    const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
                    const fullPrompt = systemMessage ? `${systemMessage}\n\n${prompt}` : prompt;
                    
                    const result = await gemini.generateContent(fullPrompt);
                    const response = await result.response;
                    
                    return {
                        content: response.text(),
                        provider: 'gemini',
                        model: 'gemini-1.5-flash'
                    };
                } catch (geminiError) {
                    log('❌ Gemini also failed:', geminiError.message);
                    throw error; // Throw original OpenAI error
                }
            }
            
            throw error;
        }
    }
    
    // If no OpenAI key but we have Gemini
    if (gemini) {
        try {
            const prompt = messages
                .filter(msg => msg.role !== 'system')
                .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
                .join('\n\n');
            
            const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';
            const fullPrompt = systemMessage ? `${systemMessage}\n\n${prompt}` : prompt;
            
            const result = await gemini.generateContent(fullPrompt);
            const response = await result.response;
            
            return {
                content: response.text(),
                provider: 'gemini',
                model: 'gemini-1.5-flash'
            };
        } catch (error) {
            log('❌ Gemini error:', error.message);
            throw error;
        }
    }
    
    throw new Error('No AI provider available');
}

// Car data from frontend
const luxuryCarData = {
    bugatti: {
        name: "Bugatti",
        logo: "logos/Bugatti-Logo.png",
        cars: [
            { name: "Chiron", image: "images/2017-Bugatti-Chiron-009-2160.jpg", info: "1500 HP, 8.0L W16 Engine", price: "$3,000,000+" },
            { name: "Veyron", image: "images/2015-Bugatti-Veyron-Grand-Sport-Vitesse-La-Finale-001-1600.jpg", info: "1500 HP, 8.0L W16 Engine", price: "$3,300,000+" },
            { name: "Divo", image: "images/2019-Bugatti-Divo-007-2160.jpg", info: "1500 HP, 8.0L W16 Engine", price: "$5,800,000+" },
            { name: "La Voiture Noire", image: "images/images.jpg", info: "1500 HP, 8.0L W16 Engine", price: "$18,700,000+" },
            { name: "Bolide", image: "images/1-Bugatti-Bolide-review-2025.jpg", info: "1825 HP, 8.0L W16 Engine", price: "$4,000,000+" }
        ]
    },
    rollsRoyce: {
        name: "Rolls-Royce",
        logo: "logos/rolls-royce-logo.png",
        cars: [
            { name: "Phantom", image: "images/01_RR_PHANTOM-single-twin-card-min.jpg", info: "563 HP, 6.75L V12 Engine", price: "$450,000+" },
            { name: "Ghost", image: "images/2015-Rolls-Royce-Ghost-Series-II-001-1600.jpg", info: "563 HP, 6.75L V12 Engine", price: "$350,000+" },
            { name: "Cullinan", image: "images/P90344238-rolls-royce-cullinan-2250px.jpg", info: "563 HP, 6.75L V12 Engine", price: "$330,000+" },
            { name: "Wraith", image: "images/2014-Rolls-Royce-Wraith-005-1600.jpg", info: "624 HP, 6.75L V12 Engine", price: "$330,000+" },
            { name: "Spectre", image: "images/2026-Rolls-Royce-Spectre-Black-Badge-001-2000.jpg", info: "577 HP, Electric", price: "$420,000+" }
        ]
    },
    bentley: {
        name: "Bentley",
        logo: "logos/bentley.png",
        cars: [
            { name: "Continental GT", image: "images/01_RR_PHANTOM-single-twin-card-min.jpg", info: "626 HP, 6.0L W12 Engine", price: "$220,000+" },
            { name: "Bentayga", image: "images/bentayga.jpg", info: "542 HP, 4.0L V8 Engine", price: "$180,000+" },
            { name: "Flying Spur", image: "images/flying spur.jpg", info: "626 HP, 6.0L W12 Engine", price: "$214,000+" },
            { name: "Mulsanne", image: "images/2017-Bentley-Mulsanne-Speed-001-2000.jpg", info: "505 HP, 6.75L V8 Engine", price: "$335,000+" },
            { name: "Batur", image: "images/batur.jpg", info: "740 HP, 6.0L W12 Twin-Turbocharged", price: "$2.5 million+" }
        ]
    },
    ferrari: {
        name: "Ferrari",
        logo: "logos/ferrari-emblem-logo-png_seeklogo-53763.png",
        cars: [
            { name: "SF90 Stradale", image: "images/sf90.jpg", info: "986 HP, Hybrid V8 Engine", price: "$625,000+" },
            { name: "F8 Tributo", image: "images/f8.jpg", info: "710 HP, 3.9L V8 Engine", price: "$276,000+" },
            { name: "Roma", image: "images/roma.jpg", info: "612 HP, 3.9L V8 Engine", price: "$222,000+" },
            { name: "LaFerrari", image: "images/laferrari.jpg", info: "950 HP, Hybrid V12 Engine", price: "$3,000,000+" },
            { name: "812 Superfast", image: "images/superfast.jpg", info: "789 HP, 6.5L V12 Engine", price: "$340,000+" }
        ]
    },
    lamborghini: {
        name: "Lamborghini",
        logo: "logos/Lamborghini-Logo.png",
        cars: [
            { name: "Aventador", image: "images/aventador.jpg", info: "770 HP, 6.5L V12 Engine", price: "$500,000+" },
            { name: "Huracán", image: "images/huracan.jpg", info: "640 HP, 5.2L V10 Engine", price: "$260,000+" },
            { name: "Urus", image: "images/urus.jpg", info: "650 HP, 4.0L V8 Engine", price: "$220,000+" },
            { name: "Revuelto", image: "images/revuelto.jpg", info: "1001 HP, Hybrid V12 Engine", price: "$600,000+" },
            { name: "Sian", image: "images/sian.jpg", info: "819 HP, Hybrid V12 Engine", price: "$3,600,000+" }
        ]
    },
    mclaren: {
        name: "McLaren",
        logo: "logos/mclaren-logo.png",
        cars: [
            { name: "720S", image: "images/720s.jpg", info: "710 HP, 4.0L V8 Engine", price: "$299,000+" },
            { name: "Artura", image: "images/artura.jpg", info: "671 HP, Hybrid V6 Engine", price: "$225,000+" },
            { name: "Senna", image: "images/senna.jpg", info: "789 HP, 4.0L V8 Engine", price: "$1,000,000+" },
            { name: "P1", image: "images/p1.jpg", info: "903 HP, Hybrid V8 Engine", price: "$1,500,000+" },
            { name: "765LT", image: "images/765lt.jpg", info: "755 HP, 4.0L V8 Engine", price: "$358,000+" }
        ]
    },
    porsche: {
        name: "Porsche",
        logo: "logos/png-clipart-porsche-911-car-desktop-logo-porsche-emblem-label.png",
        cars: [
            { name: "911 Turbo S", image:"images/911_.jpg", info: "640 HP, 3.8L Flat-6 Engine", price: "$216,000+" },
            { name: "Taycan", image: "images/Porsche-Taycan-Performance.jpg", info: "750 HP, Electric", price: "$185,000+" },
            { name: "Panamera", image: "images/panamera_.jpg", info: "620 HP, 4.0L V8 Engine", price: "$179,000+" },
            { name: "Cayenne", image: "images/cayenne--coupe.jpg", info: "670 HP, 4.0L V8 Engine", price: "$180,000+" },
            { name: "918 Spyder", image: "images/918_Spyder.jpg", info: "887 HP, Hybrid V8 Engine", price: "$1,500,000+" }
        ]
    },
    astonMartin: {
        name: "Aston Martin",
        logo: "logos/Aston-Martin-Logo.png",
        cars: [
            { name: "DBS Superleggera", image: "images/DBS_Superleggera.jpg", info: "715 HP, 5.2L V12 Engine", price: "$316,000+" },
            { name: "Vantage", image: "images/Vantage.jpg", info: "503 HP, 4.0L V8 Engine", price: "$142,000+" },
            { name: "DBX", image: "images/DBX.jpg", info: "542 HP, 4.0L V8 Engine", price: "$176,000+" },
            { name: "DB11", image: "images/DB11.jpg", info: "630 HP, 5.2L V12 Engine", price: "$205,000+" },
            { name: "Valkyrie", image: "images/Valkyrie.jpg", info: "1160 HP, Hybrid V12 Engine", price: "$3,000,000+" }
        ]
    },
    maserati: {
        name: "Maserati",
        logo: "logos/png-transparent-maserati-logo-car-organization-brand-maserati-emblem-text-logo.png",
        cars: [
            { name: "MC20", image: "images/mc20.jpg", info: "621 HP, 3.0L V6 Engine", price: "$212,000+" },
            { name: "Levante", image: "images/levante.jpg", info: "580 HP, 3.8L V8 Engine", price: "$153,000+" },
            { name: "Quattroporte", image: "images/quattroporte.jpg", info: "580 HP, 3.8L V8 Engine", price: "$142,000+" },
            { name: "Ghibli", image: "images/ghibli.jpg", info: "345 HP, 3.0L V6 Engine", price: "$75,000+" },
            { name: "GranTurismo", image: "images/granturismo.jpg", info: "490 HP, 3.0L V6 Engine", price: "$175,000+" }
        ]
    },
    mercedes: {
        name: "Mercedes-Benz",
        logo: "logos/Mercedes-Logo.svg.png",
        cars: [
            { name: "S-Class", image: "images/sclass.jpg", info: "496 HP, 4.0L V8 Engine", price: "$110,000+" },
            { name: "AMG GT", image: "images/amg.jpg", info: "720 HP, 4.0L V8 Engine", price: "$180,000+" },
            { name: "G-Class", image: "images/gclass.jpg", info: "577 HP, 4.0L V8 Engine", price: "$156,000+" },
            { name: "EQS AMG", image: "images/eqs.jpg", info: "751 HP, Electric", price: "$150,000+" },
            { name: "SL 63", image: "images/sl63.jpg", info: "577 HP, 4.0L V8 Engine", price: "$180,000+" }
        ]
    },
    bmw: {
        name: "BMW",
        logo: "logos/png-clipart-bmw-car-logo-bmw-logo-trademark-logo.png",
        cars: [
            { name: "M8 Competition", image: "images/m8.jpg", info: "617 HP, 4.4L V8 Engine", price: "$140,000+" },
            { name: "X7", image: "images/x7.jpg", info: "523 HP, 4.4L V8 Engine", price: "$120,000+" },
            { name: "i8", image: "images/i8.jpg", info: "369 HP, Hybrid", price: "$147,000+" },
            { name: "M5 CS", image: "images/m5cs.jpg", info: "627 HP, 4.4L V8 Engine", price: "$143,000+" },
            { name: "XM", image: "images/xm.jpg", info: "644 HP, Hybrid V8 Engine", price: "$160,000+" }
        ]
    },
    audi: {
        name: "Audi",
        logo: "logos/audi.png",
        cars: [
            { name: "R8", image: "images/R8.jpg", info: "602 HP, 5.2L V10 Engine", price: "$168,000+" },
            { name: "e-tron GT", image: "images/etron.jpg", info: "637 HP, Electric", price: "$140,000+" },
            { name: "RS7", image: "images/RS7.jpg", info: "591 HP, 4.0L V8 Engine", price: "$118,000+" },
            { name: "RS Q8", image: "images/RS_Q8.jpg", info: "591 HP, 4.0L V8 Engine", price: "$125,000+" },
            { name: "RS6 Avant", image: "images/RS6_Avant.jpg", info: "591 HP, 4.0L V8 Engine", price: "$110,000+" }
        ]
    },
    lexus: {
        name: "Lexus",
        logo: "logos/lexus.png",
        cars: [
            { name: "LC 500", image: "images/lc500.jpg", info: "471 HP, 5.0L V8 Engine", price: "$93,000+" },
            { name: "LS 500", image: "images/ls500.jpg", info: "416 HP, 3.5L V6 Engine", price: "$77,000+" },
            { name: "LX 600", image: "images/lx600.jpg", info: "409 HP, 3.5L V6 Engine", price: "$86,000+" },
            { name: "LFA", image: "images/lfa.jpg", info: "552 HP, 4.8L V10 Engine", price: "$500,000+" },
            { name: "IS 500 F Sport", image: "images/is500.jpg", info: "472 HP, 5.0L V8 Engine", price: "$60,000+" }
        ]
    },
    jaguar: {
        name: "Jaguar",
        logo: "logos/png-transparent-jaguar-cars-luxury-vehicle-logo-jaguar-angle-animals-company.png",
        cars: [
            { name: "F-Type", image: "images/ftype.jpg", info: "575 HP, 5.0L V8 Engine", price: "$103,000+" },
            { name: "I-PACE", image: "images/ipace.jpg", info: "394 HP, Electric", price: "$69,000+" },
            { name: "XJ", image: "images/xj.jpg", info: "470 HP, 5.0L V8 Engine", price: "$87,000+" },
            { name: "XF", image: "images/xf.jpg", info: "246 HP, 2.0L I4 Engine", price: "$45,000+" },
            { name: "E-PACE", image: "images/epace.jpg", info: "246 HP, 2.0L I4 Engine", price: "$45,000+" }
        ]
    },
    landRover: {
        name: "Land Rover",
        logo: "logos/land-rover-logo-png_seeklogo-201638.png",
        cars: [
            { name: "Vogue", image: "images/vogue.jpg", info: "606 HP,SV Bespoke V8 (Supercharged)", price: "$120,000+" },
            { name: "Defender", image: "images/defender.jpg", info: "518 HP, 5.0L V8 Engine", price: "$90,000+" },
            { name: "Range Rover Sport", image: "images/sport.jpg", info: "523 HP, 4.4L V8 Engine", price: "$83,000+" },
            { name: "Velar", image: "images/Velar.jpg", info: "247 HP, 2.0L I4 Engine", price: "$60,000+" },
            { name: "Discovery", image: "images/Discovery.jpg", info: "355 HP, 3.0L I6 Engine", price: "$60,000+" }
        ]
    }
};

const regularCarData = {
    toyota: {
        name: "Toyota",
        logo: "/api/placeholder/150/150",
        flag: "🇯🇵",
        cars: [
            { name: "Camry", image: "/api/placeholder/600/400", info: "Midsize sedan, 2.5L I4 (203 HP) or 3.5L V6 (301 HP)", price: "$26K-35K" },
            { name: "Corolla", image: "/api/placeholder/600/400", info: "Compact sedan or hatchback, 2.0L I4 (169 HP)", price: "$21K-28K" },
            { name: "RAV4", image: "/api/placeholder/600/400", info: "Compact SUV, 2.5L I4 (203 HP) or hybrid (219 HP)", price: "$28K-38K" },
            { name: "Highlander", image: "/api/placeholder/600/400", info: "Midsize SUV, 2.4L I4 (265 HP) or hybrid (243 HP)", price: "$36K-52K" },
            { name: "Prius", image: "/api/placeholder/600/400", info: "Hybrid compact car, 1.8L I4 (121 HP) or plug-in hybrid (220 HP)", price: "$25K-34K" }
        ]
    },
    honda: {
        name: "Honda",
        logo: "/api/placeholder/150/150",
        flag: "🚘",
        cars: [
            { name: "Civic", image: "/api/placeholder/600/400", info: "Compact sedan or hatchback, 2.0L I4 (158 HP) or 1.5L turbo (180 HP)", price: "$23K-30K" },
            { name: "Accord", image: "/api/placeholder/600/400", info: "Midsize sedan, 1.5L turbo (192 HP) or 2.0L turbo (252 HP)", price: "$27K-38K" },
            { name: "CR-V", image: "/api/placeholder/600/400", info: "Compact SUV, 1.5L turbo (190 HP) or hybrid (212 HP)", price: "$28K-38K" },
            { name: "HR-V", image: "/api/placeholder/600/400", info: "Subcompact SUV, 2.0L I4 (158 HP)", price: "$23K-30K" },
            { name: "Odyssey", image: "/api/placeholder/600/400", info: "Minivan, 3.5L V6 (280 HP)", price: "$37K-52K" }
        ]
    },
    ford: {
        name: "Ford",
        logo: "/api/placeholder/150/150",
        flag: "🇺🇸",
        cars: [
            { name: "Mustang", image: "/api/placeholder/600/400", info: "Sports car, 2.3L turbo I4 (310 HP) or 5.0L V8 (450 HP)", price: "$30K-60K" },
            { name: "Explorer", image: "/api/placeholder/600/400", info: "Midsize SUV, 2.3L turbo I4 (300 HP) or 3.0L V6 (400 HP)", price: "$36K-55K" },
            { name: "F-150", image: "/api/placeholder/600/400", info: "Full-size pickup, 3.3L V6 (290 HP) to 3.5L turbo V6 (450 HP)", price: "$33K-80K" },
            { name: "Escape", image: "/api/placeholder/600/400", info: "Compact SUV, 1.5L turbo I4 (181 HP) or 2.0L turbo (250 HP)", price: "$26K-38K" }
        ]
    },
    chevrolet: {
        name: "Chevrolet",
        logo: "/api/placeholder/150/150",
        flag: "🔥",
        cars: [
            { name: "Malibu", image: "/api/placeholder/600/400", info: "Midsize sedan, 1.5L turbo I4 (160 HP)", price: "$25K-35K" },
            { name: "Traverse", image: "/api/placeholder/600/400", info: "Midsize SUV, 3.6L V6 (310 HP)", price: "$35K-50K" },
            { name: "Silverado 1500", image: "/api/placeholder/600/400", info: "Full-size pickup, 2.7L turbo I4 (310 HP) to 6.2L V8 (420 HP)", price: "$36K-70K" },
            { name: "Equinox", image: "/api/placeholder/600/400", info: "Compact SUV, 1.5L turbo I4 (175 HP)", price: "$26K-35K" },
            { name: "Trailblazer", image: "/api/placeholder/600/400", info: "Subcompact SUV, 1.2L turbo I3 (137 HP) or 1.3L turbo (155 HP)", price: "$22K-30K" }
        ]
    },
    hyundai: {
        name: "Hyundai",
        logo: "/api/placeholder/150/150",
        flag: "⚡",
        cars: [
            { name: "Elantra", image: "/api/placeholder/600/400", info: "Compact sedan, 2.0L I4 (147 HP) or 1.6L turbo (201 HP)", price: "$20K-28K" },
            { name: "Sonata", image: "/api/placeholder/600/400", info: "Midsize sedan, 2.5L I4 (191 HP) or 1.6L turbo (180 HP)", price: "$25K-35K" },
            { name: "Tucson", image: "/api/placeholder/600/400", info: "Compact SUV, 2.5L I4 (187 HP) or hybrid (226 HP)", price: "$26K-38K" },
            { name: "Santa Fe", image: "/api/placeholder/600/400", info: "Midsize SUV, 2.5L I4 (191 HP) or hybrid (225 HP)", price: "$28K-42K" },
            { name: "Palisade", image: "/api/placeholder/600/400", info: "Large SUV, 3.8L V6 (291 HP)", price: "$35K-50K" }
        ]
    },
    nissan: {
        name: "Nissan",
        logo: "/api/placeholder/150/150",
        flag: "🏁",
        cars: [
            { name: "Altima", image: "/api/placeholder/600/400", info: "Midsize sedan, 2.5L I4 (188 HP) or 2.0L turbo (248 HP)", price: "$25K-35K" },
            { name: "Sentra", image: "/api/placeholder/600/400", info: "Compact sedan, 2.0L I4 (149 HP)", price: "$20K-25K" },
            { name: "Rogue", image: "/api/placeholder/600/400", info: "Compact SUV, 1.5L turbo I3 (201 HP)", price: "$27K-38K" },
            { name: "Pathfinder", image: "/api/placeholder/600/400", info: "Midsize SUV, 3.5L V6 (284 HP)", price: "$34K-50K" },
            { name: "Maxima", image: "/api/placeholder/600/400", info: "Midsize sedan, 3.5L V6 (300 HP)", price: "$38K-45K" }
        ]
    },
    volkswagen: {
        name: "Volkswagen",
        logo: "/api/placeholder/150/150",
        flag: "🇩🇪",
        cars: [
            { name: "Jetta", image: "/api/placeholder/600/400", info: "Compact sedan, 1.5L turbo I4 (158 HP)", price: "$20K-28K" },
            { name: "Tiguan", image: "/api/placeholder/600/400", info: "Compact SUV, 2.0L turbo I4 (184 HP)", price: "$27K-38K" },
            { name: "Golf GTI", image: "/api/placeholder/600/400", info: "Hot hatch, 2.0L turbo I4 (241 HP)", price: "$30K-40K" },
            { name: "Atlas", image: "/api/placeholder/600/400", info: "Midsize SUV, 2.0L turbo I4 (235 HP) or 3.6L V6 (276 HP)", price: "$35K-50K" }
        ]
    },
    subaru: {
        name: "Subaru",
        logo: "/api/placeholder/150/150",
        flag: "🏔️",
        cars: [
            { name: "Outback", image: "/api/placeholder/600/400", info: "Midsize wagon, 2.5L flat-4 (182 HP) or 2.4L turbo (260 HP)", price: "$28K-40K" },
            { name: "Forester", image: "/api/placeholder/600/400", info: "Compact SUV, 2.5L flat-4 (182 HP)", price: "$26K-35K" },
            { name: "WRX", image: "/api/placeholder/600/400", info: "Performance sedan, 2.4L turbo flat-4 (271 HP)", price: "$30K-40K" },
            { name: "Crosstrek", image: "/api/placeholder/600/400", info: "Subcompact SUV, 2.0L flat-4 (152 HP) or 2.5L (182 HP)", price: "$23K-30K" },
            { name: "Legacy", image: "/api/placeholder/600/400", info: "Midsize sedan, 2.5L flat-4 (182 HP) or 2.4L turbo (260 HP)", price: "$25K-35K" }
        ]
    },
    kia: {
        name: "Kia",
        logo: "/api/placeholder/150/150", 
        flag: "🏆",
        cars: [
            { name: "K5", image: "/api/placeholder/600/400", info: "Midsize sedan, 1.6L turbo (180 HP) or 2.5L turbo (290 HP)", price: "$24K-35K" },
            { name: "Sportage", image: "/api/placeholder/600/400", info: "Compact SUV, 2.5L I4 (187 HP) or hybrid (227 HP)", price: "$26K-38K" },
            { name: "Sorento", image: "/api/placeholder/600/400", info: "Midsize SUV, 2.5L I4 (191 HP) or hybrid (227 HP)", price: "$30K-45K" },
            { name: "Seltos", image: "/api/placeholder/600/400", info: "Subcompact SUV, 2.0L I4 (146 HP) or 1.6L turbo (175 HP)", price: "$22K-30K" },
            { name: "Telluride", image: "/api/placeholder/600/400", info: "Large SUV, 3.8L V6 (291 HP)", price: "$36K-50K" }
        ]
    },
    mazda: {
        name: "Mazda",
        logo: "/api/placeholder/150/150",
        flag: "🚗",
        cars: [
            { name: "Mazda3", image: "/api/placeholder/600/400", info: "Compact sedan or hatchback, 2.5L I4 (186 HP)", price: "$22K-30K" },
            { name: "CX-5", image: "/api/placeholder/600/400", info: "Compact SUV, 2.5L I4 (187 HP) or turbo (250 HP)", price: "$26K-38K" },
            { name: "CX-9", image: "/api/placeholder/600/400", info: "Midsize SUV, 2.5L turbo I4 (250 HP)", price: "$35K-50K" },
            { name: "MX-5 Miata", image: "/api/placeholder/600/400", info: "Sports car, 2.0L I4 (181 HP)", price: "$28K-35K" }
        ]
    },
    dodge: {
        name: "Dodge",
        logo: "/api/placeholder/150/150",
        flag: "🏎️",
        cars: [
            { name: "Charger", image: "/api/placeholder/600/400", info: "Sedan, 3.6L V6 (292 HP) or 5.7L V8 (370 HP)", price: "$35K-50K" },
            { name: "Challenger", image: "/api/placeholder/600/400", info: "Coupe, 3.6L V6 (303 HP)", price: "$30K-45K" },
            { name: "Durango", image: "/api/placeholder/600/400", info: "Midsize SUV, 3.6L V6 (293 HP) or 5.7L V8 (360 HP)", price: "$40K-60K" }
        ]
    },
    jeep: {
        name: "Jeep",
        logo: "/api/placeholder/150/150",
        flag: "🚙",
        cars: [
            { name: "Wrangler", image: "/api/placeholder/600/400", info: "Off-road SUV, 3.6L V6 (285 HP) or 2.0L turbo (270 HP)", price: "$32K-60K" },
            { name: "Grand Cherokee", image: "/api/placeholder/600/400", info: "Midsize SUV, 3.6L V6 (293 HP) or 5.7L V8 (357 HP)", price: "$38K-70K" },
            { name: "Renegade", image: "/api/placeholder/600/400", info: "Subcompact SUV, 2.4L I4 (180 HP)", price: "$24K-30K" },
            { name: "Compass", image: "/api/placeholder/600/400", info: "Compact SUV, 2.4L I4 (177 HP)", price: "$26K-35K" },
            { name: "Gladiator", image: "/api/placeholder/600/400", info: "Midsize pickup, 3.6L V6 (285 HP)", price: "$38K-55K" }
        ]
    },
    tesla: {
        name: "Tesla",
        logo: "/api/placeholder/150/150",
        flag: "⚡",
        cars: [
            { name: "Model 3", image: "/api/placeholder/600/400", info: "Electric sedan, 283–450 HP, 272–358-mile range", price: "$40K-55K" },
            { name: "Model Y", image: "/api/placeholder/600/400", info: "Electric SUV, 283–456 HP, 279–330-mile range", price: "$45K-60K" },
            { name: "Model S", image: "/api/placeholder/600/400", info: "Electric sedan, 670 HP, 405-mile range", price: "$75K-100K" },
            { name: "Model X", image: "/api/placeholder/600/400", info: "Electric SUV, 670 HP, 348-mile range", price: "$80K-110K" },
            { name: "Cybertruck", image: "/api/placeholder/600/400", info: "Electric pickup, 500+ HP, 250–500-mile range", price: "$40K-70K (pre-order)" }
        ]
    },
    chrysler: {
        name: "Chrysler",
        logo: "/api/placeholder/150/150",
        flag: "🌟",
        cars: [
            { name: "300", image: "/api/placeholder/600/400", info: "Full-size sedan, 3.6L V6 (292 HP) or 5.7L V8 (363 HP)", price: "$32K-45K" },
            { name: "Pacifica", image: "/api/placeholder/600/400", info: "Minivan, 3.6L V6 (287 HP) or plug-in hybrid (260 HP)", price: "$37K-55K" },
            { name: "Voyager", image: "/api/placeholder/600/400", info: "Minivan, 3.6L V6 (287 HP)", price: "$30K-40K" }
        ]
    }
};

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
    log('=== REGISTRATION REQUEST ===');
    log('Headers:', req.headers);
    log('Body:', req.body);
    
    try {
        const { fullName, phone, address, age, gender, nationality, email, password } = req.body;
        
        // Basic validation
        if (!fullName || !phone || !address || !age || !gender || !nationality || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }
        
        // Age validation
        if (parseInt(age) < 18) {
            return res.status(400).json({
                success: false,
                message: 'You must be at least 18 years old to register'
            });
        }
        
        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }
        
        log('Registration data validated successfully');
        
        // Generate unique username
        const username = await generateUniqueUsername();
        
        // Create new user in database
        const newUser = new User({
            username,
            email: email.toLowerCase(),
            password, // This will be automatically hashed by the pre-save middleware
            fullName,
            phone,
            address,
            age: parseInt(age),
            gender,
            nationality
        });
        
        // Save user to database
        await newUser.save();
        
        log(`✅ User registered in database: ${username} (${email})`);
        
        // Send email with credentials (if email service is configured)
        if (global.transporter) {
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Welcome to Prestigio Motors - Your Account Details',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
                            <div style="background: linear-gradient(135deg, #d4af37, #f4d03f); color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">PRESTIGIO</h1>
                                <p style="margin: 10px 0 0 0; font-size: 16px;">Luxury Motor Company</p>
                            </div>
                            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                                <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${fullName}!</h2>
                                <p style="color: #666; line-height: 1.6;">Thank you for registering with Prestigio Motors. Your account has been successfully created.</p>
                                
                                <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="color: #d4af37; margin-top: 0;">Your Login Credentials:</h3>
                                    <p style="margin: 10px 0;"><strong>Username:</strong> ${username}</p>
                                    <p style="margin: 10px 0;"><strong>Password:</strong> ${password}</p>
                                </div>
                                
                                <p style="color: #666; line-height: 1.6;">Please keep these credentials safe and secure. You can now access our exclusive collection of luxury vehicles.</p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="http://localhost:5000/pages/login.html" style="background: linear-gradient(135deg, #d4af37, #f4d03f); color: #000; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Login to Your Account</a>
                                </div>
                                
                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                
                                <p style="color: #999; font-size: 14px; text-align: center;">
                                    Contact us: +2 01098613073 | prestegioautomobiles@gmail.com<br>
                                    Al Obour City, Egypt
                                </p>
                            </div>
                        </div>
                    `
                };
                
                await global.transporter.sendMail(mailOptions);
                log(`✅ Welcome email sent successfully to ${email}`);
            } catch (emailError) {
                log(`❌ Failed to send welcome email: ${emailError.message}`);
                // Don't fail registration if email fails
            }
        } else {
            log('⚠️ Email service not configured - skipping email send');
        }
        
        res.status(201).json({
            success: true,
            message: 'Registration successful! An email with your login credentials has been sent to your email address.',
            user: {
                username,
                fullName,
                email,
                phone,
                address,
                age: parseInt(age),
                gender,
                nationality
            },
            credentials: {
                username,
                password
            }
        });
        
    } catch (error) {
        log('❌ Registration error:', error);
        
        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `An account with this ${field} already exists`
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'An error occurred during registration. Please try again.'
        });
    }
});

// Google OAuth Routes
app.get('/api/auth/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

app.get('/api/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login.html?error=google_auth_failed' 
    }),
    async (req, res) => {
        try {
            // Generate JWT token for Google user
            const jwt = require('jsonwebtoken');
            const token = jwt.sign(
                { 
                    userId: req.user._id, 
                    username: req.user.username,
                    email: req.user.email,
                    provider: req.user.provider
                },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '7d' }
            );

            // Set JWT as HTTP-only cookie
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            log(`✅ Google OAuth login successful for user: ${req.user.email}`);

            // Check if user needs to complete profile
            const needsProfile = !req.user.phone || !req.user.address || !req.user.nationality;
            
            if (needsProfile) {
                res.redirect('/complete-profile.html');
            } else {
                res.redirect('/');
            }

        } catch (error) {
            log('❌ Google callback error:', error);
            res.redirect('/login.html?error=auth_failed');
        }
    }
);

// Complete profile for Google OAuth users
app.post('/api/auth/complete-profile', async (req, res) => {
    try {
        const { phone, address, age, gender, nationality } = req.body;
        
        // Get user from JWT token
        const jwt = require('jsonwebtoken');
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Update user profile
        user.phone = phone;
        user.address = address;
        user.age = parseInt(age);
        user.gender = gender;
        user.nationality = nationality;

        await user.save();

        log(`✅ Profile completed for user: ${user.email}`);

        res.json({
            success: true,
            message: 'Profile completed successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                profilePicture: user.profilePicture,
                provider: user.provider
            }
        });

    } catch (error) {
        log('❌ Complete profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get current user info
app.get('/api/auth/me', async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const token = req.cookies.authToken;
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authenticated' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                profilePicture: user.profilePicture,
                provider: user.provider,
                phone: user.phone,
                address: user.address,
                age: user.age,
                gender: user.gender,
                nationality: user.nationality
            }
        });

    } catch (error) {
        log('❌ Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    log('=== LOGIN REQUEST ===');
    log('Headers:', req.headers);
    log('Body:', req.body);
    
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        
        // Try database login first (if connected)
        if (mongoose.connection.readyState === 1) {
            try {
                // Find user in database by username or email
                const user = await User.findByUsernameOrEmail(username);
                
                if (user) {
                    // Check password using bcrypt
                    const isPasswordValid = await user.comparePassword(password);
                    
                    if (isPasswordValid) {
                        // Update last login
                        await user.updateLastLogin();
                        
                        log(`✅ Database login successful for user: ${username}`);
                        return res.json({
                            success: true,
                            message: 'Login successful',
                            user: {
                                username: user.username,
                                fullName: user.fullName,
                                email: user.email,
                                isAdmin: false
                            }
                        });
                    }
                }
            } catch (dbError) {
                log('Database login failed, falling back to demo users:', dbError.message);
            }
        } else {
            log('Database not connected, using demo users only');
        }
        
        // Check against demo users (for testing when database is down)
        const DEMO_USERS = {
            'admin': { 
                password: 'admin123',
                isAdmin: true,
                fullName: 'Administrator',
                email: 'admin@prestigio.com'
            },
            'user': { 
                password: 'password',
                isAdmin: false,
                fullName: 'Demo User',
                email: 'user@prestigio.com'
            },
            'demo': { 
                password: 'demo123',
                isAdmin: false,
                fullName: 'Demo User',
                email: 'demo@prestigio.com'
            },
            'prestigio': { 
                password: 'luxury2024',
                isAdmin: false,
                fullName: 'Prestigio User',
                email: 'prestigio@prestigio.com'
            },
            'test': { 
                password: 'test123',
                isAdmin: false,
                fullName: 'Test User',
                email: 'test@prestigio.com'
            },
            'marwan': { 
                password: 'marwan123',
                isAdmin: false,
                fullName: 'Marwan',
                email: 'marwan@prestigio.com'
            }
        };
        
        if (DEMO_USERS[username] && DEMO_USERS[username].password === password) {
            const demoUser = DEMO_USERS[username];
            log(`✅ Demo login successful for user: ${username}`);
            return res.json({
                success: true,
                message: 'Login successful',
                user: {
                    username,
                    fullName: demoUser.fullName,
                    email: demoUser.email,
                    isAdmin: demoUser.isAdmin
                }
            });
        }
        
        log(`❌ Login failed for user: ${username}`);
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
        
    } catch (error) {
        log('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
});

// Mount chat routes
app.use('/api/chatbot', chatRoutes);

// Legacy chat endpoint (keeping for backward compatibility)
app.post('/api/chat', async (req, res) => {
    log('=== CHAT REQUEST ===');
    log('Headers:', req.headers);
    log('Body:', req.body);
    
    try {
        if (!req.body || !Array.isArray(req.body.messages)) {
            log('Invalid request format. Expected { messages: [...] }');
            return res.status(400).json({ 
                error: 'Invalid request format. Expected { messages: [...] }' 
            });
        }

        const { messages } = req.body;
        
        const systemMessage = {
            role: "system",
            content: "You are a helpful concierge for Prestigio Motors, a luxury car dealership in Al Obour City, Egypt. " +
                    "Contact: +2 01098613073, prestegioautomobiles@gmail.com. " +
                    "Provide helpful, professional, and friendly responses to customer inquiries. " +
                    "If you don't know the answer, offer to connect them with a human representative. " +
                    "Keep responses concise but informative. Hours: Mon-Sat 9AM-8PM, Sun 11AM-6PM."
        };

        const messagesToSend = [systemMessage, ...messages];
        
        log(`🤖 Trying AI providers...`);
        
        // Use our new AI helper function
        const aiResponse = await getChatResponse(messagesToSend);
        
        log(`✅ ${aiResponse.provider.toUpperCase()} Response received using ${aiResponse.model}`);
        
        res.json({ 
            response: {
                role: 'assistant',
                content: aiResponse.content
            },
            model: aiResponse.model,
            provider: aiResponse.provider,
            usage: {}
        });
        
    } catch (error) {
        log('=== ALL AI PROVIDERS FAILED ===');
        log('Error message:', error.message);
        
        let responseType = 'default';
        
        // Try to determine the context for a better fallback
        const lastMessage = req.body.messages?.[req.body.messages.length - 1]?.content?.toLowerCase() || '';
        
        if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('hey')) {
            responseType = 'greeting';
        } else if (lastMessage.includes('car') || lastMessage.includes('vehicle') || lastMessage.includes('model')) {
            responseType = 'vehicles';
        } else if (lastMessage.includes('price') || lastMessage.includes('cost') || lastMessage.includes('how much')) {
            responseType = 'pricing';
        } else if (lastMessage.includes('contact') || lastMessage.includes('call') || lastMessage.includes('email')) {
            responseType = 'contact';
        }
        
        const fallbackMessage = getFallbackResponse(responseType);
        
        res.json({ 
            response: {
                role: 'assistant',
                content: `⚠️ ${fallbackMessage}`,
                isFallback: true
            },
            model: 'fallback',
            provider: 'fallback',
            usage: {}
        });
    }
});

// Serve the frontend index.html for the root path
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'frontend', 'index.html');
    if (fs.existsSync(indexPath)) {
        log('Serving frontend index.html');
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ error: 'Frontend index.html not found' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        ai_providers: {
            openai_configured: !!process.env.OPENAI_API_KEY,
            gemini_configured: !!process.env.GEMINI_API_KEY
        },
        databases: {
            mongodb_configured: !!process.env.MONGODB_URI
        },
        email_configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
    });
});

// Seed database with car data
app.post('/api/cars/seed', async (req, res) => {
    try {
        log('=== SEEDING CAR DATABASE ===');
        
        // Clear existing cars
        await Car.deleteMany({});
        log('🗑️ Cleared existing car data');
        
        let totalCars = 0;
        
        // Process luxury cars
        for (const [brandKey, brandData] of Object.entries(luxuryCarData)) {
            for (const car of brandData.cars) {
                const newCar = new Car({
                    name: car.name,
                    brand: brandData.name,
                    category: 'luxury',
                    image: car.image,
                    info: car.info,
                    price: car.price,
                    brandLogo: brandData.logo
                });
                
                await newCar.save();
                totalCars++;
            }
        }
        
        log(`✅ Added ${totalCars} luxury cars`);
        
        // Process regular cars
        let regularCount = 0;
        for (const [brandKey, brandData] of Object.entries(regularCarData)) {
            for (const car of brandData.cars) {
                const newCar = new Car({
                    name: car.name,
                    brand: brandData.name,
                    category: 'regular',
                    image: car.image,
                    info: car.info,
                    price: car.price,
                    brandLogo: brandData.logo,
                    brandFlag: brandData.flag
                });
                
                await newCar.save();
                regularCount++;
            }
        }
        
        log(`✅ Added ${regularCount} regular cars`);
        totalCars += regularCount;
        
        res.json({
            success: true,
            message: `Successfully seeded database with ${totalCars} cars`,
            data: {
                luxuryCars: totalCars - regularCount,
                regularCars: regularCount,
                totalCars: totalCars
            }
        });
        
    } catch (error) {
        log('❌ Error seeding car database:', error);
        res.status(500).json({
            success: false,
            message: 'Error seeding car database',
            error: error.message
        });
    }
});

// Get all cars by category
app.get('/api/cars/:category', async (req, res) => {
    try {
        const { category } = req.params;
        
        if (!['luxury', 'regular'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Category must be "luxury" or "regular"'
            });
        }
        
        const cars = await Car.findByCategory(category);
        
        res.json({
            success: true,
            category: category,
            count: cars.length,
            cars: cars
        });
        
    } catch (error) {
        log('❌ Error fetching cars:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cars',
            error: error.message
        });
    }
});

// Get cars by brand
app.get('/api/cars/brand/:brand', async (req, res) => {
    try {
        const { brand } = req.params;
        const { category } = req.query;
        
        const cars = await Car.findByBrand(brand, category);
        
        res.json({
            success: true,
            brand: brand,
            category: category || 'all',
            count: cars.length,
            cars: cars
        });
        
    } catch (error) {
        log('❌ Error fetching cars by brand:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cars by brand',
            error: error.message
        });
    }
});

// Search cars
app.get('/api/cars/search/:searchTerm', async (req, res) => {
    try {
        const { searchTerm } = req.params;
        const { category } = req.query;
        
        const cars = await Car.search(searchTerm, category);
        
        res.json({
            success: true,
            searchTerm: searchTerm,
            category: category || 'all',
            count: cars.length,
            cars: cars
        });
        
    } catch (error) {
        log('❌ Error searching cars:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching cars',
            error: error.message
        });
    }
});

// Get all cars with stats
app.get('/api/cars/stats', async (req, res) => {
    try {
        const luxuryCars = await Car.countDocuments({ category: 'luxury', isActive: true });
        const regularCars = await Car.countDocuments({ category: 'regular', isActive: true });
        const totalCars = luxuryCars + regularCars;
        
        const brands = await Car.distinct('brand');
        
        res.json({
            success: true,
            stats: {
                totalCars: totalCars,
                luxuryCars: luxuryCars,
                regularCars: regularCars,
                totalBrands: brands.length,
                brands: brands.sort()
            }
        });
        
    } catch (error) {
        log('❌ Error fetching car stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching car statistics',
            error: error.message
        });
    }
});

// Debug endpoint to check registered users
app.get('/api/debug/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username email fullName createdAt lastLogin').sort({ createdAt: -1 });
        const userCount = users.length;
        const userList = users.map(user => user.username);
        
        log('=== DEBUG: Registered Users (Database) ===');
        log(`Total users: ${userCount}`);
        log(`Usernames: ${userList.join(', ')}`);
        
        res.json({
            totalUsers: userCount,
            usernames: userList,
            registeredUsers: users.reduce((acc, user) => {
                acc[user.username] = {
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                };
                return acc;
            }, {})
        });
    } catch (error) {
        log('❌ Debug users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user data from database'
        });
    }
});

// ===== ADMIN CRUD ENDPOINTS =====

// Get all cars (for admin)
app.get('/api/admin/cars', async (req, res) => {
    try {
        const cars = await Car.find({}).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: cars.length,
            cars: cars
        });
    } catch (error) {
        log('❌ Error fetching all cars:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cars',
            error: error.message
        });
    }
});

// Get single car by ID
app.get('/api/admin/cars/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }
        res.json({
            success: true,
            car: car
        });
    } catch (error) {
        log('❌ Error fetching car:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching car',
            error: error.message
        });
    }
});

// Create new car
app.post('/api/admin/cars', async (req, res) => {
    try {
        const carData = req.body;
        const newCar = new Car(carData);
        const savedCar = await newCar.save();
        
        log('✅ New car created:', savedCar.name);
        res.status(201).json({
            success: true,
            message: 'Car created successfully',
            car: savedCar
        });
    } catch (error) {
        log('❌ Error creating car:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating car',
            error: error.message
        });
    }
});

// Update car
app.put('/api/admin/cars/:id', async (req, res) => {
    try {
        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedCar) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }
        
        log('✅ Car updated:', updatedCar.name);
        res.json({
            success: true,
            message: 'Car updated successfully',
            car: updatedCar
        });
    } catch (error) {
        log('❌ Error updating car:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating car',
            error: error.message
        });
    }
});

// Delete car
app.delete('/api/admin/cars/:id', async (req, res) => {
    try {
        const deletedCar = await Car.findByIdAndDelete(req.params.id);
        
        if (!deletedCar) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }
        
        log('✅ Car deleted:', deletedCar.name);
        res.json({
            success: true,
            message: 'Car deleted successfully',
            car: deletedCar
        });
    } catch (error) {
        log('❌ Error deleting car:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting car',
            error: error.message
        });
    }
});

// Get all users (for admin)
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        log('❌ Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// Get single user by ID
app.get('/api/admin/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id, '-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        log('❌ Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
});

// Update user
app.put('/api/admin/users/:id', async (req, res) => {
    try {
        const { password, ...updateData } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true, select: '-password' }
        );
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        log('✅ User updated:', updatedUser.username);
        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        log('❌ Error updating user:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

// Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        log('✅ User deleted:', deletedUser.username);
        res.json({
            success: true,
            message: 'User deleted successfully',
            user: { username: deletedUser.username, email: deletedUser.email }
        });
    } catch (error) {
        log('❌ Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

// Get dashboard stats
app.get('/api/admin/dashboard-stats', async (req, res) => {
    try {
        const totalCars = await Car.countDocuments({ isActive: true });
        const luxuryCars = await Car.countDocuments({ category: 'luxury', isActive: true });
        const regularCars = await Car.countDocuments({ category: 'regular', isActive: true });
        const totalUsers = await User.countDocuments({ isActive: true });
        const brands = await Car.distinct('brand');
        
        // Recent activity
        const recentCars = await Car.find({}).sort({ createdAt: -1 }).limit(5);
        const recentUsers = await User.find({}, '-password').sort({ createdAt: -1 }).limit(5);
        
        res.json({
            success: true,
            stats: {
                totalCars,
                luxuryCars,
                regularCars,
                totalUsers,
                totalBrands: brands.length,
                brands: brands.sort()
            },
            recent: {
                cars: recentCars,
                users: recentUsers
            }
        });
    } catch (error) {
        log('❌ Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
});

// ===== CONTACT REQUESTS API =====

// Submit new contact request
app.post('/api/contact-requests', async (req, res) => {
    try {
        const { service, problem } = req.body;

        // Validation
        if (!service || !problem) {
            return res.status(400).json({
                success: false,
                message: 'Service and problem description are required.'
            });
        }

        // Validate service type
        const validServices = [
            'luxury-cars', 'regular-cars', 'car-customization',
            'financing', 'maintenance', 'insurance', 'trade-in', 'general'
        ];
        
        if (!validServices.includes(service)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service type selected.'
            });
        }

        // Validate problem length
        if (problem.trim().length < 10 || problem.trim().length > 2000) {
            return res.status(400).json({
                success: false,
                message: 'Problem description must be between 10 and 2000 characters.'
            });
        }

        // Determine priority based on service and keywords
        const problemLower = problem.toLowerCase();
        let priority = 'medium';
        
        const urgentKeywords = ['urgent', 'emergency', 'broken', 'accident', 'crash', 'stolen', 'fire'];
        if (urgentKeywords.some(keyword => problemLower.includes(keyword))) {
            priority = 'urgent';
        } else if (service === 'luxury-cars' || ['payment', 'finance', 'insurance', 'delivery', 'warranty'].some(keyword => problemLower.includes(keyword))) {
            priority = 'high';
        } else if (service === 'general') {
            priority = 'low';
        }
        
        // Create contact request object
        const contactRequest = {
            service,
            problem: problem.trim(),
            priority,
            status: 'pending',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            sessionId: req.sessionID || `session_${Date.now()}`,
            timestamp: new Date().toISOString()
        };

        // Try to save to MongoDB if available
        if (mongoose.connection.readyState === 1) {
            const Contact = require('./models/Contact');
            const savedRequest = await Contact.create(contactRequest);
            
            log(`✅ Contact request saved to MongoDB: ${savedRequest._id}`);
            
            res.status(201).json({
                success: true,
                message: 'Contact request submitted successfully!',
                data: {
                    id: savedRequest._id,
                    service: savedRequest.service,
                    status: savedRequest.status,
                    priority: savedRequest.priority,
                    createdAt: savedRequest.createdAt
                }
            });
        } else {
            // Fallback to JSON file storage
            const fs = require('fs');
            const path = require('path');
            const contactsFile = path.join(__dirname, 'contact-requests.json');
            
            let contacts = [];
            try {
                if (fs.existsSync(contactsFile)) {
                    contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
                }
            } catch (error) {
                log('Error reading contacts file:', error);
            }
            
            const newContact = {
                id: Date.now(),
                ...contactRequest,
                createdAt: new Date().toISOString()
            };
            
            contacts.push(newContact);
            
            try {
                fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));
                log(`✅ Contact request saved to file: ${newContact.id}`);
                
                res.status(201).json({
                    success: true,
                    message: 'Contact request submitted successfully!',
                    data: {
                        id: newContact.id,
                        service: newContact.service,
                        status: newContact.status,
                        priority: newContact.priority,
                        createdAt: newContact.createdAt
                    }
                });
            } catch (error) {
                log('Error saving contact request to file:', error);
                throw error;
            }
        }

    } catch (error) {
        log('❌ Error submitting contact request:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all contact requests (admin)
app.get('/api/contact-requests', async (req, res) => {
    try {
        const { status, service, priority, page = 1, limit = 20 } = req.query;
        
        if (mongoose.connection.readyState === 1) {
            const Contact = require('./models/Contact');
            
            // Build filter object
            const filter = {};
            if (status) filter.status = status;
            if (service) filter.service = service;
            if (priority) filter.priority = priority;

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get requests with pagination
            const requests = await Contact.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Contact.countDocuments(filter);

            res.json({
                success: true,
                data: {
                    requests,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / parseInt(limit)),
                        total,
                        hasNext: skip + requests.length < total,
                        hasPrev: parseInt(page) > 1
                    }
                }
            });
        } else {
            // Fallback to JSON file
            const fs = require('fs');
            const path = require('path');
            const contactsFile = path.join(__dirname, 'contact-requests.json');
            
            let contacts = [];
            try {
                if (fs.existsSync(contactsFile)) {
                    contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
                }
            } catch (error) {
                log('Error reading contacts file:', error);
            }
            
            // Apply filters
            if (status) contacts = contacts.filter(c => c.status === status);
            if (service) contacts = contacts.filter(c => c.service === service);
            if (priority) contacts = contacts.filter(c => c.priority === priority);
            
            // Sort by creation date (newest first)
            contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            // Apply pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const paginatedContacts = contacts.slice(skip, skip + parseInt(limit));
            
            res.json({
                success: true,
                data: {
                    requests: paginatedContacts,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(contacts.length / parseInt(limit)),
                        total: contacts.length,
                        hasNext: skip + paginatedContacts.length < contacts.length,
                        hasPrev: parseInt(page) > 1
                    }
                }
            });
        }

    } catch (error) {
        log('❌ Error fetching contact requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact requests.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get contact request statistics
app.get('/api/contact-requests/stats', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const Contact = require('./models/Contact');
            
            const stats = await Contact.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const serviceStats = await Contact.aggregate([
                {
                    $group: {
                        _id: '$service',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const priorityStats = await Contact.aggregate([
                {
                    $group: {
                        _id: '$priority',
                        count: { $sum: 1 }
                    }
                }
            ]);

            res.json({
                success: true,
                data: {
                    statusStats: stats,
                    serviceStats,
                    priorityStats,
                    totalRequests: await Contact.countDocuments()
                }
            });
        } else {
            // File-based stats
            const fs = require('fs');
            const path = require('path');
            const contactsFile = path.join(__dirname, 'contact-requests.json');
            
            let contacts = [];
            try {
                if (fs.existsSync(contactsFile)) {
                    contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
                }
            } catch (error) {
                log('Error reading contacts file:', error);
            }
            
            const statusStats = contacts.reduce((acc, contact) => {
                acc[contact.status] = (acc[contact.status] || 0) + 1;
                return acc;
            }, {});
            
            const serviceStats = contacts.reduce((acc, contact) => {
                acc[contact.service] = (acc[contact.service] || 0) + 1;
                return acc;
            }, {});
            
            const priorityStats = contacts.reduce((acc, contact) => {
                acc[contact.priority] = (acc[contact.priority] || 0) + 1;
                return acc;
            }, {});
            
            res.json({
                success: true,
                data: {
                    statusStats: Object.entries(statusStats).map(([_id, count]) => ({ _id, count })),
                    serviceStats: Object.entries(serviceStats).map(([_id, count]) => ({ _id, count })),
                    priorityStats: Object.entries(priorityStats).map(([_id, count]) => ({ _id, count })),
                    totalRequests: contacts.length
                }
            });
        }

    } catch (error) {
        log('❌ Error fetching contact stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact statistics.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Seed database with sample data
app.post('/api/admin/seed-database', async (req, res) => {
    try {
        // Sample luxury cars - Complete collection from your luxury cars page
        const luxuryCars = [
            // Bugatti
            { name: "Chiron", brand: "Bugatti", category: "luxury", price: "$3,000,000", image: "images/2017-Bugatti-Chiron-009-2160.jpg", info: "1500 HP, 8.0L W16 Engine | Quad-turbo masterpiece | 0-60 mph in 2.4 seconds", year: 2023, specifications: { engine: "8.0L W16 Quad-Turbo", power: "1500 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Carbon Fiber Monocoque", "Active Aerodynamics", "Michelin Pilot Sport Cup 2", "Luxury Interior"], isActive: true, featured: true },
            { name: "Veyron", brand: "Bugatti", category: "luxury", price: "$3,300,000", image: "images/2015-Bugatti-Veyron-Grand-Sport-Vitesse-La-Finale-001-1600.jpg", info: "1500 HP, 8.0L W16 Engine | Legendary hypercar | Top speed 267 mph", year: 2015, specifications: { engine: "8.0L W16 Quad-Turbo", power: "1500 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Titanium Exhaust", "Carbon Fiber Body", "Michelin PAX Tires", "Luxury Leather"], isActive: true, featured: true },
            { name: "Divo", brand: "Bugatti", category: "luxury", price: "$5,800,000", image: "images/2019-Bugatti-Divo-007-2160.jpg", info: "1500 HP, 8.0L W16 Engine | Track-focused hypercar | Limited to 40 units", year: 2019, specifications: { engine: "8.0L W16 Quad-Turbo", power: "1500 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Enhanced Aerodynamics", "Weight Reduction", "Track Suspension", "Exclusive Design"], isActive: true, featured: true },
            { name: "La Voiture Noire", brand: "Bugatti", category: "luxury", price: "$18,700,000", image: "images/images.jpg", info: "1500 HP, 8.0L W16 Engine | One-off tribute to Type 57 SC Atlantic | Most expensive car ever", year: 2019, specifications: { engine: "8.0L W16 Quad-Turbo", power: "1500 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Unique Design", "Handcrafted Interior", "Carbon Fiber Body", "Exclusive Heritage"], isActive: true, featured: true },
            { name: "Bolide", brand: "Bugatti", category: "luxury", price: "$4,000,000", image: "images/1-Bugatti-Bolide-review-2025.jpg", info: "1825 HP, 8.0L W16 Engine | Track-only hypercar | Extreme performance", year: 2024, specifications: { engine: "8.0L W16 Quad-Turbo", power: "1825 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Track-Only Design", "Extreme Aerodynamics", "Lightweight Construction", "Racing Technology"], isActive: true, featured: true },

            // Rolls-Royce
            { name: "Phantom", brand: "Rolls-Royce", category: "luxury", price: "$450,000", image: "images/01_RR_PHANTOM-single-twin-card-min.jpg", info: "563 HP, 6.75L V12 Engine | Ultimate luxury sedan | Whisper-quiet cabin", year: 2023, specifications: { engine: "6.75L V12 Twin-Turbo", power: "563 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Magic Carpet Ride", "Starlight Headliner", "Bespoke Interior", "Self-Leveling Suspension"], isActive: true, featured: true },
            { name: "Ghost", brand: "Rolls-Royce", category: "luxury", price: "$350,000", image: "images/2015-Rolls-Royce-Ghost-Series-II-001-1600.jpg", info: "563 HP, 6.75L V12 Engine | Contemporary luxury | Effortless performance", year: 2023, specifications: { engine: "6.75L V12 Twin-Turbo", power: "563 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Planar Suspension", "Illuminated Grille", "Whispers App", "Bespoke Audio"], isActive: true, featured: false },
            { name: "Cullinan", brand: "Rolls-Royce", category: "luxury", price: "$330,000", image: "images/P90344238-rolls-royce-cullinan-2250px.jpg", info: "563 HP, 6.75L V12 Engine | Luxury SUV | All-terrain capability", year: 2023, specifications: { engine: "6.75L V12 Twin-Turbo", power: "563 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Air Suspension", "Viewing Suite", "Recreation Module"], isActive: true, featured: false },
            { name: "Wraith", brand: "Rolls-Royce", category: "luxury", price: "$330,000", image: "images/2014-Rolls-Royce-Wraith-005-1600.jpg", info: "624 HP, 6.75L V12 Engine | Grand tourer coupe | Fastback silhouette", year: 2021, specifications: { engine: "6.75L V12 Twin-Turbo", power: "624 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Satellite Aided Transmission", "Starlight Headliner", "Suicide Doors", "Bespoke Audio"], isActive: true, featured: false },
            { name: "Spectre", brand: "Rolls-Royce", category: "luxury", price: "$420,000", image: "images/2026-Rolls-Royce-Spectre-Black-Badge-001-2000.jpg", info: "577 HP, Electric | First electric Rolls-Royce | Ultra-luxury EV", year: 2024, specifications: { engine: "Dual Electric Motors", power: "577 HP", transmission: "Single-Speed", fuelType: "Electric" }, features: ["400+ Mile Range", "Spirit of Ecstasy", "Planar Suspension", "Whisper Quiet"], isActive: true, featured: true },

            // Bentley
            { name: "Continental GT", brand: "Bentley", category: "luxury", price: "$220,000", image: "images/01_RR_PHANTOM-single-twin-card-min.jpg", info: "626 HP, 6.0L W12 Engine | Grand touring coupe | Handcrafted luxury", year: 2023, specifications: { engine: "6.0L W12 Twin-Turbo", power: "626 HP", transmission: "8-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Air Suspension", "Rotating Display", "Diamond Quilted Leather"], isActive: true, featured: false },
            { name: "Bentayga", brand: "Bentley", category: "luxury", price: "$180,000", image: "images/bentayga.jpg", info: "542 HP, 4.0L V8 Engine | Luxury SUV | Fastest SUV when launched", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "542 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Air Suspension", "Bentley Dynamic Ride", "Mulliner Specification"], isActive: true, featured: false },
            { name: "Flying Spur", brand: "Bentley", category: "luxury", price: "$214,000", image: "images/flying spur.jpg", info: "626 HP, 6.0L W12 Engine | Luxury sedan | Four-door grand tourer", year: 2023, specifications: { engine: "6.0L W12 Twin-Turbo", power: "626 HP", transmission: "8-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Active Anti-Roll Bars", "Rotating Display", "Naim Audio"], isActive: true, featured: false },
            { name: "Mulsanne", brand: "Bentley", category: "luxury", price: "$335,000", image: "images/2017-Bentley-Mulsanne-Speed-001-2000.jpg", info: "505 HP, 6.75L V8 Engine | Flagship sedan | Hand-built luxury", year: 2020, specifications: { engine: "6.75L V8 Twin-Turbo", power: "505 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Rear-Wheel Drive", "Entertainment Tablets", "Champagne Cooler", "Mulliner Interior"], isActive: true, featured: false },
            { name: "Batur", brand: "Bentley", category: "luxury", price: "$2,500,000", image: "images/batur.jpg", info: "740 HP, 6.0L W12 Twin-Turbocharged | Limited edition coupe | Bespoke design", year: 2023, specifications: { engine: "6.0L W12 Twin-Turbo", power: "740 HP", transmission: "8-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Carbon Fiber Body", "3D Printed Elements", "Bespoke Interior", "Limited to 18 Units"], isActive: true, featured: true },

            // Ferrari
            { name: "SF90 Stradale", brand: "Ferrari", category: "luxury", price: "$625,000", image: "images/sf90.jpg", info: "986 HP, Hybrid V8 Engine | Plug-in hybrid supercar | 0-60 mph in 2.5 seconds", year: 2023, specifications: { engine: "4.0L V8 + Electric Motors", power: "986 HP", transmission: "8-Speed Dual-Clutch", fuelType: "Hybrid" }, features: ["All-Wheel Drive", "Electric Mode", "Active Aerodynamics", "Carbon Fiber"], isActive: true, featured: true },
            { name: "F8 Tributo", brand: "Ferrari", category: "luxury", price: "$276,000", image: "images/f8.jpg", info: "710 HP, 3.9L V8 Engine | Mid-engine masterpiece | Track-bred performance", year: 2022, specifications: { engine: "3.9L V8 Twin-Turbo", power: "710 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Side-Slip Control", "Dynamic Enhancer", "Carbon Fiber", "Ferrari Dynamic Enhancer"], isActive: true, featured: false },
            { name: "Roma", brand: "Ferrari", category: "luxury", price: "$222,000", image: "images/roma.jpg", info: "612 HP, 3.9L V8 Engine | Grand touring coupe | Italian elegance", year: 2023, specifications: { engine: "3.9L V8 Twin-Turbo", power: "612 HP", transmission: "8-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Retractable Hardtop", "8.4-inch Touchscreen", "Manettino Dial", "Luxury Interior"], isActive: true, featured: false },
            { name: "LaFerrari", brand: "Ferrari", category: "luxury", price: "$3,000,000", image: "images/laferrari.jpg", info: "950 HP, Hybrid V12 Engine | Limited production hypercar | Formula 1 technology", year: 2015, specifications: { engine: "6.3L V12 + Electric Motor", power: "950 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Hybrid" }, features: ["KERS System", "Carbon Fiber Monocoque", "Active Aerodynamics", "F1 Technology"], isActive: true, featured: true },
            { name: "812 Superfast", brand: "Ferrari", category: "luxury", price: "$340,000", image: "images/superfast.jpg", info: "789 HP, 6.5L V12 Engine | Front-engine V12 | Pure naturally aspirated power", year: 2022, specifications: { engine: "6.5L V12", power: "789 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Rear-Wheel Steering", "Side-Slip Control", "Carbon Fiber", "Virtual Short Wheelbase"], isActive: true, featured: false },

            // Lamborghini
            { name: "Aventador", brand: "Lamborghini", category: "luxury", price: "$500,000", image: "images/aventador.jpg", info: "770 HP, 6.5L V12 Engine | Flagship supercar | Scissor doors", year: 2022, specifications: { engine: "6.5L V12", power: "770 HP", transmission: "7-Speed Single-Clutch", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Scissor Doors", "Carbon Fiber Monocoque", "Active Aerodynamics"], isActive: true, featured: true },
            { name: "Huracán", brand: "Lamborghini", category: "luxury", price: "$260,000", image: "images/huracan.jpg", info: "640 HP, 5.2L V10 Engine | Entry-level supercar | Perfect balance", year: 2023, specifications: { engine: "5.2L V10", power: "640 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Dynamic Steering", "Anima Drive Modes", "Carbon Fiber"], isActive: true, featured: false },
            { name: "Urus", brand: "Lamborghini", category: "luxury", price: "$220,000", image: "images/urus.jpg", info: "650 HP, 4.0L V8 Engine | Super SUV | Fastest SUV in the world", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "650 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Air Suspension", "Torque Vectoring", "Off-Road Modes"], isActive: true, featured: false },
            { name: "Revuelto", brand: "Lamborghini", category: "luxury", price: "$600,000", image: "images/revuelto.jpg", info: "1001 HP, Hybrid V12 Engine | New flagship | Electrified V12", year: 2024, specifications: { engine: "6.5L V12 + Electric Motors", power: "1001 HP", transmission: "8-Speed Dual-Clutch", fuelType: "Hybrid" }, features: ["All-Wheel Drive", "Electric Front Axle", "Active Aerodynamics", "Carbon Fiber"], isActive: true, featured: true },
            { name: "Sian", brand: "Lamborghini", category: "luxury", price: "$3,600,000", image: "images/sian.jpg", info: "819 HP, Hybrid V12 Engine | Limited edition | Supercapacitor technology", year: 2020, specifications: { engine: "6.5L V12 + Supercapacitor", power: "819 HP", transmission: "7-Speed Single-Clutch", fuelType: "Hybrid" }, features: ["Supercapacitor", "All-Wheel Drive", "Active Aerodynamics", "Exclusive Design"], isActive: true, featured: true },

            // McLaren
            { name: "720S", brand: "McLaren", category: "luxury", price: "$299,000", image: "images/720s.jpg", info: "710 HP, 4.0L V8 Engine | Super Series | Carbon fiber monocoque", year: 2022, specifications: { engine: "4.0L V8 Twin-Turbo", power: "710 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Carbon Fiber Monocoque", "Active Aerodynamics", "Proactive Chassis Control", "Dihedral Doors"], isActive: true, featured: false },
            { name: "Artura", brand: "McLaren", category: "luxury", price: "$225,000", image: "images/artura.jpg", info: "671 HP, Hybrid V6 Engine | New generation hybrid | Carbon fiber architecture", year: 2023, specifications: { engine: "3.0L V6 + Electric Motor", power: "671 HP", transmission: "8-Speed Dual-Clutch", fuelType: "Hybrid" }, features: ["Hybrid Powertrain", "Carbon Fiber Monocoque", "Adaptive Dampers", "Electric Mode"], isActive: true, featured: false },
            { name: "Senna", brand: "McLaren", category: "luxury", price: "$1,000,000", image: "images/senna.jpg", info: "789 HP, 4.0L V8 Engine | Track-focused hypercar | Ultimate Series", year: 2019, specifications: { engine: "4.0L V8 Twin-Turbo", power: "789 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Extreme Aerodynamics", "Carbon Fiber Body", "Track Suspension", "Lightweight Design"], isActive: true, featured: true },
            { name: "P1", brand: "McLaren", category: "luxury", price: "$1,500,000", image: "images/p1.jpg", info: "903 HP, Hybrid V8 Engine | Legendary hypercar | Formula 1 technology", year: 2015, specifications: { engine: "3.8L V8 + Electric Motor", power: "903 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Hybrid" }, features: ["KERS System", "Active Aerodynamics", "Carbon Fiber Monocoque", "DRS System"], isActive: true, featured: true },
            { name: "765LT", brand: "McLaren", category: "luxury", price: "$358,000", image: "images/765lt.jpg", info: "755 HP, 4.0L V8 Engine | Longtail series | Track-focused", year: 2021, specifications: { engine: "4.0L V8 Twin-Turbo", power: "755 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Longtail Aerodynamics", "Weight Reduction", "Track Suspension", "Carbon Fiber"], isActive: true, featured: false },

            // Porsche
            { name: "911 Turbo S", brand: "Porsche", category: "luxury", price: "$216,000", image: "images/911_.jpg", info: "640 HP, 3.8L Flat-6 Engine | Iconic sports car | All-wheel drive", year: 2023, specifications: { engine: "3.8L Flat-6 Twin-Turbo", power: "640 HP", transmission: "8-Speed PDK", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Sport Chrono Package", "Ceramic Brakes", "Adaptive Suspension"], isActive: true, featured: false },
            { name: "Taycan", brand: "Porsche", category: "luxury", price: "$185,000", image: "images/Porsche-Taycan-Performance.jpg", info: "750 HP, Electric | First electric Porsche | Instant torque", year: 2023, specifications: { engine: "Dual Electric Motors", power: "750 HP", transmission: "2-Speed", fuelType: "Electric" }, features: ["800V Architecture", "Fast Charging", "Air Suspension", "Sport Chrono"], isActive: true, featured: false },
            { name: "Panamera", brand: "Porsche", category: "luxury", price: "$179,000", image: "images/panamera_.jpg", info: "620 HP, 4.0L V8 Engine | Luxury sedan | Sports car comfort", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "620 HP", transmission: "8-Speed PDK", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Air Suspension", "Rear-Wheel Steering", "Sport Chrono"], isActive: true, featured: false },
            { name: "Cayenne", brand: "Porsche", category: "luxury", price: "$180,000", image: "images/cayenne--coupe.jpg", info: "670 HP, 4.0L V8 Engine | Performance SUV | Sports car DNA", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "670 HP", transmission: "8-Speed Tiptronic", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Air Suspension", "Torque Vectoring", "Off-Road Package"], isActive: true, featured: false },
            { name: "918 Spyder", brand: "Porsche", category: "luxury", price: "$1,500,000", image: "images/918_Spyder.jpg", info: "887 HP, Hybrid V8 Engine | Hypercar trilogy | Nürburgring record holder", year: 2015, specifications: { engine: "4.6L V8 + Electric Motors", power: "887 HP", transmission: "7-Speed PDK", fuelType: "Hybrid" }, features: ["All-Wheel Drive", "Active Aerodynamics", "Carbon Fiber Monocoque", "Weissach Package"], isActive: true, featured: true },

            // Aston Martin
            { name: "DBS Superleggera", brand: "Aston Martin", category: "luxury", price: "$316,000", image: "images/DBS_Superleggera.jpg", info: "715 HP, 5.2L V12 Engine | Grand tourer | British elegance", year: 2022, specifications: { engine: "5.2L V12 Twin-Turbo", power: "715 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Carbon Fiber Body", "Adaptive Dampers", "Limited Slip Differential", "Bang & Olufsen Audio"], isActive: true, featured: false },
            { name: "Vantage", brand: "Aston Martin", category: "luxury", price: "$142,000", image: "images/Vantage.jpg", info: "503 HP, 4.0L V8 Engine | Sports car | Pure driving experience", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "503 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Rear-Wheel Drive", "Electronic Differential", "Adaptive Dampers", "Sport Plus Mode"], isActive: true, featured: false },
            { name: "DBX", brand: "Aston Martin", category: "luxury", price: "$176,000", image: "images/DBX.jpg", info: "542 HP, 4.0L V8 Engine | Luxury SUV | First Aston Martin SUV", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "542 HP", transmission: "9-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Air Suspension", "Terrain Response", "48V Mild Hybrid"], isActive: true, featured: false },
            { name: "DB11", brand: "Aston Martin", category: "luxury", price: "$205,000", image: "images/DB11.jpg", info: "630 HP, 5.2L V12 Engine | Grand tourer | Aeroblade technology", year: 2022, specifications: { engine: "5.2L V12 Twin-Turbo", power: "630 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["AeroBlade", "Adaptive Dampers", "Carbon Fiber Driveshaft", "Luxury Interior"], isActive: true, featured: false },
            { name: "Valkyrie", brand: "Aston Martin", category: "luxury", price: "$3,000,000", image: "images/Valkyrie.jpg", info: "1160 HP, Hybrid V12 Engine | F1-derived hypercar | Adrian Newey design", year: 2023, specifications: { engine: "6.5L V12 + Electric Motor", power: "1160 HP", transmission: "7-Speed Single-Clutch", fuelType: "Hybrid" }, features: ["F1 Technology", "Carbon Fiber Monocoque", "Active Aerodynamics", "Cosworth V12"], isActive: true, featured: true },

            // Maserati
            { name: "MC20", brand: "Maserati", category: "luxury", price: "$212,000", image: "images/mc20.jpg", info: "621 HP, 3.0L V6 Engine | Mid-engine supercar | Nettuno engine", year: 2023, specifications: { engine: "3.0L V6 Twin-Turbo", power: "621 HP", transmission: "8-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Carbon Fiber Monocoque", "Butterfly Doors", "Launch Control", "Track Telemetry"], isActive: true, featured: false },
            { name: "Levante", brand: "Maserati", category: "luxury", price: "$153,000", image: "images/levante.jpg", info: "580 HP, 3.8L V8 Engine | Luxury SUV | Italian craftsmanship", year: 2023, specifications: { engine: "3.8L V8 Twin-Turbo", power: "580 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Air Suspension", "Skyhook Dampers", "Harman Kardon Audio"], isActive: true, featured: false },
            { name: "Quattroporte", brand: "Maserati", category: "luxury", price: "$142,000", image: "images/quattroporte.jpg", info: "580 HP, 3.8L V8 Engine | Luxury sedan | Executive comfort", year: 2022, specifications: { engine: "3.8L V8 Twin-Turbo", power: "580 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Rear-Wheel Drive", "Skyhook Suspension", "Bowers & Wilkins Audio", "Luxury Interior"], isActive: true, featured: false },
            { name: "Ghibli", brand: "Maserati", category: "luxury", price: "$75,000", image: "images/ghibli.jpg", info: "345 HP, 3.0L V6 Engine | Sports sedan | Entry-level luxury", year: 2023, specifications: { engine: "3.0L V6 Twin-Turbo", power: "345 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Rear-Wheel Drive", "Sport Mode", "Harman Kardon Audio", "Leather Interior"], isActive: true, featured: false },
            { name: "GranTurismo", brand: "Maserati", category: "luxury", price: "$175,000", image: "images/granturismo.jpg", info: "490 HP, 3.0L V6 Engine | Grand tourer | Elegant design", year: 2024, specifications: { engine: "3.0L V6 Twin-Turbo", power: "490 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Rear-Wheel Drive", "Adaptive Suspension", "Premium Audio", "Convertible Option"], isActive: true, featured: false },

            // Mercedes-Benz
            { name: "S-Class", brand: "Mercedes-Benz", category: "luxury", price: "$110,000", image: "images/sclass.jpg", info: "496 HP, 4.0L V8 Engine | Flagship sedan | Ultimate luxury", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "496 HP", transmission: "9-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["AIRMATIC Suspension", "MBUX Interior Assistant", "Burmester Audio", "Executive Rear Seating"], isActive: true, featured: false },
            { name: "AMG GT", brand: "Mercedes-Benz", category: "luxury", price: "$180,000", image: "images/amg.jpg", info: "720 HP, 4.0L V8 Engine | High-performance coupe | AMG engineering", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "720 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["AMG Performance 4MATIC+", "Active Aerodynamics", "AMG Track Pace", "Carbon Fiber"], isActive: true, featured: false },
            { name: "G-Class", brand: "Mercedes-Benz", category: "luxury", price: "$156,000", image: "images/gclass.jpg", info: "577 HP, 4.0L V8 Engine | Iconic SUV | Off-road capability", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "577 HP", transmission: "9-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Three Differential Locks", "MBUX System", "Luxury Interior"], isActive: true, featured: false },
            { name: "EQS AMG", brand: "Mercedes-Benz", category: "luxury", price: "$150,000", image: "images/eqs.jpg", info: "751 HP, Electric | Luxury electric sedan | Silent performance", year: 2023, specifications: { engine: "Dual Electric Motors", power: "751 HP", transmission: "Single-Speed", fuelType: "Electric" }, features: ["450+ Mile Range", "MBUX Hyperscreen", "Air Suspension", "Fast Charging"], isActive: true, featured: false },
            { name: "SL 63", brand: "Mercedes-Benz", category: "luxury", price: "$180,000", image: "images/sl63.jpg", info: "577 HP, 4.0L V8 Engine | Luxury roadster | Open-top performance", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "577 HP", transmission: "9-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["AMG Performance 4MATIC+", "Fabric Soft Top", "AMG Ride Control", "Burmester Audio"], isActive: true, featured: false },

            // BMW
            { name: "M8 Competition", brand: "BMW", category: "luxury", price: "$140,000", image: "images/m8.jpg", info: "617 HP, 4.4L V8 Engine | High-performance coupe | M Division engineering", year: 2023, specifications: { engine: "4.4L V8 Twin-Turbo", power: "617 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["M xDrive", "Active M Differential", "Carbon Fiber Roof", "Harman Kardon Audio"], isActive: true, featured: false },
            { name: "X7", brand: "BMW", category: "luxury", price: "$120,000", image: "images/x7.jpg", info: "523 HP, 4.4L V8 Engine | Flagship SUV | Seven-seat luxury", year: 2023, specifications: { engine: "4.4L V8 Twin-Turbo", power: "523 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["xDrive All-Wheel Drive", "Air Suspension", "Panoramic Sunroof", "Bowers & Wilkins Audio"], isActive: true, featured: false },
            { name: "i8", brand: "BMW", category: "luxury", price: "$147,000", image: "images/i8.jpg", info: "369 HP, Hybrid | Plug-in hybrid sports car | Futuristic design", year: 2020, specifications: { engine: "1.5L I3 + Electric Motor", power: "369 HP", transmission: "6-Speed Automatic", fuelType: "Hybrid" }, features: ["Butterfly Doors", "Carbon Fiber Body", "Laser Headlights", "Electric Mode"], isActive: true, featured: false },
            { name: "M5 CS", brand: "BMW", category: "luxury", price: "$143,000", image: "images/m5cs.jpg", info: "627 HP, 4.4L V8 Engine | Track-focused sedan | Limited edition", year: 2022, specifications: { engine: "4.4L V8 Twin-Turbo", power: "627 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["M xDrive", "Carbon Fiber Components", "Michelin Cup 2 Tires", "Alcantara Interior"], isActive: true, featured: false },
            { name: "XM", brand: "BMW", category: "luxury", price: "$160,000", image: "images/xm.jpg", info: "644 HP, Hybrid V8 Engine | Performance SUV | M Division hybrid", year: 2023, specifications: { engine: "4.4L V8 + Electric Motor", power: "644 HP", transmission: "8-Speed Automatic", fuelType: "Hybrid" }, features: ["M xDrive", "Air Suspension", "Bowers & Wilkins Audio", "Carbon Fiber Trim"], isActive: true, featured: false },

            // Audi
            { name: "R8", brand: "Audi", category: "luxury", price: "$168,000", image: "images/R8.jpg", info: "602 HP, 5.2L V10 Engine | Mid-engine supercar | Quattro all-wheel drive", year: 2023, specifications: { engine: "5.2L V10", power: "602 HP", transmission: "7-Speed Dual-Clutch", fuelType: "Premium Gasoline" }, features: ["Quattro All-Wheel Drive", "Magnetic Ride", "Virtual Cockpit", "Bang & Olufsen Audio"], isActive: true, featured: false },
            { name: "e-tron GT", brand: "Audi", category: "luxury", price: "$140,000", image: "images/etron.jpg", info: "637 HP, Electric | Electric grand tourer | Instant torque", year: 2023, specifications: { engine: "Dual Electric Motors", power: "637 HP", transmission: "2-Speed", fuelType: "Electric" }, features: ["Quattro Electric AWD", "Air Suspension", "800V Architecture", "Premium Plus Interior"], isActive: true, featured: false },
            { name: "RS7", brand: "Audi", category: "luxury", price: "$118,000", image: "images/RS7.jpg", info: "591 HP, 4.0L V8 Engine | Performance sportback | Mild hybrid", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "591 HP", transmission: "8-Speed Tiptronic", fuelType: "Premium Gasoline" }, features: ["Quattro All-Wheel Drive", "Sport Differential", "48V Mild Hybrid", "Matrix LED Headlights"], isActive: true, featured: false },
            { name: "RS Q8", brand: "Audi", category: "luxury", price: "$125,000", image: "images/RS_Q8.jpg", info: "591 HP, 4.0L V8 Engine | Performance SUV | Coupe styling", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "591 HP", transmission: "8-Speed Tiptronic", fuelType: "Premium Gasoline" }, features: ["Quattro All-Wheel Drive", "Air Suspension", "Sport Differential", "Bang & Olufsen Audio"], isActive: true, featured: false },
            { name: "RS6 Avant", brand: "Audi", category: "luxury", price: "$110,000", image: "images/RS6_Avant.jpg", info: "591 HP, 4.0L V8 Engine | Performance wagon | Practical supercar", year: 2023, specifications: { engine: "4.0L V8 Twin-Turbo", power: "591 HP", transmission: "8-Speed Tiptronic", fuelType: "Premium Gasoline" }, features: ["Quattro All-Wheel Drive", "Sport Differential", "48V Mild Hybrid", "Dynamic Ride Control"], isActive: true, featured: false },

            // Lexus
            { name: "LC 500", brand: "Lexus", category: "luxury", price: "$93,000", image: "images/lc500.jpg", info: "471 HP, 5.0L V8 Engine | Grand touring coupe | Japanese luxury", year: 2023, specifications: { engine: "5.0L V8", power: "471 HP", transmission: "10-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Rear-Wheel Drive", "Adaptive Variable Suspension", "Mark Levinson Audio", "Luxury Interior"], isActive: true, featured: false },
            { name: "LS 500", brand: "Lexus", category: "luxury", price: "$77,000", image: "images/ls500.jpg", info: "416 HP, 3.5L V6 Engine | Flagship sedan | Hybrid available", year: 2023, specifications: { engine: "3.5L V6 Twin-Turbo", power: "416 HP", transmission: "10-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Air Suspension", "Kiriko Glass Trim", "28-Speaker Audio"], isActive: true, featured: false },
            { name: "LX 600", brand: "Lexus", category: "luxury", price: "$86,000", image: "images/lx600.jpg", info: "409 HP, 3.5L V6 Engine | Luxury SUV | Off-road capability", year: 2023, specifications: { engine: "3.5L V6 Twin-Turbo", power: "409 HP", transmission: "10-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Full-Time 4WD", "Multi-Terrain Select", "Crawl Control", "Mark Levinson Audio"], isActive: true, featured: false },
            { name: "LFA", brand: "Lexus", category: "luxury", price: "$500,000", image: "images/lfa.jpg", info: "552 HP, 4.8L V10 Engine | Limited production supercar | Yamaha-tuned exhaust", year: 2012, specifications: { engine: "4.8L V10", power: "552 HP", transmission: "6-Speed Sequential", fuelType: "Premium Gasoline" }, features: ["Carbon Fiber Body", "Sequential Transmission", "Yamaha Exhaust", "Limited to 500 Units"], isActive: true, featured: true },
            { name: "IS 500 F Sport", brand: "Lexus", category: "luxury", price: "$60,000", image: "images/is500.jpg", info: "472 HP, 5.0L V8 Engine | Performance sedan | Naturally aspirated V8", year: 2023, specifications: { engine: "5.0L V8", power: "472 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Rear-Wheel Drive", "Torsen Limited-Slip Differential", "Brembo Brakes", "F Sport Suspension"], isActive: true, featured: false },

            // Jaguar
            { name: "F-Type", brand: "Jaguar", category: "luxury", price: "$103,000", image: "images/ftype.jpg", info: "575 HP, 5.0L V8 Engine | Sports car | British performance", year: 2023, specifications: { engine: "5.0L V8 Supercharged", power: "575 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Adaptive Dynamics", "Meridian Audio", "Convertible Available"], isActive: true, featured: false },
            { name: "I-PACE", brand: "Jaguar", category: "luxury", price: "$69,000", image: "images/ipace.jpg", info: "394 HP, Electric | Electric SUV | Zero emissions luxury", year: 2023, specifications: { engine: "Dual Electric Motors", power: "394 HP", transmission: "Single-Speed", fuelType: "Electric" }, features: ["All-Wheel Drive", "Air Suspension", "Meridian Audio", "292-Mile Range"], isActive: true, featured: false },
            { name: "XJ", brand: "Jaguar", category: "luxury", price: "$87,000", image: "images/xj.jpg", info: "470 HP, 5.0L V8 Engine | Luxury sedan | Aluminum architecture", year: 2019, specifications: { engine: "5.0L V8 Supercharged", power: "470 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Rear-Wheel Drive", "Adaptive Dynamics", "Meridian Audio", "Aluminum Body"], isActive: true, featured: false },
            { name: "XF", brand: "Jaguar", category: "luxury", price: "$45,000", image: "images/xf.jpg", info: "246 HP, 2.0L I4 Engine | Executive sedan | Efficient luxury", year: 2023, specifications: { engine: "2.0L I4 Turbo", power: "246 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Rear-Wheel Drive", "InControl Touch Pro", "Meridian Audio", "LED Headlights"], isActive: true, featured: false },
            { name: "E-PACE", brand: "Jaguar", category: "luxury", price: "$45,000", image: "images/epace.jpg", info: "246 HP, 2.0L I4 Engine | Compact SUV | Agile performance", year: 2023, specifications: { engine: "2.0L I4 Turbo", power: "246 HP", transmission: "9-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Terrain Response", "Touch Pro Duo", "Activity Key"], isActive: true, featured: false },

            // Land Rover
            { name: "Range Rover Vogue", brand: "Land Rover", category: "luxury", price: "$120,000", image: "images/vogue.jpg", info: "606 HP, SV Bespoke V8 (Supercharged) | Ultimate luxury SUV | Off-road capability", year: 2023, specifications: { engine: "5.0L V8 Supercharged", power: "606 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Terrain Response 2", "Air Suspension", "Meridian Audio", "Wade Sensing"], isActive: true, featured: false },
            { name: "Defender", brand: "Land Rover", category: "luxury", price: "$90,000", image: "images/defender.jpg", info: "518 HP, 5.0L V8 Engine | Iconic off-roader | Modern capability", year: 2023, specifications: { engine: "5.0L V8 Supercharged", power: "518 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Terrain Response", "Wade Depth 35.4 inches", "ClearSight Ground View", "Configurable Terrain Response"], isActive: true, featured: false },
            { name: "Range Rover Sport", brand: "Land Rover", category: "luxury", price: "$83,000", image: "images/sport.jpg", info: "523 HP, 4.4L V8 Engine | Performance SUV | Dynamic capability", year: 2023, specifications: { engine: "4.4L V8 Twin-Turbo", power: "523 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Dynamic Response Pro", "Terrain Response 2", "Air Suspension", "Meridian Audio"], isActive: true, featured: false },
            { name: "Range Rover Velar", brand: "Land Rover", category: "luxury", price: "$60,000", image: "images/Velar.jpg", info: "247 HP, 2.0L I4 Engine | Design-focused SUV | Minimalist luxury", year: 2023, specifications: { engine: "2.0L I4 Turbo", power: "247 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["All-Wheel Drive", "Touch Pro Duo", "Matrix LED Headlights", "Flush Door Handles"], isActive: true, featured: false },
            { name: "Discovery", brand: "Land Rover", category: "luxury", price: "$60,000", image: "images/Discovery.jpg", info: "355 HP, 3.0L I6 Engine | Family SUV | Seven-seat capability", year: 2023, specifications: { engine: "3.0L I6 Supercharged", power: "355 HP", transmission: "8-Speed Automatic", fuelType: "Premium Gasoline" }, features: ["Terrain Response", "Intelligent Seat Fold", "Activity Key", "Wade Sensing"], isActive: true, featured: false }
        ];

        // Sample regular cars - Complete collection from your regular cars page
        const regularCars = [
            // Toyota
            { name: "Camry", brand: "Toyota", category: "regular", price: "$26,000-$35,000", image: "/api/placeholder/600/400", info: "Midsize sedan, 2.5L I4 (203 HP) or 3.5L V6 (301 HP)", price: "$26K-35K" },
            { name: "Corolla", brand: "Toyota", category: "regular", price: "$21,000-$28,000", image: "/api/placeholder/600/400", info: "Compact sedan or hatchback, 2.0L I4 (169 HP)", price: "$21K-28K" },
            { name: "RAV4", brand: "Toyota", category: "regular", price: "$28,000-$38,000", image: "/api/placeholder/600/400", info: "Compact SUV, 2.5L I4 (203 HP) or hybrid (219 HP)", price: "$28K-38K" },
            { name: "Highlander", brand: "Toyota", category: "regular", price: "$36,000-$52,000", image: "/api/placeholder/600/400", info: "Midsize SUV, 2.4L I4 (265 HP) or hybrid (243 HP)", price: "$36K-52K" },
            { name: "Prius", brand: "Toyota", category: "regular", price: "$25,000-$34,000", image: "/api/placeholder/600/400", info: "Hybrid compact car, 1.8L I4 (121 HP) or plug-in hybrid (220 HP)", price: "$25K-34K" }
        ];

        // Sample users
        const sampleUsers = [
            {
                username: "john_doe", email: "john.doe@email.com", password: "password123", fullName: "John Doe",
                phone: "+1-555-0101", address: "123 Main St, New York, NY 10001", age: 32, gender: "male", nationality: "American", isActive: true
            },
            {
                username: "sarah_wilson", email: "sarah.wilson@email.com", password: "password123", fullName: "Sarah Wilson",
                phone: "+1-555-0102", address: "456 Oak Ave, Los Angeles, CA 90210", age: 28, gender: "female", nationality: "American", isActive: true
            },
            {
                username: "mike_johnson", email: "mike.johnson@email.com", password: "password123", fullName: "Michael Johnson",
                phone: "+1-555-0103", address: "789 Pine St, Chicago, IL 60601", age: 35, gender: "male", nationality: "American", isActive: true
            }
        ];

        // Clear existing data and indexes
        await Car.collection.drop().catch(() => {}); // Drop collection to remove indexes
        await User.deleteMany({});

        // Insert sample data
        const insertedLuxuryCars = await Car.insertMany(luxuryCars);
        const insertedRegularCars = await Car.insertMany(regularCars);
        const insertedUsers = await User.insertMany(sampleUsers);

        log('✅ Database seeded successfully');
        res.json({
            success: true,
            message: 'Database seeded successfully',
            data: {
                luxuryCars: insertedLuxuryCars.length,
                regularCars: insertedRegularCars.length,
                users: insertedUsers.length,
                totalCars: insertedLuxuryCars.length + insertedRegularCars.length
            }
        });

    } catch (error) {
        log('❌ Error seeding database:', error);
        res.status(500).json({
            success: false,
            message: 'Error seeding database',
            error: error.message
        });
    }
});

// ===== ORDER ENDPOINTS =====

// Create new order
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        log('Received order data:', orderData);
        
        // Generate order ID
        const orderId = `ORD-${Date.now()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        
        // Process customizations data
        const customizations = [];
        let customizationTotal = 0;
        if (orderData.customizations) {
            Object.keys(orderData.customizations).forEach(category => {
                const customization = orderData.customizations[category];
                if (customization && customization.price > 0) {
                    customizations.push({
                        name: customization.name,
                        category: category,
                        price: customization.price,
                        description: `${category} upgrade: ${customization.name}`
                    });
                    customizationTotal += customization.price;
                }
            });
        }
        
        // Create order object
        const orderObject = {
            orderId: orderId,
            orderDate: new Date(),
            status: orderData.status || 'confirmed',
            transactionType: orderData.transactionType || 'buy',
            type: orderData.type || 'order',
        };

        // Handle car data differently for appointments vs orders
        if (orderData.type === 'appointment') {
            // For appointments, car data might be in vehicleDetails
            if (orderData.vehicleDetails) {
                orderObject.car = {
                    carId: orderData.vehicleDetails.carId || null,
                    name: orderData.vehicleDetails.carName || 'N/A',
                    brand: 'N/A',
                    basePrice: orderData.vehicleDetails.basePrice?.toString() || '0',
                    image: orderData.vehicleDetails.image || null
                };
            } else {
                orderObject.car = {
                    carId: null,
                    name: 'N/A',
                    brand: 'N/A',
                    basePrice: '0',
                    image: null
                };
            }
            
            // Add appointment-specific data
            orderObject.appointment = orderData.appointment;
        } else {
            // For regular orders
            orderObject.car = {
                carId: orderData.car?.id || null,
                name: orderData.car?.name || 'N/A',
                brand: orderData.car?.brand || 'N/A',
                basePrice: orderData.car?.basePrice || orderData.pricing?.basePrice?.toString() || '0',
                image: orderData.car?.image || null
            };
        }

        // Continue with the rest of the order object
        orderObject.customizations = customizations;
        orderObject.pricing = {
            basePrice: orderData.pricing?.basePrice || 0,
            customizationPrice: orderData.pricing?.customizationPrice || customizationTotal,
            totalPrice: orderData.pricing?.totalPrice || orderData.totalPrice || 0
        };
        
        // Legacy fields for compatibility
        orderObject.basePrice = orderData.pricing?.basePrice || 0;
        orderObject.customizationTotal = customizationTotal;
        orderObject.totalPrice = orderData.pricing?.totalPrice || orderData.totalPrice || 0;
        
        orderObject.customer = {
            firstName: orderData.customer?.firstName || '',
            lastName: orderData.customer?.lastName || '',
            name: orderData.customer?.name || `${orderData.customer?.firstName || ''} ${orderData.customer?.lastName || ''}`.trim(),
            email: orderData.customer?.email || '',
            phone: orderData.customer?.phone || '',
            address: orderData.customer?.address || null
        };
        
        if (orderData.type !== 'appointment') {
            orderObject.payment = {
                method: orderData.payment?.method || 'cash',
                status: 'pending',
                cardLast4: orderData.payment?.cardLastFour || null
            };
            orderObject.notes = orderData.specialRequests || '';
        }
        
                 orderObject.emailSent = false;

        // Add rental-specific data if this is a rental
        if (orderData.transactionType === 'rent' && orderData.rental) {
            orderObject.rental = {
                duration: orderData.rental.duration,
                pickupDate: orderData.rental.pickupDate,
                returnDate: orderData.rental.returnDate,
                dailyRate: orderData.rental.dailyRate
            };
        }

        // Try to save to database if connected, otherwise save to file
        let order = null;
        try {
            if (mongoose.connection.readyState === 1) {
                // Database is connected
                order = new Order(orderObject);
                await order.save();
                log('Order saved to database successfully:', order.orderId);
            } else {
                throw new Error('Database not connected');
            }
        } catch (dbError) {
            log('Database save failed, saving to file instead:', dbError.message);
            
            // Save to file as backup
            const fs = require('fs');
            const ordersFile = path.join(__dirname, 'orders.json');
            let orders = [];
            
            try {
                if (fs.existsSync(ordersFile)) {
                    const data = fs.readFileSync(ordersFile, 'utf8');
                    orders = JSON.parse(data);
                }
            } catch (fileError) {
                log('Error reading orders file:', fileError.message);
                orders = [];
            }
            
            orders.push(orderObject);
            fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
            log('Order saved to file successfully:', orderId);
            
            order = orderObject; // Use the object directly
        }

        // Send confirmation email
        try {
            await sendOrderConfirmationEmail(order);
            if (order.save) {
                order.emailSent = true;
                await order.save();
            }
            log('Confirmation email sent successfully');
        } catch (emailError) {
            log('Email sending failed:', emailError);
            // Continue with order processing even if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            orderId: order.orderId || orderId,
            order: {
                orderId: order.orderId || orderId,
                car: order.car,
                totalPrice: order.totalPrice,
                status: order.status,
                customizations: order.customizations
            }
        });

    } catch (error) {
        log('Error creating order:', error);
        log('Error details:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to place order. Please try again.',
            error: error.message
        });
    }
});

// Get order by ID
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findOne({ orderId }).populate('car.carId');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        log('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
});

// Get all orders (admin only)
app.get('/api/admin/orders', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let orders = [];
        let totalOrders = 0;

        try {
            if (mongoose.connection.readyState === 1) {
                // Database is connected
                orders = await Order.find()
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('car.carId');

                totalOrders = await Order.countDocuments();
            } else {
                throw new Error('Database not connected');
            }
        } catch (dbError) {
            log('Database read failed, reading from file instead:', dbError.message);
            
            // Read from file as backup
            const fs = require('fs');
            const ordersFile = path.join(__dirname, 'orders.json');
            
            try {
                if (fs.existsSync(ordersFile)) {
                    const data = fs.readFileSync(ordersFile, 'utf8');
                    const allOrders = JSON.parse(data);
                    totalOrders = allOrders.length;
                    orders = allOrders
                        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                        .slice(skip, skip + limit);
                } else {
                    orders = [];
                    totalOrders = 0;
                }
            } catch (fileError) {
                log('Error reading orders file:', fileError.message);
                orders = [];
                totalOrders = 0;
            }
        }

        res.status(200).json({
            success: true,
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                totalOrders,
                hasNext: page < Math.ceil(totalOrders / limit),
                hasPrev: page > 1
            }
        });

    } catch (error) {
        log('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
});

// Update order status
app.put('/api/admin/orders/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, trackingNumber } = req.body;

        const order = await Order.findOne({ orderId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }

        await order.save();

        // Send status update email
        try {
            await sendStatusUpdateEmail(order);
        } catch (emailError) {
            log('Status update email failed:', emailError);
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        });

    } catch (error) {
        log('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
});

// Email endpoint
app.post('/api/send-email', async (req, res) => {
    try {
        log('📧 Email endpoint called with:', req.body);
        
        const { to, subject, type, data } = req.body;

        if (!to || !subject || !type || !data) {
            log('❌ Missing required fields for email');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: to, subject, type, data'
            });
        }

        if (type === 'appointment') {
            log('📧 Sending appointment confirmation email to:', to);
            
            try {
                const { sendAppointmentConfirmationEmail } = require('./src/utils/emailService');
                await sendAppointmentConfirmationEmail(to, data);
                
                log('✅ Appointment confirmation email sent successfully');
                res.status(200).json({
                    success: true,
                    message: 'Appointment confirmation email sent successfully'
                });
            } catch (emailError) {
                log('❌ Email service error:', emailError);
                throw emailError;
            }
        } else {
            log('❌ Unsupported email type:', type);
            res.status(400).json({
                success: false,
                message: 'Unsupported email type'
            });
        }

    } catch (error) {
        log('❌ Error in email endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
});

// Email helper functions
async function sendOrderConfirmationEmail(order) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        log('Email service not configured');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Check if this is a rental or purchase
    const isRental = order.transactionType === 'rent';
    
    // Build customizations list
    let customizationsList = '';
    if (order.customizations && typeof order.customizations === 'object') {
        customizationsList = Object.entries(order.customizations)
            .filter(([key, custom]) => custom && custom.price > 0)
            .map(([key, custom]) => {
                if (isRental) {
                    const dailyCost = Math.round(custom.price / 30);
                    return `<li>${custom.name} - $${dailyCost}/day</li>`;
                } else {
                    return `<li>${custom.name} - $${custom.price.toLocaleString()}</li>`;
                }
            }).join('');
    }

    // Build rental details section
    const rentalDetailsSection = isRental && order.rental ? `
        <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #1a1a1a; margin-bottom: 15px;">Rental Details</h3>
            <p><strong>Duration:</strong> ${order.rental.duration} ${order.rental.duration === 1 ? 'Day' : 'Days'}</p>
            <p><strong>Pickup Date:</strong> ${new Date(order.rental.pickupDate).toLocaleDateString()}</p>
            <p><strong>Return Date:</strong> ${new Date(order.rental.returnDate).toLocaleDateString()}</p>
            <p><strong>Daily Rate:</strong> $${order.rental.dailyRate}/day</p>
        </div>
    ` : '';

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a1a, #333); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #d4af37; margin: 0;">${isRental ? 'Rental' : 'Order'} Confirmation</h1>
                <p style="margin: 10px 0 0 0;">Thank you for your ${isRental ? 'rental booking' : 'purchase'}!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1a1a1a; margin-bottom: 20px;">${isRental ? 'Rental' : 'Order'} Details</h2>
                
                <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <p><strong>${isRental ? 'Rental' : 'Order'} ID:</strong> ${order.orderId}</p>
                    <p><strong>${isRental ? 'Booking' : 'Order'} Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                </div>

                <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #1a1a1a; margin-bottom: 15px;">Vehicle Information</h3>
                    <p><strong>${order.car.brand} ${order.car.name}</strong></p>
                    <p>${isRental ? 'Daily Rate' : 'Base Price'}: $${isRental ? order.pricing.basePrice : order.pricing.basePrice.toLocaleString()}</p>
                </div>

                ${rentalDetailsSection}

                ${customizationsList ? `
                <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #1a1a1a; margin-bottom: 15px;">Customizations</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${customizationsList}
                    </ul>
                </div>
                ` : ''}

                <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #1a1a1a; margin-bottom: 15px;">Customer Information</h3>
                    <p><strong>Name:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
                    <p><strong>Email:</strong> ${order.customer.email}</p>
                    <p><strong>Phone:</strong> ${order.customer.phone}</p>
                </div>

                <div style="background: ${isRental ? '#4ecdc4' : '#d4af37'}; color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h3 style="margin: 0 0 10px 0;">Total ${isRental ? 'Rental Cost' : 'Price'}</h3>
                    <p style="font-size: 24px; font-weight: bold; margin: 0;">$${order.pricing.totalPrice.toLocaleString()}</p>
                </div>

                <div style="margin-top: 30px; text-align: center;">
                    ${isRental ? 
                        `<p style="color: #666;">Please arrive at our location 30 minutes before your pickup time.</p>
                         <p style="color: #666;">Bring a valid driver's license and credit card for security deposit.</p>` :
                        `<p style="color: #666;">We will contact you soon with delivery details.</p>`
                    }
                    <p style="color: #666;">If you have any questions, please contact our support team.</p>
                    <p style="color: #666;"><strong>Contact:</strong> +2 01098613073 | prestegioautomobiles@gmail.com</p>
                </div>
            </div>
        </div>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.customer.email,
        subject: `${isRental ? 'Rental Booking' : 'Order'} Confirmation - ${order.orderId}`,
        html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    log(`${isRental ? 'Rental' : 'Order'} confirmation email sent to ${order.customer.email}`);
}

async function sendStatusUpdateEmail(order) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        log('Email service not configured');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a1a1a, #333); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #d4af37; margin: 0;">Order Update</h1>
                <p style="margin: 10px 0 0 0;">Your order status has been updated</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Vehicle:</strong> ${order.car.brand} ${order.car.name}</p>
                    <p><strong>New Status:</strong> <span style="color: #d4af37; font-weight: bold;">${order.status}</span></p>
                    ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
                </div>

                <div style="margin-top: 30px; text-align: center;">
                    <p style="color: #666;">Thank you for choosing us!</p>
                </div>
            </div>
        </div>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.customer.email,
        subject: `Order Update - ${order.orderId}`,
        html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    log(`Status update email sent to ${order.customer.email}`);
}

// Serve static files from the frontend directory BEFORE API routes
const frontendPath = path.join(__dirname, '..', 'frontend');
if (fs.existsSync(frontendPath)) {
    log(`✅ Serving static files from: ${frontendPath}`);
    app.use(express.static(frontendPath));
} else {
    log(`❌ Frontend directory not found: ${frontendPath}`);
}

// Serve 3D models from the models directory
const modelsPath = path.join(__dirname, '..', 'models');
if (fs.existsSync(modelsPath)) {
    log(`✅ Serving 3D models from: ${modelsPath}`);
    app.use('/models', express.static(modelsPath));
} else {
    log(`❌ Models directory not found: ${modelsPath}`);
}


// Function to check if a port is available
const isPortAvailable = (port) => {
    return new Promise((resolve) => {
        const server = require('http').createServer()
            .listen(port, () => {
                server.close();
                resolve(true);
            })
            .on('error', () => {
                resolve(false);
            });
    });
};

// Function to find the next available port
const findAvailablePort = async (startPort, maxAttempts = 10) => {
    let port = startPort;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        const available = await isPortAvailable(port);
        if (available) {
            return port;
        }
        port++;
        attempts++;
    }
    throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
};

// Function to start the server
const startServer = async () => {
    try {
        // Test OpenAI connection
        await testAIConnections();
        
        // Connect to MongoDB (optional)
        await connectDB();
        
        // Setup Email Service (optional)
        global.transporter = setupEmailService();
        
        // Find available port
        const startPort = parseInt(process.env.PORT, 10) || 5000;
        const port = await findAvailablePort(startPort);
        
        const server = app.listen(port, '0.0.0.0', () => {
            log(`✅ Server is running on port ${port}`);
            log('🌍 Environment:', process.env.NODE_ENV || 'development');
            log('🚀 Available endpoints:');
            log(`   POST http://localhost:${port}/api/chat`);
            log(`   GET  http://localhost:${port}/`);
            log(`   GET  http://localhost:${port}/health`);
            
            // Update the port in the environment variables
            process.env.PORT = port.toString();
        });

        // Handle server errors
        server.on('error', (error) => {
            log('❌ Server error:', error);
            process.exit(1);
        });

        // Handle process termination
        const exitHandler = (signal) => {
            log(`\n🚨 Received ${signal}. Shutting down gracefully...`);
            server.close(() => {
                log('💤 Server closed');
                logStream.end();
                process.exit(0);
            });
        };
        // These routes are already defined above, removing duplicates
        // Handle different termination signals
        process.on('SIGTERM', () => exitHandler('SIGTERM'));
        process.on('SIGINT', () => exitHandler('SIGINT'));
        process.on('SIGQUIT', () => exitHandler('SIGQUIT'));

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            log('❌ Unhandled Rejection:', err);
            server.close(() => process.exit(1));
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            log('❌ Uncaught Exception:', err);
            server.close(() => process.exit(1));
        });

    } catch (error) {
        log('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Serve car customizer from root level for compatibility
app.get('/car-customizer.html', (req, res) => {
    const customizerPath = path.join(frontendPath, 'pages', 'car-customizer.html');
    if (fs.existsSync(customizerPath)) {
        log(`Serving car customizer: ${req.path}`);
        res.sendFile(customizerPath);
    } else {
        log(`Car customizer not found: ${customizerPath}`);
        res.status(404).json({ error: 'Car customizer not found' });
    }
});

// Fallback route for SPA (Single Page Application)
app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For all other requests, serve index.html (SPA fallback)
    const indexPath = path.join(frontendPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
        log(`Serving index.html for route: ${req.path}`);
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ error: 'Frontend files not found' });
    }
});

// Start the server
startServer();