const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prestigio_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
        console.log(`Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        console.error('Please make sure:');
        console.error('1. MongoDB is installed and running');
        console.error('2. The connection URL is correct');
        console.error('3. You have network access to the database');
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('error', err => {
    console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});

module.exports = connectDB; 