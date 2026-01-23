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

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {/* Blur Background - Real blur effect */}
            <BlurView
                intensity={80}
                tint="dark"
                style={StyleSheet.absoluteFillObject}
            />

            {/* Semi-transparent overlay with bluish tint */}
            <View style={styles.overlay} />

            {/* Border top glassmorphism */}
            <View style={styles.borderTop} />

            <View style={styles.bottomNavContent}>
                <TouchableOpacity style={styles.navItem} onPress={() => onTabPress('home')}>
                    <Home size={24} color={activeTab === 'home' ? colors.lime400 : colors.slate400} />
                    <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
                        Início
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => onTabPress('workouts')}>
                    <Activity size={24} color={activeTab === 'workouts' ? colors.lime400 : colors.slate400} />
                    <Text style={[styles.navText, activeTab === 'workouts' && styles.navTextActive]}>
                        Treinos
                    </Text>
                </TouchableOpacity>

                <View style={styles.fabContainer}>
                    <TouchableOpacity style={styles.fab} onPress={onFabPress}>
                        <Dumbbell size={28} color={colors.slate900} fill={colors.slate900} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.navItem} onPress={() => onTabPress('stats')}>
                    <BarChart2 size={24} color={activeTab === 'stats' ? colors.lime400 : colors.slate400} />
                    <Text style={[styles.navText, activeTab === 'stats' && styles.navTextActive]}>
                        Stats
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => onTabPress('nutrition')}>
                    <Utensils size={24} color={activeTab === 'nutrition' ? colors.lime400 : colors.slate400} />
                    <Text style={[styles.navText, activeTab === 'nutrition' && styles.navTextActive]}>
                        Dieta
                    </Text>
                </TouchableOpacity>
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
        overflow: 'hidden',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
    },
    borderTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(148, 163, 184, 0.15)',
    },
    bottomNavContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    navText: {
        fontSize: 10,
        fontWeight: '500',
        color: colors.slate400,
    },
    navTextActive: {
        color: colors.lime400,
    },
    fabContainer: {
        position: 'relative',
        top: -20,
        flex: 1,
        alignItems: 'center',
    },
    fab: {
        backgroundColor: colors.lime400,
        padding: 16,
        borderRadius: 50,
        shadowColor: colors.lime400,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
});
