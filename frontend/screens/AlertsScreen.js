import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

const BACKEND_URL = 'https://empire-modifications-adelaide-alot.trycloudflare.com';

export default function AlertsScreen({ navigation }) {
    const [accidents, setAccidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/traffic/accidents`, {
            headers: { 'bypass-tunnel-reminder': 'true' }
        })
            .then(res => res.json())
            .then(data => {
                setAccidents(data.accidents || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>🚨 {item.fullname || 'Unknown'}</Text>
            <Text style={styles.detail}>📍 {item.latitude?.toFixed(5)}, {item.longitude?.toFixed(5)}</Text>
            <Text style={styles.detail}>💥 Magnitude: {item.magnitude?.toFixed(2)}G</Text>
            <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Map')}>
                    <Text style={styles.back}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Accident History</Text>
            </View>
            {loading
                ? <ActivityIndicator size="large" color="#e74c3c" style={{ marginTop: 40 }} />
                : accidents.length === 0
                    ? <Text style={styles.empty}>No accidents recorded yet.</Text>
                    : <FlatList
                        data={accidents}
                        keyExtractor={(item, i) => item._id || i.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d1117' },
    header: {
        backgroundColor: '#161b22', padding: 16, paddingTop: 48,
        flexDirection: 'row', alignItems: 'center', gap: 16,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,107,53,0.2)',
    },
    back: { color: '#ff6b35', fontSize: 16 },
    title: { color: '#f0f6fc', fontSize: 18, fontWeight: 'bold' },
    card: {
        backgroundColor: '#161b22', margin: 10, borderRadius: 10, padding: 14,
        borderLeftWidth: 4, borderLeftColor: '#ff3b30',
        elevation: 2,
    },
    name: { fontSize: 16, fontWeight: 'bold', color: '#f0f6fc', marginBottom: 4 },
    detail: { fontSize: 13, color: '#8b949e', marginBottom: 2 },
    time: { fontSize: 12, color: '#484f58', marginTop: 6 },
    empty: { textAlign: 'center', marginTop: 60, color: '#8b949e', fontSize: 16 },
});