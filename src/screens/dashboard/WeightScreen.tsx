import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { LineChart } from 'react-native-chart-kit';
import { Plus } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { UserRepository } from '../../services/UserRepository';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export const WeightScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [data, setData] = useState<any>({ labels: [], datasets: [] });
    const [history, setHistory] = useState<any[]>([]);

    const loadData = async () => {
        if (!currentUser) return;
        try {
            const logs = await UserRepository.getWeightLogs(currentUser.id);
            // Sort by date ascending for chart
            const sortedLogs = [...(logs || [] as Array<{ date: string, weight: number }>)].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const labels = sortedLogs.map(log => format(new Date(log.date), 'MM/dd'));
            const dataValues = sortedLogs.map(log => log.weight);

            setData({
                labels: labels,
                datasets: [{ data: dataValues }]
            });
            setHistory(sortedLogs);
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
                {data.labels && data.labels.length > 0 ? (
                    <View style={{ paddingTop: 20, alignItems: 'center' }}>
                        <LineChart
                            // @ts-ignore
                            data={data}
                            width={width - 20}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix="kg"
                            yAxisInterval={1}
                            chartConfig={{
                                backgroundColor: 'transparent',
                                backgroundGradientFrom: '#fff',
                                backgroundGradientFromOpacity: 0,
                                backgroundGradientTo: '#fff',
                                backgroundGradientToOpacity: 0,
                                decimalPlaces: 1,
                                color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: COLORS.secondary
                                }
                            }}
                            bezier
                            style={{
                                borderRadius: 16,
                                paddingRight: 40 // fix right clip
                            }}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyChart}>
                        <Text style={styles.emptyText}>Sem dados de peso ainda</Text>
                    </View>
                )}
            </View>

            <View style={styles.listContainer}>
                <Text style={styles.historyTitle}>Histórico</Text>
                <FlatList
                    data={[...history].reverse()}
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
