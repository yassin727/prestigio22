const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const configurationController = require('../controllers/configuration.controller');

// GET /api/configurations - Get all saved configurations
router.get('/', authenticate, configurationController.getAllConfigurations);

// POST /api/configurations - Save a new configuration
router.post('/', authenticate, configurationController.createConfiguration);

// GET /api/configurations/:id - Get a specific configuration
router.get('/:id', authenticate, configurationController.getConfiguration);

// DELETE /api/configurations/:id - Delete a configuration
router.delete('/:id', authenticate, configurationController.deleteConfiguration);

module.exports = router; 