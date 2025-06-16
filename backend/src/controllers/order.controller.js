const Order = require('../models/Order');
const Configuration = require('../models/Configuration');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Get all orders for the current user
 * @route GET /api/orders
 */
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('configurationId');

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        logger.error('Get orders error:', error);
        next(error);
    }
};

/**
 * Create a new order
 * @route POST /api/orders
 */
exports.createOrder = async (req, res, next) => {
    try {
        const { configurationId, deliveryAddress, paymentMethod } = req.body;

        // Verify configuration exists and belongs to user
        const configuration = await Configuration.findOne({
            _id: configurationId,
            userId: req.user.id
        });

        if (!configuration) {
            throw new ApiError(404, 'Configuration not found');
        }

        // Create order
        const order = new Order({
            userId: req.user.id,
            configurationId,
            deliveryAddress,
            paymentMethod,
            status: 'pending',
            totalAmount: configuration.totalPrice
        });

        await order.save();

        // Update configuration status
        configuration.status = 'ordered';
        await configuration.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        logger.error('Create order error:', error);
        next(error);
    }
};

/**
 * Get a specific order
 * @route GET /api/orders/:id
 */
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user.id
        }).populate('configurationId');

        if (!order) {
            throw new ApiError(404, 'Order not found');
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        logger.error('Get order error:', error);
        next(error);
    }
};

/**
 * Update an order
 * @route PUT /api/orders/:id
 */
exports.updateOrder = async (req, res, next) => {
    try {
        const allowedUpdates = ['deliveryAddress', 'paymentMethod', 'status'];
        const updates = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});

        if (Object.keys(updates).length === 0) {
            throw new ApiError(400, 'No valid fields to update');
        }

        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!order) {
            throw new ApiError(404, 'Order not found');
        }

        // Prevent status updates for completed or cancelled orders
        if (updates.status && ['completed', 'cancelled'].includes(order.status)) {
            throw new ApiError(400, 'Cannot update completed or cancelled orders');
        }

        Object.assign(order, updates);
        await order.save();

        res.json({
            success: true,
            message: 'Order updated successfully',
            order
        });
    } catch (error) {
        logger.error('Update order error:', error);
        next(error);
    }
};

/**
 * Cancel an order
 * @route DELETE /api/orders/:id
 */
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!order) {
            throw new ApiError(404, 'Order not found');
        }

        // Prevent cancellation of completed or already cancelled orders
        if (['completed', 'cancelled'].includes(order.status)) {
            throw new ApiError(400, 'Cannot cancel completed or already cancelled orders');
        }

        order.status = 'cancelled';
        await order.save();

        // Reset configuration status
        const configuration = await Configuration.findById(order.configurationId);
        if (configuration) {
            configuration.status = 'saved';
            await configuration.save();
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        logger.error('Cancel order error:', error);
        next(error);
    }
};

module.exports = exports; 