const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

// GET /api/users/profile - Get user profile
router.get('/profile', authenticate, userController.getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticate, userController.updateProfile);

// DELETE /api/users - Delete user account
router.delete('/', authenticate, userController.deleteAccount);

module.exports = router; 