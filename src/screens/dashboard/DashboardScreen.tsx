import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { useUser } from '../../context/UserContext';
import { Flame, Dumbbell, TrendingUp } from 'lucide-react-native';
import { WorkoutRepository } from '../../services/WorkoutRepository';
import { NutritionRepository } from '../../services/NutritionRepository';
import { UserRepository } from '../../services/UserRepository';
import { VictoryBar, VictoryChart, VictoryAxis } from 'victory-native';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { AnimatedState } from '../../components/ui/AnimatedState';

const { width } = Dimensions.get('window');

export const DashboardScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [stats, setStats] = useState({
        streak: 0,
        calories: 0,
        weight: 0,
        lastWorkout: 'No workouts yet',
    });
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!currentUser) return;
        setLoading(true);

        try {
            // 1. Last Workout
            const lastWorkout = await WorkoutRepository.getLastWorkout(currentUser.id);

            // 2. Today's Calories
            const today = new Date().toISOString().split('T')[0];
            const meals = await NutritionRepository.getMealsByDate(currentUser.id, today);
            const todayCalories = meals.reduce((acc: number, meal: any) => acc + meal.calories, 0);

            // 3. Current Weight (Last log)
            const weights = await UserRepository.getWeightLogs(currentUser.id);
            const currentWeight = weights.length > 0 ? weights[0].weight : 0;

            // 4. Weekly Calorie Chart
            const start = startOfWeek(new Date(), { weekStartsOn: 1 });
            const end = endOfWeek(new Date(), { weekStartsOn: 1 });
            const startStr = start.toISOString().split('T')[0];
            const endStr = end.toISOString().split('T')[0];

            const weakCalories = await NutritionRepository.getWeeklyCalories(currentUser.id, startStr, endStr);

            // Fill missing days
            const days = eachDayOfInterval({ start, end });
            const chartData = days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                // @ts-ignore
                const log = weakCalories.find(w => w.date === dateStr);
                return {
                    day: format(day, 'EEE'),
                    calories: log ? log.totalCalories : 0
                };
            });
            setWeeklyData(chartData);

            // 5. Streak
            const streak = await UserRepository.getUserStreak(currentUser.id);

            setStats({
                streak: streak,
                calories: todayCalories,
                weight: currentWeight,
                lastWorkout: lastWorkout ? lastWorkout.muscle_group : 'Comece sua jornada',
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [currentUser])
    );

    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Bem-vindo de volta,</Text>
                        <Text style={styles.userName}>{currentUser?.name || 'Atleta'}</Text>
                    </View>
                    <View style={styles.streakBadge}>
                        <AnimatedState icon={Flame} size={20} color={COLORS.accent} style={{ width: 30, height: 30 }} />
                        <Text style={styles.streakText}>{stats.streak} Dias seguidos</Text>
                    </View>
                </View>

                {/* Main Stats Grid */}
                <View style={styles.grid}>
                    {/* Last Workout */}
                    <GlassView style={[styles.card, styles.largeCard]} intensity={20} gradientBorder>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                                <Dumbbell color={COLORS.primary} size={24} />
                            </View>
                            <Text style={styles.cardTitle}>Último Treino</Text>
                        </View>
                        <Text style={styles.mainValue}>{stats.lastWorkout}</Text>
                        {/* If no workout, show prompt */}
                        {stats.lastWorkout === 'Comece sua jornada' && (
                            <Text style={styles.subtext}>Ótimo dia para treinar!</Text>
                        )}
                        <TouchableOpacity style={styles.actionLink} onPress={() => navigation.navigate('Workouts')}>
                            <Text style={styles.linkText}>Registrar Treino &rarr;</Text>
                        </TouchableOpacity>
                    </GlassView>

                    <View style={styles.row}>
                        {/* Calories */}
                        <GlassView style={[styles.card, styles.halfCard]} intensity={20}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                <Flame color={COLORS.success} size={20} />
                            </View>
                            <Text style={styles.cardTitle}>Calorias</Text>
                            <Text style={styles.value}>{Math.round(stats.calories)} <Text style={styles.unit}>kcal</Text></Text>
                        </GlassView>

                        {/* Weight */}
                        <GlassView style={[styles.card, styles.halfCard]} intensity={20}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
                                <TrendingUp color={COLORS.secondary} size={20} />
                            </View>
                            <Text style={styles.cardTitle}>Peso</Text>
                            <Text style={styles.value}>{stats.weight > 0 ? stats.weight : '--'} <Text style={styles.unit}>kg</Text></Text>
                        </GlassView>
                    </View>
                </View>

                {/* Weekly Activity Chart */}
                <Text style={styles.sectionTitle}>Calorias da Semana</Text>
                <GlassView style={styles.chartCard} intensity={15}>
                    {weeklyData.length > 0 ? (
                        {/* <VictoryChart
                            domainPadding={{ x: 20 }}
                            width={width - 64} // padding adjusted
                            height={200}
                        >
                            <VictoryAxis
                                style={{
                                    axis: { stroke: "transparent" },
                                    ticks: { stroke: "transparent" },
                                    tickLabels: { fill: COLORS.textSecondary, fontSize: 10 }
                                }}
                            />
                            <VictoryBar
                                data={weeklyData}
                                x="day"
                                y="calories"
                                style={{
                                    data: { fill: COLORS.primary, width: 20, rx: 5 },
                                }}
                                animate={{
                                    duration: 1000,
                                    onLoad: { duration: 500 }
                                }}
                                cornerRadius={{ top: 4, bottom: 4 }}
                            />
                        </VictoryChart> */}
                        < View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textSecondary }}>Gráfico em manutenção</Text>
                </View>
                ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: COLORS.textSecondary }}>Sem dados ainda</Text>
                </View>
                    )}
            </GlassView>

        </ScrollView>
        </Screen >
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
        marginTop: SPACING.m,
    },
    greeting: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
    },
    userName: {
        fontSize: SIZES.h1,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingRight: SPACING.m,
        borderRadius: RADIUS.l,
        gap: SPACING.xs,
    },
    streakText: {
        color: COLORS.accent,
        fontWeight: 'bold',
        fontSize: SIZES.small,
    },
    grid: {
        gap: SPACING.m,
        marginBottom: SPACING.xl,
    },
    card: {
        padding: SPACING.m,
        borderRadius: RADIUS.l,
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
        borderRadius: RADIUS.m,
    },
    cardTitle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    mainValue: {
        fontSize: SIZES.h2,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    value: {
        fontSize: SIZES.h2,
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
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
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
        minHeight: 120,
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: 'bold',
        marginBottom: SPACING.m,
    },
    chartCard: {
        height: 240,
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
