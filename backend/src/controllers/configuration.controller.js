const Configuration = require('../models/Configuration');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Get all configurations for the current user
 * @route GET /api/configurations
 */
exports.getAllConfigurations = async (req, res, next) => {
    try {
        const configurations = await Configuration.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            configurations
        });
    } catch (error) {
        logger.error('Get configurations error:', error);
        next(error);
    }
};

/**
 * Create a new configuration
 * @route POST /api/configurations
 */
exports.createConfiguration = async (req, res, next) => {
    try {
        const configuration = new Configuration({
            ...req.body,
            userId: req.user.id
        });

        await configuration.save();

        res.status(201).json({
            success: true,
            message: 'Configuration saved successfully',
            configuration
        });
    } catch (error) {
        logger.error('Create configuration error:', error);
        next(error);
    }
};

/**
 * Get a specific configuration
 * @route GET /api/configurations/:id
 */
exports.getConfiguration = async (req, res, next) => {
    try {
        const configuration = await Configuration.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!configuration) {
            throw new ApiError(404, 'Configuration not found');
        }

        res.json({
            success: true,
            configuration
        });
    } catch (error) {
        logger.error('Get configuration error:', error);
        next(error);
    }
};

/**
 * Delete a configuration
 * @route DELETE /api/configurations/:id
 */
exports.deleteConfiguration = async (req, res, next) => {
    try {
        const configuration = await Configuration.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!configuration) {
            throw new ApiError(404, 'Configuration not found');
        }

        res.json({
            success: true,
            message: 'Configuration deleted successfully'
        });
    } catch (error) {
        logger.error('Delete configuration error:', error);
        next(error);
    }
};

module.exports = exports; 