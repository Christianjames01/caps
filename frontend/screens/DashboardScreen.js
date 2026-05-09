import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
    ScrollView,
} from 'react-native';

const { width } = Dimensions.get('window');

const QUICK_STATS = [
    { value: '0', label: 'Incidents', icon: '🛡️' },
    { value: '98%', label: 'Safe Score', icon: '⚡' },
    { value: '142', label: 'Trips', icon: '🗺️' },
];

const NAV_ITEMS = [
    {
        icon: '🗺️',
        title: 'Live Map',
        subtitle: 'Real-time traffic & hazards',
        screen: 'Map',
        accent: '#ff6b35',
        tag: 'LIVE',
    },
    {
        icon: '↗',
        title: 'Plan Route',
        subtitle: 'Smart routing with alerts',
        screen: 'Route',
        accent: '#3b82f6',
        tag: null,
    },
    {
        icon: '🔔',
        title: 'Alerts',
        subtitle: '3 new notifications',
        screen: 'Alerts',
        accent: '#f59e0b',
        tag: '3',
    },
    {
        icon: '👤',
        title: 'Profile',
        subtitle: 'Account & preferences',
        screen: 'Profile',
        accent: '#10b981',
        tag: null,
    },
];

export default function DashboardScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const cardAnims = useRef(NAV_ITEMS.map(() => new Animated.Value(0))).current;
    const statAnims = useRef(QUICK_STATS.map(() => new Animated.Value(0))).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const [greeting, setGreeting] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);

        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();

        Animated.stagger(80, statAnims.map(a =>
            Animated.spring(a, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true })
        )).start();

        Animated.stagger(100, cardAnims.map(a =>
            Animated.spring(a, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true })
        )).start();

        // Pulse the live dot
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.4, duration: 900, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            ])
        ).start();

        return () => clearInterval(interval);
    }, []);

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor="#080e1a" />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Top Bar */}
                <Animated.View
                    style={[styles.topBar, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                >
                    <View>
                        <Text style={styles.greetingText}>{greeting}</Text>
                        <Text style={styles.userName}>Juan dela Cruz</Text>
                    </View>
                    <View style={styles.topBarRight}>
                        <Text style={styles.clock}>{time}</Text>
                        <TouchableOpacity
                            style={styles.avatarButton}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <Text style={styles.avatarText}>JC</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Hero Banner */}
                <Animated.View
                    style={[styles.heroBanner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                >
                    <View style={styles.heroGlow} />
                    <View style={styles.heroContent}>
                        <View style={styles.liveRow}>
                            <Animated.View
                                style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]}
                            />
                            <Text style={styles.liveText}>MONITORING ACTIVE</Text>
                        </View>
                        <Text style={styles.heroTitle}>Road Clear</Text>
                        <Text style={styles.heroSubtitle}>No incidents detected on your usual routes</Text>
                    </View>
                    <View style={styles.heroShield}>
                        <Text style={styles.heroShieldIcon}>🛡️</Text>
                    </View>
                </Animated.View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    {QUICK_STATS.map((stat, i) => (
                        <Animated.View
                            key={stat.label}
                            style={[
                                styles.statCard,
                                {
                                    opacity: statAnims[i],
                                    transform: [{ scale: statAnims[i] }],
                                },
                            ]}
                        >
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </Animated.View>
                    ))}
                </View>

                {/* Section Title */}
                <Animated.View style={[styles.sectionHeader, { opacity: fadeAnim }]}>
                    <Text style={styles.sectionTitle}>QUICK ACCESS</Text>
                    <View style={styles.sectionLine} />
                </Animated.View>

                {/* Nav Cards */}
                <View style={styles.cardsGrid}>
                    {NAV_ITEMS.map((item, i) => (
                        <Animated.View
                            key={item.screen}
                            style={[
                                styles.cardWrapper,
                                i < 2 ? styles.cardWrapperTop : styles.cardWrapperBottom,
                                {
                                    opacity: cardAnims[i],
                                    transform: [
                                        {
                                            translateY: cardAnims[i].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [20, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={[styles.navCard, { borderColor: item.accent + '30' }]}
                                onPress={() => navigation.navigate(item.screen)}
                                activeOpacity={0.75}
                            >
                                <View style={[styles.cardIconBox, { backgroundColor: item.accent + '18' }]}>
                                    <Text style={styles.cardIcon}>{item.icon}</Text>
                                </View>
                                {item.tag && (
                                    <View style={[styles.cardTag, { backgroundColor: item.accent }]}>
                                        <Text style={styles.cardTagText}>{item.tag}</Text>
                                    </View>
                                )}
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                                <View style={[styles.cardArrowRow]}>
                                    <Text style={[styles.cardArrow, { color: item.accent }]}>→</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {/* Footer note */}
                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <Text style={styles.footerText}>RoadGuard • Keeping drivers safe</Text>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const CARD_WIDTH = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#080e1a',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    /* Top Bar */
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    greetingText: {
        color: '#6b7a99',
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    userName: {
        color: '#e8edf5',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
        marginTop: 2,
    },
    topBarRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    clock: {
        color: '#6b7a99',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    avatarButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1a2640',
        borderWidth: 2,
        borderColor: '#ff6b35',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#ff6b35',
        fontSize: 13,
        fontWeight: '800',
    },

    /* Hero Banner */
    heroBanner: {
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 20,
        backgroundColor: '#0f1c30',
        borderRadius: 20,
        padding: 22,
        borderWidth: 1,
        borderColor: '#ff6b3525',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },
    heroGlow: {
        position: 'absolute',
        top: -30,
        left: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ff6b3515',
    },
    heroContent: {
        flex: 1,
    },
    liveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#2ecc71',
        marginRight: 7,
    },
    liveText: {
        color: '#2ecc71',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.2,
    },
    heroTitle: {
        color: '#ffffff',
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    heroSubtitle: {
        color: '#6b7a99',
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 17,
    },
    heroShield: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ff6b3515',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    heroShieldIcon: {
        fontSize: 28,
    },

    /* Stats */
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 24,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#0f1c30',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1e3055',
    },
    statIcon: {
        fontSize: 16,
        marginBottom: 5,
    },
    statValue: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    statLabel: {
        color: '#6b7a99',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.4,
        marginTop: 2,
        textTransform: 'uppercase',
    },

    /* Section */
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 14,
        gap: 10,
    },
    sectionTitle: {
        color: '#6b7a99',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#1a2840',
    },

    /* Cards Grid */
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
    },
    cardWrapper: {
        width: CARD_WIDTH,
    },
    cardWrapperTop: {},
    cardWrapperBottom: {},
    navCard: {
        backgroundColor: '#0f1c30',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        minHeight: 150,
        position: 'relative',
        overflow: 'hidden',
    },
    cardIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardIcon: {
        fontSize: 22,
    },
    cardTag: {
        position: 'absolute',
        top: 14,
        right: 14,
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    cardTagText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    cardTitle: {
        color: '#e8edf5',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: -0.2,
        marginBottom: 4,
    },
    cardSubtitle: {
        color: '#6b7a99',
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 15,
    },
    cardArrowRow: {
        marginTop: 12,
    },
    cardArrow: {
        fontSize: 18,
        fontWeight: '700',
    },

    /* Footer */
    footer: {
        alignItems: 'center',
        marginTop: 28,
    },
    footerText: {
        color: '#2a3a55',
        fontSize: 11,
        letterSpacing: 0.5,
    },
});