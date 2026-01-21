import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryScatter } from 'victory-native';
import { Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const WeightScreen = ({ navigation }: any) => {
    // Mock Data
    const data = [
        { date: '10/01', weight: 78.0 },
        { date: '10/08', weight: 77.5 },
        { date: '10/15', weight: 76.8 },
        { date: '10/22', weight: 76.2 },
        { date: '10/29', weight: 75.5 },
    ];

    const renderItem = ({ item }: any) => (
        <GlassView style={styles.row} intensity={10}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.weight}>{item.weight} kg</Text>
        </GlassView>
    );

    return (
        <Screen>
            <View style={styles.header}>
                <Text style={styles.title}>Weight Progress</Text>
            </View>

            <View style={styles.chartContainer}>
                <VictoryChart
                    theme={VictoryTheme.material}
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
            </View>

            <View style={styles.listContainer}>
                <Text style={styles.historyTitle}>History</Text>
                <FlatList
                    data={[...data].reverse()}
                    keyExtractor={(item) => item.date}
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
