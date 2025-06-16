const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [1900, 'Year must be after 1900'],
        max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    type: {
        type: String,
        required: [true, 'Vehicle type is required'],
        enum: ['exotic', 'regular'],
        lowercase: true
    },
    images: [{
        type: String,
        required: [true, 'At least one image is required']
    }],
    features: [{
        type: String,
        trim: true
    }],
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'reserved'],
        default: 'available'
    },
    mileage: {
        type: Number,
        min: [0, 'Mileage cannot be negative']
    },
    engine: {
        type: String,
        trim: true
    },
    transmission: {
        type: String,
        enum: ['automatic', 'manual', 'semi-automatic'],
        default: 'automatic'
    },
    color: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
vehicleSchema.index({ brand: 1, model: 1 });
vehicleSchema.index({ type: 1, status: 1 });
vehicleSchema.index({ price: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle; 