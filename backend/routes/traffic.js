const express = require('express');
const router = express.Router();
const LocationLog = require('../models/LocationLog');
const AccidentLog = require('../models/AccidentLog');

// GET /api/traffic
router.get('/', async (req, res) => {
    try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const logs = await LocationLog.find({ timestamp: { $gte: tenMinutesAgo } });

        const grid = {};
        logs.forEach(log => {
            const key = `${(log.latitude * 100).toFixed(0)}_${(log.longitude * 100).toFixed(0)}`;
            if (!grid[key]) grid[key] = { latitude: log.latitude, longitude: log.longitude, speeds: [] };
            grid[key].speeds.push(log.speed || 0);
        });

        const congested = Object.values(grid)
            .map(cell => ({
                latitude: cell.latitude,
                longitude: cell.longitude,
                avgSpeed: cell.speeds.reduce((a, b) => a + b, 0) / cell.speeds.length,
                count: cell.speeds.length,
            }))
            .filter(cell => cell.avgSpeed < 10);

        res.json(congested);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/traffic/accidents
router.get('/accidents', async (req, res) => {
    try {
        const accidents = await AccidentLog.find()
            .sort({ timestamp: -1 })
            .limit(20);
        res.json(accidents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;