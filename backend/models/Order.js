const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Order Information
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    transactionType: {
        type: String,
        enum: ['buy', 'rent', 'appointment'],
        default: 'buy'
    },
    
    // Order Type (for appointments)
    type: {
        type: String,
        enum: ['order', 'appointment'],
        default: 'order'
    },
    
    // Car Information (optional for appointments)
    car: {
        carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
        name: String,
        brand: String,
        basePrice: String,
        image: String
    },
    
    // Customizations
    customizations: [{
        name: { type: String, required: true },
        category: { type: String, required: true }, // interior, exterior, performance, technology
        price: { type: Number, required: true },
        description: String
    }],
    
    // Pricing (optional for appointments)
    basePrice: { type: Number, default: 0 },
    customizationTotal: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    pricing: {
        basePrice: Number,
        customizationPrice: Number,
        totalPrice: Number
    },
    
    // Rental Information (for rental transactions)
    rental: {
        duration: Number, // number of days
        pickupDate: Date,
        returnDate: Date,
        dailyRate: Number
    },
    
    // Appointment Information (for appointment bookings)
    appointment: {
        service: String, // type of service requested
        date: Date,      // appointment date
        time: String,    // appointment time slot
        message: String  // special requests or notes
    },
    
    // Customer Information
    customer: {
        firstName: String,
        lastName: String,
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: { type: String, default: 'USA' }
        }
    },
    
    // Payment Information
    payment: {
        method: { type: String, enum: ['cash', 'card'], required: true },
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
        transactionId: String,
        // For cash payments
        deliveryLocation: String,
        deliveryDate: Date,
        deliveryTime: String,
        // For card payments
        cardLast4: String
    },
    
    // Additional Information
    notes: String,
    emailSent: { type: Boolean, default: false },
    trackingNumber: String
}, {
    timestamps: true
});

// Generate unique order ID
orderSchema.pre('save', async function(next) {
    if (!this.orderId) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderId = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Calculate total price
orderSchema.pre('save', function(next) {
    // For appointments, customizations might not exist
    if (this.customizations && Array.isArray(this.customizations)) {
        this.customizationTotal = this.customizations.reduce((total, custom) => total + custom.price, 0);
    } else {
        this.customizationTotal = 0;
    }
    
    // For appointments, total price might be 0 or based on vehicle details
    if (this.type === 'appointment') {
        this.totalPrice = this.totalPrice || 0;
    } else if (this.transactionType === 'rent' && this.pricing && this.pricing.totalPrice) {
        this.totalPrice = this.pricing.totalPrice;
    } else if (this.pricing && this.pricing.totalPrice) {
        this.totalPrice = this.pricing.totalPrice;
    } else {
        this.totalPrice = (this.basePrice || 0) + this.customizationTotal;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema); 