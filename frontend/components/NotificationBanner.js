import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function NotificationBanner({ message, type = 'info', onDismiss }) {
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
        const timer = setTimeout(() => dismiss(), 5000);
        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => {
        Animated.timing(slideAnim, { toValue: -100, duration: 300, useNativeDriver: true }).start(() => {
            if (onDismiss) onDismiss();
        });
    };

    const bgColor = type === 'accident' ? '#e74c3c' : '#f39c12';

    return (
        <Animated.View style={[styles.banner, { backgroundColor: bgColor, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.text}>{message}</Text>
            <TouchableOpacity onPress={dismiss}>
                <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 14, paddingTop: 40,
    },
    text: { color: '#fff', fontWeight: 'bold', flex: 1, fontSize: 14 },
    close: { color: '#fff', fontSize: 18, paddingLeft: 10 },
});