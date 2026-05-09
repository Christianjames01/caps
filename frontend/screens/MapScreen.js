import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accelerometer } from 'expo-sensors';
import NotificationBanner from '../components/NotificationBanner';

const BACKEND_URL = 'https://empire-modifications-adelaide-alot.trycloudflare.com';
const CRASH_THRESHOLD = 2.5;
const COOLDOWN_MS = 10000;

export default function MapScreen({ navigation }) {
    const [location, setLocation] = useState(null);
    const [otherUsers, setOtherUsers] = useState({});
    const [crashOverlay, setCrashOverlay] = useState(false);
    const [congestedZones, setCongestedZones] = useState([]);
    const [banner, setBanner] = useState(null);
    const socketRef = useRef(null);
    const lastCrashRef = useRef(0);
    const userRef = useRef(null);

    useEffect(() => {
        init();
        return () => {
            socketRef.current?.disconnect();
            Accelerometer.removeAllListeners();
        };
    }, []);

    const init = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) userRef.current = JSON.parse(userData);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission denied');

        const socket = io(BACKEND_URL, {
            transports: ['polling', 'websocket'],
            extraHeaders: { 'bypass-tunnel-reminder': 'true' }
        });
        socketRef.current = socket;

        socket.on('receive_location', (data) => {
            setOtherUsers(prev => ({ ...prev, [data.userId]: data }));
        });

        socket.on('accident_alert', (data) => {
            setBanner({ message: `🚨 Accident reported by ${data.fullname} nearby!`, type: 'accident' });
        });

        await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
            (loc) => {
                const { latitude, longitude, speed } = loc.coords;
                setLocation({ latitude, longitude });
                socket.emit('update_location', {
                    userId: userRef.current?._id,
                    fullname: userRef.current?.fullname,
                    latitude,
                    longitude,
                    speed: speed ? speed * 3.6 : 0,
                });
            }
        );

        Accelerometer.setUpdateInterval(200);
        Accelerometer.addListener(({ x, y, z }) => {
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            const now = Date.now();
            if (magnitude > CRASH_THRESHOLD && now - lastCrashRef.current > COOLDOWN_MS) {
                lastCrashRef.current = now;
                setCrashOverlay(true);
                setTimeout(() => setCrashOverlay(false), 3000);
                if (location) {
                    socket.emit('accident_detected', {
                        userId: userRef.current?._id,
                        fullname: userRef.current?.fullname || 'Unknown',
                        latitude: location.latitude,
                        longitude: location.longitude,
                        magnitude,
                    });
                }
            }
        });

        fetchCongestion();
        const interval = setInterval(fetchCongestion, 30000);
        return () => clearInterval(interval);
    };

    const fetchCongestion = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/traffic`, {
                headers: { 'bypass-tunnel-reminder': 'true' }
            });
            const data = await res.json();
            setCongestedZones(data.congested || []);
        } catch (err) {
            console.log('Traffic fetch failed:', err.message);
        }
    };

    const initialRegion = {
        latitude: location?.latitude || 7.1907,
        longitude: location?.longitude || 125.4553,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            {banner && (
                <NotificationBanner
                    message={banner.message}
                    type={banner.type}
                    onDismiss={() => setBanner(null)}
                />
            )}

            <MapView style={styles.map} region={initialRegion} showsUserLocation>
                {Object.values(otherUsers).map((u) => (
                    <Marker
                        key={u.userId}
                        coordinate={{ latitude: u.latitude, longitude: u.longitude }}
                        title={u.fullname || 'Other user'}
                        pinColor="blue"
                    />
                ))}

                {congestedZones.map((zone, i) => (
                    <Circle
                        key={i}
                        center={{ latitude: zone.latitude, longitude: zone.longitude }}
                        radius={150}
                        fillColor="rgba(231, 76, 60, 0.3)"
                        strokeColor="rgba(231, 76, 60, 0.8)"
                        strokeWidth={2}
                    />
                ))}
            </MapView>

            {crashOverlay && (
                <View style={styles.crashOverlay}>
                    <Text style={styles.crashText}>🚨 CRASH DETECTED</Text>
                </View>
            )}

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    crashOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(231,76,60,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    crashText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    backBtn: {
        position: 'absolute', bottom: 30, left: 20,
        backgroundColor: '#2c3e50', padding: 12, borderRadius: 8,
    },
    backText: { color: '#fff', fontWeight: 'bold' },
});