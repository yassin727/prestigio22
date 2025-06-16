const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    carModel: {
        type: String,
        required: [true, 'Car model is required'],
        trim: true
    },
    options: {
        exterior: {
            color: {
                type: String,
                required: [true, 'Exterior color is required']
            },
            wheels: {
                type: String,
                required: [true, 'Wheel type is required']
            },
            additionalFeatures: [{
                type: String
            }]
        },
        interior: {
            color: {
                type: String,
                required: [true, 'Interior color is required']
            },
            material: {
                type: String,
                required: [true, 'Interior material is required']
            },
            additionalFeatures: [{
                type: String
            }]
        },
        packages: [{
            type: String
        }],
        accessories: [{
            type: String
        }]
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Price cannot be negative']
    },
    status: {
        type: String,
        enum: ['draft', 'saved', 'ordered'],
        default: 'draft'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        trim: true,
        default: 'My Configuration'
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for faster queries
configurationSchema.index({ userId: 1, createdAt: -1 });
configurationSchema.index({ status: 1 });

// Virtual for formatted creation date
configurationSchema.virtual('formattedCreatedAt').get(function() {
    return this.createdAt.toLocaleDateString();
});

// Method to calculate total price
configurationSchema.methods.calculateTotalPrice = function() {
    // Base price from car model
    let total = this.carModel.basePrice || 0;

    // Add options prices
    if (this.options) {
        // Add exterior options
        if (this.options.exterior) {
            total += this.options.exterior.color.price || 0;
            total += this.options.exterior.wheels.price || 0;
            this.options.exterior.additionalFeatures?.forEach(feature => {
                total += feature.price || 0;
            });
        }

        // Add interior options
        if (this.options.interior) {
            total += this.options.interior.color.price || 0;
            total += this.options.interior.material.price || 0;
            this.options.interior.additionalFeatures?.forEach(feature => {
                total += feature.price || 0;
            });
        }

        // Add packages
        this.options.packages?.forEach(pkg => {
            total += pkg.price || 0;
        });

        // Add accessories
        this.options.accessories?.forEach(accessory => {
            total += accessory.price || 0;
        });
    }

    this.totalPrice = total;
    return total;
};

// Pre-save middleware to calculate total price
configurationSchema.pre('save', function(next) {
    this.calculateTotalPrice();
    next();
});

// Static method to find public configurations
configurationSchema.statics.findPublic = function() {
    return this.find({ isPublic: true })
        .sort({ createdAt: -1 })
        .populate('userId', 'firstName lastName');
};

// Static method to find user's configurations
configurationSchema.statics.findByUser = function(userId) {
    return this.find({ userId })
        .sort({ createdAt: -1 });
};

const Configuration = mongoose.model('Configuration', configurationSchema);

module.exports = Configuration; 