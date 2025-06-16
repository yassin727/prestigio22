const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');

// GET /api/orders - Get all orders for a user
router.get('/', authenticate, orderController.getAllOrders);

// POST /api/orders - Create a new order
router.post('/', authenticate, orderController.createOrder);

// GET /api/orders/:id - Get a specific order
router.get('/:id', authenticate, orderController.getOrder);

// PUT /api/orders/:id - Update an order
router.put('/:id', authenticate, orderController.updateOrder);

// DELETE /api/orders/:id - Cancel an order
router.delete('/:id', authenticate, orderController.cancelOrder);

module.exports = router; 