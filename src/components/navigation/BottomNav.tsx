import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
        <BlurView
            intensity={95}
            tint="dark"
            style={[
                styles.bottomNav,
                {
                    paddingBottom: Math.max(insets.bottom, 20),
                    backgroundColor: 'rgba(2, 6, 23, 0.6)'
                }
            ]}
        >
            <View style={styles.bottomNavContent}>
                <TouchableOpacity style={styles.navItem} onPress={() => onTabPress('home')}>
                    <Home size={24} color={activeTab === 'home' ? colors.lime400 : colors.slate400} />
                    <Text style={[styles.navText, activeTab === 'home' && { color: colors.lime400 }]}>
                        Início
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => onTabPress('workouts')}>
                    <Activity size={24} color={activeTab === 'workouts' ? colors.lime400 : colors.slate400} />
                    <Text style={[styles.navText, activeTab === 'workouts' && { color: colors.lime400 }]}>
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
                    <Text style={[styles.navText, activeTab === 'stats' && { color: colors.lime400 }]}>
                        Estatísticas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => onTabPress('nutrition')}>
                    <Utensils size={24} color={activeTab === 'nutrition' ? colors.lime400 : colors.slate400} />
                    <Text style={[styles.navText, activeTab === 'nutrition' && { color: colors.lime400 }]}>
                        Dieta
                    </Text>
                </TouchableOpacity>
            </View>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: colors.slate800,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    bottomNavContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    fabContainer: {
        position: 'relative',
        top: -24,
        flex: 1,
        alignItems: 'center',
    },
    fab: {
        backgroundColor: colors.lime400,
        padding: 16,
        borderRadius: 50,
        shadowColor: colors.lime400,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
});
