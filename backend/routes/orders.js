const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Public routes
router.post('/', orderController.createOrder);
router.get('/:orderId', orderController.getOrder);

// Admin routes (you might want to add authentication middleware)
router.get('/admin/all', orderController.getAllOrders);
router.put('/admin/:orderId/status', orderController.updateOrderStatus);

module.exports = router; 