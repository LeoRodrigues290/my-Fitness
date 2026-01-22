import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { colors } from '../../constants/colors';

export const StatsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [filter, setFilter] = useState('weekly');
    const screenWidth = Dimensions.get("window").width;

    // Mock Data for Graphs
    const weightData = {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
        datasets: [{ data: [78, 77, 76.5, 75, 74.2, 73] }]
    };

    const caloriesData = {
        labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"],
        datasets: [{ data: [2100, 2300, 1950, 2200, 2400, 1800, 2000] }]
    };

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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Summary Cards */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>TREINOS REALIZADOS</Text>
                        <Text style={styles.summaryValue}>12</Text>
                        <Text style={styles.summarySubtext}>+2 essa semana</Text>
                    </View>
                    <View style={[styles.summaryCard, styles.summaryCardBlue]}>
                        <Text style={[styles.summaryLabel, { color: colors.blue400 }]}>EVOLUÇÃO PESO</Text>
                        <Text style={styles.summaryValue}>-5kg</Text>
                        <Text style={styles.summarySubtext}>Últimos 6 meses</Text>
                    </View>
                </View>

                {/* Weight Graph */}
                <View style={styles.graphSection}>
                    <Text style={styles.graphTitle}>Evolução de Peso</Text>
                    <LineChart
                        data={weightData}
                        width={screenWidth - 48}
                        height={220}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                        }}
                        bezier
                        style={styles.chart}
                    />
                </View>

                {/* Calories Graph */}
                <View style={styles.graphSection}>
                    <Text style={styles.graphTitle}>Consumo Calórico Diário</Text>
                    <BarChart
                        data={caloriesData}
                        width={screenWidth - 48}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="k"
                        chartConfig={chartConfig}
                        style={styles.chart}
                        verticalLabelRotation={0}
                    />
                </View>

                {/* Macro Distribution */}
                <View style={styles.macroCard}>
                    <Text style={styles.macroTitle}>Distribuição de Macros (Média)</Text>
                    <View style={styles.macroRow}>
                        <View style={styles.macroItem}>
                            <View style={[styles.macroDot, { backgroundColor: colors.red500 }]} />
                            <Text style={styles.macroLabel}>Proteína</Text>
                            <Text style={styles.macroValue}>30%</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <View style={[styles.macroDot, { backgroundColor: colors.lime400 }]} />
                            <Text style={styles.macroLabel}>Carbs</Text>
                            <Text style={styles.macroValue}>45%</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <View style={[styles.macroDot, { backgroundColor: colors.orange400 }]} />
                            <Text style={styles.macroLabel}>Gordura</Text>
                            <Text style={styles.macroValue}>25%</Text>
                        </View>
                    </View>
                    <View style={styles.macroBar}>
                        <View style={[styles.macroBarSegment, { flex: 0.3, backgroundColor: colors.red500 }]} />
                        <View style={[styles.macroBarSegment, { flex: 0.45, backgroundColor: colors.lime400 }]} />
                        <View style={[styles.macroBarSegment, { flex: 0.25, backgroundColor: colors.orange400 }]} />
                    </View>
                </View>
            </ScrollView>
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
