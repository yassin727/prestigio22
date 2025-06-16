const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: true,
        default: 'Prestigio'
    },
    siteDescription: {
        type: String,
        required: true,
        default: 'Luxury Car Dealership'
    },
    contactEmail: {
        type: String,
        required: true,
        default: 'contact@prestigio.com'
    },
    minPasswordLength: {
        type: Number,
        required: true,
        default: 8,
        min: 6,
        max: 32
    },
    requireUppercase: {
        type: Boolean,
        required: true,
        default: true
    },
    requireNumbers: {
        type: Boolean,
        required: true,
        default: true
    },
    requireSymbols: {
        type: Boolean,
        required: true,
        default: true
    },
    notifyNewOrders: {
        type: Boolean,
        required: true,
        default: true
    },
    notifyNewMessages: {
        type: Boolean,
        required: true,
        default: true
    },
    notifyLowStock: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await this.constructor.countDocuments();
        if (count > 0) {
            throw new Error('Settings document already exists');
        }
    }
    next();
});

// Get current settings or create default
settingsSchema.statics.getCurrent = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

// Validate password against settings
settingsSchema.methods.validatePassword = function(password) {
    if (password.length < this.minPasswordLength) {
        return false;
    }
    if (this.requireUppercase && !/[A-Z]/.test(password)) {
        return false;
    }
    if (this.requireNumbers && !/\d/.test(password)) {
        return false;
    }
    if (this.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return false;
    }
    return true;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings; 