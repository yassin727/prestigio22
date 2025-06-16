const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Get user profile
 * @route GET /api/users/profile
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

/**
 * Update user profile
 * @route PUT /api/users/profile
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'address', 'city'];
        const updates = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});

        if (Object.keys(updates).length === 0) {
            throw new ApiError(400, 'No valid fields to update');
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Check if email is being updated and if it's already taken
        if (updates.email && updates.email !== user.email) {
            const existingUser = await User.findOne({ email: updates.email });
            if (existingUser) {
                throw new ApiError(400, 'Email already in use');
            }
        }

        Object.assign(user, updates);
        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                city: user.city
            }
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        next(error);
    }
};

/**
 * Delete user account
 * @route DELETE /api/users
 */
exports.deleteAccount = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        await user.remove();

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        logger.error('Delete account error:', error);
        next(error);
    }
};

module.exports = exports; 