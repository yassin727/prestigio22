const Car = require('../models/Car');
const User = require('../models/User');
const Order = require('../models/Order');
const Message = require('../models/Message');
const Settings = require('../models/Settings');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalVehicles = await Car.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            totalVehicles,
            totalCustomers,
            pendingOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        logger.error('Error getting dashboard stats:', error);
        next(error);
    }
};

// Get all cars
exports.getAllCars = async (req, res, next) => {
    try {
        const cars = await Car.find().sort({ createdAt: -1 });
        res.json(cars);
    } catch (error) {
        logger.error('Error getting cars:', error);
        next(error);
    }
};

// Add new car
exports.addCar = async (req, res, next) => {
    try {
        const {
            make,
            model,
            year,
            price,
            type,
            status,
            description,
            images
        } = req.body;

        const car = new Car({
            make,
            model,
            year,
            price,
            type,
            status,
            description,
            images
        });

        await car.save();
        res.status(201).json(car);
    } catch (error) {
        logger.error('Error adding car:', error);
        next(error);
    }
};

// Update car
exports.updateCar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const car = await Car.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!car) {
            throw new ApiError(404, 'Car not found');
        }

        res.json(car);
    } catch (error) {
        logger.error('Error updating car:', error);
        next(error);
    }
};

// Delete car
exports.deleteCar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const car = await Car.findByIdAndDelete(id);

        if (!car) {
            throw new ApiError(404, 'Car not found');
        }

        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        logger.error('Error deleting car:', error);
        next(error);
    }
};

// Get all customers
exports.getAllCustomers = async (req, res, next) => {
    try {
        const customers = await User.find({ role: 'customer' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        logger.error('Error getting customers:', error);
        next(error);
    }
};

// Delete customer
exports.deleteCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await User.findOneAndDelete({
            _id: id,
            role: 'customer'
        });

        if (!customer) {
            throw new ApiError(404, 'Customer not found');
        }

        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        logger.error('Error deleting customer:', error);
        next(error);
    }
};

// Get customer details
exports.getCustomerDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await User.findById(id)
            .select('-password')
            .populate('orders');

        if (!customer) {
            throw new ApiError(404, 'Customer not found');
        }

        res.json(customer);
    } catch (error) {
        logger.error('Error getting customer details:', error);
        next(error);
    }
};

// Dashboard
exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCars = await Car.countDocuments();
        const totalOrders = await Order.countDocuments();
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .populate('car', 'make model year');

        res.render('admin/dashboard', {
            totalUsers,
            totalCars,
            totalOrders,
            recentOrders
        });
    } catch (error) {
        logger.error('Error in getDashboard:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
};

// Vehicle Inventory
exports.getCars = async (req, res) => {
    try {
        const cars = await Car.find().sort({ createdAt: -1 });
        res.render('admin/cars', { cars });
    } catch (error) {
        logger.error('Error in getCars:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
};

// Customers
exports.getCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: 'user' }).sort({ createdAt: -1 });
        res.render('admin/customers', { customers });
    } catch (error) {
        logger.error('Error in getCustomers:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const customer = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        logger.error('Error in updateCustomer:', error);
        res.status(500).json({ message: 'Failed to update customer' });
    }
};

// Orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email')
            .populate('car', 'make model year');
        res.render('admin/orders', { orders });
    } catch (error) {
        logger.error('Error in getOrders:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('car', 'make model year');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        logger.error('Error in getOrderDetails:', error);
        res.status(500).json({ message: 'Failed to get order details' });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        logger.error('Error in updateOrder:', error);
        res.status(500).json({ message: 'Failed to update order' });
    }
};

// Messages
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .populate('sender', 'name email');
        const selectedMessage = req.query.message ? 
            await Message.findById(req.query.message).populate('sender', 'name email') : 
            null;
        res.render('admin/messages', { messages, selectedMessage });
    } catch (error) {
        logger.error('Error in getMessages:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
};

exports.replyToMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.replies.push({
            sender: req.user._id,
            content: req.body.content
        });
        message.status = 'replied';
        await message.save();

        res.json(message);
    } catch (error) {
        logger.error('Error in replyToMessage:', error);
        res.status(500).json({ message: 'Failed to send reply' });
    }
};

// Settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({
                siteName: 'Prestigio',
                siteDescription: 'Luxury Car Dealership',
                contactEmail: 'contact@prestigio.com',
                minPasswordLength: 8,
                requireUppercase: true,
                requireNumbers: true,
                requireSymbols: true,
                notifyNewOrders: true,
                notifyNewMessages: true,
                notifyLowStock: true
            });
        }
        res.render('admin/settings', { settings });
    } catch (error) {
        logger.error('Error in getSettings:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({}, req.body, { new: true });
        res.json(settings);
    } catch (error) {
        logger.error('Error in updateSettings:', error);
        res.status(500).json({ message: 'Failed to update settings' });
    }
};

exports.clearCache = async (req, res) => {
    try {
        // Implement cache clearing logic here
        res.json({ message: 'Cache cleared successfully' });
    } catch (error) {
        logger.error('Error in clearCache:', error);
        res.status(500).json({ message: 'Failed to clear cache' });
    }
};

exports.resetSettings = async (req, res) => {
    try {
        await Settings.findOneAndDelete({});
        const settings = await Settings.create({
            siteName: 'Prestigio',
            siteDescription: 'Luxury Car Dealership',
            contactEmail: 'contact@prestigio.com',
            minPasswordLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSymbols: true,
            notifyNewOrders: true,
            notifyNewMessages: true,
            notifyLowStock: true
        });
        res.json(settings);
    } catch (error) {
        logger.error('Error in resetSettings:', error);
        res.status(500).json({ message: 'Failed to reset settings' });
    }
}; 