import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    Alert,
    StatusBar,
    SafeAreaView,
} from 'react-native';

// ✅ Moved OUTSIDE ProfileScreen
const InfoRow = ({ label, value, field, isEditing, editedProfile, setEditedProfile }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing ? (
            <TextInput
                style={styles.infoInput}
                value={editedProfile[field]}
                onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, [field]: text }))
                }
                placeholderTextColor="#8a9ab5"
            />
        ) : (
            <Text style={styles.infoValue}>{value}</Text>
        )}
    </View>
);

// ✅ Moved OUTSIDE ProfileScreen
const SettingRow = ({ label, subtitle, value, onToggle, icon }) => (
    <View style={styles.settingRow}>
        <View style={styles.settingIcon}>
            <Text style={styles.settingIconText}>{icon}</Text>
        </View>
        <View style={styles.settingText}>
            <Text style={styles.settingLabel}>{label}</Text>
            {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
        </View>
        <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: '#2a3550', true: '#e8443a' }}
            thumbColor={value ? '#ffffff' : '#8a9ab5'}
        />
    </View>
);

const ProfileScreen = ({ navigation }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [locationEnabled, setLocationEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const [profile, setProfile] = useState({
        name: 'Juan dela Cruz',
        email: 'juan@roadguard.ph',
        phone: '+63 912 345 6789',
        licenseNumber: 'N01-23-456789',
        vehicleplate: 'ABC 1234',
    });

    const [editedProfile, setEditedProfile] = useState({ ...profile });

    const handleSave = () => {
        setProfile({ ...editedProfile });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully.');
    };

    const handleCancel = () => {
        setEditedProfile({ ...profile });
        setIsEditing(false);
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: () => navigation.replace('Login'),
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor="#0d1626" />
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() =>
                            navigation.canGoBack()
                                ? navigation.goBack()
                                : navigation.navigate('Dashboard')
                        }
                    >
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
                    >
                        <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarRing} />
                        <View style={styles.avatar}>
                            <Text style={styles.avatarInitials}>
                                {profile.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.avatarEditBadge}>
                            <Text style={styles.avatarEditIcon}>✎</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.profileName}>{profile.name}</Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeDot}>●</Text>
                            <Text style={styles.badgeText}>Verified Driver</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Strip */}
                <View style={styles.statsStrip}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>142</Text>
                        <Text style={styles.statLabel}>Trips</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>98%</Text>
                        <Text style={styles.statLabel}>Safe Score</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Incidents</Text>
                    </View>
                </View>

                {/* Personal Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Personal Information</Text>
                        <View style={styles.cardAccent} />
                    </View>

                    {/* ✅ Now passing isEditing, editedProfile, setEditedProfile as props */}
                    <InfoRow
                        label="Full Name"
                        value={profile.name}
                        field="name"
                        isEditing={isEditing}
                        editedProfile={editedProfile}
                        setEditedProfile={setEditedProfile}
                    />
                    <InfoRow
                        label="Email"
                        value={profile.email}
                        field="email"
                        isEditing={isEditing}
                        editedProfile={editedProfile}
                        setEditedProfile={setEditedProfile}
                    />
                    <InfoRow
                        label="Phone"
                        value={profile.phone}
                        field="phone"
                        isEditing={isEditing}
                        editedProfile={editedProfile}
                        setEditedProfile={setEditedProfile}
                    />
                    <InfoRow
                        label="License No."
                        value={profile.licenseNumber}
                        field="licenseNumber"
                        isEditing={isEditing}
                        editedProfile={editedProfile}
                        setEditedProfile={setEditedProfile}
                    />
                    <InfoRow
                        label="Plate No."
                        value={profile.vehicleplate}
                        field="vehicleplate"
                        isEditing={isEditing}
                        editedProfile={editedProfile}
                        setEditedProfile={setEditedProfile}
                    />

                    {isEditing && (
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Settings Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Preferences</Text>
                        <View style={styles.cardAccent} />
                    </View>

                    <SettingRow
                        icon="🔔"
                        label="Push Notifications"
                        subtitle="Alerts, incidents & updates"
                        value={notificationsEnabled}
                        onToggle={setNotificationsEnabled}
                    />
                    <View style={styles.settingDivider} />
                    <SettingRow
                        icon="📍"
                        label="Location Services"
                        subtitle="Required for navigation"
                        value={locationEnabled}
                        onToggle={setLocationEnabled}
                    />
                    <View style={styles.settingDivider} />
                    <SettingRow
                        icon="🌙"
                        label="Dark Mode"
                        subtitle="UI appearance"
                        value={darkMode}
                        onToggle={setDarkMode}
                    />
                </View>

                {/* Quick Links */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Account</Text>
                        <View style={styles.cardAccent} />
                    </View>

                    {[
                        { icon: '🛡️', label: 'Privacy Policy' },
                        { icon: '📄', label: 'Terms of Service' },
                        { icon: '❓', label: 'Help & Support' },
                        { icon: '⭐', label: 'Rate RoadGuard' },
                    ].map((item, index, arr) => (
                        <React.Fragment key={item.label}>
                            <TouchableOpacity style={styles.linkRow}>
                                <Text style={styles.linkIcon}>{item.icon}</Text>
                                <Text style={styles.linkLabel}>{item.label}</Text>
                                <Text style={styles.linkArrow}>›</Text>
                            </TouchableOpacity>
                            {index < arr.length - 1 && <View style={styles.settingDivider} />}
                        </React.Fragment>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>RoadGuard v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#0d1626',
    },
    container: {
        flex: 1,
        backgroundColor: '#0d1626',
    },
    scrollContent: {
        paddingBottom: 48,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#1a2640',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: {
        color: '#ffffff',
        fontSize: 20,
        lineHeight: 22,
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    editButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#e8443a',
    },
    editButtonText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 28,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 14,
    },
    avatarRing: {
        position: 'absolute',
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: '#e8443a',
        top: -4,
        left: -4,
        opacity: 0.5,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#1e2f4a',
        borderWidth: 3,
        borderColor: '#e8443a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: '#e8443a',
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: 1,
    },
    avatarEditBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#e8443a',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#0d1626',
    },
    avatarEditIcon: {
        color: '#ffffff',
        fontSize: 12,
    },
    profileName: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 0.3,
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#162035',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#1e3055',
    },
    badgeDot: {
        color: '#2ecc71',
        fontSize: 8,
        marginRight: 5,
    },
    badgeText: {
        color: '#8a9ab5',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    statsStrip: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#121e33',
        borderRadius: 16,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: '#1e3055',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    statLabel: {
        color: '#8a9ab5',
        fontSize: 11,
        fontWeight: '500',
        marginTop: 3,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#1e3055',
    },
    card: {
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: '#121e33',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1e3055',
    },
    cardHeader: {
        marginBottom: 16,
    },
    cardTitle: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    cardAccent: {
        width: 28,
        height: 2,
        backgroundColor: '#e8443a',
        marginTop: 6,
        borderRadius: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1a2840',
    },
    infoLabel: {
        color: '#8a9ab5',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
        flex: 1,
    },
    infoValue: {
        color: '#dce6f5',
        fontSize: 14,
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    infoInput: {
        flex: 2,
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
        borderBottomWidth: 1,
        borderBottomColor: '#e8443a',
        paddingVertical: 2,
        paddingHorizontal: 4,
    },
    cancelButton: {
        marginTop: 16,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2a3d5c',
    },
    cancelButtonText: {
        color: '#8a9ab5',
        fontSize: 13,
        fontWeight: '600',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#1a2840',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingIconText: {
        fontSize: 16,
    },
    settingText: {
        flex: 1,
    },
    settingLabel: {
        color: '#dce6f5',
        fontSize: 14,
        fontWeight: '600',
    },
    settingSubtitle: {
        color: '#8a9ab5',
        fontSize: 11,
        marginTop: 2,
    },
    settingDivider: {
        height: 1,
        backgroundColor: '#1a2840',
        marginVertical: 4,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    linkIcon: {
        fontSize: 16,
        marginRight: 12,
        width: 24,
        textAlign: 'center',
    },
    linkLabel: {
        flex: 1,
        color: '#dce6f5',
        fontSize: 14,
        fontWeight: '500',
    },
    linkArrow: {
        color: '#8a9ab5',
        fontSize: 22,
        lineHeight: 22,
    },
    logoutButton: {
        marginHorizontal: 20,
        marginTop: 8,
        paddingVertical: 15,
        borderRadius: 14,
        backgroundColor: '#1a1220',
        borderWidth: 1,
        borderColor: '#6b1a1a',
        alignItems: 'center',
    },
    logoutText: {
        color: '#e8443a',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    versionText: {
        color: '#3a4f6a',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 20,
        letterSpacing: 0.5,
    },
});

export default ProfileScreen;