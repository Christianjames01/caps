const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected');

        // Keep-alive ping every 30 seconds to prevent cold starts
        setInterval(async () => {
            try {
                await mongoose.connection.db.admin().ping();
                console.log('🏓 MongoDB keep-alive ping');
            } catch (err) {
                console.warn('Keep-alive ping failed:', err.message);
            }
        }, 30000);

    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;