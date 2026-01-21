import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { useUser } from '../../context/UserContext';
import { Flame, Dumbbell, TrendingUp } from 'lucide-react-native';

export const DashboardScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();

    // Mock data for now
    const stats = {
        streak: 3,
        calories: 1250,
        protein: 95,
        weight: 75.5,
        lastWorkout: 'Upper Body A',
    };

    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.userName}>{currentUser?.name || 'Athlete'}</Text>
                    </View>
                    <View style={styles.streakBadge}>
                        <Flame color={COLORS.accent} size={20} fill={COLORS.accent} />
                        <Text style={styles.streakText}>{stats.streak} Days</Text>
                    </View>
                </View>

                {/* Main Stats Grid */}
                <View style={styles.grid}>
                    {/* Quick Actions / Highlights */}
                    <GlassView style={[styles.card, styles.largeCard]} intensity={20} gradientBorder>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                                <Dumbbell color={COLORS.primary} size={24} />
                            </View>
                            <Text style={styles.cardTitle}>Last Workout</Text>
                        </View>
                        <Text style={styles.mainValue}>{stats.lastWorkout}</Text>
                        <Text style={styles.subtext}>Yesterday</Text>
                        <TouchableOpacity style={styles.actionLink} onPress={() => navigation.navigate('Workouts')}>
                            <Text style={styles.linkText}>Log Workout &rarr;</Text>
                        </TouchableOpacity>
                    </GlassView>

                    <View style={styles.row}>
                        <GlassView style={[styles.card, styles.halfCard]} intensity={20}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                <Flame color={COLORS.success} size={20} />
                            </View>
                            <Text style={styles.cardTitle}>Calories</Text>
                            <Text style={styles.value}>{stats.calories} <Text style={styles.unit}>kcal</Text></Text>
                        </GlassView>

                        <GlassView style={[styles.card, styles.halfCard]} intensity={20}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                                <TrendingUp color={COLORS.secondary} size={20} />
                            </View>
                            <Text style={styles.cardTitle}>Weight</Text>
                            <Text style={styles.value}>{stats.weight} <Text style={styles.unit}>kg</Text></Text>
                        </GlassView>
                    </View>
                </View>

                {/* Weekly Progress visual placeholder */}
                <Text style={styles.sectionTitle}>Weekly Activity</Text>
                <GlassView style={styles.chartCard} intensity={15}>
                    <View style={styles.chartPlaceholder}>
                        <Text style={{ color: COLORS.textSecondary }}>Chart Component Here</Text>
                    </View>
                </GlassView>

            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    greeting: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
    },
    userName: {
        fontSize: SIZES.h2,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.circle,
        gap: SPACING.xs,
    },
    streakText: {
        color: COLORS.accent,
        fontWeight: 'bold',
    },
    grid: {
        gap: SPACING.m,
        marginBottom: SPACING.xl,
    },
    card: {
        padding: SPACING.m,
        borderRadius: RADIUS.m,
    },
    largeCard: {
        minHeight: 140,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        marginBottom: SPACING.s,
    },
    iconBox: {
        padding: SPACING.s,
        borderRadius: RADIUS.s,
    },
    cardTitle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    mainValue: {
        fontSize: SIZES.h2,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    value: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: 'bold',
        marginTop: SPACING.s,
    },
    unit: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        fontWeight: 'normal',
    },
    subtext: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
    },
    actionLink: {
        marginTop: SPACING.m,
    },
    linkText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    halfCard: {
        flex: 1,
        padding: SPACING.m,
        aspectRatio: 1.1,
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: 'bold',
        marginBottom: SPACING.m,
    },
    chartCard: {
        height: 200,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
    },
    chartPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: RADIUS.s,
    }
});
