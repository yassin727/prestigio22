const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'replied'],
        default: 'unread'
    },
    replies: [replySchema]
}, {
    timestamps: true
});

// Update status to 'read' when message is retrieved
messageSchema.pre('findOne', function() {
    if (this._conditions._id) {
        this.model.updateOne(
            { _id: this._conditions._id, status: 'unread' },
            { status: 'read' }
        ).exec();
    }
});

// Get unread message count
messageSchema.statics.getUnreadCount = async function() {
    return this.countDocuments({ status: 'unread' });
};

// Get messages with pagination
messageSchema.statics.getMessages = async function(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const messages = await this.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name email')
        .populate('replies.sender', 'name email');
    
    const total = await this.countDocuments();
    
    return {
        messages,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        }
    };
};

// Search messages
messageSchema.statics.search = async function(query) {
    return this.find({
        $or: [
            { subject: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } }
        ]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email')
    .populate('replies.sender', 'name email');
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 