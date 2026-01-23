import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../../constants/colors';
import { useUser } from '../../context/UserContext';
import { WeightRepository, WeightEntry } from '../../services/WeightRepository';
import { DailyStatsRepository, DailyStatsEntry } from '../../services/DailyStatsRepository';
import { WorkoutSessionRepository } from '../../services/WorkoutSessionRepository';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const StatsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { currentUser } = useUser();
    const [filter, setFilter] = useState<'weekly' | 'monthly'>('weekly');
    const screenWidth = Dimensions.get("window").width;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [weightData, setWeightData] = useState<WeightEntry[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStatsEntry[]>([]);
    const [workoutCount, setWorkoutCount] = useState(0);
    const [weeklyWorkoutIncrease, setWeeklyWorkoutIncrease] = useState(0);

    useEffect(() => {
        loadData();
    }, [currentUser, filter]);

    const loadData = async () => {
        if (!currentUser) return;
        setLoading(true);
        setError(null);

        try {
            const days = filter === 'weekly' ? 7 : 30;
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = subDays(new Date(), days - 1).toISOString().split('T')[0];

            // Load weight history
            try {
                const weights = await WeightRepository.getWeightHistoryByRange(currentUser.id, startDate, endDate);
                setWeightData(weights || []);
            } catch (e) {
                console.error("Failed to load weights", e);
                setWeightData([]);
            }

            // Load daily stats (calories, macros)
            try {
                const stats = filter === 'weekly'
                    ? await DailyStatsRepository.getWeeklySummary(currentUser.id)
                    : await DailyStatsRepository.getMonthlySummary(currentUser.id);
                setDailyStats(stats || []);
            } catch (e) {
                console.error("Failed to load daily stats", e);
            }

            // Load workout count
            try {
                const count = await WorkoutSessionRepository.getSessionCount(currentUser.id, startDate, endDate);
                setWorkoutCount(count || 0);
            } catch (e) {
                console.error("Failed to load workout count", e);
                setWorkoutCount(0);
            }

            // Calculate weekly increase (compare this week vs last week)
            if (filter === 'weekly') {
                try {
                    const lastWeekStart = subDays(new Date(), 13).toISOString().split('T')[0];
                    const lastWeekEnd = subDays(new Date(), 7).toISOString().split('T')[0];
                    const lastWeekCount = await WorkoutSessionRepository.getSessionCount(currentUser.id, lastWeekStart, lastWeekEnd);
                    setWeeklyWorkoutIncrease(workoutCount - (lastWeekCount || 0));
                } catch (e) {
                    console.log("Failed to load last week stats", e);
                }
            }
        } catch (e) {
            console.error("Failed to load stats", e);
            setError("Erro ao carregar estatísticas");
        } finally {
            setLoading(false);
        }
    };

    // Calculate weight evolution
    const weightEvolution = weightData.length >= 2
        ? (weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)
        : '0';

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 20, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.lime400} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 20, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.red500 }}>{error}</Text>
                <TouchableOpacity onPress={loadData} style={{ marginTop: 20, padding: 10, backgroundColor: colors.slate800, borderRadius: 8 }}>
                    <Text style={{ color: colors.white }}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Prepare chart data for weight
    const weightChartData = {
        labels: weightData.length > 0 ? weightData.map(w => format(new Date(w.date), 'dd/MM', { locale: ptBR })) : ['Hoje'],
        datasets: [{ data: weightData.length > 0 ? weightData.map(w => w.weight) : [currentUser?.current_weight || 70] }]
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.title}>Estatísticas</Text>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'weekly' && styles.filterButtonActive]}
                    onPress={() => setFilter('weekly')}
                >
                    <Text style={[styles.filterText, filter === 'weekly' && styles.filterTextActive]}>7 Dias</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'monthly' && styles.filterButtonActive]}
                    onPress={() => setFilter('monthly')}
                >
                    <Text style={[styles.filterText, filter === 'monthly' && styles.filterTextActive]}>30 Dias</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Weight Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.cardTitle}>Peso Corporal</Text>
                    <LineChart
                        data={weightChartData}
                        width={screenWidth - 48}
                        height={220}
                        chartConfig={{
                            backgroundColor: 'transparent',
                            backgroundGradientFrom: colors.slate800,
                            backgroundGradientTo: colors.slate800,
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(163, 230, 53, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: "6", strokeWidth: "2", stroke: colors.lime400 }
                        }}
                        bezier
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                </View>

                {/* Workout Summary */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{workoutCount}</Text>
                        <Text style={styles.statLabel}>Treinos</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: Number(weightEvolution) > 0 ? colors.red500 : colors.lime400 }]}>
                            {weightEvolution} kg
                        </Text>
                        <Text style={styles.statLabel}>Evolução Peso</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 24, backgroundColor: colors.background },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.white, marginBottom: 20 },
    filterContainer: { flexDirection: 'row', backgroundColor: colors.slate800, borderRadius: 12, padding: 4, marginBottom: 20 },
    filterButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    filterButtonActive: { backgroundColor: colors.lime400 },
    filterText: { color: colors.slate400, fontWeight: '600' },
    filterTextActive: { color: colors.slate900 },
    content: { paddingBottom: 100 },
    chartCard: { backgroundColor: colors.slate900, borderRadius: 24, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.slate800 },
    cardTitle: { color: colors.white, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    statsGrid: { flexDirection: 'row', gap: 16 },
    statCard: { flex: 1, backgroundColor: colors.slate900, borderRadius: 24, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.slate800 },
    statValue: { fontSize: 32, fontWeight: 'bold', color: colors.white, marginBottom: 4 },
    statLabel: { color: colors.slate400, fontSize: 14 },
});
