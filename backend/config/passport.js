const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists with this Google ID
        let existingUser = await User.findOne({ googleId: profile.id });
        
        if (existingUser) {
            // User exists, update last login and return
            existingUser.lastLogin = new Date();
            await existingUser.save();
            return done(null, existingUser);
        }

        // Check if user exists with the same email (linking accounts)
        const existingEmailUser = await User.findOne({ email: profile.emails[0].value });
        
        if (existingEmailUser) {
            // Link Google account to existing user
            existingEmailUser.googleId = profile.id;
            existingEmailUser.profilePicture = profile.photos[0]?.value || null;
            existingEmailUser.provider = 'google';
            existingEmailUser.lastLogin = new Date();
            
            // If user doesn't have fullName, update it from Google
            if (!existingEmailUser.fullName) {
                existingEmailUser.fullName = profile.displayName;
            }
            
            await existingEmailUser.save();
            return done(null, existingEmailUser);
        }

        // Create new user from Google profile
        const newUser = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            fullName: profile.displayName,
            profilePicture: profile.photos[0]?.value || null,
            provider: 'google',
            lastLogin: new Date(),
            // Set default values for required fields
            phone: '', // Will need to be collected later
            address: '', // Will need to be collected later
            age: 18, // Default minimum age
            gender: 'other', // Default value
            nationality: '', // Will need to be collected later
            isActive: true
        });

        await newUser.save();
        return done(null, newUser);

    } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
    }
}));

module.exports = passport; 