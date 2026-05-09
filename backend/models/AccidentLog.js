const mongoose = require('mongoose');

const AccidentLogSchema = new mongoose.Schema({
    userId: { type: String },
    fullname: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    magnitude: { type: Number },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccidentLog', AccidentLogSchema);