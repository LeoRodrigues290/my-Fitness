import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { ChevronLeft, TrendingUp, BarChart2, ChevronDown } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { ExerciseLibraryRepository, Exercise } from '../../services/ExerciseLibraryRepository';
import { WorkoutSessionRepository } from '../../services/WorkoutSessionRepository';
import { LineChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HistoryData {
    date: string;
    weight: number | null;
    reps: string | null;
    sets: number | null;
    volume: number;
}

export const ExerciseProgressScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [historyData, setHistoryData] = useState<HistoryData[]>([]);
    const [chartMode, setChartMode] = useState<'weight' | 'volume'>('weight');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Load exercises
    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        const all = await ExerciseLibraryRepository.getAllExercises();
        setExercises(all);
        if (all.length > 0 && !selectedExercise) {
            setSelectedExercise(all[0]);
        }
    };

    // Load history when exercise changes
    useEffect(() => {
        if (selectedExercise && currentUser) {
            loadHistory(selectedExercise.id);
        }
    }, [selectedExercise, currentUser]);

    const loadHistory = async (exerciseId: number) => {
        if (!currentUser) return;
        const data = await WorkoutSessionRepository.getExerciseHistory(currentUser.id, exerciseId, 20);
        setHistoryData(data);
    };

    // Format chart data
    const getChartData = () => {
        if (historyData.length < 2) {
            return {
                labels: ['Sem dados'],
                datasets: [{ data: [0] }]
            };
        }

        const labels = historyData.map(d => {
            const date = new Date(d.date);
            return format(date, 'dd/MM', { locale: ptBR });
        });

        const data = historyData.map(d =>
            chartMode === 'weight' ? (d.weight || 0) : d.volume
        );

        return {
            labels: labels.slice(-7), // Last 7 entries for readability
            datasets: [{ data: data.slice(-7), strokeWidth: 2 }]
        };
    };

    // Calculate 1RM (Epley formula)
    const calculate1RM = (weight: number, reps: number): number => {
        if (reps === 1) return weight;
        return Math.round(weight * (1 + reps / 30));
    };

    // Get best performance
    const getBestPerformance = () => {
        if (historyData.length === 0) return null;

        let best = historyData[0];
        for (const d of historyData) {
            if ((d.weight || 0) > (best.weight || 0)) {
                best = d;
            }
        }
        return best;
    };

    // Get latest performance
    const getLatestPerformance = () => {
        if (historyData.length === 0) return null;
        return historyData[historyData.length - 1];
    };

    const bestPerf = getBestPerformance();
    const latestPerf = getLatestPerformance();
    const chartData = getChartData();

    return (
        <Screen>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={COLORS.white} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Evolução de Carga</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Exercise Selector */}
                <Text style={styles.label}>Selecione um exercício</Text>
                <TouchableOpacity
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                    activeOpacity={0.8}
                >
                    <GlassView style={styles.selector} intensity={15}>
                        <Text style={styles.selectorText}>
                            {selectedExercise?.name || 'Selecionar...'}
                        </Text>
                        <ChevronDown
                            color={COLORS.textSecondary}
                            size={20}
                            style={{ transform: [{ rotate: dropdownOpen ? '180deg' : '0deg' }] }}
                        />
                    </GlassView>
                </TouchableOpacity>

                {/* Dropdown */}
                {dropdownOpen && (
                    <GlassView style={styles.dropdown} intensity={20}>
                        <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                            {exercises.map(ex => (
                                <TouchableOpacity
                                    key={ex.id}
                                    style={[
                                        styles.dropdownItem,
                                        selectedExercise?.id === ex.id && styles.dropdownItemActive
                                    ]}
                                    onPress={() => {
                                        setSelectedExercise(ex);
                                        setDropdownOpen(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        selectedExercise?.id === ex.id && styles.dropdownItemTextActive
                                    ]}>
                                        {ex.name}
                                    </Text>
                                    <Text style={styles.dropdownItemMuscle}>{ex.muscle_group}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </GlassView>
                )}

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <GlassView style={styles.statCard} intensity={15}>
                        <TrendingUp color={COLORS.lime} size={20} />
                        <Text style={styles.statLabel}>Melhor Carga</Text>
                        <Text style={styles.statValue}>
                            {bestPerf?.weight || '-'}
                            <Text style={styles.statUnit}>kg</Text>
                        </Text>
                        {bestPerf && bestPerf.reps && (
                            <Text style={styles.statMeta}>
                                {bestPerf.reps} reps
                            </Text>
                        )}
                    </GlassView>

                    <GlassView style={styles.statCard} intensity={15}>
                        <BarChart2 color={COLORS.blue} size={20} />
                        <Text style={styles.statLabel}>Último Treino</Text>
                        <Text style={styles.statValue}>
                            {latestPerf?.weight || '-'}
                            <Text style={styles.statUnit}>kg</Text>
                        </Text>
                        {latestPerf && latestPerf.date && (
                            <Text style={styles.statMeta}>
                                {format(new Date(latestPerf.date), 'dd/MM', { locale: ptBR })}
                            </Text>
                        )}
                    </GlassView>
                </View>

                {/* 1RM Estimate */}
                {latestPerf && latestPerf.weight && latestPerf.reps && (
                    <GlassView style={styles.rmCard} intensity={15}>
                        <Text style={styles.rmLabel}>1RM Estimado (Fórmula Epley)</Text>
                        <Text style={styles.rmValue}>
                            {calculate1RM(latestPerf.weight, parseInt(latestPerf.reps.split('-')[0]) || 1)}
                            <Text style={styles.rmUnit}>kg</Text>
                        </Text>
                    </GlassView>
                )}

                {/* Chart Mode Toggle */}
                <View style={styles.chartModeRow}>
                    <TouchableOpacity
                        style={[styles.chartModeBtn, chartMode === 'weight' && styles.chartModeBtnActive]}
                        onPress={() => setChartMode('weight')}
                    >
                        <Text style={[styles.chartModeBtnText, chartMode === 'weight' && styles.chartModeBtnTextActive]}>
                            Peso (kg)
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chartModeBtn, chartMode === 'volume' && styles.chartModeBtnActive]}
                        onPress={() => setChartMode('volume')}
                    >
                        <Text style={[styles.chartModeBtnText, chartMode === 'volume' && styles.chartModeBtnTextActive]}>
                            Volume
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Chart */}
                {historyData.length >= 2 ? (
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={chartData}
                            width={SCREEN_WIDTH - SPACING.l * 2}
                            height={220}
                            chartConfig={{
                                backgroundColor: COLORS.card,
                                backgroundGradientFrom: COLORS.card,
                                backgroundGradientTo: COLORS.background,
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(163, 230, 53, ${opacity})`,
                                labelColor: () => COLORS.textSecondary,
                                style: { borderRadius: RADIUS.m },
                                propsForDots: {
                                    r: '5',
                                    strokeWidth: '2',
                                    stroke: COLORS.lime
                                },
                                propsForBackgroundLines: {
                                    strokeDasharray: '',
                                    stroke: 'rgba(255, 255, 255, 0.05)'
                                }
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                ) : (
                    <GlassView style={styles.noDataCard} intensity={10}>
                        <TrendingUp color={COLORS.textSecondary} size={32} />
                        <Text style={styles.noDataText}>Dados insuficientes</Text>
                        <Text style={styles.noDataSubtext}>
                            Complete pelo menos 2 treinos com este exercício para ver o gráfico
                        </Text>
                    </GlassView>
                )}

                {/* History List */}
                {historyData.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Histórico</Text>
                        {historyData.slice().reverse().map((item, index) => (
                            <GlassView key={index} style={styles.historyItem} intensity={10}>
                                <Text style={styles.historyDate}>
                                    {format(new Date(item.date), 'dd MMM yyyy', { locale: ptBR })}
                                </Text>
                                <View style={styles.historyStats}>
                                    <Text style={styles.historyValue}>
                                        {item.weight || '-'}kg
                                    </Text>
                                    <Text style={styles.historySep}>×</Text>
                                    <Text style={styles.historyReps}>
                                        {item.sets || '-'} séries × {item.reps || '-'}
                                    </Text>
                                </View>
                            </GlassView>
                        ))}
                    </>
                )}
            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        paddingTop: SPACING.l,
    },
    backBtn: {
        padding: 8,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxl,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginBottom: SPACING.xs,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
    },
    selectorText: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '500',
    },
    dropdown: {
        maxHeight: 250,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
        overflow: 'hidden',
    },
    dropdownScroll: {
        maxHeight: 250,
    },
    dropdownItem: {
        padding: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    dropdownItemActive: {
        backgroundColor: `${COLORS.lime} 20`,
    },
    dropdownItemText: {
        color: COLORS.white,
        fontSize: SIZES.body,
    },
    dropdownItemTextActive: {
        color: COLORS.lime,
        fontWeight: '600',
    },
    dropdownItemMuscle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.m,
    },
    statCard: {
        flex: 1,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        alignItems: 'center',
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
        marginTop: SPACING.xs,
    },
    statValue: {
        color: COLORS.white,
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        marginTop: SPACING.xs,
    },
    statUnit: {
        fontSize: SIZES.body,
        fontWeight: 'normal',
        color: COLORS.textSecondary,
    },
    statMeta: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
        marginTop: 2,
    },
    rmCard: {
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    rmLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    rmValue: {
        color: COLORS.purple,
        fontSize: 36,
        fontWeight: 'bold',
        marginTop: SPACING.xs,
    },
    rmUnit: {
        fontSize: SIZES.body,
        fontWeight: 'normal',
    },
    chartModeRow: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.m,
    },
    chartModeBtn: {
        flex: 1,
        padding: SPACING.s,
        borderRadius: RADIUS.m,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    chartModeBtnActive: {
        backgroundColor: COLORS.lime,
    },
    chartModeBtnText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        fontWeight: '500',
    },
    chartModeBtnTextActive: {
        color: COLORS.background,
    },
    chartContainer: {
        borderRadius: RADIUS.m,
        overflow: 'hidden',
        marginBottom: SPACING.l,
    },
    chart: {
        borderRadius: RADIUS.m,
    },
    noDataCard: {
        padding: SPACING.xl,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    noDataText: {
        color: COLORS.white,
        fontSize: SIZES.body,
        marginTop: SPACING.m,
    },
    noDataSubtext: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        textAlign: 'center',
        marginTop: SPACING.xs,
    },
    sectionTitle: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '600',
        marginBottom: SPACING.m,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.s,
    },
    historyDate: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    historyStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    historyValue: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: 'bold',
    },
    historySep: {
        color: COLORS.textSecondary,
    },
    historyReps: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
});
