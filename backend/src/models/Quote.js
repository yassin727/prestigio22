const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuoteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  configuration: {
    type: Schema.Types.ObjectId,
    ref: 'Configuration'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  price: {
    base: {
      type: Number,
      required: true,
      min: [0, 'Base price cannot be negative']
    },
    options: {
      type: Number,
      default: 0,
      min: [0, 'Options price cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP']
    }
  },
  validUntil: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  paymentTerms: {
    type: String,
    enum: ['full', 'installment'],
    default: 'full'
  },
  installmentPlan: {
    numberOfPayments: {
      type: Number,
      min: [1, 'Number of payments must be at least 1']
    },
    paymentFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi-annual']
    },
    downPayment: {
      type: Number,
      min: [0, 'Down payment cannot be negative']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
QuoteSchema.index({ user: 1, createdAt: -1 });
QuoteSchema.index({ car: 1 });
QuoteSchema.index({ status: 1 });
QuoteSchema.index({ validUntil: 1 });

// Virtual for days remaining
QuoteSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diff = this.validUntil - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Virtual for isExpired
QuoteSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

// Method to check if quote is valid
QuoteSchema.methods.isValid = function() {
  return this.status === 'pending' && !this.isExpired;
};

// Method to approve quote
QuoteSchema.methods.approve = async function(adminNotes) {
  if (this.status !== 'pending') {
    throw new Error('Only pending quotes can be approved');
  }
  
  this.status = 'approved';
  this.adminNotes = adminNotes;
  return this.save();
};

// Method to reject quote
QuoteSchema.methods.reject = async function(adminNotes) {
  if (this.status !== 'pending') {
    throw new Error('Only pending quotes can be rejected');
  }
  
  this.status = 'rejected';
  this.adminNotes = adminNotes;
  return this.save();
};

// Method to expire quote
QuoteSchema.methods.expire = async function() {
  if (this.status === 'pending') {
    this.status = 'expired';
    return this.save();
  }
};

// Static method to find valid quotes
QuoteSchema.statics.findValid = function() {
  return this.find({
    status: 'pending',
    validUntil: { $gt: new Date() }
  });
};

// Static method to find expired quotes
QuoteSchema.statics.findExpired = function() {
  return this.find({
    status: 'pending',
    validUntil: { $lte: new Date() }
  });
};

const Quote = mongoose.model('Quote', QuoteSchema);

module.exports = Quote; 