const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  categories: {
    product: {
      type: Number,
      min: 1,
      max: 5
    },
    service: {
      type: Number,
      min: 1,
      max: 5
    },
    delivery: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  images: [{
    url: String,
    caption: String
  }],
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminResponse: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ order: 1 });
feedbackSchema.index({ rating: -1 });
feedbackSchema.index({ createdAt: -1 });

// Methods
feedbackSchema.methods.markHelpful = async function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
    return this.save();
  }
  return this;
};

feedbackSchema.methods.unmarkHelpful = async function(userId) {
  const index = this.helpful.users.indexOf(userId);
  if (index > -1) {
    this.helpful.users.splice(index, 1);
    this.helpful.count -= 1;
    return this.save();
  }
  return this;
};

feedbackSchema.methods.addAdminResponse = async function(text, adminId) {
  this.adminResponse = {
    text,
    respondedBy: adminId,
    respondedAt: new Date()
  };
  return this.save();
};

// Static methods
feedbackSchema.statics.getAverageRating = async function() {
  const result = await this.aggregate([
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  return result[0] || { averageRating: 0, totalReviews: 0 };
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback; 