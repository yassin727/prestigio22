const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarSchema = new Schema({
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
  category: {
    type: String,
    required: true,
    enum: ['SUV', 'Sedan', 'Sports', 'Luxury', 'Electric', 'Hybrid']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  type: {
    type: String,
    enum: ['regular', 'luxury', 'special-edition'],
    default: 'regular'
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [50, 'Description must be at least 50 characters']
  },
  specifications: {
    engine: {
      type: String,
      required: true
    },
    horsepower: {
      type: Number,
      required: true,
      min: [0, 'Horsepower cannot be negative']
    },
    torque: {
      type: Number,
      required: true,
      min: [0, 'Torque cannot be negative']
    },
    transmission: {
      type: String,
      required: true,
      enum: ['Automatic', 'Manual', 'CVT', 'DCT']
    },
    drivetrain: {
      type: String,
      required: true,
      enum: ['FWD', 'RWD', 'AWD', '4WD']
    },
    fuelEconomy: {
      city: {
        type: Number,
        min: [0, 'City fuel economy cannot be negative']
      },
      highway: {
        type: Number,
        min: [0, 'Highway fuel economy cannot be negative']
      },
      combined: {
        type: Number,
        min: [0, 'Combined fuel economy cannot be negative']
      }
    },
    acceleration: {
      zeroToSixty: {
        type: Number,
        min: [0, 'Acceleration time cannot be negative']
      },
      topSpeed: {
        type: Number,
        min: [0, 'Top speed cannot be negative']
      }
    }
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    },
    wheelbase: {
      type: Number,
      min: [0, 'Wheelbase cannot be negative']
    },
    groundClearance: {
      type: Number,
      min: [0, 'Ground clearance cannot be negative']
    }
  },
  features: [{
    category: {
      type: String,
      enum: ['Safety', 'Comfort', 'Technology', 'Performance']
    },
    name: String,
    description: String,
    standard: Boolean
  }],
  images: [{
    url: String,
    type: {
      type: String,
      enum: ['exterior', 'interior', 'detail']
    },
    caption: String
  }],
  model3D: {
    url: String,
    format: {
      type: String,
      enum: ['gltf', 'glb', 'obj']
    },
    thumbnail: String,
    animations: [{
      name: String,
      duration: Number
    }]
  },
  customizationOptions: {
    colors: [{
      name: String,
      code: String,
      price: {
        type: Number,
        min: [0, 'Color price cannot be negative']
      },
      metallic: Boolean,
      preview: String
    }],
    wheels: [{
      name: String,
      size: String,
      style: String,
      price: {
        type: Number,
        min: [0, 'Wheel price cannot be negative']
      },
      preview: String
    }],
    interiors: [{
      name: String,
      material: String,
      color: String,
      price: {
        type: Number,
        min: [0, 'Interior price cannot be negative']
      },
      preview: String
    }],
    packages: [{
      name: String,
      description: String,
      price: {
        type: Number,
        min: [0, 'Package price cannot be negative']
      },
      features: [String],
      preview: String
    }]
  },
  stock: {
    total: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved stock cannot be negative']
    },
    available: {
      type: Number,
      default: 0,
      min: [0, 'Available stock cannot be negative']
    }
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'maintenance'],
    default: 'available'
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  reviews: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
CarSchema.index({ brand: 1, model: 1, year: 1 });
CarSchema.index({ category: 1 });
CarSchema.index({ status: 1 });
CarSchema.index({ 'stock.available': 1 });

// Virtual for full name
CarSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model} ${this.year}`;
});

// Method to check if car is available
CarSchema.methods.isAvailable = function() {
  return this.status === 'available' && this.stock.available > 0;
};

// Method to reserve car
CarSchema.methods.reserve = async function() {
  if (!this.isAvailable()) {
    throw new Error('Car is not available for reservation');
  }
  
  this.stock.reserved += 1;
  this.stock.available -= 1;
  if (this.stock.available === 0) {
    this.status = 'reserved';
  }
  
  return this.save();
};

// Method to release reservation
CarSchema.methods.releaseReservation = async function() {
  if (this.stock.reserved <= 0) {
    throw new Error('No reservations to release');
  }
  
  this.stock.reserved -= 1;
  this.stock.available += 1;
  if (this.status === 'reserved') {
    this.status = 'available';
  }
  
  return this.save();
};

// Method to mark as sold
CarSchema.methods.markAsSold = async function() {
  if (this.status === 'sold') {
    throw new Error('Car is already marked as sold');
  }
  
  this.status = 'sold';
  this.stock.available = 0;
  this.stock.reserved = 0;
  
  return this.save();
};

// Static method to find available cars
CarSchema.statics.findAvailable = function() {
  return this.find({
    status: 'available',
    'stock.available': { $gt: 0 }
  });
};

// Static method to find cars by category
CarSchema.statics.findByCategory = function(category) {
  return this.find({ category });
};

// Static method to find cars by price range
CarSchema.statics.findByPriceRange = function(min, max) {
  return this.find({
    basePrice: {
      $gte: min,
      $lte: max
    }
  });
};

const Car = mongoose.model('Car', CarSchema);

module.exports = Car; 