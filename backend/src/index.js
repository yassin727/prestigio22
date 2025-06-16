require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const hpp = require('hpp');
const xss = require('xss-clean');
const csurf = require('csurf');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const carRoutes = require('./routes/car.routes');
const configurationRoutes = require('./routes/configuration.routes');
const orderRoutes = require('./routes/order.routes');
const chatRoutes = require('./routes/chat.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security middleware
const cspDefaults = helmet.contentSecurityPolicy.getDefaultDirectives();
const cspDirectives = {
  ...cspDefaults,
  'script-src': [
    "'self'",
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
    "'unsafe-inline'", // Required for some inline scripts
    "'unsafe-eval'"    // Required for some libraries like Three.js
  ],
  'img-src': [
    "'self'",
    'data:',
    'https: data:'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net'
  ],
  'connect-src': [
    "'self'",
    'http://localhost:5000',
    'ws://localhost:5000'
  ]
};

app.use(helmet({
  contentSecurityPolicy: { directives: cspDirectives }
}));

app.use(hpp());
app.use(xss());
app.use(compression());
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['set-cookie']
};
app.use(cors(corsOptions));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'prestigio.sid'
};
app.use(session(sessionConfig));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CSRF protection setup
const csrfProtection = csurf({
  cookie: {
    key: '_csrf',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 86400 // 24 hours
  }
});

// Apply CSRF protection to non-API routes
app.use((req, res, next) => {
  // Skip CSRF for API routes and CSRF token endpoint
  if (req.path.startsWith('/api/')) {
    // For the CSRF token endpoint, we need to generate a token
    if (req.path === '/api/csrf-token') {
      return csrfProtection(req, res, next);
    }
    return next();
  }
  csrfProtection(req, res, next);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Logging middleware
app.use(morgan('dev', { stream: logger.stream }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../../frontend')));

// Serve static files from the backend public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers
    });
    next();
});

// Set security headers
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data: https:; " +
        "connect-src 'self' http://localhost:5000;"
    );
    next();
});

// CSRF token endpoint - must be after CSRF middleware
app.get('/api/csrf-token', (req, res) => {
  try {
    const token = req.csrfToken();
    console.log('Generated CSRF token:', token);
    res.cookie('XSRF-TOKEN', token, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Allow JavaScript to read this cookie
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ csrfToken: token });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Failed to generate CSRF token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/configurations', configurationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Session check endpoint
app.get('/api/check-session', (req, res) => {
    if (req.session.user) {
        res.json({
            authenticated: true,
            username: req.session.user.username,
            isAdmin: req.session.user.isAdmin
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Protected route middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../../frontend')));

// Root route - serve the main index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Route for login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/login.html'));
});

// Route for registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/registration.html'));
});

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Please provide both username and password' });
    }

    try {
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin
        };

        const redirectUrl = user.isAdmin ? '/admin/dashboard' : '/car-selection.html';
        res.json({ success: true, redirect: redirectUrl });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
});

// Logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error logging out' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    });
});

// Protected routes
app.get('/car-selection.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/car-selection.html'));
});

app.get('/admin/dashboard', requireAuth, (req, res) => {
    if (!req.session.user.isAdmin) {
        return res.redirect('/car-selection.html');
    }
    res.sendFile(path.join(__dirname, '../../frontend/pages/admin/dashboard.html'));
});

// Frontend routes
app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/registration.html'));
});

app.get('/customer-service', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/customerservice.html'));
});

app.get('/finance', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/finance.html'));
});

app.get('/luxury-cars', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/luxurycars.html'));
});

app.get('/new-arrivals', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/newarrivals.html'));
});

app.get('/regular-cars', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/regularcars.html'));
});

app.get('/special-editions', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/specialeditions.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/contact.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/forgotpassword.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/terms.html'));
});

