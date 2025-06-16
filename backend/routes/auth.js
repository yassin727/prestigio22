const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Existing login route (preserved)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Username and password are required' 
            });
        }

        // Find user by username or email
        const user = await User.findByUsernameOrEmail(username);
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                message: 'Account is disabled' 
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Update last login
        await user.updateLastLogin();

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username,
                email: user.email 
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

        res.json({
            message: 'Login successful',
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
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
});

// Existing register route (preserved)
router.post('/register', async (req, res) => {
    try {
        const { 
            username, 
            email, 
            password, 
            fullName, 
            phone, 
            address, 
            age, 
            gender, 
            nationality 
        } = req.body;

        // Validation
        if (!username || !email || !password || !fullName || !phone || !address || !age || !gender || !nationality) {
            return res.status(400).json({ 
                message: 'All fields are required' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'Username or email already exists' 
            });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password,
            fullName,
            phone,
            address,
            age: parseInt(age),
            gender,
            nationality,
            provider: 'local'
        });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
});

// NEW: Google OAuth Routes
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login.html?error=google_auth_failed' 
    }),
    async (req, res) => {
        try {
            // Generate JWT token for Google user
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

            // Check if user needs to complete profile
            const needsProfile = !req.user.phone || !req.user.address || !req.user.nationality;
            
            if (needsProfile) {
                res.redirect('/complete-profile.html');
            } else {
                res.redirect('/dashboard.html');
            }

        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect('/login.html?error=auth_failed');
        }
    }
);

// NEW: Complete profile for Google OAuth users
router.post('/complete-profile', async (req, res) => {
    try {
        const { phone, address, age, gender, nationality } = req.body;
        
        // Get user from JWT token
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user profile
        user.phone = phone;
        user.address = address;
        user.age = parseInt(age);
        user.gender = gender;
        user.nationality = nationality;

        await user.save();

        res.json({
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
        console.error('Complete profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// NEW: Get current user info
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
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
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Existing logout route (enhanced)
router.post('/logout', (req, res) => {
    try {
        // Clear the auth token cookie
        res.clearCookie('authToken');
        
        // If using Passport sessions, logout from session
        if (req.logout) {
            req.logout((err) => {
                if (err) {
                    console.error('Logout error:', err);
                }
            });
        }

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router; 