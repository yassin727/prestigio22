const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Vehicle Inventory
router.get('/cars', adminController.getCars);
router.post('/cars', adminController.addCar);
router.put('/cars/:id', adminController.updateCar);
router.delete('/cars/:id', adminController.deleteCar);

// Customers
router.get('/customers', adminController.getCustomers);
router.get('/customers/:id', adminController.getCustomerDetails);
router.put('/customers/:id', adminController.updateCustomer);

// Orders
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderDetails);
router.put('/orders/:id', adminController.updateOrder);

// Messages
router.get('/messages', adminController.getMessages);
router.post('/messages/:id/reply', adminController.replyToMessage);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings/:type', adminController.updateSettings);
router.delete('/settings/cache', adminController.clearCache);
router.post('/settings/reset', adminController.resetSettings);

module.exports = router; 