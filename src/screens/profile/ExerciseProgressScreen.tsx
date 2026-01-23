import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { ChevronLeft, TrendingUp, BarChart2, ChevronDown, Zap, Activity } from 'lucide-react-native';
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

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        const all = await ExerciseLibraryRepository.getAllExercises();
        setExercises(all);
        if (all.length > 0 && !selectedExercise) setSelectedExercise(all[0]);
    };

    useEffect(() => {
        if (selectedExercise && currentUser) loadHistory(selectedExercise.id);
    }, [selectedExercise, currentUser]);

    const loadHistory = async (exerciseId: number) => {
        if (!currentUser) return;
        const data = await WorkoutSessionRepository.getExerciseHistory(currentUser.id, exerciseId, 20);
        setHistoryData(data);
    };

    const getChartData = () => {
        if (historyData.length < 2) return { labels: [''], datasets: [{ data: [0] }] };
        const labels = historyData.slice(-7).map(d => format(new Date(d.date), 'dd/MM', { locale: ptBR }));
        const data = historyData.slice(-7).map(d => chartMode === 'weight' ? (d.weight || 0) : d.volume);
        return { labels, datasets: [{ data, strokeWidth: 3 }] };
    };

    const calculate1RM = (weight: number, reps: number) => reps === 1 ? weight : Math.round(weight * (1 + reps / 30));

    const bestPerf = historyData.reduce((best, d) => (d.weight || 0) > (best?.weight || 0) ? d : best, historyData[0] || null);
    const latestPerf = historyData[historyData.length - 1] || null;

    return (
        <Screen>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={COLORS.white} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Evolução de Carga</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Selector */}
                <Text style={styles.label}>Exercício</Text>
                <TouchableOpacity onPress={() => setDropdownOpen(!dropdownOpen)} style={styles.selector}>
                    <Text style={styles.selectorText}>{selectedExercise?.name || 'Selecionar...'}</Text>
                    <ChevronDown color={COLORS.lime} size={20} style={{ transform: [{ rotate: dropdownOpen ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {/* Dropdown */}
                {dropdownOpen && (
                    <View style={styles.dropdown}>
                        <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                            {exercises.map(ex => (
                                <TouchableOpacity
                                    key={ex.id}
                                    style={[styles.dropdownItem, selectedExercise?.id === ex.id && styles.dropdownItemActive]}
                                    onPress={() => { setSelectedExercise(ex); setDropdownOpen(false); }}
                                >
                                    <View>
                                        <Text style={[styles.dropdownText, selectedExercise?.id === ex.id && styles.dropdownTextActive]}>{ex.name}</Text>
                                        <Text style={styles.dropdownMuscle}>{ex.muscle_group}</Text>
                                    </View>
                                    {selectedExercise?.id === ex.id && <Activity color={COLORS.lime} size={16} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <TrendingUp color={COLORS.lime} size={22} />
                        <Text style={styles.statLabel}>Melhor</Text>
                        <Text style={styles.statValue}>{bestPerf?.weight || '-'} <Text style={styles.statUnit}>kg</Text></Text>
                    </View>
                    <View style={styles.statCard}>
                        <BarChart2 color={COLORS.blue} size={22} />
                        <Text style={styles.statLabel}>Último</Text>
                        <Text style={styles.statValue}>{latestPerf?.weight || '-'} <Text style={styles.statUnit}>kg</Text></Text>
                    </View>
                </View>

                {/* 1RM */}
                {latestPerf?.weight && latestPerf?.reps && (
                    <View style={styles.rmCard}>
                        <View style={styles.rmHeader}>
                            <Zap color={COLORS.purple} size={22} />
                            <Text style={styles.rmLabel}>1RM Estimado</Text>
                        </View>
                        <Text style={styles.rmValue}>{calculate1RM(latestPerf.weight, parseInt(latestPerf.reps.split('-')[0]) || 1)} <Text style={styles.rmUnit}>kg</Text></Text>
                    </View>
                )}

                {/* Toggle */}
                <View style={styles.toggleRow}>
                    <TouchableOpacity style={[styles.toggleBtn, chartMode === 'weight' && styles.toggleActive]} onPress={() => setChartMode('weight')}>
                        <Text style={[styles.toggleText, chartMode === 'weight' && styles.toggleTextActive]}>Peso</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.toggleBtn, chartMode === 'volume' && styles.toggleActive]} onPress={() => setChartMode('volume')}>
                        <Text style={[styles.toggleText, chartMode === 'volume' && styles.toggleTextActive]}>Volume</Text>
                    </TouchableOpacity>
                </View>

                {/* Chart */}
                {historyData.length >= 2 ? (
                    <View style={styles.chartCard}>
                        <LineChart
                            data={getChartData()}
                            width={SCREEN_WIDTH - SPACING.l * 4}
                            height={200}
                            chartConfig={{
                                backgroundColor: 'transparent',
                                backgroundGradientFrom: COLORS.card,
                                backgroundGradientTo: COLORS.card,
                                decimalPlaces: 0,
                                color: (o) => `rgba(163, 230, 53, ${o})`,
                                labelColor: () => COLORS.textSecondary,
                                propsForDots: { r: '5', strokeWidth: '2', stroke: COLORS.lime, fill: COLORS.background },
                                propsForBackgroundLines: { strokeDasharray: '', stroke: 'rgba(255,255,255,0.05)' }
                            }}
                            bezier
                            style={{ borderRadius: RADIUS.m }}
                        />
                    </View>
                ) : (
                    <View style={styles.noData}>
                        <TrendingUp color={COLORS.textSecondary} size={40} />
                        <Text style={styles.noDataText}>Complete pelo menos 2 treinos</Text>
                    </View>
                )}

                {/* History */}
                {historyData.length > 0 && (
                    <>
                        <Text style={styles.historyTitle}>Histórico</Text>
                        {historyData.slice().reverse().slice(0, 10).map((item, i) => (
                            <View key={i} style={styles.historyItem}>
                                <View>
                                    <Text style={styles.historyDate}>{format(new Date(item.date), 'dd MMM', { locale: ptBR })}</Text>
                                    <Text style={styles.historyMeta}>{item.sets || '-'} × {item.reps || '-'}</Text>
                                </View>
                                <Text style={styles.historyWeight}>{item.weight || '-'} kg</Text>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.m, paddingTop: SPACING.l },
    backBtn: { padding: 8, backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    title: { color: COLORS.white, fontSize: SIZES.h3, fontWeight: 'bold' },
    content: { padding: SPACING.l, paddingBottom: 120 },
    label: { color: COLORS.textSecondary, fontSize: SIZES.small, marginBottom: SPACING.xs },
    selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: SPACING.m, borderRadius: RADIUS.m, marginBottom: SPACING.m, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    selectorText: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '600' },
    dropdown: { backgroundColor: 'rgba(30, 41, 59, 0.95)', borderRadius: RADIUS.m, marginBottom: SPACING.l, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.m, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    dropdownItemActive: { backgroundColor: 'rgba(163, 230, 53, 0.1)' },
    dropdownText: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '500' },
    dropdownTextActive: { color: COLORS.lime, fontWeight: '700' },
    dropdownMuscle: { color: COLORS.textSecondary, fontSize: SIZES.tiny, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: SPACING.m, marginBottom: SPACING.l },
    statCard: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: SPACING.m, borderRadius: RADIUS.m, alignItems: 'center', gap: SPACING.xs, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    statLabel: { color: COLORS.textSecondary, fontSize: SIZES.tiny, fontWeight: '600' },
    statValue: { color: COLORS.white, fontSize: SIZES.h2, fontWeight: 'bold' },
    statUnit: { fontSize: SIZES.body, fontWeight: 'normal', color: COLORS.textSecondary },
    rmCard: { backgroundColor: 'rgba(139, 92, 246, 0.15)', padding: SPACING.l, borderRadius: RADIUS.m, marginBottom: SPACING.l, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)' },
    rmHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s, marginBottom: SPACING.m },
    rmLabel: { color: COLORS.textSecondary, fontSize: SIZES.small, fontWeight: '600' },
    rmValue: { color: COLORS.purple, fontSize: 38, fontWeight: 'bold', textAlign: 'center' },
    rmUnit: { fontSize: SIZES.h3, fontWeight: 'normal' },
    toggleRow: { flexDirection: 'row', gap: SPACING.m, marginBottom: SPACING.m },
    toggleBtn: { flex: 1, padding: SPACING.m, borderRadius: RADIUS.m, backgroundColor: 'rgba(30, 41, 59, 0.5)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    toggleActive: { backgroundColor: COLORS.lime, borderColor: COLORS.lime },
    toggleText: { color: COLORS.textSecondary, fontSize: SIZES.small, fontWeight: '600' },
    toggleTextActive: { color: COLORS.background },
    chartCard: { backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: RADIUS.m, padding: SPACING.m, alignItems: 'center', marginBottom: SPACING.l, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    noData: { alignItems: 'center', paddingVertical: SPACING.xl * 2, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: RADIUS.m, marginBottom: SPACING.l },
    noDataText: { color: COLORS.textSecondary, marginTop: SPACING.m },
    historyTitle: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '700', marginBottom: SPACING.m },
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: SPACING.m, borderRadius: RADIUS.m, marginBottom: SPACING.s },
    historyDate: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '600' },
    historyMeta: { color: COLORS.textSecondary, fontSize: SIZES.small, marginTop: 2 },
    historyWeight: { color: COLORS.lime, fontSize: SIZES.h4, fontWeight: 'bold' },
});
