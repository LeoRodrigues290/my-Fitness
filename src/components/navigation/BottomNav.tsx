import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Home,
    Activity,
    BarChart2,
    Utensils,
    Dumbbell
} from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface BottomNavProps {
    activeTab: string;
    onTabPress: (tab: string) => void;
    onFabPress: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
    activeTab,
    onTabPress,
    onFabPress
}) => {
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(insets.bottom, 16);

    return (
        <View style={styles.container}>
            {/* FAB Positioned Absolute Outside of Blur to prevent cutting */}
            <View style={[styles.fabWrapper, { bottom: bottomPadding + 28 }]}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={onFabPress}
                    activeOpacity={0.9}
                >
                    <Dumbbell size={28} color={colors.slate900} fill={colors.slate900} />
                </TouchableOpacity>
            </View>

            {/* Blur Container */}
            <View style={styles.blurWrapper}>
                <BlurView
                    intensity={90}
                    tint="dark"
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Overlay for bluish tint */}
                <View style={styles.overlay} />

                {/* Glass Border */}
                <View style={styles.borderTop} />

                <View style={[styles.bottomNavContent, { paddingBottom: bottomPadding }]}>
                    <TouchableOpacity style={styles.navItem} onPress={() => onTabPress('home')}>
                        <Home size={24} color={activeTab === 'home' ? colors.lime400 : colors.slate400} />
                        <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Início</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => onTabPress('workouts')}>
                        <Activity size={24} color={activeTab === 'workouts' ? colors.lime400 : colors.slate400} />
                        <Text style={[styles.navText, activeTab === 'workouts' && styles.navTextActive]}>Treinos</Text>
                    </TouchableOpacity>

                    {/* Spacer for FAB */}
                    <View style={{ width: 60 }} />

                    <TouchableOpacity style={styles.navItem} onPress={() => onTabPress('stats')}>
                        <BarChart2 size={24} color={activeTab === 'stats' ? colors.lime400 : colors.slate400} />
                        <Text style={[styles.navText, activeTab === 'stats' && styles.navTextActive]}>Stats</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={() => onTabPress('nutrition')}>
                        <Utensils size={24} color={activeTab === 'nutrition' ? colors.lime400 : colors.slate400} />
                        <Text style={[styles.navText, activeTab === 'nutrition' && styles.navTextActive]}>Dieta</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    blurWrapper: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
    },
    borderTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    bottomNavContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 4,
    },
    navText: {
        fontSize: 10,
        fontWeight: '500',
        color: colors.slate400,
    },
    navTextActive: {
        color: colors.lime400,
    },
    fabWrapper: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 1000,
        elevation: 10,
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.lime400,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.lime400,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 4,
        borderColor: 'rgba(15, 23, 42, 0.5)',
    },
});
