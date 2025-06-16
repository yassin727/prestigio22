const mongoose = require('mongoose');

const carConfigurationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    name: {
        type: String,
        trim: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    customization: {
        color: {
            name: String,
            code: String,
            price: Number
        },
        wheels: {
            name: String,
            size: String,
            style: String,
            price: Number
        },
        interior: {
            name: String,
            material: String,
            color: String,
            price: Number
        },
        packages: [{
            name: String,
            description: String,
            price: Number,
            features: [String]
        }]
    },
    model3D: {
        url: String,
        format: String,
        materials: [{
            name: String,
            color: String,
            texture: String
        }],
        camera: {
            position: {
                x: Number,
                y: Number,
                z: Number
            },
            target: {
                x: Number,
                y: Number,
                z: Number
            }
        },
        animations: [{
            name: String,
            duration: Number,
            keyframes: [{
                time: Number,
                value: Object
            }]
        }]
    },
    price: {
        base: {
            type: Number,
            required: true
        },
        options: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['draft', 'saved', 'ordered'],
        default: 'draft'
    },
    metadata: {
        lastModified: {
            type: Date,
            default: Date.now
        },
        views: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes
carConfigurationSchema.index({ user: 1 });
carConfigurationSchema.index({ car: 1 });
carConfigurationSchema.index({ status: 1 });
carConfigurationSchema.index({ 'metadata.lastModified': -1 });

// Methods
carConfigurationSchema.methods.calculateTotalPrice = function() {
    let total = this.price.base;
    
    if (this.customization.color) {
        total += this.customization.color.price;
    }
    
    if (this.customization.wheels) {
        total += this.customization.wheels.price;
    }
    
    if (this.customization.interior) {
        total += this.customization.interior.price;
    }
    
    if (this.customization.packages) {
        this.customization.packages.forEach(pkg => {
            total += pkg.price;
        });
    }
    
    this.price.options = total - this.price.base;
    this.price.total = total;
    
    return this.save();
};

carConfigurationSchema.methods.incrementViews = function() {
    this.metadata.views += 1;
    return this.save();
};

carConfigurationSchema.methods.incrementShares = function() {
    this.metadata.shares += 1;
    return this.save();
};

carConfigurationSchema.methods.incrementLikes = function() {
    this.metadata.likes += 1;
    return this.save();
};

carConfigurationSchema.methods.updateCamera = function(position, target) {
    this.model3D.camera = {
        position,
        target
    };
    return this.save();
};

carConfigurationSchema.methods.addAnimation = function(name, duration, keyframes) {
    this.model3D.animations.push({
        name,
        duration,
        keyframes
    });
    return this.save();
};

// Static methods
carConfigurationSchema.statics.findPublicConfigurations = function() {
    return this.find({
        isPublic: true,
        status: 'saved'
    }).populate('car');
};

carConfigurationSchema.statics.findUserConfigurations = function(userId) {
    return this.find({
        user: userId
    }).populate('car');
};

carConfigurationSchema.statics.findPopularConfigurations = function(limit = 10) {
    return this.find({
        isPublic: true,
        status: 'saved'
    })
    .sort({ 'metadata.views': -1 })
    .limit(limit)
    .populate('car');
};

const CarConfiguration = mongoose.model('CarConfiguration', carConfigurationSchema);

module.exports = CarConfiguration; 