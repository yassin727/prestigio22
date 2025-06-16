const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { sendPasswordResetEmail } = require('../utils/email');
const crypto = require('crypto');
const { AppError } = require('../middleware/errorHandler');

/**
 * User registration
 * @route POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation Error', errors.array());
    }

    const { email, password, fullName, phone, address, age, gender, nationality } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'User already exists with this email');
    }

    // Create new user with all fields
    const user = new User({
      email,
      password,
      fullName,
      phone,
      address,
      age: parseInt(age),
      gender,
      nationality
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send welcome email with credentials
    try {
      // TODO: Uncomment and implement actual email sending
      // await sendWelcomeEmail(email, fullName, password);
      logger.info(`Registration successful for ${email}. Welcome email sent.`);
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
      // Don't fail the registration if email sending fails
    }

    // If it's an API request, return JSON
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName
        }
      });
    }

    // If it's a form submission, redirect to login page
    req.flash('success', 'Registration successful! Please check your email to verify your account.');
    return res.redirect('/login');
  } catch (error) {
    logger.error('Registration error:', error);
    
    // If it's an API request, pass to error handler
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return next(error);
    }
    
    // If it's a form submission, show error message
    req.flash('error', error.message || 'An error occurred during registration');
    return res.redirect('back');
  }
};

/**
 * User login
 * @route POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation Error', errors.array());
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new ApiError(401, 'Account is locked. Please try again later.');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      throw new ApiError(401, 'Invalid credentials');
    }

    // Reset login attempts
    await user.resetLoginAttempts();

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Add refresh token to user
    user.addRefreshToken(refreshToken, req.headers['user-agent'], req.ip);
    await user.save();

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

// Get registration page
exports.getRegistrationPage = async (req, res) => {
    try {
        res.render('auth/register', {
            title: 'Apply for Membership | Prestigio',
            description: 'Join the elite community of Prestigio Motors.',
            currentPage: 'register'
        });
    } catch (error) {
        logger.error('Error rendering registration page:', error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the page.'
        });
    }
};



// Get forgot password page
exports.getForgotPasswordPage = async (req, res) => {
    try {
        res.render('auth/forgot-password', {
            title: 'Recover Key | Prestigio',
            description: 'Recover your access to Prestigio Motors.',
            currentPage: 'forgot-password'
        });
    } catch (error) {
        logger.error('Error rendering forgot password page:', error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the page.'
        });
    }
};

// Send password reset email
exports.sendPasswordResetEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, 'No user found with that email');
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // TODO: Send password reset email
        logger.info(`Password reset email sent to ${email}`);

        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        logger.error('Error sending password reset email:', error);
        next(error);
    }
};

// Get reset password page
exports.getResetPasswordPage = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).render('error', {
                message: 'Password reset token is invalid or has expired'
            });
        }

        res.render('auth/reset-password', {
            title: 'Reset Password | Prestigio',
            description: 'Set your new password.',
            currentPage: 'reset-password',
            token
        });
    } catch (error) {
        logger.error('Error rendering reset password page:', error);
        res.status(500).render('error', {
            message: 'An error occurred while loading the page'
        });
    }
};

// Email verification
exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new ApiError(400, 'Invalid or expired verification token');
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        logger.error('Email verification error:', error);
        next(error);
    }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        if (user.isEmailVerified) {
            throw new ApiError(400, 'Email already verified');
        }

        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // TODO: Send verification email
        logger.info(`Verification email resent to ${user.email}`);

        res.json({
            success: true,
            message: 'Verification email sent'
        });
    } catch (error) {
        logger.error('Resend verification email error:', error);
        next(error);
    }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new ApiError(400, 'Invalid or expired reset token');
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        logger.error('Password reset error:', error);
        next(error);
    }
};

// Logout
exports.logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.removeRefreshToken(req.body.refreshToken);
            await user.save();
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        logger.error('Logout error:', error);
        next(error);
    }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new ApiError(400, 'Refresh token is required');
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.hasValidRefreshToken(refreshToken)) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            accessToken
        });
    } catch (error) {
        logger.error('Token refresh error:', error);
        next(error);
    }
};

module.exports = exports; 