import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { Plus, Calendar, ChevronRight } from 'lucide-react-native';

export const WorkoutListScreen = ({ navigation }: any) => {
    // Mock data
    const workouts = [
        { id: 1, date: '2023-10-25', muscleGroup: 'Chest & Triceps', exercises: 5 },
        { id: 2, date: '2023-10-23', muscleGroup: 'Back & Biceps', exercises: 6 },
        { id: 3, date: '2023-10-21', muscleGroup: 'Legs', exercises: 4 },
    ];

    const renderItem = ({ item }: any) => (
        <GlassView style={styles.card} intensity={15}>
            <View style={styles.row}>
                <View style={styles.dateBox}>
                    <Text style={styles.day}>{item.date.split('-')[2]}</Text>
                    <Text style={styles.month}>OCT</Text>
                </View>
                <View style={styles.contentBox}>
                    <Text style={styles.title}>{item.muscleGroup}</Text>
                    <Text style={styles.subtitle}>{item.exercises} Exercises</Text>
                </View>
                <ChevronRight color={COLORS.textSecondary} size={20} />
            </View>
        </GlassView>
    );

    return (
        <Screen>
            <View style={styles.header}>
                <Text style={styles.screenTitle}>My Workouts</Text>
            </View>

            <FlatList
                data={workouts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ color: COLORS.textSecondary }}>No workouts logged yet.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddWorkout')}
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
    screenTitle: {
        fontSize: SIZES.h1,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    list: {
        padding: SPACING.l,
        gap: SPACING.m,
    },
    card: {
        padding: SPACING.m,
        borderRadius: RADIUS.m,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    dateBox: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: RADIUS.s,
        padding: SPACING.s,
        width: 50,
        height: 50,
    },
    day: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    month: {
        fontSize: 10,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    contentBox: {
        flex: 1,
    },
    title: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    subtitle: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: 56,
        height: 56,
        borderRadius: RADIUS.circle,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    empty: {
        padding: SPACING.xl,
        alignItems: 'center',
    }
});
