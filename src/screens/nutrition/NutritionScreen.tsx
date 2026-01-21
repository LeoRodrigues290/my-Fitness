import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { Plus, Utensils } from 'lucide-react-native';

export const NutritionScreen = ({ navigation }: any) => {
    // Mock Data
    const dailyStats = {
        calories: { current: 1850, target: 2500 },
        protein: { current: 140, target: 180 },
        carbs: { current: 200, target: 300 },
        fats: { current: 55, target: 80 },
    };

    const meals = [
        { id: 1, type: 'Breakfast', name: 'Oatmeal & Whey', calories: 450, protein: 30 },
        { id: 2, type: 'Lunch', name: 'Chicken, Rice & Broccoli', calories: 650, protein: 45 },
        { id: 3, type: 'Snack', name: 'Greek Yogurt', calories: 150, protein: 15 },
    ];

    const renderMeal = ({ item }: any) => (
        <GlassView style={styles.mealCard} intensity={10}>
            <View style={styles.mealHeader}>
                <Text style={styles.mealType}>{item.type}</Text>
                <Text style={styles.mealCalories}>{item.calories} kcal</Text>
            </View>
            <Text style={styles.mealName}>{item.name}</Text>
            <Text style={styles.mealMacros}>{item.protein}g Protein</Text>
        </GlassView>
    );

    const ProgressBar = ({ label, current, target, color }: any) => {
        const progress = Math.min(current / target, 1) * 100;
        return (
            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>{label}</Text>
                    <Text style={styles.progressValue}>{current} / {target}</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
                </View>
            </View>
        )
    };

    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.screenTitle}>Nutrition</Text>
                    <Text style={styles.date}>Today</Text>
                </View>

                {/* Summary Card */}
                <GlassView style={styles.summaryCard} intensity={20} gradientBorder>
                    <View style={styles.caloriesContainer}>
                        <Text style={styles.caloriesLabel}>Nutrient Intake</Text>
                        <View style={styles.mainCals}>
                            <Text style={styles.bigNumber}>{dailyStats.calories.current}</Text>
                            <Text style={styles.targetLabel}> / {dailyStats.calories.target} kcal</Text>
                        </View>
                    </View>

                    <View style={styles.macrosContainer}>
                        <ProgressBar label="Protein" current={dailyStats.protein.current} target={dailyStats.protein.target} color={COLORS.success} />
                        <ProgressBar label="Carbs" current={dailyStats.carbs.current} target={dailyStats.carbs.target} color={COLORS.accent} />
                        <ProgressBar label="Fats" current={dailyStats.fats.current} target={dailyStats.fats.target} color={COLORS.secondary} />
                    </View>
                </GlassView>

                <Text style={styles.sectionTitle}>Meals</Text>

                <View style={styles.mealsList}>
                    {meals.map(item => (
                        <View key={item.id} style={{ marginBottom: SPACING.m }}>
                            {renderMeal({ item })}
                        </View>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddMeal')}
            >
                <Plus color={COLORS.white} size={24} />
            </TouchableOpacity>
        </Screen>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        padding: SPACING.l,
        paddingBottom: SPACING.s,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    screenTitle: {
        fontSize: SIZES.h1,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    date: {
        color: COLORS.textSecondary,
        fontSize: SIZES.h3,
    },
    summaryCard: {
        margin: SPACING.l,
        marginTop: SPACING.s,
        padding: SPACING.l,
        borderRadius: RADIUS.l,
    },
    caloriesContainer: {
        marginBottom: SPACING.l,
        alignItems: 'center',
    },
    caloriesLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    mainCals: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    bigNumber: {
        fontSize: 48,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    targetLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
    },
    macrosContainer: {
        gap: SPACING.m,
    },
    progressContainer: {},
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressLabel: {
        color: COLORS.white,
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    progressValue: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: RADIUS.circle,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: RADIUS.circle,
    },
    sectionTitle: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: 'bold',
        marginLeft: SPACING.l,
        marginBottom: SPACING.m,
    },
    mealsList: {
        paddingHorizontal: SPACING.l,
    },
    mealCard: {
        padding: SPACING.m,
        borderRadius: RADIUS.m,
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    mealType: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: SIZES.small,
    },
    mealCalories: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    mealName: {
        color: COLORS.white,
        fontSize: SIZES.body,
        marginBottom: SPACING.xs,
    },
    mealMacros: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: 56,
        height: 56,
        borderRadius: RADIUS.circle,
        backgroundColor: COLORS.success,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
