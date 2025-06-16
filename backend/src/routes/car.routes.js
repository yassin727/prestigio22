const express = require('express');
const router = express.Router();
const carController = require('../controllers/car.controller');

// Regular cars route
router.get('/regular', carController.getRegularCars);

// Luxury cars route
router.get('/luxury', carController.getLuxuryCars);

// New customization routes
router.get('/customize/:carId', carController.getCarCustomization);
router.post('/customize/:carId/save', carController.saveCarCustomization);
router.get('/customize/:carId/config', carController.getCarConfig);

// Other car routes...

module.exports = router; 