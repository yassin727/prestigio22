const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    service: {
        type: String,
        required: true,
        enum: [
            'luxury-cars',
            'regular-cars', 
            'car-customization',
            'financing',
            'maintenance',
            'insurance',
            'trade-in',
            'general'
        ]
    },
    problem: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'closed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assignedTo: {
        type: String,
        default: null
    },
    response: {
        type: String,
        default: null
    },
    responseDate: {
        type: Date,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    sessionId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ service: 1 });

// Virtual for request age
contactSchema.virtual('requestAge').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // Days
});

// Method to mark as resolved
contactSchema.methods.markResolved = function(response, assignedTo) {
    this.status = 'resolved';
    this.response = response;
    this.responseDate = new Date();
    this.assignedTo = assignedTo;
    return this.save();
};

// Static method to get pending requests
contactSchema.statics.getPendingRequests = function() {
    return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

// Static method to get requests by service
contactSchema.statics.getByService = function(service) {
    return this.find({ service }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Contact', contactSchema); 