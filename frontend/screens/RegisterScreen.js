import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import axios from 'axios';

const API_URL = 'https://empire-modifications-adelaide-alot.trycloudflare.com';

export default function RegisterScreen({ navigation }) {
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullname || !email || !password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/register`, {
                fullname, email, password, phone_number: phone
            });
            Alert.alert('Success', 'Account created! Please login.');
            navigation.navigate('Login');
        } catch (err) {
            Alert.alert('Register Failed', err.response?.data?.msg || 'Server error');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🛡️ RoadGuard</Text>
            <Text style={styles.subtitle}>Create your account</Text>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#888"
                value={fullname} onChangeText={setFullname} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888"
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888"
                value={password} onChangeText={setPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Phone Number (optional)" placeholderTextColor="#888"
                value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Already have an account? Login</Text>
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