import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, Dimensions, SafeAreaView
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

const TOMTOM_KEY = '6QklelCrxQcsADb8FV9ljEPi7zF2vqaD';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RouteScreen({ navigation }) {
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState('');
    const [routeCoords, setRouteCoords] = useState([]);
    const [destCoord, setDestCoord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const mapRef = useRef(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const loc = await Location.getCurrentPositionAsync({});
            setOrigin({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        })();
    }, []);

    const fetchSuggestions = async (text) => {
        setDestination(text);
        if (text.length < 3) { setSuggestions([]); return; }
        try {
            const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(text)}.json?key=${TOMTOM_KEY}&limit=4&countrySet=PH&lat=7.1907&lon=125.4553&radius=50000`; const res = await fetch(url);
            const data = await res.json();
            setSuggestions(data.results || []);
        } catch { setSuggestions([]); }
    };

    const selectSuggestion = (item) => {
        setDestination(item.address.freeformAddress);
        setSuggestions([]);
        searchRoute(item.position.lat, item.position.lon);
    };

    const searchRoute = async (destLat, destLon) => {
        if (!origin) return Alert.alert('Getting your location, try again');
        setLoading(true);
        setRouteCoords([]);
        setDestCoord(null);
        try {
            const dest = destLat && destLon
                ? { latitude: destLat, longitude: destLon }
                : await geocode(destination);
            setDestCoord(dest);
            const url = `https://api.tomtom.com/routing/1/calculateRoute/${origin.latitude},${origin.longitude}:${dest.latitude},${dest.longitude}/json?key=${TOMTOM_KEY}&traffic=true&travelMode=car`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data.routes || data.routes.length === 0) {
                Alert.alert('No route found');
                setLoading(false);
                return;
            }
            const route = data.routes[0];
            const summary = route.summary;
            const km = (summary.lengthInMeters / 1000).toFixed(1);
            const mins = Math.round(summary.travelTimeInSeconds / 60);
            setDistance(`${km} km`);
            setDuration(mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`);
            const coords = route.legs[0].points.map(p => ({ latitude: p.latitude, longitude: p.longitude }));
            setRouteCoords(coords);
            mapRef.current?.fitToCoordinates(coords, {
                edgePadding: { top: 130, right: 40, bottom: 160, left: 40 },
                animated: true,
            });
        } catch (err) {
            Alert.alert('Error', err.message);
        }
        setLoading(false);
    };

    const geocode = async (place) => {
        const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(place)}.json?key=${TOMTOM_KEY}&countrySet=PH&lat=7.1907&lon=125.4553`; const res = await fetch(url);
        const data = await res.json();
        if (!data.results || data.results.length === 0) throw new Error('Place not found');
        const { lat, lon } = data.results[0].position;
        return { latitude: lat, longitude: lon };
    };

    return (
        <View style={styles.container}>

            {/* Map fills full screen */}
            <MapView
                ref={mapRef}
                style={styles.map}
                showsUserLocation
                showsTraffic
                initialRegion={{
                    latitude: origin?.latitude || 7.1907,
                    longitude: origin?.longitude || 125.4553,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {destCoord && (
                    <Marker coordinate={destCoord} title="Destination" pinColor="#e74c3c" />
                )}
                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor="#2979ff"
                        strokeWidth={6}
                        lineDashPattern={[0]}
                    />
                )}
            </MapView>

            {/* Top Header Bar */}
            <SafeAreaView style={styles.topBar}>
                <View style={styles.topBarInner}>
                    {/* Back Button */}
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>

                    {/* Title */}
                    <View style={styles.titleWrap}>
                        <Text style={styles.screenTitle}>Plan a Route</Text>
                        <View style={styles.liveRow}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>Live Traffic</Text>
                        </View>
                    </View>

                    {/* Spacer */}
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            {/* Search Box */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Where do you want to go?"
                        placeholderTextColor="#3a3a5a"
                        value={destination}
                        onChangeText={fetchSuggestions}
                        onSubmitEditing={() => searchRoute()}
                        returnKeyType="search"
                    />
                    {destination.length > 0 && (
                        <TouchableOpacity
                            onPress={() => { setDestination(''); setSuggestions([]); }}
                            style={styles.clearBtn}
                        >
                            <Text style={styles.clearText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.goBtn} onPress={() => searchRoute()}>
                    <Text style={styles.goText}>Go</Text>
                </TouchableOpacity>
            </View>

            {/* Autocomplete Suggestions */}
            {suggestions.length > 0 && (
                <View style={styles.suggestions}>
                    {suggestions.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.suggItem, i < suggestions.length - 1 && styles.suggBorder]}
                            onPress={() => selectSuggestion(item)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.suggIconWrap}>
                                <Text style={{ fontSize: 14 }}>📍</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.suggMain} numberOfLines={1}>
                                    {item.poi?.name || item.address.freeformAddress}
                                </Text>
                                <Text style={styles.suggSub} numberOfLines={1}>
                                    {item.address.freeformAddress}
                                </Text>
                            </View>
                            <Text style={styles.suggArrow}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Loading Overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color="#00c853" />
                        <Text style={styles.loadingTitle}>Calculating Route</Text>
                        <Text style={styles.loadingSubtitle}>Using live traffic data...</Text>
                    </View>
                </View>
            )}

            {/* Route Info Card */}
            {distance ? (
                <View style={styles.infoCard}>
                    {/* Drag handle */}
                    <View style={styles.handle} />

                    <Text style={styles.infoHeading}>Route Summary</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoBox}>
                            <View style={[styles.infoIconWrap, { backgroundColor: '#0d1a2e' }]}>
                                <Text style={styles.infoEmoji}>📍</Text>
                            </View>
                            <Text style={styles.infoLabel}>Distance</Text>
                            <Text style={styles.infoValue}>{distance}</Text>
                        </View>

                        <View style={styles.infoBox}>
                            <View style={[styles.infoIconWrap, { backgroundColor: '#0d1a0a' }]}>
                                <Text style={styles.infoEmoji}>🕐</Text>
                            </View>
                            <Text style={styles.infoLabel}>Est. Time</Text>
                            <Text style={styles.infoValue}>{duration}</Text>
                        </View>

                        <View style={styles.infoBox}>
                            <View style={[styles.infoIconWrap, { backgroundColor: '#071508' }]}>
                                <Text style={styles.infoEmoji}>🚦</Text>
                            </View>
                            <Text style={styles.infoLabel}>Traffic</Text>
                            <Text style={[styles.infoValue, { color: '#00c853' }]}>Live</Text>
                        </View>
                    </View>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#08080f' },
    map: { flex: 1 },

    // Top Bar
    topBar: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    },
    topBarInner: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#08080f',
        borderBottomWidth: 1, borderBottomColor: '#1c1c30',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#0e0e1c', borderWidth: 1, borderColor: '#1c1c30',
        justifyContent: 'center', alignItems: 'center',
    },
    backText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    titleWrap: { flex: 1, alignItems: 'center' },
    screenTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
    liveRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00e676' },
    liveText: { color: '#00e676', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

    // Search
    searchWrapper: {
        position: 'absolute', top: 100, left: 12, right: 12, zIndex: 10,
        flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    searchBox: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#0e0e1c', borderRadius: 14,
        borderWidth: 1, borderColor: '#1c1c30',
        paddingHorizontal: 12, paddingVertical: 10,
        elevation: 10,
    },
    searchIcon: { fontSize: 15, marginRight: 6 },
    input: { flex: 1, color: '#ffffff', fontSize: 14 },
    clearBtn: { paddingLeft: 8 },
    clearText: { color: '#3a3a5a', fontSize: 14, fontWeight: '700' },
    goBtn: {
        backgroundColor: '#00c853', borderRadius: 14,
        paddingHorizontal: 22, paddingVertical: 13,
        elevation: 10, borderWidth: 2, borderColor: '#00e676',
    },
    goText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },
    // Suggestions
    suggestions: {
        position: 'absolute', top: 158, left: 12, right: 12, zIndex: 9,
        backgroundColor: '#0e0e1c', borderRadius: 16,
        borderWidth: 1, borderColor: '#1c1c30',
        elevation: 10, overflow: 'hidden',
    },
    suggItem: {
        flexDirection: 'row', alignItems: 'center',
        padding: 14, gap: 10,
    },
    suggBorder: { borderBottomWidth: 1, borderBottomColor: '#1c1c30' },
    suggIconWrap: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: '#13131f', justifyContent: 'center', alignItems: 'center',
    },
    suggMain: { color: '#e8e8f8', fontSize: 13, fontWeight: '700' },
    suggSub: { color: '#3a3a5a', fontSize: 11, marginTop: 2 },
    suggArrow: { color: '#2e2e4a', fontSize: 20 },

    // Loading
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(8,8,15,0.75)',
        justifyContent: 'center', alignItems: 'center',
    },
    loadingCard: {
        backgroundColor: '#0e0e1c', borderRadius: 24,
        borderWidth: 1, borderColor: '#1c1c30',
        padding: 32, alignItems: 'center', width: SCREEN_WIDTH * 0.7,
    },
    loadingTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginTop: 16 },
    loadingSubtitle: { color: '#4a4a6a', fontSize: 12, marginTop: 4 },

    // Info Card
    infoCard: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#0e0e1c',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        borderWidth: 1, borderColor: '#1c1c30',
        padding: 20, paddingBottom: 34,
        elevation: 20,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#2e2e4a', alignSelf: 'center', marginBottom: 16,
    },
    infoHeading: {
        color: '#2e2e4a', fontSize: 10, fontWeight: '800',
        letterSpacing: 1.5, textTransform: 'uppercase',
        textAlign: 'center', marginBottom: 16,
    },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    infoBox: {
        flex: 1, backgroundColor: '#13131f',
        borderRadius: 16, borderWidth: 1, borderColor: '#1c1c30',
        padding: 14, alignItems: 'center', gap: 6,
    },
    infoIconWrap: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    infoEmoji: { fontSize: 16 },
    infoLabel: { color: '#3a3a5a', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
    infoValue: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
});