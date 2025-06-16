const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  configurationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Configuration',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  deliveryAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    }
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'cash_on_delivery'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  estimatedDeliveryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  paymentDetails: {
    // For cash payments
    cash: {
      contactName: String,
      phone: String,
      address: String,
      preferredVisitDate: Date,
      preferredVisitTime: String
    },
    // For credit card payments
    creditCard: {
      cardNumber: String, // Last 4 digits only
      cardType: String,
      expiryDate: String,
      cardholderName: String
    }
  },
  feedback: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

// Virtual for formatted dates
orderSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString();
});

orderSchema.virtual('formattedEstimatedDelivery').get(function() {
  return this.estimatedDeliveryDate?.toLocaleDateString();
});

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .populate('userId', 'firstName lastName email')
    .populate('configurationId');
};

// Static method to find orders by payment status
orderSchema.statics.findByPaymentStatus = function(paymentStatus) {
  return this.find({ paymentStatus })
    .sort({ createdAt: -1 })
    .populate('userId', 'firstName lastName email')
    .populate('configurationId');
};

// Method to update order status
orderSchema.methods.updateStatus = async function(newStatus) {
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: []
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }

  this.status = newStatus;
  if (newStatus === 'shipped') {
    this.trackingNumber = await this.generateTrackingNumber();
  }
  await this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = async function(newStatus) {
  const validTransitions = {
    pending: ['paid', 'failed'],
    paid: ['refunded'],
    failed: ['pending'],
    refunded: []
  };

  if (!validTransitions[this.paymentStatus].includes(newStatus)) {
    throw new Error(`Invalid payment status transition from ${this.paymentStatus} to ${newStatus}`);
  }

  this.paymentStatus = newStatus;
  await this.save();
};

orderSchema.methods.calculateDeliveryDate = function() {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 14); // 2 weeks delivery time
  this.estimatedDeliveryDate = deliveryDate;
  return this.save();
};

orderSchema.methods.generateTrackingNumber = async function() {
  const prefix = 'PRST';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 