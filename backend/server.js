const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const LocationLog = require('./models/LocationLog');
const AccidentLog = require('./models/AccidentLog');


dotenv.config();

connectDB().then(async () => {
    try {
        const User = require('./models/User');
        await User.findOne({}).lean();
        console.log('✅ DB warmed up');
    } catch (e) { }
});


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    allowEIO3: true,
    transports: ['websocket', 'polling'],
    path: '/socket.io/'
});
app.use(cors());
app.use((req, res, next) => { res.setHeader('Bypass-Tunnel-Reminder', 'true'); next(); });
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/traffic', require('./routes/traffic'));

app.get('/', (req, res) => {
    res.send('RoadGuard API is running');
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // GPS location update
    socket.on('update_location', async (data) => {
        console.log('Location update:', data);
        socket.broadcast.emit('receive_location', data);

        try {
            await LocationLog.create({
                userId: data.userId || null,
                vehicleId: data.vehicleId || null,
                latitude: data.latitude,
                longitude: data.longitude,
                speed: data.speed || 0,
            });
            console.log(`Saved: ${data.latitude}, ${data.longitude}`);
        } catch (err) {
            console.error('Location save failed:', err.message);
        }
    });

    // Accident detection
    socket.on('accident_detected', async (data) => {
        console.log('ACCIDENT DETECTED:', data);
        socket.broadcast.emit('accident_alert', data);

        try {
            await AccidentLog.create({
                userId: data.userId,
                fullname: data.fullname,
                latitude: data.latitude,
                longitude: data.longitude,
                magnitude: data.magnitude,
            });
            console.log(`Accident saved for ${data.fullname} at ${data.latitude}, ${data.longitude}`);
        } catch (err) {
            console.error('Accident save failed:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));