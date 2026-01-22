import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryScatter } from 'victory-native';
import { Plus } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { UserRepository } from '../../services/UserRepository';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export const WeightScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [data, setData] = useState<any[]>([]);

    const loadData = async () => {
        if (!currentUser) return;
        try {
            const logs = await UserRepository.getWeightLogs(currentUser.id);
            // Sort by date ascending for chart
            const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const chartData = sortedLogs.map(log => ({
                date: format(new Date(log.date), 'MM/dd'),
                weight: log.weight,
                fullDate: log.date
            }));

            setData(chartData);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [currentUser])
    );

    const renderItem = ({ item }: any) => (
        <GlassView style={styles.row} intensity={10}>
            <Text style={styles.date}>{item.fullDate}</Text>
            <Text style={styles.weight}>{item.weight} kg</Text>
        </GlassView>
    );

    return (
        <Screen>
            <View style={styles.header}>
                <Text style={styles.title}>Progresso de Peso</Text>
            </View>

            <View style={styles.chartContainer}>
                {data.length > 0 ? (
                    <VictoryChart
                        domainPadding={{ x: 20 }}
                        width={width}
                        height={250}
                    >
                        <VictoryAxis
                            style={{
                                axis: { stroke: "transparent" },
                                ticks: { stroke: "transparent" },
                                tickLabels: { fill: COLORS.textSecondary, fontSize: 10 }
                            }}
                        />
                        <VictoryLine
                            data={data}
                            x="date"
                            y="weight"
                            interpolation="catmullRom"
                            style={{
                                data: { stroke: COLORS.secondary, strokeWidth: 3 },
                            }}
                            animate={{
                                duration: 2000,
                                onLoad: { duration: 1000 }
                            }}
                        />
                        <VictoryScatter
                            data={data}
                            x="date"
                            y="weight"
                            size={5}
                            style={{ data: { fill: COLORS.white } }}
                        />
                    </VictoryChart>
                ) : (
                    <View style={styles.emptyChart}>
                        <Text style={styles.emptyText}>Sem dados de peso ainda</Text>
                    </View>
                )}
            </View>

            <View style={styles.listContainer}>
                <Text style={styles.historyTitle}>Histórico</Text>
                <FlatList
                    data={[...data].reverse()}
                    keyExtractor={(item) => item.fullDate}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            </View>

            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddWeight')}
            >
                <Plus color={COLORS.white} size={24} />
            </TouchableOpacity>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: SPACING.l,
        paddingBottom: SPACING.s,
    },
    title: {
        fontSize: SIZES.h1,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    chartContainer: {
        marginBottom: SPACING.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyChart: {
        height: 250,
        width: width - 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: RADIUS.m,
    },
    emptyText: {
        color: COLORS.textSecondary,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: SPACING.l,
    },
    historyTitle: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    list: {
        gap: SPACING.s,
        paddingBottom: 100,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
    },
    date: {
        color: COLORS.textSecondary,
    },
    weight: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: 56,
        height: 56,
        borderRadius: RADIUS.circle,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
