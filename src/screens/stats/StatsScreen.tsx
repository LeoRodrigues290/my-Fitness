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
import { LineChart, BarChart } from 'react-native-chart-kit';
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

        try {
            const days = filter === 'weekly' ? 7 : 30;
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = subDays(new Date(), days - 1).toISOString().split('T')[0];

            // Load weight history
            const weights = await WeightRepository.getWeightHistoryByRange(currentUser.id, startDate, endDate);
            setWeightData(weights);

            // Load daily stats (calories, macros)
            const stats = filter === 'weekly'
                ? await DailyStatsRepository.getWeeklySummary(currentUser.id)
                : await DailyStatsRepository.getMonthlySummary(currentUser.id);
            setDailyStats(stats);

            // Load workout count
            const count = await WorkoutSessionRepository.getSessionCount(currentUser.id, startDate, endDate);
            setWorkoutCount(count);

            // Calculate weekly increase (compare this week vs last week)
            if (filter === 'weekly') {
                const lastWeekStart = subDays(new Date(), 13).toISOString().split('T')[0];
                const lastWeekEnd = subDays(new Date(), 7).toISOString().split('T')[0];
                const lastWeekCount = await WorkoutSessionRepository.getSessionCount(currentUser.id, lastWeekStart, lastWeekEnd);
                setWeeklyWorkoutIncrease(count - lastWeekCount);
            }
        } catch (e) {
            console.error("Failed to load stats", e);
        } finally {
            setLoading(false);
        }
    };

    // Calculate weight evolution
    const weightEvolution = weightData.length >= 2
        ? (weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)
        : '0';

    // Prepare chart data for weight
    const weightChartData = {
        labels: weightData.length > 0
            ? weightData.slice(-7).map(w => format(new Date(w.date), 'd/M'))
            : ['--'],
        datasets: [{
            data: weightData.length > 0
                ? weightData.slice(-7).map(w => w.weight)
                : [0]
        }]
    };

    // Prepare chart data for calories
    const caloriesChartData = {
        labels: dailyStats.length > 0
            ? dailyStats.slice(-7).map(s => format(new Date(s.date), 'EEE', { locale: ptBR }).substring(0, 3))
            : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
        datasets: [{
            data: dailyStats.length > 0
                ? dailyStats.slice(-7).map(s => s.calories_consumed || 0)
                : [0, 0, 0, 0, 0, 0, 0]
        }]
    };

    // Calculate macro distribution
    const totalProtein = dailyStats.reduce((sum, s) => sum + (s.protein_consumed || 0), 0);
    const totalCarbs = dailyStats.reduce((sum, s) => sum + (s.carbs_consumed || 0), 0);
    const totalFats = dailyStats.reduce((sum, s) => sum + (s.fats_consumed || 0), 0);
    const totalMacros = totalProtein + totalCarbs + totalFats || 1; // Avoid divide by zero

    const proteinPercent = Math.round((totalProtein / totalMacros) * 100);
    const carbsPercent = Math.round((totalCarbs / totalMacros) * 100);
    const fatsPercent = 100 - proteinPercent - carbsPercent;

    const chartConfig = {
        backgroundGradientFrom: "#1e293b",
        backgroundGradientFromOpacity: 0.5,
        backgroundGradientTo: "#0f172a",
        backgroundGradientToOpacity: 0.8,
        color: (opacity = 1) => `rgba(163, 230, 53, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Estatísticas</Text>
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        onPress={() => setFilter('weekly')}
                        style={[styles.filterButton, filter === 'weekly' && styles.filterButtonActive]}
                    >
                        <Text style={[styles.filterText, filter === 'weekly' && styles.filterTextActive]}>
                            Semana
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('monthly')}
                        style={[styles.filterButton, filter === 'monthly' && styles.filterButtonActive]}
                    >
                        <Text style={[styles.filterText, filter === 'monthly' && styles.filterTextActive]}>
                            Mês
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.lime400} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Summary Cards */}
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>TREINOS REALIZADOS</Text>
                            <Text style={styles.summaryValue}>{workoutCount}</Text>
                            <Text style={styles.summarySubtext}>
                                {weeklyWorkoutIncrease >= 0 ? '+' : ''}{weeklyWorkoutIncrease} essa semana
                            </Text>
                        </View>
                        <View style={[styles.summaryCard, styles.summaryCardBlue]}>
                            <Text style={[styles.summaryLabel, { color: colors.blue400 }]}>EVOLUÇÃO PESO</Text>
                            <Text style={styles.summaryValue}>
                                {parseFloat(weightEvolution) > 0 ? '+' : ''}{weightEvolution}kg
                            </Text>
                            <Text style={styles.summarySubtext}>
                                {filter === 'weekly' ? 'Última semana' : 'Último mês'}
                            </Text>
                        </View>
                    </View>

                    {/* Weight Graph */}
                    <View style={styles.graphSection}>
                        <Text style={styles.graphTitle}>Evolução de Peso</Text>
                        {weightData.length > 0 ? (
                            <LineChart
                                data={weightChartData}
                                width={screenWidth - 48}
                                height={220}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                                }}
                                bezier
                                style={styles.chart}
                            />
                        ) : (
                            <View style={styles.emptyChart}>
                                <Text style={styles.emptyText}>
                                    Registre seu peso em Configurações para ver o gráfico
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Calories Graph */}
                    <View style={styles.graphSection}>
                        <Text style={styles.graphTitle}>Consumo Calórico Diário</Text>
                        {dailyStats.length > 0 ? (
                            <BarChart
                                data={caloriesChartData}
                                width={screenWidth - 48}
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={chartConfig}
                                style={styles.chart}
                                verticalLabelRotation={0}
                            />
                        ) : (
                            <View style={styles.emptyChart}>
                                <Text style={styles.emptyText}>
                                    Registre suas refeições para ver o gráfico
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Macro Distribution */}
                    <View style={styles.macroCard}>
                        <Text style={styles.macroTitle}>Distribuição de Macros (Média)</Text>
                        <View style={styles.macroRow}>
                            <View style={styles.macroItem}>
                                <View style={[styles.macroDot, { backgroundColor: colors.red500 }]} />
                                <Text style={styles.macroLabel}>Proteína</Text>
                                <Text style={styles.macroValue}>{proteinPercent}%</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <View style={[styles.macroDot, { backgroundColor: colors.lime400 }]} />
                                <Text style={styles.macroLabel}>Carbs</Text>
                                <Text style={styles.macroValue}>{carbsPercent}%</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <View style={[styles.macroDot, { backgroundColor: colors.orange400 }]} />
                                <Text style={styles.macroLabel}>Gordura</Text>
                                <Text style={styles.macroValue}>{fatsPercent}%</Text>
                            </View>
                        </View>
                        <View style={styles.macroBar}>
                            <View style={[styles.macroBarSegment, { flex: proteinPercent / 100 || 0.33, backgroundColor: colors.red500 }]} />
                            <View style={[styles.macroBarSegment, { flex: carbsPercent / 100 || 0.34, backgroundColor: colors.lime400 }]} />
                            <View style={[styles.macroBarSegment, { flex: fatsPercent / 100 || 0.33, backgroundColor: colors.orange400 }]} />
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: colors.slate800,
        padding: 4,
        borderRadius: 12,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    filterButtonActive: {
        backgroundColor: colors.slate700,
    },
    filterText: {
        color: colors.slate500,
        fontSize: 12,
        fontWeight: 'bold',
    },
    filterTextActive: {
        color: colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        padding: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.slate700,
        height: 100,
    },
    summaryCardBlue: {
        borderColor: colors.blue500,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: colors.lime400,
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
    },
    summarySubtext: {
        fontSize: 10,
        color: colors.slate400,
    },
    graphSection: {
        marginBottom: 32,
    },
    graphTitle: {
        color: colors.white,
        fontWeight: 'bold',
        marginBottom: 16,
        fontSize: 16,
    },
    chart: {
        borderRadius: 16,
    },
    emptyChart: {
        height: 180,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: colors.slate400,
        textAlign: 'center',
        fontSize: 14,
    },
    macroCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
    },
    macroTitle: {
        color: colors.white,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    macroItem: {
        alignItems: 'center',
    },
    macroDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginBottom: 8,
    },
    macroLabel: {
        color: colors.slate400,
        fontSize: 12,
    },
    macroValue: {
        color: colors.white,
        fontWeight: 'bold',
    },
    macroBar: {
        flexDirection: 'row',
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        marginTop: 16,
    },
    macroBarSegment: {
        height: '100%',
    },
});
