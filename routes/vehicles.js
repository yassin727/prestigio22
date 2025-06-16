const express = require('express');
const router = express.Router();
const {
    createVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
} = require('../controllers/vehicleController');

// Create a new vehicle
router.post('/', createVehicle);

// Get all vehicles with filtering and pagination
router.get('/', getVehicles);

// Get single vehicle by ID
router.get('/:id', getVehicleById);

// Update a vehicle
router.put('/:id', updateVehicle);

// Delete a vehicle
router.delete('/:id', deleteVehicle);

module.exports = router; 