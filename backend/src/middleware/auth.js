const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Authentication middleware
exports.authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ message: 'User account is inactive' });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Authorization middleware
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'You do not have permission to perform this action' 
            });
        }
        next();
    };
};

// Optional authentication middleware
exports.optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user && user.isActive) {
            req.user = user;
        }
        next();
    } catch (error) {
        // If token is invalid, continue without user
        next();
    }
};

// Rate limiting middleware
exports.rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
    const requests = new Map();

    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean up old requests
        for (const [key, timestamp] of requests.entries()) {
            if (timestamp < windowStart) {
                requests.delete(key);
            }
        }

        // Count requests in current window
        const requestCount = Array.from(requests.values())
            .filter(timestamp => timestamp > windowStart)
            .length;

        if (requestCount >= max) {
            return res.status(429).json({ 
                message: 'Too many requests, please try again later' 
            });
        }

        // Add current request
        requests.set(ip, now);
        next();
    };
};

// Password validation middleware
exports.validatePassword = async (req, res, next) => {
    try {
        const settings = await Settings.getCurrent();
        const { password } = req.body;

        if (!settings.validatePassword(password)) {
            return res.status(400).json({
                message: 'Password does not meet requirements',
                requirements: {
                    minLength: settings.minPasswordLength,
                    requireUppercase: settings.requireUppercase,
                    requireNumbers: settings.requireNumbers,
                    requireSymbols: settings.requireSymbols
                }
            });
        }

        next();
    } catch (error) {
        logger.error('Password validation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 