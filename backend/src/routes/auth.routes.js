const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../utils/emailService');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many attempts, please try again after 15 minutes'
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: 'Too many password reset attempts, please try again after an hour'
});

// CSRF protection
const csrfProtection = csrf({ cookie: true });

// Validation middleware
const registerValidation = [
  // Full Name validation
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name can only contain letters, spaces, hyphens, and apostrophes'),
    
  // Email validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email is already registered');
      }
      return true;
    }),

  // Password validation
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),

  // Phone validation
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9\-\+\(\)\s]{8,}$/)
    .withMessage('Please enter a valid phone number'),

  // Address validation
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),

  // Age validation
  body('age')
    .isInt({ min: 18, max: 120 })
    .withMessage('You must be at least 18 years old and not older than 120')
    .toInt(),

  // Gender validation
  body('gender')
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Please select a valid gender'),

  // Nationality validation
  body('nationality')
    .trim()
    .notEmpty()
    .withMessage('Nationality is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Nationality must be between 2 and 50 characters'),

  // Terms and conditions validation
  body('terms')
    .exists()
    .withMessage('You must accept the terms and conditions')
    .isIn(['on'])
    .withMessage('You must accept the terms and conditions')
];

const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const passwordResetValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
];

// Generate a random password
function generatePassword() {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

// Register new user
router.post('/register', registerValidation, validateRequest, async (req, res) => {
    try {
        const { name, email, phone, address, city, age } = req.body;

        // Generate username and password
        const username = await User.generateUsername(name);
        const password = User.generatePassword();

        // Split name into firstName and lastName
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        // Create new user
        const user = new User({
            username,
            name,
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            age,
            password // Will be hashed by pre-save middleware
        });

        // Save user to database
        await user.save();

        // Send welcome email with credentials
        try {
            await sendWelcomeEmail(email, {
                name: firstName,
                username,
                password
            });
        } catch (emailError) {
            logger.error('Error sending welcome email:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for login credentials.'
        });
    } catch (error) {
        logger.error('Registration error:', error);
        
        // Handle specific error types
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                status: 'error',
                message: 'Validation Error',
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                status: 'error',
                message: 'Username already exists'
            });
        }

        res.status(500).json({
            success: false,
            status: 'error',
            message: 'Error in registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login user
router.post('/login', loginValidation, validateRequest, async (req, res) => {
    try {
        logger.info('Login attempt:', { username: req.body.username });
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            logger.warn('Login failed: User not found', { username });
            return res.status(400).json({ 
                success: false,
                message: 'Invalid username or password' 
            });
        }

        // Validate password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            logger.warn('Login failed: Invalid password', { username });
            return res.status(400).json({ 
                success: false,
                message: 'Invalid username or password' 
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = user.generateAuthToken();

        logger.info('Login successful', { 
            username: user.username,
            role: user.role
        });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error in login' 
        });
    }
});

// Profile route
router.get('/profile', authenticate, csrfProtection, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -refreshTokens');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving profile'
        });
    }
});

// Email verification routes
router.get('/verify-email/:token', authController.verifyEmail);

router.post('/resend-verification',
  authenticate,
  csrfProtection,
  authController.resendVerificationEmail
);

// Password recovery routes
router.get('/forgot-password',
  csrfProtection,
  authController.getForgotPasswordPage
);

router.post('/forgot-password',
  passwordResetLimiter,
  csrfProtection,
  body('email').isEmail().normalizeEmail(),
  validateRequest,
  authController.sendPasswordResetEmail
);

router.get('/reset-password/:token',
  csrfProtection,
  authController.getResetPasswordPage
);

router.post('/reset-password/:token',
  passwordResetLimiter,
  csrfProtection,
  passwordResetValidation,
  validateRequest,
  authController.resetPassword
);

// Session management
router.post('/logout',
  authenticate,
  csrfProtection,
  authController.logout
);

router.post('/refresh-token',
  csrfProtection,
  authController.refreshToken
);

module.exports = router; 