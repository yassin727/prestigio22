const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['luxury', 'regular'],
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    info: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: String,
        required: true,
        trim: true
    },
    brandLogo: {
        type: String,
        trim: true
    },
    brandFlag: {
        type: String,
        trim: true
    },
    specifications: {
        engine: String,
        power: String,
        transmission: String,
        fuelType: String
    },
    features: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for better search performance
carSchema.index({ brand: 1, category: 1 });
carSchema.index({ name: 'text', brand: 'text', info: 'text' });
carSchema.index({ category: 1, price: 1 });

// Static method to find cars by category
carSchema.statics.findByCategory = function(category) {
    return this.find({ category, isActive: true }).sort({ brand: 1, name: 1 });
};

// Static method to find cars by brand
carSchema.statics.findByBrand = function(brand, category = null) {
    const query = { brand, isActive: true };
    if (category) query.category = category;
    return this.find(query).sort({ name: 1 });
};

// Static method to search cars
carSchema.statics.search = function(searchTerm, category = null) {
    const query = {
        $text: { $search: searchTerm },
        isActive: true
    };
    if (category) query.category = category;
    return this.find(query, { score: { $meta: 'textScore' } })
              .sort({ score: { $meta: 'textScore' } });
};

const Car = mongoose.model('Car', carSchema);

module.exports = Car; 