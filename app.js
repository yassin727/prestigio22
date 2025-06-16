require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/database');
const uploadRouter = require('./routes/upload');
const vehicleRouter = require('./routes/vehicles');
const authRoutes = require('./routes/auth');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', requireAuth, uploadRouter);
app.use('/api/vehicles', requireAuth, vehicleRouter);

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle login
app.post('/api/auth/login', (req, res) => {
    // In a real app, validate credentials against database
    const { email, password } = req.body;
    
    // This is a basic example - in production, use proper password hashing
    if (email === 'user@example.com' && password === 'password') {
        req.session.user = { email };
        return res.json({ success: true });
    }
    
    res.status(401).json({ error: 'Invalid credentials' });
});

// Handle logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Check if it's a network error
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return res.status(503).sendFile(path.join(__dirname, 'public', 'error.html'));
    }

    // Check if it's a file system error
    if (err.code === 'ENOENT' || err.code === 'EACCES') {
        return res.status(500).sendFile(path.join(__dirname, 'public', 'error.html'));
    }

    // Handle other errors
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'error.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
}); 