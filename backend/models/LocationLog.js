// models/LocationLog.js
const mongoose = require('mongoose');
const LocationLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    latitude: Number,
    longitude: Number,
    speed: Number,
    timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('LocationLog', LocationLogSchema);