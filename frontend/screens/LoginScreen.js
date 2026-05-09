import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://empire-modifications-adelaide-alot.trycloudflare.com';


export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(
                `${API_URL}/api/auth/login`,
                { email, password },
                { timeout: 10000 } // ← 10 second timeout, won't hang forever
            );
            await AsyncStorage.setItem('token', res.data.token);
            await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
            navigation.replace('Dashboard');
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                Alert.alert('Timeout', 'Server took too long. Make sure the backend is running.');
            } else if (err.code === 'ECONNREFUSED' || err.message === 'Network Error') {
                Alert.alert('Connection Error', 'Cannot reach server. Is node server.js running?');
            } else {
                Alert.alert('Login Failed', err.response?.data?.msg || 'Server error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🛡️ RoadGuard</Text>
            <Text style={styles.subtitle}>Drive Safe, Stay Alert</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Login</Text>
                }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f1923', justifyContent: 'center', padding: 24 },
    title: { fontSize: 36, fontWeight: 'bold', color: '#00c853', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 40 },
    input: { backgroundColor: '#1e2d3d', color: '#fff', padding: 14, borderRadius: 10, marginBottom: 16, fontSize: 16 },
    button: { backgroundColor: '#00c853', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    link: { color: '#00c853', textAlign: 'center', fontSize: 14 }
});