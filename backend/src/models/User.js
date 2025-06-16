const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Check if model exists before creating
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[0-9\-\+\(\)\s]{8,}$/, 'Please enter a valid phone number']
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [18, 'You must be at least 18 years old'],
        max: [120, 'Please enter a valid age']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: {
            values: ['male', 'female', 'other', 'prefer-not-to-say'],
            message: 'Please select a valid gender'
        }
    },
    nationality: {
        type: String,
        required: [true, 'Nationality is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshTokens: [{
        token: String,
        device: String,
        ip: String,
        expiresAt: Date
    }],
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    preferences: {
        language: {
            type: String,
            enum: ['en', 'ar'],
            default: 'en'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: true
            }
        }
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}));

// Indexes
User.schema.index({ email: 1 });
User.schema.index({ username: 1 });
User.schema.index({ role: 1 });


// Add methods to the schema
User.schema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Hash password before saving
User.schema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to generate auth token
User.schema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// Method to generate refresh token
User.schema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

// Method to add refresh token
User.schema.methods.addRefreshToken = function(token, device, ip) {
    this.refreshTokens.push({
        token,
        device,
        ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
};

// Method to remove refresh token
User.schema.methods.removeRefreshToken = function(token) {
    this.refreshTokens = this.refreshTokens.filter(t => t.token !== token);
};

// Method to check if refresh token is valid
User.schema.methods.hasValidRefreshToken = function(token) {
    return this.refreshTokens.some(t => 
        t.token === token && t.expiresAt > Date.now()
    );
};

// Method to generate email verification token
User.schema.methods.generateEmailVerificationToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = token;
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return token;
};

// Method to generate password reset token
User.schema.methods.generatePasswordResetToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = token;
    this.passwordResetExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    return token;
};

// Method to check if account is locked
User.schema.methods.isLocked = function() {
    return this.lockUntil && this.lockUntil > Date.now();
};

// Method to increment login attempts
User.schema.methods.incrementLoginAttempts = async function() {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return await this.update({
            $set: {
                loginAttempts: 1,
                lockUntil: undefined
            }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= 5) {
        updates.$set = {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
        };
    }

    return await this.update(updates);
};

// Method to reset login attempts
User.schema.methods.resetLoginAttempts = async function() {
    return await this.update({
        $set: {
            loginAttempts: 0,
            lockUntil: undefined
        }
    });
};

// Static method to generate username
User.schema.statics.generateUsername = async function(name) {
    const baseUsername = name.toLowerCase().replace(/\s+/g, '');
    let username = baseUsername;
    let counter = 1;

    while (await this.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
    }

    return username;
};

// Create default admin user if none exists
User.createDefaultAdmin = async function() {
    try {
        const adminExists = await this.findOne({ username: 'admin' });
        
        if (!adminExists) {
            await this.create({
                username: 'admin',
                password: 'admin@123',
                isAdmin: true
            });
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

// Create default admin user
User.createDefaultAdmin();

module.exports = User; 