// Handle all other routes by serving the frontend index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Add CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ token: req.csrfToken() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Admin API endpoints
app.get('/api/admin/cars', async (req, res, next) => {
    try {
        // In a real app, this would fetch from database
        res.json({
            success: true,
            cars: [
                { id: 'PRS1001', make: 'Ferrari', model: '488 GTB', type: 'Exotic', year: 2022, price: 275000, status: 'Available', image: 'images/ferrari488.jpg' },
                { id: 'PRS1002', make: 'Porsche', model: '911 Turbo S', type: 'Exotic', year: 2023, price: 203500, status: 'Available', image: 'images/porsche911.jpg' },
                { id: 'PRS1003', make: 'Lamborghini', model: 'Huracan', type: 'Exotic', year: 2021, price: 261274, status: 'Reserved', image: 'images/huracan.jpg' },
                { id: 'PRS2001', make: 'Toyota', model: 'Camry', type: 'Regular', year: 2023, price: 28000, status: 'Available', image: 'images/camry.jpg' },
                { id: 'PRS2002', make: 'Honda', model: 'Civic', type: 'Regular', year: 2022, price: 24000, status: 'Sold', image: 'images/civic.jpg' }
            ]
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/admin/customers', async (req, res, next) => {
    try {
        // In a real app, this would fetch from database
        res.json({
            success: true,
            customers: [
                { id: 'CUS1001', name: 'Elie George', email: 'elie4423@gmail.com', phone: '01024583457', vehicles: 3, lastPurchase: '2023-05-15' },
                { id: 'CUS1002', name: 'Sarah Magdy', email: 'sarahss2@gmail.com', phone: '01232457898', vehicles: 1, lastPurchase: '2023-06-22' },
                { id: 'CUS1003', name: 'Ahmed Ismael', email: 'Ahmed33@gmail.com', phone: '01123468634', vehicles: 2, lastPurchase: '2023-04-10' },
                { id: 'CUS1004', name: 'Islam Ahmed', email: 'islam223@gmail.com', phone: '01092832404', vehicles: 0, lastPurchase: null }
            ]
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/admin/orders', async (req, res, next) => {
    try {
        // In a real app, this would fetch from database
        res.json({
            success: true,
            orders: [
                { id: 'ORD1001', customer: 'Elie George', vehicle: 'Ferrari 488 GTB', date: '2023-05-15', status: 'Completed', amount: 275000 },
                { id: 'ORD1002', customer: 'Sarah Magdy', vehicle: 'Porsche 911 Turbo S', date: '2023-06-22', status: 'Processing', amount: 203500 },
                { id: 'ORD1003', customer: 'Ahmed Ismael', vehicle: 'Lamborghini Huracan', date: '2023-04-10', status: 'Pending', amount: 261274 }
            ]
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/admin/messages', async (req, res, next) => {
    try {
        // In a real app, this would fetch from database
        res.json({
            success: true,
            messages: [
                { id: 'MSG1001', from: 'Elie George', email: 'elie4423@gmail.com', date: '2023-06-10', subject: 'Inquiry about Ferrari 488 GTB', read: true },
                { id: 'MSG1002', from: 'Sarah Magdy', email: 'sarahss2@gmail.com', date: '2023-06-18', subject: 'Test drive request', read: false },
                { id: 'MSG1003', from: 'Ahmed Ismael', email: 'Ahmed33@gmail.com', date: '2023-06-22', subject: 'Price quote request', read: false }
            ]
        });
    } catch (error) {
        next(error);
    }
});

// Error handling
app.use(errorHandler);

// Initialize default admin user
async function initializeAdmin() {
    try {
        await User.createDefaultAdmin();
    } catch (error) {
        console.error('Error initializing admin user:', error);
    }
}

// Call initialization after MongoDB connection
mongoose.connection.once('open', () => {
    console.log('MongoDB Connected');
    initializeAdmin();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        logger.info('MongoDB Connected:', process.env.MONGODB_URI);
        
        // Start server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        logger.error('MongoDB connection error:', err);
        process.exit(1);
    }); 