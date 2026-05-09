const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    plate_number: {
        type: String,
        required: true
    },
    vehicle_type: {
        type: String
    },
    current_location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    }
}, { timestamps: true });

VehicleSchema.index({ current_location: '2dsphere' });

module.exports = mongoose.model('Vehicle', VehicleSchema);